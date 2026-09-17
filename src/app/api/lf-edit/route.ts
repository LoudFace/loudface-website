/**
 * Publish: one request, one commit.
 *
 * The editor sends every value it changed. Each is written back into the file
 * it came from, then committed in the editor's name, so one publish is one
 * reviewable, revertable commit.
 */
import { currentEditor } from '@/lib/inline-edit/session';
import { publish, type Change } from '@/lib/inline-edit/content-store';

export async function POST(request: Request) {
  const editor = await currentEditor();
  if (!editor) return Response.json({ error: 'Sign in to publish' }, { status: 401 });

  let body: { changes?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Body is not JSON' }, { status: 400 });
  }

  const changes = Array.isArray(body.changes) ? (body.changes as Change[]) : [];
  if (!changes.length) return Response.json({ error: 'Nothing to publish' }, { status: 400 });
  if (changes.length > 200) return Response.json({ error: 'Too many changes at once' }, { status: 400 });

  try {
    for (const change of changes) {
      if (typeof change?.id !== 'string' || typeof change?.value !== 'string') {
        throw new Error('Each change needs an id and a value');
      }
      if (change.value.length > 4000) throw new Error('That value is too long');
    }
    const result = await publish(changes, editor);
    const published = result.applied.filter((change) => change.before !== change.after).length;
    return Response.json({ ok: true, published, hash: result.hash, mode: result.mode });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Publish failed';
    return Response.json({ error: message, published: 0 }, { status: 400 });
  }
}
