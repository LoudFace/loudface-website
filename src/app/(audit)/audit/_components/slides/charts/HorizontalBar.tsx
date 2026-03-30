interface BarItem {
  label: string;
  value: number; // 0-100
  highlight?: boolean;
}

interface HorizontalBarProps {
  items: BarItem[];
  maxValue?: number;
}

export function HorizontalBar({ items, maxValue = 100 }: HorizontalBarProps) {
  return (
    <div className="space-y-3">
      {items.map((item) => {
        const width = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
        return (
          <div key={item.label}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className={item.highlight ? 'text-white font-medium' : 'text-surface-400'}>
                {item.label}
              </span>
              <span className={item.highlight ? 'text-primary-400 font-medium' : 'text-surface-500'}>
                {item.value}%
              </span>
            </div>
            <div className="h-2 bg-surface-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  item.highlight ? 'bg-primary-500' : 'bg-surface-600'
                }`}
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
