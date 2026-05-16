'use client';

/**
 * CodeBlockEnhancer — wires up the copy buttons on `.code-block` wrappers
 * emitted by html-utils#wrapCodeBlocks. Server-rendered markup is inert;
 * this island finds it after mount and adds:
 *
 *   - click handler on `[data-copy]` that copies the inner `<pre>` text
 *   - visual feedback (transient "Copied" state)
 *
 * Renders nothing — it's a behavioral island, not a UI component. Mount
 * once per article body (inside the blog post page).
 */

import { useEffect } from 'react';

export function CodeBlockEnhancer() {
  useEffect(() => {
    const blocks = document.querySelectorAll<HTMLElement>('.code-block');
    const cleanup: Array<() => void> = [];

    for (const block of blocks) {
      const button = block.querySelector<HTMLButtonElement>('[data-copy]');
      const pre = block.querySelector<HTMLPreElement>('pre');
      if (!button || !pre) continue;

      const handler = async () => {
        const text = pre.innerText;
        try {
          await navigator.clipboard.writeText(text);
          button.dataset.state = 'copied';
          button.textContent = 'Copied';
          window.setTimeout(() => {
            delete button.dataset.state;
            button.textContent = 'Copy';
          }, 1600);
        } catch {
          // Clipboard API unavailable (rare). Fall back to selection.
          const range = document.createRange();
          range.selectNodeContents(pre);
          const sel = window.getSelection();
          if (sel) {
            sel.removeAllRanges();
            sel.addRange(range);
          }
        }
      };

      button.addEventListener('click', handler);
      cleanup.push(() => button.removeEventListener('click', handler));
    }

    return () => {
      for (const fn of cleanup) fn();
    };
  }, []);

  return null;
}
