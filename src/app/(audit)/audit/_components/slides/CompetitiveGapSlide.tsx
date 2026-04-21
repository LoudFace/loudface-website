import type { CompetitorContextData } from '@/lib/audit/types';
import { SlideShell } from './SlideShell';
import { HorizontalBar } from './charts/HorizontalBar';
import { EntityConfidenceBanner, type EntityConfidenceSignal } from '../EntityConfidenceBanner';

interface CompetitiveGapSlideProps {
  data: CompetitorContextData;
  companyName: string;
  brandShareOfVoice: number;
  totalSlides: number;
  entityConfidence?: EntityConfidenceSignal;
}

export function CompetitiveGapSlide({
  data,
  companyName,
  brandShareOfVoice,
  totalSlides,
  entityConfidence,
}: CompetitiveGapSlideProps) {
  // Build bar items: brand + competitors sorted by share of voice
  const barItems = [
    { label: companyName, value: brandShareOfVoice, highlight: true },
    ...Object.entries(data.shareOfVoiceByCompetitor)
      .sort(([, a], [, b]) => b - a)
      .map(([name, value]) => ({ label: name, value, highlight: false })),
  ].sort((a, b) => b.value - a.value);

  return (
    <SlideShell index={7} totalSlides={totalSlides}>
      <div className="flex-1 flex flex-col justify-center">
        <p className="text-sm text-primary-400 font-medium tracking-wider uppercase mb-2">
          Competitive Gap Analysis
        </p>
        <h2 className="text-2xl sm:text-3xl font-heading font-medium text-white mb-2">
          Share of Voice
        </h2>
        <p className="text-surface-400 text-sm mb-8 max-w-xl">
          How often AI platforms recommend each brand when users actively seek alternatives.
          {companyName} holds {brandShareOfVoice}% share of voice.
        </p>

        {entityConfidence?.low && <EntityConfidenceBanner signal={entityConfidence} variant="compact" />}

        <div className="rounded-xl bg-white/5 p-5 sm:p-6">
          <HorizontalBar items={barItems} />
        </div>

        {/* Key insight */}
        {barItems.length > 1 && barItems[0].label !== companyName && (
          <div className="mt-6 rounded-lg bg-primary-600/10 border border-primary-600/20 p-4">
            <p className="text-sm text-surface-300">
              <span className="text-white font-medium">{barItems[0].label}</span> leads
              with {barItems[0].value}% share of voice.
              {brandShareOfVoice < barItems[0].value && (
                <> {companyName} needs to close a {barItems[0].value - brandShareOfVoice}pp gap to compete.</>
              )}
            </p>
          </div>
        )}
      </div>
    </SlideShell>
  );
}
