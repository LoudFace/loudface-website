import { notFound } from 'next/navigation';
import { getFeedbackSession } from '@/lib/feedback/access';
import { getDirectory } from '@/lib/feedback/directory';
import { getFeedbackStore } from '@/lib/feedback/store';
import { Board } from './Board';

export const dynamic = 'force-dynamic';

/** Every client's requests in one place. Team links only. */
export default async function FeedbackBoardPage() {
  const session = await getFeedbackSession();
  if (!session || session.person.role !== 'team') notFound();
  const requests = await getFeedbackStore().list({});
  const directory = await getDirectory();
  return <Board initial={requests} me={session.person.name} directory={directory} />;
}
