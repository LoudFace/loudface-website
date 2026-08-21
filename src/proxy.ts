import { NextResponse, type NextRequest } from 'next/server';
import { POSTHOG_DISTINCT_ID_COOKIE } from './lib/consent';
import { MARKDOWN_RENDER_HEADER } from './lib/markdown-page';

const DISTINCT_ID_MAX_AGE = 60 * 60 * 24 * 365; // 12 months

/* ── Markdown content negotiation (acceptmarkdown.com) ─────────── */

/** Quality value an Accept header gives one media type, 0 when absent. */
function quality(accept: string, type: string): number {
  for (const part of accept.split(',')) {
    const [rawType, ...parameters] = part.trim().split(';');
    if (rawType.trim() !== type) continue;

    const q = parameters
      .map((parameter) => parameter.trim())
      .find((parameter) => parameter.startsWith('q='));

    return q ? parseFloat(q.slice(2)) || 0 : 1;
  }
  return 0;
}

/**
 * True when the caller asked for Markdown and did not rank HTML above it.
 * Browsers send `text/html,...` with no Markdown at all, so they never match.
 */
function prefersMarkdown(accept: string | null): boolean {
  if (!accept) return false;
  const header = accept.toLowerCase();

  const markdown = Math.max(
    quality(header, 'text/markdown'),
    quality(header, 'text/x-markdown')
  );
  if (markdown === 0) return false;

  return markdown >= quality(header, 'text/html');
}

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

  // Same page, Markdown instead of HTML, for an agent that asks for it by
  // Accept header rather than by adding ".md". The renderer fetches pages
  // itself, so its own request carries a header that opts out of this.
  const negotiable =
    request.method === 'GET' &&
    !request.headers.has(MARKDOWN_RENDER_HEADER) &&
    !request.headers.has('rsc') &&
    !request.nextUrl.search.includes('_rsc=') &&
    !pathname.startsWith('/api/') &&
    !pathname.startsWith('/studio');

  if (negotiable && prefersMarkdown(request.headers.get('accept'))) {
    const segments = pathname.replace(/\.md$/, '').split('/').filter(Boolean);
    return NextResponse.rewrite(
      new URL(
        `/api/llms-md/${segments.length ? segments.join('/') : '__root__'}`,
        request.url
      )
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

  // This URL can answer in HTML or Markdown depending on Accept. Without this,
  // a CDN can hand whichever variant it cached first to everyone who asks.
  response.headers.append('Vary', 'Accept');

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
