/**
 * CaseStudyCharts — lightweight, server-rendered chart component
 *
 * Zero client JS. Pure div-based vertical bars styled with Tailwind + inline heights.
 * Two chart types:
 *   - barComparison: grouped vertical bars (two series side-by-side per group)
 *   - horizontalBar: single-series vertical bars
 *
 * Accent color defaults to the case study's client color.
 */

import type { CaseStudyChart } from '@/lib/types';

interface CaseStudyChartsProps {
  charts: CaseStudyChart[];
  accentColor?: string;
}

const BAR_HEIGHT = 200;

/* ── Vertical Bar Chart (single series) ────────────────────── */

function VerticalBarChart({
  data,
  accentColor,
}: {
  data: CaseStudyChart['data'];
  accentColor: string;
}) {
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div
      className="flex items-end gap-3 sm:gap-4"
      role="img"
      aria-label="Vertical bar chart"
      style={{ height: `${BAR_HEIGHT}px` }}
    >
      {data.map((item, i) => {
        const pct = maxValue > 0 ? (item.value / maxValue) * 100 : 0;

        return (
          <div key={i} className="flex-1 flex flex-col items-center justify-end h-full min-w-0">
            {/* Value label */}
            <span className="text-xs font-medium text-surface-900 mb-1.5 tabular-nums">
              {item.displayValue || item.value.toLocaleString()}
            </span>
            {/* Bar */}
            <div
              className="w-full max-w-16 rounded-t"
              style={{
                height: `${Math.max(pct, 2)}%`,
                backgroundColor: accentColor,
                minHeight: '6px',
              }}
            />
            {/* Label */}
            <span className="mt-2 text-2xs sm:text-xs text-surface-500 text-center leading-tight w-full">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Vertical Grouped Bar Chart (two series) ───────────────── */

function VerticalGroupedBarChart({
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
      {/* Legend */}
      {(legendPrimary || legendSecondary) && (
        <div className="flex items-center gap-4 mb-6">
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

      {/* Chart area */}
      <div
        className="flex items-end gap-2 sm:gap-6"
        role="img"
        aria-label="Grouped bar chart"
        style={{ height: `${BAR_HEIGHT}px` }}
      >
        {data.map((item, i) => {
          const primaryPct = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          const secondaryPct =
            maxValue > 0 ? ((item.secondaryValue ?? 0) / maxValue) * 100 : 0;

          return (
            <div key={i} className="flex-1 flex flex-col items-center min-w-0 h-full">
              {/* Bar pair */}
              <div className="flex items-end gap-1 w-full h-full justify-center">
                {/* Primary (before) */}
                <div className="flex flex-col items-center justify-end h-full flex-1 max-w-8">
                  <span className="text-2xs font-medium text-surface-400 mb-1 tabular-nums hidden sm:block">
                    {item.displayValue || item.value.toLocaleString()}
                  </span>
                  <div
                    className="w-full rounded-t"
                    style={{
                      height: `${Math.max(primaryPct, 2)}%`,
                      backgroundColor: accentColor,
                      opacity: 0.3,
                      minHeight: '4px',
                    }}
                  />
                </div>
                {/* Secondary (after) */}
                <div className="flex flex-col items-center justify-end h-full flex-1 max-w-8">
                  <span className="text-2xs font-medium text-surface-900 mb-1 tabular-nums hidden sm:block">
                    {item.secondaryDisplayValue ||
                      (item.secondaryValue ?? 0).toLocaleString()}
                  </span>
                  <div
                    className="w-full rounded-t"
                    style={{
                      height: `${Math.max(secondaryPct, 2)}%`,
                      backgroundColor: accentColor,
                      minHeight: '4px',
                    }}
                  />
                </div>
              </div>
              {/* Label */}
              <span className="mt-2 text-2xs sm:text-xs text-surface-500 text-center leading-tight w-full">
                {item.label}
              </span>
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
            <VerticalBarChart data={chart.data} accentColor={accentColor} />
          ) : (
            <VerticalGroupedBarChart
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
