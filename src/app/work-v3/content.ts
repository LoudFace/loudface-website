/**
 * work-v3 pure content + types — CLIENT-SAFE.
 *
 * This module holds only static editorial data (the flagship marquee tabs, the
 * archive discipline copy) and plain types. It imports NOTHING server-only, so
 * client components (HeroWork, Archive, CoverCTA) can import from it freely. The
 * Sanity-backed image fetch (getWorkImages) lives in ./data, which must only be
 * imported from Server Components — importing it into a `'use client'` module
 * pulls next/headers into the client bundle and breaks the build.
 */

/** slug → base image URL map returned by getWorkImages (in ./data). */
export type WorkImages = Record<string, string>;

export const WORK_CDN = 'https://cdn.sanity.io/images/xjjjqhgt/production/';

export interface Flagship {
  key: string; // panel/tab key
  tab: string; // tab label
  slug: string; // detail route under /case-studies
  domain: string; // fake browser-bar label (decorative)
  asset: string; // hardcoded CDN fallback (used only if the slug fetch misses)
  alt: string;
  rNum: string; // rpill number (safe/sourced)
  rLabel: string; // rpill label
  headline: string; // the on-stage outcome line
  meta: string; // client · industry · discipline
  viewLabel: string; // CTA text on the frame
  eager?: boolean; // first tab loads eager for LCP
}

/**
 * The four flagship studies that crown the marquee stage. Screenshots resolve
 * from Sanity by slug (getWorkImages) with these hardcoded CDN fallbacks — all
 * four slugs are inside the homepage HOME_SLUGS set, so the single homepage image
 * fetch already covers them. Every rpill stat is in the sourced/safe set: Toku
 * 0 → 86% and Dimer 288% are the client-attributed headline outcomes; LIQID
 * "100+ pages" and Eraser "V3" are factual build facts matching the studies' copy.
 */
export const FLAGSHIPS: Flagship[] = [
  {
    key: 'toku',
    tab: 'Toku',
    slug: 'toku-ai-cited-pipeline',
    domain: 'toku.com',
    asset: 'bd1c09b494f7074c268f5b964d0c77dc1b1ef965-2880x1620.webp',
    alt: 'Toku website grown by LoudFace',
    rNum: '0 → 86%',
    rLabel: 'AI visibility',
    headline: 'The name AI gives for stablecoin payroll.',
    meta: 'Toku · FinTech · AI Search & Organic Growth',
    viewLabel: 'View Toku study',
    eager: true,
  },
  {
    key: 'dimer',
    tab: 'Dimer Health',
    slug: 'dimer-health',
    domain: 'dimerhealth.com',
    asset: 'a0f4750b896ced6ffca5869623b15614f312ba-1440x10131.webp',
    alt: 'Dimer Health website built by LoudFace',
    rNum: '288%',
    rLabel: 'Conversion rate',
    headline: 'A telehealth rebrand that finally converts.',
    meta: 'Dimer Health · Telehealth · Conversion Optimization',
    viewLabel: 'View Dimer Health study',
  },
  {
    key: 'liqid',
    tab: 'LIQID',
    slug: 'liqid',
    domain: 'liqid.de',
    asset: '5f21404454406eee90732e4e1c8655e0c8c6013b-3024x3629.webp',
    alt: 'LIQID website built by LoudFace',
    rNum: '100+',
    rLabel: 'Pages launched',
    headline: 'A HubSpot → Webflow migration, editable in-house.',
    meta: 'LIQID · FinTech · Web Design & Branding',
    viewLabel: 'View LIQID study',
  },
  {
    key: 'eraser',
    tab: 'Eraser',
    slug: 'eraser',
    domain: 'eraser.io',
    asset: '2a7d29fdc9302c8482d70b73041e6c58ec9229a6-1440x1845.webp',
    alt: 'Eraser website built by LoudFace',
    rNum: 'V3',
    rLabel: 'Redesign shipped',
    headline: 'Marketing pages with product-grade craft.',
    meta: 'Eraser · SaaS · Web Design & Branding',
    viewLabel: 'View Eraser study',
  },
];

/** Discipline copy for the archive group headers — keyed by the Sanity discipline name. */
export const DISCIPLINE_COPY: Record<string, string> = {
  'AI Search & Organic Growth':
    'Programs that make a brand the answer — ranked in search and cited by name in AI engines.',
  'Conversion Optimization':
    'Landing pages and funnels rebuilt to turn the traffic you already have into pipeline.',
  'Web Design & Branding':
    'Brand and Webflow builds — migrations, microsites, and full-stack platforms for B2B SaaS.',
};
