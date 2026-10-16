/**
 * Where a comment pin sits, and how it finds that spot again.
 *
 * A pin is tied to the element that was clicked, never to a point on the
 * screen: the same page is 1440px wide on one laptop and 390px on a phone, and
 * a carousel or an edited paragraph moves everything below it. The anchor
 * keeps four ways back, tried in order:
 *
 *  1. `selector` — a path to the element. It starts at the nearest ancestor
 *     with a stable name: the editor's own content id (`data-lf-id`, which is
 *     the content key and survives a redesign), then an id a person wrote.
 *     Below that it is tag and position (`div:nth-of-type(2)`).
 *  2. `quote` — the element's own words. When the path finds nothing (a
 *     section was added above it), the one element of the same tag whose words
 *     match is the same element, moved.
 *  3. `rx`/`ry` — where inside that element the click landed, as fractions of
 *     its box, so the pin stays on the word or the corner it was put on at any
 *     width.
 *  4. The nearest part of the page around it: the path with its last steps
 *     taken off, one at a time. A comment on a button that was removed lands on
 *     the section that held it, and says so (Webflow moves a comment on a
 *     deleted element to its parent the same way).
 *  5. `px`/`py` — the page position at the moment it was made. Only used when
 *     the element cannot be found at all; the pin is then drawn dashed and the
 *     thread says its spot changed, so nobody reads it as still pointing at
 *     the thing it was about.
 *
 * Words edited in the editor do not detach a comment: the path still finds the
 * element, and the thread says the words changed since. That is the case this
 * editor exists for — "soften this line", the line gets softened.
 *
 * Pure: everything here takes the element-like objects it reads, so the tests
 * run without a browser.
 */
import { strip } from './mark';

export type CommentAnchor = {
  v: 1;
  selector: string;
  tag: string;
  quote: string;
  rx: number;
  ry: number;
  /** Page position when made: x as a fraction of the page width, y in pixels from the top. */
  px: number;
  py: number;
  /** Width of the page the comment was left on, for the thread's "left at 1440px". */
  vw: number;
  /** Height of the window it was left in, so its snapshot is taken in the same shape. */
  vh?: number;
};

/** The parts of an element this file reads. A real `Element` has all of them. */
export type ElementLike = {
  tagName: string;
  id?: string;
  parentElement: ElementLike | null;
  children: ArrayLike<ElementLike>;
  getAttribute(name: string): string | null;
  textContent: string | null;
};

const QUOTE_MAX = 120;
/** Zero-width characters @vercel/stega hides Sanity's source map in. */
const STEGA = /[​-‍⁠﻿]/g;

/** An element's words as a quote: marks and stega gone, whitespace flattened, clipped. */
export function quoteOf(text: string | null | undefined): string {
  return strip(text ?? '').replace(STEGA, '').replace(/\s+/g, ' ').trim().slice(0, QUOTE_MAX);
}

/**
 * What an element says, for the quote. A picture has no words, so its alt text
 * stands in, or failing that the file name it shows.
 */
export function wordsOf(el: ElementLike): string {
  if (el.tagName.toLowerCase() === 'img') {
    const alt = quoteOf(el.getAttribute('alt'));
    if (alt) return alt;
    const src = (el.getAttribute('src') ?? '').split('?')[0].split('/').pop() ?? '';
    return quoteOf(decodeURIComponent(src));
  }
  return quoteOf(el.textContent);
}

/**
 * An id a person wrote, not one a framework generated. React's `useId` gives
 * `:r1:` or `«r1»`, Radix and Headless UI give `radix-…` and `headlessui-…`,
 * and anything with a long run of digits or hex is a counter or a hash.
 */
export function stableId(id: string | null | undefined): boolean {
  if (!id || id.length > 64) return false;
  if (/[:«»]/.test(id)) return false;
  if (/^(radix|headlessui|react-aria|mui|chakra|base-ui)[-_]/i.test(id)) return false;
  if (/\d{3,}|[0-9a-f]{8,}/i.test(id)) return false;
  return /^[A-Za-z][\w-]*$/.test(id);
}

const cssString = (value: string) => value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

