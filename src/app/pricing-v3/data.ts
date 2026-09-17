/**
 * pricing-v3 data layer.
 *
 * Testimonials come LIVE from Sanity (type `testimonial`) via the shared
 * fetchCollection (withRetry). The approved mockup features three specific
 * clients (Toku, Eraser, Icypeas) — we match those by name and keep the
 * mockup's exact order; if any is missing from the CMS we backfill with the
 * first remaining testimonials that have a headshot, so the exhibit grid is
 * always full. Headshots are resized via the shared image-utils Sanity CDN
 * helper (720x900 crop, webp).
 *
 * FAQ items live here too so the page can emit the FAQPage JSON-LD from the
 * same source of truth the accordion renders.
 */
import { fetchCollection } from '@/lib/cms-data';
import { optimizeImage } from '@/lib/image-utils';
import { rawContent, type PricingContent } from '@/lib/content-utils';
import type { Testimonial } from '@/lib/types';

export interface ExhibitTestimonial {
  id: string;
  name: string;
  role: string;
  brand: string; // pill label, e.g. "TOKU"
  quote: string;
  photo: string; // sized Sanity CDN URL
  mono: boolean; // push the duotone closer to full mono (clashing backdrop)
}

/** The mockup's featured clients, in order. `mono` flags the Icypeas card
 *  whose saturated green backdrop survives the duotone. */
const FEATURED: { match: RegExp; brand: string; mono?: boolean }[] = [
  { match: /kenneth/i, brand: 'TOKU' },
  { match: /shin\s*kim/i, brand: 'ERASER' },
  { match: /pierre/i, brand: 'ICYPEAS', mono: true },
];

/** Strip any HTML the CMS rich-text field may carry — the exhibit renders plain quotes. */
function plainText(html?: string): string {
  return (html ?? '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function brandFromRole(role?: string): string {
  // CMS roles read "CEO | Toku" (some legacy entries use a comma) — the brand
  // pill takes whatever follows the last separator.
  const after = role?.split(/[|,]/).pop()?.trim();
  return (after || 'CLIENT').toUpperCase();
}

function toExhibit(t: Testimonial, brand: string, mono = false): ExhibitTestimonial | null {
  const photo = optimizeImage(t['profile-image']?.url, 720, 82, 'webp', 900);
  const quote = plainText(t['testimonial-body']);
  if (!photo || !quote) return null;
  return { id: t.id, name: t.name, role: t.role ?? '', brand, quote, photo, mono };
}

export async function getPricingTestimonials(): Promise<ExhibitTestimonial[]> {
  const all = await fetchCollection<Testimonial>('testimonials');
  const used = new Set<string>();
  const picked: ExhibitTestimonial[] = [];

  for (const f of FEATURED) {
    const t = all.find((x) => f.match.test(x.name) && !used.has(x.id));
    if (!t) continue;
    const ex = toExhibit(t, f.brand, f.mono);
    if (ex) {
      picked.push(ex);
      used.add(t.id);
    }
  }

  // Backfill to 3 with any remaining testimonial that has a headshot + body.
  for (const t of all) {
    if (picked.length >= 3) break;
    if (used.has(t.id)) continue;
    const ex = toExhibit(t, brandFromRole(t.role));
    if (ex) {
      picked.push(ex);
      used.add(t.id);
    }
  }

  return picked;
}

/**
 * FAQ content — single source for the accordion AND the FAQPage schema.
 * Reads the unmarked source (rawContent), never the async getter's marked
 * tree — this file is also read at module scope by page.tsx to build
 * JSON-LD, and inline-edit markers must never reach structured data. The
 * accordion itself (pricing-v3/Faq.tsx) renders the marked, editable
 * version instead, via its own `content` prop from getPricingContent().
 */
export const PRICING_FAQ: { q: string; a: string; aHtml?: string }[] = rawContent<PricingContent>(
  'pricing'
).faq.items.map((item) => ({ q: item.question, a: item.answer, aHtml: item.answerHtml }));
