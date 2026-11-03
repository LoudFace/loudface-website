'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Proposal | Full strategy (Arnel, 3 Nov 2026): the standard deck stays as
 * it is in the first tab, and the full strategy for this lead sits in the
 * second, so the deck does not get longer. Both panels are rendered on the
 * server; this only switches which one shows. `#strategy` in the link, or
 * any in-page link to it, opens the strategy tab, so a link can be sent
 * straight to it.
 *
 * The strategy blocks carry data-proposal-section, so ProposalAnalytics
 * logs "Strategy · …" section views once the reader opens the tab.
 */
type Tab = 'proposal' | 'strategy';
const TABS: { id: Tab; label: string }[] = [
  { id: 'proposal', label: 'Proposal' },
  { id: 'strategy', label: 'Full strategy' },
];

export function ProposalTabs({ proposal, strategy }: { proposal: ReactNode; strategy: ReactNode }) {
  const [tab, setTab] = useState<Tab>('proposal');
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // `#strategy` and the strategy outline's `#strategy-…` anchors all open
    // the strategy tab. An anchor's section was hidden when the browser
    // tried to scroll to it, so scroll once the tab shows.
    const fromHash = () => {
      const hash = window.location.hash;
      const strategyHash = hash.startsWith('#strategy');
      setTab(strategyHash ? 'strategy' : 'proposal');
      if (strategyHash && hash.length > '#strategy'.length) {
        requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' }));
      }
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, []);

  const pick = (next: Tab) => {
    setTab(next);
    const url = new URL(window.location.href);
    url.hash = next === 'strategy' ? 'strategy' : '';
    window.history.replaceState(null, '', url.toString());
    // Start the new tab at its top, not wherever the old one was scrolled to.
    const top = bar.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) bar.current?.scrollIntoView({ block: 'start' });
  };

  return (
    <>
      <div ref={bar} className="sticky top-0 z-30 border-b border-surface-200 bg-white/95 backdrop-blur">
        <div role="tablist" aria-label="Proposal and strategy" className="mx-auto flex max-w-[1180px] gap-6 px-5 sm:px-8">
          {TABS.map((t) => {
            const on = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={on}
                aria-controls={`panel-${t.id}`}
                onClick={() => pick(t.id)}
                className={`-mb-px border-b-2 py-4 text-[15px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 ${
                  on ? 'border-primary-600 text-surface-950' : 'border-transparent text-surface-500 hover:text-surface-900'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>
      <div role="tabpanel" id="panel-proposal" aria-labelledby="tab-proposal" hidden={tab !== 'proposal'}>
        {proposal}
      </div>
      <div role="tabpanel" id="panel-strategy" aria-labelledby="tab-strategy" hidden={tab !== 'strategy'}>
        {strategy}
      </div>
    </>
  );
}
