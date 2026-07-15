/**
 * CoverCTA — the closing cover-stack (verbatim transplant with blog copy): a
 * full-bleed grayscale cover image, a floating credited client card (LIQID, a
 * real LoudFace build), and the final call. Owns id="book" so the shared
 * Header/Footer "Book a call" #book anchors land here; the CTA button opens the
 * Cal modal (#book-modal + data-cal-trigger). Images are stable published Sanity
 * CDN assets, hardcoded like work-v3's CoverCTA.
 */
import Image from 'next/image';
const SANITY = 'https://cdn.sanity.io/images/xjjjqhgt/production/';
const COVER = `${SANITY}a9110ec997f7a351bb9b90347bef4abf6b6b02fc-3024x1890.jpg?w=1600&h=1000&fit=crop&crop=top&fm=webp&q=82`;
const CARD = `${SANITY}5f21404454406eee90732e4e1c8655e0c8c6013b-3024x3629.webp?w=1000&h=640&fit=crop&crop=top&fm=webp&q=82`;

export function CoverCTA() {
  return (
    <section className="cover" id="book">
      {/* Full-bleed ⇒ sizes="100vw"; the w=1600 source caps the output. */}
      <Image className="cover-img" src={COVER} alt="" aria-hidden="true" width={1600} height={1000} sizes="100vw" quality={82} loading="lazy" />
      <div className="cover-veil" aria-hidden="true"></div>
      <div className="container cover-in">
        <div className="cover-meta rv">
          <span>LoudFace — strategy call</span>
          <span>B2B SaaS only</span>
        </div>
        <div className="cover-mid">
          <div className="cover-obj" aria-hidden="true">
            <div className="cover-card">
              <div className="bar"><b></b><b></b><b></b><span>liqid.de</span></div>
              <div className="shot">
                <Image src={CARD} alt="" width={1000} height={640} quality={82} loading="lazy" />
                <span className="cover-badge"><i></i>Built by LoudFace<b className="cb-sep"></b><span className="cb-cli">LIQID</span></span>
              </div>
            </div>
          </div>
          <h2 className="rv">Ready to grow your business?</h2>
          <p className="rv" style={{ ['--d' as string]: '.08s' }}>
            Let&rsquo;s discuss how we can help you achieve your goals. 30 minutes, no pitch deck. We&rsquo;ll
            look at your site together and name what should move first: build, growth, or both.
          </p>
          <div className="cover-cta rv" style={{ ['--d' as string]: '.16s' }}>
            <a href="#book-modal" data-cal-trigger className="btn btn-white btn-lg">Book a call</a>
            <span className="slots"><span className="dot"></span>Build and growth, one team</span>
          </div>
        </div>
        <div className="cover-credit rv">
          <span>Cover — LIQID, built by LoudFace</span>
          <span>loudface.co</span>
        </div>
      </div>
    </section>
  );
}
