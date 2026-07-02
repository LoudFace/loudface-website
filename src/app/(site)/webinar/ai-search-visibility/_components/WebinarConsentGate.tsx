'use client';

import { useState } from 'react';

const RIVERSIDE_REGISTRATION_URL =
  'https://riverside.com/webinar/registration/eyJldmVudElkIjoiNmE0Mjk3NTkxYjZiYzMyYWRkOTZkZjg1Iiwic2x1ZyI6ImNoYW5kYW5hcy1zdHVkaW8tMXByZ1gifQ==';

export function WebinarConsentGate() {
  const [consented, setConsented] = useState(false);

  return (
    <div className="flex flex-col items-center gap-6">
      <label className="flex cursor-pointer items-start gap-3 text-left">
        <input
          type="checkbox"
          checked={consented}
          onChange={(e) => setConsented(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded accent-primary-600"
          aria-describedby="consent-text"
        />
        <span id="consent-text" className="text-[11px] italic leading-relaxed text-surface-400">
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
        <a
          href={consented ? RIVERSIDE_REGISTRATION_URL : undefined}
          target={consented ? '_blank' : undefined}
          rel={consented ? 'noopener noreferrer' : undefined}
          aria-disabled={!consented}
          className={[
            'inline-block rounded-lg px-8 py-4 text-base font-semibold transition-all duration-150',
            consented
              ? 'cursor-pointer bg-primary-600 text-white hover:bg-primary-700'
              : 'pointer-events-none cursor-not-allowed select-none bg-surface-200 text-surface-400',
          ].join(' ')}
        >
          Save my seat
        </a>
        <p className="text-xs text-surface-400">
          You&apos;ll receive a calendar invite and join link from Riverside.
        </p>
      </div>
    </div>
  );
}
