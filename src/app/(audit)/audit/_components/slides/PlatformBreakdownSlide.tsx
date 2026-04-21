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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {platforms.map(([platform, score]) => {
            const info = PLATFORM_INFO[platform];
            const sentimentInfo = SENTIMENT_LABELS[score.sentiment];
            const topCited = score.topCitedDomains ?? [];

            return (
              <div key={platform} className="rounded-xl bg-white/5 p-4 sm:p-5">
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-surface-800 flex items-center justify-center text-sm text-surface-400 font-mono mb-2">
                      {info.icon}
                    </div>
                    <RadialProgress value={score.mentionRate} size={72} strokeWidth={5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white mb-1">{info.name}</p>
                    <p className="text-2xs text-surface-500 mb-2">
                      Cites: <span className="text-surface-300">{score.citationRate}%</span>
                      <span className="mx-1.5 text-surface-700">•</span>
                      <span className={sentimentInfo.color}>{sentimentInfo.text}</span>
                    </p>
                    {score.insight && (
                      <p className="text-2xs text-surface-300 leading-relaxed">
                        {score.insight}
                      </p>
                    )}
                  </div>
                </div>

                {topCited.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-white/5">
                    <p className="text-2xs text-surface-500 mb-1.5">Top sources cited</p>
                    <ul className="space-y-1">
                      {topCited.slice(0, 3).map((d) => (
                        <li key={d.domain} className="flex items-center justify-between text-2xs">
                          <span className={d.isOwn ? 'text-success' : 'text-surface-300'}>
                            {d.isOwn && <span className="mr-1">◆</span>}
                            {d.domain}
                          </span>
                          <span className="text-surface-500 font-mono">×{d.count}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </SlideShell>
  );
}
