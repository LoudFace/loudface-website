'use client';

/**
 * InstrumentsBoard — the reusable "AI Search & Organic Growth" chart board.
 *
 * Generalised from TradeMomentum's proven `TradeMomentumInstruments` band
 * (src/app/(site)/dev-preview/trademomentum/TradeMomentumInstruments.tsx —
 * keep reading that file's header, its design rules are inherited wholesale
 * here) so any case study with an `instruments` field on Sanity can carry the
 * same charts. TradeMomentumInstruments itself is left on disk as a reference
 * and is no longer wired into any page.
 *
 * SAME RULE AS THE ORIGINAL: a case study must show CHANGE. Every cell here is
 * a movement (before → after, or a series over time), never a static snapshot
 * — a snapshot invites "so what did the agency do?" instead of showing it.
 *
 * CONDITIONAL LAYOUT — every field on `CaseStudyInstruments` is optional, so
 * this board must look intentional for any subset a study actually has:
 *   - AI board renders only if at least one of topicClimb / rankOverTime /
 *     engineBeforeAfter is present.
 *   - The top row holds topicClimb and rankOverTime. Both present → they
 *     share it (2.1fr/1fr, topic wider — it is the story, rank is the proof).
 *     Only one present → that cell goes full width (`.inb-row--single`).
 *     Neither present → the row is skipped entirely.
 *   - engineBeforeAfter is its own full-width row, rendered only if present.
 *   - The Google board renders only if indexedTrend is present (a
 *     publishedResult with no trend chart beside it has nothing to compound
 *     against, so it never renders alone). indexedTrend + publishedResult
 *     share the row (2.1fr/1fr); indexedTrend alone goes full width.
 * No cell is ever left empty and no row is ever half-filled — a missing field
 * removes its cell/row rather than rendering a blank one.
 *
 * Confidentiality carries over unchanged: indexed Google values are printed
 * as a multiple of their own baseline label, never as a raw count.
 */

import { curveCatmullRom } from '@visx/curve';
import { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Background,
  Bar,
  BarChart,
  BarXAxis,
  ChartTooltip,
  Grid,
  Line,
  XAxis,
} from '@/components/charts';
import type { CaseStudyInstruments, InstrumentEngineId } from '@/lib/types';
import { EngineMark, GoogleMark } from './EngineMarks';

