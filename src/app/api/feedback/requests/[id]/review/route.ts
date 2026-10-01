import type { NextRequest } from 'next/server';
import { canSee, getFeedbackSession } from '@/lib/feedback/access';
import { getFeedbackStore } from '@/lib/feedback/store';
import { toClientView } from '@/lib/feedback/types';
import { parseComment } from '@/lib/feedback/validate';
import { badRequest, json, notFound } from '../../../respond';

export const dynamic = 'force-dynamic';

/**
 * The client's sign-off on a request the team marked "Ready for your check".
 *   { decision: "approve" }                  → Done
 *   { decision: "reopen", body: "<why>" }    → back to In progress, the reason posted in the thread
 * The only status change a client can make, and only from that one status.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getFeedbackSession();
  if (!session) return notFound();
  const { id } = await params;
  const store = getFeedbackStore();
  const current = await store.get(id);
  if (!canSee(session, current)) return notFound();
  if (current.status !== 'ready_for_review') return badRequest('This request is not waiting for your check.');

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest('The answer was not readable.');
  }
  const decision = (body as Record<string, unknown> | null)?.decision;
  if (decision !== 'approve' && decision !== 'reopen') return badRequest('Choose "Looks good" or "Still not right".');

  if (decision === 'reopen') {
    const reason = parseComment(body);
    if (!reason) return badRequest('Say what is still not right.');
    await store.addComment(id, reason, session.person);
  }
  const updated = await store.update(
    id,
    { status: decision === 'approve' ? 'done' : 'in_progress' },
    session.person
  );
  if (!updated) return notFound();
  return json({ request: session.person.role === 'team' ? updated : toClientView(updated) });
}
