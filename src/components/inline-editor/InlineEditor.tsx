'use client';

/**
 * Inline editor — mounted only while Draft Mode is on.
 *
 * It works out what is editable by reading the page: every string served
 * through the content layer carries its content id, and every content image
 * carries the same id in a query. Page components hold no editing code, so
 * building a new page needs nothing from whoever builds it, and a redesign
 * cannot break editing.
 *
 * Deliberately narrow: text, and the address of a content image. No layout, no
 * section moving, no component choice.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { VERCEL_STEGA_REGEX } from '@vercel/stega';
import { decodeStega, stripStega } from '../../lib/inline-edit/stega';
import {
  normalizeShownText,
  type LinkReplacement,
  type TextReplacement,
} from '../../lib/inline-edit/body-edit';
import {
  addressLabelPrefix,
  countAnchors,
  isSafeHref,
  linkCaseFor,
  linkProofs,
  normalizeText,
  type AnchorTarget,
  type LinkCase,
  type LinkEdit,
} from '../../lib/inline-edit/link-edit';
import {
  EMPTY_FIELD_MESSAGE,
  enterAction,
  isEmptyValue,
  pasteInsert,
} from '../../lib/inline-edit/sanitize';
import { ADDRESS } from '../../lib/inline-edit/mark-tree';
import { landedRecently } from '../../lib/inline-edit/publish-history';
import { DRAFT_KEPT_NOTE } from '../../lib/inline-edit/sanity-rules';
import { EditorShell, type ShellStatus } from './EditorShell';
import {
  MAX_IMAGE_BYTES,
  SANITY_IMAGE_PREFIX,
  TOO_BIG_MESSAGE,
  contentIdFromImageSrc,
  isSvgSource,
  realImageSource,
  sanityAssetIdFromUrl,
} from '../../lib/inline-edit/image-edit';

/**
 * A staged edit.
 *
 * `file` is set when the editor picked a picture instead of typing. `markup` is
 * what the status light should look for in the public page's raw HTML rather
 * than in its words, and `address` says the value is an address, so it is never
 * looked for as visible text at all — a link's destination is in an attribute,
 * and the words around it did not change.
 *
 * What a moved link needs the light to count is NOT here: it is worked out at
 * Publish, from the page as it then stands, by `linkProofs`. Counting it at the
 * moment of the change was right exactly once — a second Apply counted a page
 * that already carried the first one.
 */
type Change = {
  id: string;
  value: string;
  label: string;
  file?: File;
  markup?: string[];
  address?: boolean;
};
/** Anything a `record` call wants to say about a change beyond its value. */
type ChangeExtra = {
  file?: File;
  markup?: string[];
  address?: boolean;
};
/** One link in the Links panel: what it says, where it points, and where that address lives. */
type LinkRow = { text: string; href: string; anchor: HTMLAnchorElement; kind: LinkCase };
/** The Links panel: the element that was clicked and every link inside it. */
type LinkPanel = { id: string; root: HTMLElement; rows: LinkRow[]; at: Point };
/** Where a popover opens: the bottom-left corner of what was clicked, in viewport pixels. */
type Point = { x: number; y: number };
type Status = {
  kind: 'idle' | 'saving' | 'saved' | 'checking' | 'live' | 'stale' | 'error';
  message?: string;
  /** Seconds elapsed since publish, shown while checking and when live. */
  seconds?: number;
};
type Publish = {
  hash: string;
  date: string;
  editor: string;
  summary: string;
  fields: string[];
  reverted: boolean;
};
/** What the server handed back so this session can undo its own Sanity publish:
 *  a signed token per field, never the old text. The server alone can open it. */
type SanityUndo = { id: string; token: string };
/**
 * The image panel. `content` is true for a picture whose path lives in one of
 * our content files — only those have an address that can be typed instead.
 */
type AssetTarget = { id: string; current: string; content: boolean; address: boolean; at: Point };

const START = '\u{E0001}';
const BASE = 0xe0000;
const MARKS = /[\u{E0000}-\u{E007F}]/gu;
const OUTLINE = '2px solid #2f7de1';
const OUTLINE_HOVER = '2px dashed #9dc3f2';
/** Sanity fields the editor never makes clickable: the whole-article body. */
const BODY_PATH = new Set(['content', 'body']);
/** A text node inside any of these never becomes an editable field. */
const BLOCKED_ANCESTORS = 'script, style, title, noscript, template, [data-lf-chrome]';
/** Smaller than this on screen and it is an icon or a spacer, not a picture to replace. */
const SMALLEST_IMAGE = 24;
/** How long a burst of page changes is allowed to settle before one re-scan. */
const RESCAN_DELAY = 150;
/** What the file picker offers. The server still reads the file's own first bytes. */
const IMAGE_TYPES = 'image/png,image/jpeg,image/webp,image/gif';

function decodeMark(text: string): string | null {
  const start = text.indexOf(START);
  if (start === -1) return null;
  let id = '';
  for (const char of text.slice(start + START.length)) {
    const code = char.codePointAt(0)!;
    if (code < BASE + 0x20 || code > BASE + 0x7e) break;
    id += String.fromCodePoint(code - BASE);
  }
  return id || null;
}

/** Both marker kinds removed: our own tag-character ids, and Sanity's stega. */
const strip = (text: string) => stripStega(text.replace(MARKS, ''));

/** Text nodes inside script/style/title/noscript/template, or our own chrome, are never editable. */
const blocked = (node: Text): boolean => Boolean(node.parentElement?.closest(BLOCKED_ANCESTORS));

/** How many marked fields (ours or Sanity's) live in this subtree. */
function countMarks(el: Element | null): number {
  if (!el) return 0;
  const text = el.textContent ?? '';
  let n = 0;
  for (const char of text) if (char === START) n++;
  n += text.match(VERCEL_STEGA_REGEX)?.length ?? 0;
  return n;
}

/** The element that owns this value: climb while the parent adds no other text. */
function fieldElement(node: Text): HTMLElement | null {
  let el: HTMLElement | null = node.parentElement;
  if (!el) return null;
  for (let i = 0; i < 3; i++) {
    const parent: HTMLElement | null = el.parentElement;
    if (!parent || countMarks(parent) !== 1) break;
    if ((parent.textContent ?? '').trim().length !== (el.textContent ?? '').trim().length) break;
    el = parent;
  }
  return el;
}

/**
 * Everything editable inside these subtrees, discovered from the page itself.
 *
 * It takes roots rather than always reading the whole document because it runs
 * again on every change to the page. A site with a carousel changes the page
 * several times a second, and re-reading every text node and every `<img>` each
 * time is the whole cost of discovery. On mount it is handed the body; after
 * that, only what just appeared.
 */
function discover(roots: HTMLElement[]): HTMLElement[] {
  const found: HTMLElement[] = [];
  for (const root of roots) collect(root, found);
  return found;
}

/**
 * An element keeps its editable id when the page re-renders it with different
 * children. Delshad's hero, 2026-09-18: the paragraph held one rotating line at
 * mount and took slide one's id; the editor then stacked all five lines inside
 * the same paragraph. The paragraph still answered for slide one, its text was
 * all five lines, and every publish was refused as "someone changed" the field.
 * An id belongs to the element that holds exactly one mark; an ancestor that
 * now holds more, or none, gives its id back.
 */
function releaseStaleAncestors(el: HTMLElement, root: HTMLElement): void {
  for (let up = el.parentElement; up && up !== root.parentElement; up = up.parentElement) {
    if (up.dataset.lfId && up.dataset.lfType === 'text' && countMarks(up) !== 1) {
      delete up.dataset.lfId;
      delete up.dataset.lfType;
      up.style.outline = '';
      if (up.isContentEditable) up.contentEditable = 'false';
    }
  }
}

