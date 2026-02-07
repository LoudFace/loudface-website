import Link from 'next/link';
import { asset } from '@/lib/assets';
import { optimizeImage } from '@/lib/image-utils';
import { getResultsContent, type VideoTestimonial } from '@/lib/content-utils';
import { Button } from '@/components/ui';
import type { CaseStudy, Client, Testimonial } from '@/lib/types';

interface ResultsProps {
  title?: string;
  subtitle?: string;
  videoTestimonials?: VideoTestimonial[];
  caseStudies?: CaseStudy[];
  testimonial?: Testimonial;
  clients?: Map<string, Client>;
  ctaText?: string;
  ctaHref?: string;
}

export function Results({
  title,
  subtitle,
  videoTestimonials,
  caseStudies = [],
  testimonial,
  clients = new Map(),
  ctaText,
  ctaHref,
}: ResultsProps) {
  const content = getResultsContent();

  const finalTitle = title ?? content.title;
  const finalSubtitle = subtitle ?? content.subtitle;
  const finalVideoTestimonials = videoTestimonials ?? content.videoTestimonials;
  const finalCtaText = ctaText ?? content.ctaText;
  const finalCtaHref = ctaHref ?? content.ctaHref;

  // Get first two case studies for slots
  const slot1Item = caseStudies[0];
  const slot2Item = caseStudies[1];

  // Helper to get client data
  const getClient = (clientId: string) => clients.get(clientId);

  // Arrow icon SVG for reuse
  const arrowIcon = `<svg width="14" height="14" viewBox="0 0 11 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.91854 1.85641H8.14011L1.06819 8.92834C1.01486 8.98166 0.972567 9.04496 0.94371 9.11463C0.914853 9.1843 0.9 9.25897 0.9 9.33437C0.9 9.40978 0.914853 9.48445 0.94371 9.55412C0.972567 9.62379 1.01486 9.68709 1.06818 9.74041C1.12151 9.79373 1.18481 9.83603 1.25448 9.86488C1.32414 9.89374 1.39881 9.90859 1.47422 9.90859C1.54963 9.90859 1.6243 9.89374 1.69396 9.86488C1.76363 9.83603 1.82693 9.79373 1.88025 9.74041L8.95193 2.66873V7.91349C8.95193 8.06562 9.01236 8.21153 9.11994 8.3191C9.22752 8.42668 9.37342 8.48711 9.52555 8.48711C9.67769 8.48711 9.82359 8.42668 9.93116 8.3191C10.0387 8.21153 10.0992 8.06562 10.0992 7.91349V1.31361C10.0997 1.30337 10.1 1.29311 10.1 1.28281C10.1 1.13052 10.0395 0.984466 9.93182 0.876779C9.82413 0.769092 9.67807 0.708594 9.52578 0.708594C9.51717 0.708594 9.50858 0.708787 9.50001 0.709172H2.91854C2.7664 0.709172 2.6205 0.769607 2.51292 0.877182C2.40535 0.984757 2.34491 1.13066 2.34491 1.28279C2.34491 1.43493 2.40535 1.58083 2.51292 1.6884C2.6205 1.79598 2.7664 1.85641 2.91854 1.85641Z" fill="currentColor" stroke="white" stroke-width="0.2"></path></svg>`;

  // Format title with highlighted words
  function formatTitle(text: string) {
    return text
      .replace(/customers/g, '<span class="text-surface-400">customers</span>')
      .replace(/results/g, '<span class="text-surface-400">results</span>');
  }

  // Case Study Card component
  const CaseStudyCard = ({ study }: { study: CaseStudy }) => {
    const client = getClient(study.client);

    return (
      <Link
        href={`/work/${study.slug}`}
        className="flex flex-col bg-white border border-surface-200 rounded-xl p-6 no-underline h-full transition-all duration-200 hover:border-surface-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2"
      >
        <div className="flex justify-between items-center">
          <img
            src={
              optimizeImage(client?.['colored-logo']?.url, 80) ||
              asset('/images/placeholder-logo.svg')
            }
            loading="lazy"
            width="83"
            height="26"
            alt={client?.name || study['project-title']}
            className="max-h-[26px] w-auto"
          />
          <span className="hidden sm:inline-flex items-center font-medium text-surface-900 transition-opacity hover:opacity-70">
            View case study
            <span className="ml-1" dangerouslySetInnerHTML={{ __html: arrowIcon }} />
          </span>
        </div>
        <div className="mt-auto pt-4">
          <div className="bg-surface-50 rounded-lg p-4">
            <h3 className="text-3xl md:text-4xl font-medium text-surface-900">
              {study['result-1---number'] || ''}
            </h3>
            <div className="h-2" />
            <p className="font-medium text-surface-700">{study['result-1---title'] || ''}</p>
            <div className="h-4" />
            <p className="text-sm text-surface-500 line-clamp-2">
              {study['paragraph-summary'] || ''}
            </p>
          </div>
          <span className="sm:hidden inline-flex items-center font-medium text-surface-900 mt-4 transition-opacity hover:opacity-70">
            View case study
            <span className="ml-1" dangerouslySetInnerHTML={{ __html: arrowIcon }} />
          </span>
        </div>
      </Link>
    );
  };

  return (
    <section className="bg-surface-50 border-t border-surface-200 pb-8 md:pb-0">
      <div className="py-12 md:py-16">
        <div className="px-4 md:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            {/* Spacer */}
            <div className="h-6 sm:h-8 md:h-12" />

            {/* Header */}
            <header className="max-w-lg md:max-w-xl mx-auto md:mx-0 text-center md:text-left">
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-medium text-surface-900 leading-tight"
                dangerouslySetInnerHTML={{ __html: formatTitle(finalTitle) }}
              />
              <div className="h-4" />
              <p className="text-surface-600 text-lg">{finalSubtitle}</p>
            </header>

            <div className="h-6 sm:h-8 md:h-12" />

            {/* Bento Grid - Two column masonry layout */}
            <div className="grid gap-5 md:gap-x-6 grid-cols-1 md:grid-cols-2 items-start">
              {/* Left Column */}
              <div className="flex flex-col gap-5">
                {/* Video Testimonial 1 */}
                {finalVideoTestimonials[0] && (
                  <div>
                    <div className="bg-surface-900 rounded-xl overflow-hidden">
                      <div className="aspect-video w-full">
                        <iframe
                          src={finalVideoTestimonials[0].videoUrl}
                          title={finalVideoTestimonials[0].videoTitle || 'Video testimonial'}
                          allow="fullscreen"
                          loading="lazy"
                          className="w-full h-full border-0"
                        />
                      </div>
                      <div className="px-5 py-4 flex flex-col gap-1">
                        <span className="font-bold text-white">
                          {finalVideoTestimonials[0].name}
                        </span>
                        <span className="text-white/80">{finalVideoTestimonials[0].role}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Case Study 2 */}
                {slot2Item && (
                  <div>
                    <CaseStudyCard study={slot2Item} />
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="flex flex-col gap-5">
                {/* Case Study 1 */}
                {slot1Item && (
                  <div>
                    <CaseStudyCard study={slot1Item} />
                  </div>
                )}

                {/* Testimonial */}
                {testimonial && (
                  <div>
                    <div className="bg-white border border-surface-200 rounded-xl p-6 flex flex-col">
                      <blockquote
                        className="text-base leading-7 text-surface-700 line-clamp-6 [&>p]:m-0"
                        dangerouslySetInnerHTML={{ __html: testimonial['testimonial-body'] || '' }}
                      />
                      <div className="h-6" />
                      <div className="flex justify-between items-end">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-surface-900">{testimonial.name}</span>
                          <span className="text-surface-600">{testimonial.role}</span>
                        </div>
                        <div
                          className="w-10 h-10 flex items-center justify-center bg-surface-900 rounded-full cursor-pointer transition-transform hover:scale-105"
                          aria-label="View testimonial"
                        >
                          <img
                            src={asset('/images/top-right-arrow.svg')}
                            loading="lazy"
                            width="16"
                            height="16"
                            alt=""
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Video Testimonial 2 */}
                {finalVideoTestimonials[1] && (
                  <div>
                    <div className="bg-surface-900 rounded-xl overflow-hidden">
                      <div className="aspect-video w-full">
                        <iframe
                          src={finalVideoTestimonials[1].videoUrl}
                          title={finalVideoTestimonials[1].videoTitle || 'Video testimonial'}
                          allow="fullscreen"
                          loading="lazy"
                          className="w-full h-full border-0"
                        />
                      </div>
                      <div className="px-5 py-4 flex flex-col gap-1">
                        <span className="font-bold text-white">
                          {finalVideoTestimonials[1].name}
                        </span>
                        <span className="text-white/80">{finalVideoTestimonials[1].role}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* CTA Button (full width) */}
              <div className="md:col-span-2 flex justify-center pt-6">
                <Button variant="primary" size="lg" href={finalCtaHref}>
                  {finalCtaText}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
