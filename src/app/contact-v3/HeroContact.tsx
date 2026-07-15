import { CONTACT_EMAIL } from './data';

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
      <path d="M2.5 6.2 5 8.7l4.5-5" stroke="#818cf8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </span>
);

const d = (v: string) => ({ ['--d' as string]: v });

export function HeroContact() {
  return (
    <header className="hero" aria-label="Contact LoudFace">
      <div className="wrap hero__inner">
        <div className="hero__copy">
          <span className="eyebrow eyebrow--dark rv">2h response time</span>
          <h1 className="rv" style={d('.06s')}>
            The <span className="hl">first move</span> is a 30-minute call.
          </h1>
          <p className="hero__sub rv" style={d('.12s')} data-speakable>
            No forms to fill, no discovery deck, no sales gauntlet. Book the call, we look at your
            site together, and you leave knowing exactly what&rsquo;s holding it back, whether or
            not we end up working together.
          </p>
          <div className="hero__ctas rv" style={d('.18s')}>
            <a href="#book-modal" data-cal-trigger className="btn btn-white">
              Book an intro call <span className="btn-arrow" aria-hidden="true">&rarr;</span>
            </a>
            <a href={`mailto:${CONTACT_EMAIL}`} className="hero__email">
              or email <u>{CONTACT_EMAIL}</u>
            </a>
          </div>
        </div>

        {/* engagement card = the booking panel + thread node 01 */}
        <div className="hero__panel rv" style={d('.14s')}>
          <div className="ecard">
            <div className="ecard__top">
              <span className="ecard__kick">The first move</span>
              <span className="ecard__chip">Free &middot; 30 min</span>
            </div>
            <h2>Intro call</h2>
            <div className="ecard__meta">
              <span>Video call</span>
              <span className="sep" aria-hidden="true"></span>
              <span>With our founder</span>
            </div>
            <div className="ecard__rule" aria-hidden="true"></div>
            <div className="ecard__label">What we&rsquo;ll cover</div>
            <ul className="agenda">
              <li>{tick} What&rsquo;s holding your site back</li>
              <li>{tick} Where the revenue leaks</li>
              <li>{tick} Whether we&rsquo;re the right fit</li>
            </ul>
            <div className="ecard__cta">
              <a href="#book-modal" data-cal-trigger className="btn btn-white btn-full">
                Book an intro call <span className="btn-arrow" aria-hidden="true">&rarr;</span>
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
