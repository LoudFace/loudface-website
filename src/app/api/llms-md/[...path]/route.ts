import { renderPageMarkdown, markdownNotFound } from '@/lib/markdown-page';

export const revalidate = 3600;

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
  const markdown = await renderPageMarkdown(pagePath, origin);

  const headers = {
    'Content-Type': 'text/markdown; charset=utf-8',
    Vary: 'Accept, Accept-Encoding',
    'Cache-Control': 'public, max-age=3600, s-maxage=3600',
  };

  if (!markdown) {
    return new Response(markdownNotFound(pagePath), { status: 404, headers });
  }

  return new Response(markdown, { headers });
}
