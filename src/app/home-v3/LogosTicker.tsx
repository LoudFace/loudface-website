import Image from 'next/image';
import { LOGOS } from './_logos';

/**
 * LogosTicker — client-logo marquee on the saturated indigo strip.
 * LOGOS is rendered twice (real + aria-hidden duplicate) for the seamless
 * -50% CSS loop. Data-driven from _logos.ts.
 *
 * next/image note: width/height stay the logo's INTRINSIC dims. The track is
 * `width:max-content` and each logo is `height:22px;width:auto`, so the rendered
 * width is derived from the aspect ratio — change w/h and the track width (and
 * therefore the -50% seamless loop) breaks. No `sizes`: these are fixed-size, so
 * the default 1x/2x srcset is exactly right and cheapest.
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
              <Image src={l.src} alt={l.alt} width={l.w} height={l.h} loading="lazy" quality={82} />
            </div>
          ))}
          {LOGOS.map((l) => (
            <div className="logo-cell" key={`${l.alt}-dup`}>
              <Image src={l.src} alt="" aria-hidden="true" width={l.w} height={l.h} loading="lazy" quality={82} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
