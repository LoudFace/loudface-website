'use client';

/**
 * FloatingToc — mobile-only TOC affordance.
 *
 * The desktop article layout has a sticky TOC in the far-left margin
 * (.blog-body__toc). On md and below that sidebar is hidden — visitors
 * can't see section navigation. This component fills the gap:
 *
 *   - Small floating button bottom-right
 *   - Tap to open a full-height bottom sheet with all H2 anchors
 *   - Tap an entry → scroll + close
 *   - Tap backdrop / press Escape / scroll backwards 240px → close
 *
 * Hidden on lg+ (the sticky sidebar takes over). Respects
 * `prefers-reduced-motion` (instant open/close, no slide animation).
 */

import { useEffect, useRef, useState } from 'react';

export interface FloatingTocItem {
  id: string;
  text: string;
}

interface FloatingTocProps {
  items: FloatingTocItem[];
}

export function FloatingToc({ items }: FloatingTocProps) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // Lock body scroll while sheet is open
  useEffect(() => {
    if (open) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [open]);

  if (!items.length) return null;

  const handleJump = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const target = document.getElementById(id);
    if (target) {
      setOpen(false);
      // Wait a tick so the sheet can close before the scroll fires; smooth
      // scroll on an open modal is jittery on iOS.
      window.setTimeout(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', `#${id}`);
      }, 10);
    }
  };

  return (
    <>
      <button
        type="button"
        className="floating-toc__btn"
        onClick={() => setOpen(true)}
        aria-label={`Open table of contents (${items.length} sections)`}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="floating-toc__btn-icon" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className="floating-toc__btn-text">On this page</span>
        <span className="floating-toc__btn-count" aria-hidden="true">{items.length}</span>
      </button>

      {open && (
        <div className="floating-toc__overlay" onClick={() => setOpen(false)}>
          <div
            ref={dialogRef}
            className="floating-toc__sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Table of contents"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="floating-toc__head">
              <span className="floating-toc__label">
                <span aria-hidden="true" className="floating-toc__rule" />
                On this page
              </span>
              <button
                type="button"
                className="floating-toc__close"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                Close
              </button>
            </header>
            <ol className="floating-toc__list">
              {items.map((item, i) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => handleJump(e, item.id)}
                  >
                    <span aria-hidden="true" className="floating-toc__num">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span>{item.text}</span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </>
  );
}
