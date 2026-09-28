import { ProposalDocument } from '@/components/proposal/ProposalDocument';
import type { Proposal } from '@/sanity/lib/proposalsClient';
import faith from '../_fixture/faith.json';

export const dynamic = 'force-dynamic';

export default function Page() {
  return <ProposalDocument proposal={faith as unknown as Proposal} />;
}
