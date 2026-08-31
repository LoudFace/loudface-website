'use client';

/**
 * TradeMomentum's "By the numbers" band, as it sits on the real case study.
 * Replaces `ResultsInstruments` on that page.
 *
 * ONE RULE DECIDED EVERY CELL HERE: a case study must show CHANGE.
 *
 * Three cells were cut for failing it, all for the same reason (Arnel,
 * 2026-08-31): a snapshot tells a reader where the brand stands but never what
 * the agency did, which invites exactly the wrong question.
 *   - "Share of the category leader" gauges — a fixed position in time.
 *   - "Who does the citing" ring — a fixed engine split, and redundant once the
 *     before/after bars show the same engines moving.
 *   - "Rank when cited" as a numeral plus a list — not a chart at all.
 *
 * What is left is three instruments, each a movement:
 *   1. The topic climb        8.8% -> 33.3%   (the page's own result-2)
 *   2. Mean cited position    3.9  -> 1.9     (the page's result-3, over time)
 *   3. Visibility per engine  May  -> Aug     (what the work did, per engine)
 *
 * Everything is on the page's own baselines — see data.ts, which reconciles
 * each published claim against the source it came from.
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
  LineChart,
  XAxis,
} from '@/components/charts';
import { EngineMark, GoogleMark } from '@/app/case-detail-v3/EngineMarks';
import type { EngineId } from './data';
import {
  AI_SOURCE,
  GSC_SOURCE,
  claims,
  engineBeforeAfter,
  engineBeforeAfterWindow,
  googlePosition,
  gscMonthly,
  positionChange,
  positionWeekly,
  promptCoverage,
  tradingCommunitiesNote,
  tradingCommunitiesWeekly,
} from './data';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/* Formatted by hand — `toLocaleDateString` resolves against the runtime's own
   locale data, which differs between the server and the browser. */
const fmtDay = (d: unknown) =>
  d instanceof Date ? `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}` : undefined;
const fmtMonth = (d: unknown) =>
  d instanceof Date ? `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}` : undefined;

/*
 * Client confidentiality: no exact click or impression totals on a public case
 * study. The Google series is indexed to Dec = 100, but a bare "1174" reads as
 * a real count, so it is printed as its multiple of the baseline.
 */
const asMultiple = (indexed: unknown) => {
  const n = Number(indexed);
  return Number.isFinite(n) ? `${(n / 100).toFixed(1)}× Dec` : '—';
};

/*
 * Our own tooltip body. The vendored default prints the raw data key beside a
 * plain coloured dot and leaves the value flush against the panel edge.
 */
