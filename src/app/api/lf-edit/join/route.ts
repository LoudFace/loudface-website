/**
 * The share link's form (2026-10-29): somebody opened `/edit?join=<token>` and
 * typed their address.
 *
 * Nobody is added here. A live link sends a confirmation email; the person is
 * added when they open the link inside it (`verify`), so the commenter list
 * only ever holds addresses somebody proved are theirs. A link that was turned
 * off or replaced says so. Five requests per address and per caller every ten
 * minutes, as the sign-in page.
 */
import { headers } from 'next/headers';
import { editorOffResponse } from '@/lib/inline-edit/guard';
import { isShareToken, shareLinkIsLive } from '@/lib/inline-edit/commenters';
import { isValidEmail, normalizeEmail } from '@/lib/inline-edit/editors-list';
import { sendJoinLink } from '@/lib/inline-edit/signin-mail';

async function publicOrigin(request: Request): Promise<string> {
  if (process.env.LF_SITE_URL) return process.env.LF_SITE_URL.replace(/\/$/, '');
  const head = await headers();
  const host = head.get('x-forwarded-host') ?? head.get('host');
  const proto = head.get('x-forwarded-proto') ?? 'https';
  return host ? `${proto}://${host}` : new URL(request.url).origin;
}

const WINDOW_MS = 10 * 60_000;
const PER_WINDOW = 5;
const attempts = new Map<string, number[]>();

function tooMany(key: string): boolean {
  const now = Date.now();
  const recent = (attempts.get(key) ?? []).filter((at) => now - at < WINDOW_MS);
  recent.push(now);
  attempts.set(key, recent);
  if (attempts.size > 500) {
    for (const [seen, times] of attempts) if (!times.some((at) => now - at < WINDOW_MS)) attempts.delete(seen);
  }
  return recent.length > PER_WINDOW;
}

export async function POST(request: Request) {
  const off = editorOffResponse();
  if (off) return off;

  const form = await request.formData().catch(() => null);
  const token = String(form?.get('token') ?? '');
  const email = normalizeEmail(String(form?.get('email') ?? ''));
  const origin = await publicOrigin(request);
  const back = (query: string) => Response.redirect(`${origin}/edit?${query}`, 303);

  if (!isShareToken(token)) return back('join=ended');
  if (!isValidEmail(email) || email.includes('|')) return back(`join=${encodeURIComponent(token)}&bad=1`);

  const head = await headers();
  const caller = (head.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';
  const flooding = [tooMany(`ip:${caller}`), tooMany(`email:${email}`)].some(Boolean);
  if (flooding) return back('sent=1&join=1');

  if (!(await shareLinkIsLive(token))) return back('join=ended');

  const { link, configured } = await sendJoinLink(email, origin, token);
  if (!configured && process.env.NODE_ENV !== 'production') {
    return Response.redirect(`${origin}/edit?sent=1&join=1&link=${encodeURIComponent(link)}`, 303);
  }
  return back('sent=1&join=1');
}
