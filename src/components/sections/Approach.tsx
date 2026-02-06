'use client';

import { getApproachContent, type ProcessStep, type Stat } from '@/lib/content-utils';
import { asset } from '@/lib/assets';
import { BulletLabel, CarouselNav } from '@/components/ui';
import { useCarousel } from '@/hooks/useCarousel';

interface ApproachProps {
  title?: string;
  highlightWord?: string;
  subtitle?: string;
  steps?: ProcessStep[];
  statsHeading?: string;
  stats?: Stat[];
}

export function Approach({
  title,
  highlightWord,
  subtitle,
  steps,
  statsHeading,
  stats,
}: ApproachProps) {
  const content = getApproachContent();

  const finalTitle = title ?? content.title;
  const finalHighlightWord = highlightWord ?? content.highlightWord;
  const finalSubtitle = subtitle ?? content.subtitle;
  const finalSteps = steps ?? content.steps;
  const finalStatsHeading = statsHeading ?? content.statsHeading;
  const finalStats = stats ?? content.stats;

  const { emblaRef, scrollPrev, scrollNext } = useCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
  });

  // Split title to highlight the specified word
  function formatTitle(text: string, highlight: string) {
    return text.split(new RegExp(`(${highlight})`, 'i'));
  }

  const titleParts = formatTitle(finalTitle, finalHighlightWord);

  return (
    <section className="bg-surface-800 text-surface-300 overflow-hidden">
      <div className="py-12 sm:py-16 md:py-24 lg:py-32">
        <div className="px-4 md:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            {/* Process Slider */}
            <div className="grid gap-8 xs:gap-16 max-w-full">
              {/* Header with nav */}
              <div className="flex justify-between items-end relative">
                <div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-white">
                    {titleParts.map((part, index) =>
                      part.toLowerCase() === finalHighlightWord.toLowerCase() ? (
                        <span key={index} className="text-surface-500">
                          {part}
                        </span>
                      ) : (
                        <span key={index}>{part}</span>
                      )
                    )}
                  </h2>
                  <div className="h-4" />
                  <p className="text-surface-400 text-lg">{finalSubtitle}</p>
                </div>
                <div className="hidden md:block">
                  <CarouselNav
                    variant="dark"
                    className="gap-3"
                    onPrevClick={scrollPrev}
                    onNextClick={scrollNext}
                  />
                </div>
              </div>

              {/* Embla Carousel */}
              <div className="embla w-full overflow-visible">
                <div className="embla__viewport overflow-hidden" ref={emblaRef}>
                  <div className="embla__container flex items-start gap-4 xs:gap-10 touch-pan-y">
                    {finalSteps.map((step, index) => (
                      <div
                        key={index}
                        className="embla__slide flex-[0_0_100%] xs:flex-[0_0_auto] min-w-0 max-w-full xs:max-w-[28.75rem]"
                      >
                        <div className="bg-white/5 hover:bg-white/[0.08] rounded-xl flex flex-col justify-between min-h-[17.5rem] p-6 max-w-[28.75rem] transition-colors">
                          <div className="mb-4">
                            <img
                              src={asset(step.icon)}
                              loading="lazy"
                              width="88"
                              height="88"
                              alt={step.iconAlt}
                              className="w-[88px] h-[88px]"
                            />
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-white">{step.title}</h3>
                            <div className="h-2" />
                            <p className="text-surface-400 text-sm leading-relaxed">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mobile nav buttons */}
              <div className="block md:hidden">
                <div className="flex justify-center items-end relative">
                  <CarouselNav
                    variant="dark"
                    className="gap-3"
                    onPrevClick={scrollPrev}
                    onNextClick={scrollNext}
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-16 md:h-24" />
            <div className="h-px bg-surface-700" />
            <div className="h-16 md:h-24" />

            {/* Stats Section */}
            <div>
              <BulletLabel as="h2" variant="dark">{finalStatsHeading}</BulletLabel>
              <div className="h-8" />

              <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                {finalStats.map((stat, index) => (
                  <div key={index} className="contents">
                    <div className="flex-1">
                      <h3 className="text-4xl md:text-5xl font-medium text-white">{stat.value}</h3>
                      <div className="h-2" />
                      <p className="text-base font-medium text-surface-300">{stat.label}</p>
                      <div className="h-4" />
                      <p className="text-sm text-surface-500 leading-relaxed">{stat.description}</p>
                    </div>
                    {index < finalStats.length - 1 && (
                      <div className="hidden lg:flex items-center py-7">
                        <div className="w-px h-full bg-surface-700" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
