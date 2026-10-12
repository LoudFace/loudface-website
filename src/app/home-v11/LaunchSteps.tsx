'use client';

import { useEffect, useState } from 'react';

type Step = { when: string; heading: string; outcome: string };

/**
 * The four engagement steps beside the launch-stack figure. The figure runs in a same-origin iframe and posts
 * { type: 'launch-stack', step } as its loop moves: 1 strategy call, 2 growth plan, 3 ship and measure (ignition),
 * 4 grow (liftoff), 0 back on the pad. The matching row turns ink with the indigo dot; the rest stay readable in the
 * muted colour. Copy is the homepage route's (home-v11.json, route.steps).
 */
export function LaunchSteps({ steps }: { steps: Step[] }) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const listen = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: string; step?: number } | null;
      if (data && data.type === 'launch-stack' && typeof data.step === 'number') setActive(data.step);
    };
    window.addEventListener('message', listen);
    return () => window.removeEventListener('message', listen);
  }, []);
  return (
    <ol className="v11-launch-steps">
      {steps.map((step, index) => (
        <li key={step.heading} className="v11-launch-step" data-on={active === index + 1 ? '' : undefined}>
          <span aria-hidden="true" className="v11-launch-dot" />
          <span>
            <span className="v11-launch-when">{step.when}</span>
            <span className="v11-launch-head">{step.heading}</span>
            <span className="v11-launch-out">{step.outcome}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
