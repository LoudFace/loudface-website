import { NextResponse, type NextRequest } from 'next/server';
import {
  FEEDBACK_COOKIE,
  FEEDBACK_COOKIE_MAX_AGE,
  FEEDBACK_FLAG_COOKIE,
  findEntryByToken,
  signSessionCookie,
} from '@/lib/feedback/access';
import { sameSiteRedirect } from '@/lib/same-site-redirect';

export const dynamic = 'force-dynamic';

/**
 * The private link: /fb/<token>. A valid token signs this browser in and
 * opens the site with the feedback button. Anything else is a plain 404.
 * ?to=/some/path opens a specific page instead of the homepage; a value that
 * would leave this site opens the homepage.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const entry = await findEntryByToken(token);
  if (!entry) {
    return new NextResponse('Not found', { status: 404, headers: { 'x-robots-tag': 'noindex' } });
  }

  const response = NextResponse.redirect(
    sameSiteRedirect(request.nextUrl.searchParams.get('to'), request.nextUrl.origin),
  );
  response.headers.set('cache-control', 'no-store');
  response.headers.set('x-robots-tag', 'noindex');
  response.headers.set('referrer-policy', 'no-referrer');

  const secure = request.nextUrl.protocol === 'https:';
  response.cookies.set(FEEDBACK_COOKIE, signSessionCookie(entry), {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: FEEDBACK_COOKIE_MAX_AGE,
  });
  response.cookies.set(FEEDBACK_FLAG_COOKIE, '1', {
    httpOnly: false,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: FEEDBACK_COOKIE_MAX_AGE,
  });
  return response;
}
