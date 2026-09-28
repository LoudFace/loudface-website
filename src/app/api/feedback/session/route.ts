import { getFeedbackSession } from '@/lib/feedback/access';
import { json, notFound } from '../respond';

export const dynamic = 'force-dynamic';

/** Tells the widget who is signed in. 404 means: show nothing. */
export async function GET() {
  const session = await getFeedbackSession();
  if (!session) return notFound();
  return json({ client: session.client, name: session.person.name, role: session.person.role });
}
