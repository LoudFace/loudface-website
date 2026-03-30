import type { PlatformBreakdown, AIPlatform } from '@/lib/audit/types';
import { SlideShell } from './SlideShell';
import { RadialProgress } from './charts/RadialProgress';

interface PlatformBreakdownSlideProps {
  data: PlatformBreakdown;
  totalSlides: number;
}

const PLATFORM_INFO: Record<AIPlatform, { name: string; icon: string }> = {
  chatgpt: { name: 'ChatGPT', icon: 'G' },
  claude: { name: 'Claude', icon: 'C' },
  gemini: { name: 'Gemini', icon: 'Ge' },
  perplexity: { name: 'Perplexity', icon: 'P' },
};

const SENTIMENT_LABELS = {
  positive: { text: 'Positive', color: 'text-success' },
  neutral: { text: 'Neutral', color: 'text-surface-400' },
  negative: { text: 'Negative', color: 'text-error' },
};

export function PlatformBreakdownSlide({ data, totalSlides }: PlatformBreakdownSlideProps) {
  const platforms = Object.entries(data) as [AIPlatform, typeof data.chatgpt][];

  return (
    <SlideShell index={10} totalSlides={totalSlides}>
      <div className="flex-1 flex flex-col justify-center">
        <p className="text-sm text-primary-400 font-medium tracking-wider uppercase mb-2">
          Platform Breakdown
        </p>
        <h2 className="text-2xl sm:text-3xl font-heading font-medium text-white mb-2">
          Per-Platform Performance
        </h2>
        <p className="text-surface-400 text-sm mb-8 max-w-xl">
          How each AI platform perceives your brand across all audit queries.
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {platforms.map(([platform, score]) => {
            const info = PLATFORM_INFO[platform];
            const sentimentInfo = SENTIMENT_LABELS[score.sentiment];

            return (
              <div key={platform} className="rounded-xl bg-white/5 p-4 sm:p-5 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-lg bg-surface-800 flex items-center justify-center text-sm text-surface-400 font-mono mb-4">
                  {info.icon}
                </div>
                <p className="text-sm font-medium text-white mb-3">{info.name}</p>
                <RadialProgress value={score.mentionRate} size={90} strokeWidth={6} />
                <div className="mt-3 space-y-1">
                  <p className="text-2xs text-surface-500">
                    Citation rate: <span className="text-surface-300">{score.citationRate}%</span>
                  </p>
                  <p className={`text-2xs ${sentimentInfo.color}`}>
                    {sentimentInfo.text} sentiment
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SlideShell>
  );
}
