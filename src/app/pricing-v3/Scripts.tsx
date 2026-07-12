'use client';

import { useEffect } from 'react';

/**
 * PricingV3Scripts — the page's two bits of scroll behavior, ported from the
 * mockup's inline script (minus the mobile-nav drawer — the shared Header owns
 * that — and minus the tier-CTA name derivation, which is static in JSX):
 *
 * 1. Reveal-on-scroll: `.rv` elements gain `.in` when they enter the viewport.
 *    Reduced-motion / no-IntersectionObserver reveal everything immediately.
 * 2. Compare-table edge fades: the mobile scroller opens on Solo in natural
 *    order; once the user scrolls right, `.is-scrolled-x` adds the left edge
 *    fade + sticky-rail shadow.
 */
export function PricingV3Scripts() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const els = Array.from(document.querySelectorAll<HTMLElement>('.prv3 .rv'));

    let io: IntersectionObserver | undefined;
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
        { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
      );
      els.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.92) el.classList.add('in');
        else io?.observe(el);
      });
    }

    const wrap = document.querySelector<HTMLElement>('.prv3 .ctable-wrap');
    const fade = () => {
      wrap?.classList.toggle('is-scrolled-x', (wrap?.scrollLeft ?? 0) > 8);
    };
    wrap?.addEventListener('scroll', fade, { passive: true });
    fade();

    return () => {
      io?.disconnect();
      wrap?.removeEventListener('scroll', fade);
    };
  }, []);

  return null;
}
