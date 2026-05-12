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

/* ── Main export ───────────────────────────────────────────── */

export function CaseStudyCharts({
  charts,
  accentColor = 'var(--color-primary-500)',
}: CaseStudyChartsProps) {
  if (!charts || charts.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {charts.map((chart, i) => (
        <div
          key={i}
          className="rounded-xl border border-surface-200 bg-white p-4 sm:p-6"
        >
          <h3 className="text-sm font-medium text-surface-900 mb-4">
            {chart.title}
          </h3>
          {chart.chartType === 'horizontalBar' ? (
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
      ))}
    </div>
  );
}
