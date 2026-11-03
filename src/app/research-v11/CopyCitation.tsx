'use client';

import { useState, type ReactNode } from 'react';

/** Copies the paper's citation (the text of the element `target` names) to the clipboard. */
export function CopyCitation({ target, label, done }: { target: string; label: ReactNode; done: ReactNode }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="rs-copy"
      onClick={async () => {
        const text = document.getElementById(target)?.textContent?.trim();
        if (!text) return;
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        } catch {
          /* clipboard refused (no permission, insecure context): the citation stays selectable on the page */
        }
      }}
    >
      <span aria-live="polite">{copied ? done : label}</span>
    </button>
  );
}
