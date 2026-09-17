/**
 * What an edited value may contain when it is written back.
 *
 * The editor hands us the element's innerHTML. Two cases:
 *
 *   - The stored value was plain text. Then the result is plain text: every
 *     tag is dropped, entities are decoded, so "Design & build" stays
 *     "Design & build" and not "Design &amp; build".
 *   - The stored value already carried inline HTML (a link, bold, a line
 *     break). Then the same small set of tags survives, with nothing but a
 *     safe href on links. Everything else — spans the browser inserted,
 *     styles, scripts, event handlers — is dropped.
 *
 * Nothing here is a general HTML sanitiser. It is a whitelist for copy.
 */
import { strip as stripMarks } from './mark';

const ALLOWED = new Set(['a', 'strong', 'em', 'b', 'i', 'br']);
const SAFE_HREF = /^(?:https?:\/\/|mailto:|tel:|\/|#)/i;

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  '#39': "'",
  nbsp: ' ',
};

/**
 * One numeric entity. Out of Unicode's range, String.fromCodePoint throws, and
 * an editor pasting "&#1114112;" would take the publish down with a 500, so a
 * code we cannot turn into a character is left as the text the editor typed.
 */
function fromCode(code: number, original: string): string {
  if (!Number.isInteger(code) || code < 0 || code > 0x10ffff) return original;
  return String.fromCodePoint(code);
}

export function decodeEntities(text: string): string {
  return text.replace(/&(#\d+|#x[0-9a-f]+|[a-z]+);/gi, (whole, name: string) => {
    const lower = name.toLowerCase();
    if (lower in ENTITIES) return ENTITIES[lower];
    if (lower.startsWith('#x')) return fromCode(parseInt(lower.slice(2), 16), whole);
    if (lower.startsWith('#')) return fromCode(parseInt(lower.slice(1), 10), whole);
    return whole;
  });
}

/** Does the stored value carry markup the page renders as HTML? */
export function isRich(stored: string): boolean {
  return /<(a|strong|em|b|i|br)\b/i.test(stored);
}

function attribute(tag: string, name: string): string | null {
  const match = new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i').exec(tag);
  if (!match) return null;
  return decodeEntities(match[2] ?? match[3] ?? match[4] ?? '');
}

/**
 * An address we are about to write into an href, with nothing left in it that
 * could end the attribute or read as a second one. A quote break-out such as
 * href='/x" onmouseover="alert(1)' parses as one long address; percent-encoding
 * its quotes and spaces keeps it that way in the text we write out too.
 */
const encodeHref = (href: string) =>
  href
    .replace(/&/g, '&amp;')
    .replace(/"/g, '%22')
    .replace(/'/g, '%27')
    .replace(/</g, '%3C')
    .replace(/>/g, '%3E')
    .replace(/`/g, '%60')
    .replace(/\s/g, '%20');

/** The one way an <a> is ever written out: rebuilt from its parsed href, nothing else kept. */
function anchorOpenTag(attrs: string): string {
  const href = attribute(`<a${attrs}>`, 'href')?.trim();
  if (!href || !SAFE_HREF.test(href)) return '';
  return `<a href="${encodeHref(href)}">`;
}

/** Keep a, strong, em, b, i and br; drop every other tag and every other attribute. */
function cleanRich(html: string): string {
  return (
    html
      // Scripts and styles go with their contents, not just their tags.
      .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
      .replace(/<\/?(div|p)\b[^>]*>/gi, '<br>')
      // Links are handled as pairs first: a safe href keeps the link, anything else keeps only its text.
      .replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (whole, attrs: string, inner: string) => {
        const open = anchorOpenTag(attrs);
        return open ? `${open}${inner}</a>` : inner;
      })
      // Every remaining tag, including an <a> that was never closed. Nothing is
      // ever passed through as written: an anchor is rebuilt from its href, so
      // an onmouseover or a javascript: address cannot ride along on the tag text.
      .replace(/<(\/?)([a-z][a-z0-9]*)\b([^>]*)>/gi, (whole, close: string, rawName: string, attrs: string) => {
        const name = rawName.toLowerCase();
        if (!ALLOWED.has(name)) return '';
        if (name === 'br') return '<br>';
        if (name === 'a') return close ? '</a>' : anchorOpenTag(attrs);
        return `<${close}${name}>`;
      })
      .replace(/(<br>\s*)+$/i, '')
      .replace(/^(\s*<br>)+/i, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/[ \t]{2,}/g, ' ')
      .trim()
  );
}

/** Plain text: no tags at all, entities decoded, line breaks kept as <br> only if the stored value had them. */
function cleanPlain(html: string, keepBreaks: boolean): string {
  const withBreaks = html.replace(/<br\s*\/?>/gi, '\n').replace(/<\/?(div|p)\b[^>]*>/gi, '\n');
  const text = decodeEntities(withBreaks.replace(/<[^>]*>/g, ''));
  const lines = text
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  return keepBreaks ? lines.join('<br>') : lines.join(' ');
}

/**
 * Clean an edited value against the value it replaces.
 *
 * The stored value decides the mode. Plain stays plain, rich stays rich, so an
 * editor can never turn a heading into HTML by pasting, and never loses a link
 * by retyping a sentence around it.
 */
export function cleanValue(edited: string, stored: string): string {
  const unmarked = stripMarks(edited).replace(/[?&]lf=[^&\s"']*/g, '');
  if (isRich(stored)) return cleanRich(unmarked);
  return cleanPlain(unmarked, /<br\s*\/?>/i.test(stored));
}
