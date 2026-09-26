'use client';

import { useRef, useState, type ReactNode } from 'react';

/** A testimonial still that turns into the real video, in place, when played. */
export function VideoStill({ still, video, label, children }: { still: string; video: string; label: string; children: ReactNode }) {
  const [playing, setPlaying] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);
  return (
    <div className="v11-video-still">
      {playing ? (
        <video ref={ref} src={video} poster={still} controls autoPlay playsInline className="v11-video-el" />
      ) : (
        <button type="button" className="v11-video-btn" onClick={() => setPlaying(true)} aria-label={label}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={still} alt="" loading="lazy" />
          {children}
        </button>
      )}
    </div>
  );
}
