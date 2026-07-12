/**
 * about-v3 data layer.
 *
 * Team members come live from Sanity (type `teamMember`) via the shared
 * fetchHomepageData() resilient fetch (withRetry, returns partial on failure).
 * We keep the composite's exact person->slot arrangement through an ordered
 * slug list, then distribute the CMS array across three columns keeping the
 * flank/middle (2/3/2) pattern. Layout stays balanced at 6, 7, or 8 people.
 *
 * The one-line "fact" + short "quote" per person are NOT in the CMS — they
 * live in TEAM_COPY keyed by slug (exact strings from the composite). A future
 * member with no entry falls back to the CMS bioSummary first sentence for the
 * fact and omits the quote line.
 */
import { fetchHomepageData } from '@/lib/cms-data';
import type { TeamMember } from '@/lib/types';

const SANITY_CDN = 'https://cdn.sanity.io/images/xjjjqhgt/production/';

/** Curated display order — matches the composite's mosaic + ladder placement. */
export const TEAM_ORDER: string[] = [
  'arnel-bukva',
  'abhay-tyagi',
  'tamara-pavlovic',
  'rezwan-nahid',
  'chandana-pitta',
  'david-dobrijevic',
  'andrea-van-wyk',
];

/** Per-person fact + quote (editorial, not in CMS). Keyed by slug. */
export const TEAM_COPY: Record<string, { fact: string; quote?: string }> = {
  'arnel-bukva': {
    fact: 'Started LoudFace on Webflow in 2017, back when almost no agency would touch it.',
    quote: 'Design and numbers, one team, no handoffs.',
  },
  'abhay-tyagi': {
    fact: 'Six-plus years in organic search, on-page and off-page, now pointed at AI search.',
    quote: 'Search is a structure problem first.',
  },
  'tamara-pavlovic': {
    fact: 'Runs delivery across every active build, from Montblanc to seed-stage SaaS.',
    quote: 'Clients should never have to chase us.',
  },
  'rezwan-nahid': {
    fact: 'Designed the Dimer Health pages behind a 288% conversion lift.',
    quote: 'Restraint is the hardest skill to ship.',
  },
  'chandana-pitta': {
    fact: "Scaled growth for B2B SaaS startups; now turns LoudFace's organic demand into pipeline.",
    quote: "Demand only counts once it's pipeline.",
  },
  'david-dobrijevic': {
    fact: 'Built the Webflow work that made LoudFace an Enterprise Partner.',
    quote: "If it's slow on mobile, it's not done.",
  },
  'andrea-van-wyk': {
    fact: 'Writes the positioning and page copy for every LoudFace build, start to ship.',
    quote: 'Clear beats clever, every single time.',
  },
};

export interface TeamPerson {
  slug: string;
  name: string;
  role: string;
  photoBase: string | null; // bare Sanity CDN URL (no query params) or null
  fact: string;
  quote?: string;
  bioSummary?: string; // full CMS bio-summary, shown in the per-member modal
}

/** First sentence of a bio, used as the fact fallback for members with no TEAM_COPY entry. */
function firstSentence(text?: string): string {
  if (!text) return '';
  const trimmed = text.trim();
  const match = trimmed.match(/^.*?[.!?](?=\s|$)/);
  return (match ? match[0] : trimmed).trim();
}

/**
 * Fetch team from the CMS and shape it for the page.
 * Ordered by TEAM_ORDER; any CMS member not in that list is appended (future
 * members). Members in TEAM_ORDER but absent from the CMS are dropped
 * (removed member handled gracefully).
 */
export async function getAboutTeam(): Promise<TeamPerson[]> {
  const data = await fetchHomepageData();
  const members = Array.from(data.teamMembers.values()) as TeamMember[];

  const bySlug = new Map(members.map((m) => [m.slug, m]));
  const orderedSlugs = [
    ...TEAM_ORDER.filter((s) => bySlug.has(s)),
    ...members.map((m) => m.slug).filter((s) => !TEAM_ORDER.includes(s)),
  ];

  return orderedSlugs.map((slug) => {
    const m = bySlug.get(slug)!;
    const copy = TEAM_COPY[slug];
    return {
      slug: m.slug,
      name: m.name,
      role: m['job-title'] || '',
      photoBase: m['profile-picture']?.url ?? null,
      fact: copy?.fact ?? firstSentence(m['bio-summary']),
      quote: copy?.quote, // undefined for members with no curated entry
      bioSummary: m['bio-summary'] || undefined,
    };
  });
}

/** Build a Sanity image URL with the composite's crop params, or a neutral fallback. */
export function teamPhoto(base: string | null, w = 640, h = 640): string {
  const src = base ?? `${SANITY_CDN}placeholder`;
  const sep = src.includes('?') ? '&' : '?';
  return `${src}${sep}w=${w}&h=${h}&fit=crop&fm=webp&q=82`;
}

/**
 * Split people into the composite's 2 / 3 / 2 column pattern (flank / middle /
 * flank). Generalizes to any count: the middle column takes the surplus so the
 * flanks stay short — matching the "middle is the tall column" ladder look.
 */
export function splitColumns<T>(people: T[]): [T[], T[], T[]] {
  const n = people.length;
  // flank size: floor(n/3) each, middle gets the rest.
  const flank = Math.floor(n / 3);
  const colA = people.slice(0, flank);
  const colC = people.slice(n - flank);
  const colB = people.slice(flank, n - flank);
  return [colA, colB, colC];
}
