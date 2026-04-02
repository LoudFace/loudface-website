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

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/case-studies/:slug*.md',
    '/blog/:slug*.md',
  ],
};
