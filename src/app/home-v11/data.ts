import 'server-only';
import { cache } from 'react';
import { cmsTypeTag } from '@/lib/cms-data';
import { withRetry } from '@/lib/cms-retry';
import { cachedReadClient } from '@/lib/sanity.client';

/**
 * Homepage v11 data: the published case-study instruments and headline results, read live from Sanity so every
 * chart on the page is the same series the case study shows and every number is the figure the case study prints.
 * Series are shaped here (rolling means, weekly sums) and nowhere else; components only draw.
 *
 * Numbers are never typed into a content file. A tile names its proof (`PROOF` below: a case study and one of its
 * result slots) and prints `proof[key].value`; the words around it say what is measured, and the result's own
 * title says the window. A case-study refresh therefore updates every tile that quotes it.
 */

export interface Series {
  dates: string[];
  values: number[];
  /** ISO day LoudFace started; the pin sits here. */
  start: string;
  bars?: boolean;
  /** Index of the point the end annotation sits on (defaults to the last point). */
  peak?: number;
}

interface Instruments {
  engagementStart?: string;
  topicClimb?: { points: { week: string; value: number }[] };
  indexedTrend?: { points: { date?: string; impressions: number; clicks: number }[] };
  leadGrowth?: { points: { week: string; value: number }[] };
  clickGrowth?: { points: { week: string; value: number }[] };
}

const SLUGS = {
  lf: 'loudface-aeo-case-study',
  genie: 'genie-teacher-organic-growth',
  delshad: 'delshad-legal-content-engine',
  tm: 'trademomentum-niche-aeo-organic-growth',
  stealth: 'stealth-fintech-ai-visibility',
  health: 'anonymous-health-tech-organic-growth',
  toku: 'toku-ai-cited-pipeline',
  dimer: 'dimer-health',
  ceipal: 'ceipal-wp-to-wf-migration',
  brandfirm: 'brandfirm',
  codeop: 'codeop',
  outbound: 'outbound-specialist',
} as const;

type Key = keyof typeof SLUGS;

/** Each published figure a tile can print: the case study and the result slot (1–3) that holds it. */
const PROOF = {
  lf: ['lf', 1],
  genie: ['genie', 1],
  genieClicks: ['genie', 2],
  health: ['health', 1],
  delshad: ['delshad', 3],
  delshadClicks: ['delshad', 2],
  tm: ['tm', 1],
  stealth: ['stealth', 1],
  genieLeads: ['genie', 3],
  toku: ['toku', 1],
  dimer: ['dimer', 1],
  ceipal: ['ceipal', 2],
  brandfirm: ['brandfirm', 1],
  codeop: ['codeop', 1],
  outbound: ['outbound', 1],
} as const satisfies Record<string, readonly [Key, 1 | 2 | 3]>;

export type ProofKey = keyof typeof PROOF;
/** A case study's published figure: the number as the study prints it, and the result's title (what and when). */
export interface Proof {
  value: string;
  title: string;
}

const QUERY = `*[_type == "caseStudy" && slug.current in $slugs]{
  "slug": slug.current,
  result1Number, result1Title, result2Number, result2Title, result3Number, result3Title,
  "instruments": instruments{
    engagementStart,
    topicClimb{ points[]{ week, value } },
    indexedTrend{ points[]{ date, impressions, clicks } },
    leadGrowth{ points[]{ week, value } },
    clickGrowth{ points[]{ week, value } }
  }
}`;

function rolling(values: number[], n: number): number[] {
  return values.map((_, i) => {
    const w = values.slice(Math.max(0, i - n + 1), i + 1);
    return w.reduce((a, b) => a + b, 0) / w.length;
  });
}

function isoWeekKey(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  const day = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - day + 3);
  const first = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(((d.getTime() - first.getTime()) / 86400000 - 3 + ((first.getUTCDay() + 6) % 7)) / 7);
  return `${d.getUTCFullYear()}-${String(week).padStart(2, '0')}`;
}

/** Weekly sums of a daily series (ISO weeks, Monday start); a week with fewer than seven days is dropped. */
function weekly(points: { date?: string; clicks: number }[], from: string, to: string) {
  const byWeek = new Map<string, { date: string; total: number; days: number }>();
  for (const p of points) {
    if (!p.date || p.date < from || p.date > to) continue;
    const k = isoWeekKey(p.date);
    const row = byWeek.get(k) ?? { date: p.date, total: 0, days: 0 };
    row.total += p.clicks;
    row.days += 1;
    byWeek.set(k, row);
  }
  const rows = [...byWeek.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).map(([, r]) => r).filter((r) => r.days === 7);
  return { dates: rows.map((r) => r.date), values: rows.map((r) => r.total) };
}

export interface HomeV11Data {
  hero: Record<'lf' | 'genie' | 'delshad' | 'tm' | 'stealth' | 'genieLeads', Series> & { health?: Series };
  results: Record<'delshad' | 'genie' | 'lf', Series>;
  bentoGenie: Series;
  /** Every figure a tile prints, from the case studies' result fields. A key is absent when its study's field is empty. */
  proof: Partial<Record<ProofKey, Proof>>;
}

type Row = { slug: string; instruments?: Instruments } & Partial<Record<`result${1 | 2 | 3}${'Number' | 'Title'}`, string | null>>;