function collect(root: HTMLElement, found: HTMLElement[]): void {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node as Text;
    if (blocked(text)) continue;

    if (text.data.includes(START)) {
      const id = decodeMark(text.data);
      const el = fieldElement(text);
      if (!id || !el || el.closest('[data-lf-chrome]')) continue;
      releaseStaleAncestors(el, root);
      if (el.dataset.lfId) continue;
      // Several values as bare text inside one element: the element can only
      // answer for one of them, and an edit would write the whole paragraph
      // into that one field. Each value needs an element of its own; until the
      // page gives it one, none of them is editable here.
      if (countMarks(el) !== 1) continue;
      el.dataset.lfId = id;
      el.dataset.lfType = 'text';
      found.push(el);
      continue;
    }

    // Sanity's own marker: a stega payload decoding to a Studio edit link.
    const stega = decodeStega(text.data);
    if (!stega) continue;

    // The article body is one HTML field. Its marker sits at the very end of
    // the rendered HTML, so the editable element is the container the page
    // names with data-lf-body, and the edit is described sentence by sentence
    // (see body-edit.ts) rather than as HTML.
    if (BODY_PATH.has(stega.path)) {
      const body = text.parentElement?.closest<HTMLElement>('[data-lf-body]');
      if (!body || body.dataset.lfId) continue;
      body.dataset.lfId = `sanity:${stega.id}:${stega.path}`;
      body.dataset.lfType = 'html';
      found.push(body);
      continue;
    }

    const el = fieldElement(text);
    if (!el || el.dataset.lfId || el.closest('[data-lf-chrome]')) continue;
    el.dataset.lfId = `sanity:${stega.id}:${stega.path}`;
    el.dataset.lfType = 'text';
    found.push(el);
  }

  // Images. Every `<img>` is looked at, not just those whose `src` still shows
  // the marker: `next/image` rewrites the address to
  // `/_next/image?url=%2Fimages%2Fx.webp%3Flf%3D…`, which is why the old
  // `img[src*="lf="]` selector matched nothing on a page built with it.
  const image = (img: HTMLImageElement) => {
    if (img.dataset.lfId || img.closest('[data-lf-chrome]')) return;
    const src = img.getAttribute('src') ?? '';
    if (!src || isSvgSource(src)) return;

    const id = contentIdFromImageSrc(src) ?? sanityIdFor(src);
    // The size is measured last: reading it forces the browser to lay the page
    // out, and this walk runs again on every change to the page.
    if (!id || tooSmall(img)) return;
    img.dataset.lfId = id;
    img.dataset.lfType = 'image';
    found.push(img);
  };
  if (root instanceof HTMLImageElement) image(root);
  root.querySelectorAll<HTMLImageElement>('img').forEach(image);
}

/** A Sanity picture's asset document id, as an editable id, or null. */
function sanityIdFor(src: string): string | null {
  const assetId = sanityAssetIdFromUrl(src);
  return assetId ? `${SANITY_IMAGE_PREFIX}${assetId}` : null;
}

/**
 * Is this image too small to be worth replacing? Measured as drawn, falling
 * back to the file's own size for an image that has not been laid out yet. An
 * image with neither figure is kept: guessing it away would hide a real picture.
 */
function tooSmall(img: HTMLImageElement): boolean {
  const box = img.getBoundingClientRect();
  const width = box.width || img.naturalWidth;
  const height = box.height || img.naturalHeight;
  if (!width && !height) return false;
  return (width > 0 && width < SMALLEST_IMAGE) || (height > 0 && height < SMALLEST_IMAGE);
}

/** Text nodes of a body container, in order, skipping the editor's own chrome. */
function bodyTextNodes(root: HTMLElement): Text[] {
  const out: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node as Text;
    if (text.parentElement?.closest('[data-lf-chrome]')) continue;
    out.push(text);
  }
  return out;
}

type BodySnapshot = { nodes: Text[]; texts: string[] };

const snapshotBody = (root: HTMLElement): BodySnapshot => {
  const nodes = bodyTextNodes(root);
  return { nodes, texts: nodes.map((node) => normalizeShownText(strip(node.data))) };
};

/**
 * Describe what changed in a body since its snapshot as sentence replacements.
 * Returns null when the structure changed (a text node added, removed or
 * merged): that is a paragraph-level edit, which the stored HTML cannot take
 * safely yet.
 */
function diffBody(root: HTMLElement, snapshot: BodySnapshot): TextReplacement[] | null {
  const current = bodyTextNodes(root);
  if (current.length !== snapshot.nodes.length) return null;
  const replacements: TextReplacement[] = [];
  for (let i = 0; i < current.length; i++) {
    if (current[i] !== snapshot.nodes[i]) return null;
    const before = snapshot.texts[i];
    const after = normalizeShownText(strip(current[i].data));
    if (before === after) continue;
    if (!before.trim()) return null; // typing into a blank gap between tags
    let occurrence = 0;
    for (let j = 0; j < i; j++) if (snapshot.texts[j].includes(before)) occurrence++;
    replacements.push({ from: before, to: after, occurrence });
  }
  return replacements;
}

const BODY_LIMIT_MESSAGE =
  'In the article body, only changes to existing text are saved for now — adding or removing paragraphs is not supported yet.';

/** What a client is told when what they typed in the address field is not one. */
const BAD_ADDRESS_MESSAGE =
  'That does not look like a web address. Use /a-page, https://…, mailto:…, tel:… or #a-section.';

/** The most links one panel lists. Past this it is a page of links, not an element with some. */
const MAX_LINK_ROWS = 60;

/**
 * Every link the Links panel should offer for one editable element.
 *
 * Three shapes, all of which a client reads as "this link": the element is the
 * link, the element sits inside one (a marked label inside an `<a>`), or the
 * element contains some (a rich sentence, an article body).
 */
function linksFor(root: HTMLElement): HTMLAnchorElement[] {
  const own = root.closest<HTMLAnchorElement>('a');
  if (own) return [own];
  return [...root.querySelectorAll<HTMLAnchorElement>('a')]
    .filter((anchor) => !anchor.closest('[data-lf-chrome]'))
    .slice(0, MAX_LINK_ROWS);
}

/**
 * The words one link shows, with both marker kinds taken out.
 *
 * This is the half of a link that tells it apart from every other link pointing
 * at the same page, so it rides along with the address into the live check.
 */
function anchorLabel(el: Element | null): string {
  if (!el) return '';
  return strip(el.textContent ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200);
}

/**
 * How many links on the page being looked at right now point there under those
 * words — read by the same rules the live check reads the public page by.
 *
 * The editor's own bar is left out: it is not on the page a visitor gets.
 */
function pageAnchors(): AnchorTarget[] {
  return [...document.querySelectorAll('a')]
    .filter((anchor) => !anchor.closest('[data-lf-chrome]'))
    .map((anchor) => ({
      href: anchor.getAttribute('href') ?? '',
      text: normalizeText(strip(anchor.textContent ?? '')),
    }));
}

function countOnPage(href: string, text: string): number {
  return countAnchors(pageAnchors(), { href, text });
}

/**
 * The element on the page showing the words that belong to one address field.
 *
 * `addressLabelPrefix` turns `nav:links.1.href` into `nav:links.1.`, which every
 * sibling of that address shares, including its label. Only a match inside an
 * `<a>` counts: that is the link whose words the live check needs. Null when
 * there is no such element, and the caller then checks the address alone.
 */
function labelElementFor(id: string): HTMLElement | null {
  const prefix = addressLabelPrefix(id);
  if (!prefix) return null;
  for (const el of document.querySelectorAll<HTMLElement>(`[data-lf-id^="${CSS.escape(prefix)}"]`)) {
    if (el.closest('a')) return el;
  }
  return null;
}

/** The words a publish put on the page, as plain text the live check can look for. */
function needlesFor(values: { id: string; value: string }[], exact = false): string[] {
  const out: string[] = [];
  for (const { id, value } of values) {
    if (id.endsWith(':content') || id.endsWith(':body')) {
      if (exact) continue; // a whole restored article is not a sentence to look for
      try {
        const edit = JSON.parse(value) as { replacements?: { to: string }[] };
        for (const item of edit.replacements ?? []) if (item.to.trim()) out.push(item.to);
      } catch {
        /* not a body edit */
      }
      continue;
    }
    const text = strip(value).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (text) out.push(text.slice(0, 200));
  }
  return out.slice(0, 50);
}

/** The words a change took OFF the page, from what each element held before. */
function goneFor(values: { id: string; value: string }[], originals: Map<string, string>): string[] {
  const out: { id: string; value: string }[] = [];
  for (const { id, value } of values) {
    if (id.endsWith(':content') || id.endsWith(':body')) {
      try {
        const edit = JSON.parse(value) as { replacements?: { from: string }[] };
        for (const item of edit.replacements ?? []) if (item.from.trim()) out.push({ id: `${id}:sentence`, value: item.from });
      } catch {
        /* not a body edit */
      }
      continue;
    }
    const before = originals.get(id);
    if (before !== undefined) out.push({ id, value: before });
  }
  return needlesFor(out);
}

const formatSeconds = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

