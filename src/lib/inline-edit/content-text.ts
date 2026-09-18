/**
 * One change against one content file's text.
 *
 * The pure half of `content-store.ts`: no git, no GitHub, no disk. It lives
 * apart so a test can run it over every value in `src/data/content/*.json`
 * without pulling in `server-only` and the Next runtime.
 *
 * Values are replaced in the file's own text rather than by re-serialising the
 * document, so a copy change stays a one-line diff a human can review.
 */
import { cleanValue } from './sanitize';
import { ADDRESS } from './mark-tree';
import { ADDRESS_REFUSAL, isAddressKey, isSafeHref } from './link-edit';

const FILE_NAME = /^[a-z0-9-]+$/;
const PATH_SEGMENT = /^[A-Za-z0-9_]+$/;
/**
 * Segments that would reach JavaScript's own machinery instead of the content.
 * `__proto__` in a path is never a real field, and following it would let a
 * publish change how every object in the process behaves.
 */
const UNSAFE_SEGMENT = new Set(['__proto__', 'constructor', 'prototype']);

export function parseId(id: string): { file: string; segments: string[]; fieldPath: string } {
  const [file, fieldPath] = id.split(':');
  if (!file || !fieldPath || !FILE_NAME.test(file)) throw new Error(`Bad content id: ${id}`);
  const segments = fieldPath.split('.');
  if (!segments.length || !segments.every((segment) => PATH_SEGMENT.test(segment))) {
    throw new Error(`Bad field path: ${fieldPath}`);
  }
  if (segments.some((segment) => UNSAFE_SEGMENT.has(segment))) {
    throw new Error(`Bad field path: ${fieldPath}`);
  }
  return { file, segments, fieldPath };
}

function walk(root: unknown, segments: string[]): { parent: Record<string, unknown>; key: string } | null {
  let node: unknown = root;
  for (let i = 0; i < segments.length - 1; i++) {
    if (typeof node !== 'object' || node === null) return null;
    if (UNSAFE_SEGMENT.has(segments[i])) return null;
    node = (node as Record<string, unknown>)[segments[i]];
  }
  const key = segments[segments.length - 1];
  if (typeof node !== 'object' || node === null || UNSAFE_SEGMENT.has(key)) return null;
  const parent = node as Record<string, unknown>;
  // Own properties only: `key in parent` also finds everything on Object's prototype.
  return Object.prototype.hasOwnProperty.call(parent, key) ? { parent, key } : null;
}

/** Read one string field out of a file's text. */
export function readField(raw: string, id: string): string {
  const { file, segments, fieldPath } = parseId(id);
  const target = walk(JSON.parse(raw), segments);
  if (!target) throw new Error(`${fieldPath} does not exist in ${file}.json`);
  const value = target.parent[target.key];
  if (typeof value !== 'string') throw new Error('Only text values are editable');
  return value;
}

/**
 * Write one value into a file's text. `next` is the new file text; the value is
 * cleaned against what it replaces, so plain stays plain and rich keeps its links.
 * Pass `exact` to skip cleaning — only ever for a value this server signed itself
 * (an undo token), never for one that arrived in a request body.
 */
export function applyToText(
  raw: string,
  id: string,
  value: string,
  exact = false,
): { next: string; before: string; after: string } {
  const { file, segments, fieldPath } = parseId(id);
  const json = JSON.parse(raw);
  const target = walk(json, segments);
  if (!target) throw new Error(`${fieldPath} does not exist in ${file}.json`);
  if (typeof target.parent[target.key] !== 'string') throw new Error('Only text values are editable');

  const before = target.parent[target.key] as string;
  const after = exact ? value : cleanValue(value, before);
  if (!after) throw new Error('A value cannot be emptied from the page');
  if (after === before) return { next: raw, before, after };

  /**
   * A field that holds an address keeps holding an address.
   *
   * Two ways a value is known to be one: the key says so (`href`, `url`,
   * `ctaHref`), or the value it replaces was already address-shaped. Either
   * way, `cleanValue` is no protection here — it strips tags, and a lone
   * `javascript:alert(1)` has none — so the address rule is applied on top of
   * it. Not for a value the server signed itself: an undo restores the exact
   * text a field held before, and that text has already passed this once.
   */
  const key = segments[segments.length - 1];
  if (!exact && (isAddressKey(key) || ADDRESS.test(before)) && !isSafeHref(after)) {
    throw new Error(ADDRESS_REFUSAL);
  }

  // Replace the value in the file's own text so the diff stays one line. An
  // object member is matched with its key; a list item is matched on its own,
  // as long as the same string appears nowhere else in the file.
  const inList = Array.isArray(target.parent);
  const needle = inList ? JSON.stringify(before) : `${JSON.stringify(target.key)}: ${JSON.stringify(before)}`;
  const first = raw.indexOf(needle);
  const unique = first !== -1 && raw.indexOf(needle, first + 1) === -1;

  let next: string;
  if (unique) {
    const replacement = inList ? JSON.stringify(after) : `${JSON.stringify(target.key)}: ${JSON.stringify(after)}`;
    next = raw.slice(0, first) + replacement + raw.slice(first + needle.length);
    JSON.parse(next); // never write a file we cannot read back
  } else {
    target.parent[target.key] = after;
    next = JSON.stringify(json, null, 2) + '\n';
  }
  return { next, before, after };
}
