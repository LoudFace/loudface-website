/**
 * Who may comment on this site without being an editor, and the share link
 * that lets someone ask to.
 *
 * Arnel, 2026-10-29: comments should not need GitHub. Editors stay in the
 * site's own `src/data/editors.json`, changed through the GitHub App; a
 * commenter is a row in the Spine instead, so inviting one takes no commit, no
 * deploy and no GitHub access. A commenter signs in with their email exactly as
 * an editor does, and the routes that change the site refuse them
 * (`currentWriter` in `session.ts`).
 *
 * Two ways in, both proven by an email:
 *   - an invitation from anyone already signed in (`invite`);
 *   - the share link, `/edit?join=<token>`: the person types their address,
 *     and only the link in the email that answers adds them (`join`).
 *
 * Everything goes through the Spine's signed `/editor/comments` door, the same
 * door and secret comments use. Free of `server-only` so the tests can load it.
 */
import { commentsEndpoint, COMMENTS_OFF_MESSAGE } from './comments';
import { signBody, siteIdentity } from './receipt';

export type Commenter = {
  email: string;
  name: string | null;
  addedBy: string;
  addedVia: 'invite' | 'link' | 'team_app';
  addedAt: string;
};

export type ShareLink = { url: string; createdAt: string; createdBy: string };

type Actor = { email: string; name: string; owner: boolean };

type Answer<T> = { ok: true; data: T } | { ok: false; status: number; error: string };

const UNREACHABLE = 'The list of commenters could not be reached. Try again in a moment';
const TIMEOUT_MS = 8000;
/** How long a yes or no about one address is trusted before the Spine is asked again. */
const ACCESS_CACHE_MS = 60_000;

type Row = {
  email: string;
  name: string | null;
  added_by: string;
  added_via: Commenter['addedVia'];
  created_at: string;
};
type LinkRow = { token: string; created_at: string; created_by: string };

/** One signed request to the door. Answers the worker's JSON, or a sentence. */
async function ask(
  body: Record<string, unknown>,
  actor: Actor,
  now: () => Date = () => new Date(),
): Promise<Answer<Record<string, unknown>>> {
  const where = commentsEndpoint();
  if (!where) return { ok: false, status: 503, error: COMMENTS_OFF_MESSAGE };
  const { repo, site } = siteIdentity();
  const text = JSON.stringify({ ...body, repo, site, actor, at: now().toISOString() });
  let response: Response;
  try {
    response = await fetch(where.url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-lf-signature-256': signBody(where.secret, text) },
      body: text,
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: 'no-store',
    });
  } catch (error) {
    console.warn(`[lf-edit] commenters did not reach the spine: ${error instanceof Error ? error.message : 'unknown error'}`);
    return { ok: false, status: 502, error: UNREACHABLE };
  }
  const result = (await response.json().catch(() => null)) as Record<string, unknown> | null;
  if (!response.ok || !result) {
    const said = typeof result?.error === 'string' && !/^spine_http_/.test(result.error) ? result.error : '';
    if (!said) console.warn(`[lf-edit] commenters were refused by the spine: ${response.status}`);
    return { ok: false, status: response.status >= 500 ? 502 : response.status, error: said || UNREACHABLE };
  }
  return { ok: true, data: result };
}

/** The address a share link token opens, on this site. */
export function joinUrl(token: string): string {
  const site = (siteIdentity().site || '').replace(/\/+$/, '');
  return `${site}/edit?join=${encodeURIComponent(token)}`;
}

/** A share link token as it may appear in an address: url-safe, 20 to 128 characters. */
export function isShareToken(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Za-z0-9_-]{20,128}$/.test(value);
}

function toLink(row: unknown): ShareLink | null {
  const link = row as LinkRow | null;
  if (!link || typeof link.token !== 'string') return null;
  return { url: joinUrl(link.token), createdAt: link.created_at, createdBy: link.created_by };
}

function toCommenters(rows: unknown): Commenter[] {
  if (!Array.isArray(rows)) return [];
  return (rows as Row[]).map((row) => ({
    email: row.email,
    name: row.name ?? null,
    addedBy: row.added_by,
    addedVia: row.added_via,
    addedAt: row.created_at,
  }));
}

