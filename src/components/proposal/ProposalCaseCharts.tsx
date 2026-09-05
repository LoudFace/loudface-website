'use client';

import { curveCatmullRom } from '@visx/curve';
import { useEffect, useState } from 'react';
import { Area, AreaChart, Background, Bar, BarChart, BarXAxis, ChartTooltip, Grid, XAxis } from '@/components/charts';
import '@/app/case-detail-v3/instruments-board.css';

/**
 * The same Bklit charts the public case-study pages draw, at proposal size.
 *
 * Card-less on dotted paper, house indigo ink, one plot per case — the
 * 2026-08-19 case-study rule, carried over unchanged. The plot descriptor is
 * built on the server (`ProposalCaseProof`) from the case study's own
 * instruments, so what a prospect sees here is what they find on the site.
 *
 * Charts mount client-side only (their enter animation differs between
 * server and client render); the box keeps its height so nothing shifts.
 */

export type CasePlot =
  | {
      kind: 'bars';
      title: string;
      caption?: string;
      unit: '%' | '';
      points: { label: string; value: number; display?: string }[];
    }
  | {
      kind: 'area';
      title: string;
      caption?: string;
      /** Tooltip suffix, e.g. "× Dec" for an indexed series. */
      unitLabel: string;
      /** `value` is the lead series (clicks); `second` the quieter one (impressions). */
      points: { date: string; value: number; second?: number }[];
      secondLabel?: string;
      /** Annotations derived from the data itself — never invented events. */
    };

function Tip({ title, label, value }: { title: string; label: string; value: string }) {
  return (
    <div className="inb-tip">
      <p className="inb-tip-title">{title}</p>
      <ul className="inb-tip-rows">
        <li>
          <span className="inb-tip-rule" style={{ background: 'var(--chart-1)' }} />
          <span className="inb-tip-label">{label}</span>
          <span className="inb-tip-value">{value}</span>
        </li>
      </ul>
    </div>
  );
}

const fmtDay = (d: Date) =>
  Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

export function ProposalCaseChart({ plot }: { plot: CasePlot }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="inb proposal-plot">
      {mounted &&
        (plot.kind === 'bars' ? (
          <BarChart
            data={plot.points}
            xDataKey="label"
            aspectRatio="4 / 1"
            barGap={plot.points.length > 40 ? 0.12 : 0.28}
            margin={{ top: 8, right: 8, bottom: 26, left: 8 }}
          >
            <Background pattern="dots" opacity={0.6} />
            <Grid horizontal />
            <Bar dataKey="value" lineCap="butt" fill="var(--chart-1)" />
            <BarXAxis maxLabels={6} />
            <ChartTooltip
              content={({ point }) => (
                <Tip
                  title={String(point.label)}
                  label={plot.title}
                  value={
                    (point.display as string | undefined) ??
                    `${Number(point.value).toFixed(plot.unit === '%' ? 1 : 0)}${plot.unit}`
                  }
                />
              )}
            />
          </BarChart>
        ) : (
          <AreaChart
            data={plot.points.map((p) => ({ date: new Date(`${p.date}T00:00:00Z`), value: p.value, second: p.second ?? 0 }))}
            aspectRatio=""
            style={{ height: '100%' }}
            margin={{ top: 14, right: 22, bottom: 34, left: 22 }}
          >
            <Background pattern="dots" opacity={0.55} />
            <Grid horizontal />
            <Area dataKey="value" curve={curveCatmullRom} fillOpacity={0.24} strokeWidth={2} stroke="var(--chart-1)" />
            <XAxis />
            <ChartTooltip
              content={({ point }) => (
                <div className="inb-tip">
                  <p className="inb-tip-title">{fmtDay(point.date as Date)}</p>
                  <ul className="inb-tip-rows">
                    <li>
                      <span className="inb-tip-rule" style={{ background: 'var(--chart-1)' }} />
                      <span className="inb-tip-label">{plot.title}</span>
                      <span className="inb-tip-value">{`${(Number(point.value) / 100).toFixed(1)}${plot.unitLabel}`}</span>
                    </li>
                    {plot.secondLabel && (
                      <li>
                        <span className="inb-tip-rule" style={{ background: 'var(--chart-3)' }} />
                        <span className="inb-tip-label">{plot.secondLabel}</span>
                        <span className="inb-tip-value">{`${(Number(point.second) / 100).toFixed(1)}${plot.unitLabel}`}</span>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            />
          </AreaChart>
        ))}
    </div>
  );
}
