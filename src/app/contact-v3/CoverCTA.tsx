/**
 * CoverCTA (contact) — the compact closing dark "cover-stack": full-bleed
 * cover photo, meta-label bars, floating browser-mockup card (LIQID), and the
 * final call. Static transplant of the About/Pricing CoverCTA family, re-copied
 * for contact. The section owns id="book" so in-page `href="#book"` anchors
 * land here; the CTA opens the Cal modal via data-cal-trigger.
 */
const CDN = 'https://cdn.sanity.io/images/xjjjqhgt/production/';

export function CoverCTA() {
  return (
    <section className="cover" id="book">
      <img
        className="cover-img"
        src={`${CDN}a9110ec997f7a351bb9b90347bef4abf6b6b02fc-3024x1890.jpg?w=1600&h=1000&fit=crop&crop=top&fm=webp&q=82`}
        alt=""
        aria-hidden="true"
        width={1600}
        height={1000}
        loading="lazy"
      />
      <div className="cover-veil" aria-hidden="true"></div>
      <div className="wrap cover-in">
        <div className="cover-meta rv">
          <span>LoudFace &mdash; intro call</span>
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
                <img
                  src={`${CDN}5f21404454406eee90732e4e1c8655e0c8c6013b-3024x3629.webp?w=1000&h=640&fit=crop&crop=top&fm=webp&q=82`}
                  alt=""
                  width={1000}
                  height={640}
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
            Let&rsquo;s make the <span className="hl">first move</span>.
          </h2>
          <p className="rv" style={{ ['--d' as string]: '.08s' }}>
            Thirty minutes, no pitch deck. We&rsquo;ll look at your site together and tell you
            exactly what we&rsquo;d change.
          </p>
          <div className="cover-cta rv" style={{ ['--d' as string]: '.16s' }}>
            <a href="#book-modal" data-cal-trigger className="btn btn-white">
              Book an intro call <span className="btn-arrow" aria-hidden="true">&rarr;</span>
            </a>
            <span className="slots">
              <span className="dot" aria-hidden="true"></span>2h response time, every tier
            </span>
          </div>
        </div>
        <div className="cover-credit rv">
          <span>Cover &mdash; Montblanc, built by LoudFace</span>
          <span>loudface.co</span>
        </div>
      </div>
    </section>
  );
}
