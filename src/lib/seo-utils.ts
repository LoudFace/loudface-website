/**
 * SEO utilities for metadata optimization.
 *
 * Layout title template adds " | LoudFace" (12 chars),
 * so page titles should stay under 48 chars for a total < 60.
 */

import type { Metadata } from "next";

const BRAND_SUFFIX = ' | LoudFace';
const BRAND_SUFFIX_LENGTH = BRAND_SUFFIX.length; // 12
const MAX_SERP_TITLE = 60;
const DEFAULT_MAX_PAGE_TITLE = MAX_SERP_TITLE - BRAND_SUFFIX_LENGTH; // 48
const MAX_META_DESCRIPTION = 160;
const MIN_META_DESCRIPTION = 120;
const SITE_NAME = 'LoudFace';
const SITE_TWITTER = '@loudface';

/**
 * Truncate a page title to fit within SERP display limits.
 *
 * - Strips any existing brand suffix (" | LoudFace") from CMS titles
 *   so the layout template doesn't double it.
 * - Cuts at word boundaries when possible.
 */
export function truncateSeoTitle(
  title: string,
  maxLength: number = DEFAULT_MAX_PAGE_TITLE,
): string {
  if (!title) return title;

  // Strip existing brand suffix if CMS editor included it
  let cleaned = title;
  if (cleaned.endsWith(BRAND_SUFFIX)) {
    cleaned = cleaned.slice(0, -BRAND_SUFFIX_LENGTH).trim();
  }
  // Also strip partial variants like " - LoudFace" or "- Loudface"
  cleaned = cleaned.replace(/\s*[-|]\s*[Ll]oud[Ff]ace\s*$/, '').trim();

  if (cleaned.length <= maxLength) return cleaned;

  let truncated = cleaned.slice(0, maxLength).trim();

  // If we cut mid-word, back up to the last complete word
  if (cleaned[maxLength] && cleaned[maxLength] !== ' ') {
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > maxLength * 0.7) {
      truncated = truncated.slice(0, lastSpace).trim();
    }
  }

  // Strip trailing punctuation that looks incomplete
  truncated = truncated.replace(/[,;:\u2014\u2013\-]$/, '').trim();

  return truncated;
}

/**
 * Truncate a meta description to fit SERP display limits.
 *
 * - Prefers cutting at sentence boundaries (period) when possible.
 * - Falls back to word boundaries.
 * - If the description is too short, returns null so callers can use a fallback.
 */
export function truncateSeoDescription(
  description: string | undefined,
  maxLength: number = MAX_META_DESCRIPTION,
): string | null {
  if (!description) return null;

  const cleaned = description.replace(/\s+/g, ' ').trim();

  // Too short to be useful — return null so caller can use a better fallback
  if (cleaned.length < MIN_META_DESCRIPTION) return null;

  if (cleaned.length <= maxLength) return cleaned;

  let truncated = cleaned.slice(0, maxLength).trim();

  // Try to cut at a sentence boundary (but not if it would drop below MIN)
  const lastPeriod = truncated.lastIndexOf('.');
  if (lastPeriod > maxLength * 0.6 && lastPeriod + 1 >= MIN_META_DESCRIPTION) {
    return truncated.slice(0, lastPeriod + 1);
  }

  // Fall back to word boundary
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > maxLength * 0.7) {
    truncated = truncated.slice(0, lastSpace).trim();
  }

  // Strip trailing punctuation that looks incomplete
  truncated = truncated.replace(/[,;:\u2014\u2013\-]$/, '').trim();

  return truncated;
}

/**
 * Map of legacy internal URLs to their current canonical paths.
 * Mirrors the redirects in next.config.ts — used to rewrite links in
 * CMS rich-text content so browsers never follow a 308 redirect chain.
 */
