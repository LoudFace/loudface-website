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
 * Shared by the client (to describe the edit) and the server (to apply it).
 * No server-only import, no DOM use.
 */

export type TextReplacement = {
  /** The text node's content before the edit, as shown on the page. */
  from: string;
  /** Its content after the edit. */
  to: string;
  /** Which match to take when several text nodes showed the same text: 0 = first. */
  occurrence: number;
};

export type BodyEdit = { replacements: TextReplacement[] };

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

/** Parse the value an editor sends for a body field. */
export function parseBodyEdit(value: string): BodyEdit {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error('The article body edit is not readable');
  }
  const edit = parsed as Partial<BodyEdit>;
  if (!edit || !Array.isArray(edit.replacements) || !edit.replacements.length) {
    throw new Error('The article body edit holds no changes');
  }
  for (const item of edit.replacements) {
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
  return { replacements: edit.replacements as TextReplacement[] };
}
