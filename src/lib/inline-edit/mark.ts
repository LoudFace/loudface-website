/**
 * Content markers.
 *
 * A marked string carries the content path it came from, written in Unicode
 * tag characters that take no space on screen. The editor reads the mark off
 * the page, which is how it knows that this heading is `seo-for-hub:hero.
 * headline`. It is the same technique Sanity and Vercel use for their own
 * visual editing.
 *
 * Marking happens in the content layer, never in a page component, so:
 *   - building or redesigning a page needs no editing code at all;
 *   - a redesign cannot break editing, because the mark travels with the value;
 *   - deleting this folder and two lines of layout removes the whole feature.
 *
 * Nothing is marked unless Draft Mode is on. Published HTML is unchanged.
 */

const START = '\u{E0001}';
const BASE = 0xe0000;

export function encode(value: string, id: string): string {
  if (!value || value.includes(START)) return value;
  let out = START;
  for (const char of id) {
    const code = char.codePointAt(0)!;
    if (code < 0x20 || code > 0x7e) continue; // printable ASCII only
    out += String.fromCodePoint(BASE + code);
  }
  return value + out;
}

export function decode(value: string): string | null {
  const start = value.indexOf(START);
  if (start === -1) return null;
  let id = '';
  for (const char of value.slice(start + START.length)) {
    const code = char.codePointAt(0)!;
    if (code < BASE + 0x20 || code > BASE + 0x7e) break;
    id += String.fromCodePoint(code - BASE);
  }
  return id || null;
}

/** Remove every marker. Runs before a value is written back to disk. */
export function strip(value: string): string {
  return value.replace(/[\u{E0000}-\u{E007F}]/gu, '');
}

export const MARK_START = START;
