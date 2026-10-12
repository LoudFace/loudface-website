'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight } from './ui';

/**
 * The capability tiles under the launch-stack steps (homepage What we do, 2026-10-12), about one and a half in view.
 * A native scroll-snap track, so touch and trackpads swipe it; the arrows step one tile and dim at either end, and
 * the track's edges fade where there is more to scroll (data-start / data-end).
 */
export function TileSlider({ prevLabel, nextLabel, children }: { prevLabel: string; nextLabel: string; children: ReactNode }) {
  const track = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft < 4, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    measure();
    el.addEventListener('scroll', measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => { el.removeEventListener('scroll', measure); ro.disconnect(); };
  }, [measure]);

  const step = (dir: 1 | -1) => {
    const el = track.current;
    const tile = el?.firstElementChild as HTMLElement | null;
    if (!el || !tile) return;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    const width = tile.offsetWidth + gap;
    const max = el.scrollWidth - el.clientWidth;
    const index = Math.max(0, Math.round(el.scrollLeft / width) + dir);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollTo({ left: Math.min(max, index * width), behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <div className="v11-tslide">
      <div ref={track} className="v11-tslide-track" data-start={edge.start ? '' : undefined} data-end={edge.end ? '' : undefined}>{children}</div>
      <div className="v11-tslide-controls">
        <button type="button" className="v11-arrow is-line" onClick={() => step(-1)} aria-label={prevLabel} disabled={edge.start}>
          <ArrowLeft />
        </button>
        <button type="button" className="v11-arrow is-line" onClick={() => step(1)} aria-label={nextLabel} disabled={edge.end}>
          <ArrowRight />
        </button>
      </div>
    </div>
  );
}
