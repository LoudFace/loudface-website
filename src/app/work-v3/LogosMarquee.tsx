import { LOGOS } from '../home-v3/_logos';

/**
 * LogosMarquee — the crisp-light client-logo band under the hero (the mockup's
 * approved white band for this page, not the saturated-indigo strip that
 * pricing/services use). Real Sanity client logos from home-v3/_logos.ts; the
 * set renders twice (second copy aria-hidden) for the seamless -50% loop.
 */
export function LogosMarquee() {
  return (
    <section className="logos" aria-label="Clients">
      <p className="logos-lead">Shipped and grown for B2B SaaS teams with real products.</p>
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