/** The door needs somebody to ask on behalf of; a lookup before sign-in asks as the site. */
const SITE_ACTOR: Actor = { email: 'site@loudface.co', name: 'site', owner: false };

const accessCache = new Map<string, { at: number; commenter: boolean }>();

/** Forget cached answers: after a change here, and in the tests. */
export function forgetAccess(email?: string): void {
  if (email) accessCache.delete(email.trim().toLowerCase());
  else accessCache.clear();
}

/**
 * Is this address a commenter on this site? Cached a minute per instance, so a
 * removal takes effect within a minute everywhere. A failed lookup answers no:
 * nobody gets in on an error.
 */
export async function isCommenter(email: string): Promise<boolean> {
  const wanted = email.trim().toLowerCase();
  if (!wanted) return false;
  const cached = accessCache.get(wanted);
  if (cached && Date.now() - cached.at < ACCESS_CACHE_MS) return cached.commenter;
  const answer = await ask({ op: 'access', email: wanted }, SITE_ACTOR);
  if (!answer.ok) return false;
  const commenter = answer.data.commenter === true;
  accessCache.set(wanted, { at: Date.now(), commenter });
  return commenter;
}

/** Everyone who may comment, and the live share link if there is one. */
export async function listCommenters(actor: Actor): Promise<Answer<{ commenters: Commenter[]; link: ShareLink | null }>> {
  const answer = await ask({ op: 'commenters' }, actor);
  if (!answer.ok) return answer;
  return { ok: true, data: { commenters: toCommenters(answer.data.commenters), link: toLink(answer.data.link) } };
}

/** Add someone as a commenter. `created` is false when they already were one. */
export async function inviteCommenter(email: string, actor: Actor): Promise<Answer<{ created: boolean }>> {
  const answer = await ask({ op: 'invite', email }, actor);
  forgetAccess(email);
  if (!answer.ok) return answer;
  return { ok: true, data: { created: answer.data.created === true } };
}

/** Take someone's comment access away. Owners only; the door checks too. */
export async function removeCommenter(email: string, actor: Actor): Promise<Answer<{ removed: boolean }>> {
  const answer = await ask({ op: 'remove', email }, actor);
  forgetAccess(email);
  if (!answer.ok) return answer;
  return { ok: true, data: { removed: answer.data.removed === true } };
}

/** The live share link, made if there is none yet. */
export async function shareLink(actor: Actor): Promise<Answer<ShareLink | null>> {
  const answer = await ask({ op: 'link' }, actor);
  if (!answer.ok) return answer;
  return { ok: true, data: toLink(answer.data.link) };
}

/** A new link, and the old one stops working. Owners only. */
export async function resetShareLink(actor: Actor): Promise<Answer<ShareLink | null>> {
  const answer = await ask({ op: 'link_reset' }, actor);
  if (!answer.ok) return answer;
  return { ok: true, data: toLink(answer.data.link) };
}

/** No share link at all. Owners only. */
export async function turnOffShareLink(actor: Actor): Promise<Answer<null>> {
  const answer = await ask({ op: 'link_off' }, actor);
  if (!answer.ok) return answer;
  return { ok: true, data: null };
}

/** Does this share link still let anyone in? Adds nobody. */
export async function shareLinkIsLive(token: string): Promise<boolean> {
  if (!isShareToken(token)) return false;
  const answer = await ask({ op: 'link_check', token }, SITE_ACTOR);
  return answer.ok && answer.data.live === true;
}

/**
 * The person proved their address from the email a share link sent them: add
 * them. A link turned off or replaced in between answers no.
 */
export async function joinWithLink(token: string, email: string): Promise<boolean> {
  if (!isShareToken(token)) return false;
  const clean = email.trim().toLowerCase();
  const answer = await ask({ op: 'join', token, email: clean }, { email: clean, name: clean.split('@')[0] || clean, owner: false });
  forgetAccess(clean);
  return answer.ok;
}
