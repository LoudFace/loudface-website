'use client';

/**
 * Case-study chart gallery — every Bklit recipe Arnel picked, wired to real
 * Peec AI data rather than the library's demo series.
 *
 * Composition follows the harvested usage snippets as closely as the real data
 * allows. Where a snippet is changed, it is because the data shape differs
 * (three engines instead of two series, percentages instead of counts), never
 * to restyle — colour comes entirely from the `.csc` token scope in
 * `case-study-charts.css`, so no chart component is edited.
 *
 * Engine identity is carried by the LOGO, not by colour alone: the three series
 * are three values of one indigo, which keeps the house "one ink" rule and
 * stays readable to anyone who cannot separate the hues.
 */

import { curveCatmullRom } from '@visx/curve';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AreaChart,
  Area,
  Background,
  BarChart,
  Bar,
  BarXAxis,
  BarDepthBack,
  BarDepthFront,
  BarLineIndicator,
  ChartTooltip,
  FunnelChart,
  Gauge,
  Grid,
  HeatmapChart,
  HeatmapCells,
  HeatmapLegend,
  HeatmapXAxis,
  HeatmapTooltip,
  Line,
  LineChart,
  PatternLines,
  RadarArea,
  RadarChart,
  RadarGrid,
  RadarLabels,
  ReferenceArea,
  Ring,
  RingCenter,
  RingChart,
  SankeyChart,
  SankeyLink,
  SankeyNode,
  SankeyTooltip,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
} from '@/components/charts';
import type { HeatmapLevelStyles } from '@/components/charts/heatmap';
import { useHeatmap } from '@/components/charts/heatmap';
import { TooltipContent } from '@/components/charts/tooltip';

import { EngineMark, GoogleMark, OpenAIMark, PerplexityMark } from './EngineMarks';
import {
  ENGINES,
  SOURCE_NOTE,
  augustMentionsByEngine,
  augustOperatingRange,
  categoryRank,
  dailyByEngine,
  matrixWeeks,
  meanCitedPosition,
  monthlyByEngine,
  monthlyCitedAnswers,
  peakWeeklyVisibility,
  promptFunnel,
  promptWeekMatrix,
  radarPrompts,
  topicToEngine,
  weeklyVisibility,
} from './data';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Deterministic formatters. `toLocaleString` resolves against the runtime's
 * locale data, which differs between the Node render and the browser — that
 * mismatch is a hydration error, so neither is used in rendered output.
 */
const thousands = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const shortDate = (iso: string) => {
  const [, m, d] = iso.split('-');
  return `${Number(d)} ${MONTHS[Number(m) - 1]}`;
};

/* ── Card shell ───────────────────────────────────────────────────────── */

function Card({
  eyebrow,
  title,
  note,
  source,
  wide,
  children,
}: {
  eyebrow: string;
  title: string;
  note?: string;
  source?: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={`csc-card${wide ? ' csc-card--wide' : ''}`}>
      <p className="csc-card-eyebrow">{eyebrow}</p>
      <h2 className="csc-card-title">{title}</h2>
      {note && <p className="csc-card-note">{note}</p>}
      <div className="csc-card-body">{children}</div>
      <p className="csc-source">{source ?? SOURCE_NOTE}</p>
    </section>
  );
}

/** Legend that names each series with the engine's own mark. */
function EngineLegend({ engines = ENGINES }: { engines?: typeof ENGINES }) {
  return (
    <div className="csc-legend">
      {engines.map((e) => (
        <span className="csc-legend-item" key={e.id}>
          <span className="csc-legend-rule" style={{ background: e.color }} />
          <EngineMark engine={e.id} size={14} />
          {e.label}
        </span>
      ))}
    </div>
  );
}

