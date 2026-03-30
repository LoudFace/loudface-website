import type { AuditScores } from '@/lib/audit/types';
import { getTrafficLight } from '@/lib/audit/scoring';
import { SlideShell } from './SlideShell';
import { TrafficLight } from './charts/TrafficLight';

interface ScorecardSlideProps {
  scores: AuditScores;
  companyName: string;
  totalSlides: number;
}

const GRADE_COLORS: Record<string, string> = {
  A: 'text-success',
  B: 'text-success',
  C: 'text-warning',
  D: 'text-error',
  F: 'text-error',
};

export function ScorecardSlide({ scores, companyName, totalSlides }: ScorecardSlideProps) {
  return (
    <SlideShell index={1} totalSlides={totalSlides}>
      <div className="flex-1 flex flex-col justify-center">
        <p className="text-sm text-primary-400 font-medium tracking-wider uppercase mb-2">
          Executive Scorecard
        </p>
        <h2 className="text-2xl sm:text-3xl font-heading font-medium text-white mb-2">
          AI Market Position Snapshot
        </h2>
        <p className="text-surface-400 mb-8 sm:mb-10 text-sm max-w-xl">
          {companyName} currently holds {scores.discoveryVisibility}% discovery visibility
          with {scores.shareOfVoice}% share of voice. Competitive standing
          is {scores.competitiveStanding} of {scores.competitorsTracked} tracked brands.
        </p>

        {/* Overall grade */}
        <div className="flex items-center gap-4 mb-8">
          <div className={`text-6xl sm:text-7xl font-heading font-medium ${GRADE_COLORS[scores.overallGrade]}`}>
            {scores.overallGrade}
          </div>
          <div>
            <p className="text-white font-medium">Overall Grade</p>
            <p className="text-surface-500 text-sm">Based on visibility, share of voice &amp; platform coverage</p>
          </div>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Discovery Visibility"
            value={`${scores.discoveryVisibility}%`}
            status={getTrafficLight(scores.discoveryVisibility)}
          />
          <MetricCard
            label="Share of Voice"
            value={`${scores.shareOfVoice}%`}
            status={getTrafficLight(scores.shareOfVoice)}
          />
          <MetricCard
            label="Competitive Standing"
            value={`#${scores.competitiveStanding}`}
            status={getTrafficLight(
              scores.competitorsTracked > 0
                ? 100 - (scores.competitiveStanding / scores.competitorsTracked) * 100
                : 0,
            )}
          />
          <MetricCard
            label="Platform Coverage"
            value={`${scores.platformCoverage}/4`}
            status={getTrafficLight(scores.platformCoverage * 25)}
          />
        </div>
      </div>
    </SlideShell>
  );
}

function MetricCard({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status: ReturnType<typeof getTrafficLight>;
}) {
  return (
    <div className="rounded-xl bg-white/5 p-4 sm:p-5">
      <p className="text-2xs text-surface-500 mb-2">{label}</p>
      <p className="text-2xl sm:text-3xl font-heading font-medium text-white mb-2">{value}</p>
      <TrafficLight status={status} size="sm" />
    </div>
  );
}
