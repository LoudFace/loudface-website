/**
 * Comments: read the site's threads, and write to them.
 *
 * GET  ?since=<iso>  every live comment, or every change after `since` (deleted
 *                    ones included, so the browser can take them away).
 * POST {op, ...}     create, reply, edit, resolve, delete.
 *
 * The person must be signed in and still allowed to edit: removing somebody
 * from the Editors panel stops their comments at once, not in eight hours.
 * Everything else is the spine's to keep (`src/lib/inline-edit/comments.ts`).
 */
import { currentEditor, isAllowed, owners } from '@/lib/inline-edit/session';
import { editorOffResponse } from '@/lib/inline-edit/guard';
import { actorFor, askComments, readOp } from '@/lib/inline-edit/comments';

export const dynamic = 'force-dynamic';

const WRITE_WINDOW_MS = 10 * 60_000;
const WRITES_PER_WINDOW = 60;
/** In memory, per server instance: enough to stop one browser flooding a thread. */
const writes = new Map<string, number[]>();

function tooManyWrites(editor: string): boolean {
  const now = Date.now();
  const recent = (writes.get(editor) ?? []).filter((at) => now - at < WRITE_WINDOW_MS);
  recent.push(now);
  writes.set(editor, recent);
  if (writes.size > 200) {
    for (const [seen, times] of writes) {
      if (!times.some((at) => now - at < WRITE_WINDOW_MS)) writes.delete(seen);
    }
  }
  return recent.length > WRITES_PER_WINDOW;
}

async function signedInEditor(): Promise<string | null> {
  const editor = await currentEditor();
  if (!editor) return null;
  return (await isAllowed(editor)) ? editor : null;
}

function answer(result: Awaited<ReturnType<typeof askComments>>, you: string) {
  if (!result.ok) return Response.json({ error: result.error }, { status: result.status });
  return Response.json({ comments: result.comments, now: result.now, you });
}

export async function GET(request: Request) {
  const off = editorOffResponse();
  if (off) return off;
  const editor = await signedInEditor();
  if (!editor) return Response.json({ error: 'Sign in first' }, { status: 401 });

  const since = new URL(request.url).searchParams.get('since') ?? undefined;
  const result = await askComments(
    { op: 'list', ...(since && !Number.isNaN(Date.parse(since)) ? { since } : {}) },
    actorFor(editor, owners()),
  );
  return answer(result, editor);
}

export async function POST(request: Request) {
  const off = editorOffResponse();
  if (off) return off;
  const editor = await signedInEditor();
  if (!editor) return Response.json({ error: 'Sign in first' }, { status: 401 });

  const op = readOp(await request.json().catch(() => null));
  if (!op) return Response.json({ error: 'That comment could not be read' }, { status: 400 });
  if (tooManyWrites(editor)) {
    return Response.json({ error: 'That is a lot of comments at once. Wait a few minutes and try again' }, { status: 429 });
  }
  return answer(await askComments(op, actorFor(editor, owners())), editor);
}
