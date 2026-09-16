/**
 * Ask for a sign-in link.
 *
 * Answers the same way whether or not the address is allow-listed, so the page
 * cannot be used to find out who has access to a client's site.
 */
import { headers } from 'next/headers';
import { createSignInToken, isAllowed } from '@/lib/inline-edit/session';

/** The address the visitor actually used, not the port we listen on. */
async function publicOrigin(request: Request): Promise<string> {
  if (process.env.LF_SITE_URL) return process.env.LF_SITE_URL.replace(/\/$/, '');
  const head = await headers();
  const host = head.get('x-forwarded-host') ?? head.get('host');
  const proto = head.get('x-forwarded-proto') ?? 'https';
  return host ? `${proto}://${host}` : new URL(request.url).origin;
}

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const email = String(form?.get('email') ?? '').trim();
  const origin = await publicOrigin(request);

  if (email && isAllowed(email)) {
    const link = `${origin}/api/lf-edit/verify?token=${createSignInToken(email)}`;
    const key = process.env.RESEND_API_KEY;
    const from = process.env.LF_EDIT_FROM;

    if (key && from) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          from,
          to: email,
          subject: 'Your link to edit the site',
          text: `Open this link to edit the site. It expires in 15 minutes.\n\n${link}\n`,
        }),
      }).catch(() => undefined);
    } else if (process.env.NODE_ENV !== 'production') {
      // No mail service configured: in development the link is shown on the
      // page and logged, so testing needs no inbox.
      console.log(`\n[inline edit] sign-in link for ${email}:\n${link}\n`);
      return Response.redirect(`${origin}/edit?sent=1&link=${encodeURIComponent(link)}`, 303);
    }
  }

  return Response.redirect(`${origin}/edit?sent=1`, 303);
}
