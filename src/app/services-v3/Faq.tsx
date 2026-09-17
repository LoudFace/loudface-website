import type { ServicesFaqContent } from '@/lib/content-utils';

/**
 * Faq — light native-<details> accordion (how engaging LoudFace across services
 * works). Content is single-sourced from SERVICES_FAQ in ./data so the page can
 * emit the FAQPage JSON-LD from the same items. First item opens by default.
 */
export function Faq({ content }: { content: ServicesFaqContent }) {
  return (
    <section className="faq" aria-label="Frequently asked questions">
      <div className="container">
        <div className="faq-in">
          <div className="faq-head rv">
            <h2 className="display" style={{ textAlign: 'center', maxWidth: '24ch' }}>
              {content.headline} <span className="ghost">{content.headlineHighlight}</span>
            </h2>
          </div>
          <div className="faq-list rv">
            {content.items.map((item, i) => (
              <details className="qa" key={i} open={i === 0}>
                <summary>
                  {item.question}
                  <span className="x" aria-hidden="true"></span>
                </summary>
                {item.answerHtml ? (
                  <div className="a" dangerouslySetInnerHTML={{ __html: item.answerHtml }} />
                ) : (
                  <div className="a">{item.answer}</div>
                )}
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
