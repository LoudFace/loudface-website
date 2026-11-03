'use client';

import { useEffect, useRef } from 'react';

/**
 * The series filter on the /research grid. The filter is plain links (/research?series=<key>#papers), and the server
 * already marks the cards outside the chosen series `hidden`, so it works without JavaScript and every card stays in
 * the HTML. With JavaScript a press filters in place: no reload, the address follows (history.replaceState).
 * The series tiles above the grid carry the same `data-s` links and go through this one handler, so the DOM the
 * script hides and the markup React rendered never disagree (a client-side <Link> navigation used to leave cards
 * hidden: 0 cards after filter + tile, found in review 2026-11-03). Render it inside the filter nav; it draws nothing.
 */
export function PaperFilter() {
  const mark = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const nav = mark.current?.closest('nav');
    const grid = nav?.closest('section')?.querySelector<HTMLElement>('[data-grid]');
    if (!nav || !grid) return;
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[data-s]');
      const fromTile = !!a && !nav.contains(a);
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      const s = a.dataset.s ?? '';
      nav.querySelectorAll<HTMLAnchorElement>('a[data-s]').forEach((x) => {
        if (x.dataset.s === s) x.setAttribute('aria-current', 'true');
        else x.removeAttribute('aria-current');
      });
      grid.querySelectorAll<HTMLElement>('[data-s]').forEach((card) => {
        card.hidden = !!s && card.dataset.s !== s;
      });
      grid.dataset.filtered = s ? 'true' : 'false';
      const url = new URL(window.location.href);
      if (s) url.searchParams.set('series', s);
      else url.searchParams.delete('series');
      url.hash = 'papers';
      window.history.replaceState(window.history.state, '', url);
      window.dispatchEvent(new Event('resize'));
      if (fromTile) grid.closest('section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return <span ref={mark} hidden />;
}
