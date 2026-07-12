/**
 * Clarifier — the one distinction the two twin child pages blur: search
 * visibility (SEO/AEO) vs being recommended by AI (GEO). Light stage,
 * oversized type IS the composition. Both cards link to their child route.
 */
const inkBold = { color: 'var(--ink)', fontWeight: 600 } as const;

export function Clarifier() {
  return (
    <section className="clarify" id="seo-vs-geo" aria-label="SEO/AEO versus GEO">
      <div className="container">
        <div className="clarify-head rv">
          <span className="mono-label kicker">
            <i></i>The distinction people miss
          </span>
          <h2 className="clarify-big">
            Two kinds of<br />
            <span className="g1">AI</span> visibility.
          </h2>
          <p className="clarify-sub">
            “SEO/AEO” and “GEO” get used interchangeably. They answer two different questions — and
            need two different programs.
          </p>
        </div>

        <div className="clarify-two">
          <article className="cw rv">
            <div className="cw-top">
              <span className="cw-abbr">SEO / AEO</span>
              <span className="cw-glyph" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M16 16l5 5" />
                </svg>
              </span>
            </div>
            <h3>Is your site found?</h3>
            <p>
              We make <b style={inkBold}>your pages</b> rank on Google and get pulled into AI
              Overviews, ChatGPT, and Perplexity when someone searches your category. The work lives
              on your site; the win is your page showing up.
            </p>
            <div className="cw-unit">
              The unit: <b>your rankings, impressions, and citations</b> — your own URLs, surfaced.
            </div>
            <div className="cw-foot">
              <a className="cw-link" href="/services/seo-aeo">
                Explore SEO &amp; AEO{' '}
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
            </div>
          </article>

          <article className="cw geo rv" style={{ ['--d' as string]: '.08s' }}>
            <div className="cw-top">
              <span className="cw-abbr">GEO</span>
              <span className="cw-glyph" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M12 3l2.4 5 5.6.7-4 3.9 1 5.5L12 15.4 6.9 18l1-5.5-4-3.9L9.6 8z" />
                </svg>
              </span>
            </div>
            <h3>Does AI recommend you?</h3>
            <p>
              When a buyer asks an AI “which vendor should we use?”, GEO is the work that makes{' '}
              <b style={inkBold}>you</b> the name it returns — whether or not your page ranks. It’s
              about being the answer, not owning the link.
            </p>
            <div className="cw-unit">
              The unit: <b>share of answer</b> — how often AI names you, across engines.
            </div>
            <p className="cw-proof">
              <i></i>How we took Toku from unranked to cited by name — that’s the exhibit above.
            </p>
            <div className="cw-foot">
              <a className="cw-link" href="/services/geo-agency">
                Explore GEO{' '}
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
