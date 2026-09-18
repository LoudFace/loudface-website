/**
 * Ask for a sign-in link.
 *
 * Answers the same way whether or not the address is allow-listed, so the page
 * cannot be used to find out who has access to a client's site. The same neutral
 * answer covers a rate-limited request: five a ten minutes per address and per
 * caller, which is plenty for a person and useless for a mailbox flood.
 */
import { headers } from 'next/headers';
import { isAllowed } from '@/lib/inline-edit/session';
import { sendSignInLink } from '@/lib/inline-edit/signin-mail';
import { editorOffResponse } from '@/lib/inline-edit/guard';

/** The address the visitor actually used, not the port we listen on. */
async function publicOrigin(request: Request): Promise<string> {
  if (process.env.LF_SITE_URL) return process.env.LF_SITE_URL.replace(/\/$/, '');
  const head = await headers();
  const host = head.get('x-forwarded-host') ?? head.get('host');
  const proto = head.get('x-forwarded-proto') ?? 'https';
  return host ? `${proto}://${host}` : new URL(request.url).origin;
}

const WINDOW_MS = 10 * 60_000;
const PER_WINDOW = 5;
/**
 * In memory, so it resets when the server does and is per instance. That is the
 * right size for the problem: it stops one browser or one script hammering an
 * address, and nothing here is worth a shared store.
 */
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
  const email = String(form?.get('email') ?? '').trim();
  const origin = await publicOrigin(request);
  const head = await headers();
  const caller = (head.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';

  // Both counters always run, so a blocked caller cannot tell from the timing
  // whether the address was allow-listed.
  const flooding = [tooMany(`ip:${caller}`), tooMany(`email:${email.toLowerCase()}`)].some(Boolean);

  if (email && !flooding && (await isAllowed(email))) {
    // The mail itself, its logging and its neutral failure live in
    // signin-mail.ts: the Editors panel sends the same message to an invited
    // colleague, and one message is one place to keep right.
    const { link, configured } = await sendSignInLink(email, origin);
    if (!configured && process.env.NODE_ENV !== 'production') {
      // No mail service configured: in development the link is shown on the
      // page, so testing needs no inbox.
      return Response.redirect(`${origin}/edit?sent=1&link=${encodeURIComponent(link)}`, 303);
    }
  }

  return Response.redirect(`${origin}/edit?sent=1`, 303);
}
