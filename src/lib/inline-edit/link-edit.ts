/**
 * Where a link points, and which of three places that address is stored.
 *
 * Text editing never reached a link's destination. `mark-tree.ts` leaves any
 * value that looks like an address unmarked, on purpose: an address is not
 * something you type onto a page, so there was nothing to click. This file is
 * the other half — it works out, for one `<a>` on the page, where its address
 * actually lives, so the editor can offer a field for it.
 *
 * Three places, and they are told apart by what surrounds the link:
 *
 *   - **sibling**: the link's words are a content value (`nav:links.0.label`)
 *     and its address is a plain sibling key in the same object
 *     (`nav:links.0.href`). Changing it is an ordinary content publish, so
 *     History, Undo and the one-line-diff rule all keep working untouched.
 *   - **rich**: the link is inside a content value that is stored as HTML
 *     (`Read the <a href="/pricing">pricing</a> page`). The address is part of
 *     that one string, so rewriting the anchor and re-staging the value is the
 *     whole change; the sanitizer rebuilds the anchor from its parsed href.
 *   - **body**: the link is in a Sanity article body, which is megabytes of raw
 *     HTML the editor never sends back. It is changed the way a sentence is:
 *     by naming the address to replace and which occurrence of it (see
 *     `body-edit.ts`).
 *
 * The last section is the other end of the same question: reading the anchors
 * back off the public page, so the status light can prove that the link it
 * changed is the link that moved.
 *
 * Everything here is pure string and structure work. No `server-only`, no
 * request, no DOM call — `linkCaseFor` reads two elements it is handed but
 * never touches the document — so both sides of the editor use the same rules
 * and a test can run them without the Next runtime or a browser.
 */
import { SAFE_HREF } from './sanitize';
import { idFor } from './mark-tree';
import { markupVariants } from './image-edit';

/** The one message a client sees when what they typed is not an address. */
export const ADDRESS_REFUSAL = 'That does not look like a web address';

/** The longest address we will write. Far past any real link; a stop on paste accidents. */
const MAX_HREF = 2000;

/**
 * Characters an address may never contain once we are about to write it into
 * an `href="…"` in stored HTML or into a JSON value a page renders as HTML.
 *
 * A quote would end the attribute and start a second one; a space, tab or
 * newline splits the attribute in two. A real address carries these
 * percent-encoded, so refusing them costs nothing and removes the whole class.
 */
