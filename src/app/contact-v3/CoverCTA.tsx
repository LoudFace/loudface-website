/**
 * CoverCTA (contact) — the compact closing dark "cover-stack": full-bleed
 * cover photo, meta-label bars, floating browser-mockup card (LIQID), and the
 * final call. Static transplant of the About/Pricing CoverCTA family, re-copied
 * for contact. The section owns id="book" so in-page `href="#book"` anchors
 * land here; the CTA opens the Cal modal via data-cal-trigger.
 */
import Image from 'next/image';
import type { ContactCoverCtaContent } from '@/lib/content-utils';

const CDN = 'https://cdn.sanity.io/images/xjjjqhgt/production/';

export function CoverCTA({ content }: { content: ContactCoverCtaContent }) {
  return (
    <section className="cover" id="book">
      {/* `.cover-img` is position:absolute;inset:0;width:100%;height:100% — CSS owns
          the box. Full-bleed ⇒ sizes="100vw". The w=1600 source caps the output, so
          desktop still gets today's 1600px while phones drop to ~1200. */}
      <Image
        className="cover-img"
        src={`${CDN}a9110ec997f7a351bb9b90347bef4abf6b6b02fc-3024x1890.jpg?w=1600&h=1000&fit=crop&crop=top&fm=webp&q=82`}
        alt=""
        aria-hidden="true"
        width={1600}
        height={1000}
        sizes="100vw"
        quality={82}
        loading="lazy"
      />
      <div className="cover-veil" aria-hidden="true"></div>
      <div className="wrap cover-in">
        <div className="cover-meta rv">
          <span>{content.eyebrowLeft}</span>
          <span>{content.eyebrowRight}</span>
        </div>
        <div className="cover-mid">
          <div className="cover-obj" aria-hidden="true">
            <div className="cover-card">
              <div className="bar">
                <b></b>
                <b></b>
                <b></b>
                <span>liqid.de</span>
              </div>
              <div className="shot">
                {/* Fixed-size card — no `sizes`, so the default 1x/2x srcset applies
                    and the w=1000 source caps it. */}
                <Image
                  src={`${CDN}5f21404454406eee90732e4e1c8655e0c8c6013b-3024x3629.webp?w=1000&h=640&fit=crop&crop=top&fm=webp&q=82`}
                  alt=""
                  width={1000}
                  height={640}
                  quality={82}
                  loading="lazy"
                />
              </div>
              <span className="rpill">
                <i></i>
                <b>Built by LoudFace</b>
                <span>LIQID</span>
              </span>
            </div>
          </div>
          <h2 className="rv">
            {content.headlinePrefix}<span className="hl">{content.headlineHighlight}</span>{content.headlineSuffix}
          </h2>
          <p className="rv" style={{ ['--d' as string]: '.08s' }}>
            {content.description}
          </p>
          <div className="cover-cta rv" style={{ ['--d' as string]: '.16s' }}>
            <a href="#book-modal" data-cal-trigger className="btn btn-white">
              {content.ctaText} <span className="btn-arrow" aria-hidden="true">&rarr;</span>
            </a>
            <span className="slots">
              <span className="dot" aria-hidden="true"></span>{content.responseTime}
            </span>
          </div>
        </div>
        <div className="cover-credit rv">
          <span>{content.creditLeft}</span>
          <span>{content.creditRight}</span>
        </div>
      </div>
    </section>
  );
}
