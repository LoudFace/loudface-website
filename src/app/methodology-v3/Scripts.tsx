'use client';

import { useEffect } from 'react';

/**
 * MethodologyScripts: reveal-on-scroll plus the horizontal-scroll state on the
 * measurement table, shared by all three /methodology concepts.
 *
 * Header dark-to-scrolled flip is owned by the shared (site) Header
 * (heroTheme="dark"), so nothing here touches the nav.
 *
 * Fallbacks matter more than the animation: no IntersectionObserver, or
 * prefers-reduced-motion, reveals everything at once, and a blanket timeout
 * guarantees no element is ever left hidden (this is also what makes a
 * full-page screenshot show the finished page rather than a half-revealed one).
 */
export function MethodologyScripts() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const els = Array.from(document.querySelectorAll<HTMLElement>('.mth .rv'));

    let io: IntersectionObserver | null = null;
    let timer = 0;

    if (reduced || !('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'));
    } else {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add('in');
              io?.unobserve(e.target);
            }
          });
        },
        { threshold: 0.05, rootMargin: '0px 0px -8% 0px' },
      );
      els.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.92) el.classList.add('in');
        else io?.observe(el);
      });
      timer = window.setTimeout(() => els.forEach((el) => el.classList.add('in')), 900);
    }

    // Table edge-fade state: only meaningful once the reader has scrolled the
    // table sideways, which is also the moment the sticky first column needs
    // its shadow.
    const wraps = Array.from(document.querySelectorAll<HTMLElement>('.mth .mtable-wrap'));
    const onScroll = (ev: Event) => {
      const el = ev.currentTarget as HTMLElement;
      el.classList.toggle('is-scrolled-x', el.scrollLeft > 4);
    };
    wraps.forEach((w) => w.addEventListener('scroll', onScroll, { passive: true }));

    return () => {
      io?.disconnect();
      if (timer) window.clearTimeout(timer);
      wraps.forEach((w) => w.removeEventListener('scroll', onScroll));
    };
  }, []);

  return null;
}
