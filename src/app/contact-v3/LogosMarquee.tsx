import { LOGOS } from '../home-v3/_logos';

/**
 * LogosMarquee — the saturated-indigo full-bleed logo strip under the hero
 * (canon shared with pricing-v3/services-v3). Same real Sanity client-logo set
 * as the homepage ticker; the set renders twice (second copy aria-hidden) for
 * the seamless -50% loop.
 */
export function LogosMarquee() {
  return (
    <section className="logos" aria-label="Clients">
      <p className="logos-lead">The team behind 200+ B2B SaaS websites</p>
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
