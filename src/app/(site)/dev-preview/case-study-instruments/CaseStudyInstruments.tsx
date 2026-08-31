'use client';

/**
 * TradeMomentum case-study dashboard.
 *
 * Six instruments in a two-row grid, every one on real Peec data. The whole
 * band is capped at two thirds of the viewport (`.cin-band`) — the aspect
 * ratios and explicit chart sizes are picked so it lands under the cap
 * naturally rather than being clipped by it.
 *
 * Arnel's steer (2026-08-31): keep the three-column rhythm that worked, add
 * the ring, the trio, the funnel and the gauge, and "be more creative" with
 * visibility-by-engine. So the engine breakdown is THREE small gauges, each
 * carrying that engine's own mark in the middle — the gauge doing the job the
 * three progress bars were doing, with the logo as the label.
 *
 * Colour is one indigo ramp, re-keyed via the `.cin` token scope. No vendored
 * chart component is edited.
 */

import { curveCatmullRom } from '@visx/curve';
import { useEffect, useMemo, useState } from 'react';
import {
  Background,
  ChartTooltip,
  Gauge,
  Line,
  LineChart,
  Ring,
  RingChart,
  XAxis,
} from '@/components/charts';
import { EngineMark } from '../case-study-charts/EngineMarks';
import { EngineTooltipContent } from '../case-study-charts/ChartGallery';
import {
  ENGINES,
  SOURCE_NOTE,
  byEngine,
  dailyByEngine,
  headline,
  ownedPrompts,
  promptFunnel,
} from './data';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const pct1 = (n: number) => `${(n * 100).toFixed(1)}%`;

function Arrow() {
  return (
    <svg className="cin-arrow" width="24" height="10" viewBox="0 0 36 15" fill="none" aria-hidden="true">
      <path d="M1 7.5H25.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M23.5 1.4 35 7.5l-11.5 6.1z" fill="currentColor" />
    </svg>
  );
}

