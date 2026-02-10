'use client';

import { useState } from 'react';
import { Button, SectionContainer } from '@/components/ui';

interface ProblemItem {
  bold: string;
  body: string;
}

interface ProblemCheckerCProps {
  heading: string;
  items: ProblemItem[];
}

function getReaction(count: number) {
  switch (count) {
    case 0:
      return { text: '', showCta: false };
    case 1:
      return { text: 'Just one?', showCta: false };
    case 2:
      return { text: 'Most SaaS teams check at least two.', showCta: false };
    case 3:
      return { text: 'This is adding up.', showCta: true };
    case 4:
      return { text: 'Your site is working against you.', showCta: true };
    default:
      return { text: 'We should talk.', showCta: true };
  }
}

export function ProblemCheckerC({ heading, items }: ProblemCheckerCProps) {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const toggle = (index: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const count = checked.size;
  const reaction = getReaction(count);

  return (
    <SectionContainer className="bg-surface-50">
      {/* Label */}
      <p className="text-xs font-mono uppercase tracking-widest text-surface-400 mb-6">
        Direction C — Single Canvas
      </p>

      {/* Header — centered */}
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-surface-900">
          {heading}
        </h2>
        <p className="mt-3 text-surface-500">Check all that apply.</p>
      </div>

      {/* Items — single column, generous spacing, no borders */}
      <div
        className="mt-10 md:mt-12 max-w-2xl mx-auto"
        role="group"
        aria-label="Website problems checklist"
      >
        {items.map((item, i) => {
          const isChecked = checked.has(i);
          return (
            <button
              key={i}
              type="button"
              role="checkbox"
              aria-checked={isChecked}
              onClick={() => toggle(i)}
              className="w-full text-left py-4 group cursor-pointer"
            >
              <div className="flex gap-3.5 items-start">
                {/* Square checkbox — rounded-md, 18px */}
                <div
                  className={`mt-0.5 w-[18px] h-[18px] rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                    isChecked
                      ? 'bg-primary-600 border-primary-600'
                      : 'border-surface-300 group-hover:border-surface-400'
                  }`}
                >
                  {isChecked && (
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 12 12"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M2.5 6L5 8.5L9.5 3.5"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>

                {/* Text with left-border accent on check */}
                <div
                  className={`flex-1 min-w-0 pl-3 border-l-[3px] transition-colors duration-200 ${
                    isChecked ? 'border-primary-500' : 'border-transparent'
                  }`}
                >
                  <p
                    className={`font-medium leading-snug transition-colors duration-200 ${
                      isChecked ? 'text-surface-900' : 'text-surface-700'
                    }`}
                  >
                    {item.bold}
                  </p>
                  <p className="mt-1.5 text-sm text-surface-500 leading-relaxed">
                    {item.body}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer strip — border-t, count + reaction + CTA */}
      <div className="mt-8 md:mt-10 max-w-2xl mx-auto border-t border-surface-200 pt-6">
        <div className="flex items-center justify-between gap-4 min-h-[3rem]">
          <div className="flex-1">
            <span className="text-sm text-surface-400 font-mono tabular-nums">
              {count} of {items.length}
            </span>
            <p
              className={`mt-0.5 text-surface-700 font-medium transition-opacity duration-300 ${
                reaction.text ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {reaction.text || '\u00A0'}
            </p>
          </div>
          <div
            className={`shrink-0 transition-all duration-300 ${
              reaction.showCta
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 translate-x-4 pointer-events-none'
            }`}
          >
            <Button variant="primary" size="lg" calTrigger>
              Book a strategy call
            </Button>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
