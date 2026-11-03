"use client";

/**
 * A research chart. The server renders the SVG at a default width for its size, so the HTML carries the chart for
 * crawlers and readers without JavaScript; in the browser the chart measures its box and redraws at the real width.
 * Until then the SVG keeps its drawn width but never exceeds its box (max-width 100%, height from the viewBox), so
 * it never overflows a phone screen and the only shift is the height difference. The numbers also ship as a visually hidden table.
 */
import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ChartSize, ResearchChartProps } from "../contract";
import { chartTable, drawChart } from "./draw";

/** Width each size is drawn at on the server, before the box is measured. */
export const DEFAULT_WIDTH: Record<ChartSize, number> = {
  sm: 340,
  md: 560,
  lg: 760,
};

export interface ResearchChartComponentProps extends ResearchChartProps {
  /** The series colour lit, replacing the highlight on night and navy (G paper: #86dcb4 for the green series). */
  accent?: string;
  /** Show the spec's axis line above the chart. Default: at sm only, as the board's cards do (never in thin). */
  showAxis?: boolean;
  /** `thin`: the homepage strip's card chart (DrawOptions.variant). Default: the /research rendering. */
  variant?: "default" | "thin";
  /** Thin only: the SVG height in px (default THIN_HEIGHT, 118). */
  height?: number;
  /** The colour of every non-highlighted mark (DrawOptions.rest). */
  rest?: string;
  /** Width drawn on the server before the box is measured. Default: DEFAULT_WIDTH for the size. Set it to the
   *  card's real width so the first paint matches the redraw. */
  initialWidth?: number;
}

const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export function ResearchChart({
  spec,
  ground,
  tone,
  size = "md",
  title,
  className,
  accent,
  showAxis,
  variant,
  height,
  rest,
  initialWidth,
}: ResearchChartComponentProps) {
  const rawId = useId();
  const idPrefix = `rc${rawId.replace(/[^A-Za-z0-9_-]/g, "")}`;
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number | null>(null);

  useIsoLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => {
      const w = Math.floor(el.getBoundingClientRect().width);
      if (w > 0) setWidth((prev) => (prev === w ? prev : w));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const drawn = useMemo(
    () =>
      drawChart(spec, {
        width: width ?? initialWidth ?? DEFAULT_WIDTH[size],
        ground,
        tone,
        size,
        idPrefix,
        accent,
        showAxis,
        variant,
        height,
        rest,
      }),
    [spec, width, initialWidth, ground, tone, size, idPrefix, accent, showAxis, variant, height, rest],
  );
  const table = useMemo(() => chartTable(spec), [spec]);

  return (
    <div
      className={className}
      style={{ position: "relative", minWidth: 0 }}
      data-chart-type={spec.type}
    >
      <div
        ref={box}
        aria-hidden="true"
        style={{ width: "100%" }}
        dangerouslySetInnerHTML={{ __html: drawn.svg }}
      />
      {/* the wrapper is what is hidden: a table ignores a 1px width and would widen the page */}
      <div className="sr-only">
        <table>
          <caption>{title}</caption>
          <thead>
            <tr>
              {table.head.map((h, i) => (
                <th key={i} scope="col">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((r, i) => (
              <tr key={i}>
                {r.map((v, j) =>
                  j === 0 ? (
                    <th key={j} scope="row">
                      {v}
                    </th>
                  ) : (
                    <td key={j}>{v}</td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
