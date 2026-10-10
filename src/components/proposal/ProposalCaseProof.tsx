import Link from 'next/link';
import { fetchCaseProof, type CaseProof } from '@/sanity/lib/caseProof';
import { ProposalCaseChart, type CasePlot } from './ProposalCaseCharts';
import { StatChip } from './StatChip';
import { caseSeries, leadKind, splitTitle, standaloneCharts } from '@/app/case-v11/series';
import type { Series } from '@/app/home-v11/data';

/**
 * Real case studies inside a proposal, drawn with the same Bklit charts as
 * the public pages. Read live by slug, so a number here cannot drift.
 *
 * Each case shows what its own page leads with: result 1 and result 2 as
 * published, and the lead chart chosen by the case page's own rule
 * (`standaloneCharts` + `leadKind` in case-v11/series). Nothing here is
 * computed from a series or chosen differently from the site (2026-10-10:
 * the deck showed Delshad's 2.7x leads while its page led with 14.8x clicks).
 * Name and headline numbers on the left, the plot on the right, hairlines
 * between cases — no cards.
 */

const fmtWeek = (iso: string) => {
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

/** "Genie Teacher: 5x Organic Visibility" → "Genie Teacher". The chart carries the rest. */
const shortName = (name: string) => name.split(':')[0].trim();

/** "Google clicks per week, week of 7 Jun → …" → "Google clicks per week": the label the case page prints. */
const resultLabel = (title?: string) => (title ? splitTitle(title).label : undefined);

/** Drop a trailing "weekly"/"daily" and any "· source" tail, as the case page does. */
const chartTitle = (t: string) => t.replace(/,\s*(weekly|daily|indexed)$/i, '').split('·')[0].trim();

/**
 * A result as a badge, not a sentence: the number is a solid tag, the label
 * sits beside it, the whole thing is one pill. The lead stat gets the indigo;
 * the second result the quiet grey.
 */
function Stat({ number, line, lead = false }: { number: string; line?: string; lead?: boolean }) {
  return (
    <p className="pr-3 [text-wrap:pretty]">
      <StatChip number={number} line={line} lead={lead} />
    </p>
  );
}

const areaPoints = (series: Series) => series.dates.map((date, i) => ({ date, value: series.values[i] }));

function pickPlot(item: CaseProof): CasePlot | null {
  const s = standaloneCharts(caseSeries(item.instruments));
  const kind = leadKind(s, item.resultTitle ?? '');

  if (kind === 'clicks' && s.clicks) {
    return { kind: 'area', title: s.clicks.title, unitLabel: '×', startDate: s.clicks.series.start, points: areaPoints(s.clicks.series) };
  }
  if (kind === 'google' && s.google) {
    return { kind: 'area', title: 'Google impressions per day', unitLabel: '×', startDate: s.google.series.start, points: areaPoints(s.google.series) };
  }
  if (kind === 'ai' && s.ai) {
    const title = chartTitle(s.ai.title);
    return s.ai.series.bars
      ? { kind: 'bars', title, unit: '%', points: s.ai.series.dates.map((d, i) => ({ label: fmtWeek(d), value: Number(s.ai!.series.values[i].toFixed(1)) })) }
      : { kind: 'area', title, unitLabel: '%', divisor: 1, startDate: s.ai.series.start, points: areaPoints(s.ai.series) };
  }
  if (kind === 'leads' && s.leads) {
    return {
      kind: 'bars',
      title: chartTitle(s.leads.title),
      unit: '',
      points: s.leads.series.dates.map((d, i) => ({ label: fmtWeek(d), value: s.leads!.series.values[i], display: `${(s.leads!.series.values[i] / 100).toFixed(1)}×` })),
    };
  }

  // No published series (Toku): no plot. The legacy `charts` field is not drawn on the case pages either, and its
  // numbers are older than the results above.
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
                <div className="mt-3 space-y-3">
                  {item.resultNumber && <Stat number={item.resultNumber} line={resultLabel(item.resultTitle)} lead />}
                  {item.result2Number && <Stat number={item.result2Number} line={resultLabel(item.result2Title)} />}
                </div>
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
