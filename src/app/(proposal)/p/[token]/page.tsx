import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { ProposalAnalytics } from '@/components/proposal/ProposalAnalytics';
import { ProposalDocument } from '@/components/proposal/ProposalDocument';
import { isProposalLive, verifyAccessCookie } from '@/lib/proposal-access';
import { isValidProposalToken, proposalCookieName } from '@/lib/proposal-token';
import { fetchProposalContent, fetchProposalGate } from '@/sanity/lib/proposalsClient';
import { AccessGate } from './AccessGate';

/**
 * /p/<token> — a client proposal behind an access code.
 *
 * THE RULE THIS FILE EXISTS TO ENFORCE: until the access cookie verifies, the
 * proposal content is never fetched. Not fetched-and-hidden, not
 * fetched-and-CSS'd-away — never read out of the Content Lake at all. That is
 * why there are two queries: fetchProposalGate() returns access facts only,
 * and fetchProposalContent() runs strictly after verifyAccessCookie() passes.
 *
 * If you add a field to the locked branch, ask first whether a stranger with
 * the URL may read it in View Source. The answer is almost always no.
 *
 * Absent / expired / draft all return notFound(). A distinct "this exists but
 * you cannot see it" page would confirm which tokens are real.
 */

export const dynamic = 'force-dynamic';

/**
 * Generic on purpose. Slack, Gmail and LinkedIn unfurl any link pasted into
 * them, so whatever is here is shown to everyone in that channel — including
 * people the proposal was never sent to. No client name, no title, no price,
 * no image. The site-wide OpenGraph card from the root layout is replaced
 * rather than inherited.
 */
export function generateMetadata(): Metadata {
  return {
    title: { absolute: 'LoudFace proposal' },
    description: undefined,
    robots: { index: false, follow: false, nocache: true },
    openGraph: {
      type: 'website',
      title: 'LoudFace proposal',
      description: undefined,
      images: [],
      siteName: undefined,
      url: undefined,
    },
    twitter: {
      card: 'summary',
      title: 'LoudFace proposal',
      description: undefined,
      images: [],
      site: undefined,
    },
  };
}

interface ProposalPageProps {
  params: Promise<{ token: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ProposalPage({ params, searchParams }: ProposalPageProps) {
  const { token } = await params;

  // Shape check first — a junk URL should never reach the Content Lake.
  if (!isValidProposalToken(token)) notFound();

  const gate = await fetchProposalGate(token);
  if (!gate || !isProposalLive(gate)) notFound();

  const cookieStore = await cookies();
  const unlocked = verifyAccessCookie(
    cookieStore.get(proposalCookieName(token))?.value,
    token,
    gate.accessCode
  );

  if (!unlocked) {
    // Nothing below this point knows anything about the proposal but its token.
    return (
      <>
        <AccessGate token={token} />
        <ProposalAnalytics token={token} state="locked" />
      </>
    );
  }

  const proposal = await fetchProposalContent(token);
  if (!proposal) notFound();

  const query = await searchParams;

  return (
    <>
      <ProposalDocument proposal={proposal} />
      <ProposalAnalytics
        token={token}
        clientName={proposal.clientName}
        state="unlocked"
        justUnlocked={query?.unlocked === '1'}
      />
    </>
  );
}
