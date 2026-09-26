import nextConfig from '../../next.config';

/**
 * Every path next.config.ts redirects away from. A post or study folded into another page keeps its Sanity document
 * published, so anything that lists CMS items (the sitemap, the blog index) drops these paths: the site links only URLs
 * that still exist, never a 301 (incident 2026-07-12: a folded post lingered in the sitemap).
 */
export async function getRedirectedPaths(): Promise<Set<string>> {
  const rules = (await nextConfig.redirects?.()) ?? [];
  return new Set(rules.map((rule) => rule.source));
}
