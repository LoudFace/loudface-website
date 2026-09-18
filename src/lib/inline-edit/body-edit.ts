/**
 * Editing an article body without rewriting it.
 *
 * A blog body in Sanity is one `text` field holding raw HTML: paragraphs,
 * tables, code blocks, in some posts inline SVG diagrams with their own
 * <style>. Serialising the edited page back into that field would destroy
 * what a cleaner does not recognise and bake in everything the page adds at
 * render time (heading ids, straight quotes, auto-linked service mentions,
 * the scroll wrapper around tables).
 *
 * So the editor never sends the body. It sends the sentences that changed:
 * for each edited text node, the text it held before and the text it holds
 * now. This module finds that text inside the stored HTML and replaces it
 * there, touching nothing else. Every tag, attribute and untouched sentence
 * is written back byte for byte.
 *
 * Matching happens on the text the page shows: entities decoded, curly quotes
 * straightened, the way the render pipeline does it. A stored segment that the
 * page split with an auto-link still contains the sentence as a substring, so
 * it still matches.
 *
 * A link's destination travels the same way. The editor sends the address the
 * link points at now, the address it should point at, and which occurrence of
 * that address in the element it means. The server rewrites exactly that one
 * `href` and leaves every other byte alone.
 *
 * Shared by the client (to describe the edit) and the server (to apply it).
 * No server-only import, no DOM use.
 */
import { ADDRESS_REFUSAL, isSafeHref } from './link-edit';

export type TextReplacement = {
  /** The text node's content before the edit, as shown on the page. */
  from: string;
  /** Its content after the edit. */
  to: string;
  /** Which match to take when several text nodes showed the same text: 0 = first. */
  occurrence: number;
};

export type LinkReplacement = {
  /** The address the link points at now, exactly as the page shows it. */
  from: string;
  /** The address it should point at. */
  to: string;
  /** Which link to take when several point at the same address: 0 = first in the element. */
  occurrence: number;
};

export type BodyEdit = { replacements: TextReplacement[]; links: LinkReplacement[] };

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

/** A code outside Unicode's range would throw; leave that entity as written. */
function fromCode(code: number, original: string): string {
  if (!Number.isInteger(code) || code < 0 || code > 0x10ffff) return original;
  return String.fromCodePoint(code);
}

function decodeEntities(text: string): string {
  return text.replace(/&(#\d+|#x[0-9a-f]+|[a-z]+);/gi, (whole, name: string) => {
    const lower = name.toLowerCase();
    if (lower in ENTITIES) return ENTITIES[lower];
    if (lower.startsWith('#x')) return fromCode(parseInt(lower.slice(2), 16), whole);
    if (lower.startsWith('#')) return fromCode(parseInt(lower.slice(1), 10), whole);
    return whole;
  });
}

function encodeText(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** The same quote normalisation the blog page applies before rendering. */
export function normalizeShownText(text: string): string {
  return text.replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/ /g, ' ');
}

/** Split HTML into alternating tag and text tokens; tags keep their exact text. */
function tokenize(html: string): { tag: boolean; text: string }[] {
  const out: { tag: boolean; text: string }[] = [];
  const re = /<[^>]*>/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    if (match.index > last) out.push({ tag: false, text: html.slice(last, match.index) });
    out.push({ tag: true, text: match[0] });
    last = match.index + match[0].length;
  }
  if (last < html.length) out.push({ tag: false, text: html.slice(last) });
  return out;
}

/** Text as the page shows it, for one stored text segment. */
const shown = (segment: string) => normalizeShownText(decodeEntities(segment));

/**
 * Apply text replacements to stored HTML. Throws with a readable message when
 * a replacement cannot be placed, so nothing is written half-way.
 */
