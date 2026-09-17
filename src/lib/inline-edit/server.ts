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
import { markValue } from './mark-tree';
import { inlineEditingEnabled } from './guard';

const draftState = cache(() => draftMode());

/** Optional warm-up from a layout; editing works with or without it. */
export async function primeInlineEditing(): Promise<boolean> {
  if (!inlineEditingEnabled()) return false;
  try {
    return (await draftState()).isEnabled;
  } catch {
    return false;
  }
}

export async function isEditing(): Promise<boolean> {
  if (!inlineEditingEnabled()) return false;
  try {
    return (await draftState()).isEnabled;
  } catch {
    return false;
  }
}

export async function markTree<T>(file: string, value: T): Promise<T> {
  return (await isEditing()) ? markValue(file, value, []) : value;
}
