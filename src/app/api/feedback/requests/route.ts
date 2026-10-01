import type { NextRequest } from 'next/server';
import { getFeedbackSession } from '@/lib/feedback/access';
import { contactsFor } from '@/lib/feedback/directory';
import { getFeedbackStore } from '@/lib/feedback/store';
import { toClientView } from '@/lib/feedback/types';
import { parseNewRequest } from '@/lib/feedback/validate';
import { badRequest, json, notFound } from '../respond';

export const dynamic = 'force-dynamic';

/**
 * GET  ?scope=mine (default) — the signed-in client's requests, for the widget.
 * GET  ?scope=all            — every client, team only, for the board.
 * POST                       — a new request from the widget.
 */
export async function GET(request: NextRequest) {
  const session = await getFeedbackSession();
  if (!session) return notFound();
  const store = getFeedbackStore();
  const scope = request.nextUrl.searchParams.get('scope');

  if (scope === 'all') {
    if (session.person.role !== 'team') return notFound();
    return json({ requests: await store.list({}) });
  }

  const rows = await store.list({ client: session.client });
  const requests = session.person.role === 'team' ? rows : rows.map(toClientView);
  return json({ requests });
}

export async function POST(request: NextRequest) {
  const session = await getFeedbackSession();
  if (!session) return notFound();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest('The request was not readable.');
  }
  const parsed = parseNewRequest(body, await contactsFor(session.client));
  if (typeof parsed === 'string') return badRequest(parsed);

  const created = await getFeedbackStore().create({
    ...parsed,
    client_slug: session.client,
    created_by: session.person,
  });
  return json({ request: session.person.role === 'team' ? created : toClientView(created) }, 201);
}
