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
/**
 * The one rule for what an address may be, shared rather than copied: the
 * editor's own link field and the publish route both check against this, so a
 * client never sees a field accept something the server then refuses.
 */
export const SAFE_HREF = /^(?:https?:\/\/|mailto:|tel:|\/|#)/i;

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

// ---------------------------------------------------------------------------
// Has somebody else changed this field since the page was opened?
// ---------------------------------------------------------------------------

/** The one sentence a client sees when their page is out of date. */
export const staleMessage = (field: string) =>
  `Someone changed ${field} since you opened the page; reload and try again`;

/**
 * Is the stored value no longer the one the page rendered?
 *
 * The editor sends `expected`: the value the page showed when it was opened,
 * marks stripped. That is browser HTML, and the stored value is not, so the two
 * are compared after `cleanValue` has put the browser's copy through exactly the
 * whitespace and tag rules a publish would — otherwise every second publish
 * would be refused over a space the browser inserted.
 *
 * No `expected` means an older editor, or a value this server signed itself
 * (an undo), and neither is checked.
 */
export function isStale(stored: string, expected: string | undefined): boolean {
  if (typeof expected !== 'string') return false;
  return cleanValue(expected, stored) !== stored;
}

// ---------------------------------------------------------------------------
// What the two keys a client presses most actually do
// ---------------------------------------------------------------------------

/** What pressing Enter in an editable field should do. */
export type EnterAction = 'commit' | 'break' | 'ignore';

/**
 * Enter and Shift+Enter, decided by what the field holds rather than by what
 * the browser feels like doing.
 *
 * Enter always commits: it is the only key a client tries when they have
 * finished a sentence, and a browser's own answer (a new `<div>`) is thrown
 * away by the cleaner anyway. Shift+Enter is a line break, and only where a
 * line break can survive the trip: a value that already carries tags, or an
 * article body. In a plain field it would be cleaned back out on the way to
 * disk, so it commits too rather than pretending.
 */
export function enterAction(
  key: string,
  shiftKey: boolean,
  { stored, body = false }: { stored: string; body?: boolean },
): EnterAction {
  if (key !== 'Enter') return 'ignore';
  if (!shiftKey) return 'commit';
  return body || isRich(stored) ? 'break' : 'commit';
}

/** What to insert for one paste, and whether it is text or markup. */
export type PasteInsert = { mode: 'text'; value: string } | { mode: 'html'; value: string };

/**
 * What a paste should actually put on the page.
 *
 * A browser pastes whatever the clipboard carries — Word's spans, a site's
 * classes, a colour — and the page then showed something the publish would
 * never store, so the client's own screen lied to them until the next reload.
 * The rule is the one the publish uses: a plain field takes the plain text, a
 * rich field takes the same small set of tags `cleanValue` keeps, and the
 * article body takes plain text because its stored HTML is written back
 * sentence by sentence.
 */
export function pasteInsert(
  { html, text }: { html: string; text: string },
  { stored, body = false }: { stored: string; body?: boolean },
): PasteInsert {
  // The clipboard's own plain text first: it is what the person copied, with
  // none of the source page's markup to strip back off.
  if (body || !isRich(stored)) return { mode: 'text', value: cleanValue(text || html, '') };
  const value = cleanValue(html || text, stored);
  return value.includes('<') ? { mode: 'html', value } : { mode: 'text', value };
}

/**
 * Has this field been emptied? Asked on every keystroke, so the refusal arrives
 * where the client made it rather than at Publish, three edits later.
 *
 * The same question the store asks: a value that cleans away to nothing is one
 * the publish refuses with "A value cannot be emptied from the page".
 */
export function isEmptyValue(edited: string): boolean {
  return cleanValue(edited, '').trim().length === 0;
}

/** The one line a client sees the moment they empty a field. */
export const EMPTY_FIELD_MESSAGE = 'A field cannot be left empty';
