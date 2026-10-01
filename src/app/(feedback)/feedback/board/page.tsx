import { notFound } from 'next/navigation';
import { getFeedbackSession } from '@/lib/feedback/access';
import { contactsFor } from '@/lib/feedback/contacts';
import { getFeedbackStore } from '@/lib/feedback/store';
import { Board } from './Board';

export const dynamic = 'force-dynamic';

/** Every client's requests in one place. Team links only. */
export default async function FeedbackBoardPage() {
  const session = await getFeedbackSession();
  if (!session || session.person.role !== 'team') notFound();
  const requests = await getFeedbackStore().list({});
  const contacts = Object.fromEntries(
    Array.from(new Set(requests.map((r) => r.client_slug))).map((slug) => [slug, contactsFor(slug)])
  );
  return <Board initial={requests} me={session.person.name} contacts={contacts} />;
}
