import type { ReactNode } from 'react';
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
/* The thumbnails are designed 16:10 composites (2026-08-20 rebuild), so the card
   shows the WHOLE image — no crop params. The old `h=1050&crop=top` portrait crop
   sliced their stat card and layering off. */
const CROP = '?w=1000&fm=webp&q=82';

type Card = { slug: string; asset: string; metric: string; client: string; eager?: boolean; priority?: boolean };

const COL_A: Card[] = [
  { slug: 'dimer-health', asset: '467a77e9756e7890f1c62874d3388937727c4c6e-2880x1800.png', metric: '288% conversion lift', client: 'Dimer Health', eager: true, priority: true },
  { slug: 'montblanc', asset: '9416b17af4983a14f8102906196363075cfd07ba-2880x1800.png', metric: '5+ microsite pages', client: 'Montblanc', eager: true },
  { slug: 'hoxhunt', asset: 'ca8e0b9ee7bb6c5010f367586ed22def265a27a1-2880x1800.png', metric: '20+ pages', client: 'Hoxhunt' },
  { slug: 'outbound-specialist', asset: '357651c0add5b9c0f1df95b591021decce87a8bc-2880x1800.png', metric: '$200K sales in 30 days', client: 'Outbound' },
];

const COL_B: Card[] = [
  { slug: 'toku-ai-cited-pipeline', asset: 'cafcfa6fadc9ea6d1d38391eda626fd12ff5e5a0-2880x1800.png', metric: '0 → 97.8% AI visibility', client: 'Toku', eager: true },
  { slug: 'radisson-hotels-group', asset: 'd7f6c041eab8e04c794c591227b7c4d9dfb94e86-2880x1800.png', metric: '2+ complex platforms', client: 'Radisson', eager: true },
  { slug: 'liqid', asset: 'cafa9a84713495ea606a6b37badcc5691efac5a4-2880x1800.png', metric: '100+ pages launched', client: 'LIQID' },
  { slug: 'eraser', asset: 'f6e208a93b76d3fe7ed1fe83a7d8ea1dc29e5962-2880x1800.png', metric: '6+ pages', client: 'Eraser' },
];

function srcFor(c: Card, images?: HomeImages) {
  return (images?.[c.slug] ?? CDN + c.asset) + CROP;
}

/**
 * Hero copy, one entry per experiment variant.
 *
 * `control` is the live capability-led argument. `test` swaps the argument to the
 * AI-search shift, led by the Toku citation result. The CTA label and the
 * response-time line are deliberately identical across variants so a measured
 * difference is attributable to the argument and nothing else.
 *
 * Only the copy varies — the client-work marquee is shared.
 */
export type HeroVariant = 'control' | 'test';

const HERO_COPY: Record<HeroVariant, {
  eyebrowLabel: string;
  eyebrowNote: string;
  headline: ReactNode;
  sub: ReactNode;
}> = {
  control: {
    eyebrowLabel: 'AI-native organic growth',
    eyebrowNote: 'B2B SaaS',
    headline: <>Get discovered across Google and AI search. Turn visibility into customers.</>,
    sub: (
      <>
        LoudFace is an AI-native B2B SaaS organic growth agency. We run GEO, SEO, AEO, content, and conversion to
        get companies discovered across Google and AI search. We implement across your stack when the program needs it.
      </>
    ),
  },
  test: {
    eyebrowLabel: 'B2B SaaS',
    eyebrowNote: '200+ sites shipped',
    headline: <>Your buyers ask AI first.<br />Make sure it <span className="soft">names you.</span></>,
    sub: (
      <>
        LoudFace runs GEO, SEO, AEO, content, and conversion for B2B SaaS companies. Toku reached 97.8% visibility
        on its category&rsquo;s top AI-search prompt. We add delivery work across your stack when it supports the program.
      </>
    ),
  },
};

function Wcard({ c, images, dup = false }: { c: Card; images?: HomeImages; dup?: boolean }) {
  return (
    <article className="wcard" aria-hidden={dup || undefined}>
      {/* No browser chrome bar here: every composite already contains its own
          framed browser plates, so a second frame around them read as nested chrome. */}
      <div className="shot">
        {/* `.wcard .shot img{width:100%;height:100%;object-fit:cover}` — CSS owns the
            box, so w/h here only carry the aspect ratio + pick the srcset widths.
            No `sizes`: the card is fixed-size, and the w=1000 source caps the output
            anyway, so the default 1x/2x pair delivers exactly today's bytes.

            The duplicate wrap-cards keep the SAME alt as the original: crawlers
            ignore aria-hidden and flag an empty alt as missing, so `dup` may only
            affect loading/priority — never alt. */}
        <Image
          src={srcFor(c, images)}
          alt={`${c.client} website built by LoudFace`}
          width={1000}
          height={625}
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

export function HeroV3({ images, variant = 'control' }: { images?: HomeImages; variant?: HeroVariant } = {}) {
  const copy = HERO_COPY[variant] ?? HERO_COPY.control;

  return (
    <section className="hero" data-hero-variant={variant}>
      <div className="hero-grid">
        <div className="hero-copy">
          <span className="hero-eyebrow rv"><b>{copy.eyebrowLabel}</b><em>{copy.eyebrowNote}</em></span>
          <h1 className="rv" style={{ transitionDelay: '.06s' }}>
            {copy.headline}
          </h1>
          <p className="hero-sub rv" style={{ transitionDelay: '.12s' }}>
            {copy.sub}
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
