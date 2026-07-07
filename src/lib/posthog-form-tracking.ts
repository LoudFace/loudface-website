import { ensurePostHog } from '@/lib/posthog-client';

/**
 * Identify a visitor and capture a conversion event from a form submit.
 *
 * posthog-js normally lazy-initializes on first user interaction (see
 * PostHogProvider), which a submit can beat — e.g. browser autofill +
 * instant submit, or a direct visit to a page whose layout defers the
 * provider. ensurePostHog() initializes on demand in that case (a submit
 * is itself a user interaction, so the perf rationale for deferring no
 * longer applies), which means the conversion is never silently dropped.
 * Safe to call right before a client-side navigation: the page context
 * survives router.push(), so the pending capture still flushes.
 */
export function identifyAndCapture(
  distinctId: string,
  personProps: Record<string, unknown>,
  event: string,
  eventProps: Record<string, unknown>,
): void {
  void ensurePostHog().then((posthog) => {
    if (!posthog) return;
    posthog.identify(distinctId, personProps);
    posthog.capture(event, eventProps);
  });
}