const UNSAFE_IN_HREF = /["'<>`\s]/;

/**
 * Is this something we are willing to put in an href?
 *
 * The prefix rule is `SAFE_HREF`, the same one the sanitizer applies to every
 * anchor it rebuilds, so the editor's field and the publish route agree about
 * what an address is: a path on this site, http(s), mailto, tel, or `#section`.
 */
export function isSafeHref(href: string): boolean {
  const value = href.trim();
  if (!value || value.length > MAX_HREF) return false;
  if (UNSAFE_IN_HREF.test(value)) return false;
  return SAFE_HREF.test(value);
}

/**
 * Keys a content file uses for a link's destination.
 *
 * Measured across `src/data/content/*.json` on 2026-09-18: 23 `href`, 5 `url`,
 * 2 `linkHref`, 1 `ctaHref`. `to` and `link` are here because they are the two
 * other names a page author reaches for, and a key nobody used yet costs
 * nothing to accept.
 */
export const siblingAddressKeys = ['href', 'url', 'linkHref', 'ctaHref', 'to', 'link'] as const;

/** Is this key one that holds an address rather than words? */
export function isAddressKey(key: string): boolean {
  const wanted = key.toLowerCase();
  return siblingAddressKeys.some((candidate) => candidate.toLowerCase() === wanted);
}

/**
 * One address, reduced to the form that can be compared with another.
 *
 * The page and the content file rarely spell the same link the same way: the
 * file says `/pricing`, the rendered anchor may say
 * `https://www.loudface.co/pricing` or `/pricing/`. All three name one page, so
 * all three have to reduce to `/pricing` before they are matched.
 */
export function normalizeHrefForMatch(href: string, origin = ''): string {
  let value = href.trim();
  if (!value) return '';

  const site = origin.trim().replace(/\/+$/, '');
  if (site && value.toLowerCase().startsWith(site.toLowerCase())) {
    value = value.slice(site.length) || '/';
  }
  // A bare host is the home page; give it the slash so it reduces like one.
  if (/^https?:\/\/[^/?#]+$/i.test(value)) value = `${value}/`;

  return value.length > 1 ? value.replace(/\/+$/, '') : value;
}

/** What the sibling lookup answers: the address field's id, or why there is none. */
export type SiblingLookup = { id: string | null; reason?: string };

function objectAt(root: unknown, segments: string[]): Record<string, unknown> | null {
  let node: unknown = root;
  for (const segment of segments) {
    if (!node || typeof node !== 'object') return null;
    node = (node as Record<string, unknown>)[segment];
  }
  return node && typeof node === 'object' && !Array.isArray(node) ? (node as Record<string, unknown>) : null;
}

/**
 * The content id of the address field belonging to a label.
 *
 * `labelId` is the id the editor read off the page, say `nav:links.0.label`.
 * Its address is a sibling key in the same object, so this looks at
 * `nav.links[0]` and takes the address-shaped key whose value is the link the
 * browser is actually showing. Matching on the value, not just on the name,
 * is what keeps a card with a label, an `href` and a second `ctaHref` honest.
 */
export function findSiblingAddressId(
  json: unknown,
  labelId: string,
  currentHref: string,
  origin = '',
): SiblingLookup {
  // A light split, not the grammar: `content-text.ts` owns what a content id
  // may look like and checks it again on every publish. This only has to find
  // the object the label sits in. Importing `parseId` here would make these two
  // files import each other, which is why the strict check stays over there.
  const [file, fieldPath] = labelId.split(':');
  if (!file || !fieldPath) {
    return { id: null, reason: 'That is not a content value this editor knows' };
  }
  const segments = fieldPath.split('.');
  if (segments.length < 2) {
    return { id: null, reason: 'That value has no sibling fields to look at' };
  }

  const parentPath = segments.slice(0, -1);
  const parent = objectAt(json, parentPath);
  if (!parent) return { id: null, reason: 'That value is not in an object with sibling fields' };

  const wanted = normalizeHrefForMatch(currentHref, origin);
  if (!wanted) return { id: null, reason: 'That link has no address to match' };

  const candidates = Object.keys(parent).filter(
    (key) => isAddressKey(key) && typeof parent[key] === 'string',
  );
  for (const key of candidates) {
    if (normalizeHrefForMatch(parent[key] as string, origin) === wanted) {
      return { id: idFor(file, [...parentPath, key]) };
    }
  }

  return {
    id: null,
    reason: candidates.length
      ? 'This link is written next to that text, but none of the address fields there hold this address'
      : 'This link is not stored next to that text, so it cannot be changed from the page yet',
  };
}

// ---------------------------------------------------------------------------
// Which of the three cases one link on the page is
// ---------------------------------------------------------------------------

/** Only what this file reads: enough to run without the DOM types in a test. */
type LinkNode = {
  tagName: string;
  contains(other: unknown): boolean;
};

/** The editable element the editor registered, as this file reads it. */
type EditableRoot = LinkNode & { dataset: Record<string, string | undefined> };

export type LinkCase = 'sibling' | 'rich' | 'body';

/**
 * Which of the three cases this anchor is, or null when it is not editable.
 *
 * `editableRoot` is the element the editor put `data-lf-id` on. Two things
 * decide the answer: whether that element is the article body, and whether the
 * link wraps the whole value or sits inside it.
 *
 * A link that wraps the value means the value is only the link's words, so the
 * address is a sibling key next to them. A link inside the value means the
 * address is part of that one stored string.
 */
export function linkCaseFor(anchor: LinkNode, editableRoot: EditableRoot): LinkCase | null {
  const id = editableRoot.dataset.lfId;
  if (!id) return null;
  if (editableRoot.dataset.lfType === 'html') return 'body';
  // A Sanity string is one field; the anchor is part of it either way, so the
  // whole value is re-staged and the sanitizer keeps a safe href.
  if (id.startsWith('sanity:')) return 'rich';
  if (anchor === editableRoot || anchor.contains(editableRoot)) return 'sibling';
  if (editableRoot.contains(anchor)) return 'rich';
  return null;
}

// ---------------------------------------------------------------------------
// Reading the anchors back off the public page
// ---------------------------------------------------------------------------

/**
 * The invisible characters a marked page carries: our own tag-character ids and
 * the zero-width spellings Sanity's stega uses. They sit inside the words, so
 * they come out before any comparison.
 */
const MARKS = /[\u{E0000}-\u{E007F}​‌‍﻿]/gu;

/**
 * A page's words, as a person reads them.
 *
 * This is the rule the status light has always used on a whole page; it lives
 * here now because the anchor scan has to read an anchor's words by exactly the
 * same rule. Two normalisations that drift apart would make the light answer
 * about a label the client never saw.
 */
export function visibleText(html: string): string {
  return html
    .replace(/<(script|style|noscript|template)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    // A page can carry a numeric entity outside Unicode's range; String.fromCodePoint
    // throws on one, and the live check must not fall over reading a page.
    .replace(/&#(\d+);/g, (whole, code: string) => {
      const point = Number(code);
      return Number.isInteger(point) && point >= 0 && point <= 0x10ffff ? String.fromCodePoint(point) : whole;
    })
    .replace(MARKS, '')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, ' ');
}

/** One string the editor is looking for, reduced the same way the page's words are. */
export function normalizeText(text: string): string {
  return text
    .replace(/<[^>]+>/g, ' ')
    .replace(MARKS, '')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

/** One anchor on the page: where it points and the words it shows. */
export type AnchorTarget = { href: string; text: string };

/**
 * One `<a>` and its contents. Attributes may be in any order and quoted either
 * way, and anything may be nested inside — a span, an icon, a mark character.
 * An attribute value carrying a literal `>` would cut the tag short, which no
 * address of ours can and no real label does.
 */
const ANCHOR = /<a\b([^>]*)>([\s\S]*?)<\/a\s*>/gi;
const HREF_ATTR = /(?:^|[\s/])href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i;

/**
 * Every anchor in a page's raw HTML, with its address and its visible words.
 *
 * This is what the status light needed and never had. Asking whether an address
 * appears anywhere in the HTML answers a different question: a nav that already
 * links to `/case-studies` makes a change of `Blog` to `/case-studies` look live
 * the second it is committed, before the site has even built.
 */
export function anchorsIn(html: string): AnchorTarget[] {
  const out: AnchorTarget[] = [];
  for (const match of html.matchAll(ANCHOR)) {
    const found = HREF_ATTR.exec(match[1] ?? '');
    if (!found) continue;
    const href = (found[1] ?? found[2] ?? found[3] ?? '').trim().replace(/&amp;/g, '&');
    if (!href) continue;
    out.push({ href, text: visibleText(match[2] ?? '').trim() });
  }
  return out;
}

/**
 * Every spelling of one address that means the same page.
 *
 * `markupVariants` owns the trailing-slash rule, because Next writes `/blog/`
 * out as `/blog`. The percent-encoded form is here for an address a page hands
 * to another route inside a query.
 */
export function hrefForms(href: string): string[] {
  const value = href.trim();
  const out = new Set<string>();
  for (const form of markupVariants(`href="${value}"`)) {
    const inner = /^href="([^"]*)"$/.exec(form)?.[1];
    if (inner === undefined) continue;
    out.add(inner);
    out.add(encodeURIComponent(inner));
  }
  if (!out.size) out.add(value);
  return [...out];
}

/** Do these two addresses name the same page, however each is spelled? */
export function hrefMatches(anchorHref: string, wanted: string): boolean {
  const forms = new Set(hrefForms(wanted));
  const candidates = new Set([anchorHref.trim()]);
  try {
    candidates.add(decodeURIComponent(anchorHref.trim()));
  } catch {
    /* a half-encoded address is compared as written */
  }
  for (const candidate of candidates) {
    for (const form of hrefForms(candidate)) if (forms.has(form)) return true;
  }
  return false;
}

/**
 * Is one of these anchors the link that was asked about — this address under
 * these words?
 *
 * The words are matched by containment, not only by equality: a label can be
 * drawn with an icon or a counter beside it inside the same anchor. An empty
 * label asks about the address alone, which is the old, weaker question; the
 * status route never sends one for the "it is gone" half.
 */
export function anchorCarries(anchors: AnchorTarget[], wanted: AnchorTarget): boolean {
  const label = normalizeText(wanted.text);
  return anchors.some(
    (anchor) => hrefMatches(anchor.href, wanted.href) && (!label || anchor.text.includes(label)),
  );
}

/**
 * The id prefix a link's label shares with its address.
 *
 * An undo hands back `nav:links.1.href` and nothing else. The words that link
 * shows are a sibling of it, `nav:links.1.label`, so everything up to the last
 * segment is what the page is searched for. `home:href` has no siblings to look
 * at and answers null, and the caller then falls back to the address alone.
 */
export function addressLabelPrefix(id: string): string | null {
  const colon = id.indexOf(':');
  if (colon === -1) return null;
  const dot = id.lastIndexOf('.');
  return dot > colon ? id.slice(0, dot + 1) : null;
}
