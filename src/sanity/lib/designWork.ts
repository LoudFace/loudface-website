import 'server-only';
import { cachedReadClient } from '@/lib/sanity.client';

/**
 * Design case studies for the proposal slider. Read FROM the public dataset at
 * render time, like caseProof.ts, so a slide always matches the live case page.
 */
export interface DesignWork {
  slug: string;
  name: string;
  industry?: string;
  resultNumber?: string;
  resultTitle?: string;
  image?: { url: string; alt?: string };
}

const QUERY = `*[_type == "caseStudy" && slug.current in $slugs]{
  "slug": slug.current,
  name,
  "industry": industry->name,
  "resultNumber": result1Number,
  "resultTitle": result1Title,
  "image": mainProjectImageThumbnail { "url": asset->url, alt }
}`;

export async function fetchDesignWork(slugs: string[]): Promise<DesignWork[]> {
  const wanted = (slugs ?? []).filter(Boolean);
  if (wanted.length === 0) return [];
  try {
    const rows = (await cachedReadClient.fetch(QUERY, { slugs: wanted })) as DesignWork[];
    // The proposal's order wins, and a case without an image is left out.
    return wanted
      .map((slug) => rows.find((r) => r.slug === slug))
      .filter((r): r is DesignWork => Boolean(r?.image?.url));
  } catch (error) {
    console.error('[proposals] design work read failed:', error);
    return [];
  }
}
