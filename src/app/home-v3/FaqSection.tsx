import type { HomeV3FaqContent } from '@/lib/content-utils';

/**
 * FaqSection — "Before you book." A saturated focal panel (eyebrow, lead, CTA,
 * numbers) beside a native <details> accordion. The v3 design is bespoke, so
 * this keeps its own markup rather than reusing the shared FAQ component.
 * Copy comes from content (src/data/content/homepage-v3.json, `faq`); only
 * the first item's `open` state stays curated here.
 */
const OPEN_FIRST = true;

export function FaqSection({ content }: { content: HomeV3FaqContent }) {
  return (
    <section className="faq">
      <div className="container faq-grid">
        <div className="faq-panel rv">
          <span className="eyebrow glass"><i aria-hidden="true"></i>{content.eyebrowLabel}</span>
          <h2 className="sec">{content.headline}</h2>
          <p className="faq-lead">
            {content.lead}
          </p>
          <div className="faq-cta">
            <a href="#book" data-cal-trigger="" className="btn btn-white btn-lg">{content.ctaText}</a>
            <span className="slots"><i className="dot"></i>{content.responseTime}</span>
          </div>
          <div className="fstats" aria-label="LoudFace in numbers">
            {content.stats.map((st) => (
              <div className="fstat" key={st.label}>
                <b>{st.value}</b>
                <span>{st.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="faq-list rv" style={{ transitionDelay: '.1s' }}>
          {content.items.map((f, i) => (
            <details className="qa" key={i} open={(i === 0 && OPEN_FIRST) || undefined}>
              <summary>
                {f.question}
                <span className="x" aria-hidden="true"></span>
              </summary>
              <p className="a">{f.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
