/** ResultsNumbers — "Numbers, not adjectives": 2 stat tiles + 2 testimonial tiles (the receipts). */
export function ResultsNumbers() {
  return (
    <section className="results">
      <div className="container">
        <div className="sec-head rv">
          <div>
            <h2 className="sec">Numbers, not adjectives</h2>
          </div>
        </div>
        <div className="bento">
          <article className="r-tile r-num tinted rv">
            <p className="r-value">288%</p>
            <p className="r-label">Increase in conversions</p>
            <p className="r-desc">Measured over six months of CRO work on the Dimer Health site.</p>
            <div className="r-foot"><span className="tag static"><i></i><b>Dimer Health</b><span>CRO</span></span></div>
          </article>
          <article className="r-tile r-num narrow tinted rv" style={{ transitionDelay: '.08s' }}>
            <p className="r-value">{'0 → 86%'}</p>
            <p className="r-label">AI visibility on the core prompt</p>
            <p className="r-desc">From absent to cited on the answer that matters in Toku’s category.</p>
            <div className="r-foot"><span className="tag static"><i></i><b>Toku</b><span>AEO</span></span></div>
          </article>
          <article className="r-tile r-quote rv">
            <blockquote>“It was very refreshing working with you compared to other agencies we’re working with.”</blockquote>
            <p className="who r-foot">Anthony Dean — Radisson Hotels Group</p>
          </article>
          <article className="r-tile r-quote wide rv" style={{ transitionDelay: '.08s' }}>
            <blockquote>“We are extremely happy with the landing page LoudFace built for us on Webflow.”</blockquote>
            <p className="who r-foot">Daan Smit — CEO &amp; Founder, Brandfirm</p>
          </article>
        </div>
      </div>
    </section>
  );
}
