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

export const CONTACT_FAQ: { q: string; a: string }[] = [
  {
    q: 'What actually happens on the call?',
    a: "Thirty minutes over video. We pull up your live site, you tell us what's not working, and we give you a straight read on what we'd change and why. You walk away with something useful: a clear next step, whether or not we work together.",
  },
  {
    q: 'Is this a sales pitch?',
    a: "No. It's a working session, not a pitch. If we're not the right team for what you need, we'll say so, and usually point you somewhere better. We'd rather pass than take on work we can't make great.",
  },
  {
    q: 'Who will I be talking to?',
    a: "One of the people who'd actually run your project, often Arnel, the founder. Never a salesperson or an account manager reading off a script. The people on the call are the people on the work.",
  },
  {
    q: "What if I'm not ready to commit?",
    a: "Then don't. Book it as a second opinion. Plenty of the calls we take are with teams just pressure-testing an idea or a redesign. No obligation, and no follow-up sequence chasing you afterward.",
  },
  {
    q: 'How much does it cost to work together?',
    a: 'Engagements start from $5k/mo, custom-scoped to your goals, cancel anytime. We confirm the exact scope on the call so you know precisely what that buys before anything starts.',
  },
];

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
