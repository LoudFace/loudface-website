'use client';

import { useEffect, useState } from 'react';

/**
 * The eight stages' contents rail: sticky beside the full text, it marks the stage being read (100 Linear Method,
 * the case study's contents rail in case-v11). Every stage stays in the page as plain text; the rail only points.
 */
export function StageRail({ items, label }: { items: { id: string; kicker: string; title: string }[]; label: string }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver((entries) => {
      const seen = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (seen[0]) setActive(seen[0].target.id);
    }, { rootMargin: '-25% 0px -65% 0px' });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  return (
    <nav className="mt-rail" aria-label={label}>
      {items.map((i) => (
        <a key={i.id} href={`#${i.id}`} className={i.id === active ? 'is-on' : ''} aria-current={i.id === active ? 'true' : undefined}>
          <span className="is-k">{i.kicker}</span>
          <b>{i.title}</b>
        </a>
      ))}
    </nav>
  );
}
