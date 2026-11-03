import Link from 'next/link';
import type { ReactNode } from 'react';
import { ResearchChart } from './charts';
import { SERIES, type ChartGround, type ChartSize, type ChartTone, type ResearchFigure, type SeriesKey } from './contract';
import { onSeries, seriesChart, shortDate, splitOf, type PaperCard, type Person } from './view';

/** Small pieces both /research pages share. Styles: research.css (scoped under .rs). */

/** The series mark: a small square in the series colour (lit on night when `lit`). */
export function Mark({ s, lit = false }: { s: SeriesKey; lit?: boolean }) {
  return <i className={`rs-mark s-${s}${lit ? ' is-lit' : ''}`} aria-hidden="true" />;
}

/** A 1 px crosshair at a grid corner (DESIGN.md §2.5), placed by its class: tl, tr, bl, br. */
export function X({ at }: { at: 'tl' | 'tr' | 'bl' | 'br' }) {
  return <span className={`rs-x is-${at}`} aria-hidden="true"><i /><i /></span>;
}

export const Go = () => (
  <span className="rs-go" aria-hidden="true">
    <svg viewBox="0 0 12 12" fill="none" width="12" height="12"><path d="M3 9L9 3M4 3h5v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
  </span>
);

export const Right = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

/** How long a big number reads once its "of N" base is set small: the giant numbers step down so they fit their column. */
export function bigClass(value: string) {
  const n = splitOf(value)[0].length;
  return n <= 5 ? '' : n <= 7 ? ' is-long' : ' is-longer';
}

/** "101 of 336": the count large, its base small. */
export function Big({ value }: { value: string }) {
  const [n, of] = splitOf(value);
  return of ? <>{n}<small>{of}</small></> : <>{value}</>;
}

export function Kicker({ children, s }: { children: ReactNode; s?: SeriesKey }) {
  return <p className={`rs-kicker${s ? ' has-mark' : ''}`}>{s && <Mark s={s} lit />}<span>{children}</span></p>;
}

export function Head({ eyebrow, title, soft, body, s, id }: { eyebrow: ReactNode; title: ReactNode; soft: ReactNode; body?: ReactNode; s?: SeriesKey; id?: string }) {
  return (
    <div className="rs-head" id={id}>
      <div>
        <Kicker s={s}>{eyebrow}</Kicker>
        <h2 className="rs-h2"><span>{title}</span> <span className="is-soft">{soft}</span></h2>
      </div>
      {body && <p>{body}</p>}
    </div>
  );
}

export function Chart({ f, ground, tone, size = 'md', className, accent, showAxis }: { f: ResearchFigure; ground: ChartGround; tone: ChartTone; size?: ChartSize; className?: string; accent?: string; showAxis?: boolean }) {
  return <ResearchChart spec={f.spec} ground={ground} tone={tone} size={size} title={f.title} className={className} accent={accent} showAxis={showAxis} />;
}

/** A paper's lead figure as a cover, drawn on its series colour, its title above. */
export function Cover({ p, size = 'sm' }: { p: PaperCard; size?: ChartSize }) {
  if (!p.leadFigure) return null;
  const g = seriesChart(p.series);
  return (
    <div className={`rs-cover ${onSeries(p.series)}`}>
      <Chart f={p.leadFigure} {...g} size={size} />
    </div>
  );
}

/** A card on the series colour (the paper's "More research" strip): series, kind and date, the finding, its chart. */
export function SeriesCard({ p, read }: { p: PaperCard; read: ReactNode }) {
  const g = seriesChart(p.series);
  return (
    <article className={`rs-scard ${onSeries(p.series)}`}>
      <div className="rs-scard-meta"><b>{SERIES[p.series].name}</b><span><span>{p.kind}</span> · {shortDate(p.date)}</span></div>
      <h3 className="rs-scard-title"><Link href={p.href}>{p.name}</Link></h3>
      {p.leadFigure && (
        <div className="rs-scard-cover">
          <Chart f={p.leadFigure} {...g} size="sm" />
        </div>
      )}
      <div className="rs-scard-foot"><span>{p.sample}</span><Link href={p.href} className="rs-readlink" tabIndex={-1}><span>{read}</span> <span className="rs-arr">→</span></Link></div>
    </article>
  );
}

export function Byline({ who, size = 44 }: { who: Person; size?: number }) {
  const name = who.slug ? <Link href={`/team/${who.slug}`} rel="author">{who.name}</Link> : who.name;
  return (
    <div className="rs-byline">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {who.avatar && <img src={who.avatar} alt="" width={size} height={size} style={{ width: size, height: size }} />}
      <div><b>{name}</b>{who.title && <span>{who.title}</span>}</div>
    </div>
  );
}
