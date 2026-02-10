'use client';

import { useState, useEffect } from 'react';
import Cal, { getCalApi } from '@calcom/embed-react';
import { Button, SectionContainer } from '@/components/ui';

interface ProblemItem {
  bold: string;
  body: string;
}

interface ProblemCheckerAProps {
  heading: string;
  items: ProblemItem[];
}

const CAL_NAMESPACE = 'loudface-intro-call';
const CAL_LINK = 'arnelbukva/loudface-intro-call';

function getReaction(count: number) {
  switch (count) {
    case 0:
      return { text: "None of these apply. You're crushing it.", showCta: false };
    case 1:
      return { text: 'Pretty problematic, but not the end of the world.', showCta: false };
    case 2:
      return { text: "You're on thin ice, probably worth having an internal intervention.", showCta: false };
    case 3:
      return { text: 'This is adding up.', showCta: true };
    case 4:
      return { text: 'Your site is working against you.', showCta: true };
    default:
      return { text: 'We should talk.', showCta: true };
  }
}

export function ProblemCheckerA({ heading, items }: ProblemCheckerAProps) {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [embedReady, setEmbedReady] = useState(false);

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
  const showEmbed = reaction.showCta;

  // Configure Cal UI once the embed is ready
  useEffect(() => {
    if (!showEmbed) return;
    (async () => {
      const cal = await getCalApi({ namespace: CAL_NAMESPACE });
      cal('ui', {
        hideEventTypeDetails: true,
        layout: 'month_view',
        styles: {
          body: { background: 'transparent' },
        },
        cssVarsPerTheme: {
          light: {
            'cal-bg': 'transparent',
            'cal-bg-muted': 'transparent',
            'cal-border-booker': '#e5e5e5',
            'cal-border-booker-width': '1px',
            'cal-spacing-4': '0px',
            'cal-spacing-5': '0px',
            'cal-spacing-6': '0px',
          },
          dark: {
            'cal-bg': 'transparent',
            'cal-bg-muted': 'transparent',
            'cal-border-booker': '#e5e5e5',
            'cal-border-booker-width': '1px',
            'cal-spacing-4': '0px',
            'cal-spacing-5': '0px',
            'cal-spacing-6': '0px',
          },
        },
      });
      setEmbedReady(true);
    })();
  }, [showEmbed]);

  return (
    <SectionContainer>
      {/* Header */}
      <div className="max-w-3xl">
        <h2
          className="text-2xl sm:text-3xl md:text-4xl font-medium text-surface-900"
          dangerouslySetInnerHTML={{ __html: heading }}
        />
        <p className="mt-3 text-surface-500">Check all that apply.</p>
      </div>

      {/* Two-column layout on xl+ (flex gives embed guaranteed width) */}
      <div className="mt-10 md:mt-12 flex flex-col xl:flex-row gap-8 items-start">
        {/* Left: Checklist */}
        <div
          className={`w-full ${showEmbed ? 'xl:flex-1 xl:min-w-0' : 'xl:w-[480px] xl:shrink-0'}`}
          role="group"
          aria-label="Website problems checklist"
        >
          {items.map((item, i) => {
            const isChecked = checked.has(i);
            const isLast = i === items.length - 1;
            return (
              <button
                key={i}
                type="button"
                role="checkbox"
                aria-checked={isChecked}
                onClick={() => toggle(i)}
                className={`w-full text-left py-5 group cursor-pointer ${
                  !isLast ? 'border-b border-surface-200' : ''
                }`}
              >
                <div className="flex gap-3.5 items-start">
                  {/* Circle checkbox */}
                  <div
                    className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
                      isChecked
                        ? 'bg-surface-900 border-[1.5px] border-surface-900'
                        : 'border-[1.5px] border-surface-300 group-hover:border-surface-500'
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

                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-medium leading-snug transition-colors duration-200 ${
                        isChecked ? 'text-surface-900' : 'text-surface-600 group-hover:text-surface-900'
                      }`}
                    >
                      {item.bold}
                    </p>

                    {/* Progressive disclosure — body reveals on check */}
                    <div
                      className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                        isChecked ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="mt-2 text-sm text-surface-500 leading-relaxed">
                          {item.body}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}

          {/* Reaction footer — mobile/tablet only (xl+ shows it in right column) */}
          <div className="mt-8 flex items-center justify-between gap-6 xl:hidden">
            <p className="text-surface-600">{reaction.text}</p>

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

        {/* Right column (xl+ only) — reaction text or Cal.com embed */}
        <div className={`hidden xl:block ${showEmbed ? 'w-[780px] shrink-0' : 'flex-1 min-w-0'}`}>
          {showEmbed ? (
            <div
              className={`transition-all duration-500 ease-out ${
                embedReady
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-4 pointer-events-none'
              }`}
            >
              <div className="sticky top-8">
                <div className="relative">
                  {/* Floating annotation — absolute so it doesn't push the embed down */}
                  <div className="absolute -top-14 right-[15%] rotate-2 z-10 pointer-events-none">
                    <p className="text-sm font-medium text-surface-600 italic whitespace-nowrap">
                      You get the idea. This is our bread-n-butter.
                    </p>
                    <p className="text-sm font-medium text-surface-900 whitespace-nowrap">
                      Book a strategy call
                    </p>
                    <svg
                      width="80"
                      height="48"
                      viewBox="0 0 80 48"
                      fill="none"
                      className="mt-0.5 text-surface-400"
                      aria-hidden="true"
                    >
                      <path
                        d="M76 4C56 2 24 10 12 38"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        fill="none"
                      />
                      <path
                        d="M18 32L12 38L11 28"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                    </svg>
                  </div>
                </div>
                <div className="overflow-hidden">
                  <Cal
                    namespace={CAL_NAMESPACE}
                    calLink={CAL_LINK}
                    style={{ width: '100%', height: '100%', overflow: 'scroll' }}
                    config={{ layout: 'month_view' }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[200px]">
              <p className="text-lg text-surface-500 text-center max-w-sm">
                {reaction.text}
              </p>
            </div>
          )}
        </div>
      </div>
    </SectionContainer>
  );
}
