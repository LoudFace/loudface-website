import type { ReactNode } from 'react';
import type { Series } from './data';
import { LiveChart, type ValueFormat } from './LiveChart';
import { ArrowLink, LfMark, img } from './ui';
import { strip } from '@/lib/inline-edit/mark';

/**
 * ResultCase: the v11 result card, one client result with its live chart. The single source for every result
 * chart on the site (homepage results, case studies, service pages); see DESIGN.md, "v11 component library".
 * `feature` is the full-width case: the claim and the number on the left, the chart with its axis on the right.
 */

export interface ResultCaseProps {
  feature?: boolean;
  /** Image under /images/home-v11/ (e.g. "logos/genie-icon.png"); omitted = the LoudFace mark. */
  icon?: string;
  square?: boolean;
  href?: string;
  linkLabel?: string;
  client: ReactNode;
  claim: ReactNode;
  metric?: ReactNode;
  metricLabel?: ReactNode;
  /** More published figures under the number (feature cases only). */
  extra?: { value: ReactNode; label: ReactNode }[];
  chartLabel: ReactNode;
  source?: ReactNode;
  series?: Series | null;
  format: ValueFormat;
  tip: string;
  pin?: boolean;
  /** The chart's own caption, printed under it. */
  caption?: ReactNode;
}

export const Marks = () => (
  <>
    <i className="v11-m is-tl" aria-hidden="true" />
    <i className="v11-m is-tr" aria-hidden="true" />
    <i className="v11-m is-bl" aria-hidden="true" />
    <i className="v11-m is-br" aria-hidden="true" />
  </>
);

export function ResultCase(p: ResultCaseProps) {
  const head = (
    <div className="v11-rcase-head">
      {p.icon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img loading="lazy" src={img(p.icon)} alt="" width={28} height={28} className={`v11-case-icon ${p.square ? 'is-square' : ''}`} />
      ) : (
        <LfMark size={28} />
      )}
      {p.href && p.linkLabel && <ArrowLink href={p.href} size={13} color="#6b6788">{p.linkLabel}</ArrowLink>}
    </div>
  );
  const title = (
    <p className="v11-rcase-title"><span className="is-client">{p.client}</span> <span className="is-claim">{p.claim}</span></p>
  );
  const chart = p.series && (
    <LiveChart
      series={p.series}
      height={p.feature ? 300 : 200}
      margin={p.feature ? { top: 20, right: 12, bottom: 32, left: 12 } : { top: 20, right: 10, bottom: 8, left: 10 }}
      dots={false}
      hatch
      axis={p.feature}
      lineWidth={1.75}
      pin={p.pin === false ? false : 20}
      end="plain"
      tip={p.tip}
      format={p.format}
    />
  );
  const plot = (
    <div className="v11-rcase-plot">
      <div className="v11-rcase-label"><span>{p.chartLabel}</span>{p.source && <span className="is-src">{p.source}</span>}</div>
      {chart}
      {p.caption && <p className="v11-rcase-cap">{p.caption}</p>}
    </div>
  );
  if (p.feature) {
    return (
      <div className="v11-rcase is-feature">
        <Marks />
        <div className="v11-rcase-side">
          {head}
          {title}
          {p.metric && (
            <div className="v11-rcase-big">
              <div className={typeof p.metric === 'string' && strip(p.metric).length > 7 ? 'is-num is-long' : 'is-num'}>{p.metric}</div>
              {p.metricLabel && <div className="is-label">{p.metricLabel}</div>}
            </div>
          )}
          {p.extra && p.extra.length > 0 && (
            <div className="v11-rcase-extra">
              {p.extra.map((x, i) => (
                <div key={i}><span className="is-v">{x.value}</span><span className="is-l">{x.label}</span></div>
              ))}
            </div>
          )}
        </div>
        {plot}
      </div>
    );
  }
  return (
    <div className="v11-rcase">
      <Marks />
      {head}
      {title}
      {plot}
    </div>
  );
}
