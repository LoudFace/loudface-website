/**
 * BeforeAfterChart: published "before → after" readings as grouped columns, for a result that has two readings and
 * no series worth drawing (a share of AI answers in the first and the last tracked week). Grey is the first reading,
 * indigo the last, and the figures sit on the columns, so the chart needs no caption.
 * Part of the v11 component library (DESIGN.md §7).
 */
export interface BeforeAfterPair {
  label: string;
  before: number;
  after: number;
  /** The published figures, printed exactly as the study states them. */
  beforeText: string;
  afterText: string;
}

export function BeforeAfterChart({ pairs, beforeLabel, afterLabel, height = 250 }: {
  pairs: BeforeAfterPair[];
  beforeLabel?: string;
  afterLabel?: string;
  /** Height of the plot and its labels, to match a neighbouring chart. */
  height?: number;
}) {
  // Headroom above the tallest column for its figure.
  const max = Math.max(...pairs.flatMap((p) => [p.before, p.after]), 0.0001) * 1.22;
  return (
    <div className="v11-ba">
      <div className="v11-ba-plot" style={{ height: height - 30 }}>
        {pairs.map((p) => (
          <div key={p.label} className="v11-ba-group">
            <div className="v11-ba-col">
              <b>{p.beforeText}</b>
              <i style={{ height: `${(p.before / max) * 100}%` }} />
            </div>
            <div className="v11-ba-col is-after">
              <b>{p.afterText}</b>
              <i style={{ height: `${(p.after / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="v11-ba-keys">
        {pairs.map((p) => <span key={p.label}>{p.label}</span>)}
      </div>
      {(beforeLabel || afterLabel) && (
        <div className="v11-ba-legend">
          {beforeLabel && <span><i />{beforeLabel}</span>}
          {afterLabel && <span><i className="is-after" />{afterLabel}</span>}
        </div>
      )}
    </div>
  );
}
