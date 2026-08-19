import 'server-only';
import { isBlockedUA } from '@posthog/core/utils';
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
 * initial HTML. Keep one process-level client so evaluation does not create a
 * new SDK client for every request. Exposure now belongs to posthog-js because
 * its maintained bot blocklist prevents crawlers from becoming participants.
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
 * The SDK timeout bounds the request. Search crawlers never reach PostHog and
 * always receive control, using the same maintained blocklist as posthog-js.
 *
 * WHY NO SERVER EXPOSURE OR FLUSH: server evaluation used to enqueue the
 * `$feature_flag_called` event for every request, including crawlers. The browser
 * now records that event after its bot check. `sendFeatureFlagEvents: false`
 * leaves this client with nothing to flush after evaluation.
 */
export async function getHomepageHeroVariant(
  distinctId: string,
  userAgent: string | null,
): Promise<'control' | 'test'> {
  if (isBlockedUA(userAgent ?? undefined)) return 'control';

  const posthog = getHomepageExperimentClient();
  if (!posthog) return 'control';

  try {
    const value = await posthog.getFeatureFlag(HOMEPAGE_HERO_FLAG, distinctId, {
      sendFeatureFlagEvents: false,
    });
    return value === 'test' ? 'test' : 'control';
  } catch {
    return 'control';
  }
}
