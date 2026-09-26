import type { ReactNode } from 'react';
import Link from 'next/link';
import type { Series } from './data';
import { LiveChart, type ValueFormat } from './LiveChart';
import { ArrowUpRight } from './ui';

/**
 * StageChart: a result drawn white on the indigo stage, with its number over the chart, the dates and a caption.
 * The single source for charts on the stage: the homepage results rail (size "slide") and inner-page heroes
 * (size "hero"). See DESIGN.md, "v11 component library".
 */

export interface StageChartProps {
  size?: 'slide' | 'hero';
  href?: string;
  tag: ReactNode;
  client: ReactNode;
  metric: ReactNode;
  compact?: boolean;
  series?: Series | null;
  format: ValueFormat;
  tip: string;
  periodStart?: ReactNode;
  periodEnd?: ReactNode;
  caption: ReactNode;
}

export function StageChart(p: StageChartProps) {
  const hero = p.size === 'hero';
  const body = (
    <>
      <div className="v11-slide-head">
        <div className="v11-slide-tag"><span className="is-tag">{p.tag}</span><span className="is-client">· {p.client}</span></div>
        {p.href && <span className="v11-slide-go"><ArrowUpRight /></span>}
      </div>
      <div className="v11-slide-chart">
        {p.series ? (
          <LiveChart
            series={p.series}
            width={hero ? undefined : 270}
            height={hero ? 300 : 196}
            margin={hero ? { top: 104, right: 14, bottom: 4, left: 10 } : { top: 84, right: 12, bottom: 4, left: 10 }}
            tone="stage"
            dots={false}
            hatch
            lineWidth={1.75}
            barGap={0.5}
            pin={hero ? 22 : 18}
            end="plain"
            tip={p.tip}
            format={p.format}
          >
            <span className={`v11-slide-metric ${p.compact ? 'is-compact' : ''}`}>{p.metric}</span>
          </LiveChart>
        ) : (
          <span className={`v11-slide-metric is-static ${p.compact ? 'is-compact' : ''}`}>{p.metric}</span>
        )}
      </div>
      {(p.periodStart || p.periodEnd) && <div className="v11-slide-dates"><span>{p.periodStart}</span><span>{p.periodEnd}</span></div>}
      <div className="v11-slide-cap">{p.caption}</div>
    </>
  );
  const cls = hero ? 'v11-slide is-hero' : 'v11-slide';
  return p.href ? <Link href={p.href} className={cls}>{body}</Link> : <div className={cls}>{body}</div>;
}
