import { LOGOS } from './_logos';

/**
 * LogosTicker — client-logo marquee on the saturated indigo strip.
 * LOGOS is rendered twice (real + aria-hidden duplicate) for the seamless
 * -50% CSS loop. Data-driven from _logos.ts.
 */
export function LogosTicker() {
  return (
    <section className="logos" aria-label="Clients">
      <div className="logos-head">
        <span className="logos-label rv">
          <i aria-hidden="true"></i>The B2B SaaS teams we&rsquo;ve built and grown for
        </span>
      </div>
      <div className="ticker">
        <div className="ticker-track" aria-hidden="false">
          {LOGOS.map((l) => (
            <div className="logo-cell" key={l.alt}>
              <img src={l.src} alt={l.alt} width={l.w} height={l.h} loading="lazy" />
            </div>
          ))}
          {LOGOS.map((l) => (
            <div className="logo-cell" key={`${l.alt}-dup`}>
              <img src={l.src} alt="" aria-hidden="true" width={l.w} height={l.h} loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
