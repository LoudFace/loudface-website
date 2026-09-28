import Image from 'next/image';
import { HeroMonolithMount } from '@/components/three/HeroMonolithMount';

/**
 * ObjectSystem — "what we do", told with three rendered objects.
 *
 * Reference anchors (design-lab/harvest/2026-09-16/object-3d/):
 *   SIGMA      · three product renders in a row on white, hairline captions
 *                under each — "THREE PRODUCT LINES".
 *   Zellerfeld · one object, studio light, soft contact shadow, neutral ground.
 * Both treat the object as the section's subject and let the type stay quiet
 * underneath it. Neither uses a card.
 *
 * The three objects were rendered for this page as one set — same glass, same
 * light, same ground — so they read as three views of one system rather than
 * three stock pictures. They are abstract on purpose: an invented photograph of
 * "a team at work" is the tell this whole pass exists to avoid.
 *
 * The closing panel is the live Three.js monolith (src/components/three) —
 * already in the repo, shipped nowhere. It carries the stage that the flat
 * renders cannot: it moves.
 *
 * Asset: three studio object renders + one real-time WebGL object.
 */

const OBJECTS = [
  {
    src: '/images/objects/object-find-prism.webp',
    n: '01',
    title: 'Get found',
    body: 'The terms your buyers actually search, and the pages built to own them. Technical SEO, content strategy, the whole surface.',
    alt: 'Indigo glass prism, studio render',
  },
  {
    src: '/images/objects/object-answer-orb.webp',
    n: '02',
    title: 'Get named',
    body: 'When a buyer asks an assistant who to shortlist, the answer cites you. Measured per engine, not guessed at.',
    alt: 'Indigo glass sphere, studio render',
  },
  {
    src: '/images/objects/object-convert-stack.webp',
    n: '03',
    title: 'Get customers',
    body: 'Visibility that never converts is a vanity metric. Conversion work, and the build behind it when the site is the bottleneck.',
    alt: 'Stacked indigo glass slabs, studio render',
  },
];

export function ObjectSystem() {
  return (
    <section className="os" aria-labelledby="os-h">
      <div className="container">
        <div className="os-head">
          <span className="os-eyebrow rv">
            <i aria-hidden="true"></i>What we do
          </span>
          <h2 id="os-h" className="rv">
            Three moves, one system<span className="ghost">.</span>
          </h2>
        </div>

        <div className="os-row">
          {OBJECTS.map((o, i) => (
            <figure className="os-cell rv" key={o.n} style={{ transitionDelay: `${i * 0.08}s` }}>
              <div className="os-shot">
                <Image src={o.src} alt={o.alt} width={1000} height={1000} loading="lazy" quality={88} />
              </div>
              <figcaption>
                <p className="os-n">{o.n}</p>
                <p className="os-title">{o.title}</p>
                <p className="os-body">{o.body}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      {/* The one object on the page that is actually running, not rendered. */}
      <div className="os-stage">
        <div className="os-stage-canvas" aria-hidden="true">
          <HeroMonolithMount />
        </div>
        <div className="os-stage-copy">
          <h3 className="rv">
            Your buyers ask an assistant first<span className="ghost">.</span>
          </h3>
          <p className="rv">
            The shortlist is drawn before anyone reaches your site. We make sure the answer names
            you — and we show you the engine-by-engine reading that proves it.
          </p>
        </div>
      </div>
    </section>
  );
}