/** The one step for this element: its stable name if it has one, else tag and position. */
function step(el: ElementLike): { text: string; stable: boolean } {
  const lfId = el.getAttribute('data-lf-id');
  if (lfId) return { text: `[data-lf-id="${cssString(lfId)}"]`, stable: true };
  const id = el.id ?? el.getAttribute('id');
  if (id && stableId(id)) return { text: `#${id}`, stable: true };
  const tag = el.tagName.toLowerCase();
  const parent = el.parentElement;
  if (!parent) return { text: tag, stable: false };
  const same = Array.from(parent.children).filter((child) => child.tagName === el.tagName);
  if (same.length === 1) return { text: tag, stable: false };
  return { text: `${tag}:nth-of-type(${same.indexOf(el) + 1})`, stable: false };
}

/**
 * A path from `root` (the element the page sits in) down to `el`, stopping
 * early at the first stable name. `root` itself is never part of the path:
 * resolving runs `root.querySelector(path)`, so `:scope > ` starts it.
 */
export function selectorFor(el: ElementLike, root: ElementLike): string {
  const parts: string[] = [];
  let node: ElementLike | null = el;
  while (node && node !== root) {
    const part = step(node);
    parts.unshift(part.text);
    if (part.stable) return parts.join(' > ');
    node = node.parentElement;
  }
  return parts.length ? `:scope > ${parts.join(' > ')}` : '';
}

const clamp01 = (n: number) => (Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0.5);
const round = (n: number, places = 4) => Math.round(n * 10 ** places) / 10 ** places;

/** Where in a box a point is, as fractions of the box. */
export function spotWithin(
  box: { left: number; top: number; width: number; height: number },
  x: number,
  y: number,
): { rx: number; ry: number } {
  return {
    rx: round(clamp01(box.width ? (x - box.left) / box.width : 0.5)),
    ry: round(clamp01(box.height ? (y - box.top) / box.height : 0.5)),
  };
}

/** The point those fractions name in a box, wherever the box is now. */
export function pointIn(
  box: { left: number; top: number; width: number; height: number },
  rx: number,
  ry: number,
): { x: number; y: number } {
  return { x: box.left + clamp01(rx) * box.width, y: box.top + clamp01(ry) * box.height };
}

/** An anchor read back from storage, or null when it is not one this file wrote. */
export function readAnchor(value: unknown): CommentAnchor | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  const num = (key: string) => (typeof raw[key] === 'number' && Number.isFinite(raw[key]) ? (raw[key] as number) : null);
  const selector = typeof raw.selector === 'string' ? raw.selector : '';
  const rx = num('rx');
  const ry = num('ry');
  const px = num('px');
  const py = num('py');
  if (!selector || rx === null || ry === null || px === null || py === null) return null;
  return {
    v: 1,
    selector,
    tag: typeof raw.tag === 'string' ? raw.tag : '',
    quote: typeof raw.quote === 'string' ? raw.quote : '',
    rx,
    ry,
    px,
    py,
    vw: num('vw') ?? 0,
    ...(num('vh') !== null ? { vh: num('vh')! } : {}),
  };
}

/**
 * How a pin was found: where it was put, the same element with new words,
 * moved, only the part of the page around it, or not at all.
 */
export type AnchorState = 'exact' | 'changed' | 'moved' | 'parent' | 'detached';

/**
 * Find the element again. `query` and `candidates` are the page's own
 * `querySelector` and `querySelectorAll` on the root, passed in so the order of
 * the tries is testable.
 */
export function resolveAnchor<E extends ElementLike>(
  anchor: CommentAnchor,
  query: (selector: string) => E | null,
  candidates: (tag: string) => ArrayLike<E>,
): { el: E | null; state: AnchorState } {
  let found: E | null = null;
  try {
    found = query(anchor.selector);
  } catch {
    found = null; // a path this browser cannot parse is a path that finds nothing
  }
  if (found) {
    const now = wordsOf(found);
    return { el: found, state: !anchor.quote || now === anchor.quote ? 'exact' : 'changed' };
  }
  if (anchor.quote && anchor.tag) {
    const matches = Array.from(candidates(anchor.tag)).filter((el) => wordsOf(el) === anchor.quote);
    if (matches.length === 1) return { el: matches[0], state: 'moved' };
  }
  const steps = anchor.selector.split(' > ');
  for (let keep = steps.length - 1; keep > 0; keep -= 1) {
    const prefix = steps.slice(0, keep);
    if (prefix.length === 1 && prefix[0] === ':scope') break; // the page itself is not a spot
    try {
      const around = query(prefix.join(' > '));
      if (around) return { el: around, state: 'parent' };
    } catch {
      break;
    }
  }
  return { el: null, state: 'detached' };
}
