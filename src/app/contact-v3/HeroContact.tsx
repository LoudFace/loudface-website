import { CONTACT_EMAIL } from './data';
import type { ContactHeroContent } from '@/lib/content-utils';

/**
 * HeroContact — the electric full-bleed hero: copy column (eyebrow + h1 + sub
 * + CTA row with a mailto escape hatch) beside the "engagement card" booking
 * panel (Free · 30 min agenda card). Every booking CTA carries
 * href="#book-modal" + data-cal-trigger so the shared CalHandler opens the
 * Cal.com modal — no second booking mechanism. The shared (site) Header
 * renders its transparent dark-variant bar over this stage.
 */
const tick = (
  <span className="tick" aria-hidden="true">
    <svg viewBox="0 0 12 12" fill="none">
      <path d="M2.5 6.2 5 8.7l4.5-5" stroke="var(--color-primary-400)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </span>
);

const d = (v: string) => ({ ['--d' as string]: v });

export function HeroContact({ content }: { content: ContactHeroContent }) {
  return (
    <header className="hero" aria-label="Contact LoudFace">
      <div className="wrap hero__inner">
        <div className="hero__copy">
          <span className="eyebrow eyebrow--dark rv">{content.eyebrow}</span>
          <h1 className="rv" style={d('.06s')}>
            {content.headlinePrefix}<span className="hl">{content.headlineHighlight}</span>{content.headlineSuffix}
          </h1>
          <p className="hero__sub rv" style={d('.12s')} data-speakable>
            {content.description}
          </p>
          <div className="hero__ctas rv" style={d('.18s')}>
            <a href="#book-modal" data-cal-trigger className="btn btn-white">
              {content.ctaText} <span className="btn-arrow" aria-hidden="true">&rarr;</span>
            </a>
            <a href={`mailto:${CONTACT_EMAIL}`} className="hero__email">
              {content.emailPrefix}<u>{CONTACT_EMAIL}</u>
            </a>
          </div>
        </div>

        {/* engagement card = the booking panel + thread node 01 */}
        <div className="hero__panel rv" style={d('.14s')}>
          <div className="ecard">
            <div className="ecard__top">
              <span className="ecard__kick">{content.cardKicker}</span>
              <span className="ecard__chip">{content.cardChip}</span>
            </div>
            <h2>{content.cardTitle}</h2>
            <div className="ecard__meta">
              <span>{content.cardMetaVideo}</span>
              <span className="sep" aria-hidden="true"></span>
              <span>{content.cardMetaFounder}</span>
            </div>
            <div className="ecard__rule" aria-hidden="true"></div>
            <div className="ecard__label">{content.cardLabel}</div>
            <ul className="agenda">
              <li>{tick} {content.agenda[0]}</li>
              <li>{tick} {content.agenda[1]}</li>
              <li>{tick} {content.agenda[2]}</li>
            </ul>
            <div className="ecard__cta">
              <a href="#book-modal" data-cal-trigger className="btn btn-white btn-full">
                {content.ctaText} <span className="btn-arrow" aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div>
          <div className="thread-origin" aria-hidden="true">
            <span className="thread-origin__label">then the sequence begins</span>
          </div>
        </div>
      </div>
    </header>
  );
}
