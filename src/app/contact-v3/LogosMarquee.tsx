import Image from 'next/image';
import { LOGOS } from '../home-v3/_logos';

/**
 * LogosMarquee — the saturated-indigo full-bleed logo strip under the hero
 * (canon shared with pricing-v3/services-v3). Same real Sanity client-logo set
 * as the homepage ticker; the set renders twice (second copy aria-hidden) for
 * the seamless -50% loop.
 */
/**
 * next/image note: width/height stay the logo's INTRINSIC dims. `.marq-track` is
 * width:max-content and each logo is height-locked with width:auto, so the rendered
 * width comes from the aspect ratio — change w/h and the track width (and therefore
 * the seamless -50% loop) breaks. No `sizes`: fixed-size ⇒ the default 1x/2x srcset
 * is both correct and cheapest, and the w=300 source caps the output.
 */
export function LogosMarquee() {
  return (
    <section className="logos" aria-label="Clients">
      <p className="logos-lead">The team behind 200+ B2B SaaS websites</p>
      <div className="marq">
        <div className="marq-track">
          {LOGOS.map((l) => (
            <span className="marq-logo" key={l.alt}>
              <Image src={l.src} alt={l.alt} loading="lazy" width={l.w} height={l.h} quality={82} />
            </span>
          ))}
          {LOGOS.map((l) => (
            <span className="marq-logo" key={`${l.alt}-dup`}>
              <Image src={l.src} alt="" aria-hidden="true" loading="lazy" width={l.w} height={l.h} quality={82} />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
