import type { ReactNode } from 'react';

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

export function KeyResults({ items }: { items: KeyResult[] }) {
  return (
    <div className={`v11-keys is-${items.length}`}>
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
