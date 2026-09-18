/**
 * Undo, in one place, for both things a publish can change.
 *
 * `{ hash }` undoes a git publish: a revert commit, the old wording back.
 * `{ token }` undoes an image swap in Sanity, where there is no commit to
 * revert — the token holds each field that was re-pointed and what it pointed
 * at before, signed by this server, so nothing a browser sends decides which
 * reference goes back into which field.
 */
import { currentEditor, openImageUndo } from '@/lib/inline-edit/session';
import { mode, undo } from '@/lib/inline-edit/content-store';
import { restoreImageAssets } from '@/lib/inline-edit/sanity-store';
import { editorOffResponse } from '@/lib/inline-edit/guard';

/** An undo is a revert commit over the GitHub API, or a batch of Sanity patches. */
export const maxDuration = 60;

export async function POST(request: Request) {
  const off = editorOffResponse();
  if (off) return off;

  const editor = await currentEditor();
  if (!editor) return Response.json({ error: 'Sign in first' }, { status: 401 });

  const body = await request.json().catch(() => ({}));

  if (typeof body.token === 'string') {
    const entries = openImageUndo(body.token);
    if (!entries) {
      return Response.json(
        { error: 'That undo has expired; reload the page and try again' },
        { status: 400 },
      );
    }
    try {
      const { restored, refs } = await restoreImageAssets(entries);
      // `markup` is what the status light looks for in the public page's HTML:
      // the previous asset id, back in the address of the picture.
      return Response.json({ ok: true, mode: 'sanity', restored, markup: refs });
    } catch (error) {
      return Response.json(
        { error: error instanceof Error ? error.message : 'Undo failed' },
        { status: 400 },
      );
    }
  }

  if (typeof body.hash !== 'string') return Response.json({ error: 'Which change?' }, { status: 400 });

  try {
    const { hash, restored, removed } = await undo(body.hash, editor);
    return Response.json({ ok: true, hash, restored, removed, mode: mode() });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Undo failed' },
      { status: 400 },
    );
  }
}
