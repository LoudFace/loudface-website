/**
 * CMS Data Cache for Development
 *
 * Caches Webflow API responses locally to speed up development.
 * Uses globalThis to persist cache across Vite module reloads.
 *
 * In production, this is bypassed entirely.
 */

// Cache duration: 5 minutes in dev (adjust as needed)
const CACHE_TTL_MS = 5 * 60 * 1000;

// Use globalThis to persist cache across module reloads in Vite dev server
const CACHE_KEY = '__webflow_cms_cache__';

interface CacheEntry {
  data: unknown;
  timestamp: number;
}

function getCache(): Map<string, CacheEntry> {
  if (!(globalThis as any)[CACHE_KEY]) {
    (globalThis as any)[CACHE_KEY] = new Map<string, CacheEntry>();
  }
  return (globalThis as any)[CACHE_KEY];
}

/**
 * Check if we're in development mode
 */
function isDev(): boolean {
  return import.meta.env.DEV;
}

/**
 * Generate a cache key for a Webflow API endpoint
 */
function getCacheKey(collectionId: string): string {
  return `webflow:${collectionId}`;
}

/**
 * Get cached data if available and not expired
 */
export function getCached<T>(collectionId: string): T | null {
  if (!isDev()) return null;

  const cache = getCache();
  const key = getCacheKey(collectionId);
  const cached = cache.get(key);

  if (!cached) return null;

  // Check if cache is still valid
  const age = Date.now() - cached.timestamp;
  if (age > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }

  console.log(`[CMS Cache] HIT for ${collectionId}`);
  return cached.data as T;
}

/**
 * Store data in cache
 */
export function setCache<T>(collectionId: string, data: T): void {
  if (!isDev()) return;

  const cache = getCache();
  const key = getCacheKey(collectionId);
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
  console.log(`[CMS Cache] STORED ${collectionId}`);
}

/**
 * Clear all cached data
 */
export function clearCache(): void {
  getCache().clear();
  console.log('[CMS Cache] CLEARED');
}

/**
 * Fetch with caching - wraps fetch to use cache in development
 */
export async function fetchWithCache<T>(
  url: string,
  collectionId: string,
  options?: RequestInit
): Promise<T> {
  // Try to get from cache first (dev only)
  const cached = getCached<T>(collectionId);
  if (cached) {
    return cached;
  }

  // Fetch from API
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as T;

  // Cache the response (dev only)
  setCache(collectionId, data);

  return data;
}
