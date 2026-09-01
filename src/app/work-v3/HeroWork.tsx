/**
 * HeroWork — the deep-indigo band that opens /case-studies, and the ONLY thing
 * between the top of the page and the first case study.
 *
 * It used to also carry a "now showing" stage: a tab switcher over four
 * flagship studies, each on a large screenshot mat. That stage was cut on
 * 2026-09-01. Two reasons. It duplicated the archive's own lead card almost
 * exactly — same Toku screenshot, same "0 → 97.8%", same headline, one screen
 * apart. And it made the band ~830px tall, so a visitor scrolled past a full
 * screen of hero, then a logo strip, then a second heading, then the filter
 * tabs before reaching a single study (Arnel).
 *
 * The band is now copy plus the discipline filter bar, which Archive passes in
 * as `children` because the filter state lives there. Keep it short: anything
 * added here is something a visitor reads before seeing any work.
 */
const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export function HeroWork({ total, children }: { total: number; children?: React.ReactNode }) {
  return (
    <section className="hero" aria-label="Selected work">
      <div className="container">
        <div className="hero-copy">
          <span className="hero-eyebrow rv">
            <b>Selected work</b>
            <em>{total} studies</em>
          </span>
          <h1 className="rv" style={{ ['--d' as string]: '.06s' }}>
            Real results.
            <br />
            <span className="soft">Receipts attached.</span>
          </h1>
          <p className="hero-sub rv" style={{ ['--d' as string]: '.12s' }}>
            Every study below is a real B2B SaaS engagement we shipped — no stock mockups, no
            invented numbers. Filter by what you came for.
          </p>
          <div className="hero-cta rv" style={{ ['--d' as string]: '.18s' }}>
            <a href="#book" data-cal-trigger className="btn btn-white btn-lg btn-pill">
              Book a strategy call
            </a>
            <a href="#archive" className="tlink">
              Jump to the {total} studies
              <ArrowIcon />
            </a>
          </div>
        </div>
      </div>
      {children}
    </section>
  );
}
