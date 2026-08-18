import 'server-only';
import { after } from 'next/server';
import { PostHog } from 'posthog-node';

const HOMEPAGE_HERO_FLAG = 'homepage-hero-argument';
const FEATURE_FLAG_TIMEOUT_MS = 750;

let homepageExperimentClient: PostHog | null | undefined;

export function getPostHogServer(): PostHog | null {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return null;

  return new PostHog(key, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    flushAt: 1,
    flushInterval: 0,
  });
}

/**
 * The homepage evaluates its flag on every request so the chosen copy is in the
 * initial HTML. Keep one process-level client because the SDK uses that client
 * to deduplicate repeated exposure calls for the same visitor and flag value.
 */
function getHomepageExperimentClient(): PostHog | null {
  if (homepageExperimentClient !== undefined) return homepageExperimentClient;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) {
    homepageExperimentClient = null;
    return homepageExperimentClient;
  }

  homepageExperimentClient = new PostHog(key, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    flushAt: 1,
    flushInterval: 0,
    requestTimeout: FEATURE_FLAG_TIMEOUT_MS,
    fetchRetryCount: 0,
    featureFlagsRequestTimeoutMs: FEATURE_FLAG_TIMEOUT_MS,
    featureFlagsRequestMaxRetries: 0,
  });

  return homepageExperimentClient;
}

/**
 * Remote evaluation deliberately fails closed to the proven control argument.
 * The SDK timeout bounds the request and its default flag-call event records the
 * exposure only after the consent gate in the homepage has allowed this call.
 *
 * WHY THE EXPLICIT FLUSH: getFeatureFlag ENQUEUES the `$feature_flag_called`
 * exposure event and returns — it never awaits delivery. On a serverless host the
 * function can be frozen the moment the response is sent, so that queued event is
 * lost and PostHog sees a running experiment with no exposures to attribute
 * results to. `after()` runs the flush once the response has been sent, so we pay
 * no latency for it and still deliver the exposure. A failed flush must never
 * surface to the visitor — a dropped analytics event is not a broken homepage.
 */
export async function getHomepageHeroVariant(distinctId: string): Promise<'control' | 'test'> {
  const posthog = getHomepageExperimentClient();
  if (!posthog) return 'control';

  try {
    const value = await posthog.getFeatureFlag(HOMEPAGE_HERO_FLAG, distinctId);
    after(async () => {
      try {
        await posthog.flush();
      } catch {
        // Exposure delivery is best-effort; never let it break the request.
      }
    });
    return value === 'test' ? 'test' : 'control';
  } catch {
    return 'control';
  }
}