const LEGACY_URL_MAP: Record<string, string> = {
  // Old service slugs with random suffixes
  '/services/webflow-development-pnkr2': '/services/webflow',
  '/services/design-pia5o': '/services/ux-ui-design',
  '/services/copywriting-5n9z9': '/services/copywriting',
  '/services/cms-migration-x841v': '/services/webflow',
  '/services/branding-jvbsh': '/services/ux-ui-design',
  '/services/seo-62e9c': '/services/seo-aeo',
  // Renamed pages
  '/about-us': '/about',
  '/contact': '/',
  '/why-webflow': '/services/webflow',
  '/services': '/services/webflow',
  // Old blog slugs
  '/blog/the-future-of-webflow': '/blog/how-to-future-proof-your-webflow-website-for-search-and-ai-agents',
  '/blog/is-webflow-good-for-small-businesses': '/blog/why-saas-companies-are-moving-to-webflow-in-2026-and-what-they-gain',
  '/blog/seo-vs-aeo-what-actually-changes-for-your-webflow-site-in-2026': '/blog/seo-vs-aeo-for-webflow',
  '/blog/seo-vs-aeo-webflow': '/blog/seo-vs-aeo-for-webflow',
  // Old case study slugs
  '/case-studies/icypeas': '/case-studies/b2b-saas-brand-and-website-redesign-case-study',
  '/case-studies/toku': '/case-studies/toku-design-messaging-upgrade',
  '/case-studies/ciela': '/case-studies',
  // Trailing slash variants
  '/case-studies/': '/case-studies',
};

/**
 * Map of legacy service category slugs to their canonical slugs.
 * Used when rendering service links from CMS multi-reference fields.
 */
export const LEGACY_SERVICE_SLUG_MAP: Record<string, string> = {
  'webflow-development-pnkr2': 'webflow',
  'design-pia5o': 'ux-ui-design',
  'copywriting-5n9z9': 'copywriting',
  'cms-migration-x841v': 'webflow',
  'branding-jvbsh': 'ux-ui-design',
  'seo-62e9c': 'seo-aeo',
};

/**
 * Rewrite legacy internal URLs in CMS rich-text HTML.
 *
 * Scans `href="..."` attributes for paths that match known redirects
 * and replaces them with the canonical URL, eliminating 308 redirect chains.
 */
export function rewriteLegacyUrls(html: string): string {
  if (!html) return html;

  // Match href attributes with relative paths or full loudface.co URLs
  return html.replace(
    /href="((?:https?:\/\/(?:www\.)?loudface\.co)?\/[^"]*?)"/g,
    (_match, rawUrl: string) => {
      // Normalize to a relative path
      const path = rawUrl.replace(/^https?:\/\/(?:www\.)?loudface\.co/, '');
      const canonical = LEGACY_URL_MAP[path];
      if (canonical) {
        return `href="${canonical}"`;
      }
      return _match;
    },
  );
}

/**
 * Resolve a service category slug, mapping legacy slugs to canonical ones.
 */
export function resolveServiceSlug(slug: string): string {
  return LEGACY_SERVICE_SLUG_MAP[slug] || slug;
}

export function buildNoIndexMetadata(title: string): Metadata {
  return {
    title,
    robots: { index: false },
  };
}

interface BuildPageMetadataOptions {
  title: string;
  description: string;
  canonicalPath: string;
  type?: 'article' | 'website';
  imageUrl?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

export function buildPageMetadata({
  title,
  description,
  canonicalPath,
  type = 'website',
  imageUrl = '/opengraph-image',
  publishedTime,
  modifiedTime,
}: BuildPageMetadataOptions): Metadata {
  const socialTitle = `${title}${BRAND_SUFFIX}`;
  const image = { url: imageUrl, width: 1200, height: 630, alt: socialTitle };

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      type,
      title: socialTitle,
      description,
      url: canonicalPath,
      siteName: SITE_NAME,
      locale: 'en_US',
      images: [image],
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      site: SITE_TWITTER,
      title: socialTitle,
      description,
      images: [imageUrl],
    },
  };
}
