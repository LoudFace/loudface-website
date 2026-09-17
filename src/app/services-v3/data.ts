/**
 * services-v3 data layer.
 *
 * Case-study SCREENSHOTS (hero work-wall + the three exhibits) come LIVE from
 * Sanity by slug via the homepage's getHomeV3Images helper — the same slug set
 * and query the homepage SelectedWork uses, so the images survive asset
 * re-uploads. Components append their own crop params and fall back to the
 * hardcoded CDN URL when a slug is absent, so a fetch failure or missing doc can
 * never blank an image. Re-exported here under a services-facing name so the
 * page + components read from one place.
 *
 * FAQ items live here too so the page can emit the FAQPage JSON-LD from the same
 * source of truth the accordion renders.
 */
export { getHomeV3Images as getServicesImages, type HomeImages as ServicesImages } from '../home-v3/data';
import { rawContent, type ServicesContent } from '@/lib/content-utils';

export interface ServicesFaqItem {
  q: string;
  a: string; // plain text — feeds the FAQPage schema
  aHtml?: string; // optional rich variant (<strong>) — feeds the accordion
}

/**
 * FAQ content — single source for the accordion AND the FAQPage JSON-LD.
 * Reads the unmarked source (rawContent), never the async getter's marked
 * tree — this file is also read at module scope by page.tsx to build
 * JSON-LD, and inline-edit markers must never reach structured data. The
 * accordion itself (services-v3/Faq.tsx) renders the marked, editable
 * version instead, via its own `content` prop from getServicesContent().
 */
export const SERVICES_FAQ: ServicesFaqItem[] = rawContent<ServicesContent>('services').faq.items.map(
  (item) => ({ q: item.question, a: item.answer, aHtml: item.answerHtml })
);

/**
 * The eight services, in the buyer-outcome order they appear in the directory.
 * Single source for the ServicesIndex directory rows AND the ItemList JSON-LD.
 */
export interface ServiceEntry {
  slug: string; // child route under /services
  serviceName: string;
  blurb: string;
}

/**
 * Directory entries — single source for the ItemList JSON-LD (see page.tsx).
 * Reads the unmarked source (rawContent) for the same reason as SERVICES_FAQ
 * above; the directory itself (services-v3/ServicesIndex.tsx) renders the
 * marked, editable version via its own `content` prop.
 */
export const SERVICES: ServiceEntry[] = rawContent<ServicesContent>('services').index.entries;

/**
 * Build vs. Growth track, keyed by slug. Kept out of services.json on purpose:
 * ServicesIndex.tsx compares this with `===` to split the two directory
 * lists, and a value that goes through markTree in draft mode gets an
 * invisible edit-marker appended — the `===` would silently stop matching
 * and both lists would render empty. This is plain code, never marked.
 */
export const TRACK_BY_SLUG: Record<string, 'build' | 'grow'> = {
  'geo-agency': 'grow',
  'seo-aeo': 'grow',
  'organic-growth': 'grow',
  cro: 'build',
  'growth-autopilot': 'grow',
  copywriting: 'build',
  'ux-ui-design': 'build',
  webflow: 'build',
};
