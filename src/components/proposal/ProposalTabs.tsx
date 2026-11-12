'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Proposal | Preliminary strategy | Technical audit (Arnel, 3-4 Nov 2026): the
 * standard deck stays as it is in the first tab, and the detail a lead asks
 * for sits in its own tab, so the deck does not get longer. A proposal with a
 * pitch (9 Nov 2026) opens on a LoudFace tab first, and the deck's own tab
 * takes the client's name. All panels are rendered on the server; this only
 * switches which one shows. `#proposal`, `#strategy`, `#audit` or `#working-together` in the link,
 * or any in-page link to them, opens that tab, so a link can be sent straight
 * to it.
 *
 * Working together (Arnel, 12 Nov 2026) is the last tab on every proposal:
 * what we need from a client, the same text for all of them.
 *
 * The tab blocks carry data-proposal-section, so ProposalAnalytics logs
 * "Strategy · …" and "Audit · …" section views once the reader opens a tab.
 */
type Tab = 'pitch' | 'proposal' | 'strategy' | 'audit' | 'working-together';
const HASH_TABS = ['proposal', 'strategy', 'audit', 'working-together'] as const;
// "Preliminary" because a lead's strategy is built before kickoff, from public
// data (Arnel, 4 Nov 2026). On a phone the audit tab says "Audit" so all
// three fit on one line.
const LABELS: Record<Tab, string> = { pitch: 'LoudFace', proposal: 'Proposal', strategy: 'Preliminary strategy', audit: 'Technical audit', 'working-together': 'Working together' };
const SHORT: Partial<Record<Tab, string>> = { audit: 'Audit', 'working-together': 'Together' };

// Start the shown tab at its top, just under the sticky bar, not wherever the
// old one was scrolled to. The bar's own top reads 0 while it is pinned, so
// measure the panel.
function toTop(bar: HTMLElement | null, id: Tab) {
  const shown = document.getElementById(`panel-${id}`);
  if (!bar || !shown) return;
  const past = shown.getBoundingClientRect().top - bar.offsetHeight;
  // Instant: the site's smooth scrolling would glide through the old height.
  if (past < 0) window.scrollBy({ top: past, behavior: 'instant' });
}

export function ProposalTabs({
  pitch,
  proposal,
  proposalLabel,
  strategy,
  audit,
  workingTogether,
}: {
  pitch?: ReactNode;
  proposal: ReactNode;
  proposalLabel?: string;
  strategy?: ReactNode;
  audit?: ReactNode;
  workingTogether: ReactNode;
}) {
  const home: Tab = pitch ? 'pitch' : 'proposal';
  const [tab, setTab] = useState<Tab>(home);
  const bar = useRef<HTMLDivElement>(null);
  // Set when a click switches tabs; the effect below scrolls once the new
  // panel is shown and can be measured.
  const jump = useRef(false);
  const panels: { id: Tab; node: ReactNode }[] = [
    ...(pitch ? [{ id: 'pitch' as const, node: pitch }] : []),
    { id: 'proposal', node: proposal },
    ...(strategy ? [{ id: 'strategy' as const, node: strategy }] : []),
    ...(audit ? [{ id: 'audit' as const, node: audit }] : []),
    { id: 'working-together', node: workingTogether },
  ];
  const label = (id: Tab) => (id === 'proposal' && proposalLabel ? proposalLabel : LABELS[id]);

  useEffect(() => {
    // `#proposal`, `#strategy`, `#audit` and their outlines' `#strategy-…` and
    // `#audit-…` anchors open their tab. An anchor's section was hidden when the
    // browser tried to scroll to it, so scroll once the tab shows. A bare tab
    // link clicked further down the page (the pitch's hand-off card) has no
    // element to scroll to, so it goes to the top of the tab.
    const fromHash = (clicked: boolean) => {
      const hash = window.location.hash;
      const open = HASH_TABS.find((t) => hash.startsWith(`#${t}`));
      const anchor = open && hash.length > open.length + 1;
      jump.current = clicked && !anchor;
      setTab(open ?? home);
      if (anchor) {
        requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' }));
      }
    };
    fromHash(false);
    const onHash = () => fromHash(true);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [home]);

  useEffect(() => {
    if (!jump.current) return;
    jump.current = false;
    toTop(bar.current, tab);
  }, [tab]);

  const pick = (next: Tab) => {
    jump.current = true;
    setTab(next);
    const url = new URL(window.location.href);
    url.hash = next === home ? '' : next;
    window.history.replaceState(null, '', url.toString());
  };

  return (
    <>
      <div ref={bar} className="sticky top-0 z-30 border-b border-surface-200 bg-white/95 backdrop-blur">
        <div role="tablist" aria-label="Proposal tabs" className="mx-auto flex max-w-[1180px] gap-5 overflow-x-auto whitespace-nowrap px-5 sm:gap-6 sm:px-8">
          {panels.map(({ id }) => {
            const on = tab === id;
            const short = SHORT[id];
            return (
              <button
                key={id}
                type="button"
                role="tab"
                id={`tab-${id}`}
                aria-selected={on}
                aria-controls={`panel-${id}`}
                onClick={() => pick(id)}
                className={`-mb-px border-b-2 py-4 text-[15px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 ${
                  on ? 'border-primary-600 text-surface-950' : 'border-transparent text-surface-500 hover:text-surface-900'
                }`}
              >
                {short ? (
                  <>
                    <span className="sm:hidden">{short}</span>
                    <span className="hidden sm:inline">{label(id)}</span>
                  </>
                ) : (
                  label(id)
                )}
              </button>
            );
          })}
        </div>
      </div>
      {panels.map(({ id, node }) => (
        <div key={id} role="tabpanel" id={`panel-${id}`} aria-labelledby={`tab-${id}`} hidden={tab !== id}>
          {node}
        </div>
      ))}
    </>
  );
}
