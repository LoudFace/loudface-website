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
  // Each entity has two measures across the same Phase 3 unbranded queries:
  //   x = Discovery Visibility (% of queries where this entity is mentioned)
  //   y = Share of Voice (this entity's slice of the total mention pool)
  // For competitors, shareOfVoiceByCompetitor[name] stores their mention rate
  // (despite the field name — see scoring.ts). We derive SoV the same way the
  // brand's SoV is derived: entity_rate / (all_entity_rates) * 100.
  const competitorRates = Object.entries(competitorContext.shareOfVoiceByCompetitor);
  const totalCompetitorRate = competitorRates.reduce((s, [, r]) => s + r, 0);
  const totalEntityRate = scores.discoveryVisibility + totalCompetitorRate;

  const points = [
    {
      label: companyName,
      x: scores.discoveryVisibility,
      y: scores.shareOfVoice,
      highlight: true,
    },
    ...competitorRates.map(([name, rate]) => ({
      label: name,
      x: rate,
      y: totalEntityRate > 0 ? Math.round((rate / totalEntityRate) * 100) : 0,
      highlight: false,
    })),
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
