import { asset } from '@/lib/assets';
import { SlideShell } from './SlideShell';
import { EntityConfidenceBanner, type EntityConfidenceSignal } from '../EntityConfidenceBanner';
import { PartialDataBanner } from '../PartialDataBanner';

interface CoverSlideProps {
  companyName: string;
  auditDate: string;
  totalSlides: number;
  entityConfidence?: EntityConfidenceSignal;
  partialDataReason?: string;
}

export function CoverSlide({ companyName, auditDate, totalSlides, entityConfidence, partialDataReason }: CoverSlideProps) {
  const formattedDate = new Date(auditDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <SlideShell index={0} totalSlides={totalSlides} variant="electric">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        {/* LoudFace logo */}
        <img
          src={asset('/images/loudface-inversed.svg')}
          alt="LoudFace"
          width={120}
          height={28}
          className="h-6 w-auto opacity-40 mb-12"
        />

        {/* Decorative line — primary-300 (not primary-600): on the electric
            stage the ground itself is primary-500/600/700, so a primary-600
            line would disappear into it. Line/accent = primary-300 per the
            v3 palette rules. */}
        <div className="w-12 h-px bg-primary-300 mb-8" />

        <p className="text-sm text-primary-100 font-medium tracking-wider uppercase mb-4">
          AI Visibility Audit
        </p>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-medium text-white mb-6 max-w-2xl">
          {companyName}
        </h1>

        <p className="text-white/70 text-sm">
          {formattedDate}
        </p>

        {(entityConfidence?.low || partialDataReason) && (
          <div className="mt-8 w-full max-w-xl text-left space-y-3">
            {entityConfidence?.low && <EntityConfidenceBanner signal={entityConfidence} />}
            {partialDataReason && <PartialDataBanner reason={partialDataReason} />}
          </div>
        )}

        {/* Scroll hint */}
        <div className="mt-auto pt-12 animate-bounce">
          <svg className="w-6 h-6 text-white/60 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </SlideShell>
  );
}
