'use client';

import { useId, useState } from 'react';
import type { ProposalForecastAssumptions, ProposalSlider } from '@/sanity/lib/proposalsClient';

/**
 * The one interactive block on a proposal: the pipeline forecast. Two inputs,
 * one Bklit chart that moves with them, every assumption printed underneath.
 *
 * The other blocks were interactive too and were cut — a column of tab pills
 * over a chart is more work to read than the same numbers laid out flat.
 */

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
 * Two inputs, one picture that actually moves. The bars are drawn against a
 * FIXED ceiling (the most the sliders can produce), so dragging share of
 * voice up makes them grow. A Bklit bar chart was tried here and rejected:
 * it re-scales its own axis to the data, so every slider position drew the
 * same picture and the ramp shape was all the reader ever saw.
 *
 * Output is quantity per paid month. Never a term total, never cost per lead.
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
  const [sov, setSov] = useState(shareOfVoice.value);
  const [imp, setImp] = useState(impressions.value);

  const cr = conversion.value;
  const leadsFrom = (share: number, impressionsPerMonth: number) =>
    (((assumptions.aiQuestionsPerMonth * share) / 100) * (assumptions.aiClickRate / 100) +
      impressionsPerMonth * (assumptions.googleCtr / 100)) *
    (cr / 100);

  const steady = leadsFrom(sov, imp);
  const ceiling = leadsFrom(shareOfVoice.max, impressions.max);
  const ramp = assumptions.ramp && assumptions.ramp.length > 0 ? assumptions.ramp : [0.1, 0.35, 0.7, 1, 1, 1];

  return (
    <div data-print-keep>
      <div className="mt-5 grid max-w-[520px] gap-x-10 gap-y-4 sm:grid-cols-2">
        <Slider id={`${id}-sov`} label="AI share of voice" spec={shareOfVoice} value={sov} display={`${sov}%`} onChange={setSov} />
        <Slider id={`${id}-imp`} label="Google impressions" spec={impressions} value={imp} display={fmt(imp)} onChange={setImp} />
      </div>

      <p className="mt-6 text-[15px] text-surface-700" aria-live="polite">
        <span className="proposal-num mr-2.5 align-middle text-[38px] font-medium leading-none tracking-[-0.04em] text-primary-700">
          {leadText(steady)}
        </span>
        leads a month once it is running. {todayLine}
      </p>

      <ol className="mt-4 flex items-end gap-2 border-b border-surface-200 sm:gap-3">
        {ramp.map((r, i) => {
          const value = steady * r;
          return (
            <li key={i} className="flex min-w-0 flex-1 flex-col justify-end" style={{ height: 108 }}>
              <p className="proposal-num mb-1 text-center text-[12px] text-surface-950">{leadText(value)}</p>
              <span
                className="block rounded-t-[3px] bg-primary-600 transition-[height] duration-200 motion-reduce:transition-none"
                style={{ height: `${Math.max((value / Math.max(ceiling, 0.001)) * 100, value > 0 ? 2 : 0)}%` }}
              />
            </li>
          );
        })}
      </ol>
      <ol className="mt-1.5 flex gap-2 sm:gap-3">
        {ramp.map((_, i) => (
          <li key={i} className="min-w-0 flex-1 text-center text-[11.5px] text-surface-500">
            Month {i + 1}
          </li>
        ))}
      </ol>

      <p className="mt-4 text-[12px] text-surface-500">
        Model, not a promise. Assumes {fmt(assumptions.aiQuestionsPerMonth)} category questions a month put to AI,{' '}
        {assumptions.aiClickRate}% click through when named, {assumptions.googleCtr}% on Google, {cr}% convert, ramped{' '}
        {ramp.filter((r) => r < 1).map((r) => `${Math.round(r * 100)}%`).join('/')} over the first{' '}
        {ramp.filter((r) => r < 1).length} months.
      </p>
    </div>
  );
}

/* ── Ask the AI ───────────────────────────────────────────────────────── */

export type AskAiQuestion = {
  _key: string;
  question: string;
  short?: string;
  vendors: Array<{ _key: string; name: string; share: number }>;
};

/**
 * One horizontal row of short tabs, one panel. Two earlier shapes were
 * rejected: a column of full-width question pills over a chart (clunky), and
 * a grid of five small-multiple bar lists (thirty rows of the same picture).
 * The tab carries two or three words; the full question sits in the panel.
 */
export function ProposalAskAi({ questions, clientName }: { questions: AskAiQuestion[]; clientName: string }) {
  const groupId = useId();
  const [active, setActive] = useState(0);
  const current = questions[active];
  if (!current) return null;

  const lower = clientName.toLowerCase();
  const vendors = [...(current.vendors ?? [])].sort((a, b) => b.share - a.share);
  const top = Math.max(1, ...vendors.map((v) => v.share));

  return (
    <div>
      <div role="tablist" aria-label="Buyer questions" className="proposal-tabs mt-5 flex gap-6 overflow-x-auto border-b border-surface-200">
        {questions.map((q, i) => (
          <button
            key={q._key}
            type="button"
            role="tab"
            id={`${groupId}-tab-${i}`}
            aria-selected={i === active}
            aria-controls={`${groupId}-panel`}
            onClick={() => setActive(i)}
            className={`-mb-px shrink-0 border-b-2 pb-2.5 text-[13.5px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ${
              i === active
                ? 'border-primary-600 font-medium text-surface-950'
                : 'border-transparent text-surface-500 hover:text-surface-800'
            }`}
          >
            {q.short ?? q.question}
          </button>
        ))}
      </div>

      <div id={`${groupId}-panel`} role="tabpanel" aria-labelledby={`${groupId}-tab-${active}`} className="mt-5">
        <p className="text-[15.5px] leading-snug text-surface-950">&ldquo;{current.question}&rdquo;</p>
        <ul className="mt-4 max-w-[560px] space-y-1.5">
          {vendors.map((v) => {
            const isClient = v.name.toLowerCase() === lower;
            return (
              <li
                key={v._key}
                className={`grid grid-cols-[76px_minmax(0,1fr)_36px] items-center gap-3 text-[13px] ${
                  isClient ? 'font-medium text-primary-800' : 'text-surface-600'
                }`}
              >
                <span className="truncate">{v.name}</span>
                {/* Translucent, so the bars read on the page ground, on a white
                    band and on the indigo band without three sets of tokens. */}
                <span className="h-[8px] rounded-[2px] bg-surface-950/[0.07]">
                  <span
                    className={`block h-full rounded-[2px] transition-[width] duration-300 motion-reduce:transition-none ${
                      isClient ? 'bg-primary-600' : 'bg-surface-950/25'
                    }`}
                    style={{ width: `${Math.max((v.share / top) * 100, v.share > 0 ? 3 : 0)}%` }}
                  />
                </span>
                <span className="proposal-num text-right">{v.share}%</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
