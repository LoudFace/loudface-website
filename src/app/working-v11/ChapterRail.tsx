'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * The chapters of the full list: a row of chips under the header at every width. It stays on screen until the list
 * ends, because it sits inside the list's own box. It only points: every chapter stays in the page as plain text.
 */
export function ChapterRail({ items, label }: {
  items: { id: string; title: string; count: number }[];
  label: string;
}) {
  const [active, setActive] = useState(items[0]?.id);
  const nav = useRef<HTMLElement>(null);

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver((entries) => {
      const seen = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (seen[0]) setActive(seen[0].target.id);
    }, { rootMargin: '-30% 0px -60% 0px' });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  // the chips scroll sideways on a phone: keep the active one in view
  useEffect(() => {
    if (!nav.current) return;
    const on = nav.current.querySelector<HTMLElement>('[aria-current="true"]');
    if (!on) return;
    const box = nav.current;
    const left = on.offsetLeft - (box.clientWidth - on.offsetWidth) / 2;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    box.scrollTo({ left: Math.max(0, left), behavior: still ? 'auto' : 'smooth' });
  }, [active]);

  return (
    <nav ref={nav} className="ww-chips" aria-label={label}>
      {items.map((i) => (
        <a key={i.id} href={`#${i.id}`} className={i.id === active ? 'is-on' : undefined} aria-current={i.id === active ? 'true' : undefined}>
          <span>{i.title}</span>
          <small>{i.count}</small>
        </a>
      ))}
    </nav>
  );
}
