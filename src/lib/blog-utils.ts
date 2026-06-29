/**
 * Normalizes the CMS `time-to-read` field, which is entered inconsistently
 * across posts ("10 min read", "9 min", or null). Pulls the integer and
 * renders one canonical "N min read" — so blog cards never show
 * "9 min read min read" or a bare "7 min".
 */
export function formatReadTime(raw?: string | null): string {
  const minutes = raw?.match(/\d+/)?.[0];
  return minutes ? `${minutes} min read` : '5 min read';
}
