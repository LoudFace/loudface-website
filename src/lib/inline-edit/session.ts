import 'server-only';

/**
 * Who is allowed to edit.
 *
 * A client signs in with an email address that has access to this site: one of
 * ours from `LF_EDITOR_EMAILS`, or somebody they invited from the Editors panel
 * (`editors.ts`, `src/data/editors.json`).
 * They get a link that works once and lasts 12 hours; clicking it leaves
 * them with a session cookie and Draft Mode on. No password, no GitHub account,
 * no CMS seat.
 *
 * Both tokens are signed with LF_EDIT_SECRET. Nothing is stored server-side, so
 * there is no session database to run or leak.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { hasGitHubCredentials } from './github';
import { loadEditors } from './editors';
import { mergeAccess } from './editors-list';
import { isCommenter } from './commenters';

export const SESSION_COOKIE = 'lf_edit_session';
import { SIGN_IN_MINUTES } from './editors-list';
const SESSION_HOURS = 8;
/** An undo token is useful for as long as the session that was handed it. */
const UNDO_HOURS = SESSION_HOURS;

/**
 * Is this a real deployment rather than a developer's laptop?
 *
 * NODE_ENV alone was not enough: a preview deployment, or a local server
 * pointed at the real repository, runs with NODE_ENV unset to 'production' and
 * would have signed real sessions with a secret that is printed in this file.
 * Anything that can publish for real must bring its own secret.
 */
function needsRealSecret(): boolean {
  return (
    process.env.NODE_ENV === 'production' ||
    Boolean(process.env.VERCEL) ||
    process.env.LF_EDIT_STORE === 'github' ||
    hasGitHubCredentials()
  );
}

function secret(): string {
  const value = process.env.LF_EDIT_SECRET;
  if (value) return value;
  if (needsRealSecret()) {
    throw new Error('LF_EDIT_SECRET is required wherever the editor can publish for real');
  }
  return 'development-only-inline-edit-secret';
}

/**
 * Our own addresses, from `LF_EDITOR_EMAILS`. These are the owners: fixed, set
 * outside the site, and not removable from the Editors panel.
 */
