import type { HomeImages } from '../home-v3/data';

/**
 * HeroServices — the deep-indigo "the work is the pitch" hero: a strict copy
 * budget (eyebrow + h1 + sub + CTA row) beside the vertically-scrolling work
 * wall (two counter-drifting columns of client screenshots). Verbatim HeroV3
 * anatomy. Screenshots come from Sanity by slug (images prop) with a hardcoded
 * CDN fallback, so a missing doc or fetch failure can never blank a card.
 */
const CDN = 'https://cdn.sanity.io/images/xjjjqhgt/production/';
const CROP = '?w=900&h=1050&fit=crop&crop=top&fm=webp&q=82';

type WallCard = {
  slug: string;
  domain: string;
  asset: string;
  label: string;
  client: string;
  alt: string;
  eager?: boolean;
};

const COL_A: WallCard[] = [
  { slug: 'dimer-health', domain: 'dimerhealth.com', asset: 'a0f4750b896ced6ffca9c5869623b15614f312ba-1440x10131.webp', label: 'BUILD', client: 'Dimer Health', alt: 'Dimer Health website built by LoudFace', eager: true },
  { slug: 'montblanc', domain: 'montblanc.com', asset: 'a9110ec997f7a351bb9b90347bef4abf6b6b02fc-3024x1890.jpg', label: 'BUILD', client: 'Montblanc', alt: 'Montblanc microsite built by LoudFace' },
  { slug: 'hoxhunt', domain: 'hoxhunt.com', asset: '3ac92e2393c7a26dc96f737c27d7faf49fbe6243-1440x8455.jpg', label: 'BUILD + GROWTH', client: 'Hoxhunt', alt: 'Hoxhunt website built by LoudFace' },
  { slug: 'outbound-specialist', domain: 'outboundspecialist.com', asset: 'd90a9cec8351f259afd300dcbc51641ed9b40c3d-1440x1845.webp', label: 'BUILD', client: 'Outbound', alt: 'Outbound Specialist website built by LoudFace' },
];

const COL_B: WallCard[] = [
  { slug: 'toku-ai-cited-pipeline', domain: 'toku.com', asset: 'bd1c09b494f7074c268f5b964d0c77dc1b1ef965-2880x1620.webp', label: '0 → 86% AI VISIBILITY', client: 'Toku', alt: 'Toku website grown by LoudFace', eager: true },
  { slug: 'radisson-hotels-group', domain: 'radissonhotels.com', asset: '7d8ef15a548457e46a262f4ef9617e3260d10722-1440x1845.jpg', label: 'BUILD', client: 'Radisson', alt: 'Radisson Hotels Group platform built by LoudFace' },
  { slug: 'liqid', domain: 'liqid.de', asset: '5f21404454406eee90732e4e1c8655e0c8c6013b-3024x3629.webp', label: 'BUILD', client: 'LIQID', alt: 'LIQID website built by LoudFace' },
  { slug: 'eraser', domain: 'eraser.io', asset: '2a7d29fdc9302c8482d70b73041e6c58ec9229a6-1440x1845.webp', label: 'BUILD', client: 'Eraser', alt: 'Eraser website built by LoudFace' },
];

function Card({ c, dup, images }: { c: WallCard; dup?: boolean; images?: HomeImages }) {
  const src = (images?.[c.slug] ?? CDN + c.asset) + CROP;
  return (
    <article className="wcard" aria-hidden={dup || undefined}>
      <div className="bar" aria-hidden="true">
        <b></b>
        <b></b>
        <b></b>
        <span>{c.domain}</span>
      </div>
      <div className="shot">
        <img
          src={src}
          alt={dup ? '' : c.alt}
          width={900}
          height={1050}
          loading={c.eager && !dup ? 'eager' : 'lazy'}
          {...(c.eager && !dup ? { fetchPriority: 'high' as const } : {})}
        />
      </div>
      <span className="rpill">
        <i></i>
        <b>{c.label}</b>
        <span>{c.client}</span>
      </span>
    </article>
  );
}

function Column({ set, cls, images }: { set: WallCard[]; cls: string; images?: HomeImages }) {
  return (
    <div className={`wcol ${cls}`}>
      <div className="wtrack">
        {set.map((c) => (
          <Card key={c.slug} c={c} images={images} />
        ))}
        {set.map((c) => (
          <Card key={`${c.slug}-dup`} c={c} dup images={images} />
        ))}
      </div>
    </div>
  );
}

export function HeroServices({ images }: { images?: HomeImages } = {}) {
  return (
    <section className="hero" aria-label="Services overview">
      <div className="hero-grid">
        <div className="hero-copy">
          <span className="hero-eyebrow rv">
            <b>Webflow Enterprise Partner</b>
            <em>4+ years</em>
          </span>
          <h1 className="rv" style={{ ['--d' as string]: '.06s' }}>
            The work is the pitch.<br />
            <span className="soft">Not the deck.</span>
          </h1>
          <p className="hero-sub rv" style={{ ['--d' as string]: '.12s' }}>
            Seven services, one team — behind 200+ B2B SaaS websites. Below is the actual work, and
            every site is tagged with the services that shipped it. Find the outcome you want, then
            follow the tag to the service that did it.
          </p>
          <div className="hero-cta rv" style={{ ['--d' as string]: '.18s' }}>
            <a href="#book" data-cal-trigger className="btn btn-white btn-lg btn-pill">
              Book a strategy call
            </a>
            <a href="#services" className="tlink">
              See all seven services
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
          </div>
        </div>

        <div className="wall-zone rv" style={{ ['--d' as string]: '.14s' }} aria-label="Selected client work">
          <div className="wall">
            <Column set={COL_A} cls="a" images={images} />
            <Column set={COL_B} cls="b" images={images} />
          </div>
        </div>
      </div>
    </section>
  );
}
