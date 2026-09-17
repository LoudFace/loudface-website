import 'server-only';

/**
 * Who is allowed to edit.
 *
 * A client signs in with an email address we have allow-listed for this site.
 * They get a link that works once and lasts fifteen minutes; clicking it leaves
 * them with a session cookie and Draft Mode on. No password, no GitHub account,
 * no CMS seat.
 *
 * Both tokens are signed with LF_EDIT_SECRET. Nothing is stored server-side, so
 * there is no session database to run or leak.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { hasGitHubCredentials } from './github';

export const SESSION_COOKIE = 'lf_edit_session';
const SIGN_IN_MINUTES = 15;
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

export function allowedEditors(): string[] {
  return (process.env.LF_EDITOR_EMAILS ?? '')
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowed(email: string): boolean {
  const list = allowedEditors();
  if (!list.length) return false;
  return list.includes(email.trim().toLowerCase());
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

export const createSignInToken = (email: string) => seal('signin', email, SIGN_IN_MINUTES);
export const readSignInToken = (token: string) => open('signin', token);
export const createSessionToken = (email: string) => seal('session', email, SESSION_HOURS * 60);

/** The signed-in editor for this request, or null. */
export async function currentEditor(): Promise<string | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token ? open('session', token) : null;
}

export const sessionCookieOptions = {
  httpOnly: true as const,
  sameSite: 'lax' as const,
  secure: true as const,
  path: '/',
  maxAge: SESSION_HOURS * 60 * 60,
};
