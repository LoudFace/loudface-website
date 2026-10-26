'use client';

import { useRef, useState } from 'react';

/**
 * How we work, in one compact card (Arnel, 2026-10-26: "show them we're an
 * advanced and mature team that has a methodology in place, not winging it").
 *
 * The eight stages of the Answer Chain from /methodology as a rail of stations,
 * one stage open at a time with its own first paragraph and a link to the full
 * stage. The copy is the methodology page's approved text, passed in from
 * src/app/methodology-v3/data.tsx by ProposalCardsDocument; it is never
 * rewritten here (that file's header says why).
 */

export type MethodStage = { n: number; short: string; text: string };

export function ProposalMethod({ stages, index }: { stages: MethodStage[]; index: number }) {
  const [active, setActive] = useState(0);
  const rail = useRef<HTMLOListElement>(null);
  const stage = stages[active];

  const pick = (i: number) => {
    const next = Math.max(0, Math.min(stages.length - 1, i));
    setActive(next);
    // Keep the picked station in view on phones, where the rail scrolls sideways.
    // The list is positioned, so a station's offsetLeft is within the list; the box that scrolls is its parent.
    const list = rail.current;
    const box = list?.parentElement;
    const el = list?.querySelectorAll('li')[next];
    if (list && box && el && box.scrollWidth > box.clientWidth) {
      box.scrollTo({ left: list.offsetLeft + el.offsetLeft - box.clientWidth / 2 + el.clientWidth / 2, behavior: 'smooth' });
    }
  };

  return (
    <section
      id={`section-method-${index + 1}`}
      data-proposal-section="How we work: the Answer Chain"
      data-proposal-type="method"
      className="py-12 sm:py-14"
    >
      <h2 className="text-[22px] font-medium leading-tight tracking-[-0.03em] text-surface-950 sm:text-[26px]">How we work: the Answer Chain</h2>
      <p className="mt-2 max-w-[62ch] text-[15px] text-surface-600">
        Every account runs on the same eight stages, from the first baseline to the revenue report. Nothing ships on a hunch.
      </p>

      <div className="mt-6 rounded-[22px] bg-primary-50/70 p-3 sm:p-4">
        <div className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(10,10,10,0.05),0_8px_24px_-16px_rgba(30,27,75,0.18)] sm:p-6">
          <div className="relative -mx-5 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
            <ol ref={rail} className="relative flex min-w-[640px] justify-between" aria-label="The eight stages">
              <span aria-hidden="true" className="absolute left-[30px] right-[30px] top-[11px] h-[2px] rounded bg-primary-100" />
              <span
                aria-hidden="true"
                className="absolute left-[30px] top-[11px] h-[2px] rounded bg-primary-600 transition-[width] duration-300"
                style={{ width: `calc((100% - 60px) * ${active / (stages.length - 1)})` }}
              />
              {stages.map((s, i) => {
                const on = i === active;
                const done = i < active;
                return (
                  <li key={s.n} className="relative flex w-[60px] flex-col items-center">
                    <button
                      type="button"
                      onClick={() => pick(i)}
                      aria-pressed={on}
                      aria-label={`Stage ${s.n}: ${s.short}`}
                      className="group flex flex-col items-center gap-2 focus-visible:outline-none"
                    >
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors duration-200 group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-primary-600 ${
                          on ? 'border-primary-600 bg-primary-600' : done ? 'border-primary-600 bg-white' : 'border-primary-200 bg-white group-hover:border-primary-400'
                        }`}
                      >
                        {on && <span className="h-2 w-2 rounded-full bg-white" />}
                        {done && <span className="h-2 w-2 rounded-full bg-primary-600" />}
                      </span>
                      <span className={`w-[76px] text-center text-[12px] font-medium leading-tight ${on ? 'text-primary-700' : 'text-surface-600'}`}>
                        {s.short.split(',')[0]}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>

          <div key={stage.n} className="pw-strip mt-6 border-t border-surface-200 pt-5 sm:min-h-[184px]">
            <p className="text-[12px] font-semibold uppercase tracking-[0.04em] text-primary-600">
              Stage {stage.n} of {stages.length}
            </p>
            <h3 className="mt-2 text-[21px] font-medium leading-tight tracking-[-0.025em] text-surface-950 sm:text-[23px]">{stage.short}</h3>
            <p className="mt-2.5 max-w-[68ch] text-[15px] leading-relaxed text-surface-700">{stage.text}</p>
          </div>

          <div className="mt-5 flex items-center justify-between gap-4 border-t border-surface-100 pt-4">
            <a
              href={`https://www.loudface.co/methodology#stage-${stage.n}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13.5px] font-medium text-primary-700 hover:underline hover:underline-offset-4"
            >
              Read the full stage on loudface.co
            </a>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => pick(active - 1)}
                disabled={active === 0}
                aria-label="Previous stage"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-100 text-surface-700 transition-colors hover:bg-surface-200 disabled:opacity-40"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M10 3.5L5.5 8l4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => pick(active + 1)}
                disabled={active === stages.length - 1}
                aria-label="Next stage"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-950 text-white transition-colors hover:bg-surface-800 disabled:opacity-40"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M6 3.5L10.5 8 6 12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
