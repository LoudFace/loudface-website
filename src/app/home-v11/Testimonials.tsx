import type { CSSProperties, ReactNode } from 'react';
import type { HomeV11Content } from '@/lib/content-utils';
import { Eyebrow, H2, RATING_STYLE, Stars, img, tint } from './ui';
import { VideoPlaylist } from './VideoPlaylist';
import { CLIENT_VIDEOS_ANCHOR } from './client-videos';
import type { HomeV11Data, ProofKey } from './data';
import { proofValue } from './hero-slides';

type C = HomeV11Content['testimonials'];

/** Per card, in the content file's order; `proof` is the case-study figure the card prints. */
const CARDS: { brand: string; logo: string | null; w: number; h: number; alt: string; face: string | null; proof: ProofKey }[] = [
  { brand: '#1646ce', logo: 'logos/toku.png', w: 78, h: 22, alt: 'Toku', face: 'people/kenneth-o-friel.webp', proof: 'toku' },
  { brand: '#3d63e0', logo: null, w: 0, h: 0, alt: '', face: null, proof: 'genie' },
  { brand: '#c96a00', logo: 'logos/hayes-media.png', w: 69, h: 30, alt: 'Hayes Media', face: 'people/jordan-hayes.webp', proof: 'hayes' },
];

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
export function QuoteCard({ k, i, data }: { k: C['cards'][number]; i: number; data: HomeV11Data | null }) {
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
      <div className="v11-quote-big">{proofValue(data, cfg.proof)}</div>
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

export function Testimonials({ c, data }: { c: C; data: HomeV11Data | null }) {
  return (
    <section id={CLIENT_VIDEOS_ANCHOR} className="v11-sec v11-warm">
      <div className="v11-wrap">
        <div className="v11-head">
          <div>
            <Eyebrow>{c.eyebrow}</Eyebrow>
            <H2 html={c.heading} />
          </div>
          <div className="v11-ratings">{c.ratings.map((r, i) => <Rating key={i} r={r} i={i} />)}</div>
        </div>
        <VideoPlaylist videos={c.videos} playlist={c.playlist} />
        <div className="v11-cards3 is-second">
          {c.cards.map((k, i) => <QuoteCard key={i} k={k} i={i} data={data} />)}
        </div>
      </div>
    </section>
  );
}
