/**
 * Asset URL Utility
 *
 * Handles path prefixing for static assets when deployed to Webflow Cloud.
 * Webflow Cloud mounts the app at /customsite, so all static asset URLs
 * need this prefix to load correctly.
 *
 * @example
 * // Instead of: src="/images/logo.svg"
 * // Use: src={asset('/images/logo.svg')}
 */

/**
 * Prefix a static asset path with the base URL.
 * Works in both development (no prefix) and production (with /customsite prefix).
 */
export function asset(path: string): string {
  const base = import.meta.env.BASE_URL || '/';
  // Remove trailing slash from base and leading slash from path to avoid double slashes
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}

/**
 * Alias for asset() - for semantic clarity when using with images specifically
 */
export const img = asset;
