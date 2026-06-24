/**
 * CaseStudyCharts — lightweight, server-rendered chart component
 *
 * Zero client JS. Pure div-based horizontal bars styled with Tailwind +
 * inline widths. Two chart types:
 *   - horizontalBar: single-series horizontal bars (rows stacked top-to-bottom)
 *   - barComparison: grouped horizontal bars (two stacked bars per row, before/after)
 *
 * Both types share the same label-column-on-the-left layout so long category
 * labels (prompt names, competitor names, page paths) wrap naturally instead
 * of cramping under narrow vertical columns.
 *
 * Accent color defaults to the case study's client color.
 */

import type { CaseStudyChart } from '@/lib/types';

interface CaseStudyChartsProps {
  charts: CaseStudyChart[];
  accentColor?: string;
}

/* ── Horizontal Bar Chart (single series, true horizontal layout) ── */

function HorizontalBarChart({
  data,
  accentColor,
}: {
  data: CaseStudyChart['data'];
  accentColor: string;
}) {
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className="space-y-2.5" role="img" aria-label="Horizontal bar chart">
      {data.map((item, i) => {
        const pct = maxValue > 0 ? (item.value / maxValue) * 100 : 0;

        return (
          <div
            key={i}
            className="grid grid-cols-[minmax(0,_42%)_1fr] sm:grid-cols-[minmax(120px,_38%)_1fr] gap-2 sm:gap-3 items-center"
          >
            <span className="text-2xs sm:text-xs text-surface-600 leading-tight pr-1">
              {item.label}
            </span>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 h-5 bg-surface-100 rounded overflow-hidden">
                <div
                  className="h-full rounded"
                  style={{
                    width: `${Math.max(pct, 2)}%`,
                    backgroundColor: accentColor,
                    minWidth: '4px',
                  }}
                />
              </div>
              <span className="text-2xs sm:text-xs font-medium text-surface-900 tabular-nums shrink-0 w-10 text-right">
                {item.displayValue || item.value.toLocaleString()}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Horizontal Grouped Bar Chart (two series, stacked per row) ── */

function HorizontalGroupedBarChart({
  data,
  legendPrimary,
  legendSecondary,
  accentColor,
}: {
  data: CaseStudyChart['data'];
  legendPrimary?: string;
  legendSecondary?: string;
  accentColor: string;
}) {
  const allValues = data.flatMap((d) => [d.value, d.secondaryValue ?? 0]);
  const maxValue = Math.max(...allValues);

  return (
    <div>
      {(legendPrimary || legendSecondary) && (
        <div className="flex items-center gap-4 mb-4">
          {legendPrimary && (
            <div className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: accentColor, opacity: 0.3 }}
              />
              <span className="text-xs text-surface-500">{legendPrimary}</span>
            </div>
          )}
          {legendSecondary && (
            <div className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: accentColor }}
              />
              <span className="text-xs text-surface-500">{legendSecondary}</span>
            </div>
          )}
        </div>
      )}

      <div className="space-y-3.5" role="img" aria-label="Grouped horizontal bar chart">
        {data.map((item, i) => {
          const primaryPct = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          const secondaryPct =
            maxValue > 0 ? ((item.secondaryValue ?? 0) / maxValue) * 100 : 0;

          return (
            <div
              key={i}
              className="grid grid-cols-[minmax(0,_42%)_1fr] sm:grid-cols-[minmax(120px,_38%)_1fr] gap-2 sm:gap-3 items-center"
            >
              <span className="text-2xs sm:text-xs text-surface-600 leading-tight pr-1">
                {item.label}
              </span>
              <div className="space-y-1">
                {/* Primary (before) */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 h-3 bg-surface-100 rounded overflow-hidden">
                    <div
                      className="h-full rounded"
                      style={{
                        width: `${Math.max(primaryPct, 1)}%`,
                        backgroundColor: accentColor,
                        opacity: 0.3,
                        minWidth: '4px',
                      }}
                    />
                  </div>
                  <span className="text-2xs sm:text-xs font-medium text-surface-500 tabular-nums shrink-0 w-10 text-right">
                    {item.displayValue || item.value.toLocaleString()}
                  </span>
                </div>
                {/* Secondary (after) */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 h-3 bg-surface-100 rounded overflow-hidden">
                    <div
                      className="h-full rounded"
                      style={{
                        width: `${Math.max(secondaryPct, 1)}%`,
                        backgroundColor: accentColor,
                        minWidth: '4px',
                      }}
                    />
                  </div>
                  <span className="text-2xs sm:text-xs font-medium text-surface-900 tabular-nums shrink-0 w-10 text-right">
                    {item.secondaryDisplayValue ||
                      (item.secondaryValue ?? 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Growth Curve (SVG area + line, axis-free) ───────────────── */
/* Shows the SHAPE of a trend (up-and-to-the-right) with no y-axis numbers,
   so a client's exact growth rate stays private. x-labels (e.g. months) only. */

function GrowthCurveChart({
  data,
  accentColor,
  gradientId,
}: {
  data: CaseStudyChart['data'];
  accentColor: string;
  gradientId: string;
}) {
  const W = 600;
  const H = 200;
  const padX = 12;
  const padTop = 20;
  const padBottom = 26;
  const baselineY = H - padBottom;
  const n = data.length;

  const values = data.map((d) => d.value);
  const vmin = Math.min(...values);
  const vmax = Math.max(...values);
  const span = vmax - vmin || 1;

  const pts = data.map((d, i) => {
    const x = n > 1 ? padX + (i * (W - 2 * padX)) / (n - 1) : W / 2;
    const t = (d.value - vmin) / span;
    const y = baselineY - t * (baselineY - padTop);
    return { x, y };
  });

  // Catmull-Rom → cubic bezier for a smooth curve
  let linePath = pts.length ? `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}` : '';
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    linePath += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  const areaPath = pts.length
    ? `${linePath} L ${pts[n - 1].x.toFixed(1)} ${baselineY} L ${pts[0].x.toFixed(1)} ${baselineY} Z`
    : '';

  return (
    <div role="img" aria-label={`Growth curve trending upward${data[0]?.label ? ` from ${data[0].label} to ${data[n - 1].label}` : ''}${data[0]?.displayValue && data[n - 1]?.displayValue ? `, indexed ${data[0].displayValue} to ${data[n - 1].displayValue}` : ''}`}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accentColor} stopOpacity="0.28" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1={padX} y1={baselineY} x2={W - padX} y2={baselineY} stroke="#e5e7eb" strokeWidth="1" />
        {areaPath && <path d={areaPath} fill={`url(#${gradientId})`} />}
        {linePath && (
          <path d={linePath} fill="none" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        )}
        {pts.map((p, i) => {
          const last = i === pts.length - 1;
          const dv = data[i]?.displayValue;
          return (
            <g key={i}>
              {/* Native SVG tooltip — zero JS, in-DOM (readable by AI + screen readers).
                  Only points with a real displayValue get one; smoothed/illustrative
                  points are left without, so no invented data is shown on hover. */}
              {dv ? <title>{`${data[i].label ? `${data[i].label}: ` : ''}${dv}`}</title> : null}
              <circle cx={p.x} cy={p.y} r={last ? 5 : 3} fill={accentColor} stroke="#ffffff" strokeWidth={last ? 2 : 0} />
            </g>
          );
        })}
        {/* Visible endpoint index values (only where provided) — anchors the curve
            with real start/end numbers so it reads as data, not decoration. */}
        {n > 1 &&
          [0, n - 1].map((idx) =>
            data[idx]?.displayValue ? (
              <text
                key={`v${idx}`}
                x={pts[idx].x}
                y={Math.max(pts[idx].y - 9, 13)}
                textAnchor={idx === 0 ? 'start' : 'end'}
                fill={accentColor}
                style={{ fontSize: '12px', fontWeight: 600 }}
              >
                {data[idx].displayValue}
              </text>
            ) : null
          )}
        {data.map((d, i) =>
          d.label ? (
            <text key={`l${i}`} x={pts[i].x} y={H - 8} textAnchor="middle" fill="#6b7280" style={{ fontSize: '11px' }}>
              {d.label}
            </text>
          ) : null
        )}
      </svg>
    </div>
  );
}

/* ── Main export ───────────────────────────────────────────── */

export function CaseStudyCharts({
  charts,
  accentColor = 'var(--color-primary-500)',
}: CaseStudyChartsProps) {
  if (!charts || charts.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {charts.map((chart, i) => {
        const isCurve = chart.chartType === 'growthCurve';
        return (
          <div
            key={i}
            className={`rounded-xl border border-surface-200 bg-white p-4 sm:p-6 ${isCurve ? 'sm:col-span-2' : ''}`}
          >
            <h3 className="text-sm font-medium text-surface-900 mb-4">
              {chart.title}
            </h3>
            {isCurve ? (
              <>
                <GrowthCurveChart data={chart.data} accentColor={accentColor} gradientId={`gc-grad-${i}`} />
                {chart.legendPrimary && (
                  <p className="mt-2 text-2xs sm:text-xs text-surface-400 italic">{chart.legendPrimary}</p>
                )}
              </>
            ) : chart.chartType === 'horizontalBar' ? (
              <HorizontalBarChart data={chart.data} accentColor={accentColor} />
            ) : (
              <HorizontalGroupedBarChart
                data={chart.data}
                legendPrimary={chart.legendPrimary}
                legendSecondary={chart.legendSecondary}
                accentColor={accentColor}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
