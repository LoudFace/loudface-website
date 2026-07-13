import { SERVICES, type ServiceEntry } from './data';

/**
 * ServicesIndex — the deep-indigo 7-service directory, grouped into the approved
 * Build | Growth two-track model. The compact secondary index (the exhibits are
 * the primary argument). Every row links to its real child route. Rows are
 * single-sourced from SERVICES in ./data (which also feeds the ItemList JSON-LD).
 *
 * QA (P12): the track eyebrow ("Track A/B") and the "A + B" glyph render in
 * Satoshi sentence-case, not Geist Mono. 2026-07-12 two-font law: the $5k/mo
 * pill (.amt) is Satoshi too now — Geist Mono is banned site-wide, no exceptions.
 */
const GoIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

function Row({ s }: { s: ServiceEntry }) {
  return (
    <li>
      <a className="svc-row" href={`/services/${s.slug}`}>
        <span className="sr-txt">
          <b>{s.name}</b>
          <span>{s.blurb}</span>
        </span>
        <span className="sr-go" aria-hidden="true">
          <GoIcon />
        </span>
      </a>
    </li>
  );
}

export function ServicesIndex() {
  const build = SERVICES.filter((s) => s.track === 'build');
  const grow = SERVICES.filter((s) => s.track === 'grow');

  return (
    <section className="svc" id="services" aria-label="All seven services">
      <div className="container">
        <div className="svc-head rv">
          <h2 className="display on-dark">
            One offer, <span className="ghost">two tracks.</span>
          </h2>
          <p className="lede on-dark">
            Build ships and sharpens the site. Growth compounds the traffic and the AI answers. Most
            teams start on one track — the strongest run both, because the site you ship feeds the
            traffic you grow, and back again.
          </p>
        </div>

        <div className="svc-grid">
          {/* TRACK A — BUILD */}
          <article className="track build rv">
            <div className="track-top">
              <div>
                <span className="track-num">Track A</span>
                <h3>Build</h3>
              </div>
              <span className="track-tagline">Ship &amp; sharpen the site</span>
            </div>
            <ul className="svc-list">
              {build.map((s) => (
                <Row key={s.slug} s={s} />
              ))}
            </ul>
          </article>

          {/* TRACK B — GROWTH */}
          <article className="track grow rv" style={{ ['--d' as string]: '.08s' }}>
            <div className="track-top">
              <div>
                <span className="track-num">Track B</span>
                <h3>Growth</h3>
              </div>
              <span className="track-tagline">Compound the traffic</span>
            </div>
            <ul className="svc-list">
              {grow.map((s) => (
                <Row key={s.slug} s={s} />
              ))}
            </ul>
            <p className="track-note">
              SEO/AEO and GEO look like twins. They’re not — the panel below draws the line.
            </p>
          </article>

          <div className="svc-both rv" style={{ ['--d' as string]: '.14s' }}>
            <span className="glyph">A + B</span>
            <p>
              Run one track or both. When you run both, the same team owns the whole loop — nothing
              gets re-briefed between the people who build and the people who grow.
            </p>
            <span className="amt">
              Engagements from <em>$5k/mo</em>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
