import type { Metadata } from 'next';

/**
 * (feedback) — the team board behind the private feedback link. No site
 * chrome, never indexed. The page itself answers 404 to anyone who is not
 * signed in with a team link.
 */
export const metadata: Metadata = {
  title: 'Client requests',
  robots: { index: false, follow: false },
};

export default function FeedbackLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
