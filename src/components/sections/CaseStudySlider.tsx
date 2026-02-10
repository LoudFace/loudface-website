'use client';

import Link from 'next/link';
import { getCaseStudySliderContent } from '@/lib/content-utils';
import { asset } from '@/lib/assets';
import { caseStudyThumbnail } from '@/lib/image-utils';
import { getContrastColors } from '@/lib/color-utils';
import { BulletLabel, Button, CarouselNav, SectionContainer } from '@/components/ui';
import { useCarousel } from '@/hooks/useCarousel';
import type { CaseStudy, Client, Industry, Testimonial } from '@/lib/types';

interface CaseStudySliderProps {
  title?: string;
  caseStudies: CaseStudy[];
  clients?: Map<string, Client>;
  industries?: Map<string, Industry>;
  testimonials?: Map<string, Testimonial>;
  ctaText?: string;
}

export function CaseStudySlider({
  title,
  caseStudies,
  clients = new Map(),
  testimonials = new Map(),
  ctaText,
}: CaseStudySliderProps) {
  const content = getCaseStudySliderContent();

  const finalTitle = title ?? content.title;
  const finalCtaText = ctaText ?? content.ctaText;

  const { emblaRef, scrollPrev, scrollNext } = useCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
  });

  function getClient(clientId: string | undefined): Client | undefined {
    if (!clientId) return undefined;
    return clients.get(clientId);
  }

  function getTestimonial(caseStudyId: string): Testimonial | undefined {
    for (const testimonial of testimonials.values()) {
      if (testimonial['case-study'] === caseStudyId) {
        return testimonial;
      }
    }
    return undefined;
  }

  // Only show case studies that have testimonials
  const filteredStudies = caseStudies.filter((study) => getTestimonial(study.id));

  // Arrow icon
  const arrowIcon = `<path d="M2.91854 1.85641H8.14011L1.06819 8.92834C1.01486 8.98166 0.972567 9.04496 0.94371 9.11463C0.914853 9.1843 0.9 9.25897 0.9 9.33437C0.9 9.40978 0.914853 9.48445 0.94371 9.55412C0.972567 9.62379 1.01486 9.68709 1.06818 9.74041C1.12151 9.79373 1.18481 9.83603 1.25448 9.86488C1.32414 9.89374 1.39881 9.90859 1.47422 9.90859C1.54963 9.90859 1.6243 9.89374 1.69396 9.86488C1.76363 9.83603 1.82693 9.79373 1.88025 9.74041L8.95193 2.66873V7.91349C8.95193 8.06562 9.01236 8.21153 9.11994 8.3191C9.22752 8.42668 9.37342 8.48711 9.52555 8.48711C9.67769 8.48711 9.82359 8.42668 9.93116 8.3191C10.0387 8.21153 10.0992 8.06562 10.0992 7.91349V1.31361C10.0997 1.30337 10.1 1.29311 10.1 1.28281C10.1 1.13052 10.0395 0.984466 9.93182 0.876779C9.82413 0.769092 9.67807 0.708594 9.52578 0.708594C9.51717 0.708594 9.50858 0.708787 9.50001 0.709172H2.91854C2.7664 0.709172 2.6205 0.769607 2.51292 0.877182C2.40535 0.984757 2.34491 1.13066 2.34491 1.28279C2.34491 1.43493 2.40535 1.58083 2.51292 1.6884C2.6205 1.79598 2.7664 1.85641 2.91854 1.85641Z" fill="currentColor" stroke-width="0.2"/>`;

  return (
    <SectionContainer className="overflow-hidden">
      <div className="grid gap-6 xs:gap-10 max-w-full">
        {/* Header with nav */}
        <div className="flex justify-between items-center">
          <BulletLabel as="h2">{finalTitle}</BulletLabel>
          <div className="hidden md:block">
            <CarouselNav
              variant="light"
              onPrevClick={scrollPrev}
              onNextClick={scrollNext}
            />
          </div>
        </div>

        {/* Embla Carousel */}
        <div className="embla w-full max-w-full overflow-hidden">
          {filteredStudies.length > 0 ? (
            <div className="embla__viewport overflow-hidden" ref={emblaRef}>
              <div className="embla__container flex items-start gap-4 md:gap-10 touch-pan-y">
                {filteredStudies.map((study) => {
                  const client = getClient(study.client);
                  const testimonial = getTestimonial(study.id);
                  const { textColor, overlayColor } = getContrastColors(study['client-color']);
                  const cardStyle = study['client-color']
                    ? {
                        backgroundColor: study['client-color'],
                        color: textColor,
                        '--card-overlay': overlayColor,
                      } as React.CSSProperties
                    : undefined;

                  return (
                    <div
                      key={study.id}
                      className="embla__slide flex-[0_0_100%] md:flex-[0_0_auto] min-w-0 max-w-full md:max-w-[46.25rem]"
                    >
                      <div
                        className="bg-surface-900 text-white max-w-[46.25rem] flex flex-col md:flex-row gap-6 rounded-lg p-6 relative transition-opacity duration-200 hover:opacity-85"
                        style={cardStyle}
                      >
                        <Link
                          href={`/case-studies/${study.slug}`}
                          className="absolute inset-0 z-10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:rounded-lg"
                          aria-label={`View ${study['project-title']} case study`}
                        />

                        {/* Thumbnail */}
                        <div className="flex-none w-full md:w-[280px] aspect-video md:aspect-auto max-h-[400px] rounded-md overflow-hidden">
                          <img
                            src={
                              caseStudyThumbnail(study['main-project-image-thumbnail']?.url)?.src ||
                              asset('/images/placeholder.webp')
                            }
                            srcSet={caseStudyThumbnail(study['main-project-image-thumbnail']?.url)?.srcset}
                            sizes="(min-width: 768px) 740px, 100vw"
                            alt={
                              study['main-project-image-thumbnail']?.alt ||
                              study['project-title']
                            }
                            width="400"
                            height="560"
                            loading="lazy"
                            className="w-full h-full object-cover object-left-top"
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 flex flex-col">
                          <div className="flex flex-col justify-between h-full gap-4">
                            {/* Title & Summary */}
                            <div>
                              <h3 className="text-xl font-medium">
                                {study['project-title']}
                              </h3>
                              <div className="h-2" />
                              <p className="text-sm opacity-90">
                                {study['paragraph-summary']}
                              </p>
                            </div>

                            {/* Stats & Testimonial */}
                            <div>
                              {study['result-1---number'] && (
                                <div className="flex items-center gap-2.5 mb-2">
                                  <div
                                    className="rounded-lg px-4 py-2"
                                    style={{
                                      backgroundColor:
                                        'var(--card-overlay, rgba(255, 255, 255, 0.1))',
                                    }}
                                  >
                                    <span className="text-lg font-medium">
                                      {study['result-1---number']}
                                    </span>
                                  </div>
                                  <div className="max-w-[150px]">
                                    <span className="text-sm font-medium">
                                      {study['result-1---title']}
                                    </span>
                                  </div>
                                </div>
                              )}

                              {testimonial && (
                                <>
                                  <div className="h-4" />
                                  <div className="rounded-lg p-4 bg-black/50">
                                    <div
                                      className="text-sm line-clamp-2"
                                      dangerouslySetInnerHTML={{
                                        __html: testimonial['testimonial-body'] || '',
                                      }}
                                    />
                                    <div className="h-3" />
                                    <div className="text-sm font-bold">{testimonial.name}</div>
                                    <div className="text-xs opacity-75">
                                      {testimonial.role}
                                    </div>
                                  </div>
                                </>
                              )}

                              <div className="h-4" />
                              <div
                                className="h-px"
                                style={{
                                  backgroundColor:
                                    'var(--card-overlay, rgba(255, 255, 255, 0.2))',
                                }}
                              />
                              <div className="h-4" />

                              {/* Footer */}
                              <div className="flex justify-end items-center">
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="font-medium">Read case study</span>
                                  <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 11 10"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    dangerouslySetInnerHTML={{ __html: arrowIcon }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-surface-500">
              <p>No case studies found.</p>
            </div>
          )}
        </div>

        {/* Mobile nav buttons */}
        <div className="block md:hidden">
          <div className="flex justify-center items-center">
            <CarouselNav
              variant="light"
              onPrevClick={scrollPrev}
              onNextClick={scrollNext}
            />
          </div>
        </div>
      </div>

      <div className="h-8 md:h-12" />

      {/* CTA Button */}
      <div className="text-center">
        <Button variant="primary" size="lg" calTrigger>
          {finalCtaText}
        </Button>
      </div>
    </SectionContainer>
  );
}
