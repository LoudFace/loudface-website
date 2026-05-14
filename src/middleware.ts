import { NextResponse, type NextRequest } from 'next/server';

// URLs that were once published and are now permanently removed. 410 Gone tells
// Google/Bing to drop the URL from their index immediately — a plain 404 leaves
// the URL in flux for months. Add to this list when a case study or blog post
// is unpublished and won't redirect to a relevant alternative.
const GONE_URLS = new Set<string>([
  '/case-studies/finnrick-analytics',
  '/case-studies/mycryptoguide',
  '/case-studies/draw-things',
]);

export function middleware(request: NextRequest) {
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

  // Forward the request pathname so server components (notably (site)/layout.tsx)
  // can build per-page canonical/hreflang URLs without needing client-side hooks.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    // All site routes except api/_next/static assets/studio/audit/files with extensions.
    '/((?!api|_next/static|_next/image|studio|audit|.*\\..*).*)',
    '/case-studies/:slug*.md',
    '/blog/:slug*.md',
  ],
};