const UNREACHABLE = 'Could not reach the site, try again';

/** What a client is told when the eight hours ran out mid-edit. */
const SESSION_ENDED = 'Your session ended. Sign in again; your edits are kept on this device.';

/** What a Sanity publish says when the pages could not be refreshed for it. */
const SLOW_REFRESH = 'Saved. The page may take up to a minute to refresh.';

// ---------------------------------------------------------------------------
// Edits kept across a session that ended
// ---------------------------------------------------------------------------

/** One staged text edit, as it survives a sign-in. Pictures are not kept: a
 *  chosen file cannot be written down and read back. */
type KeptEdit = { id: string; value: string; label: string };

/** Per page, per browser tab: a client with two pages open keeps both. */
const keptKey = () => `lf-edit:staged:${window.location.pathname}`;

function keepStaged(edits: KeptEdit[]): void {
  try {
    if (edits.length) window.sessionStorage.setItem(keptKey(), JSON.stringify(edits));
  } catch {
    /* private window, or storage full: the edits are simply not kept */
  }
}

/** Whatever was kept for this page, taken out: restoring it twice would be wrong. */
function takeStaged(): KeptEdit[] {
  try {
    const raw = window.sessionStorage.getItem(keptKey());
    window.sessionStorage.removeItem(keptKey());
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is KeptEdit =>
        typeof (entry as KeptEdit)?.id === 'string' && typeof (entry as KeptEdit)?.value === 'string',
    );
  } catch {
    return [];
  }
}

