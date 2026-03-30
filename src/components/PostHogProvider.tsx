'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef } from 'react';

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialized = useRef(false);
  const pendingPageview = useRef<string | null>(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;

    let url = window.origin + pathname;
    const search = searchParams.toString();
    if (search) url += '?' + search;

    // If PostHog already loaded (user interacted), capture immediately
    if (initialized.current) {
      import('posthog-js').then(({ default: posthog }) => {
        posthog.capture('$pageview', { $current_url: url });
      });
      return;
    }

    // Store the URL for when PostHog loads after first interaction
    pendingPageview.current = url;

    function loadPostHog() {
      if (initialized.current) return;

      // Dynamic import keeps posthog-js out of the main bundle (~56 KB gzipped).
      // Deferred to user interaction to avoid competing with hydration for main thread.
      import('posthog-js').then(({ default: posthog }) => {
        if (initialized.current) return;
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
          api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
          capture_pageview: false,
          capture_pageleave: true,
          person_profiles: 'identified_only',
          disable_session_recording: true,
        });
        initialized.current = true;

        // Fire the pageview that was pending during initial load
        if (pendingPageview.current) {
          posthog.capture('$pageview', { $current_url: pendingPageview.current });
          pendingPageview.current = null;
        }
      });
    }

    // Defer PostHog to first user interaction — same pattern as GTM/Cal.com.
    // This keeps TBT near zero by avoiding ~250ms of script evaluation during
    // the initial hydration window.
    const events = ['scroll', 'touchstart', 'mousemove', 'keydown'];
    events.forEach((e) => {
      window.addEventListener(e, loadPostHog, { once: true, passive: true });
    });

    return () => {
      events.forEach((e) => {
        window.removeEventListener(e, loadPostHog);
      });
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
