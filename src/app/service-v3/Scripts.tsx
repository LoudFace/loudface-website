'use client';

import { useEffect } from 'react';

/**
 * ServiceV3Scripts — reveal-on-scroll for the /services/<slug> child template.
 * `.svcv3 .rv` elements gain `.in` when they enter the viewport (calm fade +
 * rise). Header dark→scrolled flip is owned by the shared (site) Header
 * (heroTheme="dark"), so this only handles reveals. IntersectionObserver-absent
 * and reduced-motion fallbacks reveal everything immediately; a blanket timeout
 * guarantees content is never left hidden (also covers full-page screenshots).
 */
export function ServiceV3Scripts() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const els = Array.from(document.querySelectorAll<HTMLElement>('.svcv3 .rv'));

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
      { threshold: 0.05, rootMargin: '0px 0px -8% 0px' }
    );

    els.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.92) el.classList.add('in');
      else io.observe(el);
    });

    const t = window.setTimeout(() => els.forEach((el) => el.classList.add('in')), 900);
    return () => {
      io.disconnect();
      window.clearTimeout(t);
    };
  }, []);

  return null;
}
