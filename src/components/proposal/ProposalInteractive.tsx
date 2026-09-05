'use client';

import { useEffect, useId, useState } from 'react';
import { Background, Bar, BarChart, BarXAxis, ChartTooltip, Grid } from '@/components/charts';
import type { ProposalForecastAssumptions, ProposalSlider } from '@/sanity/lib/proposalsClient';
import '@/app/case-detail-v3/instruments-board.css';

/**
 * The three interactive blocks of the client-first body: Ask the AI, the
 * page-type gap chart, and the pipeline forecast. Client components because
 * the reader operates them; everything else on the page stays server-only.
 *
 * Charts are the same Bklit primitives as the case rows, card-less on dotted
 * paper. Numbers arrive from Sanity, nothing is computed from a guess here:
 * the forecast prints every assumption it uses under its own result.
 */

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

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

/* ── Ask the AI ───────────────────────────────────────────────────────── */

export type AskAiQuestion = { _key: string; question: string; vendors: Array<{ _key: string; name: string; share: number }> };

export function ProposalAskAi({ questions, clientName }: { questions: AskAiQuestion[]; clientName: string }) {
  const [active, setActive] = useState(0);
  const mounted = useMounted();
  const groupId = useId();
  const current = questions[active];
  if (!current) return null;

  const client = current.vendors.find((v) => v.name.toLowerCase() === clientName.toLowerCase());
  const points = current.vendors.map((v) => ({ label: v.name, value: v.share }));

  return (
    <div>
      <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Buyer questions">
        {questions.map((q, i) => (
          <button
            key={q._key}
            type="button"
            role="tab"
            id={`${groupId}-${i}`}
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={`rounded-full border px-3 py-1.5 text-left text-[13px] leading-snug transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ${
              i === active
                ? 'border-primary-600 bg-primary-50 text-primary-800'
                : 'border-surface-200 bg-white text-surface-700 hover:border-surface-300'
            }`}
          >
            {q.question}
          </button>
        ))}
      </div>

      <div className="inb proposal-plot mt-4" role="tabpanel" aria-labelledby={`${groupId}-${active}`}>
        {mounted && (
          <BarChart
            key={current._key}
            data={points}
            xDataKey="label"
            aspectRatio="3 / 1"
            barGap={0.34}
            margin={{ top: 10, right: 8, bottom: 26, left: 8 }}
          >
            <Background pattern="dots" opacity={0.6} />
            <Grid horizontal />
            <Bar dataKey="value" lineCap="butt" fill="var(--chart-1)" />
            <BarXAxis maxLabels={9} />
            <ChartTooltip
              content={({ point }) => (
                <Tip title={String(point.label)} label="Share of answers" value={`${Number(point.value)}%`} />
              )}
            />
          </BarChart>
        )}
      </div>

      <p className="mt-3 text-[14px] text-surface-700">
        <span
          className={`proposal-num mr-2 inline-flex h-[22px] items-center rounded-[5px] px-1.5 align-middle text-[13px] font-semibold tracking-[-0.02em] ${
            client && client.share > 0 ? 'bg-primary-600 text-white' : 'bg-surface-200 text-surface-950'
          }`}
        >
          {client ? `${client.share}%` : '0%'}
        </span>
        {client && client.share > 0
          ? `of answers name ${clientName} for this question.`
          : `${clientName} is not named in any answer to this question.`}
      </p>
    </div>
  );
}

/* ── The page-type gap ────────────────────────────────────────────────── */

export type GapRow = { _key: string; pageType: string; citations: number; coverage?: string; tone?: 'gap' | 'asset' };

