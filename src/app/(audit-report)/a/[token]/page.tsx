import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { AuditDocument } from '@/components/audit-report/AuditDocument';
import { isProposalLive, verifyAccessCookie } from '@/lib/proposal-access';
import { auditCookieName, isValidProposalToken } from '@/lib/proposal-token';
import { fetchAuditContent, fetchAuditGate } from '@/sanity/lib/proposalsClient';
import { AccessGate } from './AccessGate';

/**
 * /a/<token> — a prospect audit behind an access code.
 *
 * THE RULE THIS FILE EXISTS TO ENFORCE, same as /p/<token>: until the access
 * cookie verifies, the audit content is never fetched. Not fetched-and-hidden
 * — never read out of the Content Lake at all. fetchAuditGate() returns access
 * facts only; fetchAuditContent() runs strictly after verifyAccessCookie().
 *
 * An audit lists a company's weaknesses by name. Leaving one readable to
 * anyone who guesses a URL would be worse than leaking a price.
 *
 * Absent / expired / draft all return notFound(). A distinct "this exists but
 * you cannot see it" page would confirm which tokens are real.
 */

export const dynamic = 'force-dynamic';

/**
 * Generic on purpose. Slack, Gmail and LinkedIn unfurl any link pasted into
 * them, so whatever is here is shown to everyone in that channel — including
 * people the audit was never sent to. No company name, no headline, no image.
 */
export function generateMetadata(): Metadata {
  return {
    title: { absolute: 'LoudFace audit' },
    description: undefined,
    robots: { index: false, follow: false, nocache: true },
    openGraph: {
      type: 'website',
      title: 'LoudFace audit',
      description: undefined,
      images: [],
      siteName: undefined,
      url: undefined,
    },
    twitter: {
      card: 'summary',
      title: 'LoudFace audit',
      description: undefined,
      images: [],
      site: undefined,
    },
  };
}

interface AuditPageProps {
  params: Promise<{ token: string }>;
}

export default async function AuditPage({ params }: AuditPageProps) {
  const { token } = await params;

  // Shape check first — a junk URL should never reach the Content Lake.
  if (!isValidProposalToken(token)) notFound();

  const gate = await fetchAuditGate(token);
  if (!gate || !isProposalLive(gate)) notFound();

  const cookieStore = await cookies();
  const unlocked = verifyAccessCookie(
    cookieStore.get(auditCookieName(token))?.value,
    token,
    gate.accessCode
  );

  // Nothing below this point knows anything about the audit but its token.
  if (!unlocked) return <AccessGate token={token} />;

  const audit = await fetchAuditContent(token);
  if (!audit) notFound();

  return <AuditDocument audit={audit} />;
}
