'use client';

import type { ReactNode } from 'react';

interface PartnersCTALinkProps {
  /** Identifies which CTA was clicked in PostHog. */
  source: 'hero' | 'earn_section';
  className?: string;
  children: ReactNode;
}

/**
 * PartnersCTALink
 *
 * Thin client wrapper around the "#apply" anchor used in the hero and
 * "What you earn" sections of page.tsx (both sections are server-rendered,
 * so we can't attach onClick there directly).
 *
 * Fires PostHog event `partners_cta_clicked` with a `source` property so we
 * can see which CTA in the funnel drove form starts.
 */
export function PartnersCTALink({ source, className, children }: PartnersCTALinkProps) {
  function handleClick() {
    void import('posthog-js').then(({ default: posthog }) => {
      if (!posthog.__loaded) return;
      posthog.capture('partners_cta_clicked', { source });
    });
  }

  return (
    <a href="#apply" className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
