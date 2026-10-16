/**
 * The picture of a thread's spot: GET ?id=<comment id>.
 *
 * Taken by the spine's hooks worker just after the thread was made (a real
 * Chrome on the live page at the commenter's width, pin drawn) and kept in R2.
 * Only someone signed in to this site's editor can see it. A picture never
 * changes once taken, so the browser may keep it.
 */
import { currentEditor, isAllowed, owners } from '@/lib/inline-edit/session';
import { editorOffResponse } from '@/lib/inline-edit/guard';
import { actorFor, fetchSnapshot } from '@/lib/inline-edit/comments';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const off = editorOffResponse();
  if (off) return off;
  const editor = await currentEditor();
  if (!editor || !(await isAllowed(editor))) return Response.json({ error: 'Sign in first' }, { status: 401 });

  const id = new URL(request.url).searchParams.get('id') ?? '';
  const result = await fetchSnapshot(id, actorFor(editor, owners()));
  if (!result.ok) return Response.json({ error: result.error }, { status: result.status });
  return new Response(result.image, {
    headers: { 'content-type': 'image/jpeg', 'cache-control': 'private, max-age=31536000, immutable' },
  });
}
