'use client';

import { useId, useState, type ReactNode } from 'react';

export type QuoteCell = {
  id: string;
  cellLabel: string;
  quote: ReactNode;
  author: ReactNode;
  org: ReactNode;
};

/**
 * S3's logo tab rail + quote card. All three quotes render server-side in the
 * DOM (mapped below) — the client only toggles which one is visible, so
 * nothing here depends on a fetch and there is no flash of missing content.
 */
export function QuoteSwitcher({ cells, defaultActive = 0 }: { cells: QuoteCell[]; defaultActive?: number }) {
  const [active, setActive] = useState(defaultActive);
  const baseId = useId();
  const current = cells[active];

  return (
    <div className="qs">
      <div className="qs-card">
        <blockquote key={current.id}>{current.quote}</blockquote>
        <footer>
          <span className="qs-author">{current.author}</span>
          <span className="qs-org">{current.org}</span>
        </footer>
      </div>

      <div role="tablist" aria-label="Switch testimonial" className="qs-rail">
        {cells.map((c, i) => (
          <button
            key={c.id}
            role="tab"
            id={`${baseId}-qtab-${c.id}`}
            aria-selected={i === active}
            aria-controls={`${baseId}-qpanel`}
            tabIndex={i === active ? 0 : -1}
            className={`qs-cell${i === active ? ' is-active' : ''}`}
            onClick={() => setActive(i)}
          >
            {c.cellLabel}
          </button>
        ))}
      </div>

      {/* All quotes server-rendered in the DOM (screen readers / view-source see every
          one) — visually hidden, the visible card above mirrors whichever is active. */}
      <div id={`${baseId}-qpanel`} className="qs-sr-all">
        {cells.map((c) => (
          <blockquote key={`sr-${c.id}`}>
            {c.quote}
            <footer>
              {c.author} · {c.org}
            </footer>
          </blockquote>
        ))}
      </div>
    </div>
  );
}
