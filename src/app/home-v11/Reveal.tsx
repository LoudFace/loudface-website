'use client';

import { useEffect } from 'react';

/**
 * One quiet entrance for the whole page: headings, cards and charts fade up a few pixels as they come into view,
 * staggered within a row. Only elements below the first screen are held back, so nothing on load flickers.
 * Off for reduced motion and inside the inline editor; without JavaScript everything is simply visible.
 */
const SELECTOR = [
  '.v11-head', '.v11-logos-inner', '.v11-tile', '.v11-rcase', '.v11-step', '.v11-plate',
  '.v11-video', '.v11-quote', '.v11-member', '.v11-bench', '.v11-team-note', '.v11-closing-copy', '.v11-closing-card', '.v11-footer-top',
].join(',');

export function Reveal() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (document.querySelector('.lf-editing')) return;
    const els = [...document.querySelectorAll<HTMLElement>(`.v11 :is(${SELECTOR})`)];
    const pending = els.filter((el) => el.getBoundingClientRect().top > window.innerHeight * 0.92);
    pending.forEach((el) => {
      const siblings = el.parentElement ? [...el.parentElement.children].filter((c) => c.matches(SELECTOR)) : [];
      const i = Math.max(0, siblings.indexOf(el));
      el.style.setProperty('--reveal-delay', `${Math.min(i, 5) * 70}ms`);
      el.classList.add('v11-reveal');
    });
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    );
    pending.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
