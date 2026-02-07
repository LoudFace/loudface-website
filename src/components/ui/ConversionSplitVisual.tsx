'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Animated hero visual: a browser frame showing an A/B test playing out.
 * Two page variants appear side by side, metrics count up, a winner is
 * declared, then the cycle resets with a new test scenario.
 * Demonstrates CRO value prop through the testing-to-winner narrative.
 */

const SCENARIOS = [
  { urlText: 'yoursite.com/landing', rateA: '2.1%', rateB: '4.7%', lift: '+124%' },
  { urlText: 'yoursite.com/pricing', rateA: '1.8%', rateB: '3.4%', lift: '+89%' },
  { urlText: 'yoursite.com/signup', rateA: '3.2%', rateB: '5.1%', lift: '+59%' },
];

const STEP_COUNT = 7;

export function ConversionSplitVisual() {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<'building' | 'complete' | 'fading'>('building');
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const scenarioRef = useRef(0);

  const cycle = useCallback(() => {
    let currentStep = 0;
    setStep(0);
    setPhase('building');

    const buildNext = () => {
      currentStep++;
      setStep(currentStep);
      if (currentStep < STEP_COUNT) {
        const delay = currentStep === 5 ? 600 : 380;
        timerRef.current = setTimeout(buildNext, delay);
      } else {
        timerRef.current = setTimeout(() => {
          setPhase('complete');
          timerRef.current = setTimeout(() => {
            setPhase('fading');
            timerRef.current = setTimeout(() => {
              scenarioRef.current = (scenarioRef.current + 1) % SCENARIOS.length;
              setScenarioIndex(scenarioRef.current);
              cycle();
            }, 700);
          }, 2400);
        }, 350);
      }
    };

    timerRef.current = setTimeout(buildNext, 550);
  }, []);

  useEffect(() => {
    cycle();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [cycle]);

  const scenario = SCENARIOS[scenarioIndex];
  const isComplete = phase === 'complete';
  const isFading = phase === 'fading';

  const stepStyle = (index: number): React.CSSProperties => ({
    opacity: step > index ? (isFading ? 0 : 1) : 0,
    transform: step > index
      ? isFading
        ? 'translateY(-4px)'
        : 'translateY(0)'
      : 'translateY(8px)',
    transition: isFading
      ? `opacity 350ms ease ${(STEP_COUNT - 1 - index) * 50}ms, transform 350ms ease ${(STEP_COUNT - 1 - index) * 50}ms`
      : 'opacity 300ms ease, transform 400ms cubic-bezier(.22,1,.36,1)',
  });

  const badgeStyle = (delay: number): React.CSSProperties => ({
    opacity: isComplete ? 1 : 0,
    transform: isComplete ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.92)',
    transition: `opacity 400ms ease ${delay}ms, transform 400ms cubic-bezier(.22,1,.36,1) ${delay}ms`,
  });

  return (
    <div className="w-full max-w-[380px] mx-auto relative" aria-hidden="true">
      {/* Decorative floating elements */}
      <div
        className="absolute -top-4 left-3 text-[10px] font-mono text-surface-300 select-none"
        style={{ opacity: isFading ? 0 : 0.5, transition: 'opacity 400ms ease' }}
      >
        A/B
      </div>
      <div
        className="absolute top-12 -right-1.5 w-2 h-2 rounded-full bg-primary-300"
        style={{ opacity: isFading ? 0 : 0.35, transition: 'opacity 400ms ease' }}
      />
      <div
        className="absolute bottom-16 -left-2 w-1.5 h-1.5 rounded-sm bg-primary-400"
        style={{ opacity: isFading ? 0 : 0.3, transition: 'opacity 400ms ease' }}
      />

      {/* Background glow on complete */}
      <div
        className="absolute -inset-8 rounded-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.08), transparent 70%)',
          opacity: isComplete ? 1 : 0,
          transition: 'opacity 600ms ease',
        }}
      />

      {/* Browser Frame */}
      <div
        className="rounded-2xl overflow-hidden bg-white relative"
        style={{
          border: `1px solid ${isComplete ? 'var(--color-primary-300)' : 'var(--color-surface-200)'}`,
          boxShadow: isComplete
            ? '0 0 0 1px var(--color-primary-200), 0 0 60px rgba(99,102,241,0.12), 0 25px 50px -12px rgba(0,0,0,0.18)'
            : '0 25px 50px -12px rgba(0,0,0,0.12)',
          opacity: isFading ? 0 : 1,
          transform: isFading ? 'scale(0.97)' : 'scale(1)',
          transition:
            'border-color 600ms ease, box-shadow 600ms ease, opacity 450ms ease 150ms, transform 450ms ease 150ms',
        }}
      >
        {/* Toolbar */}
        <div className="bg-surface-50 px-3.5 py-2 border-b border-surface-200 flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: '#FF5F57' }} />
            <div className="w-2 h-2 rounded-full" style={{ background: '#FEBC2E' }} />
            <div className="w-2 h-2 rounded-full" style={{ background: '#28C840' }} />
          </div>
          <div className="flex-1 h-5 bg-white rounded-md border border-surface-200 flex items-center justify-center gap-1.5">
            <svg className="w-3 h-3 text-surface-400" viewBox="0 0 16 16" fill="none">
              <path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="text-[8px] text-surface-400 font-medium tracking-wide">
              {scenario.urlText}
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 h-[260px] overflow-hidden">
          {/* Header: Split Test Label */}
          <div style={stepStyle(0)}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <svg className="w-3 h-3 text-surface-400" viewBox="0 0 16 16" fill="none">
                  <rect x="1" y="1" width="6" height="14" rx="1" stroke="currentColor" strokeWidth="1.2" />
                  <rect x="9" y="1" width="6" height="14" rx="1" stroke="currentColor" strokeWidth="1.2" />
                </svg>
                <span className="text-[9px] font-semibold text-surface-500 uppercase tracking-wider">Split Test</span>
              </div>
              <span className="text-[8px] text-surface-400 font-medium">50 / 50</span>
            </div>
          </div>

          {/* Variant Cards Side by Side */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Variant A */}
            <div style={stepStyle(1)}>
              <div className="rounded-lg border border-surface-200 p-2.5 h-[140px] flex flex-col">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <div className="w-4 h-4 rounded-full bg-surface-200 flex items-center justify-center">
                    <span className="text-[7px] font-bold text-surface-500">A</span>
                  </div>
                  <span className="text-[8px] text-surface-400 font-medium">Control</span>
                </div>
                {/* Mini wireframe: basic page */}
                <div className="flex-1 space-y-1.5">
                  <div className="h-1.5 w-[80%] bg-surface-200 rounded-full" />
                  <div className="h-1 w-[60%] bg-surface-100 rounded-full" />
                  <div className="h-1 w-[70%] bg-surface-100 rounded-full" />
                  <div className="mt-2 h-1 w-full bg-surface-100 rounded-full" />
                  <div className="h-1 w-[85%] bg-surface-100 rounded-full" />
                  <div className="mt-2.5 h-4 w-[65%] bg-surface-200 rounded" />
                </div>
              </div>
            </div>

            {/* Variant B */}
            <div style={stepStyle(2)}>
              <div className="rounded-lg border border-surface-200 p-2.5 h-[140px] flex flex-col">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <div className="w-4 h-4 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-[7px] font-bold text-primary-600">B</span>
                  </div>
                  <span className="text-[8px] text-surface-400 font-medium">Variant</span>
                </div>
                {/* Mini wireframe: optimized page */}
                <div className="flex-1 space-y-1.5">
                  <div className="h-2 w-[90%] bg-surface-800 rounded-full" />
                  <div className="h-1 w-[55%] bg-surface-200 rounded-full" />
                  {/* Social proof bar */}
                  <div className="flex gap-1 mt-1.5 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-surface-200" />
                    <div className="w-2.5 h-2.5 rounded-full bg-surface-200" />
                    <div className="w-2.5 h-2.5 rounded-full bg-surface-200" />
                    <div className="h-1 w-6 bg-surface-100 rounded-full self-center" />
                  </div>
                  <div className="h-1 w-full bg-surface-100 rounded-full" />
                  <div className="mt-2 h-4 w-[65%] bg-primary-500 rounded" />
                </div>
              </div>
            </div>
          </div>

          {/* Dotted divider between variants area and metrics */}
          <div style={stepStyle(3)}>
            <div className="border-t border-dashed border-surface-200 mt-3 mb-2.5" />
          </div>

          {/* Metrics Row */}
          <div style={stepStyle(4)}>
            <div className="grid grid-cols-2 gap-2.5">
              {/* Rate A */}
              <div className="text-center">
                <span
                  className="text-lg font-semibold text-surface-400 block"
                  style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)' }}
                >
                  {scenario.rateA}
                </span>
                <div className="mt-1 mx-auto h-1 rounded-full bg-surface-200" style={{ width: '40%' }} />
              </div>
              {/* Rate B */}
              <div className="text-center">
                <span
                  className="text-lg font-semibold text-primary-600 block"
                  style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)' }}
                >
                  {scenario.rateB}
                </span>
                <div className="mt-1 mx-auto h-1 rounded-full bg-primary-500" style={{ width: '70%' }} />
              </div>
            </div>
          </div>

          {/* Winner indicator */}
          <div style={stepStyle(5)}>
            <div className="flex items-center justify-center gap-1.5 mt-2.5">
              <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" fill="var(--color-success)" fillOpacity="0.15" />
                <path
                  d="M5 8l2 2 4-4"
                  stroke="var(--color-success)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-[9px] font-semibold" style={{ color: 'var(--color-success)' }}>
                Variant B wins
              </span>
            </div>
          </div>

          {/* Confidence bar */}
          <div style={stepStyle(6)}>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[7px] text-surface-400 font-medium whitespace-nowrap">Confidence</span>
              <div className="flex-1 h-1 bg-surface-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: '97%',
                    background: 'var(--color-success)',
                    opacity: 0.6,
                  }}
                />
              </div>
              <span
                className="text-[8px] font-semibold text-surface-500"
                style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)' }}
              >
                97%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Badge — Lift (top right) */}
      <div
        className="absolute -top-3 -right-4 bg-white rounded-xl border border-surface-100 px-2.5 py-1.5 flex items-center gap-1.5"
        style={{
          ...badgeStyle(100),
          boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
        }}
      >
        <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none">
          <path d="M8 12V4M5 7l3-3 3 3" stroke="var(--color-success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span
          className="text-[9px] font-semibold"
          style={{ color: 'var(--color-success)', fontFamily: 'var(--font-mono, ui-monospace, monospace)' }}
        >
          {scenario.lift}
        </span>
        <span className="text-[8px] text-surface-400">lift</span>
      </div>

      {/* Floating Badge — Tests won (bottom left) */}
      <div
        className="absolute -bottom-2 -left-3 bg-white rounded-xl border border-surface-100 px-2.5 py-1.5"
        style={{
          ...badgeStyle(250),
          boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
        }}
      >
        <span className="text-[7px] text-surface-400 font-medium block">
          Tests won
        </span>
        <div className="flex items-center gap-1 mt-0.5">
          <span
            className="text-xs font-semibold text-surface-900"
            style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)' }}
          >
            7/9
          </span>
          <span className="text-[7px] text-surface-400">this quarter</span>
        </div>
      </div>

      {/* Status line */}
      <div className="relative h-6 mt-4">
        {/* Building status */}
        <div
          className="absolute inset-0 flex items-center justify-center gap-2"
          style={{
            opacity: phase === 'building' && step > 0 ? 1 : 0,
            transition: 'opacity 250ms ease',
          }}
        >
          <div className="h-1.5 w-1.5 rounded-full bg-primary-500 animate-pulse" />
          <span className="text-xs font-medium text-surface-500">
            Running test...
          </span>
        </div>
        {/* Complete status */}
        <div
          className="absolute inset-0 flex items-center justify-center gap-2"
          style={{
            opacity: isComplete ? 1 : 0,
            transition: 'opacity 250ms ease',
          }}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" fill="var(--color-success)" fillOpacity="0.15" />
            <path
              d="M5 8l2 2 4-4"
              stroke="var(--color-success)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-xs font-medium text-surface-500">
            Winner found
          </span>
        </div>
      </div>

      {/* Scenario cycle indicator */}
      <div className="flex items-center justify-center gap-1.5 mt-1">
        {SCENARIOS.map((_, i) => (
          <div
            key={i}
            className="h-1 rounded-full transition-all duration-300"
            style={{
              width: i === scenarioIndex ? 16 : 6,
              backgroundColor: i === scenarioIndex
                ? 'var(--color-primary-500)'
                : 'var(--color-surface-200)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
