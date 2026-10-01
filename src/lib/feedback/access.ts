import 'server-only';
import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { getDirectory } from './directory';
import type { Person, Role } from './types';

/**
 * Who may use the feedback tool, and how a browser proves it.
 *
 * Access starts from a private link, /fb/<token>. Nothing on the public site
 * points at it and the tool stays invisible for every other visitor.
 *
 * The links live in one env var, FEEDBACK_ACCESS, a JSON array:
 *   [{"token":"<32+ random chars>","client":"loudface","name":"Tamara","role":"team"}]
 * No entry, no tool: with the var unset every link answers 404.
 *
 * Opening a valid link sets two cookies:
 *   - FEEDBACK_COOKIE (httpOnly, signed) — the real key. It holds only a hash
 *     of the link token, so removing the entry from FEEDBACK_ACCESS revokes
 *     that browser on its next request. That is the off switch.
 *   - FEEDBACK_FLAG_COOKIE (readable, carries nothing) — lets the page decide
 *     whether to download the widget at all, without making every page
 *     dynamic. A hand-set flag gets you nothing: every API call checks the
 *     signed cookie.
 */

export const FEEDBACK_COOKIE = 'lf_fb';
export const FEEDBACK_FLAG_COOKIE = 'lf_fb_on';
export const FEEDBACK_COOKIE_MAX_AGE = 60 * 60 * 24 * 90; // 90 days

const COOKIE_VERSION = 'v1';

export interface AccessEntry {
  token: string;
  client: string;
  name: string;
  role: Role;
}

export interface FeedbackSession {
  client: string;
  person: Person;
}

/** Links from the env var (bootstrap) plus the ones made on the People tab. */
async function readEntries(): Promise<AccessEntry[]> {
  const fromEnv = readEnvEntries();
  // Without an env link nobody can reach the People tab, so the tool stays off.
  if (fromEnv.length === 0) return [];
  const directory = await getDirectory().catch(() => null);
  const fromDirectory: AccessEntry[] = (directory?.links ?? []).map(({ token, client, name, role }) => ({
    token,
    client,
    name,
    role,
  }));
  return [...fromEnv, ...fromDirectory];
}

function readEnvEntries(): AccessEntry[] {
  const raw = process.env.FEEDBACK_ACCESS;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is AccessEntry =>
        typeof entry?.token === 'string' &&
        entry.token.length >= 32 &&
        typeof entry.client === 'string' &&
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.client) &&
        typeof entry.name === 'string' &&
        (entry.role === 'team' || entry.role === 'client')
    );
  } catch {
    console.error('[feedback] FEEDBACK_ACCESS is not valid JSON; the tool is off.');
    return [];
  }
}

function tokenId(token: string): string {
  return crypto.createHash('sha256').update(token).digest('base64url').slice(0, 22);
}

let fallbackSecret: string | null = null;

function signingKey(): string {
  const configured = process.env.FEEDBACK_COOKIE_SECRET;
  if (configured && configured.length >= 16) return configured;
  // Same trade-off as the proposal gate: without a configured secret the
  // cookie stops working after a restart. Never insecure, just annoying.
  if (!fallbackSecret) fallbackSecret = crypto.randomBytes(32).toString('hex');
  return fallbackSecret;
}

function mac(id: string): string {
  return crypto
    .createHmac('sha256', signingKey())
    .update(`${COOKIE_VERSION}|${id}`)
    .digest('base64url');
}

function sameString(a: string, b: string): boolean {
  const left = crypto.createHash('sha256').update(a).digest();
  const right = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(left, right);
}

/** The entry behind a link token, or null. */
export async function findEntryByToken(token: string): Promise<AccessEntry | null> {
  return (await readEntries()).find((entry) => sameString(entry.token, token)) ?? null;
}

export function signSessionCookie(entry: AccessEntry): string {
  const id = tokenId(entry.token);
  return `${COOKIE_VERSION}.${id}.${mac(id)}`;
}

async function entryFromCookie(value: string | undefined): Promise<AccessEntry | null> {
  if (!value) return null;
  const [version, id, signature] = value.split('.');
  if (version !== COOKIE_VERSION || !id || !signature) return null;
  if (!sameString(signature, mac(id))) return null;
  // Re-resolve every time, so a removed link stops working at once.
  return (await readEntries()).find((entry) => tokenId(entry.token) === id) ?? null;
}

/** The signed-in feedback user for this request, or null. */
export async function getFeedbackSession(): Promise<FeedbackSession | null> {
  const store = await cookies();
  const entry = await entryFromCookie(store.get(FEEDBACK_COOKIE)?.value);
  if (!entry) return null;
  return { client: entry.client, person: { name: entry.name, role: entry.role } };
}

/** A client may only ever touch its own requests; the team may touch any. */
export function canSee<T extends { client_slug: string }>(
  session: FeedbackSession,
  request: T | null
): request is T {
  if (!request) return false;
  return session.person.role === 'team' || request.client_slug === session.client;
}
