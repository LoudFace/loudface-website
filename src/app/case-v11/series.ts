import type { CaseStudyInstruments } from '@/lib/types';
import type { Series } from '../home-v11/data';
import type { BeforeAfterPair } from '../home-v11/BeforeAfterChart';

/**
 * A case study's published instruments as homepage-style chart series. Shaping lives here; components only draw.
 * Every number printed beside a chart is read from the study's own fields or captions, never computed from the series.
 */

function rolling(values: number[], n: number): number[] {
  return values.map((_, i) => {
    const w = values.slice(Math.max(0, i - n + 1), i + 1);
    return w.reduce((a, b) => a + b, 0) / w.length;
  });
}

const startOf = (start: string | undefined, dates: string[]) => (start && start >= dates[0] ? start : dates[0]);

/** The published range a caption opens with ("2.26% to 13.6%, 25 May …"), or null. */
function captionRange(caption: string) {
  const m = caption.match(/([\d.]+%)[^%]*?\bto\s+([\d.]+%)/i);
  return m ? { from: m[1], to: m[2] } : null;
}

export type ChartKind = 'ai' | 'google' | 'leads';

export interface CaseSeries {
  ai?: { series: Series; title: string; caption: string; range: { from: string; to: string } | null; source?: string };
  google?: { series: Series; title: string; caption: string; source?: string };
  leads?: { series: Series; title: string; caption: string; multiple: string; label: string; baseline: string; source?: string };
  engines?: NonNullable<CaseStudyInstruments['engineBeforeAfter']>;
  rank?: NonNullable<CaseStudyInstruments['rankOverTime']>;
  published?: NonNullable<CaseStudyInstruments['publishedResult']>;
}

export function caseSeries(ins: CaseStudyInstruments | undefined): CaseSeries {
  if (!ins) return {};
  const out: CaseSeries = {};
  const start = ins.engagementStart;
  if (ins.topicClimb?.points.length) {
    const p = ins.topicClimb.points;
    const dates = p.map((x) => x.week);
    const weekly = p.length <= 20;
    out.ai = {
      series: { dates, values: weekly ? p.map((x) => x.value * 100) : rolling(p.map((x) => x.value * 100), 5), start: startOf(start, dates), bars: weekly },
      title: ins.topicClimb.title,
      caption: ins.topicClimb.caption,
      range: captionRange(ins.topicClimb.caption),
      source: ins.aiSource,
    };
  }
  const daily = ins.indexedTrend?.points.filter((x) => x.date) ?? [];
  if (ins.indexedTrend && daily.length > 8) {
    const dates = daily.map((x) => x.date as string);
    out.google = {
      series: { dates, values: rolling(daily.map((x) => x.impressions), 7), start: startOf(start, dates) },
      title: ins.indexedTrend.title,
      caption: ins.indexedTrend.caption,
      source: ins.gscSource,
    };
  }
  const lg = ins.leadGrowth;
  if (lg?.points.length) {
    const dates = lg.points.map((x) => x.week);
    out.leads = {
      series: { dates, values: lg.points.map((x) => x.value), start: startOf(start, dates), bars: true },
      title: lg.title, caption: lg.caption, multiple: lg.multiple, label: lg.multipleLabel, baseline: lg.baselineLabel, source: lg.source,
    };
  }
  if (ins.engineBeforeAfter?.rows.length) out.engines = ins.engineBeforeAfter;
  if (ins.rankOverTime) out.rank = ins.rankOverTime;
  if (ins.publishedResult?.rows.length) out.published = ins.publishedResult;
  return out;
}

/**
 * A bare chart has to read the way its claim does, because nothing printed beside it explains the shape: the last
 * reading must sit at or near the series high. A series that peaked early and settled (a small prompt set that
 * later grew) stays in the article, where its caption can explain it.
 */
export function trendHolds(series: Series): boolean {
  const v = series.values;
  return v.length > 1 && v[v.length - 1] >= 0.8 * Math.max(...v);
}

/** Only the charts that can stand alone without a caption. */
export function standaloneCharts(s: CaseSeries): CaseSeries {
  return {
    ...s,
    ai: s.ai && trendHolds(s.ai.series) ? s.ai : undefined,
    google: s.google && trendHolds(s.google.series) ? s.google : undefined,
    leads: s.leads && trendHolds(s.leads.series) ? s.leads : undefined,
  };
}

/** Which chart carries the study's lead result, judged from that result's own title. */
export function leadKind(s: CaseSeries, resultTitle: string): ChartKind | null {
  const t = resultTitle.toLowerCase();
  if (s.google && /google|impression|click|search console|organic/.test(t)) return 'google';
  if (s.leads && /lead|enquir|call|booking|demo|signup/.test(t)) return 'leads';
  if (s.ai && /\bai\b|answer|visibility|share of voice|cited|engine/.test(t)) return 'ai';
  return s.google ? 'google' : s.ai ? 'ai' : s.leads ? 'leads' : null;
}

export interface PublishedPairs {
  pairs: BeforeAfterPair[];
  beforeLabel?: string;
  afterLabel?: string;
  caption: string;
}

const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

/**
 * The study's published "a% → b%" results, drawn as before/after columns when the series behind them cannot stand
 * alone. The first pair's window names the two readings ("AI visibility, week of 25 May → week of 7 Sep").
 */
export function publishedPairs(s: CaseSeries): PublishedPairs | null {
  const rows = s.published?.rows ?? [];
  const re = /^\s*([\d.]+)%\s*→\s*([\d.]+)%\s*$/;
  const pairs: BeforeAfterPair[] = rows.flatMap((r) => {
    const m = r.value.match(re);
    return m ? [{ label: cap(r.unit.split(',')[0].trim()), before: Number(m[1]), after: Number(m[2]), beforeText: `${m[1]}%`, afterText: `${m[2]}%` }] : [];
  });
  if (!pairs.length) return null;
  const first = rows.find((r) => re.test(r.value));
  const win = first?.unit.split(',').slice(1).join(',').split('→').map((x) => x.trim()).filter(Boolean);
  return {
    pairs,
    beforeLabel: win?.[0] ? cap(win[0]) : undefined,
    afterLabel: win?.[1] ? cap(win[1]) : undefined,
    caption: s.published?.caption ?? '',
  };
}

/** "Google clicks per week, May 2026 average → …" → the label, and the window as its note. Words are kept, not rewritten. */
export function splitTitle(title: string): { label: string; note?: string } {
  const paren = title.indexOf(' (');
  const comma = title.indexOf(', ');
  if (comma > 0 && (paren < 0 || comma < paren)) return { label: title.slice(0, comma), note: title.slice(comma + 2) };
  if (paren > 0 && title.endsWith(')')) return { label: title.slice(0, paren), note: title.slice(paren + 2, -1) };
  return { label: title };
}

/** The first part of a source line ("Peec AI · weekly to 13 Sep 2026" → "Peec AI"). */
export const sourceName = (src?: string) => src?.split('·')[0].trim();
