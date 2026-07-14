import "../globals.css";
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { PostHogProvider } from '@/components/PostHogProvider';
import { countryRequiresConsent } from '@/lib/consent';

/**
 * (audit) Layout
 * The audit tool is a focused, fullscreen workspace. Because this route group
 * sits at app root (sibling to (site)/), site chrome is *not* inherited —
 * no Header/Footer/Webflow-badge/Cal/Leadsy. Only the dark body bg is set here.
 *
 * PostHogProvider IS mounted (unlike the rest of the chrome): without it,
 * posthog-js never initializes on /audit and /audit/[id], so form submits and
 * pageviews on this route group are invisible. It renders no UI and lazy-loads
 * on first interaction, so the fullscreen-workspace performance intent holds.
 *
 * Imports globals.css explicitly because it's no longer in the root layout.
 */

export const metadata: Metadata = {
  title: {
    default: 'AI Visibility Audit | LoudFace',
    template: '%s | LoudFace',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AuditLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Consent region flag (data-lf-cr) — read by posthog-client's consent gate.
  // Without it the gate assumes opt-in and PostHog would stay off for every
  // /audit visitor, including the US ones. There's deliberately no consent
  // banner in this fullscreen workspace: opt-in-region visitors simply go
  // untracked here, which is the safe direction. display:contents keeps the
  // wrapper out of layout.
  const requestHeaders = await headers();
  const country = requestHeaders.get('cf-ipcountry') ?? requestHeaders.get('x-vercel-ip-country');
  const consentRequired = countryRequiresConsent(country);

  return (
    <PostHogProvider>
      <style>{`
        body { background-color: var(--color-surface-950); color: var(--color-surface-300); overflow: hidden; }
      `}</style>
      <div data-lf-cr={consentRequired ? '1' : '0'} style={{ display: 'contents' }}>
        {children}
      </div>
    </PostHogProvider>
  );
}
