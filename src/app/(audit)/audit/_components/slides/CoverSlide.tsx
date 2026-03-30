import { asset } from '@/lib/assets';
import { SlideShell } from './SlideShell';

interface CoverSlideProps {
  companyName: string;
  auditDate: string;
  totalSlides: number;
}

export function CoverSlide({ companyName, auditDate, totalSlides }: CoverSlideProps) {
  const formattedDate = new Date(auditDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <SlideShell index={0} totalSlides={totalSlides} variant="darker">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        {/* LoudFace logo */}
        <img
          src={asset('/images/loudface-inversed.svg')}
          alt="LoudFace"
          width={120}
          height={28}
          className="h-6 w-auto opacity-40 mb-12"
        />

        {/* Decorative line */}
        <div className="w-12 h-px bg-primary-600 mb-8" />

        <p className="text-sm text-primary-400 font-medium tracking-wider uppercase mb-4">
          AI Visibility Audit
        </p>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-medium text-white mb-6 max-w-2xl">
          {companyName}
        </h1>

        <p className="text-surface-500 text-sm">
          {formattedDate}
        </p>

        {/* Scroll hint */}
        <div className="mt-auto pt-12 animate-bounce">
          <svg className="w-6 h-6 text-surface-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </SlideShell>
  );
}
