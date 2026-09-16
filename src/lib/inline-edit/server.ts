import 'server-only';

/**
 * The catch-all: one wrapper around the content layer.
 *
 * `markTree` takes a content object exactly as a page already receives it and
 * returns the same shape, with each editable value carrying the id of where it
 * lives. Pages keep rendering `content.hero.headline` as they always did, so
 * building or redesigning a page needs no editing code at all.
 *
 * Draft Mode is asynchronous in Next 16, but the content getters run while a
 * component renders, so React's `use` unwraps it there and the getters keep
 * their synchronous signature. `cache` keeps it to one read per request.
 *
 * Off switch: LF_INLINE_EDIT=off, or delete this folder and the two lines in
 * the site layout.
 */
import { cache } from 'react';
import { draftMode } from 'next/headers';
import { encode } from './mark';

const draftState = cache(() => draftMode());

/** Optional warm-up from a layout; editing works with or without it. */
export async function primeInlineEditing(): Promise<boolean> {
  if (process.env.LF_INLINE_EDIT === 'off') return false;
  try {
    return (await draftState()).isEnabled;
  } catch {
    return false;
  }
}

export async function isEditing(): Promise<boolean> {
  if (process.env.LF_INLINE_EDIT === 'off') return false;
  try {
    return (await draftState()).isEnabled;
  } catch {
    return false;
  }
}

/** A path to an image file: still a working path after the id is added. */
const IMAGE_PATH = /^\/[^\s?]+\.(?:webp|png|jpe?g|svg|avif|gif)$/i;
/** Addresses are left alone: changing one needs a field, not typing on a page. */
const ADDRESS = /^(?:https?:|mailto:|tel:|#|\/)/i;
/**
 * Keys that must never be marked.
 *
 * Two kinds: machinery (ids, classes, sizes), and text that renders into an
 * attribute rather than onto the page. An attribute value cannot be clicked, so
 * marking it buys nothing — and it breaks anything that matches on it. The CSS
 * that turns the logo white matches a[aria-label="LoudFace Home"], so a marked
 * aria-label left the logo dark on the hero.
 */
const MACHINE_KEY =
  /(^|[._-])(id|ids|slug|slugs|key|keys|class|className|variant|type|color|colour|width|height|order|rank|target|rel|name|icon)$/i;
const ATTRIBUTE_KEY = /(arialabel|aria|alt|placeholder|tooltip|srlabel|srtext|datatestid)$/i;

function markString(file: string, path: string[], value: string): string {
  const key = path[path.length - 1] ?? '';
  if (MACHINE_KEY.test(key) || ATTRIBUTE_KEY.test(key)) return value;

  const id = `${file}:${path.join('.')}`;
  if (IMAGE_PATH.test(value)) {
    return `${value}${value.includes('?') ? '&' : '?'}lf=${encodeURIComponent(id)}`;
  }
  if (ADDRESS.test(value)) return value;
  return encode(value, id);
}

export async function markTree<T>(file: string, value: T): Promise<T> {
  return (await isEditing()) ? markValue(file, value, []) : value;
}

function markValue<T>(file: string, value: T, path: string[]): T {
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
