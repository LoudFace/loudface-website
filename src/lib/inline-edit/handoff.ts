/**
 * One click from the Team App into this site's editor, 2026-10-16.
 *
 * Arnel: "There should be a very easy access button that allows you to just
 * click and go to the designer or editor." Then: "Yes, build the one-click Open
 * editor button: signed handoff from the Team App, site still checks the person
 * may edit."
 *
 * The Team App already knows who is looking (their Google sign-in). Its "Open
 * editor" button seals that address, this site's own address and a deadline
 * one minute out with `LF_TEAM_HANDOFF_SECRET`, a secret only the Team App and
 * the editor sites hold, and posts the token here in a form. This site checks
 * the seal, the deadline and that the token names this site, then still checks
 * that the address may edit (owners and invited editors, `isAllowed`) before it
 * opens a session. A token for loudface.co is useless on delshadlegal.com.
 *
 * It travels in a POST body, never in an address: Vercel's request log keeps
 * addresses, and a token in one would be readable there for its minute.
 *
 * Same format as a sign-in token (`session.ts`): base64url of
 * `handoff|<email>|<deadline ms>|<site origin>`, a dot, and the HMAC-SHA256 of
 * that text in base64url. Free of `server-only` so the tests can load it.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';

/** How long a handoff lasts. The browser posts it within a second; the rest is slack for a slow phone. */
export const HANDOFF_SECONDS = 60;

const sign = (secret: string, payload: string) => createHmac('sha256', secret).update(payload).digest('base64url');

/** The origin a token is for, written one way: `https://host`, no path, no trailing slash. */
export function originOf(site: string): string | null {
  try {
    const url = new URL(site);
    return url.protocol === 'https:' || url.hostname === 'localhost' ? url.origin : null;
  } catch {
    return null;
  }
}

/** What the Team App does. Kept here too so the tests can make real tokens. */
export function sealHandoff(secret: string, email: string, site: string, now = Date.now()): string {
  const origin = originOf(site);
  if (!origin) throw new Error('A handoff names an https site');
  const payload = `handoff|${email.trim().toLowerCase()}|${now + HANDOFF_SECONDS * 1000}|${origin}`;
  return `${Buffer.from(payload).toString('base64url')}.${sign(secret, payload)}`;
}

export type HandoffResult =
  | { ok: true; email: string }
  | { ok: false; reason: 'off' | 'bad' | 'expired' | 'wrong-site' };

/**
 * Read a token for `site`. Every failure but an expired one is "bad": the
 * person needs only to know it did not work and to press the button again.
 */
export function openHandoff(secret: string | undefined, token: string, site: string, now = Date.now()): HandoffResult {
  if (!secret) return { ok: false, reason: 'off' };
  const [body, signature] = (token ?? '').split('.');
  if (!body || !signature) return { ok: false, reason: 'bad' };
  const payload = Buffer.from(body, 'base64url').toString();
  const expected = Buffer.from(sign(secret, payload));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return { ok: false, reason: 'bad' };

  const [kind, email, deadline, origin] = payload.split('|');
  if (kind !== 'handoff' || !email || !deadline || !origin) return { ok: false, reason: 'bad' };
  const until = Number(deadline);
  // A deadline further out than a handoff can be was not made by the Team App.
  if (!Number.isFinite(until) || until > now + (HANDOFF_SECONDS + 5) * 1000) return { ok: false, reason: 'bad' };
  if (until < now) return { ok: false, reason: 'expired' };
  if (origin !== originOf(site)) return { ok: false, reason: 'wrong-site' };
  return { ok: true, email };
}
