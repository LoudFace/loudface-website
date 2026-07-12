import { LOGOS } from '../home-v3/_logos';

/**
 * LogosMarquee — saturated-indigo full-bleed marquee band under the hero (the
 * canon shared with pricing-v3; not the mockup's crisp-white band). Uses the
 * same real Sanity client-logo set as the homepage LogosTicker
 * (home-v3/_logos.ts); the set renders twice (second copy aria-hidden) for the
 * seamless -50% loop.
 */
export function LogosMarquee() {
  return (
    <section className="logos" aria-label="Trusted by">
      <p className="logos-lead">Built and grown for B2B SaaS teams shipping real products</p>
      <div className="marq">
        <div className="marq-track">
          {LOGOS.map((l) => (
            <span className="marq-logo" key={l.alt}>
              <img src={l.src} alt={l.alt} loading="lazy" width={l.w} height={l.h} />
            </span>
          ))}
          {LOGOS.map((l) => (
            <span className="marq-logo" key={`${l.alt}-dup`}>
              <img src={l.src} alt="" aria-hidden="true" loading="lazy" width={l.w} height={l.h} />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
