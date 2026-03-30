interface DataPoint {
  label: string;
  x: number; // 0-100
  y: number; // 0-100
  highlight?: boolean;
}

interface QuadrantChartProps {
  points: DataPoint[];
  xLabel: string;
  yLabel: string;
}

export function QuadrantChart({ points, xLabel, yLabel }: QuadrantChartProps) {
  const padding = 40;
  const size = 300;
  const inner = size - padding * 2;

  return (
    <div className="flex justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="max-w-full">
        {/* Grid lines */}
        <line x1={padding} y1={size / 2} x2={size - padding} y2={size / 2} stroke="var(--color-surface-700)" strokeWidth={1} strokeDasharray="4 4" />
        <line x1={size / 2} y1={padding} x2={size / 2} y2={size - padding} stroke="var(--color-surface-700)" strokeWidth={1} strokeDasharray="4 4" />

        {/* Axes */}
        <line x1={padding} y1={size - padding} x2={size - padding} y2={size - padding} stroke="var(--color-surface-600)" strokeWidth={1} />
        <line x1={padding} y1={padding} x2={padding} y2={size - padding} stroke="var(--color-surface-600)" strokeWidth={1} />

        {/* Axis labels */}
        <text x={size / 2} y={size - 8} textAnchor="middle" className="fill-surface-500 text-2xs">{xLabel}</text>
        <text x={12} y={size / 2} textAnchor="middle" transform={`rotate(-90, 12, ${size / 2})`} className="fill-surface-500 text-2xs">{yLabel}</text>

        {/* Data points */}
        {points.map((point, i) => {
          const cx = padding + (point.x / 100) * inner;
          const cy = size - padding - (point.y / 100) * inner;

          return (
            <g key={i}>
              {point.highlight && (
                <circle cx={cx} cy={cy} r={16} fill="var(--color-primary-600)" opacity={0.15} />
              )}
              <circle
                cx={cx}
                cy={cy}
                r={6}
                fill={point.highlight ? 'var(--color-primary-500)' : 'var(--color-surface-500)'}
              />
              <text
                x={cx}
                y={cy - 12}
                textAnchor="middle"
                className={`text-2xs ${point.highlight ? 'fill-white font-medium' : 'fill-surface-400'}`}
              >
                {point.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
