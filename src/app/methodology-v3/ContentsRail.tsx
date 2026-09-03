'use client';

import { useEffect, useState } from 'react';

/**
 * ContentsRail: the sticky page index concept C is built around.
 *
 * Rebuilt from Aceternity's `StickyScroll`, whose mechanism was rejected in full:
 *  - it renders every non-active block at `opacity: 0.3` and starts them at
 *    `initial: {opacity: 0}`, so the served HTML carries opacity 0 on content
 *    that has to be readable to an engine that does not run scripts,
 *  - it puts the whole section inside a `h-[30rem] overflow-y-auto` nested
 *    scroller, which breaks anchor links, find-in-page and mobile scrolling,
 *  - it cycles three hard-coded background hexes and three two-stop gradients by
 *    modulo, all of which are banned or disabled in this project,
 *  - it types its ref and content as `any`, and this repo runs tsc in CI.
 *
 * What survived is the idea: an index that stays with you and shows where you
 * are. Here it is real anchor links (they work with JavaScript off), plain CSS
 * `position: sticky` (no nested scroller), and an IntersectionObserver used
 * ONLY to mark the active link. No content anywhere is dimmed or hidden.
 */
export interface RailItem {
  id: string;
  label: string;
}

export function ContentsRail({ items }: { items: RailItem[] }) {
  const [active, setActive] = useState<string>(items[0]?.id ?? '');

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const nodes = items
      .map((i) => document.getElementById(i.id))
      .filter((n): n is HTMLElement => Boolean(n));
    if (nodes.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        // The topmost intersecting section wins, so scrolling up and down both
        // land on the section the reader is actually looking at.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-84px 0px -62% 0px', threshold: 0 },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [items]);

  return (
    <nav className="rail-nav" aria-label="On this page">
      <p className="rn-cap">On this page</p>
      <ol>
        {items.map((i) => (
          <li key={i.id} data-active={active === i.id ? '' : undefined}>
            <a href={`#${i.id}`}>{i.label}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
