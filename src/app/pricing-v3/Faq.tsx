import type { PricingFaqContent } from '@/lib/content-utils';

/**
 * Faq — light section: indigo composite panel (Cal CTA + at-a-glance stats)
 * beside a native <details> accordion. Items come from PRICING_FAQ (same
 * source the page's FAQPage JSON-LD is generated from).
 */
const d = (v: string) => ({ ['--d' as string]: v });

export function Faq({ content }: { content: PricingFaqContent }) {
  return (
    <section className="faq" id="faq">
      <div className="container faq-grid">
        <aside className="faq-panel rv" aria-label="Pricing questions summary">
          <h3>
            <span className="soft-em">{content.panelTitleHighlight}</span> {content.panelTitleRest}
          </h3>
          <p className="pl">{content.panelText}</p>
          <a className="btn btn-pill btn-white btn-md" href="#book-modal" data-cal-trigger="">
            {content.ctaText}
          </a>
          <div className="fstats" aria-label="At a glance">
            <div className="fstat">
              <b className="tab">
                {content.stats[0].value}<span style={{ fontSize: '14px' }}>/{content.stats[0].period}</span>
              </b>
              <span>{content.stats[0].label}</span>
            </div>
            <div className="fstat">
              <b className="tab">{content.stats[1].value}</b>
              <span>{content.stats[1].label}</span>
            </div>
            <div className="fstat">
              <b className="tab">{content.stats[2].value}</b>
              <span>{content.stats[2].label}</span>
            </div>
          </div>
        </aside>

        <div className="acc rv" style={d('.08s')}>
          {content.items.map((item, i) => (
            <details key={item.question} open={i === 0}>
              <summary>
                {item.question}
                <span className="mk" aria-hidden="true"></span>
              </summary>
              {item.answerHtml ? (
                <p className="ans" dangerouslySetInnerHTML={{ __html: item.answerHtml }} />
              ) : (
                <p className="ans">{item.answer}</p>
              )}
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
