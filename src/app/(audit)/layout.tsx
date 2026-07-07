import "../globals.css";
import type { Metadata } from 'next';
import { PostHogProvider } from '@/components/PostHogProvider';

/**
 * (audit) Layout
 * The audit tool is a focused, fullscreen workspace. Because this route group
 * sits at app root (sibling to (site)/), site chrome is *not* inherited —
 * no Header/Footer/Webflow-badge/Cal/Leadsy. Only the dark body bg is set here.
 * PostHogProvider IS mounted (interaction-deferred, same as (site)) so direct
 * visits to /audit and /audit/[id] get pageviews and form analytics.
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

export default function AuditLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PostHogProvider>
      <style>{`
        body { background-color: var(--color-surface-950); color: var(--color-surface-300); overflow: hidden; }
      `}</style>
      {children}
    </PostHogProvider>
  );
}
