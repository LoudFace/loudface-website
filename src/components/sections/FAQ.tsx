import Script from 'next/script';
import { getFAQContent } from '@/lib/content-utils';
import { SectionContainer } from '@/components/ui/SectionContainer';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/Button';

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
}

// Strip HTML tags from answer for schema
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function FAQ({
  title,
  subtitle,
  items,
  showFooter = true,
  footerTitle,
  footerText,
  footerCtaText,
}: FAQProps) {
  const content = getFAQContent();

  const finalTitle = title ?? content.title;
  const finalSubtitle = subtitle ?? content.subtitle;
  const finalFooterTitle = footerTitle ?? content.footerTitle;
  const finalFooterText = footerText ?? content.footerText;
  const finalFooterCtaText = footerCtaText ?? content.footerCtaText;

  // Extract the last word for highlighting
  const titleWords = finalTitle.split(' ');
  const highlightWord = titleWords.length > 1 ? titleWords[titleWords.length - 1] : undefined;

  // Generate FAQPage structured data
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
      {/* FAQPage Structured Data */}
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <SectionContainer>
        {/* Header - always on top */}
        <div className="mb-8 lg:mb-12">
          <SectionHeader title={finalTitle} highlightWord={highlightWord} subtitle={finalSubtitle} />
        </div>

        {/* FAQ Items + Footer CTA */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 lg:gap-12">
          {/* FAQ Items */}
          <div className="space-y-0 divide-y divide-surface-200 border-y border-surface-200">
            {items.map((item, index) => (
              <details key={index} className="group faq-details">
                <summary className="flex items-center justify-between gap-4 py-5 cursor-pointer list-none select-none hover:bg-surface-50 -mx-4 px-4 transition-colors focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2 rounded-lg">
                  <span className="text-base md:text-lg font-medium text-surface-900 pr-4">
                    {item.question}
                  </span>
                  <span className="flex-shrink-0 w-6 h-6 relative" aria-hidden="true">
                    <span className="absolute top-1/2 left-0 w-6 h-0.5 bg-surface-400 -translate-y-1/2 transition-transform group-open:rotate-0" />
                    <span className="absolute top-1/2 left-0 w-6 h-0.5 bg-surface-400 -translate-y-1/2 rotate-90 transition-transform group-open:rotate-0" />
                  </span>
                </summary>
                <div className="pb-5 pr-10 text-surface-600 leading-relaxed overflow-hidden animate-fade-in">
                  <p dangerouslySetInnerHTML={{ __html: item.answer }} />
                </div>
              </details>
            ))}
          </div>

          {/* Footer CTA */}
          {showFooter && (
            <div className="lg:pl-8 lg:text-left text-center flex flex-col justify-start">
              <h3 className="text-xl font-bold text-surface-900">{finalFooterTitle}</h3>
              <p className="mt-2 text-surface-600">{finalFooterText}</p>
              <div className="mt-4">
                <Button variant="primary" size="lg" calLink="arnelbukva/loudface-intro-call">
                  {finalFooterCtaText}
                </Button>
              </div>
            </div>
          )}
        </div>
      </SectionContainer>
    </>
  );
}
