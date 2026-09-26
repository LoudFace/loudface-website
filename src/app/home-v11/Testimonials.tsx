import type { CSSProperties, ReactNode } from 'react';
import type { HomeV11Content } from '@/lib/content-utils';
import { Eyebrow, H2, RATING_STYLE, Stars, img, tint } from './ui';
import { VideoStill } from './VideoStill';

type C = HomeV11Content['testimonials'];

const VIDEOS = [
  { tint: '#e9e5fd', video: 'https://cdn.sanity.io/files/xjjjqhgt/proposals/b06b514be51d437bb81031a9f96cc6e5796767e6.mp4', still: 'video-maksim.jpg', logo: 'logos/color-outbound.png', w: 65, h: 26, alt: 'Outbound Specialist' },
  { tint: '#fde6dd', video: 'https://cdn.sanity.io/files/xjjjqhgt/proposals/cbba2c1526479ce38d8dab811802738ae3a1659b.mp4', still: 'video-dimer.jpg', logo: 'logos/color-dimer.png', w: 76, h: 26, alt: 'Dimer Health' },
  { tint: '#fcf0d4', video: 'https://cdn.sanity.io/files/xjjjqhgt/proposals/77f7444f1da7ed7a221c1637d897a0f4ec3e87aa.mp4', still: 'video-elizabete.jpg', logo: 'logos/reiterate-ink.png', w: 139, h: 16, alt: 'Reiterate' },
];
const CARDS = [
  { brand: '#1646ce', logo: 'logos/toku.png', w: 78, h: 22, alt: 'Toku', face: 'people/kenneth-o-friel.webp' },
  { brand: '#3d63e0', logo: null, w: 0, h: 0, alt: '', face: null },
  { brand: '#f8612d', logo: 'logos/brandfirm.png', w: 108, h: 22, alt: 'Brandfirm', face: 'people/daan-smit.webp' },
];

const Play = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3.2v9.6c0 .6.7 1 1.2.6l7.2-4.8c.4-.3.4-1 0-1.3L6.2 2.6C5.7 2.3 5 2.6 5 3.2z" fill="#ffffff" /></svg>
);

export function Rating({ r, i, size = 'lg' }: { r: { platform: string; score: string; detail?: string }; i: number; size?: 'lg' | 'sm' }) {
  const st = RATING_STYLE[i];
  const body: ReactNode = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img loading="lazy" src={img(st.icon)} alt="" width={size === 'lg' ? 28 : 24} height={size === 'lg' ? 28 : 24} className="v11-rating-icon" />
      <div>
        <div className="v11-rating-row">
          <span className="is-name">{r.platform}</span>
          <span className="is-score">{r.score}</span>
          <Stars fill={st.star} size={size === 'lg' ? 12 : 11} />
        </div>
        {r.detail !== undefined && <div className="v11-rating-detail">{r.detail}</div>}
      </div>
    </>
  );
  return st.href ? (
    <a href={st.href} className={`v11-rating is-${size}`} target="_blank" rel="noopener noreferrer">{body}</a>
  ) : (
    <div className={`v11-rating is-${size}`}>{body}</div>
  );
}

/** A client's number and their words on the client's own tint: the quote card, shared with inner pages (DESIGN.md, v11 component library). */
export function QuoteCard({ k, i }: { k: C['cards'][number]; i: number }) {
  const cfg = CARDS[i];
  const vars = { '--t1': tint(cfg.brand, 0.88), '--t2': tint(cfg.brand, 0.72), '--brand': cfg.brand, '--av': tint(cfg.brand, 0.7) } as CSSProperties;
  return (
    <div className="v11-quote" style={vars}>
      <span className="v11-quote-ring is-a" aria-hidden="true" />
      <span className="v11-quote-ring is-b" aria-hidden="true" />
      {cfg.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img loading="lazy" src={img(cfg.logo)} alt={cfg.alt} width={cfg.w} height={cfg.h} className="v11-quote-logo" style={{ height: cfg.h, width: 'auto' }} />
      ) : (
        <div className="v11-quote-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img loading="lazy" src={img('logos/genie-icon.png')} alt="" width={22} height={22} className="v11-case-icon" />
          <span>{k.brand}</span>
        </div>
      )}
      <div className="v11-quote-big">{k.metric}</div>
      <div className="v11-quote-cap">{k.caption}</div>
      <p className="v11-quote-text">{k.quote}</p>
      <div className="v11-quote-who">
        {cfg.face ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img loading="lazy" src={img(cfg.face)} alt="" width={40} height={40} className="v11-quote-face" />
        ) : (
          <span className="v11-quote-initial">{k.initial}</span>
        )}
        <div><div className="is-name">{k.person}</div><div className="is-role">{k.jobTitle}</div></div>
        <span className="is-src">{k.source}</span>
      </div>
    </div>
  );
}

/** A client video on its tint: the still with play and length, the logo, the quote and who said it. */
export function VideoCard({ v, i }: { v: C['videos'][number]; i: number }) {
  const cfg = VIDEOS[i];
  return (
    <div className="v11-video" style={{ background: cfg.tint }}>
      <VideoStill still={img(cfg.still)} video={cfg.video} label={`Play the video from ${cfg.alt}`}>
        <span className="v11-video-play">
          <span className="is-btn"><Play /></span>
          <span className="is-dur">{v.duration}</span>
        </span>
      </VideoStill>
      <div className="v11-video-copy">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img loading="lazy" src={img(cfg.logo)} alt={cfg.alt} width={cfg.w} height={cfg.h} style={{ height: cfg.h, width: 'auto' }} />
        <p className="v11-video-quote">{v.quote}</p>
        <div className="v11-video-who">
          <div><div className="is-name">{v.person}</div><div className="is-role">{v.jobTitle}</div></div>
          <span className="is-src">{v.source}</span>
        </div>
      </div>
    </div>
  );
}

export function Testimonials({ c }: { c: C }) {
  return (
    <section className="v11-sec v11-warm">
      <div className="v11-wrap">
        <div className="v11-head">
          <div>
            <Eyebrow>{c.eyebrow}</Eyebrow>
            <H2 html={c.heading} />
          </div>
          <div className="v11-ratings">{c.ratings.map((r, i) => <Rating key={i} r={r} i={i} />)}</div>
        </div>
        <div className="v11-cards3">
          {c.videos.map((v, i) => <VideoCard key={i} v={v} i={i} />)}
        </div>
        <div className="v11-cards3 is-second">
          {c.cards.map((k, i) => <QuoteCard key={i} k={k} i={i} />)}
        </div>
      </div>
    </section>
  );
}
