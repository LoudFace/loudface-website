import type { BrandBaselineData } from '@/lib/audit/types';
import { SlideShell } from './SlideShell';

interface GapsSlideProps {
  data: BrandBaselineData;
  totalSlides: number;
}

export function GapsSlide({ data, totalSlides }: GapsSlideProps) {
  const hasIssues = data.inaccuracies.length > 0 || data.gaps.length > 0;

  return (
    <SlideShell index={5} totalSlides={totalSlides}>
      <div className="flex-1 flex flex-col justify-center">
        <p className="text-sm text-primary-400 font-medium tracking-wider uppercase mb-2">
          Product Limitations Identified
        </p>
        <h2 className="text-2xl sm:text-3xl font-heading font-medium text-white mb-2">
          What AI Gets Wrong
        </h2>
        <p className="text-surface-400 text-sm mb-8 max-w-xl">
          Analysis of AI responses reveals these areas where your brand
          representation needs attention.
        </p>

        {hasIssues ? (
          <div className="space-y-6">
            {/* Gaps */}
            {data.gaps.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                  </svg>
                  Knowledge Gaps
                </h3>
                <div className="space-y-3">
                  {data.gaps.map((gap, i) => (
                    <div key={i} className="flex gap-3 rounded-xl bg-warning/5 border border-warning/10 p-4">
                      <p className="text-sm text-surface-300">{gap}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inaccuracies */}
            {data.inaccuracies.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Potential Inaccuracies
                </h3>
                <div className="space-y-3">
                  {data.inaccuracies.map((item, i) => (
                    <div key={i} className="flex gap-3 rounded-xl bg-error/5 border border-error/10 p-4">
                      <p className="text-sm text-surface-300">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl bg-success/5 border border-success/10 p-6 text-center">
            <svg className="w-10 h-10 text-success mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-surface-300 text-sm">
              No significant inaccuracies or gaps were detected in AI responses.
            </p>
          </div>
        )}
      </div>
    </SlideShell>
  );
}
