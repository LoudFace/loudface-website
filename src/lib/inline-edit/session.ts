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

export const SESSION_COOKIE = 'lf_edit_session';
const SIGN_IN_MINUTES = 15;
const SESSION_HOURS = 8;

function secret(): string {
  const value = process.env.LF_EDIT_SECRET;
  if (value) return value;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('LF_EDIT_SECRET is required to run the editor in production');
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

function seal(kind: 'signin' | 'session', email: string, minutes: number): string {
  // Fields are separated by a pipe: an email address contains dots.
  const payload = `${kind}|${email.toLowerCase()}|${Date.now() + minutes * 60_000}`;
  return `${Buffer.from(payload).toString('base64url')}.${sign(payload)}`;
}

function open(kind: 'signin' | 'session', token: string): string | null {
  const [body, signature] = token.split('.');
  if (!body || !signature) return null;

  const payload = Buffer.from(body, 'base64url').toString();
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;

  const [tokenKind, email, expiry] = payload.split('|');
  if (tokenKind !== kind) return null;
  if (!email || !expiry || Number(expiry) < Date.now()) return null;
  return email;
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
