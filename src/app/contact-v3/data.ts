/**
 * contact-v3 data layer.
 *
 * The founder headshot comes live from Sanity (teamMember `arnel-bukva`) via
 * the same resilient fetchHomepageData() the About page uses — a fetch failure
 * or missing doc degrades to the initials avatar, never a broken image.
 *
 * CONTACT_FAQ is single-sourced here so the page can emit FAQPage JSON-LD from
 * the exact items the accordion renders.
 *
 * Claims policy (verified against the shipped v3 pages): only the safe set —
 * 200+ sites, 4+ years Webflow Enterprise Partner, 2h response during working
 * hours, 30-minute call. No slot counts, no scarcity claims.
 */
import { fetchHomepageData } from '@/lib/cms-data';
import { rawContent, type ContactContent } from '@/lib/content-utils';
import type { TeamMember } from '@/lib/types';

export interface ContactFounder {
  name: string;
  role: string;
  photoUrl: string | null; // cropped Sanity CDN URL or null → initials fallback
}

/** Founder card data for the offices band — real headshot from Sanity. */
export async function getContactFounder(): Promise<ContactFounder> {
  const fallback: ContactFounder = { name: 'Arnel Bukva', role: 'Founder, LoudFace', photoUrl: null };
  try {
    const data = await fetchHomepageData();
    const members = Array.from(data.teamMembers.values()) as TeamMember[];
    const arnel = members.find((m) => m.slug === 'arnel-bukva');
    if (!arnel) return fallback;
    const base = arnel['profile-picture']?.url;
    return {
      name: arnel.name || fallback.name,
      role: arnel['job-title'] ? `${arnel['job-title']}, LoudFace` : fallback.role,
      photoUrl: base ? `${base}${base.includes('?') ? '&' : '?'}w=184&h=184&fit=crop&fm=webp&q=82` : null,
    };
  } catch {
    return fallback;
  }
}

/**
 * FAQ content — single source for the accordion AND the FAQPage schema.
 * Reads the unmarked source (rawContent), never the async getter's marked
 * tree — this file is also read at module scope by page.tsx to build
 * JSON-LD, and inline-edit markers must never reach structured data. The
 * accordion itself (contact-v3/Faq.tsx) renders the marked, editable
 * version instead, via its own `content` prop from getContactContent().
 */
export const CONTACT_FAQ: { q: string; a: string }[] = rawContent<ContactContent>(
  'contact'
).faq.items.map((item) => ({ q: item.question, a: item.answer }));

/** Office data — single source for the visible tiles AND the ContactPage JSON-LD. */
export const OFFICES = [
  {
    city: 'San Francisco',
    tz: 'America/Los_Angeles',
    lines: ['2261 Market Street STE 46212', 'San Francisco, CA 94114'],
    schema: {
      '@type': 'PostalAddress',
      streetAddress: '2261 Market Street STE 46212',
      addressLocality: 'San Francisco',
      addressRegion: 'CA',
      postalCode: '94114',
      addressCountry: 'US',
    },
  },
  {
    city: 'Dubai',
    tz: 'Asia/Dubai',
    lines: ['Dubai Silicon Oasis, DDP', 'Building A1, UAE'],
    schema: {
      '@type': 'PostalAddress',
      streetAddress: 'Dubai Silicon Oasis, DDP, Building A1',
      addressLocality: 'Dubai',
      addressCountry: 'AE',
    },
  },
] as const;

export const CONTACT_EMAIL = 'hello@loudface.co';
