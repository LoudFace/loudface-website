'use client';

import { useState } from 'react';

/**
 * A testimonial clip: our poster and our play button until the reader presses
 * it, then the real player.
 *
 * Why this is a client component when the rest of the document is not:
 * a bare `<video controls poster>` paints Chromium's grey control bar straight
 * across the bottom of the still, on every clip, before anyone has asked for
 * it. Native controls cannot be restyled across browsers. In a document that
 * also names a price, that reads cheap — so the twelve lines of state below
 * buy back the first impression.
 *
 * Nothing about the access gate changes: this only ever renders on an already
 * unlocked page, and it downloads no video until the click.
 */
export function ProposalVideo({
  src,
  poster,
  label,
  size = 'md',
}: {
  src: string;
  poster?: string;
  label: string;
  /** `sm` is the rail thumbnail, where a 52px button would swallow the still. */
  size?: 'sm' | 'md';
}) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      // eslint-disable-next-line jsx-a11y/media-has-caption
      <video
        className="h-full w-full object-cover"
        src={src}
        poster={poster}
        controls
        autoPlay
        playsInline
        data-print="hide"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Play the clip: ${label}`}
      className="group relative block h-full w-full cursor-pointer"
    >
      {poster && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt="" className="h-full w-full object-cover" />
      )}
      {/* Keeps the button readable on a bright still. */}
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10"
        data-print="hide"
      />
      <span
        aria-hidden="true"
        className={`absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow-[0_6px_20px_-6px_rgba(0,0,0,0.55)] transition-transform duration-200 group-hover:scale-105 ${
          size === 'sm' ? 'h-[34px] w-[34px]' : 'h-[52px] w-[52px]'
        }`}
        data-print="hide"
      >
        <svg
          width={size === 'sm' ? 11 : 16}
          height={size === 'sm' ? 12 : 18}
          viewBox="0 0 16 18"
          fill="none"
        >
          <path d="M15 8.13a1 1 0 0 1 0 1.74L1.99 17.4A1 1 0 0 1 .5 16.53V1.47A1 1 0 0 1 1.99.6z" fill="#0a0a0a" />
        </svg>
      </span>
    </button>
  );
}
