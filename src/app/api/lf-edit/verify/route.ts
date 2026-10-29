/**
 * Open the session: verify the link, set the cookies, land on the site.
 */
import { draftMode } from 'next/headers';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { editorOffResponse, safeNext } from '@/lib/inline-edit/guard';
import {
  SESSION_COOKIE,
  createSessionToken,
  readJoinToken,
  readSignInToken,
  sessionCookieOptions,
} from '@/lib/inline-edit/session';
import { joinWithLink } from '@/lib/inline-edit/commenters';

export async function GET(request: Request) {
  const off = editorOffResponse();
  if (off) return off;

  const url = new URL(request.url);
  const token = url.searchParams.get('token') ?? '';
  let email = readSignInToken(token);
  if (!email) {
    // The link a share link sent: the address is proven now, so this is the
    // moment it becomes a commenter. A share link turned off or replaced in
    // between lets nobody in.
    const join = readJoinToken(token);
    if (!join) redirect('/edit?expired=1');
    if (!(await joinWithLink(join.link, join.email))) redirect('/edit?join=ended');
    email = join.email;
  }

  (await cookies()).set(SESSION_COOKIE, createSessionToken(email), sessionCookieOptions);
  (await draftMode()).enable();

  redirect(safeNext(url.searchParams.get('next')));
}
