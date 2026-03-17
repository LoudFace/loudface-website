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
