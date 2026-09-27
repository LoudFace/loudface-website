import type { CSSProperties, ReactNode } from 'react';
import { strip } from '@/lib/inline-edit/mark';

/**
 * KeyResults: a case's published results as big figures with a short label each, on hairlines. Modelled on
 * Graphite's Fourthwall case study (Arnel's reference, 2026-09-25) and Mobbin's Amigo and Mixpanel results rows:
 * the figure carries the section, one short label says what it is, and the measurement window sits quietly under it.
 * Part of the v11 component library (DESIGN.md §7).
 */
export interface KeyResult {
  value: ReactNode;
  label: ReactNode;
  /** The measurement window or source, in small quiet type. */
  note?: ReactNode;
}

/** Characters in the longest figure: the row sizes every figure to fit its column (2026-09-27, "0.53% → 10.46%" ran into its neighbour). */
const longest = (items: KeyResult[]) => Math.max(1, ...items.map((k) => (typeof k.value === 'string' ? strip(k.value).length : 1)));

export function KeyResults({ items }: { items: KeyResult[] }) {
  return (
    <div className={`v11-keys is-${items.length}`} style={{ '--n': longest(items) } as CSSProperties}>
      {items.map((k, i) => (
        <div key={i} className="v11-key">
          <div className="v11-key-value">{k.value}</div>
          <div className="v11-key-label">{k.label}</div>
          {k.note && <div className="v11-key-note">{k.note}</div>}
        </div>
      ))}
    </div>
  );
}
