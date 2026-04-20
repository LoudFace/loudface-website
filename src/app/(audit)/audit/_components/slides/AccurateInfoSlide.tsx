import type { BrandBaselineData } from '@/lib/audit/types';
import { SlideShell } from './SlideShell';

interface AccurateInfoSlideProps {
  data: BrandBaselineData;
  totalSlides: number;
}

export function AccurateInfoSlide({ data, totalSlides }: AccurateInfoSlideProps) {
  const hasAccurateInfo = data.accurateInfo.length > 0;

  return (
    <SlideShell index={4} totalSlides={totalSlides}>
      <div className="flex-1 flex flex-col justify-center">
        <p className="text-sm text-primary-400 font-medium tracking-wider uppercase mb-2">
          What AI Gets Right
        </p>
        <h2 className="text-2xl sm:text-3xl font-heading font-medium text-white mb-2">
          Platform Coverage Accuracy
        </h2>
        <p className="text-surface-400 text-sm mb-8 max-w-xl">
          Analysis of AI responses reveals these areas where your brand is
          well represented.
        </p>

        {hasAccurateInfo ? (
          <div className="space-y-4">
            {data.accurateInfo.map((info, i) => (
              <div key={i} className="flex gap-4 rounded-xl bg-white/5 p-4 sm:p-5">
                <div className="shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm text-surface-300 leading-relaxed">{info}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-white/5 p-6 text-center">
            <svg className="w-10 h-10 text-surface-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p className="text-surface-400 text-sm">
              We couldn&apos;t extract specific factual claims about your brand
              from AI responses. See the Gaps &amp; Inaccuracies slide for
              details on where AI falls short.
            </p>
          </div>
        )}
      </div>
    </SlideShell>
  );
}
