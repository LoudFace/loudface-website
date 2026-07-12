import { client } from '@/lib/sanity.client';

/**
 * Homepage v3 — Sanity data layer.
 *
 * Wires the case-study SCREENSHOTS from Sanity by slug so they survive asset
 * re-uploads (the main rot risk of hardcoded CDN URLs). Everything editorial —
 * which clients, order, bento layout, and the deliberately-shortened metric
 * pill strings ("6+ pages" vs Sanity's "6+ Pages Launched") — stays curated in
 * the components. Returns a slug→baseImageUrl map; components append their own
 * crop params and fall back to the hardcoded URL when a slug is absent, so a
 * fetch failure or missing doc can never blank an image.
 */
export type HomeImages = Record<string, string>;

const HOME_SLUGS = [
  'dimer-health',
  'montblanc',
  'hoxhunt',
  'outbound-specialist',
  'toku-ai-cited-pipeline',
  'radisson-hotels-group',
  'liqid',
  'eraser',
];

export async function getHomeV3Images(): Promise<HomeImages> {
  try {
    const rows = await client.fetch<{ slug: string; url: string | null }[]>(
      `*[_type == "caseStudy" && slug.current in $slugs]{ "slug": slug.current, "url": mainProjectImageThumbnail.asset->url }`,
      { slugs: HOME_SLUGS }
    );
    const map: HomeImages = {};
    for (const r of rows) if (r.slug && r.url) map[r.slug] = r.url;
    return map;
  } catch {
    return {}; // any failure → components use their hardcoded fallbacks
  }
}
