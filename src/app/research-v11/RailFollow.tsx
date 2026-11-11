'use client';

import { useEffect, useRef } from 'react';

/**
 * Keeps the contents rail's current link in view. On desktop the rail is sticky and its list scrolls inside itself
 * when a paper has more sections than the window is tall; TocSpy marks the section being read with aria-current, and
 * this scrolls the list (never the page) so that link stays visible. Render it next to the rail's `.rs-toc` nav.
 */
export function RailFollow() {
  const mark = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const list = mark.current?.parentElement?.querySelector<HTMLElement>('.rs-toc');
    if (!list) return;
    const follow = () => {
      const on = list.querySelector<HTMLElement>('a[aria-current]');
      if (!on || list.scrollHeight <= list.clientHeight) return;
      const top = on.offsetTop - list.offsetTop;
      const bottom = top + on.offsetHeight;
      if (top < list.scrollTop) list.scrollTop = top;
      else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight;
    };
    const watch = new MutationObserver(follow);
    watch.observe(list, { subtree: true, attributeFilter: ['aria-current'] });
    return () => watch.disconnect();
  }, []);

  return <span ref={mark} hidden />;
}
