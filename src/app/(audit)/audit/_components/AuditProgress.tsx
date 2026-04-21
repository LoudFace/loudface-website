'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface AuditProgressProps {
  id: string;
  initialProgress: number;
  initialPhase: string;
}

const PHASE_ICONS: Record<string, string> = {
  'Starting audit...': '01',
  'Reading your website...': '01',
  'Analyzing brand recognition across AI platforms...': '01',
  'Testing how AI platforms perceive your brand...': '01',
  'Synthesizing Phase 1 findings...': '01',
  'Identifying your competitors...': '02',
  'Measuring competitive recommendation rates...': '02',
  'Testing category discovery queries...': '03',
  'Checking your visibility in unbranded searches...': '03',
  'Calculating your audit scores...': '04',
  'Audit complete': '04',
};

function getPhaseNumber(phase: string): string {
  return PHASE_ICONS[phase] || '01';
}

/**
 * Rotating secondary taglines tied to the current phase — gives the user a
 * sense that the audit is actively talking to AI platforms, not just spinning.
 * Cycles every ~2.5s. Avoids false-promising specific prompt text, since a
 * user's URL doesn't map cleanly to a named prompt on this client.
 */
const PHASE_TAGLINES: Record<string, string[]> = {
  '01': [
    'Asking ChatGPT: "What is [your brand]?"',
    'Asking Claude about your brand positioning',
    'Checking what Gemini knows about you',
    'Measuring Perplexity\'s coverage of your brand',
    'Comparing AI claims against your actual site',
    'Flagging same-name entity confusions',
  ],
  '02': [
    'Finding who ranks alongside you on AI overviews',
    'Asking AI: "What\'s an alternative to [competitor]?"',
    'Testing whether you show up as a competitor',
    'Filtering keyword-overlap noise from real rivals',
  ],
  '03': [
    'Running unbranded category queries',
    'Asking: "Best [category] in 2026"',
    'Measuring your share of category answers',
    'Checking which sources each AI cites for your category',
  ],
  '04': [
    'Calculating discovery and share-of-voice',
    'Ranking you against your competitive set',
    'Building your action plan',
  ],
};

export function AuditProgress({ id, initialProgress, initialPhase }: AuditProgressProps) {
  const router = useRouter();
  const [progress, setProgress] = useState(initialProgress);
  const [phase, setPhase] = useState(initialPhase);
  const [failed, setFailed] = useState(false);
  const [taglineIdx, setTaglineIdx] = useState(0);

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/audit/${id}/status`, { cache: 'no-store' });
      if (!res.ok) return;

      const data = await res.json();
      setProgress(data.progress);
      setPhase(data.currentPhase);

      if (data.status === 'complete') {
        router.refresh();
        return true;
      }
      if (data.status === 'failed') {
        setFailed(true);
        return true;
      }
    } catch {
      // Silently retry on next poll
    }
    return false;
  }, [id, router]);

  useEffect(() => {
    let active = true;
    const interval = setInterval(async () => {
      if (!active) return;
      const done = await poll();
      if (done) {
        clearInterval(interval);
      }
    }, 3000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [poll]);

  // Rotate the sub-tagline every 2.5s to communicate live work.
  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIdx((i) => i + 1);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  if (failed) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-surface-950 px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-heading font-medium text-white mb-3">
            Audit Failed
          </h1>
          <p className="text-surface-400 mb-8">
            Something went wrong while running your audit. This is usually temporary.
          </p>
          <button
            onClick={() => router.push('/audit')}
            className="rounded-lg bg-primary-600 px-6 py-3 text-white font-medium hover:bg-primary-500 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const phaseNum = getPhaseNumber(phase);
  const taglines = PHASE_TAGLINES[phaseNum] ?? [];
  const tagline = taglines.length ? taglines[taglineIdx % taglines.length] : '';

  return (
    <div className="flex min-h-dvh items-center justify-center bg-surface-950 px-4">
      <div className="text-center max-w-lg w-full">
        {/* Animated radar-like pulse */}
        <div className="relative w-32 h-32 mx-auto mb-10">
          <div className="absolute inset-0 rounded-full border border-primary-600/20 animate-ping" style={{ animationDuration: '2s' }} />
          <div className="absolute inset-3 rounded-full border border-primary-600/30 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.3s' }} />
          <div className="absolute inset-6 rounded-full border border-primary-600/40 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.6s' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-heading font-medium text-white">
              {phaseNum}
            </span>
          </div>
        </div>

        {/* Phase description */}
        <p className="text-lg text-surface-300 mb-2 min-h-[1.75rem]">
          {phase}
        </p>

        {/* Rotating sub-tagline — communicates active work */}
        <p
          key={tagline}
          className="text-2xs text-surface-500 mb-8 min-h-[1rem] font-mono motion-safe:animate-fade-in"
        >
          {tagline}
        </p>

        {/* Progress bar */}
        <div className="w-full max-w-xs mx-auto">
          <div className="flex items-center justify-between text-sm text-surface-500 mb-2">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-surface-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-600 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Reassurance */}
        <p className="text-2xs text-surface-500 mt-8">
          This typically takes 1-3 minutes. You can bookmark this page and come back.
        </p>
      </div>
    </div>
  );
}
