'use client';

import { useEffect } from 'react';

/**
 * AboutV3Scripts — reveal-on-scroll for the about-v3 page. `.rv` elements gain
 * `.in` when they enter the viewport (calm fade + rise). Ported from the
 * composite's inline script, minus the mobile-nav drawer and header-flip logic:
 * the shared (site) Header owns its own mobile menu and dark->scrolled flip
 * (heroTheme="dark" keys off the .hero element), so this only handles reveals.
 * IntersectionObserver-absent + reduced-motion fallbacks reveal everything.
 */
export function AboutV3Scripts() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const els = Array.from(document.querySelectorAll<HTMLElement>('.abv3 .rv'));

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
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );

    els.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.92) el.classList.add('in');
      else io.observe(el);
    });

    return () => io.disconnect();
  }, []);

  return null;
}
