'use client';

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { FitScale } from './FitScale';

/**
 * Tabs that advance on their own: each tab's hairline fills over DURATION, then the next document comes up.
 * Starts when the section is in view and pauses on hover or keyboard focus. Picking a tab restarts its timer.
 * No auto-advance under reduced motion or in the inline editor. Desktop shows the composed stage at true size;
 * below 1024px the same documents render in flow.
 */
const DURATION = 7000;

type Tab = { kicker: string; title: string };

export function PlanTabs({ tabs, stages, compact }: { tabs: Tab[]; stages: ReactNode[]; compact: ReactNode[] }) {
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const [hold, setHold] = useState(false);
  const [cycle, setCycle] = useState(0);
  const [still, setStill] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setStill(mq.matches || !!document.querySelector('.lf-editing'));
    sync();
    mq.addEventListener('change', sync);
    const el = root.current;
    const io = el ? new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 }) : null;
    if (el && io) io.observe(el);
    return () => { mq.removeEventListener('change', sync); io?.disconnect(); };
  }, []);

  const auto = !still;
  const running = auto && inView && !hold;

  const pick = (i: number, focus = false) => {
    setActive(i);
    setCycle((n) => n + 1);
    if (focus) tabRefs.current[i]?.focus();
  };
  const onKey = (e: KeyboardEvent) => {
    const n = tabs.length;
    const to = { ArrowRight: (active + 1) % n, ArrowLeft: (active - 1 + n) % n, Home: 0, End: n - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    pick(to, true);
  };

  return (
    <div
      ref={root}
      className="v11-ptabs"
      onMouseEnter={() => setHold(true)}
      onMouseLeave={() => setHold(false)}
      onFocus={(e) => { if (e.target.matches(':focus-visible')) setHold(true); }}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setHold(false); }}
    >
      <div className="v11-wrap">
        <div className="v11-ptab-list" role="tablist" onKeyDown={onKey}>
          {tabs.map((t, i) => {
            const on = i === active;
            return (
              <button
                key={i}
                ref={(el) => { tabRefs.current[i] = el; }}
                type="button"
                role="tab"
                id={`v11-ptab-${i}`}
                aria-selected={on}
                aria-controls={`v11-ppanel-${i} v11-ppanel-c${i}`}
                tabIndex={on ? 0 : -1}
                className={`v11-ptab ${on ? 'is-on' : ''}`}
                onClick={() => pick(i)}
              >
                <span className="v11-ptab-bar" aria-hidden="true">
                  {on && (
                    <span
                      key={`${active}-${cycle}`}
                      className={`is-fill ${auto ? 'is-timed' : ''}`}
                      style={auto ? { animationDuration: `${DURATION}ms`, animationPlayState: running ? 'running' : 'paused' } : undefined}
                      onAnimationEnd={() => setActive((a) => (a + 1) % tabs.length)}
                    />
                  )}
                </span>
                <span className="is-kicker">{t.kicker}</span>
                <span className="is-title">{t.title}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="v11-plate">
        <FitScale width={1296} className="v11-plate-full">
          <div className="v11-stage">
            {stages.map((s, i) => (
              <div key={i} role="tabpanel" id={`v11-ppanel-${i}`} aria-labelledby={`v11-ptab-${i}`} className={`v11-stage-panel ${i === active ? 'is-on' : ''}`} aria-hidden={i !== active}>
                {s}
              </div>
            ))}
          </div>
        </FitScale>
        <div className="v11-plate-compact">
          {compact.map((s, i) => (
            <div key={i} role="tabpanel" id={`v11-ppanel-c${i}`} aria-labelledby={`v11-ptab-${i}`} className={`v11-compact-panel ${i === active ? 'is-on' : ''}`} aria-hidden={i !== active}>
              {s}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
