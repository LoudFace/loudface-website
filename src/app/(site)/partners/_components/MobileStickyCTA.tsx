'use client';

import { ensurePostHog } from '@/lib/posthog-client';

/**
 * MobileStickyCTA — fixed floating "Apply" button visible only on <768px.
 * Anchors to #apply on the partners page.
 *
 * Fires PostHog `partners_cta_clicked` with source "mobile_sticky" on click.
 *
 * lf-lifts-for-consent: this sits in the same bottom band as the consent bar,
 * so it lifts above it while consent is unresolved (see the bottom-band
 * contract in globals.css). It lifts rather than yielding because, unlike the
 * Webflow badge, it is a conversion CTA — hiding it would cost clicks.
 */
export function MobileStickyCTA() {
  function handleClick() {
    void ensurePostHog().then((posthog) => {
      posthog?.capture('partners_cta_clicked', { source: 'mobile_sticky' });
    });
  }

  return (
    <a
      href="#apply"
      onClick={handleClick}
      aria-label="Apply to the Partner Program"
      className="lf-lifts-for-consent md:hidden fixed bottom-4 right-4 z-50 inline-flex items-center gap-2 rounded-full bg-primary-600 text-white px-5 py-3 text-sm font-medium shadow-lg shadow-primary-900/20 transition-colors hover:bg-primary-500 focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2 active:scale-[0.98]"
    >
      Apply
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M17 8l4 4m0 0l-4 4m4-4H3"
        />
      </svg>
    </a>
  );
}
