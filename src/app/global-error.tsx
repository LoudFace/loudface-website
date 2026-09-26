'use client';

import './home-v11/home-v11.css';
import './lost-v11/lost.css';
import { LostPageV11 } from './lost-v11/LostPageV11';

/**
 * The last-resort error page: an error in the root layout itself. It replaces the whole document, so it carries its
 * own <html> and <body>; the page is the v11 error page (lost-v11.json), with "try again" as its first action.
 */
export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <LostPageV11 kind="error" onRetry={retry} />
      </body>
    </html>
  );
}
