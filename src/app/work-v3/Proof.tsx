/**
 * Proof — the night stage. Five tiles: three "how we operate" facts and two
 * client-attributed headline outcomes (Toku 0 → 86%, Dimer 288%). Every number
 * here is in the sourced/safe set; the two attributed ones carry a source pill
 * (client · discipline). Static by design — these are agency-level claims, not
 * per-card stats, so they never drift with the archive.
 */
export function Proof() {
  return (
    <section className="proof" aria-label="Proof">
      <div className="container">
        <div className="proof-head rv">
          <h2 className="proof-big">
            Numbers we&rsquo;ll put
            <br />
            our <span className="g">name</span> next to.
          </h2>
          <p className="proof-sub">
            Two are sourced to the exact engagement and named client. The rest are how we operate —
            the same facts every study on this page inherits.
          </p>
        </div>
        <div className="proof-grid rv">
          <div className="pf">
            <b>200+</b>
            <span className="pl">B2B SaaS websites shipped</span>
          </div>
          <div className="pf">
            <b>4+ yrs</b>
            <span className="pl">Webflow Enterprise Partner</span>
          </div>
          <div className="pf">
            <b>~2h</b>
            <span className="pl">Response during working hours</span>
          </div>
          <div className="pf hot">
            <b>0 &rarr; 86%</b>
            <span className="pl">Toku AI visibility on its core prompt</span>
            <span className="psrc">
              <i></i>Toku · GEO
            </span>
          </div>
          <div className="pf hot">
            <b>288%</b>
            <span className="pl">Conversion increase</span>
            <span className="psrc">
              <i></i>Dimer Health · CRO · 6-mo
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
