import type { CompetitorContextData } from '@/lib/audit/types';
import { getTrafficLight } from '@/lib/audit/scoring';
import { SlideShell } from './SlideShell';
import { TrafficLight } from './charts/TrafficLight';
import { EntityConfidenceBanner, type EntityConfidenceSignal } from '../EntityConfidenceBanner';

interface CompetitorContextSlideProps {
  data: CompetitorContextData;
  companyName: string;
  totalSlides: number;
  entityConfidence?: EntityConfidenceSignal;
}

export function CompetitorContextSlide({ data, companyName, totalSlides, entityConfidence }: CompetitorContextSlideProps) {
  return (
    <SlideShell index={6} totalSlides={totalSlides}>
      <div className="flex-1 flex flex-col justify-center">
        <p className="text-sm text-primary-400 font-medium tracking-wider uppercase mb-2">
          Phase 02 &mdash; Competitor Context
        </p>
        <h2 className="text-2xl sm:text-3xl font-heading font-medium text-white mb-2">
          Alternative-To Searches
        </h2>
        <p className="text-surface-400 text-sm mb-8 max-w-xl">
          When users search for alternatives to your competitors, does {companyName} get recommended?
        </p>

        {entityConfidence?.low && <EntityConfidenceBanner signal={entityConfidence} variant="compact" />}

        {/* Recommendation rate */}
        <div className="flex items-center gap-4 mb-8 rounded-xl bg-white/5 p-4">
          <div className="text-4xl font-heading font-medium text-white">
            {data.competitiveRecommendationRate}%
          </div>
          <div>
            <p className="text-white font-medium text-sm">Competitive Recommendation Rate</p>
            <TrafficLight status={getTrafficLight(data.competitiveRecommendationRate)} size="sm" />
          </div>
        </div>

        {/* Competitors detected */}
        <h3 className="text-sm font-medium text-white mb-3">
          Competitors Tracked ({data.competitors.length})
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {data.competitors.map((comp) => (
            <div key={comp.domain} className="flex items-center gap-3 rounded-lg bg-white/5 p-3">
              <div className="w-8 h-8 rounded bg-surface-800 flex items-center justify-center text-2xs text-surface-400 font-mono shrink-0">
                {comp.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-sm text-white truncate">{comp.name}</p>
                <p className="text-2xs text-surface-500">{comp.domain}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SlideShell>
  );
}
