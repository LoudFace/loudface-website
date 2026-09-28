'use client';

import { usePathname } from 'next/navigation';
import { lazy, Suspense, useSyncExternalStore } from 'react';

/**
 * The only part of the feedback tool every visitor downloads: a few lines
 * that look for the flag cookie the private link sets (/fb/<token>).
 * Without it nothing renders and the widget's code is never fetched.
 * With it, the widget still asks the server who is signed in and renders
 * nothing unless the signed cookie is valid. See src/lib/feedback/access.ts.
 */
// React.lazy, not next/dynamic: lazy fetches the chunk only when it first
// renders, so a visitor without the flag never downloads it.
const FeedbackWidget = lazy(() => import('./FeedbackWidget'));

const EXCLUDED = ['/studio', '/feedback/board', '/p/'];

const noSubscribe = () => () => {};

export function FeedbackLoader() {
  const pathname = usePathname() ?? '/';
  // Server render and first paint: false, so the HTML is the same for everyone.
  const enabled = useSyncExternalStore(
    noSubscribe,
    () => document.cookie.split('; ').includes('lf_fb_on=1'),
    () => false
  );

  if (!enabled || EXCLUDED.some((prefix) => pathname.startsWith(prefix))) return null;
  return (
    <Suspense fallback={null}>
      <FeedbackWidget />
    </Suspense>
  );
}
