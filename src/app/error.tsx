'use client';

import { useEffect } from 'react';
import './home-v11/home-v11.css';
import './lost-v11/lost.css';
import { LostPageV11 } from './lost-v11/LostPageV11';

/**
 * The error page — v11 (switched 2026-09-26): the same page as the 404 with "try again" (retry) as its first action.
 * LostPageV11 reads lost-v11.json directly because this is a client component.
 */
export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <LostPageV11 kind="error" onRetry={retry} />;
}
