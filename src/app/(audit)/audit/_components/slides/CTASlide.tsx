import { asset } from '@/lib/assets';
import { SlideShell } from './SlideShell';

interface CTASlideProps {
  companyName: string;
  totalSlides: number;
}

export function CTASlide({ companyName, totalSlides }: CTASlideProps) {
  return (
    <SlideShell index={14} totalSlides={totalSlides} variant="darker">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        {/* Decorative line */}
        <div className="w-12 h-px bg-primary-600 mb-8" />

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-medium text-white mb-4 max-w-lg">
          Ready to Fix Your AI Visibility?
        </h2>

        <p className="text-surface-400 text-base mb-8 max-w-md leading-relaxed">
          Our AEO experts will build a custom strategy to get {companyName} showing up
          in AI conversations that matter for your business.
        </p>

        {/* CTA Button — uses Cal.com trigger via data attribute */}
        <button
          data-cal-trigger
          className="rounded-lg bg-primary-600 px-8 py-4 text-base font-medium text-white transition-colors hover:bg-primary-500 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2"
        >
          Book a Free Strategy Call
        </button>

        <p className="text-2xs text-surface-500 mt-4">
          30 minutes. No commitment. We&apos;ll walk through your audit together.
        </p>

        {/* LoudFace branding */}
        <div className="mt-auto pt-12">
          <img
            src={asset('/images/loudface-inversed.svg')}
            alt="LoudFace"
            width={100}
            height={24}
            className="h-5 w-auto opacity-30 mx-auto"
          />
          <p className="text-2xs text-surface-600 mt-2">
            AI Visibility Audit by LoudFace
          </p>
        </div>
      </div>
    </SlideShell>
  );
}
