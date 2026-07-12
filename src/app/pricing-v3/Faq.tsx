import { PRICING_FAQ } from './data';

/**
 * Faq — light section: indigo composite panel (Cal CTA + at-a-glance stats)
 * beside a native <details> accordion. Items come from PRICING_FAQ (same
 * source the page's FAQPage JSON-LD is generated from).
 */
const d = (v: string) => ({ ['--d' as string]: v });

export function Faq() {
  return (
    <section className="faq" id="faq">
      <div className="container faq-grid">
        <aside className="faq-panel rv" aria-label="Pricing questions summary">
          <h3>
            <span className="soft-em">Still</span> have questions?
          </h3>
          <p className="pl">We&rsquo;re here to help you with any inquiries.</p>
          <a className="btn btn-pill btn-white btn-md" href="#book-modal" data-cal-trigger="">
            Book a strategy call
          </a>
          <div className="fstats" aria-label="At a glance">
            <div className="fstat">
              <b className="tab">
                $5k<span style={{ fontSize: '14px' }}>/mo</span>
              </b>
              <span>engagements start from</span>
            </div>
            <div className="fstat">
              <b className="tab">2h</b>
              <span>response time, every tier</span>
            </div>
            <div className="fstat">
              <b className="tab">1&ndash;4</b>
              <span>active initiatives by tier</span>
            </div>
          </div>
        </aside>

        <div className="acc rv" style={d('.08s')}>
          {PRICING_FAQ.map((item, i) => (
            <details key={item.q} open={i === 0}>
              <summary>
                {item.q}
                <span className="mk" aria-hidden="true"></span>
              </summary>
              {item.aHtml ? (
                <p className="ans" dangerouslySetInnerHTML={{ __html: item.aHtml }} />
              ) : (
                <p className="ans">{item.a}</p>
              )}
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
