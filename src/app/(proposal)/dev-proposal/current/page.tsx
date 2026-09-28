import { ProposalDocument } from '@/components/proposal/ProposalDocument';
import { loadFixture } from '../_concepts/loadFixture';

export const dynamic = 'force-dynamic';

export default async function Page() {
  return <ProposalDocument proposal={await loadFixture()} />;
}
