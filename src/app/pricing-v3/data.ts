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

/** FAQ content — single source for the accordion AND the FAQPage schema. */
export const PRICING_FAQ: { q: string; a: string; aHtml?: string }[] = [
  {
    q: 'How is pricing determined?',
    a: 'Pricing is based on your tier, scope, and complexity. Every engagement starts with an intro call where we assess your needs and recommend the right fit.',
  },
  {
    q: 'Can I switch tiers?',
    a: 'Yes. Scale up when you need more velocity, scale down when things stabilize. We keep it flexible.',
  },
  {
    q: "What's the difference between Build and Growth?",
    a: 'Build focuses on your Webflow site: launches, redesigns, landing pages, conversion optimization, and continuous UI iteration. Growth focuses on organic visibility: SEO, AEO (AI search optimization), content systems, and distribution experiments. At Dual and above, you run both simultaneously.',
    aHtml:
      '<strong>Build</strong> focuses on your Webflow site: launches, redesigns, landing pages, conversion optimization, and continuous UI iteration. <strong>Growth</strong> focuses on organic visibility: SEO, AEO (AI search optimization), content systems, and distribution experiments. At Dual and above, you run both simultaneously.',
  },
  {
    q: 'What does "Autopilot" actually mean?',
    a: "It means we don't wait for you to tell us what to do. We own the roadmap, prioritize based on impact, and ship proactively. You stay in the loop through showcases, the Scoreboard, and async updates, but you're not managing us.",
  },
  {
    q: 'Do you offer one-off projects?',
    a: 'Yes. We offer fixed-scope projects with a defined deliverable, price, and timeline. We also offer performance-based deals where part of our fee is tied to results. Book an intro call to discuss.',
  },
  {
    q: "What if I'm not sure which plan I need?",
    a: "That's exactly what the intro call is for. We'll walk through your goals, current setup, and bandwidth to recommend the right tier.",
  },
];
