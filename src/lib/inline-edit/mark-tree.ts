/**
 * Which values get a marker, and what id they carry.
 *
 * The rules live here, apart from `server.ts`, because `server.ts` is
 * server-only: it reads Draft Mode through `next/headers`. These rules are
 * plain string work with no request behind them, so a test can check every
 * value in `src/data/content/*.json` against the same code the site runs.
 */
import { encode } from './mark';

/** A path to an image file: still a working path after the id is added. */
export const IMAGE_PATH = /^\/[^\s?]+\.(?:webp|png|jpe?g|svg|avif|gif)$/i;
/** Addresses are left alone: changing one needs a field, not typing on a page. */
export const ADDRESS = /^(?:https?:|mailto:|tel:|#|\/)/i;
/**
 * Keys that must never be marked.
 *
 * Two kinds: machinery (ids, classes, sizes), and text that renders into an
 * attribute rather than onto the page. An attribute value cannot be clicked, so
 * marking it buys nothing — and it breaks anything that matches on it. The CSS
 * that turns the logo white matches a[aria-label="LoudFace Home"], so a marked
 * aria-label left the logo dark on the hero.
 */
export const MACHINE_KEY =
  /(^|[._-])(id|ids|slug|slugs|key|keys|class|className|variant|type|color|colour|width|height|order|rank|target|rel|name|icon)$/i;
export const ATTRIBUTE_KEY = /(arialabel|aria|alt|placeholder|tooltip|srlabel|srtext|datatestid)$/i;

/** The id a value at this path would carry. */
export const idFor = (file: string, path: string[]): string => `${file}:${path.join('.')}`;

/** Is this key one the marker skips? */
export const isSkippedKey = (key: string): boolean => MACHINE_KEY.test(key) || ATTRIBUTE_KEY.test(key);

export function markString(file: string, path: string[], value: string): string {
  const key = path[path.length - 1] ?? '';
  if (isSkippedKey(key)) return value;

  const id = idFor(file, path);
  if (IMAGE_PATH.test(value)) {
    return `${value}${value.includes('?') ? '&' : '?'}lf=${encodeURIComponent(id)}`;
  }
  if (ADDRESS.test(value)) return value;
  return encode(value, id);
}

export function markValue<T>(file: string, value: T, path: string[]): T {
  if (typeof value === 'string') return markString(file, path, value) as unknown as T;
  if (Array.isArray(value)) {
    return value.map((item, i) => markValue(file, item, [...path, String(i)])) as unknown as T;
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      out[key] = markValue(file, item, [...path, key]);
    }
    return out as unknown as T;
  }
  return value;
}
