/**
 * Publish: one request, one commit.
 *
 * The editor sends every value it changed. Each is written back into the file
 * it came from, then committed in the editor's name, so one publish is one
 * reviewable, revertable commit.
 *
 * Undo works the same way round. The response hands back a signed token per
 * Sanity change rather than the old text, and an undo sends those tokens in.
 * A value only ever skips cleaning when it arrives inside a token this server
 * signed itself — a raw value from a request body is always cleaned, whatever
 * the body claims about it.
 */
import { currentEditor, openValue, sealValue } from '@/lib/inline-edit/session';
import { editorOffResponse } from '@/lib/inline-edit/guard';
import { publish, type Change } from '@/lib/inline-edit/content-store';
import { publishSanity } from '@/lib/inline-edit/sanity-store';
import { commitUrl, recordEdit, siteIdentity, type ReceiptChange } from '@/lib/inline-edit/receipt';

/** A publish is a commit built over the GitHub API; give it room to finish. */
export const maxDuration = 60;

/** What the editor sends: typed text, or a token this server handed out for undo. */
type Incoming = { id?: unknown; value?: unknown; token?: unknown; expected?: unknown };

export async function POST(request: Request) {
  const off = editorOffResponse();
  if (off) return off;

  const editor = await currentEditor();
  if (!editor) return Response.json({ error: 'Sign in to publish' }, { status: 401 });

  let body: { changes?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Body is not JSON' }, { status: 400 });
  }

  const incoming = Array.isArray(body.changes) ? (body.changes as Incoming[]) : [];
  if (!incoming.length) return Response.json({ error: 'Nothing to publish' }, { status: 400 });
  if (incoming.length > 200) return Response.json({ error: 'Too many changes at once' }, { status: 400 });

  const changes: Change[] = [];
  for (const item of incoming) {
    if (typeof item?.id !== 'string') {
      return Response.json({ error: 'Each change needs an id and a value' }, { status: 400 });
    }

    if (typeof item.token === 'string') {
      // An undo. The value comes out of our own signature, never off the wire,
      // and the token has to be the one issued for this very field.
      const sealed = openValue(item.token);
      if (!sealed || sealed.id !== item.id) {
        return Response.json({ error: 'That undo has expired; reload the page and try again' }, { status: 400 });
      }
      changes.push({ id: item.id, value: sealed.value, exact: true });
      continue;
    }

    if (typeof item.value !== 'string') {
      return Response.json({ error: 'Each change needs an id and a value' }, { status: 400 });
    }
    // A page value is a sentence or two; an article body edit carries a list of sentences.
    const limit = item.id.startsWith('sanity:') ? 400_000 : 4000;
    if (item.value.length > limit) return Response.json({ error: 'That value is too long' }, { status: 400 });
    // What the page showed when it was opened. The store compares it with what
    // is stored now and refuses the publish if somebody else got there first.
    const expected =
      typeof item.expected === 'string' && item.expected.length <= limit ? item.expected : undefined;
    changes.push({ id: item.id, value: item.value, expected });
  }

  // Our own content ids and Sanity's stega-decoded ids are independent, so a
  // failure in one half never blocks or half-applies the other.
  const contentChanges = changes.filter((change) => !change.id.startsWith('sanity:'));
  const sanityChanges = changes.filter((change) => change.id.startsWith('sanity:'));

  let published = 0;
  let hash = '';
  let mode: string | undefined;
  // What the edit changed, for the receipt on the client's results timeline.
  // A Sanity publish makes no commit at all, so without this it leaves no
  // trace anywhere outside the CMS (2026-09-18).
  const receiptChanges: ReceiptChange[] = [];
  let receiptRef = '';
  let sanity: { id: string; token: string; after: string; draftKept: boolean }[] = [];
  // Whether the pages a Sanity patch touches were actually refreshed. The words
  // are in the CMS either way; a false here only means the public page catches
  // up on its own, which the editor says rather than calling the publish failed.
  let revalidated = true;
  const errors: string[] = [];

  if (contentChanges.length) {
    try {
      const result = await publish(contentChanges, editor);
      published += result.applied.filter((change) => change.before !== change.after).length;
      hash = result.hash;
      mode = result.mode;
      for (const change of result.applied) {
        if (change.before !== change.after) receiptChanges.push(change);
      }
      if (hash) receiptRef = hash;
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Publish failed');
    }
  }

  if (sanityChanges.length) {
    try {
      const result = await publishSanity(sanityChanges, editor);
      const applied = result.applied;
      revalidated = result.revalidated;
      published += applied.filter((change) => change.before !== change.after).length;
      // The token seals what was there before, so an undo can restore it word
      // for word. `after` is what the page should now show: the editor looks for
      // exactly that text on the public page. A whole article body is neither.
      for (const change of applied) {
        if (change.before !== change.after) receiptChanges.push(change);
      }
      // No commit exists for a Sanity patch; the document is the reference.
      if (!receiptRef && applied.length) receiptRef = applied[0].documentId;
      sanity = applied.map((change) => ({
        id: change.id,
        token: sealValue(change.id, change.before),
        after: change.body ? '' : change.after,
        draftKept: change.draftKept,
      }));
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Sanity publish failed');
    }
  }

  if (errors.length && !published) {
    return Response.json({ error: errors.join('; '), published: 0 }, { status: 400 });
  }

  // One receipt for the whole publish, sent and forgotten. Nothing below waits
  // for it and nothing it does can fail the publish.
  if (receiptChanges.length) {
    recordEdit({
      action: 'publish',
      changes: receiptChanges,
      editorEmail: editor,
      ref: receiptRef,
      referer: request.headers.get('referer'),
      refUrl: hash ? commitUrl(siteIdentity().repo, hash) : undefined,
    });
  }

  return Response.json({
    ok: errors.length === 0,
    published,
    hash,
    mode,
    sanity,
    revalidated,
    ...(errors.length ? { error: errors.join('; ') } : {}),
  });
}
