import { buildSitemapEntries, renderSitemapXml } from '@/lib/sitemap-entries';

// Uncached on purpose: see src/lib/sitemap-entries.ts. A newly published post must
// appear in the sitemap on the next request, not after a cache window.
export const dynamic = 'force-dynamic';

export async function GET() {
  const xml = renderSitemapXml(await buildSitemapEntries());
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
