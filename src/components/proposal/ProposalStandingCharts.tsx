'use client';

import { curveCatmullRom } from '@visx/curve';
import { useEffect, useState } from 'react';
import {
  Background,
  Bar,
  BarChart,
  BarXAxis,
  BarYAxis,
  ChartTooltip,
  Line,
  LineChart,
  Ring,
  RingCenter,
  RingChart,
  XAxis,
} from '@/components/charts';
import type { ProposalSection } from '@/sanity/lib/proposalsClient';
import '@/app/case-detail-v3/instruments-board.css';

/**
 * "Where you stand" for a prospect: a snapshot, drawn with the same Bklit
 * charts and house indigo as the case-study boards (the `.inb` scope sets the
 * chart ink). Unlike the case-study InstrumentsBoard, which must show change,
 * this shows today — the before picture the proposal promises to move.
 *
 * Panels: `trend` (monthly line, first series is the client, the rest are
 * quieter comparison lines), `bars` (vertical), `hbars` (horizontal, for
 * ranked brands) and `ring` (parts of one whole). Charts mount client-side
 * only, as in ProposalCaseCharts, because their enter animation differs
 * between server and client render.
 */

type ChartsSection = Extract<ProposalSection, { _type: 'chartsSection' }>;
type Panel = ChartsSection['boards'][number]['panels'][number];

const INK = ['var(--chart-1)', 'var(--chart-4)', 'var(--chart-5)', 'var(--chart-3)'];
const card = 'rounded-2xl bg-white shadow-[0_1px_2px_rgba(10,10,10,0.05),0_8px_24px_-16px_rgba(30,27,75,0.18)]';

const fmt = (n: number, unit?: string) =>
  unit === '%' ? `${Math.round(n)}%` : n.toLocaleString('en-US', { maximumFractionDigits: 0 });

