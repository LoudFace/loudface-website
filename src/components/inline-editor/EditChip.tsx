'use client';

/**
 * The way back in after "View site".
 *
 * A client who pressed "View site" is looking at their own published page:
 * animations running, nothing outlined, no bar. This chip is the one thing on
 * it that belongs to us, and it only appears for the browser that pressed the
 * button — it renders from the `lf-paused` cookie and from nothing else.
 *
 * It costs an anonymous visitor nothing. The server always renders null, the
 * first client render matches (so there is no hydration mismatch), and only
 * then does an effect read `document.cookie`. No request, no header, no work.
 */
import { useEffect, useState } from 'react';
import { isPaused, resumeHref } from '../../lib/inline-edit/guard';

export function EditChip() {
  const [href, setHref] = useState<string | null>(null);

  useEffect(() => {
    if (!isPaused(document.cookie)) return;
    setHref(resumeHref(window.location.pathname));
  }, []);

  if (!href) return null;

  return (
    <a
      data-lf-chrome=""
      href={href}
      style={{
        position: 'fixed',
        right: 16,
        bottom: 16,
        zIndex: 2147482000,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        height: 36,
        padding: '0 14px',
        borderRadius: 999,
        background: '#4f46e5',
        color: '#fff',
        font: '600 13px/1 Inter, ui-sans-serif, system-ui, -apple-system, sans-serif',
        textDecoration: 'none',
        boxShadow: '0 8px 24px rgba(20,33,43,.22)',
      }}
    >
      <svg
        viewBox="0 0 24 24"
        width={15}
        height={15}
        aria-hidden="true"
        style={{ stroke: 'currentColor', fill: 'none', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }}
      >
        <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
      Edit this page
    </a>
  );
}
