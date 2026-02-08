'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef } from 'react';

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialized = useRef(false);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;

    // Dynamic import keeps posthog-js out of the main bundle (~88 KB).
    // It loads in a separate chunk after hydration, avoiding TBT impact.
    import('posthog-js').then(({ default: posthog }) => {
      if (!initialized.current) {
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
          api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
          capture_pageview: false,
          capture_pageleave: true,
          person_profiles: 'identified_only',
        });
        initialized.current = true;
      }

      let url = window.origin + pathname;
      const search = searchParams.toString();
      if (search) url += '?' + search;
      posthog.capture('$pageview', { $current_url: url });
    });
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
