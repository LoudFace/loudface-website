'use client';

import { useEffect } from 'react';
import '../home-v11/home-v11.css';
import '../lost-v11/lost.css';
import { LostPageV11 } from '../lost-v11/LostPageV11';

/**
 * An error inside a site page renders here, inside the site layout (header and menus stay), with "try again" (retry)
 * as the first action. Errors in the layout itself fall through to src/app/error.tsx.
 */
export default function SiteError({
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
