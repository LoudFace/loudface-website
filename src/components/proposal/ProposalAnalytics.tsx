'use client';

import { useEffect } from 'react';
import { ensurePostHog } from '@/lib/posthog-client';

/**
 * Proposal telemetry. Knowing whether a proposal was opened, how far the reader
 * got, and whether they reached the price is the main reason this surface
 * exists at all.
 *
 * Events: proposal_opened, proposal_unlocked, proposal_pricing_viewed,
 * proposal_section_viewed. The audit page uses the same component with
 * surface="audit", so its events are audit_opened, audit_unlocked and
 * audit_section_viewed.
 *
 * Identity: once the reader is past the gate and the document carries a
 * readerEmail, the visit is identified under that email, so the person, the
 * events and the session replay all file under one name in PostHog. The
 * access code is only ever sent to one person, so the email is theirs.
 *
 * Consent: ensurePostHog() refuses to load for anyone whose region requires
 * opt-in and who has not accepted (see src/lib/consent.ts). Nothing here
 * bypasses that. Renders no DOM.
 */

interface ProposalAnalyticsProps {
  token: string;
  /** Event prefix. Defaults to "proposal". */
  surface?: 'proposal' | 'audit';
  /** The reader's email, only ever passed once the reader is past the gate. */
  readerEmail?: string;
  /** The reader's name, from preparedFor. */
  readerName?: string;
  /** Only ever passed once the reader is past the gate. */
  clientName?: string;
  state: 'locked' | 'unlocked';
  /** True on the single render right after a correct code was entered. */
  justUnlocked?: boolean;
}

export function ProposalAnalytics({
  token,
  surface = 'proposal',
  readerEmail,
  readerName,
  clientName,
  state,
  justUnlocked,
}: ProposalAnalyticsProps) {
  useEffect(() => {
    // Tidy the URL whether or not analytics ever loads.
    if (justUnlocked && typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('unlocked');
      window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    }

    let disposed = false;
    let observer: IntersectionObserver | null = null;

    const base: Record<string, unknown> = { proposal_token: token, proposal_state: state, surface };
    if (clientName) base.client_name = clientName;

    ensurePostHog().then((posthog) => {
      if (!posthog || disposed) return;

      if (state === 'unlocked' && readerEmail) {
        const traits: Record<string, unknown> = { email: readerEmail };
        if (readerName) traits.name = readerName;
        if (clientName) traits.company = clientName;
        posthog.identify(readerEmail, traits);
      }

      posthog.capture(`${surface}_opened`, base);
      if (justUnlocked) posthog.capture(`${surface}_unlocked`, base);
      if (state !== 'unlocked' || typeof IntersectionObserver === 'undefined') return;

      const seen = new Set<string>();
      let pricingFired = false;

      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const element = entry.target as HTMLElement;
            const name = element.dataset.proposalSection || element.id;
            if (!name || seen.has(name)) continue;
            seen.add(name);
            observer?.unobserve(element);

            posthog.capture(`${surface}_section_viewed`, {
              ...base,
              section: name,
              section_type: element.dataset.proposalType ?? 'unknown',
            });

            if (element.dataset.proposalPricing !== undefined && !pricingFired) {
              pricingFired = true;
              posthog.capture('proposal_pricing_viewed', { ...base, section: name });
            }
          }
        },
        // A third of the block on screen is a read, not a scroll-past.
        { threshold: 0.34 }
      );

      document
        .querySelectorAll<HTMLElement>('[data-proposal-section]')
        .forEach((element) => observer?.observe(element));
    });

    return () => {
      disposed = true;
      observer?.disconnect();
    };
  }, [token, surface, readerEmail, readerName, clientName, state, justUnlocked]);

  return null;
}
