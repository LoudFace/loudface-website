import { getFeedbackSession } from '@/lib/feedback/access';
import { getFeedbackStore } from '@/lib/feedback/store';
import { json, notFound } from '../respond';

export const dynamic = 'force-dynamic';

/**
 * Every request as Spine-shaped JSON (screenshots left out). Team only.
 * This is the migration path into the Spine and the Team App.
 */
export async function GET() {
  const session = await getFeedbackSession();
  if (!session || session.person.role !== 'team') return notFound();
  const requests = await getFeedbackStore().exportAll();
  return json({ exported_at: new Date().toISOString(), schema: 'feedback_request.v1', requests });
}
