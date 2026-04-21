import type { CategoryVisibilityData } from '@/lib/audit/types';
import { getTrafficLight } from '@/lib/audit/scoring';
import { SlideShell } from './SlideShell';
import { QueryMatrix } from './charts/QueryMatrix';
import { TrafficLight } from './charts/TrafficLight';
import { EntityConfidenceBanner, type EntityConfidenceSignal } from '../EntityConfidenceBanner';

interface CategoryVisibilitySlideProps {
  data: CategoryVisibilityData;
  companyName: string;
  totalSlides: number;
  entityConfidence?: EntityConfidenceSignal;
}

export function CategoryVisibilitySlide({ data, companyName, totalSlides, entityConfidence }: CategoryVisibilitySlideProps) {
  return (
    <SlideShell index={8} totalSlides={totalSlides}>
      <div className="flex-1 flex flex-col">
        <div className="mb-6 sm:mb-8">
          <p className="text-sm text-primary-400 font-medium tracking-wider uppercase mb-2">
            Phase 03 &mdash; Category Visibility
          </p>
          <h2 className="text-2xl sm:text-3xl font-heading font-medium text-white mb-2">
            General Solution Discovery
          </h2>
          <p className="text-surface-400 text-sm max-w-xl">
            When users search for {data.inferredCategory} solutions, does {companyName} appear?
          </p>
        </div>

        {entityConfidence?.low && <EntityConfidenceBanner signal={entityConfidence} variant="compact" />}

        {/* Discovery rate */}
        <div className="flex items-center gap-4 mb-6 rounded-xl bg-white/5 p-4">
          <div className="text-4xl font-heading font-medium text-white">
            {data.categoryDiscoveryRate}%
          </div>
          <div>
            <p className="text-white font-medium text-sm">Category Discovery Rate</p>
            <TrafficLight status={getTrafficLight(data.categoryDiscoveryRate)} size="sm" />
          </div>
        </div>

        {/* Query matrix */}
        <div className="flex-1 overflow-y-auto">
          <QueryMatrix
            queries={data.queries.map((q) => ({
              prompt: q.prompt,
              results: q.results.map((r) => ({
                platform: r.platform,
                mentioned: r.mentioned,
              })),
            }))}
          />
        </div>
      </div>
    </SlideShell>
  );
}
