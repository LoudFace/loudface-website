import Image from 'next/image';
import { CHIPS_HTML } from './_chips';
import type { HomeImages } from './data';

/**
 * HeroV3 — the "showroom floor" hero: copy + CTA + AI-answer chips on the left,
 * a two-column marquee of real client work on the right. The 16 marquee cards
 * (8 unique + 8 seamless-wrap duplicates) collapse to two mapped arrays. Card
 * screenshots come from Sanity by slug (via the `images` prop) with the hardcoded
 * CDN URL as fallback, so a fetch miss can never blank a card. Metric pill strings
 * and order stay curated (editorial).
 */
const CDN = 'https://cdn.sanity.io/images/xjjjqhgt/production/';
const CROP = '?w=900&h=1050&fit=crop&crop=top&fm=webp&q=82';

type Card = { slug: string; domain: string; asset: string; metric: string; client: string; eager?: boolean; priority?: boolean };

const COL_A: Card[] = [
  { slug: 'dimer-health', domain: 'dimerhealth.com', asset: 'a0f4750b896ced6ffca9c5869623b15614f312ba-1440x10131.webp', metric: '288% conversion lift', client: 'Dimer Health', eager: true, priority: true },
  { slug: 'montblanc', domain: 'montblanc.com', asset: 'a9110ec997f7a351bb9b90347bef4abf6b6b02fc-3024x1890.jpg', metric: '5+ microsite pages', client: 'Montblanc', eager: true },
  { slug: 'hoxhunt', domain: 'hoxhunt.com', asset: '3ac92e2393c7a26dc96f737c27d7faf49fbe6243-1440x8455.jpg', metric: '20+ pages', client: 'Hoxhunt' },
  { slug: 'outbound-specialist', domain: 'outboundspecialist.com', asset: 'd90a9cec8351f259afd300dcbc51641ed9b40c3d-1440x1845.webp', metric: '$200K sales in 30 days', client: 'Outbound' },
];

const COL_B: Card[] = [
  { slug: 'toku-ai-cited-pipeline', domain: 'toku.com', asset: 'bd1c09b494f7074c268f5b964d0c77dc1b1ef965-2880x1620.webp', metric: '0 → 86% AI visibility', client: 'Toku', eager: true },
  { slug: 'radisson-hotels-group', domain: 'radissonhotels.com', asset: '7d8ef15a548457e46a262f4ef9617e3260d10722-1440x1845.jpg', metric: '2+ complex platforms', client: 'Radisson', eager: true },
  { slug: 'liqid', domain: 'liqid.de', asset: '5f21404454406eee90732e4e1c8655e0c8c6013b-3024x3629.webp', metric: '100+ pages launched', client: 'LIQID' },
  { slug: 'eraser', domain: 'eraser.io', asset: '2a7d29fdc9302c8482d70b73041e6c58ec9229a6-1440x1845.webp', metric: '6+ pages', client: 'Eraser' },
];

function srcFor(c: Card, images?: HomeImages) {
  return (images?.[c.slug] ?? CDN + c.asset) + CROP;
}

function Wcard({ c, images, dup = false }: { c: Card; images?: HomeImages; dup?: boolean }) {
  return (
    <article className="wcard" aria-hidden={dup || undefined}>
      <div className="bar" aria-hidden="true">
        <b></b><b></b><b></b><span>{c.domain}</span>
      </div>
      <div className="shot">
        {/* `.wcard .shot img{width:100%;height:100%;object-fit:cover}` — CSS owns the
            box, so w/h here only carry the aspect ratio + pick the srcset widths.
            No `sizes`: the card is fixed-size, and the w=900 source caps the output
            anyway, so the default 1x/2x pair delivers exactly today's bytes. */}
        <Image
          src={srcFor(c, images)}
          alt={dup ? '' : `${c.client} website built by LoudFace`}
          width={900}
          height={1050}
          quality={82}
          {...(c.priority && !dup
            ? { priority: true }
            : { loading: c.eager && !dup ? ('eager' as const) : ('lazy' as const) })}
        />
      </div>
      <span className="rpill"><i></i><b>{c.metric}</b><span>{c.client}</span></span>
    </article>
  );
}

function Wcol({ cards, variant, images }: { cards: Card[]; variant: 'a' | 'b'; images?: HomeImages }) {
  return (
    <div className={`wcol ${variant}`}>
      <div className="wtrack">
        {cards.map((c) => <Wcard key={c.client} c={c} images={images} />)}
        {cards.map((c) => <Wcard key={`${c.client}-dup`} c={c} images={images} dup />)}
      </div>
    </div>
  );
}

export function HeroV3({ images }: { images?: HomeImages } = {}) {
  return (
    <section className="hero">
      <div className="hero-grid">
        <div className="hero-copy">
          <span className="hero-eyebrow rv"><b>Webflow Enterprise Partner</b><em>4+ years</em></span>
          <h1 className="rv" style={{ transitionDelay: '.06s' }}>
            Sites that convert.<br />Traffic that <span className="soft">compounds.</span>
          </h1>
          <p className="hero-sub rv" style={{ transitionDelay: '.12s' }}>
            We&rsquo;re the team behind 200+ B2B SaaS websites. We build the site on Webflow &mdash; positioning, copy,
            design, code &mdash; then run the SEO, conversion, and AI-search work that grows it. Same team, first draft
            to compounding traffic.
          </p>
          <div className="hero-cta rv" style={{ transitionDelay: '.18s' }}>
            <a href="#book" data-cal-trigger="" className="btn btn-white btn-lg">Book a strategy call</a>
            <span className="slots"><i className="dot"></i>2h response time</span>
          </div>
          <div className="ai-row rv" style={{ transitionDelay: '.24s' }}>
            <span className="ai-row-label">See what AI says about us</span>
            <div className="ai-chips" dangerouslySetInnerHTML={{ __html: CHIPS_HTML }} />
          </div>
        </div>

        <div className="wall-zone rv" style={{ transitionDelay: '.14s' }} aria-label="Selected client work">
          <div className="wall">
            <Wcol cards={COL_A} variant="a" images={images} />
            <Wcol cards={COL_B} variant="b" images={images} />
          </div>
        </div>
      </div>
    </section>
  );
}
