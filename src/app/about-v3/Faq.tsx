/**
 * FAQ — B's design (deep focal panel + light native-<details> accordion) with
 * A's panel copy + Q&A. Native <details> needs no client JS, so this stays a
 * server component. The "Team members" stat is derived from the live CMS count.
 */
import { rawContent, type AboutContent, type AboutFaqContent } from '@/lib/content-utils';

// Strip any markup before it lands in JSON-LD (answers are plain text today, but this
// keeps the schema safe if a future edit slips in a <br> or similar).
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function Faq({ teamCount, content }: { teamCount: number; content: AboutFaqContent }) {
  // JSON-LD reads the unmarked source (rawContent), never the async getter's
  // marked tree — inline-edit markers must never reach structured data.
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: rawContent<AboutContent>('about').faq.items.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: stripHtml(f.answer),
      },
    })),
  };

  return (
    <section className="faq">
      {/* FAQPage Structured Data — native script for SSR visibility to crawlers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="container faq-grid">
        <aside className="faq-panel rv" aria-label="Frequently asked questions summary">
          <h3>{content.panelTitle}</h3>
          <p className="pl">
            {content.panelText}
          </p>
          <a className="btn btn-pill btn-white btn-md" href="#book" data-cal-trigger="">
            {content.ctaText}
          </a>
          <div className="fstats">
            <div className="fstat">
              <b className="tab">{content.stats[0].value}</b>
              <span>{content.stats[0].label}</span>
            </div>
            <div className="fstat">
              <b className="tab">{content.stats[1].value}</b>
              <span>{content.stats[1].label}</span>
            </div>
            <div className="fstat">
              <b className="tab">{teamCount}</b>
              <span>{content.stats[2].label}</span>
            </div>
            <div className="fstat">
              <b className="tab">{content.stats[3].value}</b>
              <span>{content.stats[3].label}</span>
            </div>
          </div>
        </aside>

        <div className="acc rv" style={{ ['--d' as string]: '.08s' }}>
          {content.items.map((f) => (
            <details key={f.question} open={f.open || undefined}>
              <summary>
                {f.question}
                <span className="mk" aria-hidden="true"></span>
              </summary>
              <p className="ans">{f.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
