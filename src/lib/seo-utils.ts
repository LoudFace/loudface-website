/**
 * SEO utilities for metadata optimization.
 *
 * Layout title template adds " | LoudFace" (12 chars),
 * so page titles should stay under 48 chars for a total < 60.
 */

const BRAND_SUFFIX_LENGTH = 12; // " | LoudFace"
const MAX_SERP_TITLE = 60;
const DEFAULT_MAX_PAGE_TITLE = MAX_SERP_TITLE - BRAND_SUFFIX_LENGTH; // 48

/**
 * Truncate a page title to fit within SERP display limits.
 * Cuts at word boundaries when possible.
 */
export function truncateSeoTitle(
  title: string,
  maxLength: number = DEFAULT_MAX_PAGE_TITLE,
): string {
  if (!title || title.length <= maxLength) return title;

  let truncated = title.slice(0, maxLength).trim();

  // If we cut mid-word, back up to the last complete word
  if (title[maxLength] && title[maxLength] !== ' ') {
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > maxLength * 0.7) {
      truncated = truncated.slice(0, lastSpace).trim();
    }
  }

  // Strip trailing punctuation that looks incomplete
  truncated = truncated.replace(/[,;:\u2014\u2013\-]$/, '').trim();

  return truncated;
}
