'use client';

import { curveCatmullRom } from '@visx/curve';
import { useEffect, useId, useState, type CSSProperties, type ReactNode } from 'react';
import { Area, AreaChart, Background, Bar, BarChart, ChartTooltip, PatternLines } from '@/components/charts';
import { PatternArea } from '@/components/charts/pattern-area';
import { useChartStable } from '@/components/charts/chart-context';
import type { Series } from './data';
import '@/app/case-detail-v3/instruments-board.css';

/**
 * The proposal's Bklit charts, dressed for the homepage: dotted paper, one indigo (or white, on the stage)
 * series, the LoudFace pin on the day we started, an end annotation, and a hover tooltip on every point.
 * Charts mount client-side only (their enter animation differs between server and client); the box keeps
 * its height so nothing shifts.
 */

export type ValueFormat = 'index' | 'indexWeek' | 'pct';
type Tone = 'light' | 'stage' | 'ink';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dayMonth = (iso: string) => { const d = new Date(`${iso}T00:00:00Z`); return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`; };
const utc = (iso: string) => new Date(`${iso}T00:00:00Z`);

function fmt(v: number, f: ValueFormat) {
  if (f === 'pct') return `${v.toFixed(1)}%`;
  const x = v / (f === 'indexWeek' ? 700 : 100);
  return `${x < 10 ? x.toFixed(1) : Math.round(x)}×`;
}

const INK: Record<Tone, string> = { light: '#4f39f6', stage: '#ffffff', ink: '#2c21a8' };
const DOT: Record<Tone, string> = { light: '#d9d6ee', stage: '#6a63ee', ink: 'transparent' };

/**
 * Where the start date falls: a time scale for areas, the bar slots for bars. Bars are evenly spaced even when
 * the weeks are not (a tracking pause leaves a gap), so the pin sits between the two bars either side of the
 * start, not at a fraction of the whole range.
 */
function useStartX(series: Series) {
  const c = useChartStable();
  if (c.barScale && c.bandWidth !== undefined) {
    const n = series.dates.length;
    const cx = (i: number) => (c.barScale!(dayMonth(series.dates[i])) ?? 0) + c.bandWidth! / 2;
    const s = utc(series.start).getTime();
    const k = series.dates.findIndex((d) => utc(d).getTime() >= s);
    if (k === -1) return cx(n - 1);
    if (k === 0) return Math.max(cx(0), 2);
    const a = utc(series.dates[k - 1]).getTime(), b = utc(series.dates[k]).getTime();
    return cx(k - 1) + ((cx(k) - cx(k - 1)) * (s - a)) / Math.max(b - a, 1);
  }
  return c.xScale(utc(series.start));
}

function usePoint(series: Series, i: number): [number, number] {
  const c = useChartStable();
  const v = series.values[i];
  const x = c.barScale && c.bandWidth !== undefined ? (c.barScale(dayMonth(series.dates[i])) ?? 0) + c.bandWidth / 2 : c.xScale(utc(series.dates[i]));
  return [x, c.yScale(v)];
}

/** LoudFace pin with its guide line and the "Start · 5 Jul" pill. */
function StartPin({ series, size, tone, prefix, pinTop }: { series: Series; size: number; tone: Tone; prefix?: ReactNode; pinTop: number }) {
  const c = useChartStable();
  const x = useStartX(series);
  const y = -pinTop;
  const inner = Math.round(size * 0.7);
  const guide = tone === 'stage' ? 'rgba(255,255,255,0.4)' : tone === 'ink' ? '#8c80d8' : '#dddaef';
  const labelLeft = x < c.innerWidth - 90;
  return (
    <g pointerEvents="none">
      <line x1={x} x2={x} y1={y + size / 2 + 2} y2={c.innerHeight} stroke={guide} strokeWidth={1} />
      <foreignObject x={x - size / 2 - 2} y={y - size / 2 - 2} width={size + 4} height={size + 4} overflow="visible">
        <span className="v11-pin" style={{ position: 'relative', display: 'block', left: 2, top: 2, width: size, height: size, boxShadow: size >= 24 ? '0 0 0 1.5px #d8d5ea, 0 3px 8px rgba(40,20,120,0.22)' : '0 0 0 1.5px #ffffff, 0 2px 6px rgba(40,20,120,0.25)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/lf-logo.svg" alt="" width={inner} height={inner} style={{ left: (size - inner) / 2, top: (size - inner) / 2 }} />
        </span>
      </foreignObject>
      {prefix && (
        <foreignObject x={labelLeft ? x + size / 2 + 3 : x - 80} y={y - 9} width={80} height={18} overflow="visible">
          <span className={`v11-startpill ${tone === 'stage' ? 'is-stage' : ''}`} style={{ position: 'relative', display: 'inline-flex', left: 0, top: 0 }}>
            <span>{prefix}</span>
            <span>&nbsp;· {dayMonth(series.start)}</span>
          </span>
        </foreignObject>
      )}
      <title>{`LoudFace starts · ${dayMonth(series.start)}`}</title>
    </g>
  );
}
(StartPin as unknown as { __isPostOverlay: boolean }).__isPostOverlay = true;

/** The published figure at the end of the series (or at its peak), with the dot it belongs to. */
function EndMark({ series, tone, label, above, halo }: { series: Series; tone: Tone; label?: ReactNode; above?: boolean; halo: boolean }) {
  const [x, y] = usePoint(series, series.peak ?? series.values.length - 1);
  const fill = tone === 'stage' ? '#ffffff' : '#4f39f6';
  return (
    <g pointerEvents="none">
      {halo && <circle cx={x} cy={y} r={13} fill="#e4e0fd" />}
      <circle cx={x} cy={y} r={tone === 'stage' ? 9 : 0} fill="rgba(255,255,255,0.25)" />
      <circle cx={x} cy={y} r={5} fill={fill} stroke={tone === 'stage' ? 'none' : '#ffffff'} strokeWidth={2} />
      {label && (
        <>
          {above && <line x1={x} x2={x} y1={y - 24} y2={y - 12} stroke="#4f39f6" strokeWidth={1.5} />}
          <foreignObject x={(above ? x + 16 : x - 18) - 320} y={above ? y - 50 : y - 13} width={320} height={26} overflow="visible">
            <div className="v11-endwrap"><span className="v11-endlabel is-static">{label}</span></div>
          </foreignObject>
        </>
      )}
    </g>
  );
}
(EndMark as unknown as { __isPostOverlay: boolean }).__isPostOverlay = true;

/** Four quiet date labels under the plot; no hover ticker. */
function StaticAxis({ series, tone = 'light' }: { series: Series; tone?: Tone }) {
  const c = useChartStable();
  const fill = tone === 'stage' ? 'rgba(255,255,255,0.62)' : '#8a87a3';
  const n = series.dates.length;
  // Bar charts place labels under four evenly spread bars; line charts spread four dates over the time scale.
  if (c.barScale && c.bandWidth !== undefined) {
    const picks = [...new Set([0, Math.round((n - 1) / 3), Math.round((2 * (n - 1)) / 3), n - 1])];
    return (
      <g pointerEvents="none">
        {picks.map((i, k) => (
          <text key={i} x={(c.barScale!(dayMonth(series.dates[i])) ?? 0) + c.bandWidth! / 2} y={c.innerHeight + 22} textAnchor={k === 0 ? 'start' : k === picks.length - 1 ? 'end' : 'middle'} fontSize={11.5} fill={fill}>
            {dayMonth(series.dates[i])}
          </text>
        ))}
      </g>
    );
  }
  const a = utc(series.dates[0]).getTime(), b = utc(series.dates[n - 1]).getTime();
  const t0 = Math.min(a, utc(series.start).getTime());
  // Under 360px of plot (a phone), four month labels touch, so only the first and last are drawn.
  const steps = c.innerWidth < 360 ? [0, 3] : [0, 1, 2, 3];
  return (
    <g pointerEvents="none">
      {steps.map((i) => {
        const d = new Date(t0 + ((b - t0) * i) / 3);
        const anchor = i === 0 ? 'start' : i === 3 ? 'end' : 'middle';
        return (
          <text key={i} x={c.xScale(d)} y={c.innerHeight + 22} textAnchor={anchor} fontSize={11.5} fill={fill}>
            {`${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`}
          </text>
        );
      })}
    </g>
  );
}
(StaticAxis as unknown as { __isPostOverlay: boolean }).__isPostOverlay = true;

export interface LiveChartProps {
  series: Series;
  height: number;
  /** Fixed width in px; omit to fill the column. */
  width?: number;
  margin: { top: number; right: number; bottom: number; left: number };
  tone?: Tone;
  dots?: boolean;
  lineWidth?: number;
  barGap?: number;
  pin?: number | false;
  startPrefix?: ReactNode;
  endLabel?: ReactNode;
  endLabelAbove?: boolean;
  end?: 'halo' | 'plain' | 'none';
  axis?: boolean;
  /** Vertical hatch under the line instead of a gradient fill. */
  hatch?: boolean;
  /** Tooltip row label, e.g. "Google impressions". */
  tip: ReactNode;
  format: ValueFormat;
  /** Drawn over the plot, top left (the slider's big number). */
  children?: ReactNode;
}

export function LiveChart({
  series, height, width, margin, tone = 'light', dots = true, lineWidth = 2, barGap = 0.3, pin = 26, startPrefix,
  endLabel, endLabelAbove, end = 'halo', axis = false, hatch = false, tip, format, children,
}: LiveChartProps) {
  const [mounted, setMounted] = useState(false);
  const [still, setStill] = useState(false);
  useEffect(() => { setStill(window.matchMedia('(prefers-reduced-motion: reduce)').matches); setMounted(true); }, []);
  const ink = INK[tone];
  const hatchId = useId().replace(/:/g, '');
  const box: CSSProperties = { height, width: width ?? '100%' };

  const tooltip = (
    <ChartTooltip
      showDatePill={false}
      dotVariant="ring"
      dotSize={4}
      indicatorFadeEdges="both"
      indicatorColor={tone === 'stage' ? 'rgba(255,255,255,0.55)' : '#c9c5e6'}
      backgroundColor="#ffffff"
      panelStyle={{ minWidth: 0, borderRadius: 8, color: '#1a1040', backdropFilter: 'none', boxShadow: '0 0 0 1px rgba(20,16,60,0.08), 0 6px 18px rgba(20,16,60,0.12)' }}
      content={({ point }) => (
        <div className="v11-tip">
          <div className="v11-tip-val"><strong>{fmt(Number(point.value), format)}</strong> <span>{tip}</span></div>
          <div className="v11-tip-date">{String(point.tipDate)}</div>
        </div>
      )}
    />
  );
  // An array, not a fragment: the chart shell sorts its direct children into layers.
  const marks = [
    axis ? <StaticAxis key="axis" series={series} tone={tone} /> : null,
    pin !== false ? <StartPin key="pin" series={series} size={pin} tone={tone} prefix={startPrefix} pinTop={0} /> : null,
    end !== 'none' ? <EndMark key="end" series={series} tone={tone} label={endLabel} above={endLabelAbove} halo={end === 'halo'} /> : null,
  ];

  return (
    <div
      className={`v11-lc inb is-${tone}`}
      style={box}
      role="img"
      aria-label={`${series.bars ? 'Bar' : 'Line'} chart from ${dayMonth(series.dates[0])} ${series.dates[0].slice(0, 4)} to ${dayMonth(series.dates[series.dates.length - 1])} ${series.dates[series.dates.length - 1].slice(0, 4)}${pin !== false ? `, LoudFace started ${dayMonth(series.start)} ${series.start.slice(0, 4)}` : ''}, rising to ${fmt(series.values[series.values.length - 1], format)} at the end`}
    >
      {mounted &&
        (series.bars ? (
          <BarChart
            data={series.dates.map((d, i) => ({ label: dayMonth(d), tipDate: `Week of ${dayMonth(d)}`, value: series.values[i] }))}
            xDataKey="label"
            aspectRatio=""
            animationDuration={still ? 0 : undefined}
            barGap={barGap}
            margin={margin}
          >
            {dots && <Background pattern="dots" color={DOT[tone]} opacity={1} />}
            <Bar dataKey="value" lineCap="butt" fill={tone === 'stage' ? 'rgba(255,255,255,0.9)' : ink} minBarHeight={2} />
            {tooltip}
            {marks}
          </BarChart>
        ) : (
          <AreaChart
            data={series.dates.map((d, i) => ({ date: utc(d), tipDate: dayMonth(d), value: series.values[i] }))}
            aspectRatio=""
            animationDuration={still ? 0 : undefined}
            style={{ height: '100%' }}
            margin={margin}
          >
            {dots && <Background pattern="dots" color={DOT[tone]} opacity={1} />}
            {hatch && <PatternLines id={hatchId} height={5} width={5} stroke={tone === 'stage' ? 'rgba(255,255,255,0.22)' : 'rgba(79,57,246,0.16)'} strokeWidth={1} orientation={['vertical']} />}
            {hatch && <PatternArea dataKey="value" fill={`url(#${hatchId})`} curve={curveCatmullRom} />}
            <Area dataKey="value" curve={curveCatmullRom} fillOpacity={hatch ? 0 : tone === 'stage' ? 0.3 : tone === 'ink' ? 0.18 : 0.24} strokeWidth={lineWidth} stroke={ink} fill={ink} />
            {tooltip}
            {marks}
          </AreaChart>
        ))}
      {children}
    </div>
  );
}
