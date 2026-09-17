/**
 * Clarifier — the one distinction the two twin child pages blur: search
 * visibility (SEO/AEO) vs being recommended by AI (GEO). Light stage,
 * oversized type IS the composition. Both cards link to their child route.
 */
import type { ServicesClarifierContent } from '@/lib/content-utils';

const inkBold = { color: 'var(--ink)', fontWeight: 600 } as const;

export function Clarifier({ content }: { content: ServicesClarifierContent }) {
  return (
    <section className="clarify" id="seo-vs-geo" aria-label="SEO/AEO versus GEO">
      <div className="container">
        <div className="clarify-head rv">
          <span className="mono-label kicker">
            <i></i>{content.kicker}
          </span>
          <h2 className="clarify-big">
            {content.headlineLine1}<br />
            <span className="g1">{content.headlineHighlight}</span>{content.headlineSuffix}
          </h2>
          <p className="clarify-sub">
            {content.intro}
          </p>
        </div>

        <div className="clarify-two">
          <article className="cw rv">
            <div className="cw-top">
              <span className="cw-abbr">{content.seo.abbr}</span>
              <span className="cw-glyph" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M16 16l5 5" />
                </svg>
              </span>
            </div>
            <h3>{content.seo.question}</h3>
            <p>
              {content.seo.bodyPrefix}<b style={inkBold}>{content.seo.bodyBold}</b>{content.seo.bodySuffix}
            </p>
            <div className="cw-unit">
              {content.seo.unitPrefix}<b>{content.seo.unitBold}</b>{content.seo.unitSuffix}
            </div>
            <div className="cw-foot">
              <a className="cw-link" href="/services/seo-aeo">
                {content.seo.linkText}{' '}
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
            </div>
          </article>

          <article className="cw geo rv" style={{ ['--d' as string]: '.08s' }}>
            <div className="cw-top">
              <span className="cw-abbr">{content.geo.abbr}</span>
              <span className="cw-glyph" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M12 3l2.4 5 5.6.7-4 3.9 1 5.5L12 15.4 6.9 18l1-5.5-4-3.9L9.6 8z" />
                </svg>
              </span>
            </div>
            <h3>{content.geo.question}</h3>
            <p>
              {content.geo.bodyPrefix}
              <b style={inkBold}>{content.geo.bodyBold}</b>
              {content.geo.bodySuffix}
            </p>
            <div className="cw-unit">
              {content.geo.unitPrefix}<b>{content.geo.unitBold}</b>{content.geo.unitSuffix}
            </div>
            <p className="cw-proof">
              <i></i>{content.geo.proof}
            </p>
            <div className="cw-foot">
              <a className="cw-link" href="/services/geo-agency">
                {content.geo.linkText}{' '}
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
