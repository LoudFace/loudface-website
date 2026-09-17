import 'server-only';

/**
 * Publishing a Sanity-backed string straight from the page.
 *
 * The editor sends a composite id, `sanity:<documentId>:<path>`, built from
 * the stega mark decoded on the client (see `stega.ts` and `InlineEditor.tsx`
 * `discover()`). This module turns that back into a document and a GROQ path,
 * reads the field's current value so we know it is really a plain string,
 * cleans the edit the same way the JSON content store does, and patches both
 * the published document and its draft (whichever of the two exist) so the
 * live site and the Studio agree.
 *
 * No git commit here — Sanity is its own source of truth and keeps its own
 * document history. That means Sanity edits do not show up in the inline
 * editor's git-backed History panel yet; the route seals each `before` value
 * into a signed token so the editor can offer an in-session Undo without ever
 * sending the old text back through the browser (see `route.ts`).
 */
import { getEditorWriteClient } from '../sanity.client';
import { cleanValue } from './sanitize';
import { applyTextReplacements, parseBodyEdit } from './body-edit';
import { pathsFor } from '../revalidate-paths';

/**
 * One value to write. `exact` skips cleaning and is set by the server alone,
 * after it has verified its own undo token — never from a request body.
 */
export type SanityChange = { id: string; value: string; exact?: boolean };
export type SanityApplied = {
  id: string;
  before: string;
  after: string;
  documentId: string;
  type: string;
  /** The whole-article body field, which is HTML megabytes rather than a sentence. */
  body: boolean;
};

const DOC_ID = /^[A-Za-z0-9_.-]+$/;
const NAME_SEGMENT = /^[a-zA-Z0-9_]+/;
const KEY_SEGMENT = /^\[_key\s*==\s*"[^"\\]*"\]/;

/** The article body: one HTML field, edited by text replacement, never rewritten (see body-edit.ts). */
const BODY_PATHS = new Set(['content', 'body']);
export const isBodyPath = (path: string) => BODY_PATHS.has(path);

/** Accept plain field paths only: names, dots and `[_key=="x"]` selectors. */
function validatePath(path: string): void {
  const first = NAME_SEGMENT.exec(path);
  if (!first) throw new Error(`Bad Sanity path: ${path}`);
  let rest = path.slice(first[0].length);
  while (rest.length) {
    if (rest[0] === '.') {
      const seg = NAME_SEGMENT.exec(rest.slice(1));
      if (!seg) throw new Error(`Bad Sanity path: ${path}`);
      rest = rest.slice(1 + seg[0].length);
    } else if (rest[0] === '[') {
      const seg = KEY_SEGMENT.exec(rest);
      if (!seg) throw new Error(`Bad Sanity path: ${path}`);
      rest = rest.slice(seg[0].length);
    } else {
      throw new Error(`Bad Sanity path: ${path}`);
    }
  }
}

function parseCompositeId(id: string): { documentId: string; path: string } {
  const rest = id.slice('sanity:'.length);
  const sep = rest.indexOf(':');
  if (sep === -1) throw new Error(`Bad Sanity id: ${id}`);
  const documentId = rest.slice(0, sep);
  const path = rest.slice(sep + 1);
  if (!documentId || !DOC_ID.test(documentId)) throw new Error(`Bad Sanity document id: ${documentId}`);
  if (!path) throw new Error(`Bad Sanity path: ${path}`);
  validatePath(path);
  return { documentId, path };
}

/** The published document id never carries the `drafts.` prefix a stega mark may decode to. */
const publishedIdOf = (documentId: string) =>
  documentId.startsWith('drafts.') ? documentId.slice('drafts.'.length) : documentId;

async function readDoc(
  client: ReturnType<typeof getEditorWriteClient>,
  id: string,
  path: string,
): Promise<{ exists: boolean; value: unknown }> {
  const result = await client.fetch<{ value: unknown } | null>(`*[_id == $id][0]{ "value": ${path} }`, { id });
  return { exists: result !== null, value: result?.value };
}

/**
 * Publish a batch of Sanity string edits. A change marked `exact` is written
 * verbatim; the route sets that flag only for a value it has just taken out of
 * one of its own signed undo tokens, so nothing a client typed ever skips
 * `cleanValue` on its way into a field the blog renders as HTML.
 */
export async function publishSanity(changes: SanityChange[], editor: string): Promise<SanityApplied[]> {
  void editor; // Sanity's own audit trail records the API token, not a per-editor identity yet.
  const client = getEditorWriteClient();
  const applied: SanityApplied[] = [];
  const revalidated = new Set<string>();

  for (const change of changes) {
    const { documentId, path } = parseCompositeId(change.id);
    const publishedId = publishedIdOf(documentId);
    const draftId = `drafts.${publishedId}`;

    const [published, draft] = await Promise.all([
      readDoc(client, publishedId, path),
      readDoc(client, draftId, path),
    ]);
    if (!published.exists && !draft.exists) throw new Error(`${publishedId}: document not found in Sanity`);

    // The draft is what the editor is actually looking at in Draft Mode; fall
    // back to the published value only for a document with no draft.
    const source = draft.exists ? draft : published;
    if (typeof source.value !== 'string') throw new Error(`${path} on ${publishedId} is not a plain text field`);

    const before = source.value;
    let after: string;
    if (change.exact === true) {
      after = change.value;
    } else if (isBodyPath(path)) {
      // The body arrives as a list of sentence replacements, not as HTML.
      after = applyTextReplacements(before, parseBodyEdit(change.value).replacements);
    } else {
      after = cleanValue(change.value, before);
    }
    if (!after) throw new Error('A value cannot be emptied from the page');

    if (after !== before) {
      const targets = [draft.exists ? draftId : null, published.exists ? publishedId : null].filter(
        (id): id is string => Boolean(id),
      );
      await Promise.all(targets.map((id) => client.patch(id).set({ [path]: after }).commit({ autoGenerateArrayKeys: true })));
    }

    const meta = await client.fetch<{ _type?: string; slug?: string }>(
      `*[_id == $id][0]{ _type, "slug": slug.current }`,
      { id: published.exists ? publishedId : draftId },
    );
    const type = meta?._type ?? 'unknown';
    const key = `${type}:${meta?.slug ?? ''}`;
    revalidated.add(key);

    applied.push({ id: change.id, before, after, documentId: publishedId, type, body: isBodyPath(path) });
  }

  const { revalidatePath } = await import('next/cache');
  for (const key of revalidated) {
    const [type, slug] = key.split(':');
    for (const path of pathsFor(type, slug || undefined)) revalidatePath(path);
  }

  return applied;
}
