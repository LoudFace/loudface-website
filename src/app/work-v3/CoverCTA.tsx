import Image from 'next/image';
import { WORK_CDN, type WorkImages } from './content';

/**
 * CoverCTA — the closing dark "cover-stack": full-bleed Montblanc cover image,
 * a floating Toku client card, and the final call. Verbatim CoverCTA transplant
 * with work copy. The section owns id="book" so the hero's in-page `href="#book"`
 * anchor lands here; the CTA opens the Cal modal (data-cal-trigger). Cover + card
 * images come from Sanity by slug (images prop) with hardcoded fallbacks.
 */
const COVER_ASSET = 'a9110ec997f7a351bb9b90347bef4abf6b6b02fc-3024x1890.jpg';
const CARD_ASSET = 'bd1c09b494f7074c268f5b964d0c77dc1b1ef965-2880x1620.webp';

export function CoverCTA({ images }: { images?: WorkImages } = {}) {
  const coverSrc = (images?.['montblanc'] ?? WORK_CDN + COVER_ASSET) + '?w=1280&h=800&fit=crop&crop=top&fm=webp&q=72';
  const cardSrc = (images?.['toku-ai-cited-pipeline'] ?? WORK_CDN + CARD_ASSET) + '?w=760&h=486&fit=crop&crop=top&fm=webp&q=78';

  return (
    <section className="cover" id="book">
      {/* Full-bleed ⇒ sizes="100vw"; the w=1280 source caps the output. */}
      <Image className="cover-img" src={coverSrc} alt="" aria-hidden="true" width={1280} height={800} sizes="100vw" quality={82} loading="lazy" />
      <div className="cover-veil" aria-hidden="true"></div>
      <div className="container cover-in">
        <div className="cover-meta rv">
          <span>LoudFace — strategy call</span>
          <span>B2B SaaS only</span>
        </div>
        <div className="cover-mid">
          <div className="cover-obj" aria-hidden="true">
            <div className="cover-card">
              <div className="bar">
                <b></b>
                <b></b>
                <b></b>
                <span>toku.com</span>
              </div>
              <div className="shot">
                <Image src={cardSrc} alt="" width={760} height={486} quality={82} loading="lazy" />
              </div>
              <span className="rpill">
                <i></i>
                <b>0 &rarr; 86%</b>
                <span>Toku</span>
              </span>
            </div>
          </div>
          <h2 className="rv">
            Your site could be <span className="soft">the next study.</span>
          </h2>
          <p className="rv" style={{ ['--d' as string]: '.08s' }}>
            30 minutes, no pitch deck. We&rsquo;ll look at your site together and show you the first
            move that would earn its own page in this gallery.
          </p>
          <div className="cover-cta rv" style={{ ['--d' as string]: '.16s' }}>
            <a href="#book-modal" data-cal-trigger className="btn btn-white btn-lg">
              Book a strategy call
            </a>
            <span className="slots">
              <span className="dot"></span>One team — build and growth
            </span>
          </div>
        </div>
        <div className="cover-credit rv">
          <span>Cover — Montblanc, built by LoudFace</span>
          <span>loudface.co</span>
        </div>
      </div>
    </section>
  );
}
