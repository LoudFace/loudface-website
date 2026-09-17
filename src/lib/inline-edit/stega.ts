/**
 * Sanity's own invisible marker — stega.
 *
 * `@sanity/client` hides a zero-width payload in every string it returns while
 * Draft Mode and `stega: { enabled: true }` are on (see `getServerClient` in
 * `src/lib/sanity.client.ts`). The payload decodes to a Studio "edit this"
 * link: `/studio/intent/edit/mode=presentation;id=<doc>;type=<type>;path=<path>?...`.
 * This file turns that link into `{ id, type, path }` so the editor can treat a
 * Sanity string the same way it treats one of our own `content/*.json` values,
 * and can strip the marker before anything is written back or saved.
 *
 * Client-safe: no server-only import, no secrets. `@vercel/stega` is a small,
 * dependency-free decoder shared with Vercel's own Visual Editing.
 */
import { VERCEL_STEGA_REGEX, vercelStegaDecode, vercelStegaSplit } from '@vercel/stega';

export type StegaId = { id: string; type: string; path: string };

type StegaPayload = { origin?: string; href?: string };

/**
 * `mode=presentation;id=<id>;type=<type>;path=<path>` — semicolon-separated
 * fields, order not guaranteed, extra fields ignored, a `?query` may follow.
 */
function parseHref(href: string): StegaId | null {
  const afterIntent = href.split('/intent/edit/')[1] ?? href;
  const segment = afterIntent.split('?')[0];
  const fields: Record<string, string> = {};
  for (const part of segment.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    const key = part.slice(0, eq).trim();
    const value = part.slice(eq + 1).trim();
    if (!key || !value) continue;
    try {
      fields[key] = decodeURIComponent(value);
    } catch {
      fields[key] = value;
    }
  }
  const { id, type, path } = fields;
  if (!id || !type || !path) return null;
  return { id, type, path };
}

/** Decode one string's stega payload into a Sanity document id, type and path, or null. */
export function decodeStega(text: string): StegaId | null {
  // VERCEL_STEGA_REGEX carries the `g` flag, so `.test()` on the shared
  // instance advances `lastIndex` and alternates true/false across calls.
  // Reset it (or use a fresh copy) rather than trusting a bare `.test()`.
  VERCEL_STEGA_REGEX.lastIndex = 0;
  if (!text || !VERCEL_STEGA_REGEX.test(text)) return null;
  let payload: StegaPayload | undefined;
  try {
    payload = vercelStegaDecode<StegaPayload>(text);
  } catch {
    return null;
  }
  if (!payload || payload.origin !== 'sanity.io' || typeof payload.href !== 'string') return null;
  return parseHref(payload.href);
}

/** Remove every stega mark from a string, keeping the visible text. */
export function stripStega(text: string): string {
  return vercelStegaSplit(text).cleaned;
}
