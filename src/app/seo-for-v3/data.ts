/**
 * seo-for-v3 — data adapter.
 *
 * Maps a Sanity `seoPage` document onto the v3 section slots rendered by
 * SeoForPageV3. Every slot degrades independently: a page with only a headline
 * still renders (hero + logos + proof + cover), and a fully-populated page
 * renders the whole rhythm.
 *
 * The VISUAL layer is deliberately borrowed from `service-v3/service-v3.css`
 * (imported by the route, rendered inside a `.svcv3` wrapper). Those class
 * names are generic to the v3 language (.hero/.deliver/.runway/.proof/.faq/
 * .cover), not service-specific, so reusing them keeps these pages pixel-
 * identical to the approved /services/* build instead of forking a second
 * 40KB stylesheet. Only genuinely new furniture lives in seo-for-v3.css.
 *
 * Server-only: imports the Sanity client. Import from Server Components.
 */
import { client } from '@/lib/sanity.client';
import type { SeoPage } from '@/lib/types';

export type SeoForImages = Record<string, string>;

/** Screenshot lookup for the related case studies this page actually renders. */
export async function getSeoForImages(slugs: string[]): Promise<SeoForImages> {
  const unique = [...new Set(slugs.filter(Boolean))];
  if (unique.length === 0) return {};
  try {
    const rows = await client.fetch<{ slug: string; url: string | null }[]>(
      `*[_type == "caseStudy" && slug.current in $slugs]{ "slug": slug.current, "url": mainProjectImageThumbnail.asset->url }`,
      { slugs: unique }
    );
    const map: SeoForImages = {};
    for (const r of rows) if (r.slug && r.url) map[r.slug] = r.url;
    return map;
  } catch {
    return {}; // any failure → the template drops the image-bearing slots
  }
}

/**
 * Browser-frame URL labels for the client shots the hero/cover can float.
 * Hand-verified real domains (same set the /services build draws from) — a
 * case study missing from this map simply degrades to no floating artifact
 * rather than rendering an invented URL.
 */
export const CLIENT_DOMAINS: Record<string, string> = {
  liqid: 'liqid.de',
  eraser: 'eraser.io',
  'dimer-health': 'dimerhealth.com',
  'toku-ai-cited-pipeline': 'toku.com',
  'toku-design-messaging-upgrade': 'toku.com',
  hoxhunt: 'hoxhunt.com',
  montblanc: 'montblanc.com',
  'outbound-specialist': 'outboundspecialist.com',
  'radisson-hotels-group': 'radissonhotels.com',
};

/* ── field extractors (indexed CMS fields → arrays) ───────────────── */

export interface Pair {
  title: string;
  desc: string;
}
export interface Stat {
  value: string;
  label: string;
}
export interface FaqItem {
  question: string;
  answer: string;
}

function pairs(page: SeoPage, prefix: string, max: number): Pair[] {
  const out: Pair[] = [];
  for (let i = 1; i <= max; i++) {
    const title = page[`${prefix}-${i}-title` as keyof SeoPage] as string | undefined;
    const desc = page[`${prefix}-${i}-desc` as keyof SeoPage] as string | undefined;
    if (title && desc) out.push({ title, desc });
  }
  return out;
}

export const extractPainPoints = (p: SeoPage) => pairs(p, 'pain-point', 3);
export const extractStrategySteps = (p: SeoPage) => pairs(p, 'strategy-step', 4);

export function extractStats(page: SeoPage): Stat[] {
  const out: Stat[] = [];
  for (let i = 1; i <= 3; i++) {
    const value = page[`stat-${i}-value` as keyof SeoPage] as string | undefined;
    const label = page[`stat-${i}-label` as keyof SeoPage] as string | undefined;
    if (value && label) out.push({ value, label });
  }
  return out;
}

export function extractFaqItems(page: SeoPage): FaqItem[] {
  const out: FaqItem[] = [];
  for (let i = 1; i <= 5; i++) {
    const question = page[`faq-${i}-question` as keyof SeoPage] as string | undefined;
    const answer = page[`faq-${i}-answer` as keyof SeoPage] as string | undefined;
    if (question && answer) out.push({ question, answer });
  }
  return out;
}

/** Strip tags for use in JSON-LD / plain-text slots. */
export function toPlainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}
