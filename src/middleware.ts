import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
