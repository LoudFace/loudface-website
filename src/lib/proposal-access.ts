import 'server-only';
import crypto from 'node:crypto';
import type { ProposalGate } from '@/sanity/lib/proposalsClient';

/**
 * The gate in front of /p/<token>.
 *
 * Two secrets, two jobs:
 *   - the TOKEN in the URL makes the proposal non-enumerable;
 *   - the ACCESS CODE, typed once, unlocks the content and sets an httpOnly
 *     cookie so the client is not re-challenged on every visit.
 *
 * The cookie carries no content and no code — only an HMAC over
 * `<token>|<accessCode>`. Two consequences worth knowing:
 *   - a stolen cookie is worthless on any other proposal;
 *   - changing the access code in Studio invalidates every cookie already
 *     issued for that proposal. That is the revoke button.
 */

const COOKIE_VERSION = 'v1';

/* ── Signing key ──────────────────────────────────────────────────────── */

let fallbackSecret: string | null = null;

function signingKey(): string {
  const configured = process.env.PROPOSAL_COOKIE_SECRET;
  if (configured && configured.length >= 16) return configured;

  // No configured secret: use a random per-process one. Cookies then stop
  // working across a restart or across serverless instances, which means the
  // client is asked for the code again — annoying, never insecure.
  if (!fallbackSecret) {
    fallbackSecret = crypto.randomBytes(32).toString('hex');
    console.warn(
      '[proposals] PROPOSAL_COOKIE_SECRET is not set. Unlock cookies will not survive a restart.'
    );
  }
  return fallbackSecret;
}

/* ── Access code comparison ───────────────────────────────────────────── */

/** Clients retype codes from an email; ignore case and surrounding spaces. */
export function normalizeAccessCode(value: string): string {
  return value.trim().toUpperCase();
}

/**
 * Constant-time comparison. The codes are hashed first so the buffers are
 * always 32 bytes — timingSafeEqual throws on a length mismatch, and an
 * exception thrown early would itself leak the length of the real code.
 */
export function accessCodeMatches(submitted: string, expected: string): boolean {
  const a = crypto.createHash('sha256').update(normalizeAccessCode(submitted)).digest();
  const b = crypto.createHash('sha256').update(normalizeAccessCode(expected)).digest();
  return crypto.timingSafeEqual(a, b);
}

/* ── Cookie value ─────────────────────────────────────────────────────── */

export function signAccessCookie(token: string, accessCode: string): string {
  const mac = crypto
    .createHmac('sha256', signingKey())
    .update(`${COOKIE_VERSION}|${token}|${normalizeAccessCode(accessCode)}`)
    .digest('base64url');
  return `${COOKIE_VERSION}.${mac}`;
}

export function verifyAccessCookie(
  cookieValue: string | undefined,
  token: string,
  accessCode: string
): boolean {
  if (!cookieValue) return false;
  const expected = signAccessCookie(token, accessCode);
  if (cookieValue.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(cookieValue), Buffer.from(expected));
}

/* ── Availability ─────────────────────────────────────────────────────── */

/**
 * A proposal is readable only while it is sent or accepted AND still inside
 * its validity window. Everything else is a 404 — not an error page, because
 * "this proposal exists but you cannot see it" is itself information.
 */
export function isProposalLive(gate: Pick<ProposalGate, 'status' | 'validUntil'>): boolean {
  if (gate.status !== 'sent' && gate.status !== 'accepted') return false;
  if (!gate.validUntil) return false;

  // `validUntil` is a date with no time. Treat it as inclusive: the proposal
  // dies at the end of that day, UTC.
  const expiresAt = Date.parse(`${gate.validUntil}T23:59:59.999Z`);
  return Number.isFinite(expiresAt) && Date.now() <= expiresAt;
}

/* ── Rate limiting ────────────────────────────────────────────────────── */

/**
 * In-memory, per-instance. Good enough for v1: a handful of proposals, a
 * handful of readers. LIMITATION — the counter is not shared between
 * serverless instances and resets on deploy, so a determined attacker with
 * many IPs gets more than MAX_ATTEMPTS tries in total. The 130-bit token in
 * the URL is what actually makes the page unreachable; this only blunts
 * guessing once someone has the link. Move it to Redis (already in the repo,
 * REDIS_URL) if proposals ever carry something that must not be guessed.
 */
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 15 * 60 * 1000;

const attempts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 0, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_ATTEMPTS };
  }

  // Opportunistic cleanup so the map cannot grow without bound.
  if (attempts.size > 500) {
    for (const [k, v] of attempts) if (now > v.resetAt) attempts.delete(k);
  }

  return { allowed: entry.count < MAX_ATTEMPTS, remaining: Math.max(0, MAX_ATTEMPTS - entry.count) };
}

export function recordFailedAttempt(key: string): void {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  entry.count += 1;
}

export function clearAttempts(key: string): void {
  attempts.delete(key);
}

export const ACCESS_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
