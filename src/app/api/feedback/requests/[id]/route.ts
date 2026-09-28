import type { NextRequest } from 'next/server';
import { canSee, getFeedbackSession } from '@/lib/feedback/access';
import { getFeedbackStore } from '@/lib/feedback/store';
import { toClientView } from '@/lib/feedback/types';
import { parseTeamUpdate } from '@/lib/feedback/validate';
import { badRequest, json, notFound } from '../../respond';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getFeedbackSession();
  if (!session) return notFound();
  const { id } = await params;
  const found = await getFeedbackStore().get(id);
  if (!canSee(session, found)) return notFound();
  return json({ request: session.person.role === 'team' ? found : toClientView(found) });
}

/** Status, priority, owner, delivery date, type: team only. */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getFeedbackSession();
  if (!session || session.person.role !== 'team') return notFound();
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest('The change was not readable.');
  }
  const update = parseTeamUpdate(body);
  if (typeof update === 'string') return badRequest(update);

  const updated = await getFeedbackStore().update(id, update, session.person);
  if (!updated) return notFound();
  return json({ request: updated });
}
