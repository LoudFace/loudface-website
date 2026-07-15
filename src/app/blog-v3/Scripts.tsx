'use client';

import { useEffect } from 'react';

/**
 * BlogV3Scripts — the three progressive-enhancement behaviours the answer-first
 * concept ships, scoped to the `.blogv3` subtree:
 *   1. Reveal-on-scroll: `.rv` elements gain `.in` when they enter the viewport.
 *      The reveal is `.js`-gated in CSS (html.js …), and `<html class="js">` is
 *      set by a synchronous inline script in the page BEFORE first paint, so a
 *      no-JS crawler sees the AEO citation card + body at full opacity. A short
 *      timeout is a belt-and-suspenders reveal so a full-page screenshot / crawler
 *      never sees hidden content.
 *   2. TOC scroll-spy: the currently-in-view `<h2 id>` highlights its rail link.
 *   3. Copy-link share button: copies the canonical URL and flips the label.
 *
 * The header dark→scrolled flip is owned by the shared (site) Header
 * (heroTheme="dark" keys off the `.hero` element the electric lead band carries),
 * so it is NOT handled here. FAQ open/close is native <details> — no JS.
 */
export function BlogV3Scripts() {
  useEffect(() => {
    const root = document.querySelector('.blogv3');
    if (!root) return;

    // ---- 1. reveal-on-scroll ----
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const revealEls = Array.from(root.querySelectorAll<HTMLElement>('.rv'));
    let io: IntersectionObserver | null = null;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

    if (reduced || !('IntersectionObserver' in window)) {
      revealEls.forEach((el) => el.classList.add('in'));
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
        { threshold: 0.08, rootMargin: '0px 0px -6% 0px' },
      );
      revealEls.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.92) el.classList.add('in');
        else io?.observe(el);
      });
      fallbackTimer = setTimeout(() => revealEls.forEach((el) => el.classList.add('in')), 900);
    }

    // ---- 2. TOC scroll-spy ----
    const tocLinks = Array.from(root.querySelectorAll<HTMLAnchorElement>('.toc a'));
    const headings = Array.from(root.querySelectorAll<HTMLElement>('.prose h2[id]'));
    let spy: IntersectionObserver | null = null;
    if (tocLinks.length && headings.length && 'IntersectionObserver' in window) {
      const map = new Map<string, HTMLAnchorElement>();
      tocLinks.forEach((a) => {
        const id = a.getAttribute('href')?.slice(1);
        if (id) map.set(id, a);
      });
      spy = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              const a = map.get(e.target.id);
              if (a) {
                tocLinks.forEach((l) => l.classList.remove('active'));
                a.classList.add('active');
              }
            }
          });
        },
        { rootMargin: '-88px 0px -70% 0px', threshold: 0 },
      );
      headings.forEach((h) => spy?.observe(h));
    }

    // ---- 3. copy-link share button ----
    const copyBtn = root.querySelector<HTMLButtonElement>('.share-row button[data-copy-url]');
    const onCopy = () => {
      const url = copyBtn?.getAttribute('data-copy-url') || window.location.href;
      if (navigator.clipboard) navigator.clipboard.writeText(url).catch(() => {});
      const lab = root.querySelector<HTMLElement>('.share-lab');
      if (lab) {
        const prev = lab.textContent;
        lab.textContent = 'Link copied';
        setTimeout(() => {
          lab.textContent = prev;
        }, 1800);
      }
    };
    copyBtn?.addEventListener('click', onCopy);

    return () => {
      io?.disconnect();
      spy?.disconnect();
      if (fallbackTimer) clearTimeout(fallbackTimer);
      copyBtn?.removeEventListener('click', onCopy);
    };
  }, []);

  return null;
}
