import Image from 'next/image';
import { LOGOS } from '../home-v3/_logos';

/**
 * LogosMarquee — saturated-indigo full-bleed marquee band under the hero (the
 * canon shared with pricing-v3; not the mockup's crisp-white band). Uses the
 * same real Sanity client-logo set as the homepage LogosTicker
 * (home-v3/_logos.ts); the set renders twice (second copy aria-hidden) for the
 * seamless -50% loop.
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
    <section className="logos" aria-label="Trusted by">
      <p className="logos-lead">Built and grown for B2B SaaS teams shipping real products</p>
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
