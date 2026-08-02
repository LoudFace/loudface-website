import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // ─── /preview/* handling — READ BEFORE EDITING ───────────────────
      // Client design proofs under /preview/* are kept out of Google Search
      // by the `X-Robots-Tag: noindex` HEADER (see next.config.ts), NOT by a
      // robots.txt disallow. Do NOT add '/preview/' to this default (`*`)
      // group: per Google's own rule, a `noindex` directive only works if
      // Googlebot is ALLOWED to crawl the page and read the header — a
      // robots.txt disallow blocks the crawl, so the noindex is never seen
      // and the bare URL can still get indexed. Disallowing here would
      // silently DEFEAT the non-indexed guarantee.
      // https://developers.google.com/search/docs/crawling-indexing/block-indexing
      //
      // The AI-training bots below also disallow /preview/, but that's
      // ADVISORY ONLY — robots.txt asks compliant bots (GPTBot etc.) not to
      // fetch; anything that ignores it still can, and the page stays publicly
      // readable by anyone with the link. It's a courtesy to keep proofs out
      // of AI fetch, NOT a privacy control, and has zero effect on Google
      // Search (governed by this `*` group). noindex ≠ private: /preview/ URLs
      // are PUBLIC by default. Vercel's built-in Deployment Protection can't
      // gate one path (it's domain-level — would lock all of loudface.co), but
      // /preview/* CAN be gated with an auth check in src/proxy.ts (Basic
      // Auth / token — not wired yet). Never gate with robots.txt. Details:
      // public/preview/README.md.
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dev/', '/studio', '/thank-you', '/audit'],
      },
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: ['/api/', '/audit', '/studio', '/preview/'],
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
        disallow: ['/api/', '/audit', '/studio', '/preview/'],
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
        disallow: ['/api/', '/audit', '/studio', '/preview/'],
      },
      {
        userAgent: 'Anthropic-ai',
        allow: '/',
        disallow: ['/api/', '/audit', '/studio', '/preview/'],
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: ['/api/', '/audit', '/studio', '/preview/'],
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: ['/api/', '/audit', '/studio', '/preview/'],
      },
      {
        userAgent: 'Bytespider',
        allow: '/',
        disallow: ['/api/', '/audit', '/studio', '/preview/'],
      },
    ],
    sitemap: 'https://www.loudface.co/sitemap.xml',
  };
}