export function applyTextReplacements(storedHtml: string, replacements: TextReplacement[]): string {
  const tokens = tokenize(storedHtml);

  for (const replacement of replacements) {
    const from = normalizeShownText(replacement.from);
    const to = normalizeShownText(replacement.to);
    if (!from.trim()) throw new Error('A replacement needs the original text');
    if (from === to) continue;

    let seen = 0;
    let placed = false;
    for (const token of tokens) {
      if (token.tag) continue;
      const visible = shown(token.text);
      const at = visible.indexOf(from);
      if (at === -1) continue;
      if (seen++ < replacement.occurrence) continue;

      const next = visible.slice(0, at) + to + visible.slice(at + from.length);
      token.text = encodeText(next);
      placed = true;
      break;
    }
    if (!placed) {
      throw new Error(`Could not find this sentence in the stored article: "${from.slice(0, 60)}${from.length > 60 ? '…' : ''}"`);
    }
  }

  return tokens.map((token) => token.text).join('');
}

/**
 * Every `href="…"` or `href='…'` in the stored HTML, in the order it is written.
 *
 * The quote character is captured so the replacement keeps it: the point of
 * this module is that nothing but the one changed run of bytes moves, and
 * turning every single-quoted attribute in an article into a double-quoted one
 * would make a link change look like a rewrite of the whole body.
 */
const HREF_ATTRIBUTE = /href\s*=\s*(["'])([^"']*)\1/g;

/**
 * Change where one link points, inside stored HTML, without touching anything
 * else.
 *
 * Addresses are compared as the page shows them, the way text is: a stored
 * `href="/a?x=1&amp;y=2"` is the same link as the `/a?x=1&y=2` a browser hands
 * back, so the stored value is decoded before it is matched, and the new one is
 * encoded again on the way in.
 */
export function applyLinkReplacements(storedHtml: string, links: LinkReplacement[]): string {
  let html = storedHtml;

  for (const link of links) {
    const from = link.from.trim();
    const to = link.to.trim();
    if (!from) throw new Error('A link change needs the address it replaces');
    if (!isSafeHref(to)) throw new Error(ADDRESS_REFUSAL);
    if (from === to) continue;

    let seen = 0;
    let placed = false;
    HREF_ATTRIBUTE.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = HREF_ATTRIBUTE.exec(html)) !== null) {
      if (decodeEntities(match[2]).trim() !== from) continue;
      if (seen++ < link.occurrence) continue;

      const quote = match[1];
      // `isSafeHref` has already refused quotes, angle brackets and spaces, so
      // an ampersand is the only character left that has to be written as an
      // entity for the attribute to mean what it says.
      const written = `href=${quote}${to.replace(/&/g, '&amp;')}${quote}`;
      html = html.slice(0, match.index) + written + html.slice(match.index + match[0].length);
      placed = true;
      break;
    }
    if (!placed) {
      throw new Error(`Could not find a link to ${from.slice(0, 80)} in the stored article`);
    }
  }

  return html;
}

/** Parse the value an editor sends for a body field. */
export function parseBodyEdit(value: string): BodyEdit {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error('The article body edit is not readable');
  }
  const edit = parsed as Partial<BodyEdit>;
  const replacements = Array.isArray(edit?.replacements) ? edit.replacements : [];
  const links = Array.isArray(edit?.links) ? edit.links : [];
  if (!replacements.length && !links.length) {
    throw new Error('The article body edit holds no changes');
  }
  for (const item of replacements) {
    if (
      typeof item?.from !== 'string' ||
      typeof item?.to !== 'string' ||
      typeof item?.occurrence !== 'number' ||
      item.occurrence < 0
    ) {
      throw new Error('The article body edit is malformed');
    }
    if (item.to.length > 20_000) throw new Error('That paragraph is too long');
  }
  for (const item of links) {
    if (
      typeof item?.from !== 'string' ||
      typeof item?.to !== 'string' ||
      typeof item?.occurrence !== 'number' ||
      item.occurrence < 0
    ) {
      throw new Error('The article body edit is malformed');
    }
    if (!isSafeHref(item.to)) throw new Error(ADDRESS_REFUSAL);
  }
  return { replacements: replacements as TextReplacement[], links: links as LinkReplacement[] };
}
