/**
 * Publish: one request, one commit.
 *
 * The editor sends every value it changed. Each is written back into the file
 * it came from, then committed in the editor's name, so one publish is one
 * reviewable, revertable commit.
 */
import { currentEditor } from '@/lib/inline-edit/session';
import { publish, type Change } from '@/lib/inline-edit/content-store';
import { publishSanity } from '@/lib/inline-edit/sanity-store';

export async function POST(request: Request) {
  const editor = await currentEditor();
  if (!editor) return Response.json({ error: 'Sign in to publish' }, { status: 401 });

  let body: { changes?: unknown; exact?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Body is not JSON' }, { status: 400 });
  }

  const changes = Array.isArray(body.changes) ? (body.changes as Change[]) : [];
  if (!changes.length) return Response.json({ error: 'Nothing to publish' }, { status: 400 });
  if (changes.length > 200) return Response.json({ error: 'Too many changes at once' }, { status: 400 });
  const exact = body.exact === true;

  for (const change of changes) {
    if (typeof change?.id !== 'string' || typeof change?.value !== 'string') {
      return Response.json({ error: 'Each change needs an id and a value' }, { status: 400 });
    }
    // A page value is a sentence or two; an article body undo carries the whole stored article.
    const limit = change.id.startsWith('sanity:') ? 400_000 : 4000;
    if (change.value.length > limit) return Response.json({ error: 'That value is too long' }, { status: 400 });
  }

  // Our own content ids and Sanity's stega-decoded ids are independent, so a
  // failure in one half never blocks or half-applies the other.
  const contentChanges = changes.filter((change) => !change.id.startsWith('sanity:'));
  const sanityChanges = changes.filter((change) => change.id.startsWith('sanity:'));

  let published = 0;
  let hash = '';
  let mode: string | undefined;
  let sanity: { id: string; before: string; after: string }[] = [];
  const errors: string[] = [];

  if (contentChanges.length) {
    try {
      const result = await publish(contentChanges, editor);
      published += result.applied.filter((change) => change.before !== change.after).length;
      hash = result.hash;
      mode = result.mode;
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Publish failed');
    }
  }

  if (sanityChanges.length) {
    try {
      const applied = await publishSanity(sanityChanges, editor, exact);
      published += applied.filter((change) => change.before !== change.after).length;
      sanity = applied.map(({ id, before, after }) => ({ id, before, after }));
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Sanity publish failed');
    }
  }

  if (errors.length && !published) {
    return Response.json({ error: errors.join('; '), published: 0 }, { status: 400 });
  }
  return Response.json({
    ok: errors.length === 0,
    published,
    hash,
    mode,
    sanity,
    ...(errors.length ? { error: errors.join('; ') } : {}),
  });
}
