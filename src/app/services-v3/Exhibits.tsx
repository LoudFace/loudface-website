import type { HomeImages } from '../home-v3/data';
import type { ServicesExhibitsContent, ServicesExhibitItem } from '@/lib/content-utils';

/**
 * Exhibits — the page signature. Three shipped sites, each on a shared night
 * mat, whose wall-label CREDITS the services that built it (chips route to the
 * real child pages). Alternating rows (CSS nth-of-type) so each exhibit
 * breathes; a stat interlude drops between exhibits 2 and 3 to break the rhythm
 * without pretending to be a fourth exhibit. Screenshots come from Sanity by
 * slug (images prop) with a hardcoded CDN fallback — same images the homepage
 * SelectedWork uses.
 */
import Image from 'next/image';
const CDN = 'https://cdn.sanity.io/images/xjjjqhgt/production/';
const CROP = '?w=1200&h=780&fit=crop&crop=top&fm=webp&q=82';

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

type Credit = { href: string };

/** Structural only (image resolution + route hrefs) — the copy lives in ServicesExhibitsContent. */
type Exhibit = {
  slug: string;
  domain: string;
  asset: string;
  alt: string;
  credits: Credit[];
};

const EXHIBITS: Exhibit[] = [
  {
    slug: 'liqid',
    domain: 'liqid.de',
    asset: '5f21404454406eee90732e4e1c8655e0c8c6013b-3024x3629.webp',
    alt: 'LIQID website built by LoudFace on Webflow',
    credits: [{ href: '/services/webflow' }, { href: '/services/ux-ui-design' }, { href: '/services/cro' }],
  },
  {
    slug: 'toku-ai-cited-pipeline',
    domain: 'toku.com',
    asset: 'cafcfa6fadc9ea6d1d38391eda626fd12ff5e5a0-2880x1800.png',
    alt: 'Toku website grown by LoudFace for AI visibility',
    credits: [{ href: '/services/seo-aeo' }, { href: '/services/geo-agency' }, { href: '/services/growth-autopilot' }],
  },
  {
    slug: 'eraser',
    domain: 'eraser.io',
    asset: '2a7d29fdc9302c8482d70b73041e6c58ec9229a6-1440x1845.webp',
    alt: 'Eraser website built by LoudFace',
    credits: [{ href: '/services/webflow' }, { href: '/services/copywriting' }, { href: '/services/ux-ui-design' }],
  },
];

function ExhibitBlock({
  ex,
  item,
  creditsLabel,
  outcomeLabel,
  images,
}: {
  ex: Exhibit;
  item: ServicesExhibitItem;
  creditsLabel: string;
  outcomeLabel: string;
  images?: HomeImages;
}) {
  const src = (images?.[ex.slug] ?? CDN + ex.asset) + CROP;
  return (
    <article className="exhibit rv">
      <div className="ex-media">
        <div className="ex-frame">
          <div className="ex-bar" aria-hidden="true">
            <b></b>
            <b></b>
            <b></b>
            <span>{ex.domain}</span>
          </div>
          <div className="ex-shot">
            {/* sizes rounds UP (overestimating caps at the w=1200 source; underestimating
                would blur). Container maxes at 1200px ⇒ the shot never exceeds ~560px. */}
            <Image src={src} alt={ex.alt} width={1200} height={780} sizes="(max-width:1080px) 92vw, 560px" quality={82} loading="lazy" />
          </div>
        </div>
        <span className="rpill">
          <i></i>
          <b>{item.rpill}</b>
          <span>{item.clientName}</span>
        </span>
      </div>
      <div className="ex-label">
        <span className="ex-tag">
          <i></i>
          {item.tag}
        </span>
        <div className="ex-name">
          <h3>{item.clientName}</h3>
          <span className="dom">{item.dom}</span>
        </div>
        <p className="ex-what">{item.what}</p>
        <div className="ex-credits">
          <span className="mono-label">
            <i></i>{creditsLabel}
          </span>
          <div className="credits">
            {ex.credits.map((c, i) => (
              <a className="credit" href={c.href} key={i}>
                {item.credits[i]?.label} <ArrowIcon />
              </a>
            ))}
          </div>
        </div>
        <p className="ex-out">
          <em>{outcomeLabel}</em>
          <b>{item.outPrefix}<span className="hot">{item.outHighlight}</span>{item.outSuffix}</b>
        </p>
      </div>
    </article>
  );
}

export function Exhibits({
  images,
  content,
}: {
  images?: HomeImages;
  content: ServicesExhibitsContent;
}) {
  return (
    <section className="exhibits" id="work" aria-label="Selected work and the services behind it">
      <div className="container">
        <div className="ex-head">
          <div className="rv">
            <span className="eyebrow">
              <i></i>{content.eyebrow}
            </span>
            <h2 className="display">
              {content.headline} <span className="ghost">{content.headlineHighlight}</span>
            </h2>
            <p className="sub">
              {content.intro}
            </p>
          </div>
          <span className="ex-note rv">{content.noteText}</span>
        </div>

        <div className="exlist">
          <ExhibitBlock
            ex={EXHIBITS[0]}
            item={content.items[0]}
            creditsLabel={content.creditsLabel}
            outcomeLabel={content.outcomeLabel}
            images={images}
          />
          <ExhibitBlock
            ex={EXHIBITS[1]}
            item={content.items[1]}
            creditsLabel={content.creditsLabel}
            outcomeLabel={content.outcomeLabel}
            images={images}
          />

          {/* Interlude — a stat strip, not a 4th exhibit. */}
          <div className="ex-stats rv">
            <div className="es-nums">
              <div className="esf">
                <b>{content.stats[0].value}</b>
                <span>{content.stats[0].label}</span>
              </div>
              <div className="esf">
                <b>{content.stats[1].value}</b>
                <span>{content.stats[1].label}</span>
                <span className="esf-src">
                  <i></i>{content.stats[1].source}
                </span>
              </div>
              <div className="esf">
                <b>{content.stats[2].value}</b>
                <span>{content.stats[2].label}</span>
              </div>
            </div>
          </div>

          <ExhibitBlock
            ex={EXHIBITS[2]}
            item={content.items[2]}
            creditsLabel={content.creditsLabel}
            outcomeLabel={content.outcomeLabel}
            images={images}
          />
        </div>
      </div>
    </section>
  );
}
