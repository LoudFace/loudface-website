import { useState, useRef } from 'react';

interface CaseStudy {
  stat: string;
  statLabel: string;
  title: string;
  description: string;
  testimonial?: string;
  author?: string;
  authorRole?: string;
}

interface CaseStudyCarouselProps {
  caseStudies: CaseStudy[];
}

export default function CaseStudyCarousel({ caseStudies }: CaseStudyCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative">
      {/* Navigation Buttons */}
      <div className="absolute -top-16 right-0 flex gap-2 z-10">
        <button
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors ${
            canScrollLeft
              ? 'border-gray-300 hover:border-[#5046E5] hover:text-[#5046E5]'
              : 'border-gray-200 text-gray-300 cursor-not-allowed'
          }`}
          aria-label="Scroll left"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors ${
            canScrollRight
              ? 'border-gray-300 hover:border-[#5046E5] hover:text-[#5046E5]'
              : 'border-gray-200 text-gray-300 cursor-not-allowed'
          }`}
          aria-label="Scroll right"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Carousel */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {caseStudies.map((study, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-[350px] md:w-[400px] bg-white rounded-2xl border border-gray-200 p-6 md:p-8 hover:shadow-lg transition-shadow snap-start"
          >
            {/* Stat */}
            <div className="mb-4">
              <span className="text-3xl md:text-4xl font-bold text-[#5046E5]">{study.stat}</span>
              <p className="text-sm text-gray-600 mt-1">{study.statLabel}</p>
            </div>

            {/* Title & Description */}
            <h3 className="text-xl font-semibold mb-3">{study.title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">{study.description}</p>

            {/* Testimonial */}
            {study.testimonial && (
              <blockquote className="border-l-2 border-[#5046E5] pl-4 mb-6">
                <p className="text-gray-700 italic text-sm line-clamp-3">"{study.testimonial}"</p>
                {study.author && (
                  <footer className="mt-3">
                    <p className="font-semibold text-sm">{study.author}</p>
                    {study.authorRole && <p className="text-gray-500 text-xs">{study.authorRole}</p>}
                  </footer>
                )}
              </blockquote>
            )}

            {/* CTA */}
            <a
              href="#"
              className="inline-flex items-center text-sm font-semibold text-[#5046E5] hover:text-[#3d38b8] transition-colors"
            >
              Read case study
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