function Tip({
  title,
  rows,
}: {
  title?: string;
  rows: { label: string; value: string; engine?: EngineId; swatch?: string }[];
}) {
  return (
    <div className="tmi-tip">
      {title && <p className="tmi-tip-title">{title}</p>}
      <ul className="tmi-tip-rows">
        {rows.map((r) => (
          <li key={r.label}>
            {r.engine ? (
              <EngineMark engine={r.engine} size={12} />
            ) : (
              <span className="tmi-tip-rule" style={{ background: r.swatch ?? 'var(--chart-1)' }} />
            )}
            <span className="tmi-tip-label">{r.label}</span>
            <span className="tmi-tip-value">{r.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Arrow() {
  return (
    <svg className="tmi-arrow" width="24" height="10" viewBox="0 0 36 15" fill="none" aria-hidden="true">
      <path d="M1 7.5H25.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M23.5 1.4 35 7.5l-11.5 6.1z" fill="currentColor" />
    </svg>
  );
}

export function TradeMomentumInstruments() {
  /* Chart enter animations differ between the server and client render, so the
     charts mount client-side. Their boxes keep their size, so nothing shifts. */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const topicSeries = useMemo(
    () =>
      tradingCommunitiesWeekly.map((w) => ({
        date: new Date(`${w.week}T00:00:00Z`),
        visibility: Number((w.visibility * 100).toFixed(1)),
      })),
    []
  );

  const rankSeries = useMemo(
    () =>
      positionWeekly.map((w) => ({
        date: new Date(`${w.week}T00:00:00Z`),
        position: w.position,
      })),
    []
  );

  const beforeAfterBars = useMemo(
    () =>
      engineBeforeAfter.map((e) => ({
        engine: e.engine === 'googleAio' ? 'Google AIO' : e.label,
        before: Number((e.before * 100).toFixed(1)),
        after: Number((e.after * 100).toFixed(1)),
      })),
    []
  );

  const googleSeries = useMemo(
    () =>
      gscMonthly.map((m, i) => ({
        date: new Date(Date.UTC(2025, 8 + i, 1)),
        impressions: m.impressions,
        clicks: m.clicks,
      })),
    []
  );

  return (
    <section className="nmx" aria-label="Results by the numbers">
      <div className="container-wide">
        <div className="tmi">
          {/* ── Board 1: AI search ─────────────────────────────────────── */}
          <section className="tmi-band" aria-label="AI search results">
            <header className="tmi-head">
              <div>
                <p className="tmi-eyebrow">By the numbers · AI search</p>
                <h2 className="tmi-title">Where AI names TradeMomentum</h2>
              </div>
              <p className="tmi-source">{AI_SOURCE}</p>
            </header>

            <div className="tmi-row tmi-row--top">
              {/* Result 2, as a movement. */}
              <div className="tmi-cell">
                <p className="tmi-cell-label">
                  &ldquo;Trading communities&rdquo; · share of AI answers, weekly
                </p>
                <div className="tmi-cell-body">
                  <div className="tmi-plot">
                    {mounted && (
                      <LineChart
                        data={topicSeries}
                        aspectRatio=""
                        style={{ height: '100%' }}
                        margin={{ top: 8, right: 10, bottom: 26, left: 10 }}
                      >
                        <Background pattern="dots" opacity={0.6} />
                        <Line
                          dataKey="visibility"
                          curve={curveCatmullRom}
                          fadeEdges
                          strokeWidth={2.25}
                          stroke="var(--chart-1)"
                        />
                        <XAxis />
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
                      </LineChart>
                    )}
                  </div>
                </div>
                <p className="tmi-cell-foot">
                  8.8% to {tradingCommunitiesNote.measured} in seven weeks — the topic the product
                  actually sells into, not the whole account.
                </p>
              </div>

              {/*
                * Result 3, as a movement. Replaced a static "1.8" and the engine
                * ring: both said where the brand stands, neither said what
                * changed. Position is "lower is better", so this line descends —
                * the label and the arrow say so explicitly, because a falling
                * line reads as decline unless it is called out.
                */}
              <div className="tmi-cell">
                <p className="tmi-cell-label">Average rank when cited · lower is better</p>
                <div className="tmi-cell-body">
                  <div className="tmi-figure">
                    <span className="tmi-figure-value">{positionChange.to}</span>
                    <span className="tmi-transition">
                      <span>from {positionChange.from}</span>
                      <Arrow />
                    </span>
                  </div>
                  <div className="tmi-plot tmi-plot--short">
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
                <p className="tmi-cell-foot">
                  From fourth-named to second across the engagement. Measured over{' '}
                  {promptCoverage.total} non-branded buyer prompts; AI names TradeMomentum on{' '}
                  {promptCoverage.cited}.
                </p>
              </div>
            </div>

            {/*
              * What the work did, per engine. Grouped, not stacked: each engine's
              * visibility is a share of a DIFFERENT pool of answers, so a stack
              * total would mean nothing. No depth layers either — they take a
              * single dataKey and drew ghost geometry behind the grouped bars.
              */}
            <div className="tmi-row tmi-row--bottom">
              <div className="tmi-cell">
                <div className="tmi-cell-head">
                  <p className="tmi-cell-label">Share of AI answers, by engine</p>
                  <div className="tmi-legend">
                    <span className="tmi-legend-item">
                      <span className="tmi-key-rule" style={{ background: 'var(--chart-3)' }} />
                      {engineBeforeAfterWindow.before}
                    </span>
                    <span className="tmi-legend-item">
                      <span className="tmi-key-rule" style={{ background: 'var(--chart-1)' }} />
                      {engineBeforeAfterWindow.after}
                    </span>
                  </div>
                </div>
                <div className="tmi-cell-body">
                  <div className="tmi-ba">
                    {mounted && (
                      <BarChart
                        data={beforeAfterBars}
                        xDataKey="engine"
                        aspectRatio="8.5 / 1"
                        margin={{ top: 10, right: 8, bottom: 32, left: 8 }}
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
                                  label: engineBeforeAfterWindow.before,
                                  value: `${Number(point.before).toFixed(1)}%`,
                                  swatch: 'var(--chart-3)',
                                },
                                {
                                  label: engineBeforeAfterWindow.after,
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
                <p className="tmi-cell-foot">
                  ChatGPT went from naming TradeMomentum in 1.4% of answers to 10.0% — a 7× lift.
                </p>
              </div>
            </div>
          </section>

          {/* ── Board 2: Google search ─────────────────────────────────── */}
          <section className="tmi-band tmi-band--google" aria-label="Google search results">
            <header className="tmi-head">
              <div>
                <p className="tmi-eyebrow tmi-eyebrow--marked">
                  <GoogleMark size={14} />
                  By the numbers · Google search
                </p>
                <h2 className="tmi-title">And the same pages compounding in Google</h2>
              </div>
              <p className="tmi-source">{GSC_SOURCE}</p>
            </header>

            <div className="tmi-row tmi-row--google">
              <div className="tmi-cell">
                <p className="tmi-cell-label">Impressions and clicks · indexed, Dec 2025 = 100</p>
                <div className="tmi-cell-body">
                  <div className="tmi-legend">
                    <span className="tmi-legend-item">
                      <span className="tmi-key-rule" style={{ background: 'var(--chart-3)' }} />
                      Impressions
                    </span>
                    <span className="tmi-legend-item">
                      <span className="tmi-key-rule" style={{ background: 'var(--chart-1)' }} />
                      Clicks
                    </span>
                  </div>
                  <div className="tmi-plot">
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
                              title={fmtMonth(point.date)}
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
                <p className="tmi-cell-foot">
                  August is the first 24 days only. Impressions outran clicks — the pages entered far
                  more results before climbing high enough in them to be clicked.
                </p>
              </div>

              <div className="tmi-cell">
                <p className="tmi-cell-label">The published result</p>
                <div className="tmi-cell-body">
                  <div className="tmi-figure">
                    <span className="tmi-figure-value">{claims.impressionsMultiple}</span>
                    <span className="tmi-figure-unit">impressions</span>
                  </div>
                  <div className="tmi-figure" style={{ marginTop: '0.75rem' }}>
                    <span className="tmi-figure-value">{claims.clicksMultiple}</span>
                    <span className="tmi-figure-unit">clicks per week</span>
                  </div>
                  <div className="tmi-transition">
                    <span>average position {googlePosition.from}</span>
                    <Arrow />
                    <span>{googlePosition.to}</span>
                  </div>
                </div>
                <p className="tmi-cell-foot">
                  Impressions on the December baseline the page uses; clicks weekly, September to August.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
