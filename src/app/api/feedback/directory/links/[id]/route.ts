import type { NextRequest } from 'next/server';
import { getFeedbackSession } from '@/lib/feedback/access';
import { getDirectory, saveDirectory } from '@/lib/feedback/directory';
import { json, notFound } from '../../../respond';

export const dynamic = 'force-dynamic';

/** Switch one private link off. The browser using it loses access on its next request. */
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getFeedbackSession();
  if (!session || session.person.role !== 'team') return notFound();
  const { id } = await params;
  const directory = await getDirectory();
  if (!directory.links.some((l) => l.id === id)) return notFound();
  await saveDirectory({ ...directory, links: directory.links.filter((l) => l.id !== id) });
  return json({ ok: true });
}