export function owners(): string[] {
  return (process.env.LF_EDITOR_EMAILS ?? '')
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * May this address sign in? The owners plus everyone invited into
 * `src/data/editors.json`, read at the branch head, so an invite works within a
 * minute and without a build.
 */
export async function isAllowed(email: string): Promise<boolean> {
  const wanted = email.trim().toLowerCase();
  if (!wanted) return false;
  if (owners().includes(wanted)) return true;
  const { list } = await loadEditors();
  return mergeAccess([], list.editors).includes(wanted);
}

/**
 * May this address sign in at all? Editors, and the commenters the Spine
 * holds (`commenters.ts`). A commenter's session reaches comments and nothing
 * else: every route that changes the site asks `currentWriter` instead.
 */
export async function mayComment(email: string): Promise<boolean> {
  return (await isAllowed(email)) || (await isCommenter(email));
}

/** What the signed-in person may do here, or null when they may do nothing. */
export async function roleOf(email: string | null): Promise<'editor' | 'commenter' | null> {
  if (!email) return null;
  if (await isAllowed(email)) return 'editor';
  return (await isCommenter(email)) ? 'commenter' : null;
}

function sign(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

/** Wrap a payload with its signature. */
function pack(payload: string): string {
  return `${Buffer.from(payload).toString('base64url')}.${sign(payload)}`;
}

/** The payload back, or null if the signature does not match ours. */
function unpack(token: string): string | null {
  const [body, signature] = token.split('.');
  if (!body || !signature) return null;

  const payload = Buffer.from(body, 'base64url').toString();
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  return payload;
}

function seal(kind: 'signin' | 'session', email: string, minutes: number): string {
  // Fields are separated by a pipe: an email address contains dots.
  return pack(`${kind}|${email.toLowerCase()}|${Date.now() + minutes * 60_000}`);
}

function open(kind: 'signin' | 'session', token: string): string | null {
  const payload = unpack(token);
  if (!payload) return null;

  const [tokenKind, email, expiry] = payload.split('|');
  if (tokenKind !== kind) return null;
  if (!email || !expiry || Number(expiry) < Date.now()) return null;
  return email;
}

/**
 * A value this server wrote down and can take back verbatim.
 *
 * Undo has to restore exactly what was there before, cleaning included — but a
 * value that arrives in a request body is the editor's typing, and cleaning it
 * is the only thing standing between a signed-in client and a <script> tag in a
 * page rendered with dangerouslySetInnerHTML. So the server hands out a sealed
 * copy of the old value instead, and only ever restores a value that comes back
 * inside its own seal.
 */
export function sealValue(id: string, value: string): string {
  return pack(JSON.stringify({ kind: 'undo', id, value, expires: Date.now() + UNDO_HOURS * 3_600_000 }));
}

/** The id and value inside an undo token, or null: unsigned, altered or expired. */
export function openValue(token: string): { id: string; value: string } | null {
  const payload = unpack(token);
  if (!payload) return null;
  let data: { kind?: unknown; id?: unknown; value?: unknown; expires?: unknown };
  try {
    data = JSON.parse(payload);
  } catch {
    return null;
  }
  if (data.kind !== 'undo' || typeof data.id !== 'string' || typeof data.value !== 'string') return null;
  if (typeof data.expires !== 'number' || data.expires < Date.now()) return null;
  return { id: data.id, value: data.value };
}

/**
 * One field that pointed at an image before it was replaced.
 *
 * An image undo cannot work like a text undo: what has to go back is a
 * reference, in a named field, on a named document — often several of them at
 * once, because one picture can appear in a document's draft and its published
 * copy. So the server writes the whole list down, signs it, and only ever
 * restores refs that come back inside its own signature.
 */
export type ImageUndoEntry = { documentId: string; path: string; previousRef: string };

export function sealImageUndo(entries: ImageUndoEntry[]): string {
  return pack(
    JSON.stringify({ kind: 'undo-image', entries, expires: Date.now() + UNDO_HOURS * 3_600_000 }),
  );
}

/** The fields inside an image undo token, or null: unsigned, altered or expired. */
export function openImageUndo(token: string): ImageUndoEntry[] | null {
  const payload = unpack(token);
  if (!payload) return null;
  let data: { kind?: unknown; entries?: unknown; expires?: unknown };
  try {
    data = JSON.parse(payload);
  } catch {
    return null;
  }
  if (data.kind !== 'undo-image' || !Array.isArray(data.entries) || !data.entries.length) return null;
  if (typeof data.expires !== 'number' || data.expires < Date.now()) return null;
  const entries: ImageUndoEntry[] = [];
  for (const entry of data.entries as ImageUndoEntry[]) {
    if (
      typeof entry?.documentId !== 'string' ||
      typeof entry?.path !== 'string' ||
      typeof entry?.previousRef !== 'string'
    ) {
      return null;
    }
    entries.push({ documentId: entry.documentId, path: entry.path, previousRef: entry.previousRef });
  }
  return entries;
}

export const createSignInToken = (email: string, minutes = SIGN_IN_MINUTES) => seal('signin', email, minutes);
export const readSignInToken = (token: string) => open('signin', token);
export const createSessionToken = (email: string) => seal('session', email, SESSION_HOURS * 60);

/**
 * The sign-in link a share link sends: the address, and which share link it
 * came through. The person is added as a commenter only when this comes back,
 * so the list holds addresses somebody has proven, never ones somebody typed.
 */
export function createJoinToken(email: string, linkToken: string, minutes = SIGN_IN_MINUTES): string {
  return pack(`join|${email.toLowerCase()}|${Date.now() + minutes * 60_000}|${linkToken}`);
}

export function readJoinToken(token: string): { email: string; link: string } | null {
  const payload = unpack(token);
  if (!payload) return null;
  const [kind, email, expiry, link] = payload.split('|');
  if (kind !== 'join' || !email || !link || !expiry || Number(expiry) < Date.now()) return null;
  return { email, link };
}

/** The signed-in person for this request, editor or commenter, or null. */
export async function currentEditor(): Promise<string | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token ? open('session', token) : null;
}

/**
 * The signed-in person, only if they may change the site. Since 2026-10-29 a
 * session can belong to a commenter, so a session alone no longer means an
 * editor: every route that writes asks this, and a commenter gets null.
 */
export async function currentWriter(): Promise<string | null> {
  const email = await currentEditor();
  return email && (await isAllowed(email)) ? email : null;
}

export const sessionCookieOptions = {
  httpOnly: true as const,
  sameSite: 'lax' as const,
  secure: true as const,
  path: '/',
  maxAge: SESSION_HOURS * 60 * 60,
};
