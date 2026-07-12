/**
 * CoverCTA (about) — the closing dark "cover-stack": full-bleed cover image, a
 * floating client card, and the final call. A static transplant of the homepage
 * CoverCTA, ported here so it lives under the .abv3 CSS scope. The section owns
 * id="book" so the page's `href="#book"` anchors land here, and the CTA also
 * carries data-cal-trigger so it opens the Cal modal.
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
      <div className="container cover-in">
        <div className="cover-meta rv">
          <span>LoudFace &mdash; strategy call</span>
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
                <b>100+ pages launched</b>
                <span>LIQID</span>
              </span>
            </div>
          </div>
          <h2 className="rv">Let&rsquo;s figure out what&rsquo;s holding your site back.</h2>
          <p className="rv" style={{ ['--d' as string]: '.08s' }}>
            30-minute strategy call. No pitch deck. We&rsquo;ll look at your site together and tell
            you what we&rsquo;d change and why.
          </p>
          <div className="cover-cta rv" style={{ ['--d' as string]: '.16s' }}>
            <a href="#book-modal" data-cal-trigger="" className="btn btn-white btn-lg">
              Book a strategy call
            </a>
            <span className="slots">
              <span className="dot"></span>2h response time, every tier
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
