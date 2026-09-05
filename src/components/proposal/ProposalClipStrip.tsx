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
 * The strip is CSS scroll-snap — no carousel library. The lightbox is a
 * native <dialog>: Escape closes it, focus is trapped, the backdrop is free.
 * Nothing downloads until a clip is opened.
 */
export function ProposalClipStrip({
  clips,
  variant = 'strip',
}: {
  clips: ProposalRailClip[];
  variant?: 'strip' | 'grid';
}) {
  const [open, setOpen] = useState<ProposalRailClip | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

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
        <div className="proposal-strip" data-print-keep>
          <div className="proposal-strip-track">
            {clips.map((clip) => (
              <div key={clip._key} className="proposal-strip-item">
                {tile(clip, 'aspect-[4/5]')}
              </div>
            ))}
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
