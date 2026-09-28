import type { NextRequest } from 'next/server';
import { canSee, getFeedbackSession } from '@/lib/feedback/access';
import { getFeedbackStore } from '@/lib/feedback/store';
import { toClientView } from '@/lib/feedback/types';
import { parseComment } from '@/lib/feedback/validate';
import { badRequest, json, notFound } from '../../../respond';

export const dynamic = 'force-dynamic';

/** A reply in the request's thread, from the client or the team. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getFeedbackSession();
  if (!session) return notFound();
  const { id } = await params;
  const store = getFeedbackStore();
  if (!canSee(session, await store.get(id))) return notFound();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest('The reply was not readable.');
  }
  const text = parseComment(body);
  if (!text) return badRequest('Write a reply first.');

  const updated = await store.addComment(id, text, session.person);
  if (!updated) return notFound();
  return json({ request: session.person.role === 'team' ? updated : toClientView(updated) });
}
