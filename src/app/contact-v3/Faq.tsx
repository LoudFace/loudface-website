import type { ContactFaqContent } from '@/lib/content-utils';

/**
 * Faq — light editorial accordion ("the honest answers"): aside with a Cal CTA
 * beside a native-<details> list. Items are single-sourced from CONTACT_FAQ in
 * ./data (same source the page's FAQPage JSON-LD is generated from). First
 * item opens by default.
 */
export function Faq({ content }: { content: ContactFaqContent }) {
  return (
    <section className="faq" aria-label="Frequently asked questions">
      <div className="wrap faq__grid">
        <div className="faq__aside rv">
          <h2>{content.headline}</h2>
          <p>{content.intro}</p>
          <a href="#book-modal" data-cal-trigger className="btn btn-primary">
            {content.ctaText} <span className="btn-arrow" aria-hidden="true">&rarr;</span>
          </a>
        </div>

        <div className="faq__list rv" style={{ ['--d' as string]: '.08s' }}>
          {content.items.map((item, i) => (
            <details key={item.question} open={i === 0}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
