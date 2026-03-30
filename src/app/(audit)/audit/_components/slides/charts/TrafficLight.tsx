import type { TrafficLight as TLType } from '@/lib/audit/types';

interface TrafficLightProps {
  status: TLType;
  size?: 'sm' | 'md';
}

const COLORS: Record<TLType, string> = {
  green: 'bg-success',
  amber: 'bg-warning',
  red: 'bg-error',
};

const LABELS: Record<TLType, string> = {
  green: 'Strong',
  amber: 'Needs Work',
  red: 'Critical',
};

export function TrafficLight({ status, size = 'md' }: TrafficLightProps) {
  const dotSize = size === 'sm' ? 'w-2 h-2' : 'w-3 h-3';

  return (
    <div className="inline-flex items-center gap-2">
      <span className={`${dotSize} rounded-full ${COLORS[status]}`} />
      <span className={`text-surface-400 ${size === 'sm' ? 'text-2xs' : 'text-sm'}`}>
        {LABELS[status]}
      </span>
    </div>
  );
}
