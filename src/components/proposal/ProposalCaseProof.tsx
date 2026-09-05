import Link from 'next/link';
import { fetchCaseProof, type CaseProof } from '@/sanity/lib/caseProof';
import { ProposalCaseChart, type CasePlot } from './ProposalCaseCharts';

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
              className="grid gap-x-8 gap-y-4 py-7 sm:grid-cols-[minmax(0,240px)_minmax(0,1fr)]"
            >
              <div className="min-w-0">
                <h3 className="text-[15px] font-medium leading-snug text-surface-950">{item.name}</h3>
                {item.resultNumber && (
                  <p className="proposal-num mt-2 text-[28px] font-medium leading-none tracking-[-0.035em] text-surface-950">
                    {item.resultNumber}
                  </p>
                )}
                {item.resultTitle && (
                  <p className="mt-2 text-[13px] leading-snug text-surface-500">{item.resultTitle}</p>
                )}
                <Link
                  href={`/case-studies/${item.slug}`}
                  className="mt-3 inline-block text-[12.5px] font-medium text-primary-600 underline underline-offset-2"
                >
                  Read the case study
                </Link>
              </div>
              {plot && (
                <div className="min-w-0">
                  <p className="text-[11.5px] font-medium text-surface-500">{plot.title}</p>
                  <div className="mt-2">
                    <ProposalCaseChart plot={plot} />
                  </div>
                  {plot.caption && (
                    <p className="mt-2 text-[11.5px] leading-snug text-surface-400">{plot.caption}</p>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