export function InlineEditor({ children }: { children?: React.ReactNode }) {
  const [changes, setChanges] = useState<Record<string, Change>>({});
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [assetTarget, setAssetTarget] = useState<AssetTarget | null>(null);
  const [count, setCount] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [publishes, setPublishes] = useState<Publish[] | null>(null);
  const [sanityUndo, setSanityUndo] = useState<SanityUndo[] | null>(null);
  /** Signed tokens from this session's image publishes, one per image. */
  const [imageUndo, setImageUndo] = useState<string[] | null>(null);
  /** The Links panel: which element it belongs to and what it is offering. */
  const [linkPanel, setLinkPanel] = useState<LinkPanel | null>(null);
  /** What is typed in each address field, by row. */
  const [linkDrafts, setLinkDrafts] = useState<Record<number, string>>({});
  const [linkNote, setLinkNote] = useState('');
  /** Which row is waiting on the server to say where its address lives. */
  const [linkBusy, setLinkBusy] = useState<number | null>(null);
  /** The field a client has just emptied, and where to put the note about it. */
  const [emptyField, setEmptyField] = useState<{ id: string; at: Point } | null>(null);
  const originals = useRef<Map<string, string>>(new Map());
  const bodySnapshots = useRef<Map<string, BodySnapshot>>(new Map());
  /** Link changes staged for an article body, by body id; they ride along with its sentences. */
  const bodyLinks = useRef<Map<string, LinkReplacement[]>>(new Map());
  /**
   * Every link this session moved, by the change it is staged against and by the
   * anchor it sits on. The anchor is the key so a second move of the same link
   * extends the first: what the published page will say it left is the address
   * it had before anybody touched it, not the one a previous Apply put on it.
   * The counts themselves are worked out at Publish (see `linkProofs`).
   */
  const linkEdits = useRef<Map<string, Map<HTMLAnchorElement, LinkEdit>>>(new Map());

  /** Remember one move. Called BEFORE the new address goes on the anchor. */
  const rememberLink = useCallback((changeId: string, anchor: HTMLAnchorElement, to: string) => {
    const perChange = linkEdits.current.get(changeId) ?? new Map<HTMLAnchorElement, LinkEdit>();
    const first = perChange.get(anchor);
    perChange.set(anchor, {
      from: first?.from ?? anchor.getAttribute('href') ?? '',
      to,
      text: anchorLabel(anchor),
    });
    linkEdits.current.set(changeId, perChange);
  }, []);

  /** The counts the light should ask for, read off the page as it stands now. */
  const proofsFor = useCallback((ids: string[]) => {
    const edits: LinkEdit[] = [];
    for (const id of ids) for (const edit of linkEdits.current.get(id)?.values() ?? []) edits.push(edit);
    const moved = edits.filter((edit) => edit.from.trim() !== edit.to.trim());
    const { links, linksAbsent } = linkProofs(pageAnchors(), moved);
    // A link with no words of its own cannot be told apart from any other link
    // to the same page, so it keeps the older, weaker check on the address.
    const markup = moved.filter((edit) => !normalizeText(edit.text)).map((edit) => `href="${edit.to}"`);
    return { links, linksAbsent, markup };
  }, []);
  const picker = useRef<HTMLInputElement | null>(null);
  /** Which image the picker was opened for, and the preview addresses to release. */
  const picking = useRef<string | null>(null);
  const previews = useRef<string[]>([]);

  const record = useCallback((id: string, value: string, label: string, extra: ChangeExtra = {}) => {
    setChanges((prev) => ({ ...prev, [id]: { id, value, label, ...extra } }));
    // Typing does NOT take Undo away any more. It used to: the button vanished
    // the moment a client touched the keyboard, which is exactly when somebody
    // who has just published the wrong words reaches for it. The token stays
    // until the next publish or Discard, and pressing it throws away the
    // typing in those fields and says so.
  }, []);
  const unstage = useCallback((id: string) => {
    setChanges((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  /**
   * Open the file dialog for one image. It has to be called straight out of the
   * click on that image: a browser only opens a file dialog during a gesture the
   * person made, so doing it after a render, or on a timer, silently does nothing.
   */
  const openPicker = useCallback((id: string) => {
    picking.current = id;
    const input = picker.current;
    if (!input) return;
    input.value = ''; // choosing the same file twice must still count as a change
    input.click();
  }, []);

  /**
   * A file was chosen: show it in place at once and stage it. The preview is a
   * local address the browser makes for the file, so nothing is uploaded until
   * Publish. `srcset` and `sizes` go with it — `next/image` sets both, and a
   * browser prefers `srcset` over `src`, so leaving them would show the old
   * picture next to a bar claiming an unsaved change.
   */
  const chooseFile = useCallback(
    (file: File | undefined) => {
      const id = picking.current;
      if (!id || !file) return;
      if (file.size > MAX_IMAGE_BYTES) {
        setStatus({ kind: 'error', message: TOO_BIG_MESSAGE });
        return;
      }
      const el = document.querySelector<HTMLImageElement>(`img[data-lf-id="${id}"]`);
      if (el) {
        if (!originals.current.has(id)) originals.current.set(id, el.getAttribute('src') ?? '');
        const preview = URL.createObjectURL(file);
        previews.current.push(preview);
        el.setAttribute('src', preview);
        el.removeAttribute('srcset');
        el.removeAttribute('sizes');
      }
      setStatus({ kind: 'idle' });
      record(id, file.name, file.name, { file });
    },
    [record],
  );

  /**
   * Describe an article body's staged edit and record it.
   *
   * One value carries both halves: the sentences that changed and the links
   * whose destination changed. It is rebuilt from scratch on every keystroke
   * and on every Apply, so the two never drift apart.
   */
  const stageBody = useCallback(
    (el: HTMLElement, id: string) => {
      const snapshot = bodySnapshots.current.get(id);
      if (!snapshot) return;
      const replacements = diffBody(el, snapshot);
      if (replacements === null) {
        unstage(id);
        setStatus({ kind: 'error', message: BODY_LIMIT_MESSAGE });
        return;
      }
      const links = bodyLinks.current.get(id) ?? [];
      if (!replacements.length && !links.length) {
        unstage(id);
        return;
      }
      setStatus((prev) => (prev.kind === 'error' && prev.message === BODY_LIMIT_MESSAGE ? { kind: 'idle' } : prev));

      const parts: string[] = [];
      if (replacements.length) parts.push(`${replacements.length} sentence${replacements.length === 1 ? '' : 's'}`);
      if (links.length) parts.push(`${links.length} link${links.length === 1 ? '' : 's'}`);
      record(id, JSON.stringify({ replacements, links }), `Article: ${parts.join(', ')}`);
    },
    [record, unstage],
  );

  useEffect(
    () => () => {
      for (const url of previews.current) URL.revokeObjectURL(url);
    },
    [],
  );

  useEffect(() => {
    const wired = new WeakSet<HTMLElement>();
    /** The last figure sent to the bar; wire() runs on every DOM change. */
    let counted = -1;

    const onEnter = (event: Event) => {
      const el = event.currentTarget as HTMLElement;
      if (!el.dataset.lfId) return;
      if (el.isContentEditable) return;
      el.style.outline = OUTLINE_HOVER;
      el.style.outlineOffset = '3px';
      el.style.borderRadius = '3px';
    };
    const onLeave = (event: Event) => {
      const el = event.currentTarget as HTMLElement;
      if (el.isContentEditable) return;
      el.style.outline = '';
    };

    const onClick = (event: Event) => {
      const el = event.currentTarget as HTMLElement;
      if (!el.dataset.lfId) return;
      const id = el.dataset.lfId!;

      if (el.dataset.lfType === 'image') {
        event.preventDefault();
        event.stopPropagation();
        const original = originals.current.get(id) ?? (el as HTMLImageElement).getAttribute('src') ?? '';
        setAssetTarget({
          id,
          current: realImageSource(original).split('?')[0],
          content: !id.startsWith(SANITY_IMAGE_PREFIX),
          address: false,
          at: pointFor(el),
        });
        // Straight into the file dialog: choosing a picture is what almost
        // everyone clicking a picture means to do. The panel behind it offers
        // the address box for the rare case that is not.
        openPicker(id);
        return;
      }

      if (el.isContentEditable) {
        // Already editing. A second click, or a double-click to select a word,
        // must never follow the link: measured 2026-09-18, it left the page
        // mid-edit. Keep the caret where the click landed and stay.
        if (el.closest('a')) event.preventDefault();
        return;
      }
      // A click on a link inside the article body must edit, not navigate.
      event.preventDefault();
      event.stopPropagation();
      if (!originals.current.has(id)) originals.current.set(id, el.innerHTML);
      if (el.dataset.lfType === 'html' && !bodySnapshots.current.has(id)) {
        bodySnapshots.current.set(id, snapshotBody(el));
      }
      el.contentEditable = 'true';
      el.spellcheck = true;
      el.style.outline = OUTLINE;
      el.style.outlineOffset = '3px';
      el.focus();
      placeCaret(el, event as MouseEvent);

      // Links in or around this element get a panel of their own: their words
      // are editable in place, their destination is not a thing you type onto
      // a page, so it needs a field.
      const anchors = linksFor(el);
      const rows = anchors
        .map((anchor) => {
          const kind = linkCaseFor(anchor, el);
          return kind
            ? {
                text: strip(anchor.textContent ?? '').trim() || '(no words)',
                href: anchor.getAttribute('href') ?? '',
                anchor,
                kind,
              }
            : null;
        })
        .filter((row): row is LinkRow => row !== null && Boolean(row.href));
      setLinkNote('');
      setLinkDrafts({});
      setLinkPanel(rows.length ? { id, root: el, rows, at: pointFor(el) } : null);
    };

    // Stage on every keystroke. Waiting for blur loses the last edit whenever
    // the element does not give focus up — a link element being the case that
    // caught us.
    const onInput = (event: Event) => {
      const el = event.currentTarget as HTMLElement;
      const id = el.dataset.lfId!;
      if (!originals.current.has(id)) originals.current.set(id, el.innerHTML);
      if (el.dataset.lfType === 'html') {
        stageBody(el, id);
        return;
      }
      // Emptying a field is refused by the store, and the client used to hear
      // about it at Publish — three edits later, with no idea which field. Say
      // it here, beside the field, and leave it unstaged until there are words.
      if (isEmptyValue(el.innerHTML)) {
        unstage(id);
        setEmptyField({ id, at: pointFor(el) });
        return;
      }
      setEmptyField((prev) => (prev?.id === id ? null : prev));
      record(id, strip(el.innerHTML), strip(el.textContent ?? '').slice(0, 42));
    };

    const onBlur = (event: Event) => {
      const el = event.currentTarget as HTMLElement;
      const id = el.dataset.lfId!;
      el.contentEditable = 'false';
      el.style.outline = '';
      setEmptyField((prev) => (prev?.id === id ? null : prev));
      if (el.dataset.lfType === 'html') {
        if (el.innerHTML !== (originals.current.get(id) ?? '')) stageBody(el, id);
        return;
      }
      if (el.innerHTML !== (originals.current.get(id) ?? '')) {
        record(id, strip(el.innerHTML), strip(el.textContent ?? '').slice(0, 42));
      }
    };

    const onKeyDown = (event: Event) => {
      const el = event.currentTarget as HTMLElement;
      const key = (event as KeyboardEvent).key;
      const meta = (event as KeyboardEvent).metaKey || (event as KeyboardEvent).ctrlKey;
      const id = el.dataset.lfId!;
      if (key === 'Escape') {
        el.innerHTML = originals.current.get(id) ?? el.innerHTML;
        bodySnapshots.current.delete(id);
        bodyLinks.current.delete(id);
        linkEdits.current.delete(id);
        unstage(id);
        setEmptyField(null);
        setLinkPanel(null);
        el.blur();
      }
      if (key === 'Enter') {
        // Enter finishes the edit; Shift+Enter is a line break, but only where
        // one survives the trip to disk — a value that already carries tags, or
        // the article body. In a plain field the cleaner takes it back out, so
        // Enter with or without Shift means the same thing there.
        const stored = originals.current.get(id) ?? el.innerHTML;
        const action = enterAction(key, (event as KeyboardEvent).shiftKey, {
          stored,
          body: el.dataset.lfType === 'html',
        });
        if (action === 'break') {
          event.preventDefault();
          event.stopPropagation();
          document.execCommand('insertHTML', false, '<br>');
        }
        if (action === 'commit') {
          event.preventDefault();
          event.stopPropagation();
          el.contentEditable = 'false';
          el.style.outline = '';
          el.blur();
        }
      }
      if ((key === 'a' || key === 'A') && meta) {
        event.preventDefault();
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(el);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    };

    /**
     * A paste puts on the page what a publish would store, and nothing else.
     *
     * A browser pastes the clipboard's own HTML: Word's spans, another site's
     * classes and colours. None of it survives the publish, so the page showed
     * the client something that would silently change under them at the next
     * reload. The clipboard goes through the same rule the publish uses.
     */
    const onPaste = (event: Event) => {
      const el = event.currentTarget as HTMLElement;
      const id = el.dataset.lfId!;
      const clipboard = (event as ClipboardEvent).clipboardData;
      if (!clipboard) return;
      event.preventDefault();
      const insert = pasteInsert(
        { html: clipboard.getData('text/html'), text: clipboard.getData('text/plain') },
        { stored: originals.current.get(id) ?? el.innerHTML, body: el.dataset.lfType === 'html' },
      );
      if (!insert.value) return;
      document.execCommand(insert.mode === 'html' ? 'insertHTML' : 'insertText', false, insert.value);
    };

    function wire(roots: HTMLElement[], why: string) {
      const started = performance.now();
      const nodes = discover(roots).filter((el) => !wired.has(el));
      nodes.forEach((el) => {
        wired.add(el);
        el.addEventListener('mouseenter', onEnter);
        el.addEventListener('mouseleave', onLeave);
        el.addEventListener('click', onClick, true);
        el.addEventListener('input', onInput);
        el.addEventListener('paste', onPaste);
        el.addEventListener('blur', onBlur);
        el.addEventListener('keydown', onKeyDown);
        el.style.cursor = el.dataset.lfType === 'image' ? 'pointer' : 'text';
      });
      // Count what is on the page now. A running total climbed on every
      // re-render, so a page with a slider claimed hundreds of editable fields.
      const total = document.querySelectorAll('[data-lf-id]').length;
      if (total !== counted) {
        counted = total;
        setCount(total);
      }
      // Development only: the one number that says whether discovery is cheap.
      if (process.env.NODE_ENV !== 'production') {
        console.log(
          `[lf-edit] ${why}: ${roots.length} root(s), ${nodes.length} new, ${total} editable, ${(performance.now() - started).toFixed(2)}ms`,
        );
      }
    }

    wire([document.body], 'first scan');

    // Sections that mount late: sliders, tabs, anything client-rendered. Three
    // rules, because this used to re-read the whole document on every DOM
    // change a page made — and an animated page makes dozens a second:
    //   - only what was added is scanned, not the document;
    //   - our own chrome, and the element being typed into, are skipped, since
    //     neither can contain anything new to edit;
    //   - a burst of changes is one scan, 150ms after the last of them.
    const waiting = new Set<HTMLElement>();
    let rescan: ReturnType<typeof setTimeout> | null = null;
    const observer = new MutationObserver((records) => {
      for (const entry of records) {
        for (const node of entry.addedNodes) {
          const el = node.nodeType === Node.ELEMENT_NODE ? (node as HTMLElement) : node.parentElement;
          if (!el || typeof el.closest !== 'function') continue;
          if (el.closest('[data-lf-chrome]') || el.closest('[contenteditable="true"]')) continue;
          waiting.add(el);
        }
      }
      if (!waiting.size || rescan) return;
      rescan = setTimeout(() => {
        rescan = null;
        const roots = [...waiting].filter((el) => el.isConnected);
        waiting.clear();
        if (roots.length) wire(roots, 'rescan');
      }, RESCAN_DELAY);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      if (rescan) clearTimeout(rescan);
    };
  }, [record, unstage, openPicker, stageBody]);

  /**
   * Put back edits from a session that ended before they were published.
   *
   * A session lasts eight hours and a client who is interrupted comes back to a
   * Publish that answers 401. The words were kept in this tab (see `keepStaged`)
   * and are re-applied the first time this page has something editable on it —
   * which is after discovery has run, hence the wait on `count`.
   */
  const restoredKept = useRef(false);
  useEffect(() => {
    if (restoredKept.current || !count) return;
    restoredKept.current = true;
    const kept = takeStaged();
    if (!kept.length) return;

    let put = 0;
    for (const edit of kept) {
      const el = document.querySelector<HTMLElement>(`[data-lf-id="${CSS.escape(edit.id)}"]`);
      // Text only. An image was never kept, and an article body is a list of
      // sentence replacements against a snapshot this page no longer has.
      if (!el || el.dataset.lfType !== 'text') continue;
      if (!originals.current.has(edit.id)) originals.current.set(edit.id, el.innerHTML);
      el.innerHTML = edit.value;
      record(edit.id, edit.value, edit.label || strip(el.textContent ?? '').slice(0, 42));
      put += 1;
    }
    if (put) {
      setStatus({ kind: 'idle', message: `${put} edit${put === 1 ? '' : 's'} restored from before your session ended.` });
    }
  }, [count, record]);

  // "Show me what I can edit" — the honest answer to a page where most copy is
  // still written into the component rather than served from the content layer.
  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>('[data-lf-id]');
    nodes.forEach((el) => {
      if (el.isContentEditable) return;
      el.style.outline = showAll ? '1px dashed rgba(47,125,225,.75)' : '';
      el.style.outlineOffset = showAll ? '3px' : '';
      el.style.backgroundColor = showAll ? 'rgba(47,125,225,.07)' : '';
    });
  }, [showAll, count]);

  // The same for the Links panel, whose fields are outside the edited element.
  useEffect(() => {
    if (!linkPanel) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLinkPanel(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [linkPanel]);

  const pending = Object.values(changes);


  const liveCheck = useRef<{ timer: ReturnType<typeof setTimeout> | null; stop: boolean }>({ timer: null, stop: false });

  /**
   * Watch the public page until it carries the published words. `waiting` is
   * what the bar says meanwhile ("building the site", "refreshing the page").
   */
  function watchUntilLive(
    needles: string[],
    waiting: string,
    doneWord: string,
    absent: string[] = [],
    /** Strings that must be in the page's HTML rather than its words: an image's address. */
    markup: string[] = [],
    /** Links that must point where they were sent, under the words they show. */
    links: AnchorTarget[] = [],
    /** The same words, which must no longer point at the old address. */
    linksAbsent: AnchorTarget[] = [],
  ) {
    const state = liveCheck.current;
    if (state.timer) clearTimeout(state.timer);
    state.stop = false;
    const started = Date.now();
    const path = window.location.pathname;
    const limit = 6 * 60 * 1000;

    if (!needles.length && !markup.length && !links.length) {
      setStatus({ kind: 'live', message: `${doneWord} — nothing left to check on this page`, seconds: 0 });
      return;
    }

    const tick = async () => {
      if (state.stop) return;
      const seconds = Math.round((Date.now() - started) / 1000);
      setStatus({ kind: 'checking', message: waiting, seconds });
      let live = false;
      try {
        const response = await fetch('/api/lf-edit/status', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ path, needles, absent, markup, links, linksAbsent }),
        });
        const result = (await response.json()) as { live?: boolean };
        live = result.live === true;
      } catch {
        live = false;
      }
      if (state.stop) return;
      if (live) {
        setStatus({ kind: 'live', message: `${doneWord} — live on the public page`, seconds: Math.round((Date.now() - started) / 1000) });
        return;
      }
      if (Date.now() - started > limit) {
        setStatus({
          kind: 'stale',
          message: `${doneWord}, but the public page does not show it yet after six minutes. Reload to check, or ask LoudFace if it stays that way.`,
          seconds: Math.round((Date.now() - started) / 1000),
        });
        return;
      }
      state.timer = setTimeout(tick, 4000);
    };
    state.timer = setTimeout(tick, 1500);
  }

  useEffect(() => () => {
    liveCheck.current.stop = true;
    if (liveCheck.current.timer) clearTimeout(liveCheck.current.timer);
  }, []);

  /**
   * Publish everything staged.
   *
   * Words go in one request, as they always have: one request is one commit.
   * Pictures go one at a time to their own route, because a file is bytes and
   * has to travel as form data. Words first, so a failure there leaves nothing
   * half-done; if a picture then fails, everything already saved is unstaged and
   * the bar names the picture that did not go.
   */
  /**
   * What the page rendered for one field, so the server can refuse a publish
   * over somebody else's newer edit. An article body is left out: its edit is a
   * list of sentence replacements, which the server checks against the stored
   * HTML sentence by sentence already.
   */
  function expectedFor(id: string): string | undefined {
    const el = document.querySelector<HTMLElement>(`[data-lf-id="${CSS.escape(id)}"]`);
    if (el?.dataset.lfType === 'html') return undefined;
    const raw = originals.current.get(id);
    return raw === undefined ? undefined : strip(raw);
  }

  /**
   * Did a publish whose answer never arrived actually land?
   *
   * Asked of History, once, and only after the request itself failed. A commit
   * can be made and the response lost; saying "could not reach the site" then
   * had clients publish the same words twice.
   */
  async function publishLanded(ids: string[]): Promise<boolean> {
    try {
      const response = await fetch('/api/lf-edit/history');
      const result = (await response.json().catch(() => ({}))) as { publishes?: Publish[]; you?: string };
      return landedRecently(result.publishes ?? [], result.you ?? '', ids, Date.now());
    } catch {
      return false;
    }
  }

  async function save() {
    if (!pending.length) return;
    setStatus({ kind: 'saving' });
    liveCheck.current.stop = true;

    const images = pending.filter((change) => change.file);
    const staged = pending.filter((change) => !change.file);
    const sent = staged.map(({ id, value }) => ({ id, value, expected: expectedFor(id) }));
    // An address is never visible text, so it is left out of the words the
    // light looks for and out of the words it expects to have disappeared;
    // what it looks for instead is the `href` itself, in the page's HTML.
    const visible = staged.filter((change) => !change.address).map(({ id, value }) => ({ id, value }));
    const gone = goneFor(visible, originals.current);
    const needles: string[] = [];
    const markup: string[] = [];
    for (const change of staged) if (change.markup) markup.push(...change.markup);
    // Every link this session moved, counted now, off the page the client is
    // looking at — which already carries every staged change. Counting at Apply
    // was right for the first change and wrong for the second.
    const proof = proofsFor(staged.map((change) => change.id));
    const links = proof.links;
    const linksAbsent = proof.linksAbsent;
    markup.push(...proof.markup);
    const saveOrder: string[] = [];

    let contentCount = 0;
    let sanityCount = 0;
    let repoImages = 0;
    let cmsImages = 0;
    let store: string | undefined;
    const imageTokens: string[] = [];
    /** Extra sentences the bar adds after "N changes saved". */
    const notes: string[] = [];
    let refreshed = true;

    if (sent.length) {
      let response: Response;
      try {
        response = await fetch('/api/lf-edit', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ changes: sent }),
        });
      } catch {
        // The request failed, which is not the same as the publish failing. Ask
        // History whether the commit is there; if it is not, the edits stay
        // staged and the bar says so rather than sitting on "Saving…" forever.
        if (!(await publishLanded(sent.map((change) => change.id)))) {
          setStatus({ kind: 'error', message: UNREACHABLE });
          return;
        }
        const saved = `${sent.length} change${sent.length === 1 ? '' : 's'} saved`;
        setChanges({});
        originals.current.clear();
        bodySnapshots.current.clear();
        bodyLinks.current.clear();
        linkEdits.current.clear();
        setLinkPanel(null);
        watchUntilLive(
          needlesFor(visible),
          `${saved} — committed, the site is building (usually 1 to 2 minutes)`,
          saved,
          gone,
          markup,
          links,
          linksAbsent,
        );
        return;
      }
      // The session ran out. Keep the words in this tab so signing in again
      // brings them back instead of losing an afternoon's typing.
      if (response.status === 401) {
        keepStaged(staged.map(({ id, value, label }) => ({ id, value, label })));
        setStatus({ kind: 'error', message: SESSION_ENDED });
        return;
      }
      const result = await response.json().catch(() => ({ error: response.statusText }));
      // A half-failed publish answers 200 with an error in the body. Keep the
      // staged edits in that case too, so nothing the client typed is dropped.
      if (!response.ok || result?.ok === false || result?.error) {
        setStatus({ kind: 'error', message: result?.error ?? 'Publish failed' });
        return;
      }
      const sanity: { id: string; token: string; after?: string; draftKept?: boolean }[] = result.sanity ?? [];
      sanityCount = sanity.length;
      contentCount = Math.max(0, (result.published ?? 0) - sanityCount);
      store = result.mode;
      refreshed = result.revalidated !== false;
      if (sanity.some((change) => change.draftKept === true)) notes.push(DRAFT_KEPT_NOTE);
      setSanityUndo(sanityCount ? sanity.map(({ id, token }) => ({ id, token })) : null);
      needles.push(...needlesFor(visible));
      saveOrder.push(...sent.map((change) => change.id));
    }

    for (const change of images) {
      const form = new FormData();
      form.append('id', change.id);
      form.append('file', change.file!, change.file!.name);
      let response: Response;
      try {
        response = await fetch('/api/lf-edit/image', { method: 'POST', body: form });
      } catch {
        unstageAll(saveOrder);
        setStatus({ kind: 'error', message: UNREACHABLE });
        return;
      }
      const result = await response.json().catch(() => ({ error: response.statusText }));
      if (!response.ok || result?.error) {
        unstageAll(saveOrder);
        setStatus({ kind: 'error', message: result?.error ?? 'That image could not be saved' });
        return;
      }
      if (result.mode === 'sanity') {
        cmsImages += 1;
        if (typeof result.newAssetId === 'string') markup.push(result.newAssetId);
        if (typeof result.undo === 'string') imageTokens.push(result.undo);
      } else {
        repoImages += 1;
        store = result.mode;
        if (typeof result.path === 'string') markup.push(result.path);
      }
      saveOrder.push(change.id);
    }

    setChanges({});
    originals.current.clear();
    bodySnapshots.current.clear();
    bodyLinks.current.clear();
    linkEdits.current.clear();
    setLinkPanel(null);
    setEmptyField(null);
    setImageUndo(imageTokens.length ? imageTokens : null);

    const words = contentCount + sanityCount;
    const pictures = repoImages + cmsImages;
    if (!words && !pictures) {
      setStatus({ kind: 'saved', message: 'Nothing changed' });
      return;
    }
    const parts: string[] = [];
    if (words) parts.push(`${words} change${words === 1 ? '' : 's'}`);
    if (pictures) parts.push(`${pictures} image${pictures === 1 ? '' : 's'}`);
    const saved = `${parts.join(' and ')} saved`;
    const tail = notes.length ? ` ${notes.join(' ')}` : '';

    // Development, repository only: the commit is made in the working copy and
    // the dev server re-reads it, so a reload shows it at once.
    const building = (contentCount || repoImages) && store === 'github';
    if (!building && !sanityCount && !cmsImages) {
      setStatus({ kind: 'saved', message: `${saved} — committed${tail}` });
      setTimeout(() => window.location.reload(), 900);
      return;
    }

    // The words are in the CMS but the pages could not be told to refresh. That
    // is a page a minute behind, not a publish that failed, and watching for
    // words that are not there yet would only end in a red light.
    if (!refreshed && !contentCount && !repoImages) {
      setStatus({ kind: 'saved', message: `${SLOW_REFRESH}${tail}` });
      return;
    }

    // Everything else is confirmed against the public page, not assumed.
    const waiting = building
      ? `${saved} — committed, the site is building (usually 1 to 2 minutes)`
      : pictures
        ? `${saved} — refreshing the public page`
        : `${saved} to the CMS — refreshing the public page`;
    watchUntilLive(needles, `${waiting}${tail}`, `${saved}${tail}`, gone, markup, links, linksAbsent);
  }

  const unstageAll = (ids: string[]) =>
    setChanges((prev) => {
      const next = { ...prev };
      for (const id of ids) delete next[id];
      return next;
    });

  /**
   * Point one link somewhere else.
   *
   * The address changes on the page at once, so the client sees the result
   * before they publish, and the change is staged the same way a typed word is.
   * Which field it is staged against depends on where the address lives:
   *
   *   - sibling: the server is asked which content field holds this address,
   *     and that field is staged, so the publish is an ordinary content commit;
   *   - rich: the address is part of a value the page renders as HTML, so the
   *     whole value is re-staged and the sanitizer rebuilds the anchor;
   *   - body: the address is named in the article's edit list, the way a
   *     sentence is, and the server rewrites that one href in the stored HTML.
   */
  async function applyLink(row: LinkRow, index: number) {
    const panel = linkPanel;
    if (!panel || linkBusy !== null) return;

    const value = (linkDrafts[index] ?? row.href).trim();
    if (!isSafeHref(value)) {
      setLinkNote(BAD_ADDRESS_MESSAGE);
      return;
    }
    if (value === row.href) {
      setLinkNote('That is where it already points.');
      return;
    }

    if (row.kind === 'sibling') {
      setLinkBusy(index);
      let result: { id?: string | null; reason?: string };
      try {
        const query = `id=${encodeURIComponent(panel.id)}&href=${encodeURIComponent(row.href)}`;
        const response = await fetch(`/api/lf-edit/link?${query}`);
        result = await response.json().catch(() => ({}));
      } catch {
        setLinkBusy(null);
        setLinkNote(UNREACHABLE);
        return;
      }
      setLinkBusy(null);
      if (!result?.id) {
        setLinkNote(result?.reason ?? 'This link\u2019s address is not in a field this editor can change.');
        return;
      }
      // Remembered before the address changes, so the move keeps the address
      // it started from however many times it is applied.
      rememberLink(result.id, row.anchor, value);
      row.anchor.setAttribute('href', value);
      record(result.id, value, value.slice(0, 42), { address: true });
    } else if (row.kind === 'body') {
      // Which of the links pointing at this same address it is, counted the
      // way the server counts them in the stored HTML: in document order,
      // before anything is changed.
      const from = row.anchor.getAttribute('href') ?? '';
      const occurrence = [...panel.root.querySelectorAll('a')]
        .filter((anchor) => (anchor.getAttribute('href') ?? '') === from)
        .indexOf(row.anchor);
      if (occurrence === -1) {
        setLinkNote('That link is no longer on the page; reload and try again.');
        return;
      }
      const staged = bodyLinks.current.get(panel.id) ?? [];
      // Moving the same link twice is still one change against the stored
      // article: the second edit extends the first rather than chasing an
      // address that only ever existed in this browser.
      const earlier = staged.find((link) => link.to === from);
      if (earlier) earlier.to = value;
      else staged.push({ from, to: value, occurrence });
      bodyLinks.current.set(panel.id, staged);
      rememberLink(panel.id, row.anchor, value);
      row.anchor.setAttribute('href', value);
      stageBody(panel.root, panel.id);
    } else {
      if (!originals.current.has(panel.id)) originals.current.set(panel.id, panel.root.innerHTML);
      rememberLink(panel.id, row.anchor, value);
      row.anchor.setAttribute('href', value);
      record(panel.id, strip(panel.root.innerHTML), strip(panel.root.textContent ?? '').slice(0, 42));
    }

    setLinkPanel({ ...panel, rows: panel.rows.map((item, i) => (i === index ? { ...item, href: value } : item)) });
    setLinkDrafts((prev) => ({ ...prev, [index]: value }));
    setLinkNote('Changed on the page. Press Publish to put it on the live site.');
  }

  /**
   * Take back this session's last publish: the Sanity words, the Sanity
   * pictures, or both. Words go back through the publish route with the token
   * that sealed them; pictures go through the undo route, which is where every
   * undo lives. One light watches the result of both.
   *
   * It is offered until the next publish or Discard, typing included. It used
   * to disappear the moment a client touched the keyboard, which is the moment
   * somebody who has just published the wrong words reaches for it. If they
   * have typed into one of the fields this undo covers, that typing is thrown
   * away with it — only in those fields — and the bar says so.
   */
  async function undoLast() {
    const textTokens = sanityUndo ?? [];
    const pictureTokens = imageUndo ?? [];
    if (!textTokens.length && !pictureTokens.length) return;

    setStatus({ kind: 'saving' });
    liveCheck.current.stop = true;
    const needles: string[] = [];
    const absent: string[] = [];
    const markup: string[] = [];

    // Unsaved typing in the very fields being put back: it is about to be
    // overwritten on the live site anyway, so the page goes back to what the
    // publish left there before the undo reads it.
    const discarded = textTokens.map(({ id }) => id).filter((id) => id in changes);
    for (const id of discarded) {
      const el = document.querySelector<HTMLElement>(`[data-lf-id="${CSS.escape(id)}"]`);
      const before = originals.current.get(id);
      if (el && before !== undefined) el.innerHTML = before;
      originals.current.delete(id);
    }
    if (discarded.length) unstageAll(discarded);
    const cost = discarded.length
      ? ` Your unsaved typing in ${discarded.length} field${discarded.length === 1 ? '' : 's'} was thrown away with it.`
      : '';

    if (textTokens.length) {
      // What the page shows right now is what the undo takes away.
      const onPage = new Map(
        textTokens.map(({ id }) => [id, document.querySelector<HTMLElement>(`[data-lf-id="${id}"]`)?.innerHTML ?? '']),
      );
      let response: Response;
      try {
        response = await fetch('/api/lf-edit', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ changes: textTokens }),
        });
      } catch {
        setStatus({ kind: 'error', message: UNREACHABLE });
        return;
      }
      const result = await response.json().catch(() => ({ error: response.statusText }));
      if (!response.ok || result?.ok === false || result?.error) {
        setStatus({ kind: 'error', message: result?.error ?? 'Undo failed' });
        return;
      }
      // The words to look for come back from the server, which is the only side
      // that knows what it just restored.
      const applied: { id: string; after?: string }[] = result.sanity ?? [];
      needles.push(...needlesFor(applied.map(({ id, after }) => ({ id, value: after ?? '' })), true));
      absent.push(...goneFor(textTokens.map(({ id }) => ({ id, value: '' })), onPage));
      setSanityUndo(null);
    }

    for (const token of pictureTokens) {
      let response: Response;
      try {
        response = await fetch('/api/lf-edit/undo', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ token }),
        });
      } catch {
        setStatus({ kind: 'error', message: UNREACHABLE });
        return;
      }
      const result = await response.json().catch(() => ({ error: response.statusText }));
      if (!response.ok || result?.error) {
        setStatus({ kind: 'error', message: result?.error ?? 'Undo failed' });
        return;
      }
      // The asset that is back on the page, which is what to look for in its HTML.
      for (const value of (result.markup ?? []) as unknown[]) {
        if (typeof value === 'string') markup.push(value);
      }
    }
    setImageUndo(null);

    watchUntilLive(
      needles,
      `Reverted in the CMS — refreshing the public page.${cost}`,
      `Reverted.${cost}`,
      absent,
      markup,
    );
  }

  async function openHistory() {
    setPublishes(null);
    try {
      const response = await fetch('/api/lf-edit/history');
      const result = await response.json().catch(() => ({ publishes: [] }));
      setPublishes(result.publishes ?? []);
    } catch {
      setPublishes([]);
      setStatus({ kind: 'error', message: UNREACHABLE });
    }
  }

  /**
   * Take one publish back off the live site.
   *
   * `doneWord` is what the light calls the result, because this same button
   * undoes an undo: on a revert commit it puts the change back, and telling a
   * client that was "undone" would be the opposite of what happened.
   */
  async function undoPublish(hash: string, doneWord = 'Change undone') {
    setStatus({ kind: 'saving' });
    let response: Response;
    try {
      response = await fetch('/api/lf-edit/undo', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ hash }),
      });
    } catch {
      setStatus({ kind: 'error', message: UNREACHABLE });
      return;
    }
    const result = await response.json().catch(() => ({ error: response.statusText }));
    if (!response.ok || result?.error) {
      setStatus({ kind: 'error', message: result?.error ?? 'Undo failed' });
      return;
    }
    if (result.mode !== 'github') {
      setStatus({ kind: 'saved', message: doneWord });
      setTimeout(() => window.location.reload(), 900);
      return;
    }
    // Same light as a publish: the words that came back are what to look for.
    const restored = Array.isArray(result.restored) ? (result.restored as { id: string; value: string }[]) : [];
    const removed = Array.isArray(result.removed) ? (result.removed as { id: string; value: string }[]) : [];
    // A restored address is not visible text: it comes back as an attribute,
    // so the light looks for it in the markup, the same way a publish does.
    const isAddress = (value: string) => ADDRESS.test(value.trim());
    const restoredText = restored.filter((change) => !isAddress(change.value));
    const removedText = removed.filter((change) => !isAddress(change.value));
    const markup: string[] = [];
    const links: AnchorTarget[] = [];
    const linksAbsent: AnchorTarget[] = [];
    for (const change of restored.filter((entry) => isAddress(entry.value))) {
      const to = change.value.trim();
      // The undo hands back `nav:links.1.href` and no words. The words are the
      // field beside it, so the page is searched for anything under
      // `nav:links.1.` that sits in a link, and that is the label.
      const text = anchorLabel(labelElementFor(change.id));
      const from = removed.find((entry) => entry.id === change.id)?.value.trim() ?? '';
      if (!text) {
        // No label found: keep the older check on the address alone, so an undo
        // is never held up by a page this browser cannot read the label off.
        markup.push(`href="${to}"`);
        continue;
      }
      // The mirror of a publish, counted on the page as it stands: one more
      // link under the restored address, one fewer under the one being taken
      // away. Without the count the light would go green at once, because the
      // footer's own link to the restored address is already there.
      links.push({ href: to, text, atLeast: countOnPage(to, text) + 1 });
      if (from && isAddress(from)) {
        linksAbsent.push({ href: from, text, atMost: Math.max(countOnPage(from, text) - 1, 0) });
      }
    }
    setStatus({ kind: 'saved', message: `${doneWord} — committed` });
    watchUntilLive(
      needlesFor(restoredText, true),
      `${doneWord} — committed, the site is building (usually 1 to 2 minutes)`,
      doneWord,
      needlesFor(removedText, true),
      markup,
      links,
      linksAbsent,
    );
  }

  // Offered for as long as there is something to put back. The old version also
  // asked what the light was saying, which hid the button behind any error and
  // behind the client's own next keystroke.
  const undoable = Boolean(sanityUndo?.length || imageUndo?.length);

  return (
    <EditorShell
      status={shellStatus(status, pending.length)}
      pendingCount={pending.length}
      editableCount={count}
      onPublish={save}
      onDiscard={() => window.location.reload()}
      canUndo={undoable}
      onUndo={undoLast}
      showAll={showAll}
      onShowAll={setShowAll}
      publishes={publishes}
      onOpenHistory={openHistory}
      onUndoPublish={undoPublish}
      overlays={
        <div data-lf-chrome="">
          {/* One picker for the whole page. It is opened from the click on an image,
              which is the only moment a browser will open a file dialog at all. */}
          <input
            ref={picker}
            type="file"
            accept={IMAGE_TYPES}
            style={{ display: 'none' }}
            onChange={(event) => {
              chooseFile(event.target.files?.[0]);
              event.target.value = '';
            }}
          />

          {/* Said where it happened, while it is happening. */}
          {emptyField && (
            <div style={{ ...popoverAt(emptyField.at, 260), padding: '12px 14px' }}>
              <strong style={{ display: 'block', fontWeight: 600, color: '#b42318' }}>{EMPTY_FIELD_MESSAGE}</strong>
              <p style={{ ...note, marginTop: 4 }}>
                Type something, or press Escape to put the old words back. Nothing is staged meanwhile.
              </p>
            </div>
          )}

          {linkPanel && (
            <div style={popoverAt(linkPanel.at, 380)}>
              <div style={popHead}>
                <strong style={{ fontWeight: 600 }}>
                  {linkPanel.rows.length === 1 ? 'Where this link points' : 'Where these links point'}
                </strong>
                <button style={closeBtn} onClick={() => setLinkPanel(null)} aria-label="Close">
                  ×
                </button>
              </div>

              <div style={{ maxHeight: '46vh', overflow: 'auto' }}>
                {linkPanel.rows.map((link, index) => (
                  <div key={`${link.href}-${index}`} style={{ padding: '10px 0', borderTop: `1px solid ${LINE}` }}>
                    <p style={{ margin: 0, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {link.text}
                    </p>
                    <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                      <input
                        value={linkDrafts[index] ?? link.href}
                        style={{ ...field, flex: 1, minWidth: 0 }}
                        onChange={(event) => setLinkDrafts((prev) => ({ ...prev, [index]: event.target.value }))}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') applyLink(link, index);
                          if (event.key === 'Escape') setLinkPanel(null);
                        }}
                      />
                      <button
                        style={{ ...pillBtn, ...pillPrimary, opacity: linkBusy === index ? 0.5 : 1 }}
                        onClick={() => applyLink(link, index)}
                        disabled={linkBusy === index}
                      >
                        {linkBusy === index ? 'Checking\u2026' : 'Apply'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <p style={note}>
                {linkNote ||
                  'A page on this site starts with /. A page elsewhere starts with https://. Enter to apply, Escape to close.'}
              </p>
            </div>
          )}

          {assetTarget && (
            <div style={popoverAt(assetTarget.at, 320)}>
              <div style={popHead}>
                <strong style={{ fontWeight: 600 }}>Replace image</strong>
                <button style={closeBtn} onClick={() => setAssetTarget(null)} aria-label="Close">
                  ×
                </button>
              </div>
              <button style={{ ...pillBtn, ...pillPrimary, marginTop: 4 }} onClick={() => openPicker(assetTarget.id)}>
                Choose a picture…
              </button>
              <p style={note}>PNG, JPEG, WebP or GIF, up to 3 MB. It goes onto the site when you press Publish.</p>

              {assetTarget.content && !assetTarget.address && (
                <button style={linkButton} onClick={() => setAssetTarget({ ...assetTarget, address: true })}>
                  Use an address instead
                </button>
              )}

              {assetTarget.content && assetTarget.address && (
                <>
                  <p style={{ margin: '12px 0 6px', fontWeight: 600 }}>Image address</p>
                  <input
                    autoFocus
                    defaultValue={assetTarget.current}
                    style={field}
                    onKeyDown={(event) => {
                      if (event.key === 'Escape') setAssetTarget(null);
                      if (event.key === 'Enter') {
                        const value = (event.target as HTMLInputElement).value.trim();
                        const el = document.querySelector<HTMLImageElement>(`[data-lf-id="${assetTarget.id}"]`);
                        if (el && value) {
                          if (!originals.current.has(assetTarget.id)) {
                            originals.current.set(assetTarget.id, el.getAttribute('src') ?? '');
                          }
                          el.setAttribute('src', value);
                          el.removeAttribute('srcset');
                          el.removeAttribute('sizes');
                          record(assetTarget.id, value, value.slice(0, 42));
                        }
                        setAssetTarget(null);
                      }
                    }}
                  />
                  <p style={note}>Enter to apply, Escape to cancel.</p>
                </>
              )}
            </div>
          )}
        </div>
      }
    >
      {children}
    </EditorShell>
  );
}

/**
 * The status light, in the words the top bar has room for.
 *
 * The states themselves are untouched — this only shortens what they say. The
 * full sentence rides along as the element's title, and the Settings panel
 * shows it in full.
 */
function shellStatus(status: Status, unsaved: number): ShellStatus {
  const seconds = formatSeconds(status.seconds ?? 0);
  if (status.kind === 'error' || status.kind === 'stale') {
    return { tone: 'bad', text: status.message ?? 'Something went wrong', title: status.message };
  }
  if (status.kind === 'saving') return { tone: 'busy', text: 'Saving…' };
  if (status.kind === 'checking') return { tone: 'busy', text: `Building · ${seconds}`, title: status.message };
  if (status.kind === 'live') {
    return { tone: 'ok', text: status.seconds ? `Live · took ${seconds}` : 'Live', title: status.message };
  }
  if (status.kind === 'saved') return { tone: 'busy', text: 'Saved', title: status.message };
  // Nothing is happening but there is something to say — edits put back after a
  // session ended. It outranks the count, which the client can see anyway.
  if (status.kind === 'idle' && status.message) {
    return { tone: 'ok', text: status.message, title: status.message };
  }
  if (unsaved) return { tone: 'busy', text: `${unsaved} unsaved` };
  return { tone: 'ok', text: 'Live' };
}

/** Where a popover opens: under the left edge of what was clicked. */
function pointFor(el: HTMLElement): { x: number; y: number } {
  const box = el.getBoundingClientRect();
  return { x: box.left, y: box.bottom + 8 };
}

/** Place the text caret where the editor clicked, falling back to the end. */
function placeCaret(el: HTMLElement, event: MouseEvent) {
  const selection = window.getSelection();
  if (!selection) return;
  const doc = document as Document & {
    caretRangeFromPoint?: (x: number, y: number) => Range | null;
  };
  const range = doc.caretRangeFromPoint?.(event.clientX, event.clientY);
  if (range && el.contains(range.startContainer)) {
    selection.removeAllRanges();
    selection.addRange(range);
    return;
  }
  const end = document.createRange();
  end.selectNodeContents(el);
  end.collapse(false);
  selection.removeAllRanges();
  selection.addRange(end);
}

const LINE = '#e6ebf0';
const BRAND = '#4f46e5';
const FONT = 'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif';

/**
 * A popover, anchored under what was clicked and kept inside the canvas.
 *
 * Both panels used to be pinned to the bottom-left corner beside the old bar.
 * Anchored is the whole point of the shell: the fields sit beside the thing
 * they change, not in a corner the client has to look away to find.
 */
function popoverAt(at: { x: number; y: number }, width: number): React.CSSProperties {
  const margin = 12;
  const maxLeft = (typeof window === 'undefined' ? 1440 : window.innerWidth) - width - margin;
  const maxTop = (typeof window === 'undefined' ? 900 : window.innerHeight) - 220;
  return {
    position: 'fixed',
    left: Math.max(72, Math.min(at.x, Math.max(72, maxLeft))),
    top: Math.max(64, Math.min(at.y, Math.max(64, maxTop))),
    width,
    zIndex: 2147483001,
    padding: 14,
    borderRadius: 12,
    background: '#fff',
    border: `1px solid ${LINE}`,
    color: '#14212b',
    font: `13px/1.45 ${FONT}`,
    boxShadow: '0 16px 40px rgba(20,33,43,.18), 0 1px 2px rgba(20,33,43,.06)',
  };
}

const popHead: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 10,
  marginBottom: 4,
};

const closeBtn: React.CSSProperties = {
  width: 26,
  height: 26,
  border: 0,
  borderRadius: 8,
  background: 'transparent',
  color: '#5b6b7a',
  fontSize: 18,
  lineHeight: 1,
  cursor: 'pointer',
};

const pillBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  height: 32,
  padding: '0 12px',
  borderRadius: 8,
  border: `1px solid ${LINE}`,
  background: '#fff',
  color: '#14212b',
  font: `500 13px ${FONT}`,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

const pillPrimary: React.CSSProperties = {
  background: BRAND,
  borderColor: BRAND,
  color: '#fff',
  fontWeight: 600,
};

const field: React.CSSProperties = {
  width: '100%',
  height: 32,
  padding: '0 10px',
  border: `1px solid ${LINE}`,
  borderRadius: 8,
  background: '#fff',
  color: '#14212b',
  font: `13px ${FONT}`,
};

const note: React.CSSProperties = { margin: '10px 0 0', fontSize: 12, color: '#5b6b7a', minHeight: 16 };

/** A plain-text button that reads as a link: the secondary way to change a picture. */
const linkButton: React.CSSProperties = {
  display: 'block',
  marginTop: 10,
  padding: 0,
  border: 0,
  background: 'transparent',
  color: BRAND,
  font: `13px ${FONT}`,
  textDecoration: 'underline',
  cursor: 'pointer',
};
