'use client';

import { useEffect, useRef, useState } from 'react';
import type { ProposalRailClip } from '@/sanity/lib/proposalsClient';

/**
 * Every clip, in a rail 296px wide, with portrait and landscape mixed.
 *
 * The answer is to separate the TILE from the PLAYER. Tiles are one shape
 * for every clip (4:5, cropped to the face — a still can be cropped), so the
 * strip reads as one row and shows all of them. Play opens the clip in a
 * lightbox at its OWN shape (a video must not be cropped), portrait tall,
 * landscape wide. Nothing is letterboxed, nothing is squeezed.
 *
 * `variant="grid"` is the alternative: native-shape tiles packed two across.
 * Honest about the shapes, but taller and more ragged.
 *
 * The strip is a CSS scroll-snap row — no carousel library — with two
 * minimal arrows on the label row that page it one tile at a time. Each arrow
 * hides at its own end so the row never looks like it has more than it does
 * (Arnel, 2026-09-18: readers could not tell the strip scrolled). The lightbox
 * is a native <dialog>: Escape closes it, focus is trapped, the backdrop is
 * free. Nothing downloads until a clip is opened.
 */
export function ProposalClipStrip({
  clips,
  variant = 'strip',
  label,
}: {
  clips: ProposalRailClip[];
  variant?: 'strip' | 'grid';
  /** Small-caps label drawn on the same row as the arrows. */
  label?: React.ReactNode;
}) {
  const [open, setOpen] = useState<ProposalRailClip | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const [ends, setEnds] = useState({ atStart: true, atEnd: true });

  // Which arrows to show: read the real scroll position, never assume from
  // the clip count, because tile width depends on the rail width.
  useEffect(() => {
    const el = stripRef.current;
    if (!el || variant !== 'strip') return;
    const read = () => {
      const max = el.scrollWidth - el.clientWidth;
      setEnds({ atStart: el.scrollLeft <= 2, atEnd: el.scrollLeft >= max - 2 });
    };
    read();
    el.addEventListener('scroll', read, { passive: true });
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', read);
      ro.disconnect();
    };
  }, [variant, clips.length]);

  const page = (dir: 1 | -1) => {
    const el = stripRef.current;
    if (!el) return;
    // One tile plus its gap, measured from the first two tiles so the step
    // stays right whatever the stylesheet sets.
    const items = el.querySelectorAll<HTMLElement>('.proposal-strip-item');
    const step =
      items.length > 1 ? items[1].offsetLeft - items[0].offsetLeft : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  const arrow = (dir: 1 | -1, hidden: boolean) => (
    <button
      type="button"
      onClick={() => page(dir)}
      aria-label={dir === 1 ? 'Next clip' : 'Previous clip'}
      tabIndex={hidden ? -1 : 0}
      className={`flex h-6 w-6 items-center justify-center rounded-full border border-surface-200 bg-white text-surface-700 transition-opacity hover:border-surface-400 hover:text-surface-950 ${hidden ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
      data-print="hide"
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
        <path d={dir === 1 ? 'M3.5 1.5 7 5l-3.5 3.5' : 'M6.5 1.5 3 5l3.5 3.5'} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const portrait = open?.orientation === 'portrait';

  const tile = (clip: ProposalRailClip, shape: string) => (
    <figure key={clip._key} data-print-keep className="min-w-0">
      <button
        type="button"
        onClick={() => clip.videoUrl && setOpen(clip)}
        aria-label={`Play: ${clip.name ?? clip.label ?? 'client clip'}`}
        className={`group relative block w-full overflow-hidden rounded-lg bg-surface-900 text-left ${shape}`}
        data-proposal-card
      >
        {clip.posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={clip.posterUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-end bg-surface-200 p-2 text-[11px] leading-tight text-surface-500">
            {clip.name ?? clip.label ?? 'Clip'}
          </span>
        )}
        {clip.videoUrl && (
          <>
            <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" data-print="hide" />
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 flex h-[34px] w-[34px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow-[0_6px_20px_-6px_rgba(0,0,0,0.55)] transition-transform duration-200 group-hover:scale-105"
              data-print="hide"
            >
              <svg width="11" height="12" viewBox="0 0 16 18" fill="none">
                <path d="M15 8.13a1 1 0 0 1 0 1.74L1.99 17.4A1 1 0 0 1 .5 16.53V1.47A1 1 0 0 1 1.99.6z" fill="#0a0a0a" />
              </svg>
            </span>
            {clip.duration && (
              <span className="absolute bottom-1.5 right-1.5 rounded-md bg-black/55 px-1.5 py-0.5 text-[10.5px] font-medium tabular-nums text-white" data-print="hide">
                {clip.duration}
              </span>
            )}
          </>
        )}
      </button>
      {(clip.name || clip.label) && (
        <figcaption className="mt-1.5 text-[11.5px] leading-snug text-surface-500">
          {clip.name && <span className="font-medium text-surface-900">{clip.name}</span>}
          {clip.name && clip.label ? ' · ' : ''}
          {clip.label}
        </figcaption>
      )}
    </figure>
  );

  return (
    <>
      {variant === 'grid' ? (
        <div className="grid grid-cols-2 gap-x-2.5 gap-y-3">
          {clips.map((clip) =>
            clip.orientation === 'portrait'
              ? tile(clip, 'aspect-[9/16]')
              : <div key={clip._key} className="col-span-2">{tile(clip, 'aspect-video')}</div>
          )}
        </div>
      ) : (
        <div data-print-keep>
          {(label || clips.length > 1) && (
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="min-w-0">{label}</div>
              {clips.length > 1 && (
                <div className="flex shrink-0 items-center gap-1.5" data-print="hide">
                  {arrow(-1, ends.atStart)}
                  {arrow(1, ends.atEnd)}
                </div>
              )}
            </div>
          )}
          <div ref={stripRef} className="proposal-strip">
            <div className="proposal-strip-track">
              {clips.map((clip) => (
                <div key={clip._key} className="proposal-strip-item">
                  {tile(clip, 'aspect-[4/5]')}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(null)}
        onClick={(e) => { if (e.target === e.currentTarget) setOpen(null); }}
        className="proposal-dialog"
        aria-label={open?.name ?? open?.label ?? 'Client clip'}
      >
        {open?.videoUrl && (
          <div className={`proposal-dialog-inner ${portrait ? 'is-portrait' : 'is-landscape'}`}>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video src={open.videoUrl} poster={open.posterUrl} controls autoPlay playsInline className="block h-full w-full" />
            <p className="mt-2 text-[12.5px] text-white/70">
              {open.name && <span className="font-medium text-white">{open.name}</span>}
              {open.name && open.label ? ' · ' : ''}
              {open.label}
            </p>
            <button type="button" onClick={() => setOpen(null)} className="absolute -top-10 right-0 text-[12.5px] font-medium text-white/80 hover:text-white">
              Close
            </button>
          </div>
        )}
      </dialog>
    </>
  );
}
