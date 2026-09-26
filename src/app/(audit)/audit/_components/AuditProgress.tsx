'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { AuditReportV11Content } from '@/lib/content-utils';
import { AuditProgressV11 } from '../../../audit-v11/report/AuditFlowV11';

interface AuditProgressProps {
  id: string;
  initialProgress: number;
  initialPhase: string;
  /** Seed the failed state directly from the server record so a known-failed
   * audit doesn't flash the in-progress UI while the first poll resolves. */
  initialFailed?: boolean;
  /** The v11 screen's copy (audit-report-v11.json); this component keeps the polling, AuditProgressV11 draws it. */
  c: AuditReportV11Content;
}

// Ceiling on how long we'll keep polling before giving up and telling the
// user to expect an email instead. Real audits run ~2-5 minutes; 8 minutes
// gives generous headroom before we assume something's stuck.
const MAX_POLL_MS = 8 * 60 * 1000;
const POLL_INTERVAL_MS = 3000;

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

export function AuditProgress({ id, initialProgress, initialPhase, initialFailed = false, c }: AuditProgressProps) {
  const router = useRouter();
  const [progress, setProgress] = useState(initialProgress);
  const [phase, setPhase] = useState(initialPhase);
  const [failed, setFailed] = useState(initialFailed);
  const [timedOut, setTimedOut] = useState(false);
  const [taglineIdx, setTaglineIdx] = useState(0);

  // Polling loop — a recursive setTimeout (not setInterval) so a slow response
  // can never overlap with the next request, plus an AbortController per
  // request and an `active` flag checked AFTER the await so a response that
  // resolves post-unmount (or post-completion) never calls setState.
  useEffect(() => {
    if (initialFailed) return;

    let active = true;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let controller: AbortController | null = null;
    const startedAt = Date.now();

    const scheduleNext = () => {
      if (!active) return;
      timeoutId = setTimeout(runPoll, POLL_INTERVAL_MS);
    };

    const runPoll = async () => {
      if (!active) return;

      if (Date.now() - startedAt > MAX_POLL_MS) {
        if (active) setTimedOut(true);
        return;
      }

      controller = new AbortController();
      try {
        const res = await fetch(`/api/audit/${id}/status`, {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!active) return;
        if (!res.ok) {
          scheduleNext();
          return;
        }

        const data = await res.json();
        if (!active) return;

        setProgress(data.progress);
        setPhase(data.currentPhase);

        if (data.status === 'complete') {
          router.refresh();
          return;
        }
        if (data.status === 'failed') {
          setFailed(true);
          return;
        }
      } catch {
        // Aborted or network error — silently retry on next poll.
      }

      scheduleNext();
    };

    scheduleNext();

    return () => {
      active = false;
      controller?.abort();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [id, router, initialFailed]);

  // Rotate the sub-tagline every 2.5s to communicate live work.
  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIdx((i) => i + 1);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const phaseNum = getPhaseNumber(phase);
  const taglines = PHASE_TAGLINES[phaseNum] ?? [];
  const tagline = taglines.length ? taglines[taglineIdx % taglines.length] : '';

  // The v11 screen draws all three states; "try again" leads to the audit landing page, as before.
  return (
    <AuditProgressV11
      c={c}
      progress={progress}
      phase={phase}
      phaseNum={phaseNum}
      tagline={tagline}
      state={failed ? 'failed' : timedOut ? 'slow' : 'running'}
    />
  );
}