export function ProposalGapChart({ rows }: { rows: GapRow[] }) {
  const mounted = useMounted();
  const points = rows.map((r) => ({ label: r.pageType, value: r.citations }));
  return (
    <div>
      <div className="inb proposal-plot proposal-plot-sm">
        {mounted && (
          <BarChart data={points} xDataKey="label" aspectRatio="3 / 1" barGap={0.34} margin={{ top: 10, right: 8, bottom: 26, left: 8 }}>
            <Background pattern="dots" opacity={0.6} />
            <Grid horizontal />
            <Bar dataKey="value" lineCap="butt" fill="var(--chart-1)" />
            <BarXAxis maxLabels={8} />
            <ChartTooltip
              content={({ point }) => (
                <Tip title={String(point.label)} label="Citations" value={Number(point.value).toLocaleString('en-US')} />
              )}
            />
          </BarChart>
        )}
      </div>
      <ul className="mt-2.5 flex flex-wrap gap-x-2 gap-y-1.5">
        {rows.map((r) => (
          <li
            key={r._key}
            className={`rounded-md px-2 py-1 text-[11.5px] ${
              r.tone === 'asset' ? 'bg-primary-50 text-primary-700' : 'bg-surface-100 text-surface-600'
            }`}
          >
            <span className="font-medium">{r.pageType}</span>
            {r.coverage ? ` · ${r.coverage.toLowerCase()}` : ''}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── The forecast ─────────────────────────────────────────────────────── */

const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
const leadText = (n: number) => (n < 10 ? n.toFixed(1) : fmt(n));

function Slider({
  id,
  label,
  spec,
  value,
  display,
  onChange,
}: {
  id: string;
  label: string;
  spec: ProposalSlider;
  value: number;
  display: string;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="whitespace-nowrap text-[13px] text-surface-700">
          {label}
        </label>
        <span className="flex items-baseline gap-2">
          {spec.note && <span className="text-[11.5px] text-surface-400">{spec.note}</span>}
          <output htmlFor={id} className="proposal-num text-[13px] font-semibold text-primary-700">
            {display}
          </output>
        </span>
      </div>
      <input
        id={id}
        type="range"
        className="proposal-range mt-1.5 w-full"
        min={spec.min}
        max={spec.max}
        step={spec.step ?? 1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

/**
 * Two inputs, one chart. The reader drags share of voice and impressions and
 * watches the monthly lead count move; everything else is a printed
 * assumption, not another control. Quantity per paid month is the only
 * output — no totals, no cost per lead.
 */
export function ProposalForecast({
  shareOfVoice,
  impressions,
  conversion,
  assumptions,
  todayLine,
}: {
  shareOfVoice: ProposalSlider;
  impressions: ProposalSlider;
  conversion: ProposalSlider;
  assumptions: ProposalForecastAssumptions;
  todayLine?: string;
}) {
  const id = useId();
  const mounted = useMounted();
  const [sov, setSov] = useState(shareOfVoice.value);
  const [imp, setImp] = useState(impressions.value);

  const cr = conversion.value;
  const visitors = (assumptions.aiQuestionsPerMonth * sov) / 100 * (assumptions.aiClickRate / 100) + imp * (assumptions.googleCtr / 100);
  const steady = (visitors * cr) / 100;
  const ramp = assumptions.ramp && assumptions.ramp.length > 0 ? assumptions.ramp : [0.1, 0.35, 0.7, 1, 1, 1];
  const points = ramp.map((r, i) => ({ label: `M${i + 1}`, value: Number((steady * r).toFixed(1)) }));

  return (
    <div data-print-keep>
      <div className="mt-5 grid max-w-[520px] gap-x-10 gap-y-4 sm:grid-cols-2">
        <Slider id={`${id}-sov`} label="AI share of voice" spec={shareOfVoice} value={sov} display={`${sov}%`} onChange={setSov} />
        <Slider id={`${id}-imp`} label="Google impressions" spec={impressions} value={imp} display={fmt(imp)} onChange={setImp} />
      </div>

      <p className="mt-7 text-[15px] text-surface-700" aria-live="polite">
        <span className="proposal-num mr-2.5 align-middle text-[38px] font-medium leading-none tracking-[-0.04em] text-primary-700">
          {leadText(steady)}
        </span>
        leads a month once it is running. {todayLine}
      </p>

      <div className="inb proposal-plot proposal-plot-sm mt-4">
        {mounted && (
          <BarChart data={points} xDataKey="label" aspectRatio="3 / 1" barGap={0.34} margin={{ top: 10, right: 8, bottom: 26, left: 8 }}>
            <Background pattern="dots" opacity={0.6} />
            <Grid horizontal />
            <Bar dataKey="value" lineCap="butt" fill="var(--chart-1)" />
            <BarXAxis maxLabels={ramp.length} />
            <ChartTooltip
              content={({ point }) => (
                <Tip title={`Month ${String(point.label).replace('M', '')}`} label="Leads" value={leadText(Number(point.value))} />
              )}
            />
          </BarChart>
        )}
      </div>

      <p className="mt-3 text-[12px] text-surface-500">
        Model, not a promise. Assumes {fmt(assumptions.aiQuestionsPerMonth)} category questions a month put to AI,{' '}
        {assumptions.aiClickRate}% click through when named, {assumptions.googleCtr}% on Google, {cr}% convert, ramped{' '}
        {ramp.filter((r) => r < 1).map((r) => `${Math.round(r * 100)}%`).join('/')} over the first{' '}
        {ramp.filter((r) => r < 1).length} months.
      </p>
    </div>
  );
}
