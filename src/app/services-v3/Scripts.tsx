'use client';

import { useEffect } from 'react';

/**
 * ServicesV3Scripts — reveal-on-scroll for the services-v3 page. `.rv` elements
 * gain `.in` when they enter the viewport (calm fade + rise). Ported from the
 * mockup's inline script, minus the header-flip logic: the shared (site) Header
 * owns its own dark→scrolled flip (heroTheme="dark" keys off the .hero element),
 * so this only handles reveals. IntersectionObserver-absent + reduced-motion
 * fallbacks reveal everything immediately.
 */
export function ServicesV3Scripts() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const els = Array.from(document.querySelectorAll<HTMLElement>('.svv3 .rv'));

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
