'use client';

import { useEffect, useRef } from 'react';

/**
 * Marks the contents link of the section being read. Render it inside a
 * `.sv-toc` nav: it draws nothing, finds the nav's `#id` links, and as the
 * reader scrolls it sets `aria-current="location"` on the link whose heading
 * last crossed the line below the sticky header. The nav stays a server render.
 */
const LINE = 140;

export function TocSpy() {
  const mark = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const nav = mark.current?.closest('nav');
    if (!nav) return;
    const links = Array.from(nav.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
    const heads = links.map((a) => document.getElementById(decodeURIComponent(a.hash.slice(1))));
    let active = -2;
    let frame = 0;

    const update = () => {
      frame = 0;
      let now = -1;
      heads.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top <= LINE) now = i;
      });
      if (now === active) return;
      active = now;
      links.forEach((a, i) => {
        if (i === now) a.setAttribute('aria-current', 'location');
        else a.removeAttribute('aria-current');
      });
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    return () => {
      window.removeEventListener('scroll', queue);
      window.removeEventListener('resize', queue);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return <span ref={mark} hidden />;
}
