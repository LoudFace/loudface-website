import type { AuditScores, BrandBaselineData, CompetitorContextData, CategoryVisibilityData } from '@/lib/audit/types';
import { getTrafficLight } from '@/lib/audit/scoring';
import { SlideShell } from './SlideShell';
import { RadialProgress } from './charts/RadialProgress';
import { TrafficLight } from './charts/TrafficLight';

interface VisibilitySnapshotSlideProps {
  scores: AuditScores;
  brandBaseline: BrandBaselineData;
  competitorContext: CompetitorContextData;
  categoryVisibility: CategoryVisibilityData;
  totalSlides: number;
}

export function VisibilitySnapshotSlide({
  scores,
  brandBaseline,
  competitorContext,
  categoryVisibility,
  totalSlides,
}: VisibilitySnapshotSlideProps) {
  const metrics = [
    {
      label: 'Brand Recognition',
      value: brandBaseline.brandRecognitionScore,
      description: 'How well AI knows your brand',
    },
    {
      label: 'Competitive Rate',
      value: competitorContext.competitiveRecommendationRate,
      description: 'How often AI recommends you vs competitors',
    },
    {
      label: 'Category Discovery',
      value: categoryVisibility.categoryDiscoveryRate,
      description: 'How visible you are in unbranded searches',
    },
  ];

  return (
    <SlideShell index={11} totalSlides={totalSlides}>
      <div className="flex-1 flex flex-col justify-center">
        <p className="text-sm text-primary-400 font-medium tracking-wider uppercase mb-2">
          Visibility Snapshot
        </p>
        <h2 className="text-2xl sm:text-3xl font-heading font-medium text-white mb-2">
          Combined Metrics
        </h2>
        <p className="text-surface-400 text-sm mb-8 max-w-xl">
          Your performance across all three audit phases at a glance.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-xl bg-white/5 p-5 flex flex-col items-center text-center">
              <RadialProgress value={metric.value} size={100} strokeWidth={7} />
              <h3 className="text-sm font-medium text-white mt-4 mb-1">{metric.label}</h3>
              <p className="text-2xs text-surface-500 mb-2">{metric.description}</p>
              <TrafficLight status={getTrafficLight(metric.value)} size="sm" />
            </div>
          ))}
        </div>

        {/* Overall */}
        <div className="mt-6 rounded-xl bg-white/5 p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">Overall AI Visibility</p>
            <p className="text-2xs text-surface-500">
              Weighted average across all phases
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-heading font-medium text-white">
              {scores.discoveryVisibility}%
            </span>
            <TrafficLight status={getTrafficLight(scores.discoveryVisibility)} />
          </div>
        </div>
      </div>
    </SlideShell>
  );
}
