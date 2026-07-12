import type { ReactNode } from 'react';
import type { HomeImages } from '../home-v3/data';

/**
 * Exhibits — the page signature. Three shipped sites, each on a shared night
 * mat, whose wall-label CREDITS the services that built it (chips route to the
 * real child pages). Alternating rows (CSS nth-of-type) so each exhibit
 * breathes; a stat interlude drops between exhibits 2 and 3 to break the rhythm
 * without pretending to be a fourth exhibit. Screenshots come from Sanity by
 * slug (images prop) with a hardcoded CDN fallback — same images the homepage
 * SelectedWork uses.
 */
const CDN = 'https://cdn.sanity.io/images/xjjjqhgt/production/';
const CROP = '?w=1200&h=780&fit=crop&crop=top&fm=webp&q=82';

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

type Credit = { label: ReactNode; href: string };

type Exhibit = {
  slug: string;
  domain: string;
  asset: string;
  alt: string;
  rpill: string;
  tag: string;
  name: string;
  dom: string;
  what: string;
  credits: Credit[];
  out: ReactNode;
};

const EXHIBITS: Exhibit[] = [
  {
    slug: 'liqid',
    domain: 'liqid.de',
    asset: '5f21404454406eee90732e4e1c8655e0c8c6013b-3024x3629.webp',
    alt: 'LIQID website built by LoudFace on Webflow',
    rpill: 'WEBFLOW AT SCALE',
    tag: 'Build track',
    name: 'LIQID',
    dom: 'liqid.de · Wealth management',
    what: 'A component-first Webflow rebuild for a regulated fintech — every page assembles from reusable blocks, so their in-house team launches and edits without a developer in the loop.',
    credits: [
      { label: <>Webflow design &amp; dev</>, href: '/services/webflow' },
      { label: 'UX/UI design', href: '/services/ux-ui-design' },
      { label: 'CRO', href: '/services/cro' },
    ],
    out: (
      <>
        Marketing ships new pages on its own — <span className="hot">no dev queue, no rebuilds.</span>
      </>
    ),
  },
  {
    slug: 'toku-ai-cited-pipeline',
    domain: 'toku.com',
    asset: 'bd1c09b494f7074c268f5b964d0c77dc1b1ef965-2880x1620.webp',
    alt: 'Toku website grown by LoudFace for AI visibility',
    rpill: '0 → 86% AI VISIBILITY',
    tag: 'Growth track',
    name: 'Toku',
    dom: 'toku.com · Payroll & compliance',
    what: 'An answer-engine program aimed at the buying question — when someone asks an AI which vendor to use, Toku had to be in the answer. We built the pages and signals that get a brand cited by name.',
    credits: [
      { label: <>SEO &amp; AEO</>, href: '/services/seo-aeo' },
      { label: 'GEO', href: '/services/geo-agency' },
      { label: 'Growth Autopilot', href: '/services/growth-autopilot' },
    ],
    out: (
      <>
        <span className="hot">0 → 86% AI visibility</span> — cited by name when buyers ask AI who to hire.
      </>
    ),
  },
  {
    slug: 'eraser',
    domain: 'eraser.io',
    asset: '2a7d29fdc9302c8482d70b73041e6c58ec9229a6-1440x1845.webp',
    alt: 'Eraser website built by LoudFace',
    rpill: 'PRODUCT-GRADE PAGES',
    tag: 'Build track',
    name: 'Eraser',
    dom: 'eraser.io · Developer tooling',
    what: 'Marketing pages for a design-and-diagram tool whose audience notices craft. Copy, layout, and build had to hold the product’s own visual standard — so we ran all three together.',
    credits: [
      { label: <>Webflow design &amp; dev</>, href: '/services/webflow' },
      { label: 'Copywriting', href: '/services/copywriting' },
      { label: 'UX/UI design', href: '/services/ux-ui-design' },
    ],
    out: (
      <>
        Launch pages that read like <span className="hot">the product built them.</span>
      </>
    ),
  },
];

function ExhibitBlock({ ex, images }: { ex: Exhibit; images?: HomeImages }) {
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
            <img src={src} alt={ex.alt} width={1200} height={780} loading="lazy" />
          </div>
        </div>
        <span className="rpill">
          <i></i>
          <b>{ex.rpill}</b>
          <span>{ex.name}</span>
        </span>
      </div>
      <div className="ex-label">
        <span className="ex-tag">
          <i></i>
          {ex.tag}
        </span>
        <div className="ex-name">
          <h3>{ex.name}</h3>
          <span className="dom">{ex.dom}</span>
        </div>
        <p className="ex-what">{ex.what}</p>
        <div className="ex-credits">
          <span className="mono-label">
            <i></i>Services that shipped it
          </span>
          <div className="credits">
            {ex.credits.map((c, i) => (
              <a className="credit" href={c.href} key={i}>
                {c.label} <ArrowIcon />
              </a>
            ))}
          </div>
        </div>
        <p className="ex-out">
          <em>Outcome</em>
          <b>{ex.out}</b>
        </p>
      </div>
    </article>
  );
}

export function Exhibits({ images }: { images?: HomeImages } = {}) {
  return (
    <section className="exhibits" id="work" aria-label="Selected work and the services behind it">
      <div className="container">
        <div className="ex-head">
          <div className="rv">
            <span className="eyebrow">
              <i></i>Selected work
            </span>
            <h2 className="display">
              What shipped — <span className="ghost">and what shipped it.</span>
            </h2>
            <p className="sub">
              Three sites, three different mixes of the same seven services. Each label credits the
              work behind it — follow a tag to the service.
            </p>
          </div>
          <span className="ex-note rv">Tap a service to open it</span>
        </div>

        <div className="exlist">
          <ExhibitBlock ex={EXHIBITS[0]} images={images} />
          <ExhibitBlock ex={EXHIBITS[1]} images={images} />

          {/* Interlude — a stat strip, not a 4th exhibit. */}
          <div className="ex-stats rv">
            <div className="es-nums">
              <div className="esf">
                <b>200+</b>
                <span>B2B SaaS sites shipped</span>
              </div>
              <div className="esf">
                <b>288%</b>
                <span>Best conversion increase</span>
                <span className="esf-src">
                  <i></i>Dimer Health · CRO · six-month optimization
                </span>
              </div>
              <div className="esf">
                <b>7</b>
                <span>Services, one team</span>
              </div>
            </div>
          </div>

          <ExhibitBlock ex={EXHIBITS[2]} images={images} />
        </div>
      </div>
    </section>
  );
}
