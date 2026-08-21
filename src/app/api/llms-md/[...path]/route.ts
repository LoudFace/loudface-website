import { renderPageMarkdown, markdownNotFound } from '@/lib/markdown-page';

// The route decides caching per outcome via Cache-Control below, so the
// framework's own route cache must not store a response on its behalf —
// otherwise a 503 gets pinned for an hour.
export const dynamic = 'force-dynamic';

/**
 * Markdown variant of any page.
 *
 * Reachable two ways: directly at /api/llms-md/<path>, or — the one agents
 * actually use — by requesting the real URL with `Accept: text/markdown`,
 * which src/proxy.ts rewrites here.
 *
 * `Vary: Accept` is required: without it a CDN can hand the cached HTML to an
 * agent asking for Markdown, or the reverse, depending on which variant landed
 * in the cache first.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const segments = path.filter((segment) => segment !== '__root__');
  const pagePath = segments.length ? '/' + segments.join('/') : '/';

  const origin = new URL(request.url).origin;
  const result = await renderPageMarkdown(pagePath, origin);

  const headers = {
    'Content-Type': 'text/markdown; charset=utf-8',
    Vary: 'Accept, Accept-Encoding',
    'Cache-Control': 'public, max-age=3600, s-maxage=3600',
  };

  // A render that failed is not a page that's missing. Caching a 404 here
  // would take a good page off the agent-readable web for an hour over one
  // bad second, so this answers 503 and forbids caching it.
  if (result.status === 'error') {
    return new Response(
      '# 503 — Temporarily unavailable\n\nThis page could not be rendered as Markdown just now. Try again shortly.\n',
      {
        status: 503,
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          Vary: 'Accept, Accept-Encoding',
          'Cache-Control': 'no-store',
          'Retry-After': '30',
        },
      }
    );
  }

  if (result.status === 'not-found') {
    return new Response(markdownNotFound(pagePath), { status: 404, headers });
  }

  return new Response(result.markdown, { headers });
}
