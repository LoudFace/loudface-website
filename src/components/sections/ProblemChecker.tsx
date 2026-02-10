'use client';

import { useState } from 'react';
import { Button, SectionContainer } from '@/components/ui';

interface ProblemItem {
  bold: string;
  body: string;
}

interface ProblemCheckerProps {
  heading: string;
  items: ProblemItem[];
}

const RING_RADIUS = 45;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function getReaction(count: number) {
  switch (count) {
    case 0:
      return { label: 'Check all that apply.', sub: '', showCta: false };
    case 1:
      return { label: 'Just one?', sub: 'Keep going.', showCta: false };
    case 2:
      return {
        label: 'Sounds familiar.',
        sub: 'Most SaaS teams check at least two.',
        showCta: false,
      };
    case 3:
      return {
        label: 'This is adding up.',
        sub: 'Every checked box is pipeline leaking.',
        showCta: true,
      };
    case 4:
      return {
        label: 'Your site is working against you.',
        sub: 'All of these are fixable.',
        showCta: true,
      };
    default:
      return {
        label: 'We should talk.',
        sub: 'Every month you wait costs you deals.',
        showCta: true,
      };
  }
}

export function ProblemChecker({ heading, items }: ProblemCheckerProps) {
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
  const progress = count / items.length;
  const offset = CIRCUMFERENCE * (1 - progress);
  const reaction = getReaction(count);

  const ringStroke =
    count === 0
      ? 'var(--color-surface-500)'
      : count <= 2
        ? 'var(--color-primary-500)'
        : 'var(--color-error, #ef4444)';

  return (
    <SectionContainer>
      <div className="max-w-3xl">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-surface-900">
          {heading}
        </h2>
      </div>

      <div className="mt-10 md:mt-14 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Checklist */}
        <div
          className="lg:col-span-7 space-y-3"
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
                className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 group cursor-pointer ${
                  isChecked
                    ? 'border-primary-500 bg-white shadow-sm'
                    : 'border-surface-200 bg-white hover:border-surface-300'
                }`}
              >
                <div className="flex gap-4">
                  {/* Custom checkbox */}
                  <div
                    className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                      isChecked
                        ? 'bg-primary-600 border-primary-600'
                        : 'border-surface-300 group-hover:border-surface-400'
                    }`}
                  >
                    {isChecked && (
                      <svg
                        width="12"
                        height="12"
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
                  <div>
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

        {/* Diagnostic panel */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24 bg-surface-900 rounded-2xl p-8 text-center">
            {/* Progress ring */}
            <div className="flex justify-center mb-6">
              <div className="relative w-28 h-28">
                <svg
                  viewBox="0 0 120 120"
                  className="w-full h-full -rotate-90"
                  aria-hidden="true"
                >
                  <circle
                    cx="60"
                    cy="60"
                    r={RING_RADIUS}
                    fill="none"
                    stroke="var(--color-surface-700)"
                    strokeWidth="6"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r={RING_RADIUS}
                    fill="none"
                    stroke={ringStroke}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={offset}
                    className="transition-all duration-500 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-mono font-medium text-white">
                    {count}
                    <span className="text-surface-500">/{items.length}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Reaction text */}
            <div className="min-h-[3.5rem]">
              <p className="font-medium text-lg text-white">{reaction.label}</p>
              {reaction.sub && (
                <p className="mt-1 text-sm text-surface-400">{reaction.sub}</p>
              )}
            </div>

            {/* CTA — fades in when 3+ items are checked */}
            <div
              className={`mt-6 transition-all duration-300 ${
                reaction.showCta
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-2 pointer-events-none'
              }`}
            >
              <Button variant="secondary" size="lg" calTrigger fullWidth>
                Book a strategy call
              </Button>
            </div>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
