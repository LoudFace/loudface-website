import { CONTACT_FAQ } from './data';

/**
 * Faq — light editorial accordion ("the honest answers"): aside with a Cal CTA
 * beside a native-<details> list. Items are single-sourced from CONTACT_FAQ in
 * ./data (same source the page's FAQPage JSON-LD is generated from). First
 * item opens by default.
 */
export function Faq() {
  return (
    <section className="faq" aria-label="Frequently asked questions">
      <div className="wrap faq__grid">
        <div className="faq__aside rv">
          <h2>The honest answers.</h2>
          <p>Five things people usually want to know before they put a call on the calendar.</p>
          <a href="#book-modal" data-cal-trigger className="btn btn-primary">
            Book an intro call <span className="btn-arrow" aria-hidden="true">&rarr;</span>
          </a>
        </div>

        <div className="faq__list rv" style={{ ['--d' as string]: '.08s' }}>
          {CONTACT_FAQ.map((item, i) => (
            <details key={item.q} open={i === 0}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
