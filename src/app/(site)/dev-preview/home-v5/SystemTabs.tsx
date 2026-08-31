'use client';

import { useId, useState, type ReactNode } from 'react';
import { RingChart, Ring, RingCenter } from '@/components/charts';

/**
 * S2 tab machinery only — the four tab panels (copy, collages, quote cards) are
 * authored in page.tsx and passed in as `panels`, so the content lives with the
 * rest of the page copy and this file stays pure interaction + a11y wiring.
 */
export type SystemTab = {
  id: string;
  label: string;
  panel: ReactNode;
};

export function SystemTabs({ tabs }: { tabs: SystemTab[] }) {
  const [active, setActive] = useState(0);
  const baseId = useId();

  return (
    <div className="sys">
      <div role="tablist" aria-label="The LoudFace system, by stage" className="sys-tabrow">
        {tabs.map((t, i) => (
          <button
            key={t.id}
            role="tab"
            id={`${baseId}-tab-${t.id}`}
            aria-selected={i === active}
            aria-controls={`${baseId}-panel-${t.id}`}
            tabIndex={i === active ? 0 : -1}
            className={`sys-tab${i === active ? ' is-active' : ''}`}
            onClick={() => setActive(i)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tabs.map((t, i) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`${baseId}-panel-${t.id}`}
          aria-labelledby={`${baseId}-tab-${t.id}`}
          hidden={i !== active}
          className="sys-panel"
        >
          {t.panel}
        </div>
      ))}
    </div>
  );
}

/** Tab 3's citation-share ring — real chart lib, kept here since it's a client subtree. */
export function CitationRing({ value }: { value: number }) {
  const data = [{ label: 'Cited', value, maxValue: 100 }];
  return (
    <RingChart data={data} size={112} strokeWidth={11}>
      {data.map((item, i) => (
        <Ring index={i} key={item.label} />
      ))}
      <RingCenter defaultLabel="cited" formatOptions={{ maximumFractionDigits: 1 }} />
    </RingChart>
  );
}
