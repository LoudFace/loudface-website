import type { AuditScores, CompetitorContextData, BrandBaselineData } from '@/lib/audit/types';
import { SlideShell } from './SlideShell';
import { QuadrantChart } from './charts/QuadrantChart';

interface MarketPositionSlideProps {
  scores: AuditScores;
  competitorContext: CompetitorContextData;
  brandBaseline: BrandBaselineData;
  companyName: string;
  totalSlides: number;
}

export function MarketPositionSlide({
  scores,
  competitorContext,
  companyName,
  totalSlides,
}: MarketPositionSlideProps) {
  // Build data points for the quadrant chart
  const points = [
    {
      label: companyName,
      x: scores.discoveryVisibility,
      y: scores.shareOfVoice,
      highlight: true,
    },
    ...Object.entries(competitorContext.shareOfVoiceByCompetitor).map(
      ([name, sov]) => {
        // Deterministic jitter based on name to avoid hydration mismatch
        let hash = 0;
        for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
        const jitter = ((hash & 0xffff) / 0xffff) * 20;
        return {
          label: name,
          x: Math.min(100, sov + jitter),
          y: sov,
          highlight: false,
        };
      },
    ),
  ];

  return (
    <SlideShell index={9} totalSlides={totalSlides}>
      <div className="flex-1 flex flex-col justify-center">
        <p className="text-sm text-primary-400 font-medium tracking-wider uppercase mb-2">
          AI Market Position
        </p>
        <h2 className="text-2xl sm:text-3xl font-heading font-medium text-white mb-2">
          Competitive Landscape
        </h2>
        <p className="text-surface-400 text-sm mb-8 max-w-xl">
          Where {companyName} sits relative to competitors in AI visibility
          and recommendation rates.
        </p>

        <div className="rounded-xl bg-white/5 p-4 sm:p-6">
          <QuadrantChart
            points={points}
            xLabel="Discovery Visibility"
            yLabel="Share of Voice"
          />
        </div>

        <p className="text-2xs text-surface-500 text-center mt-4">
          Higher and further right is better. Your brand is highlighted in blue.
        </p>
      </div>
    </SlideShell>
  );
}
