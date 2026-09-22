import Image from 'next/image';
import { LOGOS } from '@/app/home-v3/_logos';

/**
 * The client logos, in the dark hero.
 *
 * Arnel, 2026-09-22: Frank asked for examples of our work on the call, so the
 * proof should be on the page before he reaches the case studies.
 *
 * Mobbin harvest the same day — Loom, Structured, Granola — puts a logo strip
 * on a dark hero the same way every time: a small letter-spaced label, ONE
 * row of logos knocked back to white, the ends faded out. No boxes, no colour.
 * The Sanity logos are dark ink on transparent, so `brightness(0) invert(1)`
 * turns each one white without touching its shape.
 *
 * The set renders twice (the second copy aria-hidden) so the -50% loop is
 * seamless; the duplicate keeps its alt text because crawlers ignore
 * aria-hidden and read an empty alt as a missing description.
 */
export function ProposalLogoStrip() {
  return (
    <section className="proposal-logos" aria-label="Clients we have grown">
      <p className="proposal-logos-lead">Some of the companies we have grown</p>
      <div className="proposal-marq">
        <div className="proposal-marq-track">
          {LOGOS.map((logo) => (
            <span className="proposal-marq-logo" key={logo.alt}>
              <Image src={logo.src} alt={logo.alt} loading="lazy" width={logo.w} height={logo.h} quality={82} />
            </span>
          ))}
          {LOGOS.map((logo) => (
            <span className="proposal-marq-logo" key={`${logo.alt}-dup`}>
              <Image
                src={logo.src}
                alt={logo.alt}
                aria-hidden="true"
                loading="lazy"
                width={logo.w}
                height={logo.h}
                quality={82}
              />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
