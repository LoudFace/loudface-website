import { SERVICES_FAQ } from './data';

/**
 * Faq — light native-<details> accordion (how engaging LoudFace across services
 * works). Content is single-sourced from SERVICES_FAQ in ./data so the page can
 * emit the FAQPage JSON-LD from the same items. First item opens by default.
 */
export function Faq() {
  return (
    <section className="faq" aria-label="Frequently asked questions">
      <div className="container">
        <div className="faq-in">
          <div className="faq-head rv">
            <h2 className="display" style={{ textAlign: 'center', maxWidth: '24ch' }}>
              Questions before <span className="ghost">the call.</span>
            </h2>
          </div>
          <div className="faq-list rv">
            {SERVICES_FAQ.map((item, i) => (
              <details className="qa" key={i} open={i === 0}>
                <summary>
                  {item.q}
                  <span className="x" aria-hidden="true"></span>
                </summary>
                {item.aHtml ? (
                  <div className="a" dangerouslySetInnerHTML={{ __html: item.aHtml }} />
                ) : (
                  <div className="a">{item.a}</div>
                )}
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
