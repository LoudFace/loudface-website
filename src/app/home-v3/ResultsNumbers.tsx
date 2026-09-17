import type { HomeV3ResultsContent } from '@/lib/content-utils';

/** ResultsNumbers — "Numbers, not adjectives": 2 stat tiles + 2 testimonial tiles (the receipts). */
export function ResultsNumbers({ content }: { content: HomeV3ResultsContent }) {
  const [stat0, stat1] = content.statTiles;
  const [quote0, quote1] = content.quoteTiles;
  return (
    <section className="results">
      <div className="container">
        <div className="sec-head rv">
          <div>
            <h2 className="sec">{content.headline}</h2>
          </div>
        </div>
        <div className="bento">
          <article className="r-tile r-num tinted rv">
            <p className="r-value">{stat0.value}</p>
            <p className="r-label">{stat0.label}</p>
            <p className="r-desc">{stat0.description}</p>
            <div className="r-foot"><span className="tag static"><i></i><b>{stat0.tagClient}</b><span>{stat0.tagLabel}</span></span></div>
          </article>
          <article className="r-tile r-num narrow tinted rv" style={{ transitionDelay: '.08s' }}>
            <p className="r-value">{stat1.value}</p>
            <p className="r-label">{stat1.label}</p>
            <p className="r-desc">{stat1.description}</p>
            <div className="r-foot"><span className="tag static"><i></i><b>{stat1.tagClient}</b><span>{stat1.tagLabel}</span></span></div>
          </article>
          <article className="r-tile r-quote rv">
            <blockquote>&#8220;{quote0.quote}&#8221;</blockquote>
            <p className="who r-foot">{quote0.who}</p>
          </article>
          <article className="r-tile r-quote wide rv" style={{ transitionDelay: '.08s' }}>
            <blockquote>&#8220;{quote1.quote}&#8221;</blockquote>
            <p className="who r-foot">{quote1.who}</p>
          </article>
        </div>
      </div>
    </section>
  );
}
