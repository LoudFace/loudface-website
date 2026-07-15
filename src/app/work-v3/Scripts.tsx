'use client';

import { useEffect } from 'react';

/**
 * WorkV3Scripts — reveal-on-scroll for the work-v3 page. `.rv` elements gain
 * `.in` when they enter the viewport (calm fade + rise). The header dark→scrolled
 * flip is owned by the shared (site) Header (heroTheme="dark" keys off the .hero
 * element), and the marquee tabs + archive filters are React state — so this only
 * handles reveals. IntersectionObserver-absent + reduced-motion fallbacks reveal
 * everything immediately, and a short timeout is a belt-and-suspenders reveal so a
 * full-page screenshot / crawler never sees hidden content.
 */
export function WorkV3Scripts() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const els = Array.from(document.querySelectorAll<HTMLElement>('.wkv3 .rv'));

    if (reduced || !('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );

    els.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.92) el.classList.add('in');
      else io.observe(el);
    });

    const t = setTimeout(() => els.forEach((el) => el.classList.add('in')), 900);

    return () => {
      io.disconnect();
      clearTimeout(t);
    };
  }, []);

  return null;
}
