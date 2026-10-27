// robots.txt as a route handler rather than `robots.ts`: Next's MetadataRoute.Robots has no way to
// write the Content-Signal and Content-Usage lines, and Peec's Agent readiness audit (and the
// agents it models) read both. Rules below are the ones `robots.ts` held until 2026-10-27.
//
// ─── /preview/* handling — READ BEFORE EDITING ───────────────────
// Client design proofs under /preview/* are kept out of Google Search by the
// `X-Robots-Tag: noindex` HEADER (see next.config.ts), NOT by a robots.txt
// disallow. Do NOT add '/preview/' to the default (`*`) group: a `noindex`
// only works if Googlebot is ALLOWED to crawl the page and read the header —
// a disallow blocks the crawl, so the noindex is never seen and the bare URL
// can still get indexed.
// https://developers.google.com/search/docs/crawling-indexing/block-indexing
//
// The AI bots below also disallow /preview/, but that is ADVISORY ONLY: a courtesy to keep proofs
// out of AI fetch, not a privacy control, and no effect on Google Search. noindex ≠ private:
// /preview/ URLs are public by default. Never gate with robots.txt. Details: public/preview/README.md.

import { CONTENT_SIGNAL, CONTENT_USAGE } from '@/lib/agent-policy';

export const dynamic = 'force-static';

/** What we allow, said in the two machine-readable vocabularies agents read.
 *  Content-Signal (contentsignals.org): search, ai-input (RAG, grounding, live answers), ai-train.
 *  Content-Usage (IETF AIPREF): train-ai, ai-output, search. Same policy as the bot rules below:
 *  everything allowed. To opt out of training, flip ai-train and train-ai together, here only.
 *  src/proxy.ts sends the same Content-Usage as an HTTP header, from CONTENT_USAGE in lib/agent-policy.ts. */

const DEFAULT_GROUP = { userAgent: '*', disallow: ['/api/', '/dev/', '/studio', '/thank-you', '/audit'] };

const AI_DISALLOW = ['/api/', '/audit', '/studio', '/preview/'];
const AI_BOTS = [
  'GPTBot',
  'ChatGPT-User',
  'Google-Extended',
  'Anthropic-ai',
  'ClaudeBot',
  'PerplexityBot',
  'Bytespider',
];

const groups = [
  DEFAULT_GROUP,
  ...AI_BOTS.map((userAgent) => ({ userAgent, disallow: AI_DISALLOW })),
];

const body =
  groups
    .map(
      ({ userAgent, disallow }) =>
        [
          `User-Agent: ${userAgent}`,
          `Content-Signal: ${CONTENT_SIGNAL}`,
          `Content-Usage: ${CONTENT_USAGE}`,
          'Allow: /',
          ...disallow.map((path) => `Disallow: ${path}`),
        ].join('\n')
    )
    .join('\n\n') + '\n\nSitemap: https://www.loudface.co/sitemap.xml\n';

export function GET() {
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
