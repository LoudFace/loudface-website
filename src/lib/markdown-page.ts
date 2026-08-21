/**
 * Markdown variants of real pages, for AI agents.
 *
 * Agents that send `Accept: text/markdown` get the page as Markdown instead of
 * HTML (the acceptmarkdown.com convention). `src/proxy.ts` does the negotiation
 * and rewrites those requests to /api/llms-md/<path>, which calls in here.
 *
 * Two sources, in order:
 *   1. generatePageMarkdown() — hand-built Markdown from Sanity for blog posts
 *      and case studies. Cleanest output, so it wins when it matches.
 *   2. This file's HTML fallback — fetches the page's own server-rendered HTML,
 *      keeps the <main> element, and converts it with the same htmlToMarkdown()
 *      that llms-full.txt uses. Every static page gets a Markdown variant this
 *      way without anyone hand-authoring one per page.
 */

import { generatePageMarkdown, htmlToMarkdown } from './llms-utils';

const SITE_URL = 'https://www.loudface.co';

/** Marks a self-fetch so the proxy never negotiates it back into Markdown. */
export const MARKDOWN_RENDER_HEADER = 'x-loudface-md-render';

/**
 * Pull the readable part out of a rendered page: the <main> element, minus
 * scripts, styles, inline SVG and anything else an agent can't read.
 */
function extractMain(html: string): string | null {
  const main = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (!main) return null;

  return main[1]
    // Tags that sit flush against each other would otherwise run their text
    // together ("2h response timeSee what AI says").
    .replace(/></g, '>\n<')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, '')
    .replace(/<template[\s\S]*?<\/template>/gi, '');
}

/** First <h1> on the page, used as the Markdown title. */
function extractTitle(html: string): string | null {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (!h1) return null;
  const text = h1[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return text || null;
}

/** Collapse the blank-line noise that comes out of a machine conversion. */
function tidy(markdown: string): string {
  return markdown
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * The three outcomes a Markdown render can have. The caller must be able to
 * tell "this page does not exist" from "rendering it failed just now": the
 * first is a cacheable 404, the second must not be cached at all, or one
 * Sanity blip pins a 404 on a perfectly good page for the next hour.
 */
export type MarkdownResult =
  | { status: 'ok'; markdown: string }
  | { status: 'not-found' }
  | { status: 'error' };

/**
 * Markdown for a page path.
 *
 * `origin` is the origin to self-fetch from — the live deployment in
 * production, localhost in dev — so a preview deploy renders its own content
 * rather than the production site's.
 */
export async function renderPageMarkdown(
  path: string,
  origin: string = SITE_URL
): Promise<MarkdownResult> {
  // 1. Purpose-built Markdown from the CMS (blog posts, case studies).
  // A CMS outage throws here rather than returning nothing, so a dropped
  // Sanity connection is reported as an error, not as a missing page.
  let authored: string | null;
  try {
    authored = await generatePageMarkdown(path);
  } catch {
    return { status: 'error' };
  }
  if (authored) return { status: 'ok', markdown: tidy(authored) };

  // 2. Fall back to the page's own HTML.
  let response: Response;
  try {
    response = await fetch(new URL(path, origin), {
      headers: {
        Accept: 'text/html',
        [MARKDOWN_RENDER_HEADER]: '1',
      },
      // Not cached: a failed render must not be stored and replayed. The
      // route's own response is CDN-cached for an hour, so this re-renders
      // only on a cache miss.
      cache: 'no-store',
    });
  } catch {
    // The page never answered — a network fault, not a missing page.
    return { status: 'error' };
  }

  // Only 404 and 410 actually assert "there is no page here". Every other
  // unhappy status — 5xx, 429, 403, anything — is the site failing to answer,
  // and must not be cached as a missing page.
  if (response.status === 404 || response.status === 410) {
    return { status: 'not-found' };
  }
  if (!response.ok) return { status: 'error' };

  const html = await response.text();

  // The page answered 200 but we couldn't get readable content out of it: no
  // <main>, or almost nothing inside it. That is a half-rendered page far more
  // often than a real one (an error boundary, a CMS query that came back
  // empty), and we cannot tell the two apart from here. Treat it as a failure
  // rather than caching a 404 over a page that exists.
  const main = extractMain(html);
  if (!main) return { status: 'error' };

  const body = tidy(htmlToMarkdown(main));
  if (body.length < 200) return { status: 'error' };

  const title = extractTitle(html);
  const canonical = new URL(path, SITE_URL).toString();

  // Only add a title when the converted body doesn't already open with one,
  // otherwise the page gets two H1s.
  const bodyHasTitle = title !== null && body.includes(`# ${title}`);

  const header = [
    title && !bodyHasTitle ? `# ${title}` : null,
    `Source: ${canonical}`,
  ]
    .filter((line) => line !== null)
    .join('\n');

  return { status: 'ok', markdown: tidy(`${header}\n\n${body}`) };
}

/**
 * Body for a Markdown 404 — a dead end for a human, but an agent can recover
 * from it, so it points at the places worth trying next.
 */
export function markdownNotFound(path: string): string {
  return [
    '# 404 — Page not found',
    '',
    `No page exists at \`${path}\` on ${SITE_URL}.`,
    '',
    '## Where to look next',
    '',
    `- [Site map](${SITE_URL}/sitemap.xml) — every indexable URL`,
    `- [llms.txt](${SITE_URL}/llms.txt) — the site in brief, for models`,
    `- [llms-full.txt](${SITE_URL}/llms-full.txt) — full content of every page`,
    `- [Home](${SITE_URL}/)`,
    `- [Case studies](${SITE_URL}/case-studies)`,
    `- [Blog](${SITE_URL}/blog)`,
    `- [Services](${SITE_URL}/services)`,
    `- [Contact](${SITE_URL}/contact)`,
    '',
  ].join('\n');
}
