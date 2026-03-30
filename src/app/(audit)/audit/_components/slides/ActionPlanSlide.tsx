import type { ActionItem } from '@/lib/audit/types';
import { SlideShell } from './SlideShell';

interface ActionPlanSlideProps {
  actionItems: ActionItem[];
  totalSlides: number;
}

const PRIORITY_STYLES = {
  high: { badge: 'bg-error/10 text-error', icon: '!' },
  medium: { badge: 'bg-warning/10 text-warning', icon: '~' },
  low: { badge: 'bg-info/10 text-info', icon: '-' },
};

export function ActionPlanSlide({ actionItems, totalSlides }: ActionPlanSlideProps) {
  return (
    <SlideShell index={13} totalSlides={totalSlides}>
      <div className="flex-1 flex flex-col justify-center">
        <p className="text-sm text-primary-400 font-medium tracking-wider uppercase mb-2">
          Action Plan
        </p>
        <h2 className="text-2xl sm:text-3xl font-heading font-medium text-white mb-2">
          Recommended Next Steps
        </h2>
        <p className="text-surface-400 text-sm mb-8 max-w-xl">
          Prioritized recommendations to close gaps and improve your AI visibility.
        </p>

        <div className="space-y-4">
          {actionItems.map((item, i) => {
            const style = PRIORITY_STYLES[item.priority];
            return (
              <div key={i} className="flex gap-4 rounded-xl bg-white/5 p-4 sm:p-5">
                <div className="shrink-0">
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-sm font-mono font-medium ${style.badge}`}>
                    {i + 1}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-medium text-white">{item.title}</h3>
                    <span className={`text-2xs px-1.5 py-0.5 rounded ${style.badge}`}>
                      {item.priority}
                    </span>
                  </div>
                  <p className="text-2xs sm:text-sm text-surface-400 leading-relaxed">
                    {item.description}
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
