import { getFAQContent } from '@/lib/content-utils';
import { Button } from '@/components/ui';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  title?: string;
  subtitle?: string;
  items: FAQItem[];
  showFooter?: boolean;
  footerTitle?: string;
  footerText?: string;
  footerCtaText?: string;
  /** Skip JSON-LD schema generation (use when schema is already emitted elsewhere on the page) */
  skipSchema?: boolean;
  /**
   * `accordion` = collapsible (CSS :target / <details>) inside the editorial grid.
   * `open` = all answers visible. AEO surfaces almost always want `open` so
   * the answers are scrapable without interaction.
   */
  variant?: 'accordion' | 'open';
}

// Strip HTML tags from answer for schema + extraction preview
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Slugify the question to create stable anchor ids for FAQ deep-linking.
// Match the convention used by H2 ids in the article body so external
// anchors (#faq-q-01-…) keep working across content edits.
function questionAnchor(idx: number, question: string): string {
  const slug = question
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
  return `faq-${String(idx + 1).padStart(2, '0')}-${slug}`;
}

export function FAQ({
  title,
  subtitle,
  items,
  showFooter = true,
  footerTitle,
  footerText,
  footerCtaText,
  skipSchema = false,
  variant = 'accordion',
}: FAQProps) {
  const content = getFAQContent();

  const finalTitle = title ?? content.title;
  const finalSubtitle = subtitle ?? content.subtitle;
  const finalFooterTitle = footerTitle ?? content.footerTitle;
  const finalFooterText = footerText ?? content.footerText;
  const finalFooterCtaText = footerCtaText ?? content.footerCtaText;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: stripHtml(item.answer),
      },
    })),
  };

  return (
    <>
      {!skipSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <section className="faq-editorial">
        <div className="faq-editorial__inner">
          {/* Header — editorial register: mono label + serif title + count */}
          <header className="faq-editorial__head">
            <div className="faq-editorial__head-text">
              <div className="faq-editorial__label">
                <span aria-hidden="true" className="faq-editorial__rule" />
                <span>Frequently asked</span>
              </div>
              <h2 className="faq-editorial__title">{finalTitle}</h2>
              {finalSubtitle && (
                <p className="faq-editorial__subtitle">{finalSubtitle}</p>
              )}
            </div>
            <div className="faq-editorial__meta">
              <span className="faq-editorial__count">
                {items.length} {items.length === 1 ? 'question' : 'questions'}
              </span>
              <span className="faq-editorial__extractable">AEO-extractable</span>
            </div>
          </header>

          {/* Numbered Q&A list */}
          <ol className="faq-editorial__list">
            {items.map((item, index) => {
              const anchor = questionAnchor(index, item.question);
              const num = `Q.${String(index + 1).padStart(2, '0')}`;
              if (variant === 'accordion') {
                return (
                  <li key={index} className="faq-editorial__item" id={anchor}>
                    <details className="faq-editorial__details group">
                      <summary className="faq-editorial__summary">
                        <span className="faq-editorial__num" aria-hidden="true">{num}</span>
                        <span className="faq-editorial__q">{item.question}</span>
                        <span className="faq-editorial__toggle" aria-hidden="true">
                          <span className="faq-editorial__toggle-bar" />
                          <span className="faq-editorial__toggle-bar faq-editorial__toggle-bar--v" />
                        </span>
                      </summary>
                      <div className="faq-editorial__body">
                        <p
                          className="faq-editorial__a"
                          dangerouslySetInnerHTML={{ __html: item.answer }}
                        />
                      </div>
                    </details>
                  </li>
                );
              }
              return (
                <li key={index} className="faq-editorial__item faq-editorial__item--open" id={anchor}>
                  <div className="faq-editorial__row">
                    <span className="faq-editorial__num" aria-hidden="true">{num}</span>
                    <div className="faq-editorial__rowbody">
                      <h3 className="faq-editorial__q">{item.question}</h3>
                      <p
                        className="faq-editorial__a"
                        dangerouslySetInnerHTML={{ __html: item.answer }}
                      />
                      <a href={`#${anchor}`} className="faq-editorial__anchor" aria-label={`Direct link to ${item.question}`}>
                        Link to this answer
                      </a>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          {showFooter && (
            <div className="faq-editorial__footer">
              <h3>{finalFooterTitle}</h3>
              <p>{finalFooterText}</p>
              <div className="faq-editorial__footer-cta">
                <Button variant="primary" size="lg" calTrigger>
                  {finalFooterCtaText}
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