interface InstrumentsBoardProps {
  instruments: CaseStudyInstruments;
  clientName: string;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/* Formatted by hand — `toLocaleDateString` resolves against the runtime's own
   locale data, which differs between the server and the browser. */
const fmtDay = (d: unknown) =>
  d instanceof Date ? `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}` : undefined;
const fmtMonth = (d: unknown) =>
  d instanceof Date ? `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}` : undefined;

/** Parses a "YYYY-MM" start month into a UTC Date for the i-th month after it. */
function monthAt(startMonthIso: string | undefined, index: number): Date | null {
  if (!startMonthIso) return null;
  const m = /^(\d{4})-(\d{2})$/.exec(startMonthIso);
  if (!m) return null;
  const year = Number(m[1]);
  const month0 = Number(m[2]) - 1;
  return new Date(Date.UTC(year, month0 + index, 1));
}

/*
 * Client confidentiality: no exact click or impression totals on a public case
 * study. The Google series is indexed to its own baseline = 100, but a bare
 * "1174" reads as a real count, so it is printed as its multiple of the
 * baseline instead.
 */
function makeAsMultiple(baselineLabel: string | undefined) {
  const label = baselineLabel || 'baseline';
  return (indexed: unknown) => {
    const n = Number(indexed);
    return Number.isFinite(n) ? `${(n / 100).toFixed(1)}× ${label}` : '—';
  };
}

/*
 * Our own tooltip body. The vendored default prints the raw data key beside a
 * plain coloured dot and leaves the value flush against the panel edge.
 */
function Tip({
  title,
  rows,
}: {
  title?: string;
  rows: { label: string; value: string; engine?: InstrumentEngineId; swatch?: string }[];
}) {
  return (
    <div className="inb-tip">
      {title && <p className="inb-tip-title">{title}</p>}
      <ul className="inb-tip-rows">
        {rows.map((r) => (
          <li key={r.label}>
            {r.engine ? (
              <EngineMark engine={r.engine} size={12} />
            ) : (
              <span className="inb-tip-rule" style={{ background: r.swatch ?? 'var(--chart-1)' }} />
            )}
            <span className="inb-tip-label">{r.label}</span>
            <span className="inb-tip-value">{r.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Arrow() {
  return (
    <svg className="inb-arrow" width="24" height="10" viewBox="0 0 36 15" fill="none" aria-hidden="true">
      <path d="M1 7.5H25.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M23.5 1.4 35 7.5l-11.5 6.1z" fill="currentColor" />
    </svg>
  );
}

/*
 * BarChart has no `style` prop — it sizes itself purely from `aspectRatio` —
 * so a ratio that reads well full-width (8.5:1) leaves NEGATIVE plot height on
 * a phone once margins are subtracted (~330px / 8.5 ≈ 39px, minus 42px of
 * margins), and the bars silently never draw. Found by the qa-loop design lane
 * at 375px on all four pages carrying this cell (2026-08-31). The ratio and
 * margins switch below 700px. Starts `false` so server and first client render
 * agree (no hydration mismatch); the effect corrects it before paint.
 */
function useIsNarrow(query = '(max-width: 700px)') {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    setNarrow(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setNarrow(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return narrow;
}

export function InstrumentsBoard({ instruments, clientName }: InstrumentsBoardProps) {
  const { aiSource, gscSource, topicClimb, rankOverTime, engineBeforeAfter, indexedTrend, publishedResult } =
    instruments;

  /* Chart enter animations differ between the server and client render, so the
     charts mount client-side. Their boxes keep their size, so nothing shifts. */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isNarrow = useIsNarrow();

  const topicSeries = useMemo(
    () =>
      (topicClimb?.points ?? []).map((p) => {
        const at = new Date(`${p.week}T00:00:00Z`);
        return {
          /* BarChart plots a CATEGORICAL x axis, so each point carries its own
             label string rather than a Date. Points may be daily or weekly —
             the label is the same either way, and the bars simply get thinner
             as the series gets longer. */
          day: fmtDay(at) ?? p.week,
          date: at,
          visibility: Number((p.value * 100).toFixed(1)),
        };
      }),
    [topicClimb]
  );

  const rankSeries = useMemo(
    () =>
      (rankOverTime?.points ?? []).map((p) => ({
        date: new Date(`${p.week}T00:00:00Z`),
        position: p.position,
      })),
    [rankOverTime]
  );

  const beforeAfterBars = useMemo(
    () =>
      (engineBeforeAfter?.rows ?? []).map((r) => ({
        engine:
          r.engine === 'googleAio'
            ? 'Google AI Overviews'
            : r.engine === 'chatgpt'
              ? 'ChatGPT'
              : r.engine === 'gemini'
                ? 'Gemini'
                : 'Perplexity',
        engineId: r.engine,
        before: Number((r.before * 100).toFixed(1)),
        after: Number((r.after * 100).toFixed(1)),
      })),
    [engineBeforeAfter]
  );

  const googleSeries = useMemo(
    () =>
      (indexedTrend?.points ?? []).map((p, i) => ({
        /* A point carries `date` when the series is daily. Monthly series
           predate that field and still derive their date by counting months
           from `startMonthIso`. */
        date: p.date ? new Date(`${p.date}T00:00:00Z`) : (monthAt(indexedTrend?.startMonthIso, i) ?? new Date(NaN)),
        impressions: p.impressions,
        clicks: p.clicks,
      })),
    [indexedTrend]
  );

  /* A daily Google series needs day-level tooltips; a monthly one needs month
     labels. One explicit ISO date on the first point is what separates them. */
  const googleIsDaily = !!indexedTrend?.points?.[0]?.date;

  const asMultiple = useMemo(() => makeAsMultiple(indexedTrend?.baselineLabel), [indexedTrend]);

  const hasTopRow = !!(topicClimb || rankOverTime);
  const topRowSingle = !(topicClimb && rankOverTime);
  const hasAiBoard = hasTopRow || !!engineBeforeAfter;
  const hasGoogleBoard = !!indexedTrend;
  const googleRowSingle = !publishedResult;

  if (!hasAiBoard && !hasGoogleBoard) return null;

  return (
    <section className="nmx" aria-label="Results by the numbers">
      <div className="container-wide">
        <div className="inb">
          {/* ── Board 1: AI search ─────────────────────────────────────── */}
          {hasAiBoard && (
            <section className="inb-band" aria-label="AI search results">
              <header className="inb-head">
                <div>
                  <p className="inb-eyebrow">By the numbers · AI search</p>
                  <h2 className="inb-title">Where AI names {clientName}</h2>
                </div>
                {aiSource && <p className="inb-source">{aiSource}</p>}
              </header>

              {hasTopRow && (
                <div className={`inb-row inb-row--top${topRowSingle ? ' inb-row--single' : ''}`}>
                  {topicClimb && (
                    <div className="inb-cell">
                      <p className="inb-cell-label">{topicClimb.title}</p>
                      <div className="inb-cell-body">
                        <div className="inb-plot inb-plot--bars">
                          {mounted && (
                            /*
                             * Bars, not a line. Once this series went from
                             * weekly to daily points (2026-09-01) a line became
                             * dishonest: a brand can go a whole day without
                             * being named, so the series has real zeros — 47 of
                             * Delshad Legal's first 76 days. A line draws
                             * straight through them as if the value were merely
                             * low. Bars show the zero days as zero, and the
                             * climb reads as a floor turning into a wall.
                             */
                            <BarChart
                              data={topicSeries}
                              xDataKey="day"
                              /* BarChart takes no `style` prop, so it normally
                                 sizes itself from this ratio alone — which is
                                 how the engine bars once collapsed to nothing on
                                 a phone. `.inb-plot--bars` overrides the ratio in
                                 CSS and pins the chart to its box instead, so the
                                 value here is only a pre-hydration placeholder. */
                              aspectRatio="4 / 1"
                              barGap={topicSeries.length > 40 ? 0.12 : 0.28}
                              margin={{ top: 8, right: 10, bottom: 30, left: 10 }}
                            >
                              <Background pattern="dots" opacity={0.6} />
                              <Grid horizontal />
                              <Bar dataKey="visibility" lineCap="butt" fill="var(--chart-1)" />
                              <BarXAxis maxLabels={7} />
                              <ChartTooltip
                                content={({ point }) => (
                                  <Tip
                                    title={fmtDay(point.date)}
                                    rows={[
                                      {
                                        label: 'Share of AI answers',
                                        value: `${Number(point.visibility).toFixed(1)}%`,
                                      },
                                    ]}
                                  />
                                )}
                              />
                            </BarChart>
                          )}
                        </div>
                      </div>
                      <p className="inb-cell-foot">{topicClimb.caption}</p>
                    </div>
                  )}

                  {/*
                    * Position is "lower is better", so this line descends —
                    * the label and the arrow say so explicitly, because a
                    * falling line reads as decline unless it is called out.
                    */}
                  {rankOverTime && (
                    <div className="inb-cell">
                      <p className="inb-cell-label">{rankOverTime.label}</p>
                      <div className="inb-cell-body">
                        <div className="inb-figure">
                          <span className="inb-figure-value">{rankOverTime.to}</span>
                          <span className="inb-transition">
                            <span>from {rankOverTime.from}</span>
                            <Arrow />
                          </span>
                        </div>
                        <div className="inb-plot inb-plot--short">
                          {mounted && (
                            <AreaChart
                              data={rankSeries}
                              aspectRatio=""
                              style={{ height: '100%' }}
                              margin={{ top: 8, right: 10, bottom: 24, left: 10 }}
                            >
                              <Background pattern="dots" opacity={0.5} />
                              <Area
                                dataKey="position"
                                curve={curveCatmullRom}
                                fillOpacity={0.22}
                                strokeWidth={2}
                                stroke="var(--chart-1)"
                              />
                              <XAxis />
                              <ChartTooltip
                                content={({ point }) => (
                                  <Tip
                                    title={fmtDay(point.date)}
                                    rows={[{ label: 'Average rank', value: String(point.position) }]}
                                  />
                                )}
                              />
                            </AreaChart>
                          )}
                        </div>
                      </div>
                      <p className="inb-cell-foot">{rankOverTime.caption}</p>
                    </div>
                  )}
                </div>
              )}

              {/*
                * What the work did, per engine. Grouped, not stacked: each
                * engine's visibility is a share of a DIFFERENT pool of
                * answers, so a stack total would mean nothing.
                */}
              {engineBeforeAfter && (
                <div className="inb-row inb-row--bottom">
                  <div className="inb-cell">
                    <div className="inb-cell-head">
                      <p className="inb-cell-label">Share of AI answers, by engine</p>
                      <div className="inb-legend">
                        <span className="inb-legend-item">
                          <span className="inb-key-rule" style={{ background: 'var(--chart-3)' }} />
                          {engineBeforeAfter.beforeLabel}
                        </span>
                        <span className="inb-legend-item">
                          <span className="inb-key-rule" style={{ background: 'var(--chart-1)' }} />
                          {engineBeforeAfter.afterLabel}
                        </span>
                      </div>
                    </div>
                    <div className="inb-cell-body">
                      <div className="inb-ba">
                        {mounted && (
                          <BarChart
                            data={beforeAfterBars}
                            xDataKey="engine"
                            aspectRatio={isNarrow ? '1.5 / 1' : '8.5 / 1'}
                            margin={
                              isNarrow
                                ? { top: 14, right: 8, bottom: 28, left: 8 }
                                : { top: 10, right: 8, bottom: 32, left: 8 }
                            }
                          >
                            <Grid horizontal />
                            <Bar dataKey="before" fill="var(--chart-3)" lineCap={3} />
                            <Bar dataKey="after" fill="var(--chart-1)" lineCap={3} />
                            <BarXAxis />
                            <ChartTooltip
                              showCrosshair={false}
                              showDots={false}
                              content={({ point }) => (
                                <Tip
                                  title={String(point.engine)}
                                  rows={[
                                    {
                                      label: engineBeforeAfter.beforeLabel,
                                      value: `${Number(point.before).toFixed(1)}%`,
                                      swatch: 'var(--chart-3)',
                                    },
                                    {
                                      label: engineBeforeAfter.afterLabel,
                                      value: `${Number(point.after).toFixed(1)}%`,
                                      swatch: 'var(--chart-1)',
                                    },
                                  ]}
                                />
                              )}
                            />
                          </BarChart>
                        )}
                      </div>
                    </div>
                    <p className="inb-cell-foot">{engineBeforeAfter.caption}</p>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ── Board 2: Google search ─────────────────────────────────── */}
          {hasGoogleBoard && indexedTrend && (
            <section className="inb-band inb-band--google" aria-label="Google search results">
              <header className="inb-head">
                <div>
                  <p className="inb-eyebrow inb-eyebrow--marked">
                    <GoogleMark size={14} />
                    By the numbers · Google search
                  </p>
                  <h2 className="inb-title">And the same pages compounding in Google</h2>
                </div>
                {gscSource && <p className="inb-source">{gscSource}</p>}
              </header>

              <div className={`inb-row inb-row--google${googleRowSingle ? ' inb-row--single' : ''}`}>
                <div className="inb-cell">
                  <p className="inb-cell-label">{indexedTrend.title}</p>
                  <div className="inb-cell-body">
                    <div className="inb-legend">
                      <span className="inb-legend-item">
                        <span className="inb-key-rule" style={{ background: 'var(--chart-3)' }} />
                        Impressions
                      </span>
                      <span className="inb-legend-item">
                        <span className="inb-key-rule" style={{ background: 'var(--chart-1)' }} />
                        Clicks
                      </span>
                    </div>
                    <div className="inb-plot">
                      {mounted && (
                        <AreaChart
                          data={googleSeries}
                          aspectRatio=""
                          style={{ height: '100%' }}
                          margin={{ top: 6, right: 10, bottom: 26, left: 10 }}
                        >
                          <Background pattern="dots" opacity={0.55} />
                          <Grid horizontal />
                          <Area dataKey="impressions" fillOpacity={0.2} strokeWidth={2} stroke="var(--chart-3)" />
                          <Area dataKey="clicks" fillOpacity={0.3} strokeWidth={2} stroke="var(--chart-1)" />
                          <XAxis />
                          <ChartTooltip
                            content={({ point }) => (
                              <Tip
                                title={googleIsDaily ? fmtDay(point.date) : fmtMonth(point.date)}
                                rows={[
                                  {
                                    label: 'Impressions',
                                    value: asMultiple(point.impressions),
                                    swatch: 'var(--chart-3)',
                                  },
                                  {
                                    label: 'Clicks',
                                    value: asMultiple(point.clicks),
                                    swatch: 'var(--chart-1)',
                                  },
                                ]}
                              />
                            )}
                          />
                        </AreaChart>
                      )}
                    </div>
                  </div>
                  <p className="inb-cell-foot">{indexedTrend.caption}</p>
                </div>

                {publishedResult && (
                  <div className="inb-cell">
                    <p className="inb-cell-label">The published result</p>
                    <div className="inb-cell-body">
                      {publishedResult.rows.map((row) => (
                        <div className="inb-figure" key={row.unit}>
                          <span className="inb-figure-value">{row.value}</span>
                          <span className="inb-figure-unit">{row.unit}</span>
                        </div>
                      ))}
                      {publishedResult.positionFrom != null && publishedResult.positionTo != null && (
                        <div className="inb-transition">
                          <span>average position {publishedResult.positionFrom}</span>
                          <Arrow />
                          <span>{publishedResult.positionTo}</span>
                        </div>
                      )}
                    </div>
                    <p className="inb-cell-foot">{publishedResult.caption}</p>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </section>
  );
}
