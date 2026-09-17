/**
 * HeroPricing — deep night stage where the 3 Autopilot tier cards ARE the hero
 * objects (white featured Dual between two glass cards). The $5k/mo anchor pill
 * is the hero's only CTA-equivalent (scroll-links to #compare); the tier CTAs
 * open the Cal modal. The shared (site) Header renders its transparent
 * dark-variant bar over this stage — this section carries NO nav of its own.
 */
import type { PricingHeroContent } from '@/lib/content-utils';

/** Purely presentational stagger — not content, so it stays keyed by array position. */
const DELAYS = ['.16s', '.1s', '.22s'];

const d = (v: string) => ({ ['--d' as string]: v });

export function HeroPricing({ content }: { content: PricingHeroContent }) {
  return (
    <section className="hero diag">
      <div className="container">
        <div className="hero-head">
          <span className="hero-eyebrow rv">
            <b>{content.eyebrowBrand}</b>
            <em>{content.eyebrowSub}</em>
          </span>
          <h1 className="rv" style={d('.06s')}>
            {content.headline}
            <br />
            <span className="soft">{content.headlineHighlight}</span>
          </h1>
          <p className="hero-sub rv" style={d('.12s')} data-speakable>
            {content.description}
          </p>
          <a className="hero-anchor rv" style={d('.18s')} href="#compare">
            <span className="lbl">{content.anchorLabel}</span>
            <span className="amt">
              {content.anchorPrice}<em>/{content.anchorPeriod}</em>
            </span>
            <svg className="chev" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h13M13 6l6 6-6 6" />
            </svg>
          </a>
        </div>

        {/* the tier deck: the hero objects */}
        <div className="deck" role="list" aria-label="Autopilot plans">
          {content.tiers.map((t, i) => (
            <article
              key={t.tierName}
              className={`tier rv${t.featured ? ' is-feat' : ''}`}
              style={d(DELAYS[i] ?? '0s')}
              role="listitem"
            >
              {t.badge && (
                <span className="tier-badge">
                  <i></i>{t.badge}
                </span>
              )}
              <h2 className="tier-name">{t.tierName}</h2>
              <p className="tier-tag">{t.tagline}</p>
              <p className="tier-desc">{t.description}</p>
              <div className="tier-div" aria-hidden="true"></div>
              <ul className="tier-feat">
                {t.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <p className="tier-hint">{t.hint ?? ' '}</p>
              <a
                className={`btn ${t.featured ? 'btn-brand' : 'btn-ghost'} btn-md btn-full tier-cta`}
                href="#book-modal"
                data-cal-trigger=""
              >
                {t.ctaText}
              </a>
            </article>
          ))}
        </div>
        <p className="deck-note rv">
          {content.qualifierPrefix}<b>{content.qualifierHighlight}</b>
        </p>
      </div>
    </section>
  );
}
