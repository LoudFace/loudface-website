/**
 * BlogChart — server-rendered, zero-client-JS chart for blog visuals.
 *
 * Follows the same div-based rendering approach as CaseStudyCharts for SEO and
 * performance. Numbers render in the DOM so crawlers read them.
 */

import type { BlogVisualChart } from '@/lib/types';

interface BlogChartProps {
  chart: BlogVisualChart;
  alt: string;
  caption?: string;
}

const BAR_HEIGHT = 220;

export function BlogChart({ chart, alt, caption }: BlogChartProps) {
  return (
    <figure className="my-10 rounded-xl border border-surface-200 bg-surface-50/50 p-6 md:p-8" aria-label={alt}>
      {chart.title && (
        <figcaption className="mb-6">
          <h3 className="text-base md:text-lg font-medium text-surface-900">{chart.title}</h3>
          {chart.yAxis && (
            <p className="mt-1 text-xs text-surface-500">{chart.yAxis}</p>
          )}
        </figcaption>
      )}

      <div className="min-w-0">
        {chart.kind === 'bar' && <VerticalBars data={chart.data} />}
        {chart.kind === 'horizontalBar' && <HorizontalBars data={chart.data} />}
        {chart.kind === 'stat' && <Stat data={chart.data} />}
        {chart.kind === 'table' && <DataTable data={chart.data} xAxis={chart.xAxis} yAxis={chart.yAxis} />}
      </div>

      {(chart.source || caption) && (
        <div className="mt-5 pt-4 border-t border-surface-200 text-xs text-surface-500 space-y-1">
          {caption && <p className="text-surface-600">{caption}</p>}
          {chart.source && (
            <p>
              Source:{' '}
              {chart.sourceUrl ? (
                <a href={chart.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline decoration-surface-300 hover:decoration-surface-500">
                  {chart.source}
                </a>
              ) : (
                chart.source
              )}
            </p>
          )}
        </div>
      )}
    </figure>
  );
}

/* ── Vertical Bars ──────────────────────────────────────────── */

function VerticalBars({ data }: { data: BlogVisualChart['data'] }) {
  const hasSeries = data.some((d) => d.series);
  if (hasSeries) return <VerticalGroupedBars data={data} />;

  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div
      className="flex items-end gap-3 sm:gap-4"
      role="img"
      style={{ height: `${BAR_HEIGHT}px` }}
    >
      {data.map((item, i) => {
        const pct = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
        return (
          <div key={i} className="flex-1 flex flex-col items-center justify-end h-full min-w-0">
            <span className="text-xs font-medium text-surface-900 mb-1.5 tabular-nums">
              {formatValue(item.value, item.unit)}
            </span>
            <div
              className="w-full max-w-20 rounded-t"
              style={{
                height: `${Math.max(pct, 2)}%`,
                backgroundColor: 'var(--color-primary-500)',
                minHeight: '6px',
              }}
            />
            <span className="mt-2 text-2xs sm:text-xs text-surface-500 text-center leading-tight w-full">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function VerticalGroupedBars({ data }: { data: BlogVisualChart['data'] }) {
  const groups = new Map<string, BlogVisualChart['data']>();
  for (const d of data) {
    const key = d.label;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(d);
  }

  const allSeries = Array.from(new Set(data.map((d) => d.series).filter(Boolean))) as string[];
  const maxValue = Math.max(...data.map((d) => d.value));

  const colors = ['var(--color-primary-500)', 'var(--color-surface-700)'];

  return (
    <div>
      {allSeries.length > 0 && (
        <div className="flex gap-4 mb-4 text-xs text-surface-600">
          {allSeries.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: colors[i % colors.length] }} />
              {s}
            </div>
          ))}
        </div>
      )}
      <div
        className="flex items-end gap-4 sm:gap-6"
        role="img"
        style={{ height: `${BAR_HEIGHT}px` }}
      >
        {Array.from(groups.entries()).map(([label, items]) => (
          <div key={label} className="flex-1 flex flex-col items-center justify-end h-full min-w-0">
            <div className="flex items-end gap-1.5 w-full h-full justify-center">
              {items.map((item, i) => {
                const pct = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
                const seriesIndex = allSeries.indexOf(item.series!);
                return (
                  <div key={i} className="flex flex-col items-center justify-end h-full" style={{ width: `${100 / items.length / 1.5}%` }}>
                    <span className="text-[11px] font-medium text-surface-900 mb-1 tabular-nums">
                      {formatValue(item.value, item.unit)}
                    </span>
                    <div
                      className="w-full rounded-t min-w-3"
                      style={{
                        height: `${Math.max(pct, 2)}%`,
                        backgroundColor: colors[seriesIndex % colors.length],
                        minHeight: '6px',
                      }}
                    />
                  </div>
                );
              })}
            </div>
            <span className="mt-2 text-2xs sm:text-xs text-surface-500 text-center leading-tight w-full">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Horizontal Bars ────────────────────────────────────────── */

/**
 * Two-row layout per data point: label + value share the top row, bar fills
 * the full column width on the row below. This was a redesign from a
 * 3-column grid [label | bar | value] that cramped long labels at the
 * ~560px article column width we get on desktop (narrow sidebar takes the
 * right 280px). In the new layout the bar always gets full width so length
 * comparison stays legible, and labels can be as long as needed without
 * truncating.
 */
function HorizontalBars({ data }: { data: BlogVisualChart['data'] }) {
  const maxValue = Math.max(...data.map((d) => d.value));
  return (
    <div className="space-y-4" role="img">
      {data.map((item, i) => {
        const pct = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
        return (
          <div key={i} className="min-w-0">
            <div className="flex items-baseline justify-between gap-3 mb-1.5">
              <span className="text-sm text-surface-700 leading-snug">{item.label}</span>
              <span className="text-sm font-medium text-surface-900 tabular-nums shrink-0">
                {formatValue(item.value, item.unit)}
              </span>
            </div>
            <div className="h-2.5 bg-surface-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.max(pct, 2)}%`,
                  backgroundColor: 'var(--color-primary-500)',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Stat (single number) ───────────────────────────────────── */

function Stat({ data }: { data: BlogVisualChart['data'] }) {
  const [first] = data;
  if (!first) return null;
  return (
    <div className="py-6 text-center">
      <div className="text-5xl md:text-6xl font-medium text-surface-900 tabular-nums tracking-tight">
        {formatValue(first.value, first.unit)}
      </div>
      <div className="mt-2 text-sm text-surface-600">{first.label}</div>
    </div>
  );
}

/* ── Data Table ─────────────────────────────────────────────── */

function DataTable({ data, xAxis, yAxis }: { data: BlogVisualChart['data']; xAxis?: string; yAxis?: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-surface-200">
            <th className="text-left py-2 pr-4 font-medium text-surface-500">{xAxis || 'Item'}</th>
            <th className="text-right py-2 pl-4 font-medium text-surface-500">{yAxis || 'Value'}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, i) => (
            <tr key={i} className="border-b border-surface-100 last:border-0">
              <td className="py-2 pr-4 text-surface-900">{item.label}</td>
              <td className="py-2 pl-4 text-right text-surface-900 tabular-nums font-medium">
                {formatValue(item.value, item.unit)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatValue(value: number, unit?: string): string {
  const formatted = Number.isInteger(value) ? value.toLocaleString() : value.toFixed(1);
  if (!unit) return formatted;
  if (unit === '%' || unit === 'x') return `${formatted}${unit}`;
  if (unit === '$') return `${unit}${formatted}`;
  return `${formatted} ${unit}`;
}
