'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import { RIVERSIDE_REGISTRATION_URL } from './config';

export function WebinarConsentGate({ source }: { source: 'hero' | 'register' }) {
  const [consented, setConsented] = useState(false);

  // Named funnel event on the real click-through (only fires when consented —
  // the disabled <button> swallows the click). Matches the site's lazy-import
  // PostHog pattern (see PartnersCTALink). Autocapture also records the raw
  // click; this gives us a clean, named event with the CTA placement.
  function handleRegisterClick() {
    void import('posthog-js').then(({ default: posthog }) => {
      if (!posthog.__loaded) return;
      posthog.capture('webinar_cta_clicked', { source, webinar: 'ai-search-visibility' });
    });
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Input is wrapped by the label, so the consent text is the checkbox's
          accessible name — no aria-describedby / id needed (and no duplicate id
          when this component renders more than once on the page). */}
      <label className="flex max-w-lg cursor-pointer items-start gap-3 text-left">
        <input
          type="checkbox"
          checked={consented}
          onChange={(e) => setConsented(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded accent-primary-600"
        />
        <span className="text-[11px] italic leading-relaxed text-surface-400">
          I agree to receive marketing communications from Webflow and LoudFace regarding products,
          services and events. I understand the information I submit will be handled by Webflow as
          described in the{' '}
          <a
            href="https://webflow.com/legal/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-surface-600"
          >
            Webflow Privacy Policy
          </a>
          , and by LoudFace as described in the{' '}
          <a
            href="https://www.loudface.co/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-surface-600"
          >
            LoudFace Privacy Policy
          </a>
          . I understand that I can unsubscribe at any time.
        </span>
      </label>

      <div className="flex flex-col items-center gap-2">
        {/* Button renders an external <a> when href is set (consented), and a
            disabled <button> when href is undefined (not consented). Keeps the
            house Button styling, focus-visible ring, and disabled treatment. */}
        <Button
          variant="secondary"
          size="lg"
          href={consented ? RIVERSIDE_REGISTRATION_URL : undefined}
          disabled={!consented}
          onClick={handleRegisterClick}
        >
          Save my seat
        </Button>
        <p className="text-xs text-surface-400">
          You&apos;ll receive a calendar invite and join link from Riverside.
        </p>
      </div>
    </div>
  );
}
