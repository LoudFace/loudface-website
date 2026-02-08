/**
 * Asset URL Utility
 *
 * Normalizes static asset paths. Ensures a leading slash.
 * Kept as a thin wrapper so all asset references go through one place.
 *
 * @example
 * // src={asset('/images/logo.svg')}
 */
export function asset(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

/**
 * Alias for asset() - for semantic clarity when using with images specifically
 */
export const img = asset;
