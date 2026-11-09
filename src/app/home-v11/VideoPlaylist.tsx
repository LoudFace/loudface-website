'use client';

import { useState, type CSSProperties } from 'react';
import Link from 'next/link';
import type { HomeV11Content } from '@/lib/content-utils';
import { CLIENT_VIDEOS, type VideoKey } from './client-videos';
import { BrandMark, PlayChip } from './ClientVideoParts';
import { VideoStill } from './VideoStill';
import { ArrowRight, img } from './ui';

type C = HomeV11Content['testimonials'];

/** Playlist order, approved on the Paper board "Proposed · Client videos" (2026-11-09): the newest video first. */
const ORDER: VideoKey[] = ['kevin', 'maksim', 'sarig', 'daan', 'elizabete', 'kasimir'];
const ITEMS = ORDER.map((key) => {
  const n = CLIENT_VIDEOS.findIndex((v) => v.key === key);
  return { n, v: CLIENT_VIDEOS[n] };
});

const Bars = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 5v5M6 2v8M10 6v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
);

/**
 * The homepage's client videos: one large player with the client's words under it, and every client in a list beside
 * it. Picking a client in the list swaps the player and plays that video. Every quote is in the page; only the picked
 * client's shows.
 */
export function VideoPlaylist({ videos, playlist }: { videos: C['videos']; playlist: C['playlist'] }) {
  // `picks` counts clicks: each one remounts the player and plays, so picking the client already showing replays it.
  const [pick, setPick] = useState<{ key: VideoKey; picks: number }>({ key: ORDER[0], picks: 0 });
  const cur = ITEMS.find((it) => it.v.key === pick.key)!;
  const t = videos[cur.n];
  return (
    <div className="v11-vt" style={{ '--vt-tint': cur.v.tint } as CSSProperties}>
      <div className="v11-vt-feature">
        <VideoStill key={pick.picks} still={img(cur.v.still)} video={cur.v.video} client={cur.v.client} start={pick.picks > 0} portrait={cur.v.portrait}>
          <PlayChip duration={t.duration} size="lg" />
        </VideoStill>
        {ITEMS.map(({ n, v }) => (
          <div key={v.key} className="v11-vt-copy" hidden={v.key !== pick.key}>
            <BrandMark v={v} brand={videos[n].brand} />
            <div className="v11-vt-row">
              <p className="v11-vt-quote">{videos[n].quote}</p>
              <div className="v11-vt-who"><div className="is-name">{videos[n].person}</div><div className="is-role">{videos[n].jobTitle}</div></div>
            </div>
          </div>
        ))}
      </div>
      <div className="v11-vt-list">
        <div className="v11-vt-head">
          <h3>{playlist.heading}</h3>
          <span>{playlist.total}</span>
        </div>
        <ul>
          {ITEMS.map(({ n, v }) => {
            const on = v.key === pick.key;
            return (
              <li key={v.key}>
                <button type="button" aria-pressed={on} className={on ? 'is-on' : undefined} onClick={() => setPick((p) => ({ key: v.key, picks: p.picks + 1 }))}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img loading="lazy" src={img(v.still)} alt="" width={112} height={63} />
                  <span className="is-text"><span className="is-brand">{videos[n].brand}</span><span className="is-topic">{videos[n].topic}</span></span>
                  <span className="is-dur">{on && <Bars />}{videos[n].duration}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="v11-vt-foot">
          <span>{playlist.foot}</span>
          <Link href="/case-studies">{playlist.linkText}<ArrowRight /></Link>
        </div>
      </div>
    </div>
  );
}
