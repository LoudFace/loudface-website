/**
 * CoverCTA (pricing) — the closing dark "cover-stack": full-bleed cover image,
 * a floating client card (LIQID), and the final call. Static transplant of the
 * homepage CoverCTA re-copied for pricing. The section owns id="book" so
 * in-page `href="#book"` anchors land here; the CTA opens the Cal modal.
 */
const CDN = 'https://cdn.sanity.io/images/xjjjqhgt/production/';
const d = (v: string) => ({ ['--d' as string]: v });

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
          <span>LoudFace &mdash; intro call</span>
          <span>B2B SaaS &middot; fintech &middot; Series A&ndash;C</span>
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
          <h2 className="rv">Stop managing. Start shipping.</h2>
          <p className="rv" style={d('.08s')}>
            Book a 30-minute intro call. We&rsquo;ll recommend the right tier for your goals.
          </p>
          <div className="cover-cta rv" style={d('.16s')}>
            <a href="#book-modal" data-cal-trigger="" className="btn btn-white btn-lg">
              Book an Intro Call
            </a>
            <span className="slots">
              <span className="dot"></span>Or explore our work&nbsp;
              <a
                href="/case-studies"
                style={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,.4)', paddingBottom: '1px' }}
              >
                case studies &rarr;
              </a>
            </span>
          </div>
        </div>
        <div className="cover-credit rv">
          <span>Cover &mdash; LIQID, built by LoudFace</span>
          <span>loudface.co</span>
        </div>
      </div>
    </section>
  );
}
