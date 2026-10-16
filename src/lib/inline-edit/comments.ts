/**
 * Comments left on a page through the editor, 2026-10-16.
 *
 * Arnel: "point and click anywhere on the canvas to leave a comment annotation
 * that other people in the tool can also see."
 *
 * A comment is not content. One commit per comment would rebuild the site each
 * time somebody wrote "can we soften this line", so comments are kept in the
 * LoudFace spine (`public.site_comments`) and reached through its hooks worker,
 * at `/editor/comments` beside the receipts' `/editor/receipt`. The request is
 * signed with the same secret as a receipt, so a site that sends receipts needs
 * nothing new to carry comments.
 *
 * The split of who checks what:
 *
 *  - this site: who is signed in, and that they may still edit (the route);
 *  - the worker: the signature, that the request is fresh, that a client
 *    claims the repository, who may change or delete which comment;
 *  - the table: the shapes and sizes.
 *
 * Unlike a receipt, a comment is awaited: the person pressed Post and is
 * waiting to see it land. A spine that cannot be reached is a plain message in
 * the panel, never a stuck button.
 *
 * Free of `server-only` so the tests can load it; only the comments route
 * imports it.
 */
import { nameFor, signBody, siteIdentity } from './receipt';

/** A comment as the browser reads it. */
export type SiteComment = {
  id: string;
  threadId: string | null;
  page: string;
  anchor: Record<string, unknown> | null;
  body: string;
  author: { email: string; name: string; owner: boolean };
  resolvedAt: string | null;
  resolvedBy: string | null;
  editedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

/** The row as the worker returns it. */
type Row = {
  id: string;
  thread_id: string | null;
  page_path: string;
  anchor: Record<string, unknown> | null;
  body: string;
  author_email: string;
  author_name: string;
  author_is_owner: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
  edited_at: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CommentOp =
  | { op: 'list'; since?: string }
  | { op: 'create'; id: string; page: string; anchor: Record<string, unknown>; body: string }
  | { op: 'reply'; id: string; thread: string; body: string }
  | { op: 'edit'; id: string; body: string }
  | { op: 'resolve'; id: string; resolved: boolean }
  | { op: 'delete'; id: string };

export const COMMENTS_OFF_MESSAGE = 'Comments are not switched on for this site yet';
const UNREACHABLE = 'Comments could not be reached. Try again in a moment';
const TIMEOUT_MS = 8000;

/**
 * Where comments go: the receipt address with its last path swapped. A site
 * missing either receipt value has no comments either, and says so.
 */
export function commentsEndpoint(): { url: string; secret: string } | null {
  const hook = (process.env.LF_SPINE_HOOK_URL ?? '').trim();
  const secret = (process.env.LF_SPINE_HOOK_SECRET ?? '').trim();
  const { repo } = siteIdentity();
  if (!hook || !secret || !repo) return null;
  try {
    return { url: new URL('/editor/comments', hook).toString(), secret };
  } catch {
    return null;
  }
}

export function fromRow(row: Row): SiteComment {
  return {
    id: row.id,
    threadId: row.thread_id,
    page: row.page_path,
    anchor: row.anchor,
    body: row.body,
    author: { email: row.author_email, name: row.author_name, owner: row.author_is_owner },
    resolvedAt: row.resolved_at,
    resolvedBy: row.resolved_by,
    editedAt: row.edited_at,
    deletedAt: row.deleted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Who is asking, as the worker wants it. The name is the address's local part, as on a receipt. */
export function actorFor(email: string, ownerList: string[]): { email: string; name: string; owner: boolean } {
  const clean = email.trim().toLowerCase();
  return { email: clean, name: nameFor(clean), owner: ownerList.includes(clean) };
}

export type SpineAnswer =
  | { ok: true; comments: SiteComment[]; now?: string }
  | { ok: false; status: number; error: string };

/** Ask the worker, signed, and turn its answer into what the browser reads. */
export async function askComments(
  request: CommentOp,
  actor: { email: string; name: string; owner: boolean },
  now: () => Date = () => new Date(),
): Promise<SpineAnswer> {
  const where = commentsEndpoint();
  if (!where) return { ok: false, status: 503, error: COMMENTS_OFF_MESSAGE };
  const { repo } = siteIdentity();
  const body = JSON.stringify({ ...request, repo, actor, at: now().toISOString() });
  let response: Response;
  try {
    response = await fetch(where.url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-lf-signature-256': signBody(where.secret, body) },
      body,
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: 'no-store',
    });
  } catch (error) {
    console.warn(`[lf-edit] comments did not reach the spine: ${error instanceof Error ? error.message : 'unknown error'}`);
    return { ok: false, status: 502, error: UNREACHABLE };
  }
  const result = (await response.json().catch(() => null)) as
    | { comments?: Row[]; comment?: Row | null; now?: string; error?: string }
    | null;
  if (!response.ok || !result) {
    // The worker's own words are written for a person ("only the person who
    // wrote a comment can change it"); anything else becomes the plain message.
    const said = typeof result?.error === 'string' && !/^spine_http_/.test(result.error) ? result.error : '';
    if (!said) console.warn(`[lf-edit] comments were refused by the spine: ${response.status}`);
    return { ok: false, status: response.status >= 500 ? 502 : response.status, error: said || UNREACHABLE };
  }
  const rows = result.comments ?? (result.comment ? [result.comment] : []);
  return { ok: true, comments: rows.map(fromRow), now: result.now };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * What the browser may ask for, read from its request body. Anything else is
 * null, and the route answers 400 before the spine is asked at all.
 */
export function readOp(input: unknown): Exclude<CommentOp, { op: 'list' }> | null {
  if (!input || typeof input !== 'object') return null;
  const raw = input as Record<string, unknown>;
  const id = typeof raw.id === 'string' && UUID.test(raw.id) ? raw.id : '';
  const text = typeof raw.body === 'string' ? raw.body.trim().slice(0, 4000) : '';
  if (!id) return null;
  switch (raw.op) {
    case 'create': {
      const page = typeof raw.page === 'string' ? raw.page.split(/[?#]/)[0] : '';
      const anchor = raw.anchor && typeof raw.anchor === 'object' && !Array.isArray(raw.anchor)
        ? (raw.anchor as Record<string, unknown>) : null;
      if (!text || !page.startsWith('/') || page.startsWith('//') || !anchor) return null;
      if (JSON.stringify(anchor).length > 4000) return null;
      return { op: 'create', id, page, anchor, body: text };
    }
    case 'reply': {
      const thread = typeof raw.thread === 'string' && UUID.test(raw.thread) ? raw.thread : '';
      return text && thread ? { op: 'reply', id, thread, body: text } : null;
    }
    case 'edit':
      return text ? { op: 'edit', id, body: text } : null;
    case 'resolve':
      return { op: 'resolve', id, resolved: raw.resolved !== false };
    case 'delete':
      return { op: 'delete', id };
    default:
      return null;
  }
}
