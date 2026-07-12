'use client';

import { useEffect } from 'react';

/**
 * Client interactions for the homepage-v3 faithful preview.
 * Ported verbatim from the approved probvar-d.html inline <script>:
 *   1. reveal-on-scroll — .rv elements gain .in when they enter the viewport
 *   2. header state — .hd toggles .at-top while over the indigo hero stage
 * IntersectionObserver-absent fallback reveals everything immediately.
 */
export function HomepageV3Scripts() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.rv'));
    let io: IntersectionObserver | null = null;

    if (!('IntersectionObserver' in window)) {
      els.forEach((e) => e.classList.add('in'));
    } else {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (en.isIntersecting) {
              en.target.classList.add('in');
              io?.unobserve(en.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
      );
      els.forEach((e) => io?.observe(e));
    }

    const hd = document.querySelector('.hd');
    const hero = document.querySelector('.hero') as HTMLElement | null;
    let flip: (() => void) | null = null;
    if (hd && hero) {
      flip = () => {
        const pastHero = window.scrollY > hero.offsetHeight - 72;
        hd.classList.toggle('at-top', !pastHero);
      };
      flip();
      window.addEventListener('scroll', flip, { passive: true });
      window.addEventListener('resize', flip, { passive: true });
    }

    return () => {
      io?.disconnect();
      if (flip) {
        window.removeEventListener('scroll', flip);
        window.removeEventListener('resize', flip);
      }
    };
  }, []);

  return null;
}
