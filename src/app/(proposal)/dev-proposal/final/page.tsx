import { ProposalCardsDocument } from '@/components/proposal/ProposalCardsDocument';
import { loadFixture } from '../_concepts/loadFixture';
export const dynamic = 'force-dynamic';
export default async function Page() {
  return <ProposalCardsDocument proposal={{ ...(await loadFixture()), design: 'cards' }} />;
}
