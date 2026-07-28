/**
 * Normalizes the CMS `time-to-read` field, which is entered inconsistently
 * across posts ("10 min read", "9 min", a bare number like 13, or null).
 * Coerces to string first — some CMS records store the value as a number,
 * which used to crash the blog page (`(13).match` is not a function) — then
 * pulls the integer and renders one canonical "N min read", so blog cards
 * never show "9 min read min read" or a bare "7 min".
 */
export function formatReadTime(raw?: string | number | null): string {
  // The CMS `timeToRead` field is declared `string` but real (migrated)
  // documents store it as a number — String() coerces both so `.match` never
  // throws on a numeric value (which previously 500'd the whole blog index).
  const minutes = raw != null ? String(raw).match(/\d+/)?.[0] : undefined;
  return minutes ? `${minutes} min read` : '5 min read';
}
