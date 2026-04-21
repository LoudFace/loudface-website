import type { BrandBaselineData } from '@/lib/audit/types';
import { getTrafficLight } from '@/lib/audit/scoring';
import { SlideShell } from './SlideShell';
import { QueryMatrix } from './charts/QueryMatrix';
import { TrafficLight } from './charts/TrafficLight';
import { EntityConfidenceBanner, type EntityConfidenceSignal } from '../EntityConfidenceBanner';

interface BrandBaselineSlideProps {
  data: BrandBaselineData;
  companyName: string;
  totalSlides: number;
  entityConfidence?: EntityConfidenceSignal;
}

export function BrandBaselineSlide({ data, companyName, totalSlides, entityConfidence }: BrandBaselineSlideProps) {
  return (
    <SlideShell index={3} totalSlides={totalSlides}>
      <div className="flex-1 flex flex-col">
        <div className="mb-6 sm:mb-8">
          <p className="text-sm text-primary-400 font-medium tracking-wider uppercase mb-2">
            Phase 01 &mdash; Brand Baseline
          </p>
          <h2 className="text-2xl sm:text-3xl font-heading font-medium text-white mb-2">
            Direct Brand Queries
          </h2>
          <p className="text-surface-400 text-sm max-w-xl">
            Based on 10 direct brand queries, here is how AI platforms currently
            perceive and represent {companyName}.
          </p>
        </div>

        {entityConfidence?.low && <EntityConfidenceBanner signal={entityConfidence} variant="compact" />}

        {/* Score badge */}
        <div className="flex items-center gap-4 mb-6 rounded-xl bg-white/5 p-4">
          <div className="text-4xl font-heading font-medium text-white">
            {data.brandRecognitionScore}%
          </div>
          <div>
            <p className="text-white font-medium text-sm">Brand Recognition Score</p>
            <TrafficLight status={getTrafficLight(data.brandRecognitionScore)} size="sm" />
          </div>
        </div>

        {/* Query × Platform matrix */}
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
