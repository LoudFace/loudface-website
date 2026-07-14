import type { PostHog } from 'posthog-js';
import { isTrackingAllowed } from './consent';

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
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
          api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
          ui_host: 'https://us.posthog.com',
          capture_pageview: false,
          capture_pageleave: true,
          person_profiles: 'identified_only',
          disable_session_recording: true,
        });
      }
      return posthog;
    });
  }

  return posthogPromise;
}
