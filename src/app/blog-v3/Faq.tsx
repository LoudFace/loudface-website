/**
 * Faq — the light full-width FAQ accordion. Native <details>/<summary>, so it
 * works with zero JS (matches the concept). Rendered by the caller only when
 * there are >=2 items (the same bar the FAQPage JSON-LD fires on). Answers are
 * CMS HTML strings → dangerouslySetInnerHTML, same as the old template. The
 * first item is open by default. Section id="faq" so the appended TOC entry
 * lands here.
 */
interface FaqProps {
  items: { question: string; answer: string }[];
}

export function Faq({ items }: FaqProps) {
  if (items.length < 2) return null;
  return (
    <section className="faq" id="faq" aria-label="Frequently asked questions">
      <div className="container faq-grid">
        <div className="faq-head">
          <span className="label" style={{ color: 'var(--primary-600)' }}>FAQ</span>
          <h2>Frequently asked <span className="hot">questions</span></h2>
          <p>Answers to the questions readers ask most about this topic.</p>
        </div>
        <div className="faq-list">
          {items.map((item, i) => (
            <details className="faq-item" key={i} open={i === 0}>
              <summary>
                <span className="faq-q">{item.question}</span>
                <span className="faq-ic" aria-hidden="true">
                  <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
                </span>
              </summary>
              <div className="faq-a">
                <p dangerouslySetInnerHTML={{ __html: item.answer }} />
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
