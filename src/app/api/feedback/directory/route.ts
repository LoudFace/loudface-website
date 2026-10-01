import type { NextRequest } from 'next/server';
import { getFeedbackSession } from '@/lib/feedback/access';
import { getDirectory, saveDirectory, SLUG, type DirectoryClient } from '@/lib/feedback/directory';
import { badRequest, json, notFound } from '../respond';

export const dynamic = 'force-dynamic';

/** The People tab: team members and clients. Team only. Links have their own route. */
export async function GET() {
  const session = await getFeedbackSession();
  if (!session || session.person.role !== 'team') return notFound();
  return json({ directory: await getDirectory() });
}

const cleanName = (value: unknown) => (typeof value === 'string' ? value.trim().slice(0, 60) : '');

export async function PUT(request: NextRequest) {
  const session = await getFeedbackSession();
  if (!session || session.person.role !== 'team') return notFound();

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return badRequest('The change was not readable.');
  }

  const team = Array.isArray(body.team)
    ? Array.from(new Set(body.team.map(cleanName).filter(Boolean)))
    : null;
  if (!team || team.length === 0) return badRequest('Keep at least one team member.');

  if (!Array.isArray(body.clients)) return badRequest('The client list is missing.');
  const clients: DirectoryClient[] = [];
  for (const raw of body.clients as Record<string, unknown>[]) {
    const slug = cleanName(raw?.slug).toLowerCase();
    const name = cleanName(raw?.name);
    if (!SLUG.test(slug)) return badRequest(`"${slug || '(empty)'}" is not a valid client id. Use lower-case letters, digits and dashes.`);
    if (!name) return badRequest(`Give the client "${slug}" a name.`);
    if (clients.some((c) => c.slug === slug)) return badRequest(`The client id "${slug}" is used twice.`);
    const contacts = Array.isArray(raw.contacts) ? raw.contacts.map(cleanName).filter((n) => team.includes(n)) : [];
    clients.push({ slug, name, contacts });
  }

  const directory = await getDirectory();
  // A client with live links or requests cannot vanish by accident: its links stay valid
  // only while it is listed, so removing it here is the off switch for that client.
  const next = { ...directory, team, clients, links: directory.links.filter((l) => clients.some((c) => c.slug === l.client)) };
  await saveDirectory(next);
  return json({ directory: next });
}
