'use client';

import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight } from './ui';

/**
 * The hero's results rail, endless. The slides render three times; the middle copy is the real one and the
 * outer two are inert clones. Whenever the scroll settles outside the middle copy it jumps back by exactly one
 * copy, which looks identical, so the arrows never run out. It advances on its own every few seconds and
 * pauses on hover, focus, touch and reduced motion. Inside the inline editor only the real copy shows.
 */
const COPIES = [0, 1, 2];
const AUTO_MS = 4500;

export function HeroSlider({
  label, controls, prevLabel, nextLabel, children,
}: {
  label: ReactNode;
  controls: ReactNode;
  prevLabel: string;
  nextLabel: string;
  children: ReactNode;
}) {
  const track = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  const settle = useRef<number | undefined>(undefined);

  const copyWidth = () => {
    const el = track.current;
    const main = el?.querySelector<HTMLElement>('.v11-copy.is-main');
    return main ? main.scrollWidth : 0;
  };
  const slideWidth = () => track.current?.querySelector<HTMLElement>('.v11-slide')?.offsetWidth ?? 300;

  /** Keep the view inside the middle copy; the jump is invisible because the copies are identical. */
  const normalise = useCallback(() => {
    const el = track.current;
    const w = copyWidth();
    if (!el || !w) return;
    if (el.scrollLeft < w - 4) el.scrollLeft += w;
    else if (el.scrollLeft >= 2 * w - 4) el.scrollLeft -= w;
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    el.scrollLeft = copyWidth();
    const onScroll = () => {
      window.clearTimeout(settle.current);
      settle.current = window.setTimeout(normalise, 140);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    const ro = new ResizeObserver(() => { normalise(); });
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', onScroll);
      ro.disconnect();
      window.clearTimeout(settle.current);
    };
  }, [normalise]);

  const step = useCallback((dir: 1 | -1, count?: number) => {
    const el = track.current;
    if (!el) return;
    normalise();
    const w = slideWidth();
    const n = count ?? Math.max(1, Math.floor((el.clientWidth - 72) / w));
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: dir * n * w, behavior: reduce ? 'auto' : 'smooth' });
  }, [normalise]);

  // Slow auto-advance, one slide at a time.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (document.documentElement.closest('.lf-editing') || document.querySelector('.lf-editing')) return;
    const id = window.setInterval(() => {
      if (!paused.current && document.visibilityState === 'visible') step(1, 1);
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, [step]);

  const hold = (v: boolean) => () => { paused.current = v; };

  return (
    <div className="v11-band" onPointerEnter={hold(true)} onPointerLeave={hold(false)} onFocusCapture={hold(true)} onBlurCapture={hold(false)} onTouchStart={hold(true)}>
      <div className="v11-wrap v11-band-head">
        {label}
        <div className="v11-band-controls">
          {controls}
          <button type="button" className="v11-arrow is-quiet" onClick={() => step(-1, 1)} aria-label={prevLabel}>
            <ArrowLeft />
          </button>
          <button type="button" className="v11-arrow" onClick={() => step(1, 1)} aria-label={nextLabel}>
            <ArrowRight />
          </button>
        </div>
      </div>
      <div className="v11-track-shell">
        <div ref={track} className="v11-track">
          {COPIES.map((k) => (
            <div key={k} className={`v11-copy ${k === 1 ? 'is-main' : 'is-clone'}`} aria-hidden={k !== 1 || undefined} inert={k !== 1 || undefined}>
              {children}
            </div>
          ))}
        </div>
        <div className="v11-track-fade" aria-hidden="true" />
      </div>
    </div>
  );
}
