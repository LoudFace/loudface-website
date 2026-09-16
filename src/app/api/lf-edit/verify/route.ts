/**
 * Open the session: verify the link, set the cookies, land on the site.
 */
import { draftMode } from 'next/headers';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  SESSION_COOKIE,
  createSessionToken,
  readSignInToken,
  sessionCookieOptions,
} from '@/lib/inline-edit/session';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = readSignInToken(url.searchParams.get('token') ?? '');
  if (!email) redirect('/edit?expired=1');

  (await cookies()).set(SESSION_COOKIE, createSessionToken(email), sessionCookieOptions);
  (await draftMode()).enable();

  const next = url.searchParams.get('next');
  redirect(next && next.startsWith('/') ? next : '/');
}
