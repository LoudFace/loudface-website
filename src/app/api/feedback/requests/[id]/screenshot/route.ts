import type { NextRequest } from 'next/server';
import { canSee, getFeedbackSession } from '@/lib/feedback/access';
import { getFeedbackStore } from '@/lib/feedback/store';
import { notFound } from '../../../respond';

export const dynamic = 'force-dynamic';

/** The screenshot, served only to someone allowed to see the request. */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getFeedbackSession();
  if (!session) return notFound();
  const { id } = await params;
  const store = getFeedbackStore();
  if (!canSee(session, await store.get(id))) return notFound();

  const dataUrl = await store.getScreenshot(id);
  if (!dataUrl) return notFound();
  const bytes = Buffer.from(dataUrl.slice(dataUrl.indexOf(',') + 1), 'base64');
  return new Response(bytes, {
    headers: { 'content-type': 'image/jpeg', 'cache-control': 'private, no-store', 'x-robots-tag': 'noindex' },
  });
}
