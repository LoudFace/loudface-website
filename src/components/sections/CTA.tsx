import { getCTAContent } from '@/lib/content-utils';
import { Button } from '@/components/ui/Button';

interface CTAProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  variant?: 'light' | 'dark';
}

export function CTA({
  title,
  subtitle,
  ctaText,
  variant = 'light',
}: CTAProps) {
  // Load content from JSON file
  const content = getCTAContent();

  // Use props or fall back to content defaults
  const finalTitle = title ?? content.title;
  const finalSubtitle = subtitle ?? content.subtitle;
  const finalCtaText = ctaText ?? content.ctaText;

  const bgClass = variant === 'dark' ? 'bg-surface-900' : 'bg-surface-50';
  const titleClass = variant === 'dark' ? 'text-white' : 'text-surface-900';
  const subtitleClass = variant === 'dark' ? 'text-surface-300' : 'text-surface-600';

  return (
    <section className={bgClass}>
      <div className="py-24 md:py-32 lg:py-40">
        <div className="px-4 md:px-8 lg:px-12">
          <div className="max-w-2xl mx-auto text-center">
            <h2
              className={`text-2xl sm:text-3xl md:text-4xl font-medium leading-tight tracking-tight ${titleClass}`}
            >
              {finalTitle}
            </h2>

            <p className={`mt-6 text-lg md:text-xl ${subtitleClass}`}>{finalSubtitle}</p>

            <div className="mt-10">
              <Button
                variant="primary"
                size="lg"
                calLink="arnelbukva/loudface-intro-call"
                className="px-8 py-4 rounded-full hover:-translate-y-0.5"
              >
                {finalCtaText}
                <svg
                  className="ml-2 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
