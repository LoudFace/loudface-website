'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Animated hero visual: a browser frame showing design tokens crystallizing
 * into components, then composing into a full page layout.
 * Demonstrates the Design System → Components → Pages workflow.
 */

const SCENARIOS = [
  { urlText: 'design.fig/tokens', label: 'Tokens' },
  { urlText: 'design.fig/components', label: 'Components' },
  { urlText: 'yoursite.com', label: 'Live' },
];

const STEP_COUNT = 7;

export function DesignSystemVisual() {
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
        const delays = [550, 420, 380, 400, 450, 380, 350];
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
        className="absolute -top-4 left-3 text-[11px] font-mono text-surface-300 select-none"
        style={{ opacity: isFading ? 0 : 0.5, transition: 'opacity 400ms ease' }}
      >
        Ds
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
              <rect x="2" y="2" width="5" height="5" rx="1" fill="currentColor" opacity="0.5" />
              <rect x="9" y="2" width="5" height="5" rx="1" fill="currentColor" opacity="0.5" />
              <rect x="2" y="9" width="5" height="5" rx="1" fill="currentColor" opacity="0.5" />
              <rect x="9" y="9" width="5" height="5" rx="1" fill="currentColor" opacity="0.5" />
            </svg>
            <span className="text-[8px] text-surface-400 font-medium tracking-wide">
              {scenario.urlText}
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 h-[260px] overflow-hidden relative">

          {/* Step 0: Token palette row */}
          <div style={stepStyle(0)}>
            <div className="flex items-center justify-center gap-2 mb-2">
              {/* Color token */}
              <div
                className="flex items-center gap-1 px-1.5 py-1 rounded border"
                style={{ backgroundColor: 'var(--color-surface-50)', borderColor: 'var(--color-surface-200)' }}
              >
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'var(--color-primary-500)' }} />
                <span className="text-[6px] font-mono" style={{ color: 'var(--color-surface-500)' }}>#6366F1</span>
              </div>
              {/* Type token */}
              <div
                className="flex items-center gap-1 px-1.5 py-1 rounded border"
                style={{ backgroundColor: 'var(--color-surface-50)', borderColor: 'var(--color-surface-200)' }}
              >
                <span className="text-[8px] font-heading font-medium" style={{ color: 'var(--color-surface-700)' }}>Aa</span>
                <span className="text-[6px] font-mono" style={{ color: 'var(--color-surface-500)' }}>16/24</span>
              </div>
              {/* Spacing token */}
              <div
                className="flex items-center gap-1 px-1.5 py-1 rounded border"
                style={{ backgroundColor: 'var(--color-surface-50)', borderColor: 'var(--color-surface-200)' }}
              >
                <div className="flex gap-px">
                  <div className="w-0.5 h-2 rounded-sm" style={{ backgroundColor: 'var(--color-primary-300)' }} />
                  <div className="w-0.5 h-3 rounded-sm" style={{ backgroundColor: 'var(--color-primary-400)' }} />
                  <div className="w-0.5 h-2 rounded-sm" style={{ backgroundColor: 'var(--color-primary-300)' }} />
                </div>
                <span className="text-[6px] font-mono" style={{ color: 'var(--color-surface-500)' }}>8px</span>
              </div>
              {/* Radius token */}
              <div
                className="flex items-center gap-1 px-1.5 py-1 rounded border"
                style={{ backgroundColor: 'var(--color-surface-50)', borderColor: 'var(--color-surface-200)' }}
              >
                <div className="w-3 h-3 border-2 rounded-md" style={{ borderColor: 'var(--color-primary-400)' }} />
                <span className="text-[6px] font-mono" style={{ color: 'var(--color-surface-500)' }}>12px</span>
              </div>
            </div>
            {/* Dashed divider below tokens */}
            <div className="border-t border-dashed mx-4 mb-2" style={{ borderColor: 'var(--color-surface-200)' }} />
          </div>

          {/* Step 1: Component blocks materialize below divider + connection lines */}
          <div style={stepStyle(1)}>
            <div className="flex items-center justify-center gap-3 mb-3">
              {/* Button component */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-14 h-4 rounded" style={{ backgroundColor: 'var(--color-primary-500)' }} />
                <span className="text-[6px] font-mono" style={{ color: 'var(--color-surface-400)' }}>Button</span>
              </div>
              {/* Card component */}
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-16 h-8 rounded border p-1"
                  style={{ backgroundColor: 'white', borderColor: 'var(--color-surface-200)' }}
                >
                  <div className="h-1 w-[80%] rounded-full mb-1" style={{ backgroundColor: 'var(--color-surface-300)' }} />
                  <div className="h-0.5 w-[60%] rounded-full" style={{ backgroundColor: 'var(--color-surface-200)' }} />
                </div>
                <span className="text-[6px] font-mono" style={{ color: 'var(--color-surface-400)' }}>Card</span>
              </div>
              {/* Input component */}
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-14 h-4 rounded border flex items-center px-1"
                  style={{ borderColor: 'var(--color-surface-300)', backgroundColor: 'white' }}
                >
                  <div className="h-0.5 w-[60%] rounded-full" style={{ backgroundColor: 'var(--color-surface-200)' }} />
                </div>
                <span className="text-[6px] font-mono" style={{ color: 'var(--color-surface-400)' }}>Input</span>
              </div>
            </div>
            {/* Connection lines from tokens to components */}
            <svg className="absolute top-9 left-0 w-full h-8 pointer-events-none" viewBox="0 0 340 32" fill="none">
              <path d="M85,0 C85,16 100,16 110,24" stroke="var(--color-primary-300)" strokeWidth="0.75" strokeDasharray="3 2" />
              <path d="M170,0 C170,16 170,16 170,24" stroke="var(--color-primary-300)" strokeWidth="0.75" strokeDasharray="3 2" />
              <path d="M255,0 C255,16 240,16 230,24" stroke="var(--color-primary-300)" strokeWidth="0.75" strokeDasharray="3 2" />
            </svg>
          </div>

          {/* Step 2: Tokens fade, Nav + Hero wireframe forms */}
          <div style={{
            ...stepStyle(2),
            position: step > 2 ? 'relative' : undefined,
          }}>
            {/* Nav bar */}
            <div className="flex items-center gap-2 mb-2 px-1">
              <div className="w-5 h-3 rounded-sm" style={{ backgroundColor: 'var(--color-primary-500)' }} />
              <div className="flex gap-1.5 ml-auto">
                <div className="w-6 h-1.5 rounded-sm" style={{ backgroundColor: 'var(--color-surface-100)' }} />
                <div className="w-6 h-1.5 rounded-sm" style={{ backgroundColor: 'var(--color-surface-100)' }} />
                <div className="w-6 h-1.5 rounded-sm" style={{ backgroundColor: 'var(--color-surface-100)' }} />
              </div>
              <div
                className="w-10 h-3 rounded-sm flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-primary-500)' }}
              >
                <div className="h-0.5 w-6 rounded-full bg-white" />
              </div>
            </div>
            {/* Hero headline skeleton */}
            <div className="px-1 mb-1">
              <div className="h-2.5 w-[80%] rounded-full" style={{ backgroundColor: 'var(--color-surface-800)' }} />
            </div>
            {/* Subhead */}
            <div className="px-1 mb-2 space-y-1">
              <div className="h-1 w-[60%] rounded-full" style={{ backgroundColor: 'var(--color-surface-200)' }} />
            </div>
            {/* CTA buttons with shimmer */}
            <div className="flex items-center gap-2 px-1 mb-2">
              <div
                className="h-4 w-14 rounded relative overflow-hidden"
                style={{ backgroundColor: 'var(--color-primary-500)' }}
              >
                {/* Shimmer sweep */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)',
                    animation: step > 2 && !isFading ? 'shimmer 0.8s ease-out 0.2s 1' : 'none',
                  }}
                />
              </div>
              <div
                className="h-4 w-12 rounded"
                style={{ border: '1px solid var(--color-surface-300)', backgroundColor: 'rgba(255,255,255,0.5)' }}
              />
            </div>
          </div>

          {/* Step 3: Card grid section */}
          <div style={stepStyle(3)}>
            <div className="flex gap-2 px-1 mb-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex-1 rounded border p-1.5"
                  style={{
                    borderColor: 'var(--color-surface-200)',
                    backgroundColor: 'white',
                  }}
                >
                  <div
                    className="w-full h-5 rounded-sm mb-1"
                    style={{ backgroundColor: 'var(--color-surface-100)' }}
                  />
                  <div className="h-1 w-[75%] rounded-full mb-0.5" style={{ backgroundColor: 'var(--color-surface-300)' }} />
                  <div className="h-0.5 w-[55%] rounded-full" style={{ backgroundColor: 'var(--color-surface-200)' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Step 4: Stats row */}
          <div style={stepStyle(4)}>
            <div className="flex gap-4 px-1 justify-center mb-2">
              {[
                { num: '200+', label: 'Projects' },
                { num: '90+', label: 'Score' },
                { num: '<2s', label: 'Load' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <span
                    className="text-[9px] font-semibold block"
                    style={{ color: 'var(--color-surface-800)', fontFamily: 'var(--font-mono, ui-monospace, monospace)' }}
                  >
                    {stat.num}
                  </span>
                  <span className="text-[6px]" style={{ color: 'var(--color-surface-400)' }}>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Step 5: Dark CTA section + token sidebar annotations */}
          <div style={stepStyle(5)}>
            <div
              className="mx-1 rounded-lg px-3 py-2 relative"
              style={{ backgroundColor: 'var(--color-surface-900)' }}
            >
              <div className="h-1.5 w-[65%] rounded-full mb-1" style={{ backgroundColor: 'var(--color-surface-500)' }} />
              <div className="h-1 w-[50%] rounded-full mb-1.5" style={{ backgroundColor: 'var(--color-surface-700)' }} />
              <div className="h-3 w-12 rounded" style={{ backgroundColor: 'var(--color-primary-500)' }} />
              {/* Radial glow */}
              <div
                className="absolute inset-0 rounded-lg pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(99,102,241,0.12), transparent 70%)' }}
              />
            </div>

            {/* Token sidebar annotations — right margin */}
            <div className="absolute right-1 top-[55%] flex flex-col gap-1.5">
              {[
                { label: 'color: primary-500' },
                { label: 'font: heading/md' },
                { label: 'space: 8-grid' },
              ].map((annotation) => (
                <div key={annotation.label} className="flex items-center gap-1">
                  <div className="w-3 border-t" style={{ borderColor: 'var(--color-primary-300)', borderStyle: 'dashed' }} />
                  <span
                    className="text-[5.5px] font-mono font-semibold px-1 py-0.5 rounded whitespace-nowrap"
                    style={{
                      backgroundColor: 'var(--color-primary-100)',
                      color: 'var(--color-primary-600)',
                    }}
                  >
                    {annotation.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Step 6: System completion — border pulse + Ds watermark */}
          <div style={stepStyle(6)}>
            <div className="absolute bottom-2 right-3">
              <span
                className="text-[7px] font-mono font-medium select-none"
                style={{ color: 'var(--color-primary-300)' }}
              >
                Ds
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Badge — Components count (top right) */}
      <div
        className="absolute -top-3 -right-4 bg-white rounded-xl border border-surface-100 px-2.5 py-1.5 flex items-center gap-1.5"
        style={{
          ...badgeStyle(100),
          boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
        }}
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="1" width="6" height="6" rx="1.5" fill="var(--color-primary-500)" fillOpacity="0.2" stroke="var(--color-primary-500)" strokeWidth="1" />
          <rect x="9" y="1" width="6" height="6" rx="1.5" fill="var(--color-primary-500)" fillOpacity="0.2" stroke="var(--color-primary-500)" strokeWidth="1" />
          <rect x="1" y="9" width="6" height="6" rx="1.5" fill="var(--color-primary-500)" fillOpacity="0.2" stroke="var(--color-primary-500)" strokeWidth="1" />
          <rect x="9" y="9" width="6" height="6" rx="1.5" fill="var(--color-primary-500)" fillOpacity="0.2" stroke="var(--color-primary-500)" strokeWidth="1" />
        </svg>
        <span
          className="text-[10px] font-semibold"
          style={{ color: 'var(--color-surface-900)', fontFamily: 'var(--font-mono, ui-monospace, monospace)' }}
        >
          42
        </span>
        <span className="text-[8px] text-surface-400">components</span>
      </div>

      {/* Floating Badge — Consistency (bottom left) */}
      <div
        className="absolute -bottom-2 -left-3 bg-white rounded-xl border border-surface-100 px-2.5 py-1.5"
        style={{
          ...badgeStyle(250),
          boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
        }}
      >
        <span className="text-[7px] text-surface-400 font-medium block">
          Consistency
        </span>
        <div className="flex items-center gap-1 mt-0.5">
          <span
            className="text-xs font-semibold text-surface-900"
            style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)' }}
          >
            100%
          </span>
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
            Applying tokens...
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
            System ready
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

      {/* Shimmer keyframe */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
