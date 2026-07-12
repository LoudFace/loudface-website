/** Awards (B) — dark stage, ghost words + real accreditation badges. */
import { asset } from '@/lib/assets';

export function Awards() {
  return (
    <section className="awards diag">
      <span className="ghostword gw-1" aria-hidden="true">recognized</span>
      <span className="ghostword gw-2" aria-hidden="true">enterprise</span>
      <div className="container">
        <div className="awards-head">
          <span className="eyebrow glass rv">
            <i></i>Our achievements
          </span>
          <h2 className="display on-dark rv" style={{ ['--d' as string]: '.05s' }}>
            Accreditations &amp; awards
          </h2>
        </div>
        <div className="award-cards">
          <article className="acard rv">
            <div className="acard-badges">
              <span className="seat">
                <img src={asset('/images/webflow.svg')} width={64} height={64} alt="" />
              </span>
              <img
                className="ent"
                src={asset('/images/Enterprise-Blue-Badge.webp')}
                width={660}
                height={85}
                alt="Webflow Enterprise Partner badge"
              />
            </div>
            <h3>Webflow Enterprise Partner</h3>
            <p>Building on Webflow since 2017. Early adopters then, Enterprise-tier partners now.</p>
          </article>
          <article className="acard rv" style={{ ['--d' as string]: '.07s' }}>
            <div className="acard-badges">
              <span className="seat">
                <img src={asset('/images/Awwwards.svg')} width={64} height={64} alt="" />
              </span>
            </div>
            <h3>Awwwards Honorable Nominee</h3>
            <p>
              Honorable mention for design craft on client work. Function first, but it has to
              look the part.
            </p>
          </article>
          <article className="acard rv" style={{ ['--d' as string]: '.14s' }}>
            <div className="acard-badges">
              <span className="seat">
                <img src={asset('/images/Trustpilot.svg')} width={64} height={64} alt="" />
              </span>
            </div>
            <h3>Trustpilot Top-Rated Agency</h3>
            <p>Top-rated by the clients we ship for: the review column of the ledger.</p>
          </article>
        </div>
        <p className="awards-close rv">
          We&rsquo;ve picked up a few awards along the way. <b>The work came first.</b>
        </p>
      </div>
    </section>
  );
}
