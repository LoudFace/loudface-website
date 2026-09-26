import 'server-only';
import { cache } from 'react';
import { cmsTypeTag } from '@/lib/cms-data';
import { cachedReadClient } from '@/lib/sanity.client';

/**
 * Homepage v11 data: the published case-study instruments, read live from Sanity so every chart on the
 * page is the same series the case study shows. Series are shaped here (rolling means, weekly sums) and
 * nowhere else; components only draw.
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
}

const SLUGS = {
  lf: 'loudface-aeo-case-study',
  genie: 'genie-teacher-organic-growth',
  delshad: 'delshad-legal-content-engine',
  tm: 'trademomentum-niche-aeo-organic-growth',
  stealth: 'stealth-fintech-ai-visibility',
} as const;

type Key = keyof typeof SLUGS;

const QUERY = `*[_type == "caseStudy" && slug.current in $slugs]{
  "slug": slug.current,
  "instruments": instruments{
    engagementStart,
    topicClimb{ points[]{ week, value } },
    indexedTrend{ points[]{ date, impressions, clicks } },
    leadGrowth{ points[]{ week, value } }
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

/** Weekly sums of a daily series; the partial first and last weeks are dropped. */
function weekly(points: { date?: string; clicks: number }[], from: string, to: string) {
  const byWeek = new Map<string, { date: string; total: number }>();
  for (const p of points) {
    if (!p.date || p.date < from || p.date > to) continue;
    const k = isoWeekKey(p.date);
    const row = byWeek.get(k) ?? { date: p.date, total: 0 };
    row.total += p.clicks;
    byWeek.set(k, row);
  }
  const rows = [...byWeek.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).slice(1, -1).map(([, r]) => r);
  return { dates: rows.map((r) => r.date), values: rows.map((r) => r.total) };
}

export interface HomeV11Data {
  hero: Record<'lf' | 'genie' | 'delshad' | 'tm' | 'stealth' | 'genieLeads', Series>;
  results: Record<'delshad' | 'genie' | 'tm' | 'lf', Series>;
  bentoGenie: Series;
}

// Cached like every cms-data read: the case study tag the revalidate webhook purges, and cms-data's one-day timer as
// the fallback. Uncached, this read reached api.sanity.io on every page view of every page that draws these charts
// (found by the launch review, 2026-09-26; the project was locked out for exceeding its Sanity quota in July).
export const getHomeV11Data = cache(async (): Promise<HomeV11Data | null> => {
  let rows: { slug: string; instruments?: Instruments }[] = [];
  try {
    rows = await cachedReadClient.fetch(QUERY, { slugs: Object.values(SLUGS) }, { next: { revalidate: 86400, tags: [cmsTypeTag('caseStudy')] } });
  } catch (error) {
    console.error('[home-v11] instruments read failed:', error);
    return null;
  }
  const ins = (k: Key) => rows.find((r) => r.slug === SLUGS[k])?.instruments ?? {};
  const lf = ins('lf'), genie = ins('genie'), delshad = ins('delshad'), tm = ins('tm'), stealth = ins('stealth');
  if (!lf.topicClimb || !genie.indexedTrend || !delshad.indexedTrend || !tm.indexedTrend) return null;

  const lfDates = lf.topicClimb.points.map((p) => p.week);
  const lfVals = lf.topicClimb.points.map((p) => p.value * 100);
  const gTrend = genie.indexedTrend.points.filter((p) => p.date);
  const dTrend = delshad.indexedTrend.points.filter((p) => p.date);
  const tTrend = tm.indexedTrend.points.filter((p) => p.date);
  const tmWeekly = weekly(tTrend, '2025-08-01', '2026-08-31');
  const tmRolled = rolling(tTrend.map((p) => p.impressions), 3);
  const tmDates = tTrend.map((p) => p.date as string);
  let tmAug = 0;
  tmDates.forEach((d, i) => {
    if (d >= '2026-08-01' && d <= '2026-08-31' && tmRolled[i] > (tmRolled[tmAug] ?? -1)) tmAug = i;
  });
  const stealthPts = stealth.topicClimb?.points ?? [];

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
      tm: { dates: tmWeekly.dates, values: tmWeekly.values, start: tm.engagementStart ?? '2025-09-07' },
      stealth: {
        dates: stealthPts.map((p) => p.week),
        values: rolling(stealthPts.map((p) => p.value * 100), 5),
        start: '2026-06-15',
      },
      genieLeads: {
        dates: (genie.leadGrowth?.points ?? []).map((p) => p.week),
        values: (genie.leadGrowth?.points ?? []).map((p) => p.value),
        start: genie.engagementStart ?? '2026-07-05',
        bars: true,
      },
    },
    results: {
      delshad: { dates: dTrend.map((p) => p.date as string), values: rolling(dTrend.map((p) => p.impressions), 7), start: delshad.engagementStart ?? '2026-06-04' },
      genie: { dates: gTrend.map((p) => p.date as string), values: rolling(gTrend.map((p) => p.impressions), 5), start: genie.engagementStart ?? '2026-07-05' },
      tm: { dates: tmDates, values: tmRolled, start: tm.engagementStart ?? '2025-09-07', peak: tmAug },
      lf: { dates: lfDates, values: rolling(lfVals, 5), start: lfDates[0] },
    },
    bentoGenie: genieImpressions,
  };
});
