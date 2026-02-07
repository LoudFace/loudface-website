'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Animated hero visual: a browser frame where website sections
 * assemble one by one, then glow with floating metric badges on completion.
 * Tells the story: we build → you get results.
 */

const SECTION_COUNT = 5;

export function ComponentAssemblyVisual() {
  const [builtCount, setBuiltCount] = useState(0);
  const [phase, setPhase] = useState<'building' | 'complete' | 'fading'>('building');
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const cycle = useCallback(() => {
    let count = 0;
    setBuiltCount(0);
    setPhase('building');

    const buildNext = () => {
      count++;
      setBuiltCount(count);
      if (count < SECTION_COUNT) {
        timerRef.current = setTimeout(buildNext, 480);
      } else {
        timerRef.current = setTimeout(() => {
          setPhase('complete');
          timerRef.current = setTimeout(() => {
            setPhase('fading');
            timerRef.current = setTimeout(cycle, 700);
          }, 2600);
        }, 350);
      }
    };

    timerRef.current = setTimeout(buildNext, 600);
  }, []);

  useEffect(() => {
    cycle();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [cycle]);

  const sectionStyle = (index: number): React.CSSProperties => ({
    opacity: builtCount > index ? (phase === 'fading' ? 0 : 1) : 0,
    transform: builtCount > index
      ? phase === 'fading'
        ? 'translateY(-4px) scale(0.98)'
        : 'translateY(0)'
      : 'translateY(12px)',
    transition:
      phase === 'fading'
        ? `opacity 400ms ease ${(SECTION_COUNT - 1 - index) * 60}ms, transform 400ms ease ${(SECTION_COUNT - 1 - index) * 60}ms`
        : 'opacity 350ms ease, transform 450ms cubic-bezier(.22,1,.36,1)',
  });

  const isComplete = phase === 'complete';
  const isFading = phase === 'fading';

  const badgeStyle = (delay: number): React.CSSProperties => ({
    opacity: isComplete ? 1 : 0,
    transform: isComplete ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.92)',
    transition: `opacity 400ms ease ${delay}ms, transform 400ms cubic-bezier(.22,1,.36,1) ${delay}ms`,
  });

  return (
    <div className="w-full max-w-[360px] mx-auto relative" aria-hidden="true">
      {/* Decorative floating elements */}
      <div
        className="absolute -top-5 left-2 text-[11px] font-mono text-surface-300 select-none"
        style={{ opacity: isFading ? 0 : 0.5, transition: 'opacity 400ms ease' }}
      >
        {'</>'}
      </div>
      <div
        className="absolute top-10 -right-2 w-2 h-2 rounded-full bg-primary-300"
        style={{ opacity: isFading ? 0 : 0.35, transition: 'opacity 400ms ease' }}
      />
      <div
        className="absolute bottom-20 -left-2 w-1.5 h-1.5 rounded-sm bg-primary-400"
        style={{ opacity: isFading ? 0 : 0.3, transition: 'opacity 400ms ease' }}
      />
      <div
        className="absolute -bottom-2 right-6 text-[10px] font-mono text-surface-200 select-none"
        style={{ opacity: isFading ? 0 : 0.4, transition: 'opacity 400ms ease' }}
      >
        {'{ }'}
      </div>

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
          <div className="flex-1 h-5 bg-white rounded-md border border-surface-200 flex items-center justify-center gap-1">
            <svg className="w-2.5 h-2.5 text-surface-400" viewBox="0 0 12 12" fill="none">
              <path
                d="M9 5V4a3 3 0 0 0-6 0v1M3 5h6a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
              />
            </svg>
            <span className="text-[8px] text-surface-400 font-medium tracking-wide">
              yoursite.webflow.io
            </span>
          </div>
        </div>

        {/* Page Canvas */}
        <div className="p-2.5 flex flex-col gap-2">
          {/* 1. Nav */}
          <div style={sectionStyle(0)}>
            <div className="flex items-center justify-between px-2.5 py-2 rounded-lg bg-surface-50">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-primary-500 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-sm bg-white/60" />
                </div>
                <div className="h-1.5 w-11 bg-surface-300 rounded-full" />
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-1 w-6 bg-surface-200 rounded-full" />
                <div className="h-1 w-6 bg-surface-200 rounded-full" />
                <div className="h-1 w-6 bg-surface-200 rounded-full" />
                <div className="h-5 w-14 bg-surface-900 rounded-full flex items-center justify-center">
                  <div className="h-1 w-8 bg-white/70 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Hero — gradient bg + dot grid + badge + heading + CTAs */}
          <div style={sectionStyle(1)}>
            <div
              className="rounded-lg overflow-hidden relative"
              style={{
                background:
                  'linear-gradient(135deg, var(--color-primary-50), var(--color-surface-50))',
              }}
            >
              {/* Dot grid pattern layer */}
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    'radial-gradient(var(--color-surface-200) 0.7px, transparent 0.7px)',
                  backgroundSize: '10px 10px',
                }}
              />
              <div className="relative px-3.5 py-3.5">
                {/* Badge pill */}
                <div className="inline-flex items-center gap-1 h-3.5 px-2 rounded-full bg-primary-100/80 mb-2">
                  <div className="w-1 h-1 rounded-full bg-primary-500" />
                  <div className="h-0.5 w-8 bg-primary-300 rounded-full" />
                </div>
                {/* Heading lines */}
                <div className="space-y-1.5 mb-2">
                  <div className="h-3 w-[90%] bg-surface-800 rounded-full" />
                  <div className="h-3 w-[65%] bg-surface-800 rounded-full" />
                </div>
                {/* Description lines */}
                <div className="space-y-1 mb-3">
                  <div className="h-1.5 w-full bg-surface-300 rounded-full" />
                  <div className="h-1.5 w-[85%] bg-surface-200 rounded-full" />
                </div>
                {/* CTA buttons */}
                <div className="flex gap-2">
                  <div className="h-6 w-20 bg-primary-600 rounded-md flex items-center justify-center">
                    <div className="h-1 w-10 bg-white/80 rounded-full" />
                  </div>
                  <div className="h-6 w-16 rounded-md border border-surface-300 bg-white/50 flex items-center justify-center">
                    <div className="h-1 w-8 bg-surface-500 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Stats Row — real numbers (mixed realism) */}
          <div style={sectionStyle(2)}>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { value: '50+', label: 'Projects' },
                { value: '98%', label: 'Satisfaction' },
                { value: '< 2s', label: 'Load time' },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="text-center py-2 rounded-lg bg-surface-50 border border-surface-100"
                >
                  <div
                    className="text-[10px] font-semibold text-surface-800 leading-tight"
                    style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)' }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-[6px] text-surface-400 mt-0.5 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Cards — icon circles + gradient headers */}
          <div style={sectionStyle(3)}>
            <div className="grid grid-cols-3 gap-1.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-lg bg-surface-50 overflow-hidden">
                  <div
                    className="p-2 flex items-center gap-1.5"
                    style={{
                      background:
                        i === 0
                          ? 'linear-gradient(135deg, var(--color-primary-100), var(--color-primary-50))'
                          : i === 1
                            ? 'linear-gradient(135deg, var(--color-surface-100), var(--color-surface-50))'
                            : 'var(--color-surface-50)',
                    }}
                  >
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        i === 0
                          ? 'bg-primary-500'
                          : i === 1
                            ? 'bg-surface-400'
                            : 'bg-surface-300'
                      }`}
                    >
                      <div className="w-1.5 h-1.5 rounded-sm bg-white/80" />
                    </div>
                    <div className="h-1 w-8 bg-surface-300/70 rounded-full" />
                  </div>
                  <div className="p-2 space-y-1">
                    <div className="h-1 w-full bg-surface-200 rounded-full" />
                    <div className="h-1 w-3/4 bg-surface-100 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. CTA — dark section with gradient glow */}
          <div style={sectionStyle(4)}>
            <div className="px-4 py-3.5 rounded-lg bg-surface-900 text-center relative overflow-hidden">
              {/* Gradient glow accent */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-6"
                style={{
                  background:
                    'radial-gradient(ellipse, rgba(99,102,241,0.3), transparent)',
                  filter: 'blur(4px)',
                }}
              />
              <div className="relative">
                <div className="h-2 w-24 bg-white/80 rounded-full mx-auto mb-1.5" />
                <div className="h-1.5 w-32 bg-surface-500 rounded-full mx-auto mb-2.5" />
                <div className="h-5 w-18 bg-primary-500 rounded-md mx-auto flex items-center justify-center">
                  <div className="h-1 w-10 bg-white/80 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Metric Badges — appear on completion */}

      {/* Performance Gauge — top right */}
      <div
        className="absolute -top-4 -right-5 bg-white rounded-xl border border-surface-100 p-2 flex flex-col items-center"
        style={{
          ...badgeStyle(100),
          boxShadow:
            '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
        }}
      >
        <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none">
          {/* Track arc (270 degrees) */}
          <circle
            cx="20"
            cy="20"
            r="15"
            stroke="var(--color-surface-100)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="70.7 94.25"
            transform="rotate(135 20 20)"
          />
          {/* Fill arc (99% of track) */}
          <circle
            cx="20"
            cy="20"
            r="15"
            stroke="var(--color-success)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="70 94.25"
            transform="rotate(135 20 20)"
          />
          {/* Score */}
          <text
            x="20"
            y="22"
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            fill="var(--color-surface-900)"
            style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)' }}
          >
            99
          </text>
        </svg>
        <span className="text-[7px] text-surface-400 font-medium mt-0.5">
          Performance
        </span>
      </div>

      {/* Conversion Metric — bottom left */}
      <div
        className="absolute -bottom-3 -left-4 bg-white rounded-xl border border-surface-100 px-3 py-2"
        style={{
          ...badgeStyle(250),
          boxShadow:
            '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
        }}
      >
        <span className="text-[7px] text-surface-400 font-medium block">
          Conversions
        </span>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span
            className="text-sm font-semibold text-surface-900"
            style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)' }}
          >
            +147%
          </span>
          {/* Mini sparkline */}
          <svg className="w-8 h-3" viewBox="0 0 32 12" fill="none">
            <path
              d="M1 11 Q6 9 10 7 T18 4 T26 2 T31 1"
              stroke="var(--color-success)"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
            {/* Endpoint glow */}
            <circle cx="31" cy="1" r="2.5" fill="var(--color-success)" fillOpacity="0.2" />
            <circle cx="31" cy="1" r="1.5" fill="var(--color-success)" />
          </svg>
        </div>
      </div>

      {/* Status indicator */}
      <div className="relative h-6 mt-4">
        <div
          className="absolute inset-0 flex items-center justify-center gap-2"
          style={{
            opacity: phase === 'building' && builtCount > 0 ? 1 : 0,
            transition: 'opacity 250ms ease',
          }}
        >
          <div className="h-1.5 w-1.5 rounded-full bg-primary-500 animate-pulse" />
          <span className="text-xs font-medium text-surface-500">
            Assembling components...
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
            <circle
              cx="8"
              cy="8"
              r="7"
              fill="var(--color-success)"
              fillOpacity="0.15"
            />
            <path
              d="M5 8l2 2 4-4"
              stroke="var(--color-success)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-xs font-medium text-surface-500">
            Ready to launch
          </span>
        </div>
      </div>
    </div>
  );
}
