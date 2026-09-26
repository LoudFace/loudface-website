import type { Series } from './data';
import { LiveChart, type ValueFormat } from './LiveChart';

/**
 * ChartPanel: one chart with its title and source, and nothing else. The trend is the message, so there is no
 * caption, no figure block and no legend (Arnel, 2026-09-25: "they should just be charts and show the bare
 * minimum"). `lead` is the full-width chart a case opens with; the LoudFace pin names the start day on it.
 * Part of the v11 component library (DESIGN.md §7).
 */
export function ChartPanel({ title, source, series, format, tip, lead = false, height }: {
  title: string;
  source?: string;
  series: Series;
  format: ValueFormat;
  tip: string;
  lead?: boolean;
  /** Plot height in px; defaults to 380 for the lead chart and 250 otherwise. Pass it to match a neighbour's height. */
  height?: number;
}) {
  return (
    <figure className={`v11-cpanel ${lead ? 'is-lead' : ''}`}>
      <figcaption className="v11-cpanel-head">
        <span className="is-title">{title}</span>
        {source && <span className="is-src">{source}</span>}
      </figcaption>
      <LiveChart
        series={series}
        height={height ?? (lead ? 380 : 250)}
        margin={lead ? { top: 48, right: 18, bottom: 30, left: 14 } : { top: 40, right: 14, bottom: 30, left: 12 }}
        axis
        dots={false}
        hatch
        lineWidth={lead ? 2 : 1.75}
        barGap={series.bars ? 0.42 : 0.5}
        pin={lead ? 26 : 22}
        startPrefix={lead ? 'LoudFace starts' : undefined}
        end="halo"
        tip={tip}
        format={format}
      />
    </figure>
  );
}
