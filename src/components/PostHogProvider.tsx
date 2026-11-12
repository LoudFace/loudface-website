'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef } from 'react';
import { ensurePostHog, isPostHogRequested } from '@/lib/posthog-client';
import { CONSENT_EVENT } from '@/lib/consent';
import { onFirstInteractionOrIdle } from '@/lib/first-interaction';

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pendingPageview = useRef<string | null>(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;

    let url = window.origin + pathname;
    const search = searchParams.toString();
    if (search) url += '?' + search;

    // If PostHog init was already requested (user interacted, or a form
    // submit initialized it on demand), capture immediately.
    if (isPostHogRequested()) {
      void ensurePostHog().then((posthog) => {
        posthog?.capture('$pageview', { $current_url: url });
      });
      return;
    }

    // Store the URL for when PostHog loads after first interaction
    pendingPageview.current = url;

    function loadPostHog() {
      void ensurePostHog().then((posthog) => {
        // Fire the pageview that was pending during initial load
        if (posthog && pendingPageview.current) {
          posthog.capture('$pageview', { $current_url: pendingPageview.current });
          pendingPageview.current = null;
        }
      });
    }

    // Defer PostHog to the first interaction (or an idle moment after load) —
    // same pattern as the Meta Pixel. This keeps TBT near zero by avoiding ~250ms of
    // script evaluation during the initial hydration window.
    const cancelWait = onFirstInteractionOrIdle(loadPostHog);

    // Consent granted mid-page (banner or /cookies prefs): the one-shot
    // interaction listeners may already be spent from before the grant, when
    // ensurePostHog() was still a no-op — retry so the pending pageview fires.
    window.addEventListener(CONSENT_EVENT, loadPostHog);

    return () => {
      cancelWait();
      window.removeEventListener(CONSENT_EVENT, loadPostHog);
    };
  }, [pathname, searchParams]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </>
  );
}
