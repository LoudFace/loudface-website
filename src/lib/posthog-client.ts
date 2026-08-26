import type { PostHog } from 'posthog-js';
import { isTrackingAllowed } from './consent';

const HOMEPAGE_HERO_FLAG = 'homepage-hero-argument';

/**
 * Single source of truth for client-side PostHog initialization.
 *
 * posthog-js (~56 KB gzipped) stays out of the initial bundle: callers get it
 * via this dynamic-import helper, either deferred to first user interaction
 * (PostHogProvider) or on demand at the moment an event must be captured
 * (form submits). Both paths share one init, so events are never silently
 * dropped on pages where the interaction-deferred provider hasn't run —
 * e.g. a direct visit to /audit, which lives outside the (site) layout.
 */

let posthogPromise: Promise<PostHog | null> | null = null;

/** True once ensurePostHog() has been called (init requested or completed). */
export function isPostHogRequested(): boolean {
  return posthogPromise !== null;
}

/**
 * Load and initialize posthog-js exactly once. Resolves to the shared
 * PostHog instance, or null when no key is configured (local dev).
 */
export function ensurePostHog(): Promise<PostHog | null> {
  if (typeof window === 'undefined' || !process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return Promise.resolve(null);
  }

  // Consent gate — every caller (provider, form submits) funnels through
  // here, so this one check covers them all. Deliberately NOT cached:
  // the next call after the visitor grants consent initializes normally.
  if (!posthogPromise && !isTrackingAllowed()) {
    return Promise.resolve(null);
  }

  if (!posthogPromise) {
    posthogPromise = import('posthog-js').then(({ default: posthog }) => {
      if (!posthog.__loaded) {
        // The proxy creates this ID before the server renders the homepage.
        // Bootstrap prevents browser events from splitting onto a second user.
        // The homepage also exposes the exact variant from its initial HTML so
        // the browser records the server's choice instead of evaluating again.
        const distinctId = document.querySelector('[data-lf-did]')?.getAttribute('data-lf-did') || undefined;
        const heroVariantValue = document.querySelector('[data-lf-hv]')?.getAttribute('data-lf-hv');
        const heroVariant =
          heroVariantValue === 'control' || heroVariantValue === 'test' ? heroVariantValue : undefined;
        const bootstrappedHeroVariant = distinctId && heroVariant ? heroVariant : undefined;

        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
          api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
          ui_host: 'https://us.posthog.com',
          bootstrap: distinctId
            ? {
                distinctID: distinctId,
                featureFlags: bootstrappedHeroVariant
                  ? { [HOMEPAGE_HERO_FLAG]: bootstrappedHeroVariant }
                  : undefined,
              }
            : undefined,
          capture_pageview: false,
          capture_pageleave: true,
          // 'always', not 'identified_only'. Under identified_only PostHog creates a
          // person profile only once someone identifies (a form submit), so every
          // anonymous visitor carries no person properties at all — including
          // $initial_referring_domain, the field that records where someone first
          // arrived from. Measured 2026-08-26: only 1,738 of 44,713 events over 90
          // days carried it, 3.9%. Everything without it defaults to "direct", which
          // is why the channel breakdown reported ~12,400 visitors as direct while
          // the per-event referrer showed 11,227 arriving from Google.
          //
          // Two things depended on that field and both were wrong because of this:
          // "which channel produced a booked call" (it answered 1 of 57 from AI, an
          // artifact of the empty field), and the "where your visitors came from"
          // panel on the client reports we send.
          //
          // This is the mechanism PostHog provides for the question, not a
          // workaround: $initial_referring_domain and the rest of the $initial_*
          // family are PostHog-managed person properties that populate on first
          // touch and persist across sessions. Cost note: PostHog charges more for
          // events with person processing, so this raises analytics spend by design.
          // Consent is unaffected — posthog-js still only loads after consent and
          // first interaction (see PostHogProvider), so no profile exists for anyone
          // who has not already opted in.
          person_profiles: 'always',
          // Session recording is deliberately NOT configured here. PostHog's own
          // project settings own that policy — duplicating the switch in code made
          // the dashboard lie about whether recording was running.
        });

        // Reading the bootstrapped flag once emits the browser-side exposure.
        // posthog-js refuses to initialize for user agents on its maintained bot
        // blocklist, which keeps crawlers out of the experiment participant count.
        if (bootstrappedHeroVariant) {
          posthog.getFeatureFlag(HOMEPAGE_HERO_FLAG);
        }
      }
      return posthog;
    });
  }

  return posthogPromise;
}
