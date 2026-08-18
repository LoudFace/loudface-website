import { NextResponse, type NextRequest } from 'next/server';
import { POSTHOG_DISTINCT_ID_COOKIE } from './lib/consent';

const DISTINCT_ID_MAX_AGE = 60 * 60 * 24 * 365; // 12 months

// URLs that were once published and are now permanently removed. 410 Gone tells
// Google/Bing to drop the URL from their index immediately — a plain 404 leaves
// the URL in flux for months. Add to this list when a case study or blog post
// is unpublished and won't redirect to a relevant alternative.
const GONE_URLS = new Set<string>([
  // finnrick-* moved to 301s in next.config.ts 2026-07-19 — they were indexed,
  // and indexed URLs get a 301 to the nearest alternative, not a 410
  // (per /blog/stop-410-url-decay-decision-tree).
  '/case-studies/mycryptoguide',
  '/case-studies/draw-things',
]);

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (GONE_URLS.has(pathname)) {
    return new NextResponse('Gone', { status: 410, headers: { 'content-type': 'text/plain' } });
  }

  // Serve .md variants of pages by rewriting to the llms-md catch-all route
  if (pathname.endsWith('.md') && !pathname.startsWith('/api/') && !pathname.startsWith('/studio/')) {
    const pagePath = pathname.slice(0, -3); // strip .md
    return NextResponse.rewrite(
      new URL(`/api/llms-md${pagePath}`, request.url)
    );
  }

  // A first-party ID lets the server choose the hero before React renders and
  // lets posthog-js keep later browser events on the same visitor. The browser
  // cannot return a new response cookie during this request, so also put the ID
  // into the forwarded request cookie header for the homepage and layout to read.
  const existingDistinctId = request.cookies.get(POSTHOG_DISTINCT_ID_COOKIE)?.value;
  const distinctId = existingDistinctId ?? crypto.randomUUID();
  if (!existingDistinctId) {
    request.cookies.set(POSTHOG_DISTINCT_ID_COOKIE, distinctId);
  }

  // Forward the request pathname so server components (notably (site)/layout.tsx)
  // can build per-page canonical/hreflang URLs without needing client-side hooks.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);
  const response = NextResponse.next({ request: { headers: requestHeaders } });

  if (!existingDistinctId) {
    response.cookies.set(POSTHOG_DISTINCT_ID_COOKIE, distinctId, {
      maxAge: DISTINCT_ID_MAX_AGE,
      path: '/',
      sameSite: 'lax',
      secure: request.nextUrl.protocol === 'https:',
    });
  }

  return response;
}

export const config = {
  matcher: [
    // All site routes except api/_next/static assets/studio/audit/files with extensions.
    '/((?!api|_next/static|_next/image|studio|audit|.*\\..*).*)',
    '/case-studies/:slug*.md',
    '/blog/:slug*.md',
  ],
};
