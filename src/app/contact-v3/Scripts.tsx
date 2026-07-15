'use client';

import { useEffect } from 'react';

/**
 * ContactV3Scripts — the page's two bits of client behavior, ported from the
 * mockup's inline scripts (minus the mobile-nav drawer — the shared Header
 * owns that):
 *
 * 1. Reveal-on-scroll: `.rv` elements gain `.in` when they enter the viewport.
 *    Reduced-motion / no-IntersectionObserver reveal everything immediately.
 * 2. Live office clocks: `[data-tz]` spans tick to the office's local time
 *    every 30s (progressive enhancement — server renders them empty so no
 *    hydration mismatch, CSS keeps the row stable).
 */
export function ContactV3Scripts() {
  useEffect(() => {
    // --- live local clocks ---
    const clocks = Array.from(document.querySelectorAll<HTMLElement>('.ctv3 [data-tz]'));
    const tick = () => {
      clocks.forEach((el) => {
        try {
          el.textContent = new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            timeZone: el.getAttribute('data-tz') ?? undefined,
          }).format(new Date());
        } catch {
          /* unknown timezone — leave blank */
        }
      });
    };
    tick();
    const timer = window.setInterval(tick, 30000);

    // --- reveal on scroll ---
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const els = Array.from(document.querySelectorAll<HTMLElement>('.ctv3 .rv'));

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

    return () => {
      window.clearInterval(timer);
      io?.disconnect();
    };
  }, []);

  return null;
}
