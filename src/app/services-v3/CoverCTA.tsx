import type { HomeImages } from '../home-v3/data';

/**
 * CoverCTA — the closing dark "cover-stack": full-bleed Montblanc cover image,
 * a floating LIQID client card, and the final call. Verbatim CoverCTA transplant
 * with services copy. The section owns id="book" so in-page `href="#book"`
 * anchors land here; the CTA opens the Cal modal (data-cal-trigger). Cover +
 * card images come from Sanity by slug (images prop) with hardcoded fallbacks.
 */
const CDN = 'https://cdn.sanity.io/images/xjjjqhgt/production/';
const COVER_ASSET = 'a9110ec997f7a351bb9b90347bef4abf6b6b02fc-3024x1890.jpg';
const CARD_ASSET = '5f21404454406eee90732e4e1c8655e0c8c6013b-3024x3629.webp';

export function CoverCTA({ images }: { images?: HomeImages } = {}) {
  const coverSrc = (images?.['montblanc'] ?? CDN + COVER_ASSET) + '?w=1600&h=1000&fit=crop&crop=top&fm=webp&q=82';
  const cardSrc = (images?.['liqid'] ?? CDN + CARD_ASSET) + '?w=1000&h=640&fit=crop&crop=top&fm=webp&q=82';

  return (
    <section className="cover" id="book">
      <img className="cover-img" src={coverSrc} alt="" aria-hidden="true" width={1600} height={1000} loading="lazy" />
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
                <span>liqid.de</span>
              </div>
              <div className="shot">
                <img src={cardSrc} alt="" width={1000} height={640} loading="lazy" />
              </div>
              <span className="rpill">
                <i></i>
                <b>BUILD + GROWTH</b>
                <span>LIQID</span>
              </span>
            </div>
          </div>
          <h2 className="rv">Not sure which services you need? That’s the call.</h2>
          <p className="rv" style={{ ['--d' as string]: '.08s' }}>
            30 minutes, no pitch deck. We’ll look at your site together and tell you which of the
            seven would move the needle first — and which you can skip for now.
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
