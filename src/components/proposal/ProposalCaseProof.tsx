import Link from 'next/link';
import { fetchCaseProof, type CaseProof } from '@/sanity/lib/caseProof';
import { ProposalCaseChart, type CasePlot } from './ProposalCaseCharts';
import { HugShape } from './HugShape';

/**
 * Real case studies inside a proposal, drawn with the same Bklit charts as
 * the public pages. Read live by slug, so a number here cannot drift.
 *
 * One plot per case, chosen in the order the case page itself leads with:
 * the AI share-of-answers climb, else the indexed Google trend, else the
 * study's first structured chart. Name and headline number on the left,
 * the plot on the right, hairlines between cases — no cards.
 */

const fmtWeek = (iso: string) => {
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

function monthAt(startMonthIso: string, index: number): string | null {
  const m = /^(\d{4})-(\d{2})$/.exec(startMonthIso);
  if (!m) return null;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1 + index, 1));
  return d.toISOString().slice(0, 10);
}

/** "Genie Teacher: 5x Organic Visibility" → "Genie Teacher". The chart carries the rest. */
const shortName = (name: string) => name.split(':')[0].trim();

/** First clause only — a headline, not the footnote the case page needs. */
const shortTitle = (title?: string) => (title ?? '').split(/[,(—]/)[0].trim();

/**
 * One number a reader can hold: average impressions a day over the last four
 * weeks against the four weeks before LoudFace started. The series is indexed,
 * which cancels out of a ratio.
 */
function liftSinceStart(points: { date: string; value: number }[], startDate?: string): number | null {
  if (!startDate || points.length < 40) return null;
  const idx = points.findIndex((p) => p.date >= startDate);
  const before = idx >= 28 ? points.slice(idx - 28, idx) : points.slice(0, 28);
  const after = points.slice(-28);
  const mean = (xs: { value: number }[]) => xs.reduce((a, x) => a + x.value, 0) / xs.length;
  const b = mean(before);
  return b > 0 ? mean(after) / b : null;
}

/**
 * A result as a badge, not a sentence: the number is a solid tag, the label
 * sits beside it, the whole thing is one pill. The lead stat gets the indigo;
 * the Google lift the quiet grey. Two lines of prose melted together; two
 * pills do not.
 */
function Stat({ number, line, lead = false }: { number: string; line?: string; lead?: boolean }) {
  // Tag, then words, in one inline run. HugShape draws a single outline that
  // follows the line boxes, so the tint molds around the content.
  return (
    <p className="relative isolate max-w-[30ch] py-1.5 pl-1 text-[13px] leading-[2.05]">
      <HugShape fill={lead ? 'var(--color-primary-50)' : 'var(--color-surface-100)'} className={lead ? 'font-medium text-primary-900' : 'text-surface-700'}>
        <span
          className={`proposal-num mr-1.5 inline-flex h-6 items-center rounded-md px-2 align-[-0.35em] text-[14px] font-semibold tracking-[-0.02em] ${
            lead ? 'bg-primary-600 text-white' : 'bg-white text-surface-950 ring-1 ring-surface-200'
          }`}
        >
          {number}
        </span>
        {line}
      </HugShape>
    </p>
  );
}

function pickPlot(item: CaseProof): CasePlot | null {
  const topic = item.instruments?.topicClimb;
  const trend = item.instruments?.indexedTrend;
  const trendIsDaily = Boolean(trend?.points?.[0]?.date);

  const areaFromTrend = (): CasePlot | null => {
    if (!trend?.points?.length) return null;
    // Impressions lead: on one shared scale the click line reads flat beside a
    // 17× impressions climb, and the climb is the story. Clicks ride along in
    // the tooltip.
    const points = trend.points
      .map((p, i) => ({ date: p.date ?? monthAt(trend.startMonthIso, i), value: p.impressions, second: p.clicks }))
      .filter((p): p is { date: string; value: number; second: number } => Boolean(p.date));
    if (points.length === 0) return null;
    const peak = points.reduce((best, p) => (p.value > best.value ? p : best), points[0]);
    return {
      kind: 'area',
      title: `Google impressions · ${trend.baselineLabel} = 1×`,
      secondLabel: 'Clicks',
      caption: trend.caption,
      unitLabel: `× ${trend.baselineLabel}`,
      startDate: item.instruments?.engagementStart,
      points,
    };
  };
  const barsFromTopic = (): CasePlot | null =>
    topic?.points?.length
      ? {
          kind: 'bars',
          title: topic.title,
          caption: topic.caption,
          unit: '%',
          points: topic.points.map((p) => ({ label: fmtWeek(p.week), value: Number((p.value * 100).toFixed(1)) })),
        }
      : null;

  // A daily Google series is the richest picture a case has; a weekly AI
  // climb is next; a monthly series only when nothing finer exists.
  const chosen = (trendIsDaily ? areaFromTrend() : null) ?? barsFromTopic() ?? areaFromTrend();
  if (chosen) return chosen;

  const chart = item.charts?.[0];
  if (chart?.data?.length) {
    return {
      kind: 'bars',
      title: chart.title,
      unit: '',
      points: chart.data.map((d) => ({ label: d.label, value: d.value, display: d.displayValue })),
    };
  }
  return null;
}

export async function ProposalCaseProof({
  heading,
  intro,
  slugs,
  index,
}: {
  heading?: string;
  intro?: string;
  slugs: string[];
  chartsPerCase?: number;
  index: number;
}) {
  const cases = await fetchCaseProof(slugs);
  if (cases.length === 0) return null;

  return (
    <section
      id={`section-${index + 1}`}
      data-proposal-section={heading || 'caseProofSection'}
      data-proposal-type="caseProofSection"
      className="border-b border-surface-200 py-9 last:border-b-0 sm:py-11"
    >
      {heading && (
        <h2 className="text-[22px] font-medium leading-tight tracking-[-0.03em] text-surface-950 sm:text-[26px]">
          {heading}
        </h2>
      )}
      {intro && <p className="mt-3 max-w-[62ch] text-[15.5px] leading-relaxed text-surface-700">{intro}</p>}

      <div className="mt-4 divide-y divide-surface-200">
        {cases.map((item) => {
          const plot = pickPlot(item);
          return (
            <article
              key={item.slug}
              data-print-keep
              className="grid gap-x-10 gap-y-4 py-8 sm:grid-cols-[minmax(0,236px)_minmax(0,1fr)]"
            >
              {/* Everything that is not the line lives on the left, so the
                  line gets the whole right column and its full height. */}
              <div className="min-w-0">
                <h3 className="text-[15px] font-medium leading-snug text-surface-950">{shortName(item.name)}</h3>
                {(() => {
                  const lift = plot?.kind === 'area' ? liftSinceStart(plot.points, plot.startDate) : null;
                  const lead = item.instruments?.leadGrowth;
                  // Pipeline first when the case has it; the Google line is the secondary stat.
                  const primary = lead
                    ? { number: lead.multiple, line: shortTitle(lead.multipleLabel) }
                    : lift
                      ? { number: `${lift.toFixed(lift >= 10 ? 0 : 1)}×`, line: 'more Google impressions a day since LoudFace started' }
                      : { number: item.resultNumber, line: shortTitle(item.resultTitle) };
                  const secondary = lead && lift ? { number: `${lift.toFixed(lift >= 10 ? 0 : 1)}×`, line: 'more Google impressions a day' } : null;
                  return (
                    <div className="mt-3 space-y-2">
                      {primary.number && <Stat number={primary.number} line={primary.line} lead />}
                      {secondary && <Stat number={secondary.number} line={secondary.line} />}
                    </div>
                  );
                })()}
                {plot?.kind === 'area' && plot.startDate && (
                  <p className="mt-4 flex items-center gap-1.5 text-[12px] text-surface-500">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/lf-logo.svg" alt="LoudFace" width={16} height={16} className="h-4 w-4 shrink-0 rounded-full" />
                    <span>
                      LoudFace starts ·{' '}
                      {new Date(`${plot.startDate}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </p>
                )}
                <Link
                  href={`/case-studies/${item.slug}`}
                  className="mt-4 inline-block text-[12.5px] font-medium text-primary-600 underline underline-offset-2"
                >
                  Read the case study
                </Link>
              </div>

              {plot && (
                <div className="min-w-0 self-stretch">
                  <ProposalCaseChart plot={plot} />
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
