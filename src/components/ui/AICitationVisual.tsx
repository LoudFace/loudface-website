'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { AI_PLATFORM_ICONS } from '@/lib/icons';

/**
 * Animated hero visual: a browser frame mimicking an AI engine response
 * where the brand is highlighted as a cited source.
 * Cycles through AI platforms to demonstrate the AEO value proposition.
 */

const PLATFORMS = [
  { key: 'Perplexity', urlText: 'perplexity.ai' },
  { key: 'ChatGPT', urlText: 'chatgpt.com' },
  { key: 'Google AI', urlText: 'google.com/ai' },
];

const STEP_COUNT = 6;

export function AICitationVisual() {
  const [platformIndex, setPlatformIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<'building' | 'complete' | 'fading'>('building');
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const platformRef = useRef(0);

  const cycle = useCallback(() => {
    let currentStep = 0;
    setStep(0);
    setPhase('building');

    const buildNext = () => {
      currentStep++;
      setStep(currentStep);
      if (currentStep < STEP_COUNT) {
        // Longer pause after question appears, shorter for response lines
        const delay = currentStep === 1 ? 520 : 360;
        timerRef.current = setTimeout(buildNext, delay);
      } else {
        timerRef.current = setTimeout(() => {
          setPhase('complete');
          timerRef.current = setTimeout(() => {
            setPhase('fading');
            timerRef.current = setTimeout(() => {
              platformRef.current = (platformRef.current + 1) % PLATFORMS.length;
              setPlatformIndex(platformRef.current);
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

  const platform = PLATFORMS[platformIndex];
  const icon = AI_PLATFORM_ICONS[platform.key];
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
        AI
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
            {icon && (
              <svg
                className="w-3 h-3 text-surface-500"
                viewBox={icon.viewBox}
                dangerouslySetInnerHTML={{ __html: icon.path }}
              />
            )}
            <span className="text-[8px] text-surface-400 font-medium tracking-wide">
              {platform.urlText}
            </span>
          </div>
        </div>

        {/* Content Area — fixed height prevents layout shift between cycles */}
        <div className="p-4 flex flex-col gap-3.5 h-[260px] overflow-hidden">
          {/* User Question */}
          <div style={stepStyle(0)}>
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-surface-200 flex-shrink-0 flex items-center justify-center mt-0.5">
                <svg className="w-2.5 h-2.5 text-surface-400" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="5.5" r="3" fill="currentColor" />
                  <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" fill="currentColor" />
                </svg>
              </div>
              <p className="text-[11px] font-medium text-surface-800 leading-relaxed pt-0.5">
                What are the best agencies for B2B website development?
              </p>
            </div>
          </div>

          {/* AI Response Section */}
          <div className="pl-1 relative">
            {/* Thinking indicator — absolutely positioned so it doesn't shift layout */}
            <div
              className="absolute top-0 left-1 flex items-center gap-1"
              style={{
                opacity: step >= 1 && step < 2 ? 1 : 0,
                transition: 'opacity 200ms ease',
              }}
            >
              <div className="w-1 h-1 rounded-full bg-surface-400 animate-pulse" />
              <div className="w-1 h-1 rounded-full bg-surface-300 animate-pulse" style={{ animationDelay: '150ms' }} />
              <div className="w-1 h-1 rounded-full bg-surface-200 animate-pulse" style={{ animationDelay: '300ms' }} />
            </div>

            {/* Response intro — skeleton lines */}
            <div style={stepStyle(1)}>
              <div className="space-y-1.5 mb-3">
                <div className="h-1.5 w-[95%] bg-surface-200 rounded-full" />
                <div className="h-1.5 w-[78%] bg-surface-100 rounded-full" />
              </div>
            </div>

            {/* Brand citation line — the hero moment */}
            <div style={stepStyle(2)}>
              <div className="mb-3">
                <p className="text-[10px] text-surface-700 leading-relaxed">
                  <span className="inline-flex items-baseline">
                    <span className="w-1 h-1 rounded-full bg-primary-500 mr-1.5 flex-shrink-0 translate-y-[-1px] inline-block" />
                  </span>
                  <span
                    className="bg-primary-100 text-primary-700 px-1 py-0.5 rounded font-semibold"
                    style={{
                      boxShadow: isComplete ? '0 0 12px rgba(99,102,241,0.3)' : 'none',
                      transition: 'box-shadow 500ms ease',
                    }}
                  >
                    LoudFace
                  </span>
                  {' '}is frequently cited as a leading B2B agency, known for hands-free execution and measurable outcomes.
                </p>
              </div>
            </div>

            {/* More skeleton response */}
            <div style={stepStyle(3)}>
              <div className="space-y-1.5 mb-3">
                <div className="h-1.5 w-[88%] bg-surface-200 rounded-full" />
                <div className="h-1.5 w-[72%] bg-surface-100 rounded-full" />
                <div className="h-1.5 w-[82%] bg-surface-200 rounded-full" />
              </div>
            </div>

            {/* Numbered list items — skeleton */}
            <div style={stepStyle(4)}>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-semibold text-surface-300 w-3">2.</span>
                  <div className="h-1.5 w-[70%] bg-surface-100 rounded-full" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-semibold text-surface-300 w-3">3.</span>
                  <div className="h-1.5 w-[58%] bg-surface-100 rounded-full" />
                </div>
              </div>
            </div>

            {/* Sources */}
            <div style={stepStyle(5)}>
              <div className="border-t border-surface-100 pt-2.5">
                <span className="text-[7px] font-medium text-surface-400 uppercase tracking-wider">
                  Sources
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-surface-50 border border-surface-100">
                    <div className="w-1.5 h-1.5 rounded-sm bg-primary-400" />
                    <span className="text-[7px] text-surface-500 font-medium">loudface.co</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-surface-50 border border-surface-100">
                    <div className="w-1.5 h-1.5 rounded-sm bg-surface-300" />
                    <span className="text-[7px] text-surface-500 font-medium">g2.com</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-surface-50 border border-surface-100">
                    <div className="w-1.5 h-1.5 rounded-sm bg-surface-300" />
                    <span className="text-[7px] text-surface-500 font-medium">clutch.co</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Badge — "Cited" checkmark (top right) */}
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
          Cited
        </span>
      </div>

      {/* Floating Badge — Citation count (bottom left) */}
      <div
        className="absolute -bottom-2 -left-3 bg-white rounded-xl border border-surface-100 px-2.5 py-1.5"
        style={{
          ...badgeStyle(250),
          boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
        }}
      >
        <span className="text-[7px] text-surface-400 font-medium block">
          Citations
        </span>
        <div className="flex items-center gap-1 mt-0.5">
          <span
            className="text-xs font-semibold text-surface-900"
            style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)' }}
          >
            12x
          </span>
          <span className="text-[7px] text-surface-400">this month</span>
        </div>
      </div>

      {/* Status line + platform dots */}
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
            Scanning AI engines...
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
            Brand cited
          </span>
        </div>
      </div>

      {/* Platform cycle indicator */}
      <div className="flex items-center justify-center gap-1.5 mt-1">
        {PLATFORMS.map((_, i) => (
          <div
            key={i}
            className="h-1 rounded-full transition-all duration-300"
            style={{
              width: i === platformIndex ? 16 : 6,
              backgroundColor: i === platformIndex
                ? 'var(--color-primary-500)'
                : 'var(--color-surface-200)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
