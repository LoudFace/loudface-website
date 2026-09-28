import { ProposalCardsDocument } from '@/components/proposal/ProposalCardsDocument';
import type { Proposal } from '@/sanity/lib/proposalsClient';
import faith from '../_fixture/faith.json';
export const dynamic = 'force-dynamic';
export default function Page() {
  return <ProposalCardsDocument proposal={{ ...(faith as unknown as Proposal), design: 'cards' }} />;
}
