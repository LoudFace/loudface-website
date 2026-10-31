'use client';

import { useCallback, useState, type ReactNode } from 'react';
import type { ApplyContent } from '@/lib/content-utils';
import { ApplyCard } from './ApplyCard';

/**
 * The /apply hero: the server-rendered left column (promise, chart, proof) beside the application card on the
 * brand plate. It only holds which step the card is on, so a phone can trade the promise for "You're a fit. Pick a
 * time with Arnel." on the calendar step and keep the whole card in the first screen.
 */
export function ApplyHero({ c, head, headline, rest, avatar, engines }: {
  c: ApplyContent;
  head: ReactNode;
  headline: ReactNode;
  rest: ReactNode;
  avatar: string;
  engines: string[];
}) {
  const [step, setStep] = useState<string>('q1');
  const onStep = useCallback((s: unknown) => setStep(String(s)), []);
  return (
    <section className="ap-hero" data-step={step === 'cal' ? 'cal' : step === 'notfit' ? 'notfit' : 'q'}>
      <div className="ap-left">
        {head}
        {headline}
        {rest}
      </div>
      <div className="ap-right">
        <div className="ap-plate">
          <ApplyCard c={c} avatar={avatar} engines={engines} onStep={onStep} />
        </div>
      </div>
    </section>
  );
}
