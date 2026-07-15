/**
 * FaqDetail — the "key insights" accordion (server component). Rendered whenever
 * ≥2 FAQ items exist — which is every live study today (4–8 items each), so this
 * is an always-on section, not a conditional edge case.
 *
 * This is a bespoke, design-coherent port of the FAQ (native <details>, no JS).
 * The FAQPage JSON-LD is emitted once by the page (buildFAQSchema), so this
 * markup carries no schema of its own — no duplicate FAQPage block.
 */
interface FaqItem {
  question: string;
  answer: string;
}

interface FaqDetailProps {
  items: FaqItem[];
  clientName?: string;
}

export function FaqDetail({ items, clientName }: FaqDetailProps) {
  if (!items || items.length < 2) return null;

  return (
    <section className="faq" id="faq" aria-label="Frequently asked questions">
      <div className="container-wide">
        <div className="faq-grid">
          <div className="faq-head">
            <h2 className="h-sec">Key insights</h2>
            <p className="lead">
              The questions buyers and founders ask about {clientName ? `the ${clientName} project` : 'this project'}, answered.
            </p>
          </div>
          <div className="faq-list">
            {items.map((item, i) => (
              <details className="faq-item" key={i} open={i === 0}>
                <summary>
                  {item.question}
                  <span className="ic" aria-hidden="true" />
                </summary>
                <div className="ans">
                  <p dangerouslySetInnerHTML={{ __html: item.answer }} />
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
