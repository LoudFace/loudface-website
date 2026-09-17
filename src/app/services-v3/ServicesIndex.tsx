import type { ServicesIndexContent, ServicesIndexEntry } from '@/lib/content-utils';
import { TRACK_BY_SLUG } from './data';

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

function Row({ s }: { s: ServicesIndexEntry }) {
  return (
    <li>
      <a className="svc-row" href={`/services/${s.slug}`}>
        <span className="sr-txt">
          <b>{s.serviceName}</b>
          <span>{s.blurb}</span>
        </span>
        <span className="sr-go" aria-hidden="true">
          <GoIcon />
        </span>
      </a>
    </li>
  );
}

export function ServicesIndex({ content }: { content: ServicesIndexContent }) {
  const build = content.entries.filter((s) => TRACK_BY_SLUG[s.slug] === 'build');
  const grow = content.entries.filter((s) => TRACK_BY_SLUG[s.slug] === 'grow');

  return (
    <section className="svc" id="services" aria-label="All seven services">
      <div className="container">
        <div className="svc-head rv">
          <h2 className="display on-dark">
            {content.headline} <span className="ghost">{content.headlineHighlight}</span>
          </h2>
          <p className="lede on-dark">
            {content.intro}
          </p>
        </div>

        <div className="svc-grid">
          {/* TRACK A — BUILD */}
          <article className="track build rv">
            <div className="track-top">
              <div>
                <span className="track-num">{content.buildNum}</span>
                <h3>{content.buildLabel}</h3>
              </div>
              <span className="track-tagline">{content.buildTagline}</span>
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
                <span className="track-num">{content.growNum}</span>
                <h3>{content.growLabel}</h3>
              </div>
              <span className="track-tagline">{content.growTagline}</span>
            </div>
            <ul className="svc-list">
              {grow.map((s) => (
                <Row key={s.slug} s={s} />
              ))}
            </ul>
            <p className="track-note">
              {content.growNote}
            </p>
          </article>

          <div className="svc-both rv" style={{ ['--d' as string]: '.14s' }}>
            <span className="glyph">{content.bothGlyph}</span>
            <p>
              {content.bothText}
            </p>
            <span className="amt">
              {content.amtPrefix}<em>{content.amtValue}</em>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
