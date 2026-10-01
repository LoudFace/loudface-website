import crypto from 'node:crypto';
import type { NextRequest } from 'next/server';
import { getFeedbackSession } from '@/lib/feedback/access';
import { getDirectory, newLinkToken, saveDirectory } from '@/lib/feedback/directory';
import { badRequest, json, notFound } from '../../respond';

export const dynamic = 'force-dynamic';

/** Make a private link for one person. Team only. */
export async function POST(request: NextRequest) {
  const session = await getFeedbackSession();
  if (!session || session.person.role !== 'team') return notFound();

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return badRequest('The request was not readable.');
  }
  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 60) : '';
  const role = body.role === 'team' ? 'team' : 'client';
  const client = typeof body.client === 'string' ? body.client : '';
  if (!name) return badRequest('Write the person\'s name.');

  const directory = await getDirectory();
  if (!directory.clients.some((c) => c.slug === client)) return badRequest('Pick a client from the list.');

  const link = {
    id: crypto.randomUUID(),
    token: newLinkToken(),
    client,
    name,
    role,
    created_at: new Date().toISOString(),
    created_by: session.person.name,
  } as const;
  await saveDirectory({ ...directory, links: [...directory.links, link] });
  return json({ link }, 201);
}
