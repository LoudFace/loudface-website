"use client";

/**
 * BarLineIndicator — a trend line laid across the tops of a `<BarChart>`.
 *
 * Bklit documents this as a consumer-supplied component ("Custom Indicator")
 * and ships no public implementation, so this is ours. It follows the same
 * contract as the depth layers: read geometry from `useChartStable()`, render
 * a `<g>` into the chart's already-translated inner coordinate space, and add
 * nothing to `<Bar>`.
 *
 *   <BarChart data={data} xDataKey="month">
 *     <BarDepthBack dataKey="value" />
 *     <Bar dataKey="value" perspective />
 *     <BarDepthFront dataKey="value" />
 *     <BarLineIndicator valueKey="value" />
 *   </BarChart>
 *
 * Render it AFTER the bars so the line sits on top. `data` and `xKey` are
 * accepted for parity with Bklit's documented signature but are optional —
 * the chart's own data and band scale are the source of truth, which keeps the
 * line aligned when the host chart filters or re-sorts.
 */

import { motion } from "motion/react";
import { useId, useMemo } from "react";
import { useChartStable } from "./chart-context";

export interface BarLineIndicatorProps {
  /** Column to trace. Must match the `dataKey` on the `<Bar>`. */
  valueKey: string;
  /** Accepted for signature parity; the chart's own data is used. */
  data?: Record<string, unknown>[];
  /** Accepted for signature parity; the chart's band scale is used. */
  xKey?: string;
  /** For stacked bars — trace the sum of these columns instead of one. */
  stackKeys?: string[];
  stroke?: string;
  strokeWidth?: number;
  /** Dot radius at each bar top. Set 0 to draw the line only. */
  dotRadius?: number;
  /** Lift the line above the bar top, in px, so it clears the depth lid. */
  offset?: number;
  className?: string;
}

export function BarLineIndicator({
  valueKey,
  stackKeys,
  stroke = "var(--chart-foreground)",
  strokeWidth = 1.5,
  dotRadius = 3,
  offset = 0,
  className,
}: BarLineIndicatorProps) {
  const gradientId = useId();
  const {
    data,
    barScale,
    bandWidth,
    yScale,
    innerHeight,
    barXAccessor,
    isLoaded,
  } = useChartStable();

  const points = useMemo<{ x: number; y: number; value: number }[]>(() => {
    if (!(barScale && bandWidth && barXAccessor)) return [];

    const out: { x: number; y: number; value: number }[] = [];
    for (const d of data) {
      const raw = stackKeys
        ? stackKeys.reduce((sum, k) => sum + (Number(d[k]) || 0), 0)
        : Number(d[valueKey]);
      if (!Number.isFinite(raw)) continue;

      // `barXAccessor` returns the CATEGORY, not a pixel — the band scale maps
      // it to the bar's left edge, exactly as the depth layers do.
      const bandX = barScale(barXAccessor(d));
      if (bandX == null || !Number.isFinite(bandX)) continue;

      const y = yScale(raw);
      if (!Number.isFinite(y)) continue;

      out.push({ x: bandX + bandWidth / 2, y: y - offset, value: raw });
    }
    return out;
  }, [data, barScale, bandWidth, barXAccessor, yScale, valueKey, stackKeys, offset]);

  if (points.length < 2) return null;

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");

  return (
    <g className={className} pointerEvents="none" aria-hidden="true">
      <defs>
        {/* Fade the line in from the left so it reads as a direction, not a rule. */}
        <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor={stroke} stopOpacity={0.25} />
          <stop offset="18%" stopColor={stroke} stopOpacity={0.9} />
          <stop offset="100%" stopColor={stroke} stopOpacity={0.9} />
        </linearGradient>
      </defs>

      <motion.path
        d={path}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: isLoaded === false ? 0 : 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />

      {dotRadius > 0 &&
        points.map((p, i) => (
          <motion.circle
            key={`${p.x}-${i}`}
            cx={p.x}
            cy={Math.min(p.y, innerHeight)}
            r={dotRadius}
            fill="var(--chart-background)"
            stroke={stroke}
            strokeWidth={strokeWidth}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.5 + i * 0.04 }}
          />
        ))}
    </g>
  );
}

export default BarLineIndicator;
