'use client';

import { useState, type ReactNode } from 'react';

/**
 * The video takes focus when it appears, since the play button (or the playlist row) that started it is gone or
 * elsewhere, and scrolls into view: on a phone the player sits above the list the visitor tapped.
 */
const focusOnMount = (el: HTMLVideoElement | null) => {
  el?.focus({ preventScroll: true });
  el?.scrollIntoView({ block: 'nearest' });
};

/**
 * A testimonial still that turns into the real video, in place, when played. `start` plays it as soon as it mounts:
 * the playlist remounts it (a new `key`) on every pick, and that click is the play. A `portrait` video is shown whole
 * on the dark ground instead of cropped to the frame.
 */
export function VideoStill({ still, video, client, start = false, portrait = false, children }: { still: string; video: string; client: string; start?: boolean; portrait?: boolean; children: ReactNode }) {
  const [playing, setPlaying] = useState(start);
  return (
    <div className="v11-video-still">
      {playing ? (
        <video ref={focusOnMount} src={video} poster={still} aria-label={`Video from ${client}`} controls autoPlay playsInline className={`v11-video-el${portrait ? ' is-portrait' : ''}`} />
      ) : (
        <button type="button" className="v11-video-btn" onClick={() => setPlaying(true)} aria-label={`Play the video from ${client}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={still} alt="" loading="lazy" />
          {children}
        </button>
      )}
    </div>
  );
}