export function CaseStudyInstruments({ clientName = 'TradeMomentum' }: { clientName?: string }) {
  /*
   * RingCenter animates its value with NumberFlow, which emits different markup
   * on the server than in the browser and trips a hydration error. Holding the
   * ring back to a same-sized placeholder until mount avoids it without any
   * layout shift.
   */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const daily = useMemo(
    () =>
      dailyByEngine.map((d) => ({
        date: new Date(`${d.date}T00:00:00Z`),
        chatgpt: Number((d.chatgpt * 100).toFixed(2)),
        perplexity: Number((d.perplexity * 100).toFixed(2)),
        googleAio: Number((d.googleAio * 100).toFixed(2)),
      })),
    []
  );

  const totalMentions = byEngine.reduce((s, e) => s + e.mentions, 0);
  /* Ordered by the value the ring actually plots, so the key can't disagree
     with the rings beside it. */
  const byMentions = [...byEngine].sort((a, b) => b.mentions - a.mentions);
  const topShare = Math.round((byMentions[0].mentions / totalMentions) * 100);

  /*
   * Each engine gauge is filled against the STRONGEST engine, not against
   * 100%. At 4–7% visibility a 0-100 gauge would read as three empty dials;
   * scaling to the leader makes the comparison between engines the thing you
   * see, which is what the cell is for. The printed % underneath is always the
   * true figure, so the number never inherits the relative scale.
   */
  const maxEngineVisibility = Math.max(...byEngine.map((e) => e.visibility));

  /* The 41 prompts, partitioned. Counts come straight from `promptFunnel`. */
  const coverage = {
    total: promptFunnel[0].value,
    cited: promptFunnel[1].value,
    owned: promptFunnel[2].value,
    get citedOnly() {
      return this.cited - this.owned;
    },
    get absent() {
      return this.total - this.cited;
    },
  };
  const coverageLabel = `Of ${coverage.total} non-branded buyer prompts, TradeMomentum holds 30% or more of the answers on ${coverage.owned}, is named on ${coverage.citedOnly} more, and is absent from ${coverage.absent}.`;

  return (
    <div className="cin">
      <section className="cin-band" aria-label="AI search results">
        <header className="cin-head">
          <div>
            <p className="cin-eyebrow">By the numbers · AI search</p>
            <h2 className="cin-title">Where {clientName} shows up when buyers ask an AI</h2>
          </div>
          <p className="cin-source">{SOURCE_NOTE}</p>
        </header>

        {/* ── Row 1: the movement ───────────────────────────────────────── */}
        <div className="cin-row cin-row--top">
          <div className="cin-cell cin-cell--chart">
            <div className="cin-cell-head">
              <p className="cin-cell-label">Daily share of AI answers · 30 days</p>
              <div className="cin-legend">
                {ENGINES.map((e) => (
                  <span className="cin-legend-item" key={e.id}>
                    <EngineMark engine={e.id} size={13} />
                    {e.label}
                  </span>
                ))}
              </div>
            </div>
            <div className="cin-cell-body">
              <div className="cin-plot">
                <LineChart data={daily} aspectRatio="" style={{ height: '100%' }} margin={{ top: 6, right: 8, bottom: 26, left: 8 }}>
                  <Background pattern="dots" opacity={0.6} />
                  <Line dataKey="googleAio" curve={curveCatmullRom} fadeEdges strokeWidth={1.75} stroke="var(--chart-3)" />
                  <Line dataKey="perplexity" curve={curveCatmullRom} fadeEdges strokeWidth={1.75} stroke="var(--chart-2)" />
                  <Line dataKey="chatgpt" curve={curveCatmullRom} fadeEdges strokeWidth={1.75} stroke="var(--chart-1)" />
                  <XAxis />
                  <ChartTooltip
                    content={({ point }) => (
                      <EngineTooltipContent
                        point={point}
                        title={
                          point.date instanceof Date
                            ? `${point.date.getUTCDate()} ${MONTHS[point.date.getUTCMonth()]}`
                            : undefined
                        }
                        formatValue={(v) => `${v.toFixed(1)}%`}
                      />
                    )}
                  />
                </LineChart>
              </div>
            </div>
          </div>

          <div className="cin-cell cin-cell--ring">
            <p className="cin-cell-label">Who does the citing</p>
            <div className="cin-cell-body cin-center">
              <div className="cin-ring-box">
              {mounted ? (
                <RingChart
                  data={byMentions.map((e, i) => ({
                    label: e.label,
                    value: Math.round((e.mentions / totalMentions) * 100),
                    maxValue: 100,
                    color: `var(--chart-${i + 1})`,
                  }))}
                  strokeWidth={10}
                  ringGap={6}
                >
                  {byMentions.map((e, index) => (
                    <Ring index={index} key={e.engine} lineCap="butt" />
                  ))}
                  {/*
                    * No <RingCenter>. It only honours a custom centre while a
                    * ring is HOVERED (`if (children && hoveredData)` in
                    * ring-center.tsx); at rest it always prints `totalValue`,
                    * which here is 100 because the rings are percentages — a
                    * number that means nothing to a reader. The centre is
                    * rendered as our own overlay instead.
                    */}
                </RingChart>
              ) : null}
                <div className="cin-ring-center" aria-hidden="true">
                  <span className="cin-ring-center-value">{topShare}%</span>
                  <span className="cin-ring-center-label">from {byMentions[0].label}</span>
                </div>
              </div>
            </div>
            <ul className="cin-ring-key">
              {byMentions.map((e, i) => (
                <li key={e.engine}>
                  <span className="cin-key-rule" style={{ background: `var(--chart-${i + 1})` }} />
                  <EngineMark engine={e.engine} size={13} />
                  <span className="cin-engine-name">{e.label}</span>
                  <span className="cin-engine-value">{Math.round((e.mentions / totalMentions) * 100)}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Row 2: the standing ───────────────────────────────────────── */}
        <div className="cin-row cin-row--bottom">
          {/* Three gauges — Arnel's call: the gauge does the by-engine job. */}
          <div className="cin-cell">
            <p className="cin-cell-label">Visibility by engine</p>
            <div className="cin-cell-body">
              <div className="cin-gauges">
                {byEngine.map((e) => (
                  <div className="cin-gauge" key={e.engine}>
                    <Gauge
                      value={(e.visibility / maxEngineVisibility) * 100}
                      width={112}
                      height={72}
                      spacing={26}
                      totalNotches={26}
                      inactiveFillOpacity={0.35}
                      activeFill={`var(--chart-1)`}
                    />
                    <span className="cin-gauge-mark">
                      <EngineMark engine={e.engine} size={20} />
                    </span>
                    <span className="cin-gauge-value">{pct1(e.visibility)}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="cin-cell-foot">
              Google&apos;s AI Overviews and Perplexity cite {clientName} at nearly the same rate. ChatGPT is
              the gap worth closing.
            </p>
          </div>

          {/*
            * Prompt coverage as a GRID, not a funnel.
            *
            * A funnel implies a process with drop-off between stages, where
            * each stage is earned from the one before. That is not what this
            * is: "41 prompts tracked" is a monitoring decision we made, not a
            * stage anyone passed through, so a funnel's 100% first bar reads
            * as an achievement when it is really just the denominator.
            *
            * These 41 prompts are a SET being partitioned three ways, so the
            * honest picture is the whole set at once. It also shows the thing
            * a funnel hides: the 23 prompts still unwon — the headroom, which
            * is the most useful number on the page for a prospect.
            *
            * A 41-square grid was tried first. One stacked bar beat it: the
            * proportions are the point, and at a phone width 41 squares become
            * texture rather than information (Arnel, 2026-08-31).
            */}
          <div className="cin-cell">
            <p className="cin-cell-label">Prompt coverage</p>
            <div className="cin-cell-body">
              <div className="cin-cov-bar" role="img" aria-label={coverageLabel}>
                <span
                  className="cin-cov-seg cin-cov-seg--owned"
                  style={{ flexGrow: coverage.owned }}
                />
                <span
                  className="cin-cov-seg cin-cov-seg--cited"
                  style={{ flexGrow: coverage.citedOnly }}
                />
                <span
                  className="cin-cov-seg cin-cov-seg--absent"
                  style={{ flexGrow: coverage.absent }}
                />
              </div>
              <ul className="cin-cov-key">
                <li>
                  <span className="cin-cov-swatch cin-cov-seg--owned" />
                  <span>Holds 30%+ of answers</span>
                  <span className="cin-engine-value">{coverage.owned}</span>
                </li>
                <li>
                  <span className="cin-cov-swatch cin-cov-seg--cited" />
                  <span>Named, not yet dominant</span>
                  <span className="cin-engine-value">{coverage.citedOnly}</span>
                </li>
                <li>
                  <span className="cin-cov-swatch cin-cov-seg--absent" />
                  <span>Not named yet</span>
                  <span className="cin-engine-value">{coverage.absent}</span>
                </li>
              </ul>
            </div>
            <p className="cin-cell-foot">
              All 41 non-branded buyer prompts. Brand-name prompts are excluded.
            </p>
          </div>

          {/* Rank + the prompts actually owned. */}
          <div className="cin-cell">
            <p className="cin-cell-label">Average rank when cited</p>
            <div className="cin-cell-body">
              <div className="cin-figure">
                <span className="cin-figure-value">{headline.meanPosition}</span>
                <span className="cin-transition">
                  <span>from 2.6</span>
                  <Arrow />
                </span>
              </div>
              <ul className="cin-prompts">
                {ownedPrompts.slice(0, 2).map((p) => (
                  <li key={p.prompt}>
                    <span className="cin-prompt-name">{p.prompt}</span>
                    <span className="cin-prompt-value">{pct1(p.visibility)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="cin-cell-foot">Named second on average — not buried at the bottom of the list.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
