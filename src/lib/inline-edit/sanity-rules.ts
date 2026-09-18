/**
 * What a Sanity publish is allowed to touch, as plain decisions.
 *
 * The pure half of `sanity-store.ts`: no client, no request, no `server-only`,
 * so a test can run every rule that decides whether a document may be patched,
 * whether a Studio draft is left alone, and whether an old picture may go.
 */
import { EDITABLE_TYPES } from '../revalidate-paths';

/**
 * What to do with the draft copy of a field that has just been published.
 *
 * A document can have two copies: the published one the site renders, and a
 * draft somebody is still working on in Studio. An inline edit writes the
 * published one. The draft is written too, but ONLY when it still says exactly
 * what the published copy said — then the two were in step and they stay in
 * step. A draft that says something else is unfinished Studio work: writing it
 * would throw that work away, and leaving it means the next Studio publish
 * quietly undoes the inline edit, so the client is told it is there.
 */
export type DraftDecision = 'patch' | 'keep';

export function draftDecision(
  draftExists: boolean,
  draftValue: unknown,
  publishedBefore: string,
): DraftDecision | null {
  if (!draftExists) return null;
  return draftValue === publishedBefore ? 'patch' : 'keep';
}

/** The note the editor shows for a field whose Studio draft was left as it is. */
export const DRAFT_KEPT_NOTE = 'A Studio draft of this field exists and was left as it is.';

/**
 * May the editor patch this document at all?
 *
 * Returns the refusal a client sees, or null to go ahead. Three rules:
 *
 *   - never a draft. The editor patches the published document; a `drafts.`
 *     id reaching the patch would publish somebody's unfinished Studio work;
 *   - never a system document. Anything under `_.` is Sanity's own machinery
 *     (permissions, releases), not the site's words;
 *   - only a type this site renders, `EDITABLE_TYPES`. Anything else has no
 *     known page, so an editor clicking on a page cannot be what changed it.
 *
 * The residual, on purpose: an editor may still edit any document of an
 * editable type, not only the ones this page rendered. The request carries no
 * proof of what the page held, and holding a per-session list of ids would be
 * the server-side session store this editor exists without. It is the same
 * power a Studio seat gives them, and every write is in Sanity's own history.
 */
export function documentRefusal(documentId: string, type: string | undefined): string | null {
  if (documentId.startsWith('drafts.')) {
    return 'That points at a Studio draft, which the editor never publishes; reload the page and try again';
  }
  if (documentId.startsWith('_.')) return 'That is not a page of this site';
  if (!type || !EDITABLE_TYPES.has(type)) {
    return `${type ?? 'That document'} is not a kind of page this editor can change; change it in Studio`;
  }
  return null;
}

/**
 * May the picture that was just replaced be deleted?
 *
 * Only when nothing points at it any more. The count comes from
 * `count(*[references($id)])`, which counts drafts as well as published
 * documents, so a Studio draft still using the old picture keeps it alive.
 */
export const shouldDeleteAsset = (referenceCount: number): boolean => referenceCount === 0;