// Cached like every cms-data read: the case study tag the revalidate webhook purges, and cms-data's one-day timer as
// the fallback. Uncached, this read reached api.sanity.io on every page view of every page that draws these charts
// (found by the launch review, 2026-09-26; the project was locked out for exceeding its Sanity quota in July).
// A failed read throws (after one retry with its own request tag, as cms-data's reads do): every number on these tiles
// lives here now, so a swallowed outage would serve pages with blank figures (CLAUDE.md, "never silently swallow").
export const getHomeV11Data = cache(async (): Promise<HomeV11Data | null> => {
  const rows = await withRetry((retry) =>
    cachedReadClient.fetch<Row[]>(QUERY, { slugs: Object.values(SLUGS) }, { next: { revalidate: 86400, tags: [cmsTypeTag('caseStudy')] }, ...retry }),
  );
  const row = (k: Key) => rows.find((r) => r.slug === SLUGS[k]);
  const ins = (k: Key) => row(k)?.instruments ?? {};
  const lf = ins('lf'), genie = ins('genie'), delshad = ins('delshad'), tm = ins('tm'), stealth = ins('stealth'), health = ins('health');
  if (!lf.topicClimb || !genie.indexedTrend || !tm.indexedTrend || !delshad.clickGrowth) return null;

  // An emptied result field blanks only the tiles that quote it, and says which one in the logs.
  const proof: Partial<Record<ProofKey, Proof>> = {};
  for (const [k, [study, slot]] of Object.entries(PROOF) as [ProofKey, readonly [Key, 1 | 2 | 3]][]) {
    const r = row(study);
    const value = r?.[`result${slot}Number`];
    const title = r?.[`result${slot}Title`];
    if (!value || !title) {
      console.error(`[home-v11] ${SLUGS[study]} has no result${slot}Number/Title for the "${k}" tile`);
      continue;
    }
    proof[k] = { value, title };
  }

  const lfDates = lf.topicClimb.points.map((p) => p.week);
  const lfVals = lf.topicClimb.points.map((p) => p.value * 100);
  const gTrend = genie.indexedTrend.points.filter((p) => p.date);
  const tTrend = tm.indexedTrend.points.filter((p) => p.date);
  // Weekly clicks over the whole published series, indexed to the week the engagement began (its Monday-start
  // ISO week = 100): the same baseline as the study's clicks-per-week headline, so the chart's last point and the
  // printed number agree.
  const tmRaw = weekly(tTrend, tTrend[0]?.date ?? '', tTrend.at(-1)?.date ?? '');
  const tmBase = tmRaw.values[tmRaw.dates.findIndex((d) => isoWeekKey(d) === isoWeekKey(tm.engagementStart ?? '2025-09-07'))];
  if (!tmBase) return null;
  const tmWeekly = { dates: tmRaw.dates, values: tmRaw.values.map((v) => (v / tmBase) * 100) };
  // TradeMomentum's published figure is its highest week, so the end annotation sits on that week, not the latest.
  const tmPeak = tmWeekly.values.indexOf(Math.max(...tmWeekly.values));
  const dClicks = delshad.clickGrowth.points;
  const stealthPts = stealth.topicClimb?.points ?? [];
  const hTrend = health.indexedTrend?.points.filter((p) => p.date) ?? [];

  const genieImpressions: Series = {
    dates: gTrend.map((p) => p.date as string),
    values: rolling(gTrend.map((p) => p.impressions), 5),
    start: genie.engagementStart ?? '2026-07-05',
  };

  return {
    hero: {
      lf: { dates: lfDates, values: rolling(lfVals, 7), start: lfDates[0] },
      genie: genieImpressions,
      delshad: {
        dates: (delshad.leadGrowth?.points ?? []).map((p) => p.week),
        values: (delshad.leadGrowth?.points ?? []).map((p) => p.value),
        start: delshad.engagementStart ?? '2026-06-04',
        bars: true,
      },
      tm: { dates: tmWeekly.dates, values: tmWeekly.values, start: tm.engagementStart ?? '2025-09-07', peak: tmPeak },
      stealth: {
        dates: stealthPts.map((p) => p.week),
        values: rolling(stealthPts.map((p) => p.value * 100), 5),
        start: '2026-06-15',
      },
      // the anonymous health-tech study (2026-09-27): Google impressions a day, indexed to its December = 100
      health: hTrend.length ? {
        dates: hTrend.map((p) => p.date as string),
        values: rolling(hTrend.map((p) => p.impressions), 7),
        start: health.engagementStart ?? '2026-01-06',
      } : undefined,
      genieLeads: {
        dates: (genie.leadGrowth?.points ?? []).map((p) => p.week),
        values: (genie.leadGrowth?.points ?? []).map((p) => p.value),
        start: genie.engagementStart ?? '2026-07-05',
        bars: true,
      },
    },
    results: {
      delshad: { dates: dClicks.map((p) => p.week), values: dClicks.map((p) => p.value), start: delshad.engagementStart ?? '2026-06-04' },
      genie: { dates: gTrend.map((p) => p.date as string), values: rolling(gTrend.map((p) => p.impressions), 5), start: genie.engagementStart ?? '2026-07-05' },
      lf: { dates: lfDates, values: rolling(lfVals, 5), start: lfDates[0] },
    },
    bentoGenie: genieImpressions,
    proof,
  };
});
