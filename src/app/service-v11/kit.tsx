import type { CSSProperties, ReactNode } from 'react';
import type { HomeV11Data, Series } from '../home-v11/data';
import { LiveChart } from '../home-v11/LiveChart';
import { VideoStill } from '../home-v11/VideoStill';
import { img } from '../home-v11/ui';
import { cachedCmsImage, cachedCmsSrcSet } from '@/lib/image-utils';

/**
 * The service pages' shared parts (DESIGN.md v11): small product-UI cards, status tags and the proof cells.
 * Every service page composes these with its own content; nothing here carries page copy.
 */

export const Marks = () => (
  <>
    <i className="v11-m is-tl" aria-hidden="true" />
    <i className="v11-m is-tr" aria-hidden="true" />
    <i className="v11-m is-bl" aria-hidden="true" />
    <i className="v11-m is-br" aria-hidden="true" />
  </>
);

export const Check = ({ size = 10, color = '#ffffff' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 11 11" aria-hidden="true"><path d="M2.2 5.6l2 2 4.4-4.5" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

export const Play = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3.2v9.6c0 .6.7 1 1.2.6l7.2-4.8c.4-.3.4-1 0-1.3L6.2 2.6C5.7 2.3 5 2.6 5 3.2z" fill="#ffffff" /></svg>
);

/** A white product-UI card sitting on a tile. `at` pins it: bottom (full width), or right (beside the copy). */
export function Ui({ children, className = '', style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return <div className={`sk-ui ${className}`} style={style}>{children}</div>;
}

export function UiHead({ left, right }: { left: ReactNode; right?: ReactNode }) {
  return (
    <div className="sk-ui-head">
      <span>{left}</span>
      {right && <span>{right}</span>}
    </div>
  );
}

type Tone = 'good' | 'ind' | 'grey' | 'warn';
export function Tag({ tone = 'good', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`sk-tag is-${tone}`}>{children}</span>;
}

/** One row of a small table: a label left, a value and/or a tag right. */
export function Row({ k, v, tag, tone }: { k: ReactNode; v?: ReactNode; tag?: ReactNode; tone?: Tone }) {
  return (
    <div className="sk-row">
      <span className="is-k">{k}</span>
      <span className="is-v">
        {v && <b>{v}</b>}
        {tag && <Tag tone={tone}>{tag}</Tag>}
      </span>
    </div>
  );
}

/** A floating white pill with a check: the finished-state annotation. */
export function CheckPill({ children }: { children: ReactNode }) {
  return (
    <div className="sk-pill">
      <span className="is-dot"><Check /></span>
      <span>{children}</span>
    </div>
  );
}

/** A browser frame around a client screenshot. */
export function Browser({ src, domain, alt, height, className = '', priority }: { src: string; domain: string; alt: string; height?: number; className?: string; priority?: boolean }) {
  // CMS shots go through Vercel's image cache (next.config); a phone gets the 828px copy
  const srcSet = cachedCmsSrcSet(src, [828, 1920]);
  return (
    <div className={`sk-browser ${className}`}>
      <div className="sk-browser-bar">
        <span className="v11-lights" aria-hidden="true"><span /><span /><span /></span>
        <span className="sk-browser-url">{domain}</span>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={cachedCmsImage(src, 1920)} srcSet={srcSet} sizes={srcSet ? '(max-width: 767px) 92vw, 1440px' : undefined} alt={alt} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : undefined} style={height ? { height } : undefined} />
    </div>
  );
}

/* =========================================================== proof cells */

export const VIDEOS = {
  maksim: { video: 'https://cdn.sanity.io/files/xjjjqhgt/proposals/b06b514be51d437bb81031a9f96cc6e5796767e6.mp4', still: 'video-maksim.jpg', logo: 'logos/color-outbound.png', w: 75, h: 30, alt: 'Outbound Specialist' },
  sarig: { video: 'https://cdn.sanity.io/files/xjjjqhgt/proposals/cbba2c1526479ce38d8dab811802738ae3a1659b.mp4', still: 'video-dimer.jpg', logo: 'logos/color-dimer.png', w: 88, h: 30, alt: 'Dimer Health' },
  elizabete: { video: 'https://cdn.sanity.io/files/xjjjqhgt/proposals/77f7444f1da7ed7a221c1637d897a0f4ec3e87aa.mp4', still: 'video-elizabete.jpg', logo: 'logos/reiterate-ink.png', w: 139, h: 16, alt: 'Reiterate' },
} as const;

/** The wide cell: a client talking, next to what they got. */
export function VideoCell({ who, big, cap, quote, person, role, duration }: { who: keyof typeof VIDEOS; big?: string; cap?: string; quote: string; person: string; role: string; duration: string }) {
  const v = VIDEOS[who];
  return (
    <div className="cro-cell is-video">
      <Marks />
      <div className="cro-video">
        <VideoStill still={img(v.still)} video={v.video} label={`Play the video from ${v.alt}`}>
          <span className="v11-video-play"><span className="is-btn"><Play /></span><span className="is-dur">{duration}</span></span>
        </VideoStill>
      </div>
      <div className="cro-video-copy">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img loading="lazy" src={img(v.logo)} alt={v.alt} width={v.w} height={v.h} style={{ height: v.h > 20 ? 26 : 16 }} />
        {big && <div className="cro-big">{big}</div>}
        {cap && <div className="cro-cap">{cap}</div>}
        <p className="cro-quote">{quote}</p>
        <div className="cro-who"><span className="is-name">{person}</span><span>{role}</span></div>
      </div>
    </div>
  );
}

/** A number with a before/after pair of bars. */
export function BarsCell({ tag, client, big, cap, before, after, tone = 'ind' }: { tag: string; client: string; big: string; cap: string; before: string; after: string; tone?: 'ind' | 'ink' }) {
  return (
    <div className="cro-cell">
      <Marks />
      <div className="cro-tag"><span className="is-tag">{tag}</span><span>· {client}</span></div>
      <div className={`cro-big ${tone === 'ind' ? 'is-ind' : ''}`}>{big}</div>
      <div className="cro-cap">{cap}</div>
      <svg className="cro-bars" viewBox="0 0 300 150" aria-hidden="true">
        <defs><pattern id={`sk-h-${client.replace(/\W/g, '')}`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#4f46e5" strokeOpacity="0.35" strokeWidth="2" /></pattern></defs>
        <line x1="0" x2="300" y1="130" y2="130" stroke="#dcdbe6" />
        <rect x="40" y="97" width="80" height="33" rx="3" fill="#ecebf3" />
        <rect x="180" y="2" width="80" height="128" rx="3" fill={`url(#sk-h-${client.replace(/\W/g, '')})`} stroke="#4f46e5" strokeWidth="1.5" />
        <text x="80" y="146" textAnchor="middle" className="is-axis">{before}</text>
        <text x="220" y="146" textAnchor="middle" className="is-axis">{after}</text>
      </svg>
    </div>
  );
}

type Slide = { tag: string; client: string; metric: string; caption: string; periodStart: string; periodEnd: string; tip: string };

/** A live chart on a published case-study series. */
export function ChartCell({ slide, series, format = 'index', big, wide }: { slide: Slide; series?: Series; format?: 'index' | 'indexWeek' | 'pct'; big?: string; wide?: boolean }) {
  return (
    <div className={`cro-cell ${wide ? 'is-wide' : ''}`}>
      <Marks />
      <div className="cro-tag"><span className="is-tag">{slide.tag}</span><span>· {slide.client}</span></div>
      <div className="cro-big">{big ?? slide.metric}</div>
      <div className="cro-cap">{slide.caption}</div>
      <div className="cro-chart">
        {series && <LiveChart series={series} height={wide ? 210 : 170} margin={{ top: 22, right: 10, bottom: 6, left: 10 }} dots={false} hatch lineWidth={1.75} barGap={0.5} pin={20} end="plain" tip={slide.tip} format={format} />}
      </div>
      <div className="cro-dates"><span>{slide.periodStart}</span><span>{slide.periodEnd}</span></div>
    </div>
  );
}

/**
 * A client's word next to their number. `logoUrl` takes a CMS logo; `big` and `cap` are optional for a quote alone.
 * A client with no wordmark passes `brandIcon` (its app icon, drawn beside `logoAlt`); a person with no photo gets `initial`.
 * `review` links the published review the words come from (Clutch, Trustpilot), at the right of the name line.
 */
export function QuoteCell({ logo, logoUrl, logoAlt, logoW, logoH, brandIcon, big, cap, quote, person, role, face, faceUrl, initial, review, tone = 'ink', wide, className = '', children }: { logo?: string; logoUrl?: string; logoAlt: string; logoW: number; logoH: number; brandIcon?: string; big?: string; cap?: string; quote: string; person: string; role: string; face?: string; faceUrl?: string; initial?: string; review?: { href: string; label: string }; tone?: 'ink' | 'ind' | 'orange'; wide?: boolean; className?: string; children?: ReactNode }) {
  const faceSrc = cachedCmsImage(faceUrl, 96) ?? (face ? img(face) : undefined);
  const logoSrc = cachedCmsImage(logoUrl, 384) ?? (logo ? img(logo) : undefined);
  return (
    <div className={`cro-cell ${wide ? 'is-wide is-quote' : ''} ${className}`}>
      <Marks />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {logoSrc && <img loading="lazy" src={logoSrc} alt={logoAlt} width={logoW} height={logoH} className="cro-logo" />}
      {!logoSrc && brandIcon && (
        <div className="cro-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img loading="lazy" src={img(brandIcon)} alt="" width={28} height={28} />
          <span>{logoAlt}</span>
        </div>
      )}
      {big && <div className={`cro-big ${tone === 'ind' ? 'is-ind' : tone === 'orange' ? 'is-orange' : ''}`}>{big}</div>}
      {cap && <div className="cro-cap">{cap}</div>}
      {children}
      <p className="cro-quote">{quote}</p>
      <div className="cro-who">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {faceSrc && <img loading="lazy" src={faceSrc} alt="" width={32} height={32} />}
        {!faceSrc && initial && <span className="cro-initial" aria-hidden="true">{initial}</span>}
        <span><span className="is-name">{person}</span><span>{role}</span></span>
        {review && (
          <a className="cro-review" href={review.href} target="_blank" rel="noopener noreferrer">
            <span>{review.label}</span>
            <svg width="11" height="11" viewBox="0 0 11 11" aria-hidden="true"><path d="M3 8 8 3M4 3h4v4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </a>
        )}
      </div>
    </div>
  );
}

/** A plain number: for facts with no series behind them. */
export function StatCell({ tag, client, big, cap, children, tone = 'ink' }: { tag: string; client?: string; big: string; cap: string; children?: ReactNode; tone?: 'ink' | 'ind' }) {
  return (
    <div className="cro-cell">
      <Marks />
      <div className="cro-tag"><span className="is-tag">{tag}</span>{client && <span>· {client}</span>}</div>
      <div className={`cro-big ${tone === 'ind' ? 'is-ind' : ''}`}>{big}</div>
      <div className="cro-cap">{cap}</div>
      {children && <div className="cro-stat-art">{children}</div>}
    </div>
  );
}

export type { HomeV11Data, Slide };