/**
 * Tooltip content for a multi-engine chart — the engine's own logo instead
 * of ChartTooltip's default plain colour dot, and the engine's real label
 * ("ChatGPT", "Google AI Overviews") instead of the raw data key
 * ("chatgpt", "googleAio"). `ChartTooltip` exposes a `content` render prop
 * for exactly this (see `chart-tooltip.tsx`), so this replaces the tooltip
 * body without touching the vendored component. Markup mirrors
 * `TooltipContent`'s own classes so it still matches the shared tooltip
 * chrome (background, padding, type scale) pixel for pixel.
 */
export function EngineTooltipContent({
  point,
  title,
  formatValue,
  engines = ENGINES,
}: {
  point: Record<string, unknown>;
  title?: string;
  formatValue: (value: number) => string;
  engines?: typeof ENGINES;
}) {
  return (
    <div className="overflow-hidden">
      <div className="px-3 py-2.5">
        {title && (
          <div className="mb-2 text-left font-medium text-chart-tooltip-foreground text-xs">
            {title}
          </div>
        )}
        <div className="space-y-1.5">
          {engines.map((engine) => {
            const value = point[engine.id];
            if (typeof value !== 'number') {
              return null;
            }
            return (
              <div className="flex items-center justify-between gap-4" key={engine.id}>
                <div className="flex items-center gap-2">
                  <EngineMark engine={engine.id} size={12} />
                  <span className="text-chart-tooltip-muted text-sm">{engine.label}</span>
                </div>
                <span className="font-medium text-chart-tooltip-foreground text-sm tabular-nums">
                  {formatValue(value)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * True only after the client has mounted. Used to gate anything that would
 * otherwise render differently between the server pass and the first client
 * pass (a hydration mismatch), without touching the chart component itself.
 */
function useIsMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

/**
 * Row labels for the two heatmaps, portalled into the chart's own left
 * margin and aligned with `useHeatmap()`'s real per-row geometry
 * (`yScale`/`binHeight`/`gap`) — the exact math HeatmapYAxis uses for its
 * (weekday) labels, just pointed at our own prompt names instead. This
 * replaces a hand-built CSS-grid label column that could not actually line
 * up with the chart's own cell rows (the row height was guessed in CSS, not
 * measured).
 */
function HeatmapPromptLabels({ prompts }: { prompts: string[] }) {
  const mounted = useIsMounted();
  const { containerRef, margin, binHeight, gap, yScale } = useHeatmap();
  const container = containerRef.current;
  if (!(mounted && container)) {
    return null;
  }
  return createPortal(
    prompts.map((label, row) => (
      <div
        className="pointer-events-none absolute"
        key={label}
        style={{
          top: margin.top + yScale(row) + (binHeight - gap) / 2,
          left: 4,
          width: Math.max(margin.left - 12, 0),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          transform: 'translateY(-50%)',
        }}
      >
        <span className="csc-heatmap-row-label" title={label}>
          {label}
        </span>
      </div>
    )),
    container
  );
}

/* ── Gallery ──────────────────────────────────────────────────────────── */

export function ChartGallery() {
  const mounted = useIsMounted();
  /* Time-series charts want real Date objects on the x axis. */
  const weeklySeries = useMemo(
    () =>
      weeklyVisibility.map((w) => ({
        date: new Date(`${w.week}T00:00:00Z`),
        visibility: Number((w.visibility * 100).toFixed(2)),
        answersTracked: w.answersTracked,
      })),
    []
  );

  const dailySeries = useMemo(
    () =>
      dailyByEngine.map((d) => ({
        date: new Date(`${d.date}T00:00:00Z`),
        chatgpt: Number((d.chatgpt * 100).toFixed(2)),
        perplexity: Number((d.perplexity * 100).toFixed(2)),
        googleAio: Number((d.googleAio * 100).toFixed(2)),
        position: d.chatgptPosition,
      })),
    []
  );

  /* Weekly bars for the reference-band recipe — label is the week's start. */
  const weeklyBars = useMemo(
    () =>
      weeklyVisibility.slice(-14).map((w) => ({
        week: shortDate(w.week),
        visibility: Number((w.visibility * 100).toFixed(2)),
      })),
    []
  );

  const monthlyDepth = useMemo(
    () =>
      monthlyCitedAnswers.map((m, i) => ({
        month: m.month,
        cited: m.cited,
        chatgpt: monthlyByEngine[i].cChatgpt,
        perplexity: monthlyByEngine[i].cPerplexity,
        googleAio: monthlyByEngine[i].cGoogleAio,
      })),
    []
  );

  /*
   * Heatmap columns are weeks; the bins inside each column are prompts.
   *
   * `getHeatmapContributionLevel()` inside the vendored HeatmapChart is
   * hard-wired to GitHub's own "contributions per day" bucketing —
   * count 0/1/2/3/4+ map to levels 0-4, with no prop to override it, and no
   * distinction beyond 4. Feeding it `visibility * 100` (0-100) meant nearly
   * every real cell (most weeks sit well above 4% visibility) landed on the
   * same top bucket, so the whole grid rendered as one flat block of the
   * darkest colour with almost no tonal variation. `* 6` instead keeps the
   * real relative differences between cells but lands the actual value
   * range mostly inside 0-4+, so it spreads legibly across all five levels
   * (checked against the full matrix: roughly 19/24/31/26/20 cells per
   * level). This only changes how the real numbers are BUCKETED for colour
   * — the underlying visibility values in data.ts are untouched.
   */
  const heatmapColumns = useMemo(
    () =>
      matrixWeeks.map((week, wi) => ({
        bin: wi,
        bins: promptWeekMatrix.map((row, pi) => ({
          bin: pi,
          count: Math.round(row.values[wi] * 6),
          date: new Date(`${week}T00:00:00Z`),
        })),
      })),
    []
  );

  const heatmapGradientLevels: HeatmapLevelStyles = [
    { color: 'var(--chart-scale-01)', fillMode: 'solid', pattern: 'none' },
    { color: 'var(--chart-scale-02)', fillMode: 'solid', pattern: 'none' },
    { color: 'var(--chart-scale-03)', fillMode: 'solid', pattern: 'none' },
    { color: 'var(--chart-scale-04)', fillMode: 'solid', pattern: 'none' },
    { color: 'var(--chart-scale-05)', fillMode: 'solid', pattern: 'none' },
  ];

  const heatmapPatternLevels: HeatmapLevelStyles = [
    { color: 'var(--chart-scale-01)', fillMode: 'solid', pattern: 'none' },
    { color: 'var(--chart-scale-02)', fillMode: 'solid', pattern: 'none' },
    {
      color: 'var(--chart-scale-03)',
      fillMode: 'pattern',
      pattern: 'diagonal',
      patternColor: 'var(--chart-scale-pattern-color)',
    },
    { color: 'var(--chart-scale-04)', fillMode: 'solid', pattern: 'none' },
    { color: 'var(--chart-scale-05)', fillMode: 'solid', pattern: 'none' },
  ];

  /* Sankey: five topic nodes feeding three engine nodes. */
  const sankeyData = useMemo(() => {
    const nodes = [
      ...topicToEngine.map((t) => ({ name: t.topic, category: 'source' as const })),
      ...ENGINES.map((e) => ({ name: e.label, category: 'outcome' as const })),
    ];
    const engineOffset = topicToEngine.length;
    const links = topicToEngine.flatMap((t, ti) =>
      ENGINES.map((e, ei) => ({ source: ti, target: engineOffset + ei, value: t[e.id] })).filter(
        (l) => l.value > 0
      )
    );
    return { nodes, links };
  }, []);

  const totalAugustMentions = augustMentionsByEngine.reduce((s, m) => s + m.mentions, 0);

  return (
    <div className="csc-grid">
      {/* 1 ─ Area, dot-grid background ─────────────────────────────────── */}
      <Card
        wide
        eyebrow="Area chart · dot grid background"
        title="Share of AI answers that mention LoudFace, weekly"
        note="Twenty weeks, April to August 2026. Each point is the share of every tracked AI answer in our category that named us that week."
      >
        <AreaChart
          margin={{ top: 8, right: 8, bottom: 40, left: 8 }}
          data={weeklySeries}
          aspectRatio="2.75 / 1"
        >
          <Background pattern="dots" opacity={0.85} />
          <Area dataKey="visibility" fillOpacity={0.3} strokeWidth={2} />
          <XAxis />
          <ChartTooltip />
        </AreaChart>
      </Card>

      {/* 2 ─ Bar, reference band ───────────────────────────────────────── */}
      <Card
        eyebrow="Bar chart · reference band"
        title="The plateau we now hold"
        note={`The band is the 11.4%–13.6% range of the last three complete weeks — measured, not a target. Fourteen weeks shown.`}
      >
        <BarChart
          margin={{ top: 8, right: 8, bottom: 40, left: 8 }}
          data={weeklyBars}
          xDataKey="week"
          aspectRatio="16 / 10"
        >
          <ReferenceArea
            y1={augustOperatingRange.low * 100}
            y2={augustOperatingRange.high * 100}
            strokeStyle="dashed"
            showMarkers
          />
          <Bar dataKey="visibility" lineCap="round" />
          <BarXAxis />
          <ChartTooltip showCrosshair={false} />
        </BarChart>
      </Card>

      {/* 3 ─ Bar, 3D depth ─────────────────────────────────────────────── */}
      <Card
        eyebrow="Bar chart · 3D depth"
        title="AI answers that cited us, by month"
        note="Counted across ChatGPT, Perplexity and Google AI Overviews. The line traces the same values."
      >
        <BarChart
          margin={{ top: 8, right: 8, bottom: 40, left: 8 }}
          data={monthlyDepth}
          xDataKey="month"
          aspectRatio="16 / 10"
        >
          <Grid horizontal />
          <BarDepthBack dataKey="cited" color="var(--chart-1)" />
          <Bar dataKey="cited" fill="var(--chart-1)" perspective />
          <BarDepthFront dataKey="cited" />
          <BarXAxis />
          <ChartTooltip showCrosshair={false} showDots={false} />
          <BarLineIndicator valueKey="cited" stroke="var(--chart-foreground)" offset={10} />
        </BarChart>
      </Card>

      {/* 4 ─ Bar, grouped ──────────────────────────────────────────────── */}
      {/*
       * Was "3D stacked" (BarDepthProvider + stacked <Bar>s). Dropped after
       * finding a real bug in the vendored BarChart: for `stacked` bars,
       * `<Bar>`'s y-scale comes from `yScales` (bar-chart.tsx's
       * `buildYScalesForLines`), whose `resolveDomain` takes the max of a
       * SINGLE series' values across the dataset — it never sums a
       * category's stacked total. So a month whose three engines summed to
       * more than the single biggest engine-value anywhere in the dataset
       * (June: 724 combined vs. 336 as the tallest single bar, Aug: 784 vs.
       * 336) drew past the top of its own plot and, since the container is
       * `overflow-visible`, painted straight over the card's own title.
       * `maxValue`/`valueScale` a few lines above it in the same file DO sum
       * correctly, but `<Bar>` never reads them for a default-axis id — the
       * `?? valueScale` fallback can't fire because `yScales["left"]` always
       * exists once any `<Bar>` renders. There is no prop to point `<Bar>`
       * at the correct scale, and an invisible "sizing" bar to inflate the
       * domain would add its own real height to the same stack it's meant
       * to fix — so this can't be solved from the gallery side while
       * keeping `stacked`. Grouped bars use the exact same `resolveDomain`
       * (max of a single series) — which is what grouped bars actually
       * need — so the bug simply doesn't apply here. No BarDepthBack/Front:
       * that recipe assumes one bar per category (bandX/bandWidth are the
       * whole category band, not a series' own slot inside it), so it can't
       * be reused for three grouped bars without the same misalignment.
       */}
      <Card
        wide
        eyebrow="Bar chart · grouped"
        title="Which engine started citing us — the handover to ChatGPT"
        note="Google AI Overviews carried us first. In August ChatGPT overtook it and became the largest single source of citations."
      >
        <EngineLegend />
        <BarChart
          margin={{ top: 8, right: 8, bottom: 40, left: 8 }}
          data={monthlyDepth}
          xDataKey="month"
          aspectRatio="2.6 / 1"
        >
          <Grid horizontal />
          <Bar dataKey="chatgpt" fill="var(--chart-1)" />
          <Bar dataKey="perplexity" fill="var(--chart-2)" />
          <Bar dataKey="googleAio" fill="var(--chart-3)" />
          <BarXAxis />
          <ChartTooltip
            showCrosshair={false}
            showDots={false}
            content={({ point }) => (
              <EngineTooltipContent
                point={point}
                title={String(point.month)}
                formatValue={(v) => `${Math.round(v)}`}
              />
            )}
          />
        </BarChart>
      </Card>

      {/* 5 ─ Funnel, pattern fill ──────────────────────────────────────── */}
      <Card
        eyebrow="Funnel · diagonal pattern fill"
        title="From tracked prompt to owned prompt"
        note="Of the 90 buyer prompts we track, AI names us in 56 — and on 21 of those we hold at least a fifth of every answer given."
      >
        {/*
         * `showLabels` (the stage name under each segment) is off: it is
         * `whitespace-nowrap` positioned inside that segment's own (equal)
         * width slice, so on a half-width card the two longer stage names
         * overflowed into their neighbour and collided into unreadable
         * overlapping text. A CSS grid below the chart gives each name a
         * bounded, WRAPPING box instead, at any card or viewport width.
         * `showPercentage` stays — the badge itself was fine once
         * `--background` was defined above (it was rendering dark-on-dark
         * only because that token was missing, not because of the layout).
         */}
        <FunnelChart
          color="var(--chart-1)"
          data={promptFunnel}
          layers={3}
          showLabels={false}
          renderPattern={(id, color) => (
            <PatternLines
              background={color}
              height={8}
              id={id}
              orientation={['diagonal']}
              stroke="rgba(255,255,255,0.35)"
              strokeWidth={2}
              width={8}
            />
          )}
        />
        <div
          className="csc-funnel-labels"
          style={{ '--csc-funnel-stage-count': promptFunnel.length } as React.CSSProperties}
        >
          {promptFunnel.map((stage) => (
            <span className="csc-funnel-label" key={stage.label}>
              {stage.label}
            </span>
          ))}
        </div>
      </Card>

      {/* 6 ─ Gauge ─────────────────────────────────────────────────────── */}
      <Card
        eyebrow="Gauge · notch arc"
        title="Peak weekly AI visibility"
        note={`Our best week of the year, in the week of 10 August. That standing puts us ${categoryRank.position}th of ${categoryRank.outOf} agencies tracked in the category.`}
      >
        <Gauge
          centerValue={peakWeeklyVisibility}
          defaultLabel="Peak weekly AI visibility"
          formatOptions={{ style: 'percent', maximumFractionDigits: 2 }}
          inactiveFillOpacity={0.4}
          spacing={25}
          value={peakWeeklyVisibility * 100}
        />
        <div className="csc-stat-row">
          <div>
            <p className="csc-stat-label">Mean rank when cited</p>
            <p className="csc-stat-value">{meanCitedPosition}</p>
          </div>
          <div>
            <p className="csc-stat-label">Category standing</p>
            <p className="csc-stat-value">
              {categoryRank.position}
              <span style={{ fontSize: '0.875rem', color: '#6b6790' }}> / {categoryRank.outOf}</span>
            </p>
          </div>
        </div>
      </Card>

      {/* 7 ─ Heatmap, gradient legend ──────────────────────────────────── */}
      <Card
        eyebrow="Heatmap · gradient legend"
        title="Every buyer prompt, week by week"
        note="Ten prompts down, twelve weeks across. Darker means AI named us in more of that week's answers. The two bottom rows start black — those are prompts we did not appear on at all until late July."
      >
        {/*
         * `HeatmapYAxis` is dropped — it is hard-wired to
         * `getHeatmapDayLabels()`, i.e. Mon–Sun, because the vendored
         * HeatmapChart is built as a GitHub-contributions CALENDAR (columns
         * = weeks, rows = weekdays). Our rows are PROMPTS, not weekdays, so
         * those "M / W / F" ticks were actively wrong, not just decorative.
         * The old fix (a hand-built `.csc-matrix` label column in CSS) also
         * didn't work: its row height was a CSS guess, not the chart's real
         * per-row geometry, so the names floated unanchored beside the
         * grid. `HeatmapPromptLabels` (defined above) reads the actual
         * geometry via the library's own `useHeatmap()` hook and portals
         * real prompt names into the chart's left margin at the exact same
         * y as each row — same approach HeatmapYAxis itself uses, just
         * pointed at our labels instead of weekday letters.
         */}
        <div className="csc-scroll">
          <div className="csc-heatmap-frame">
            <HeatmapChart
              data={heatmapColumns}
              gap={4}
              binSize={20}
              layout="fluid"
              levelStyles={heatmapGradientLevels}
              margin={{ top: 24, right: 8, bottom: 24, left: 180 }}
            >
              <HeatmapCells />
              <HeatmapXAxis />
              <HeatmapPromptLabels prompts={promptWeekMatrix.map((r) => r.prompt)} />
              <HeatmapTooltip />
            </HeatmapChart>
          </div>
        </div>
        <HeatmapLegend
          align="center"
          variant="gradient"
          lessLabel="Rarely cited"
          moreLabel="Cited in most answers"
          fontSize={12}
          labelClassName="csc-card-note"
          levelStyles={heatmapGradientLevels}
          gap={3}
        />
      </Card>

      {/* 8 ─ Heatmap, pattern levels ───────────────────────────────────── */}
      <Card
        eyebrow="Heatmap · pattern levels"
        title="The same twelve weeks, banded"
        note="Identical data to the chart above. The hatched band marks the middle tier, so the step from 'occasionally cited' to 'usually cited' is legible without relying on colour."
      >
        <div className="csc-scroll">
          <div className="csc-heatmap-frame">
            <HeatmapChart
              data={heatmapColumns}
              gap={4}
              binSize={20}
              layout="fluid"
              levelStyles={heatmapPatternLevels}
              margin={{ top: 24, right: 8, bottom: 24, left: 180 }}
            >
              <HeatmapCells />
              <HeatmapXAxis />
              <HeatmapPromptLabels prompts={promptWeekMatrix.map((r) => r.prompt)} />
              <HeatmapTooltip />
            </HeatmapChart>
          </div>
        </div>
        <HeatmapLegend align="center" gap={3} levelStyles={heatmapPatternLevels} />
      </Card>

      {/* 9 ─ Line trio with brush ──────────────────────────────────────── */}
      <Card
        wide
        eyebrow="Line chart · trio"
        title="Thirty days, three engines"
        note="Daily visibility per engine. The ChatGPT line lifts sharply from 13 August and holds — that is the week our AEO pages started being cited directly."
      >
        <EngineLegend />
        {/*
          * No brush. The drag-to-zoom strip was removed on Arnel's call
          * (2026-08-31): thirty daily points read fine unzoomed, and the strip
          * ate the bottom of the plot. The chart is the plain LineChart trio.
          */}
        <LineChart data={dailySeries} aspectRatio="2.75 / 1">
          <Background pattern="dots" opacity={0.85} />
          <Line dataKey="chatgpt" curve={curveCatmullRom} fadeEdges strokeWidth={2} stroke="var(--chart-1)" />
          <Line dataKey="perplexity" curve={curveCatmullRom} fadeEdges strokeWidth={2} stroke="var(--chart-2)" />
          <Line dataKey="googleAio" curve={curveCatmullRom} fadeEdges strokeWidth={2} stroke="var(--chart-3)" />
          <XAxis />
          <ChartTooltip
            content={({ point }) => (
              <EngineTooltipContent
                point={point}
                title={
                  point.date instanceof Date
                    ? point.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                    : undefined
                }
                formatValue={(v) => `${v.toFixed(1)}%`}
              />
            )}
          />
        </LineChart>
      </Card>

      {/* 10 ─ Radar, minimal ───────────────────────────────────────────── */}
      <Card
        eyebrow="Radar chart · minimal"
        title="June against August, prompt by prompt"
        note="Six buyer prompts. The outer shape is where we sit now; the inner one is where we sat in June. One prompt went backwards — fintech payroll — and it is the one we are working on."
      >
        <RadarChart
          data={[
            {
              label: 'August 2026',
              color: 'var(--chart-1)',
              values: Object.fromEntries(radarPrompts.map((p) => [p.label, p.august * 100])),
            },
            {
              label: 'June 2026',
              color: 'var(--chart-3)',
              values: Object.fromEntries(radarPrompts.map((p) => [p.label, p.june * 100])),
            },
          ]}
          levels={3}
          metrics={radarPrompts.map((p) => ({ key: p.label, label: p.label }))}
          size={280}
        >
          <RadarGrid showLabels={false} />
          <RadarLabels />
          {[0, 1].map((i) => (
            <RadarArea index={i} key={i} showPoints={false} />
          ))}
        </RadarChart>
      </Card>

      {/* 11 ─ Ring, flat caps ──────────────────────────────────────────── */}
      <Card
        eyebrow="Ring chart · flat caps"
        title="Where our August mentions came from"
        note={`${thousands(totalAugustMentions)} mentions in total. ChatGPT alone accounts for half.`}
      >
        {mounted ? (
          <RingChart
            data={augustMentionsByEngine.map((m, i) => ({
              label: m.label,
              value: m.mentions,
              maxValue: totalAugustMentions,
              color: `var(--chart-${i + 1})`,
            }))}
            size={250}
          >
            {augustMentionsByEngine.map((m, index) => (
              <Ring index={index} key={m.engine} lineCap="butt" />
            ))}
            <RingCenter defaultLabel="Mentions" />
          </RingChart>
        ) : (
          // Same-sized placeholder for the server pass — RingCenter's number
          // goes through NumberFlow (chart-stat-flow.tsx), which reads a
          // `useNumberFlowElementReady()` hook that is false on the server
          // and true on the client, so the two passes render different
          // markup for the exact same number and React logs a hydration
          // mismatch. Rendering the real chart only after mount removes the
          // mismatch without touching the vendored component; the
          // placeholder keeps the card's layout height stable so nothing
          // jumps in on mount.
          <div style={{ width: 250, height: 250 }} aria-hidden="true" />
        )}
        <div className="csc-legend" style={{ marginTop: '1rem', marginBottom: 0 }}>
          {augustMentionsByEngine.map((m, i) => (
            <span className="csc-legend-item" key={m.engine}>
              <span className="csc-legend-rule" style={{ background: `var(--chart-${i + 1})` }} />
              <EngineMark engine={m.engine} size={14} />
              {m.label} · {Math.round((m.mentions / totalAugustMentions) * 100)}%
            </span>
          ))}
        </div>
      </Card>

      {/* 12 ─ Sankey, simple ───────────────────────────────────────────── */}
      <Card
        wide
        eyebrow="Sankey chart · simple"
        title="Which topics earn which engine's citations"
        note="Our AEO writing is what ChatGPT quotes. Perplexity is the only engine that reliably cites the Webflow work. Ribbon width is the number of mentions in August."
      >
        {/*
         * `labelOrientation="vertical"` rotates each label 90° and centres
         * it on its own node — fine when nodes are tall, but three of the
         * five source nodes here are tiny (Webflow/Competitor/Converting
         * sum to well under a tenth of the total), so their rotated labels,
         * which occupy their full TEXT LENGTH vertically, overlapped their
         * neighbours into an unreadable smear. "horizontal" labels occupy
         * only a line-height vertically, which fits even these small nodes.
         * Margins widened to the component's own default (180/180 — see
         * `DEFAULT_MARGIN` in sankey-chart.tsx) since horizontal labels need
         * real width, not height, and a `min-width` + scroll wrapper (below)
         * keeps that from crushing the chart on mobile.
         */}
        <div className="csc-scroll">
          <div className="csc-sankey-frame">
            <SankeyChart
              data={sankeyData}
              margin={{ top: 24, right: 170, bottom: 40, left: 210 }}
              nodePadding={24}
              nodeWidth={12}
              aspectRatio="2.2 / 1"
            >
              <SankeyLink strokeOpacity={0.5} />
              {/*
               * `showValueLabels` (default true) prints "<N> sessions" under
               * each node name — wrong unit (these are AI-answer mentions,
               * not sessions) with no prop to change the word. Turned off
               * here; the real count is still available in the tooltip via
               * `nodeContent` above, labelled correctly as "Mentions".
               */}
              <SankeyNode lineCap={3} labelOrientation="horizontal" showValueLabels={false} />
              <SankeyTooltip
                nodeContent={({ node }) => (
                  <TooltipContent
                    rows={[
                      {
                        color: 'var(--chart-line-primary)',
                        label: 'Mentions',
                        value: Math.round(node.value ?? 0),
                      },
                    ]}
                    title={node.name}
                  />
                )}
              />
            </SankeyChart>
          </div>
        </div>
      </Card>

      {/* 13 ─ Scatter, biaxial ─────────────────────────────────────────── */}
      <Card
        wide
        eyebrow="Scatter chart · left and right Y axes"
        title="Did rank hold as visibility climbed?"
        note="Left axis: our share of ChatGPT answers each day. Right axis: the mean position we hold inside the answers that cite us. Visibility roughly trebled while rank stayed near 3 — we got cited more without getting pushed down the list."
      >
        <div className="csc-legend">
          <span className="csc-legend-item">
            <span className="csc-legend-rule" style={{ background: 'var(--chart-1)' }} />
            <OpenAIMark size={14} /> Share of ChatGPT answers (left)
          </span>
          <span className="csc-legend-item">
            <span className="csc-legend-rule" style={{ background: 'var(--chart-3)' }} />
            Mean rank when cited (right)
          </span>
        </div>
        <ScatterChart data={dailySeries} margin={{ top: 8, right: 56, bottom: 40, left: 56 }}>
          <Grid horizontal />
          <Scatter dataKey="chatgpt" yAxisId="left" />
          <Scatter dataKey="position" yAxisId="right" stroke="var(--chart-3)" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <XAxis />
          <ChartTooltip />
        </ScatterChart>
      </Card>
    </div>
  );
}

/**
 * Engine chips for the page header. No colour swatch — each engine's own
 * logo already identifies it here (nothing on this strip encodes a chart
 * series colour), so a dot in front of it was decoration with no job.
 * Removed per the house taste law against decorative status dots.
 */
export function EngineStrip() {
  return (
    <div className="csc-engines">
      <span className="csc-engine">
        <OpenAIMark size={15} /> ChatGPT
      </span>
      <span className="csc-engine">
        <PerplexityMark size={15} /> Perplexity
      </span>
      <span className="csc-engine">
        <GoogleMark size={15} /> Google AI Overviews
      </span>
    </div>
  );
}
