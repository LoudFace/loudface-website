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
import { cleanValue, isStale, staleMessage } from './sanitize';
import { applyLinkReplacements, applyTextReplacements, parseBodyEdit } from './body-edit';
import { pathsFor } from '../revalidate-paths';
import { documentRefusal, draftDecision, shouldDeleteAsset } from './sanity-rules';
import { findAssetRefs, SANITY_ASSET_ID, sharedAssetRefusal } from './image-edit';
import type { ImageUndoEntry } from './session';

/**
 * One value to write. `exact` skips cleaning and is set by the server alone,
 * after it has verified its own undo token — never from a request body.
 * `expected` is what the page rendered, so a field somebody else changed in the
 * meantime is refused rather than overwritten.
 */
export type SanityChange = { id: string; value: string; exact?: boolean; expected?: string };
export type SanityApplied = {
  id: string;
  before: string;
  after: string;
  documentId: string;
  type: string;
  /** The whole-article body field, which is HTML megabytes rather than a sentence. */
  body: boolean;
  /** A Studio draft of this field said something else and was not touched. */
  draftKept: boolean;
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

type DocRead = { exists: boolean; value: unknown; type?: string; slug?: string };

/** One document's field value, its type and its slug: one round trip, not three. */
async function readDoc(
  client: ReturnType<typeof getEditorWriteClient>,
  id: string,
  path: string,
): Promise<DocRead> {
  const result = await client.fetch<{ value: unknown; _type?: string; slug?: string } | null>(
    `*[_id == $id][0]{ _type, "slug": slug.current, "value": ${path} }`,
    { id },
  );
  return { exists: result !== null, value: result?.value, type: result?._type, slug: result?.slug };
}

/**
 * Publish a batch of Sanity string edits. A change marked `exact` is written
 * verbatim; the route sets that flag only for a value it has just taken out of
 * one of its own signed undo tokens, so nothing a client typed ever skips
 * `cleanValue` on its way into a field the blog renders as HTML.
 */
export async function publishSanity(
  changes: SanityChange[],
  editor: string,
): Promise<{ applied: SanityApplied[]; revalidated: boolean }> {
  void editor; // Sanity's own audit trail records the API token, not a per-editor identity yet.
  const client = getEditorWriteClient();
  const applied: SanityApplied[] = [];
  const routes = new Set<string>();

  for (const change of changes) {
    const { documentId, path } = parseCompositeId(change.id);
    const publishedId = publishedIdOf(documentId);
    const draftId = `drafts.${publishedId}`;

    const [published, draft] = await Promise.all([
      readDoc(client, publishedId, path),
      readDoc(client, draftId, path),
    ]);
    // The published document is the one the site renders and the only one this
    // route writes. A document that exists as a draft alone has never been on
    // the public page, so there is nothing here to edit from it.
    if (!published.exists) {
      throw new Error(`${publishedId}: this page has not been published in Studio yet`);
    }
    const refusal = documentRefusal(publishedId, published.type);
    if (refusal) throw new Error(refusal);
    if (typeof published.value !== 'string') {
      throw new Error(`${path} on ${publishedId} is not a plain text field`);
    }

    // What the published document says NOW is the "before". Reading the draft
    // instead used to promote an unfinished Studio edit the moment a client
    // changed any word on the page.
    const before = published.value;
    if (change.exact !== true && !isBodyPath(path) && isStale(before, change.expected)) {
      throw new Error(staleMessage(path));
    }

    let after: string;
    if (change.exact === true) {
      after = change.value;
    } else if (isBodyPath(path)) {
      // The body arrives as a list of sentence replacements and link changes,
      // never as HTML. Sentences first, so a link whose words also changed is
      // still found by the address it carries rather than by its text.
      const edit = parseBodyEdit(change.value);
      after = applyLinkReplacements(applyTextReplacements(before, edit.replacements), edit.links);
    } else {
      after = cleanValue(change.value, before);
    }
    if (!after) throw new Error('A value cannot be emptied from the page');

    const decision = draftDecision(draft.exists, draft.value, before);
    if (after !== before) {
      await client.patch(publishedId).set({ [path]: after }).commit({ autoGenerateArrayKeys: true });
      if (decision === 'patch') {
        await client.patch(draftId).set({ [path]: after }).commit({ autoGenerateArrayKeys: true });
      }
    }

    routes.add(`${published.type ?? 'unknown'}:${published.slug ?? ''}`);
    applied.push({
      id: change.id,
      before,
      after,
      documentId: publishedId,
      type: published.type ?? 'unknown',
      body: isBodyPath(path),
      draftKept: decision === 'keep',
    });
  }

  const revalidated = await revalidateDocuments(routes);

  return { applied, revalidated };
}

/**
 * Refresh every page a set of documents renders onto. `keys` are `type:slug`
 * pairs, the same shape the webhook's `pathsFor` takes, so a Sanity edit made
 * from the page and one made in Studio invalidate exactly the same routes.
 *
 * It never throws. The words are already in Sanity by the time this runs, so a
 * refresh that fails is a page that catches up on its own within a minute — not
 * a failed publish, and reporting it as one had clients pressing Publish again.
 * Returns false in that case, and the editor says the page may be a minute late.
 */
async function revalidateDocuments(keys: Set<string>): Promise<boolean> {
  if (!keys.size) return true;
  try {
    const { revalidatePath } = await import('next/cache');
    for (const key of keys) {
      const separator = key.indexOf(':');
      const type = key.slice(0, separator);
      const slug = key.slice(separator + 1);
      for (const path of pathsFor(type, slug || undefined)) revalidatePath(path);
    }
    return true;
  } catch (error) {
    console.error(`[inline edit] could not refresh the pages after a Sanity patch: ${String(error)}`);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Images
// ---------------------------------------------------------------------------

/**
 * A Sanity document as we need it here: its own fields, whatever they are,
 * because the picture could be at any path and we have to go and look.
 */
type SanityDoc = Record<string, unknown> & { _id: string; _type?: string };

/**
 * A path this module is willing to patch.
 *
 * Every path it patches was produced by its own walk over a document it just
 * read, so this is a second lock on a door that is already shut — but the paths
 * also travel to the browser inside an undo token and come back, and a signature
 * proves who wrote a value, not that the value is sane.
 */
const ASSET_PATH = /^[A-Za-z0-9_]+(?:\[(?:\d+|_key=="[^"\\]*")\]|\.[A-Za-z0-9_]+)*\.asset\._ref$/;

export type ImageReplaced = {
  newAssetId: string;
  /** The new picture's address on Sanity's CDN, so the editor can watch for it. */
  url: string;
  /** How many fields now point at the new asset, drafts counted separately. */
  replaced: number;
  /** What each of those fields pointed at before, for the undo token. */
  previous: ImageUndoEntry[];
};

/** Which pages a document renders onto, as the `type:slug` key `revalidateDocuments` takes. */
const routeKey = (doc: SanityDoc): string => {
  const slug = (doc.slug as { current?: unknown } | undefined)?.current;
  return `${doc._type ?? 'unknown'}:${typeof slug === 'string' ? slug : ''}`;
};

/** A draft's id is the published id with `drafts.` in front; strip it to compare. */
const publishedOf = (id: string) => (id.startsWith('drafts.') ? id.slice('drafts.'.length) : id);

/**
 * Replace one Sanity image everywhere it is used, from a file the editor chose.
 *
 * Sanity assets are immutable and content-addressed: the bytes decide the id and
 * the URL, so there is no such thing as overwriting a picture in place. The
 * replacement is therefore an upload followed by a re-point of every reference,
 * on the published document and on its draft where one exists, so the live site
 * and the Studio never disagree about which image this is.
 *
 * A draft is only ever re-pointed where it still shows the same picture: the
 * walk looks for `asset._ref === <the old asset>`, so a draft whose Studio
 * editor has already chosen a different picture is left exactly as it is.
 *
 * The old asset goes only if nothing points at it any more — see below.
 */
export async function replaceImageAsset(
  assetId: string,
  bytes: Buffer,
  filename: string,
  contentType: string,
): Promise<ImageReplaced> {
  if (!SANITY_ASSET_ID.test(assetId)) throw new Error(`Bad Sanity asset id: ${assetId}`);
  const client = getEditorWriteClient();

  // Published documents only: a draft is found through its published id below,
  // and counting both would make a single page look like two places.
  const documents = await client.fetch<SanityDoc[]>(
    `*[!(_id in path("drafts.**")) && references($assetId)]`,
    { assetId },
  );
  if (!documents.length) {
    throw new Error('That image is not used by any published page, so there is nothing to replace');
  }
  const refusal = sharedAssetRefusal(documents.length);
  if (refusal) throw new Error(refusal);

  const draftIds = documents.map((doc) => `drafts.${doc._id}`);
  const drafts = await client.fetch<SanityDoc[]>(`*[_id in $ids]`, { ids: draftIds });

  // Upload only once the document side is known to be safe: an upload cannot be
  // taken back, and a refusal after it would leave an orphan asset behind.
  const asset = await client.assets.upload('image', bytes, { filename, contentType });

  const previous: ImageUndoEntry[] = [];
  const routes = new Set<string>();
  const byRoute = new Map(documents.map((doc) => [doc._id, routeKey(doc)]));

  for (const doc of [...documents, ...drafts]) {
    const paths = findAssetRefs(doc, assetId).filter((path) => ASSET_PATH.test(path));
    if (!paths.length) continue;

    const set: Record<string, string> = {};
    for (const path of paths) {
      set[path] = asset._id;
      previous.push({ documentId: doc._id, path, previousRef: assetId });
    }
    await client.patch(doc._id).set(set).commit({ autoGenerateArrayKeys: true });
    routes.add(byRoute.get(publishedOf(doc._id)) ?? routeKey(doc));
  }

  if (!previous.length) {
    throw new Error('That image could not be found on the page it belongs to; change it in Studio');
  }

  await revalidateDocuments(routes);
  await removeUnusedAsset(client, assetId);
  return { newAssetId: asset._id, url: asset.url, replaced: previous.length, previous };
}

/**
 * Delete the picture that was just replaced, if nothing points at it.
 *
 * Every replacement used to leave its old file in the project for ever, and a
 * client who swaps the same hero picture weekly pays for all of them. The count
 * covers drafts as well as published documents, so an unfinished Studio edit
 * still showing the old picture keeps it. A failure here is logged and nothing
 * more: the replacement itself has already worked, and tidying is not worth
 * turning into an error a client reads.
 *
 * The cost, stated plainly: the in-session Undo for a replaced picture puts the
 * old asset's reference back, and a reference to a deleted asset shows nothing.
 * `LF_EDIT_KEEP_REPLACED_IMAGES=1` turns the deletion off for a site where that
 * undo matters more than the storage.
 */
async function removeUnusedAsset(
  client: ReturnType<typeof getEditorWriteClient>,
  assetId: string,
): Promise<void> {
  if (process.env.LF_EDIT_KEEP_REPLACED_IMAGES === '1') return;
  try {
    const references = await client.fetch<number>(`count(*[references($assetId)])`, { assetId });
    if (!shouldDeleteAsset(references)) return;
    await client.delete(assetId);
  } catch (error) {
    console.error(`[inline edit] could not delete the replaced asset ${assetId}: ${String(error)}`);
  }
}

/**
 * Put previous image references back, exactly as they were.
 *
 * The entries come out of a token this server signed, so the refs are written
 * verbatim — the same rule the text undo follows. Returns the asset ids that are
 * on the page again, which is what the status light then looks for.
 */
export async function restoreImageAssets(
  entries: ImageUndoEntry[],
): Promise<{ restored: number; refs: string[] }> {
  const client = getEditorWriteClient();

  const byDocument = new Map<string, Record<string, string>>();
  for (const entry of entries) {
    if (!ASSET_PATH.test(entry.path)) throw new Error(`Bad Sanity path: ${entry.path}`);
    if (!DOC_ID.test(entry.documentId)) throw new Error(`Bad Sanity document id: ${entry.documentId}`);
    if (!SANITY_ASSET_ID.test(entry.previousRef)) throw new Error(`Bad Sanity asset id: ${entry.previousRef}`);
    const set = byDocument.get(entry.documentId) ?? {};
    set[entry.path] = entry.previousRef;
    byDocument.set(entry.documentId, set);
  }

  let restored = 0;
  for (const [documentId, set] of byDocument) {
    await client.patch(documentId).set(set).commit({ autoGenerateArrayKeys: true });
    restored += Object.keys(set).length;
  }

  const ids = [...byDocument.keys()].map(publishedOf);
  const documents = await client.fetch<SanityDoc[]>(`*[_id in $ids]`, { ids });
  await revalidateDocuments(new Set(documents.map(routeKey)));

  return { restored, refs: [...new Set(entries.map((entry) => entry.previousRef))] };
}
