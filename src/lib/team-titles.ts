import { rawContent, type TeamV11Content } from '@/lib/content-utils';

/**
 * The title the site gives a team member. The leads' titles are set in team-v11.json (`titles`, keyed by the slug in
 * camelCase): Arnel's rule of 2026-09-25 names Tamara, Andrea and Abhay "Lead SEO, AEO & GEO Specialist", because
 * each runs client accounts end to end. Everyone else keeps the CMS job title. The profile page, its metadata and its
 * Person schema all read this, so a search result and the page it opens say the same thing.
 */
export function teamTitle(slug: string | undefined, cmsTitle?: string): string | undefined {
  if (!slug) return cmsTitle;
  const key = slug.replace(/-([a-z])/g, (_, ch: string) => ch.toUpperCase());
  const titles = rawContent<TeamV11Content>('team-v11').titles as Record<string, string | undefined>;
  return titles[key] ?? cmsTitle;
}