function Tip({ title, rows }: { title: string; rows: { label: string; value: string; color: string }[] }) {
  return (
    <div className="inb-tip">
      <p className="inb-tip-title">{title}</p>
      <ul className="inb-tip-rows">
        {rows.map((r) => (
          <li key={r.label}>
            <span className="inb-tip-rule" style={{ background: r.color }} />
            <span className="inb-tip-label">{r.label}</span>
            <span className="inb-tip-value">{r.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Trend({ panel }: { panel: Panel }) {
  const series = panel.series ?? [];
  const months = panel.points ?? [];
  const data = months.map((p) => {
    const row: Record<string, unknown> = { date: new Date(`${p.label}-01T00:00:00Z`) };
    series.forEach((s, i) => {
      row[`s${i}`] = (i === 0 ? p.value : p.compare?.[i - 1]) ?? 0;
    });
    return row;
  });
  return (
    <>
      {series.length > 1 && (
        <ul className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-surface-600">
          {series.map((s, i) => (
            <li key={s} className="flex items-center gap-1.5">
              <span className="h-[3px] w-4 rounded-full" style={{ background: INK[i] }} />
              <span className={i === 0 ? 'font-medium text-surface-900' : ''}>{s}</span>
            </li>
          ))}
        </ul>
      )}
      <LineChart data={data} aspectRatio="2.4 / 1" margin={{ top: 12, right: 18, bottom: 30, left: 18 }}>
        <Background pattern="dots" opacity={0.6} />
        {series.map((s, i) => (
          <Line
            key={s}
            dataKey={`s${i}`}
            curve={curveCatmullRom}
            strokeWidth={i === 0 ? 2.5 : 1.5}
            stroke={INK[i]}
          />
        ))}
        <XAxis />
        <ChartTooltip
          content={({ point }) => (
            <Tip
              title={(point.date as Date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' })}
              rows={series.map((s, i) => ({ label: s, value: fmt(Number(point[`s${i}`]), panel.unit), color: INK[i] }))}
            />
          )}
        />
      </LineChart>
    </>
  );
}

function Bars({ panel, horizontal }: { panel: Panel; horizontal?: boolean }) {
  const points = (panel.points ?? []).map((p) => ({ label: p.label, value: p.value }));
  return (
    <BarChart
      data={points}
      xDataKey="label"
      orientation={horizontal ? 'horizontal' : 'vertical'}
      aspectRatio={horizontal ? `1.5 / 1` : '1.6 / 1'}
      barGap={0.34}
      margin={horizontal ? { top: 4, right: 12, bottom: 4, left: 118 } : { top: 8, right: 8, bottom: 30, left: 8 }}
    >
      <Background pattern="dots" opacity={0.6} />
      <Bar dataKey="value" lineCap="butt" fill="var(--chart-1)" />
      {horizontal ? <BarYAxis /> : <BarXAxis />}
      <ChartTooltip
        showCrosshair={false}
        content={({ point }) => (
          <Tip
            title={String(point.label)}
            rows={[{ label: panel.seriesLabel ?? panel.title, value: fmt(Number(point.value), panel.unit), color: 'var(--chart-1)' }]}
          />
        )}
      />
    </BarChart>
  );
}

function RingPanel({ panel }: { panel: Panel }) {
  const points = panel.points ?? [];
  const total = points.reduce((sum, p) => sum + p.value, 0);
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
      <div className="shrink-0">
        <RingChart
          data={points.map((p, i) => ({ label: p.label, value: p.value, maxValue: total, color: INK[i] }))}
          size={190}
          strokeWidth={14}
          baseInnerRadius={52}
        >
          {points.map((p, i) => (
            <Ring key={p._key} index={i} lineCap="butt" />
          ))}
          <RingCenter defaultLabel={panel.seriesLabel ?? 'Total'} />
        </RingChart>
      </div>
      <ul className="w-full space-y-2.5">
        {points.map((p, i) => (
          <li key={p._key} className="flex items-baseline justify-between gap-3 border-b border-surface-200 pb-2 text-[13.5px] last:border-b-0">
            <span className="flex items-center gap-2 text-surface-800">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: INK[i] }} />
              {p.label}
            </span>
            <span className="proposal-num text-surface-950">
              {fmt(p.value, panel.unit)}
              <span className="ml-1.5 text-surface-500">{total ? `${Math.round((p.value / total) * 100)}%` : ''}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PanelCard({ panel, mounted }: { panel: Panel; mounted: boolean }) {
  const wide = panel.kind === 'trend';
  return (
    <figure className={`${card} flex min-w-0 flex-col p-5 sm:p-6 ${wide ? 'lg:col-span-2' : ''}`} data-print-keep>
      <figcaption className="mb-4">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-[15px] font-medium text-surface-950">{panel.title}</p>
          {panel.headline && (
            <p className="proposal-num shrink-0 text-[26px] font-medium leading-none tracking-[-0.03em] text-primary-700">
              {panel.headline}
            </p>
          )}
        </div>
      </figcaption>
      <div className="inb proposal-plot min-h-[160px] flex-1">
        {mounted &&
          (panel.kind === 'trend' ? (
            <Trend panel={panel} />
          ) : panel.kind === 'ring' ? (
            <RingPanel panel={panel} />
          ) : (
            <Bars panel={panel} horizontal={panel.kind === 'hbars'} />
          ))}
      </div>
      {panel.caption && <p className="mt-4 text-[13.5px] leading-snug text-surface-600">{panel.caption}</p>}
    </figure>
  );
}

export function ProposalStandingCharts({ section }: { section: ChartsSection }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      {section.intro && <p className="mt-3 max-w-[64ch] text-[15.5px] leading-relaxed text-surface-700">{section.intro}</p>}
      {(section.boards ?? []).map((board) => (
        <div key={board._key} className="mt-6 rounded-[22px] bg-primary-50/70 p-3 sm:p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-2 pb-3 pt-1">
            <p className="text-[13px] font-semibold text-primary-800">{board.label}</p>
            {board.source && <p className="text-[12.5px] text-surface-500">{board.source}</p>}
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {board.panels.map((panel) => (
              <PanelCard key={panel._key} panel={panel} mounted={mounted} />
            ))}
          </div>
        </div>
      ))}
      {section.closing && <p className="mt-6 max-w-[64ch] text-[15.5px] leading-relaxed text-surface-900">{section.closing}</p>}
    </>
  );
}
