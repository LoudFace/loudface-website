/**
 * Identify a visitor and capture a conversion event from a form submit.
 *
 * posthog-js is lazy-initialized on first user interaction (see
 * PostHogProvider). A submit can race that init — e.g. browser autofill +
 * instant submit — and posthog.capture() before init is silently dropped.
 * This helper retries for up to ~2s so the conversion isn't lost. Safe to
 * call right before a client-side navigation: the page context survives
 * router.push(), so the retries keep running.
 */
export function identifyAndCapture(
  distinctId: string,
  personProps: Record<string, unknown>,
  event: string,
  eventProps: Record<string, unknown>,
): void {
  const RETRY_MS = 250;
  const MAX_TRIES = 8;

  // Dynamic import matches PostHogProvider's lazy-load pattern — keeps
  // posthog-js out of the initial bundle.
  void import('posthog-js').then(({ default: posthog }) => {
    let tries = 0;
    const attempt = () => {
      if (posthog.__loaded) {
        posthog.identify(distinctId, personProps);
        posthog.capture(event, eventProps);
        return;
      }
      tries += 1;
      if (tries < MAX_TRIES) setTimeout(attempt, RETRY_MS);
    };
    attempt();
  });
}
