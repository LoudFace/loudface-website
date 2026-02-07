'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Animated hero visual: a browser frame showing copy being written first,
 * then page structure crystallizing around it.
 * Demonstrates the Copy → Design → Dev workflow.
 */

const SCENARIOS = [
  { urlText: 'yoursite.com', label: 'Homepage' },
  { urlText: 'yoursite.com/pricing', label: 'Pricing' },
  { urlText: 'yoursite.com/product', label: 'Product' },
];

const STEP_COUNT = 7;

export function CopyFirstVisual() {
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
        // Cursor pause first, then faster for content, slower for wireframe pivot
        const delays = [500, 420, 380, 400, 450, 380, 350];
        const delay = delays[currentStep] ?? 380;
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
        &lt;/&gt;
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
              <path d="M2 4h12M2 8h12M2 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="text-[8px] text-surface-400 font-medium tracking-wide">
              {scenario.urlText}
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 h-[260px] overflow-hidden relative">
          {/* Step 0: Blinking cursor (always visible while building, before step 1) */}
          <div
            className="absolute top-5 left-5"
            style={{
              opacity: step === 0 && phase === 'building' ? 1 : 0,
              transition: 'opacity 200ms ease',
            }}
          >
            <div
              className="w-[2px] h-4 rounded-full animate-pulse"
              style={{ backgroundColor: 'var(--color-primary-500)' }}
            />
          </div>

          {/* Step 1: Headline + H1 annotation */}
          <div style={stepStyle(0)}>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1">
                <div className="h-2.5 w-[85%] rounded-full" style={{ backgroundColor: 'var(--color-surface-800)' }} />
              </div>
              {/* Annotation pill */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <div className="w-4 border-t" style={{ borderColor: 'var(--color-primary-300)', borderStyle: 'dashed' }} />
                <span
                  className="text-[7px] font-semibold px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: 'var(--color-primary-100)', color: 'var(--color-primary-600)' }}
                >
                  H1
                </span>
              </div>
            </div>
          </div>

          {/* Step 2: Subheadline + body lines + "Value prop" annotation */}
          <div style={stepStyle(1)}>
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-1 space-y-1.5">
                <div className="h-1.5 w-[65%] rounded-full" style={{ backgroundColor: 'var(--color-surface-300)' }} />
                <div className="h-1 w-[90%] rounded-full" style={{ backgroundColor: 'var(--color-surface-200)' }} />
                <div className="h-1 w-[78%] rounded-full" style={{ backgroundColor: 'var(--color-surface-100)' }} />
                <div className="h-1 w-[84%] rounded-full" style={{ backgroundColor: 'var(--color-surface-200)' }} />
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                <div className="w-4 border-t" style={{ borderColor: 'var(--color-primary-300)', borderStyle: 'dashed' }} />
                <span
                  className="text-[6px] font-semibold px-1.5 py-0.5 rounded whitespace-nowrap"
                  style={{ backgroundColor: 'var(--color-primary-100)', color: 'var(--color-primary-500)' }}
                >
                  Value prop
                </span>
              </div>
            </div>
          </div>

          {/* Step 3: CTA buttons + "CTA" annotation */}
          <div style={stepStyle(2)}>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2 flex-1">
                <div className="h-5 w-[38%] rounded" style={{ backgroundColor: 'var(--color-primary-500)' }} />
                <div
                  className="h-5 w-[30%] rounded"
                  style={{ border: '1px solid var(--color-surface-300)', backgroundColor: 'rgba(255,255,255,0.5)' }}
                />
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <div className="w-4 border-t" style={{ borderColor: 'var(--color-primary-300)', borderStyle: 'dashed' }} />
                <span
                  className="text-[7px] font-semibold px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: 'var(--color-primary-100)', color: 'var(--color-primary-600)' }}
                >
                  CTA
                </span>
              </div>
            </div>
          </div>

          {/* Step 4: PIVOT — Wireframe structure fades in AROUND the copy */}
          <div style={stepStyle(3)}>
            {/* Nav bar skeleton at top (absolutely positioned above the copy) */}
            <div
              className="absolute top-0 left-0 right-0 h-6 flex items-center px-4 gap-2"
              style={{ backgroundColor: 'var(--color-surface-50)', borderBottom: '1px solid var(--color-surface-100)' }}
            >
              <div className="w-8 h-2 rounded-sm" style={{ backgroundColor: 'var(--color-surface-200)' }} />
              <div className="ml-auto flex gap-2">
                <div className="w-6 h-1.5 rounded-sm" style={{ backgroundColor: 'var(--color-surface-100)' }} />
                <div className="w-6 h-1.5 rounded-sm" style={{ backgroundColor: 'var(--color-surface-100)' }} />
                <div className="w-6 h-1.5 rounded-sm" style={{ backgroundColor: 'var(--color-surface-100)' }} />
              </div>
            </div>

            {/* Left gutter line */}
            <div
              className="absolute top-6 bottom-0 left-2"
              style={{ width: 1, backgroundColor: 'var(--color-surface-100)' }}
            />
            {/* Right gutter line */}
            <div
              className="absolute top-6 bottom-0 right-2"
              style={{ width: 1, backgroundColor: 'var(--color-surface-100)' }}
            />

            {/* Horizontal divider below CTA */}
            <div className="mt-0">
              <div className="h-px w-full" style={{ backgroundColor: 'var(--color-surface-100)' }} />
            </div>
          </div>

          {/* Step 5: Social proof row + "Proof" annotation */}
          <div style={stepStyle(4)}>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-2 flex-1">
                <div className="flex -space-x-1">
                  <div className="w-4 h-4 rounded-full border border-white" style={{ backgroundColor: 'var(--color-surface-200)' }} />
                  <div className="w-4 h-4 rounded-full border border-white" style={{ backgroundColor: 'var(--color-surface-300)' }} />
                  <div className="w-4 h-4 rounded-full border border-white" style={{ backgroundColor: 'var(--color-surface-200)' }} />
                </div>
                <div className="h-1 w-12 rounded-full" style={{ backgroundColor: 'var(--color-surface-200)' }} />
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <div className="w-4 border-t" style={{ borderColor: 'var(--color-primary-300)', borderStyle: 'dashed' }} />
                <span
                  className="text-[7px] font-semibold px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: 'var(--color-primary-100)', color: 'var(--color-primary-500)' }}
                >
                  Proof
                </span>
              </div>
            </div>
          </div>

          {/* Step 6: Conversion metric inside frame */}
          <div style={stepStyle(5)}>
            <div className="absolute bottom-3 right-3">
              <div
                className="px-2 py-1 rounded-lg border flex items-center gap-1.5"
                style={{
                  backgroundColor: 'white',
                  borderColor: 'var(--color-surface-200)',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                }}
              >
                <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="none">
                  <path d="M5 8V2M5 2L2.5 4.5M5 2l2.5 2.5" stroke="var(--color-success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span
                  className="text-[10px] font-semibold"
                  style={{ color: 'var(--color-success)', fontFamily: 'var(--font-mono, ui-monospace, monospace)' }}
                >
                  4.7%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Badge — "Copy-led" checkmark (top right) */}
      <div
        className="absolute -top-3 -right-4 bg-white rounded-xl border border-surface-100 px-2.5 py-1.5 flex items-center gap-1.5"
        style={{
          ...badgeStyle(100),
          boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
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
        <span
          className="text-[9px] font-semibold"
          style={{ color: 'var(--color-success)' }}
        >
          Copy-led
        </span>
      </div>

      {/* Floating Badge — Conversion result (bottom left) */}
      <div
        className="absolute -bottom-2 -left-3 bg-white rounded-xl border border-surface-100 px-2.5 py-1.5"
        style={{
          ...badgeStyle(250),
          boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
        }}
      >
        <span className="text-[7px] text-surface-400 font-medium block">
          Conversion
        </span>
        <div className="flex items-center gap-1 mt-0.5">
          <span
            className="text-xs font-semibold text-surface-900"
            style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)' }}
          >
            288%
          </span>
          <span className="text-[7px] text-surface-400">best result</span>
        </div>
      </div>

      {/* Status line + scenario dots */}
      <div className="relative h-6 mt-4">
        <div
          className="absolute inset-0 flex items-center justify-center gap-2"
          style={{
            opacity: phase === 'building' && step > 0 ? 1 : 0,
            transition: 'opacity 250ms ease',
          }}
        >
          <div className="h-1.5 w-1.5 rounded-full bg-primary-500 animate-pulse" />
          <span className="text-xs font-medium text-surface-500">
            Writing copy...
          </span>
        </div>
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
            Copy leads, page follows
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
