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
import { normalizeShownText, type TextReplacement } from '../../lib/inline-edit/body-edit';
import {
  MAX_IMAGE_BYTES,
  SANITY_IMAGE_PREFIX,
  TOO_BIG_MESSAGE,
  contentIdFromImageSrc,
  isSvgSource,
  realImageSource,
  sanityAssetIdFromUrl,
} from '../../lib/inline-edit/image-edit';

/** A staged edit. `file` is set when the editor picked a picture instead of typing. */
type Change = { id: string; value: string; label: string; file?: File };
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
type AssetTarget = { id: string; current: string; content: boolean; address: boolean };

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

/** Everything editable on this page, discovered from the page itself. */
function discover(): HTMLElement[] {
  const found: HTMLElement[] = [];

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node as Text;
    if (blocked(text)) continue;

    if (text.data.includes(START)) {
      const id = decodeMark(text.data);
      const el = fieldElement(text);
      if (!id || !el || el.dataset.lfId || el.closest('[data-lf-chrome]')) continue;
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
  document.querySelectorAll<HTMLImageElement>('img').forEach((img) => {
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
  });

  return found;
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

export function InlineEditor() {
  const [changes, setChanges] = useState<Record<string, Change>>({});
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [assetTarget, setAssetTarget] = useState<AssetTarget | null>(null);
  const [count, setCount] = useState(0);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [publishes, setPublishes] = useState<Publish[] | null>(null);
  const [sanityUndo, setSanityUndo] = useState<SanityUndo[] | null>(null);
  /** Signed tokens from this session's image publishes, one per image. */
  const [imageUndo, setImageUndo] = useState<string[] | null>(null);
  const originals = useRef<Map<string, string>>(new Map());
  const bodySnapshots = useRef<Map<string, BodySnapshot>>(new Map());
  const picker = useRef<HTMLInputElement | null>(null);
  /** Which image the picker was opened for, and the preview addresses to release. */
  const picking = useRef<string | null>(null);
  const previews = useRef<string[]>([]);

  const record = useCallback((id: string, value: string, label: string, file?: File) => {
    setChanges((prev) => ({ ...prev, [id]: { id, value, label, file } }));
    // A new edit invalidates the "before" snapshot from the last Sanity
    // publish — undoing it now would clobber this newer change.
    setSanityUndo(null);
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
      record(id, file.name, file.name, file);
    },
    [record],
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
        });
        // Straight into the file dialog: choosing a picture is what almost
        // everyone clicking a picture means to do. The panel behind it offers
        // the address box for the rare case that is not.
        openPicker(id);
        return;
      }

      if (el.isContentEditable) return;
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
    };

    // Stage on every keystroke. Waiting for blur loses the last edit whenever
    // the element does not give focus up — a link element being the case that
    // caught us.
    const stageBody = (el: HTMLElement, id: string) => {
      const snapshot = bodySnapshots.current.get(id);
      if (!snapshot) return;
      const replacements = diffBody(el, snapshot);
      if (replacements === null) {
        unstage(id);
        setStatus({ kind: 'error', message: BODY_LIMIT_MESSAGE });
        return;
      }
      if (!replacements.length) {
        unstage(id);
        return;
      }
      setStatus((prev) => (prev.kind === 'error' && prev.message === BODY_LIMIT_MESSAGE ? { kind: 'idle' } : prev));
      record(id, JSON.stringify({ replacements }), `Article: ${replacements.length} sentence${replacements.length === 1 ? '' : 's'}`);
    };

    const onInput = (event: Event) => {
      const el = event.currentTarget as HTMLElement;
      const id = el.dataset.lfId!;
      if (!originals.current.has(id)) originals.current.set(id, el.innerHTML);
      if (el.dataset.lfType === 'html') {
        stageBody(el, id);
        return;
      }
      record(id, strip(el.innerHTML), strip(el.textContent ?? '').slice(0, 42));
    };

    const onBlur = (event: Event) => {
      const el = event.currentTarget as HTMLElement;
      const id = el.dataset.lfId!;
      el.contentEditable = 'false';
      el.style.outline = '';
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
      if (key === 'Escape') {
        const id = el.dataset.lfId!;
        el.innerHTML = originals.current.get(id) ?? el.innerHTML;
        bodySnapshots.current.delete(id);
        unstage(id);
        el.blur();
      }
      if (key === 'Enter' && !(event as KeyboardEvent).shiftKey) {
        event.preventDefault();
        event.stopPropagation();
        // A new paragraph in the article body cannot be saved yet; say so instead of splitting the DOM.
        if (el.dataset.lfType === 'html') {
          setStatus({ kind: 'error', message: BODY_LIMIT_MESSAGE });
          return;
        }
        el.contentEditable = 'false';
        el.style.outline = '';
        el.blur();
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

    function wire() {
      const nodes = discover().filter((el) => !wired.has(el));
      nodes.forEach((el) => {
        wired.add(el);
        el.addEventListener('mouseenter', onEnter);
        el.addEventListener('mouseleave', onLeave);
        el.addEventListener('click', onClick, true);
        el.addEventListener('input', onInput);
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
    }

    wire();
    // Sections that mount late: sliders, tabs, anything client-rendered.
    const observer = new MutationObserver(() => wire());
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [record, unstage, openPicker]);

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
  ) {
    const state = liveCheck.current;
    if (state.timer) clearTimeout(state.timer);
    state.stop = false;
    const started = Date.now();
    const path = window.location.pathname;
    const limit = 6 * 60 * 1000;

    if (!needles.length && !markup.length) {
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
          body: JSON.stringify({ path, needles, absent, markup }),
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
  async function save() {
    if (!pending.length) return;
    setStatus({ kind: 'saving' });
    liveCheck.current.stop = true;

    const images = pending.filter((change) => change.file);
    const sent = pending.filter((change) => !change.file).map(({ id, value }) => ({ id, value }));
    const gone = goneFor(sent, originals.current);
    const needles: string[] = [];
    const markup: string[] = [];
    const saveOrder: string[] = [];

    let contentCount = 0;
    let sanityCount = 0;
    let repoImages = 0;
    let cmsImages = 0;
    let store: string | undefined;
    const imageTokens: string[] = [];

    if (sent.length) {
      let response: Response;
      try {
        response = await fetch('/api/lf-edit', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ changes: sent }),
        });
      } catch {
        // The edits stay staged: the bar must never sit on "Saving…" forever.
        setStatus({ kind: 'error', message: UNREACHABLE });
        return;
      }
      const result = await response.json().catch(() => ({ error: response.statusText }));
      // A half-failed publish answers 200 with an error in the body. Keep the
      // staged edits in that case too, so nothing the client typed is dropped.
      if (!response.ok || result?.ok === false || result?.error) {
        setStatus({ kind: 'error', message: result?.error ?? 'Publish failed' });
        return;
      }
      const sanity: { id: string; token: string; after?: string }[] = result.sanity ?? [];
      sanityCount = sanity.length;
      contentCount = Math.max(0, (result.published ?? 0) - sanityCount);
      store = result.mode;
      setSanityUndo(sanityCount ? sanity.map(({ id, token }) => ({ id, token })) : null);
      needles.push(...needlesFor(sent));
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

    // Development, repository only: the commit is made in the working copy and
    // the dev server re-reads it, so a reload shows it at once.
    const building = (contentCount || repoImages) && store === 'github';
    if (!building && !sanityCount && !cmsImages) {
      setStatus({ kind: 'saved', message: `${saved} — committed` });
      setTimeout(() => window.location.reload(), 900);
      return;
    }

    // Everything else is confirmed against the public page, not assumed.
    const waiting = building
      ? `${saved} — committed, the site is building (usually 2 to 4 minutes)`
      : pictures
        ? `${saved} — refreshing the public page`
        : `${saved} to the CMS — refreshing the public page`;
    watchUntilLive(needles, waiting, saved, gone, markup);
  }

  const unstageAll = (ids: string[]) =>
    setChanges((prev) => {
      const next = { ...prev };
      for (const id of ids) delete next[id];
      return next;
    });

  /**
   * Take back this session's last publish: the Sanity words, the Sanity
   * pictures, or both. Words go back through the publish route with the token
   * that sealed them; pictures go through the undo route, which is where every
   * undo lives. One light watches the result of both.
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

    watchUntilLive(needles, 'Reverted in the CMS — refreshing the public page', 'Reverted', absent, markup);
  }

  async function openHistory() {
    setHistoryOpen(true);
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

  async function undoPublish(hash: string) {
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
    setHistoryOpen(false);
    if (result.mode !== 'github') {
      setStatus({ kind: 'saved', message: 'Change undone' });
      setTimeout(() => window.location.reload(), 900);
      return;
    }
    // Same light as a publish: the words that came back are what to look for.
    const restored = Array.isArray(result.restored) ? (result.restored as { id: string; value: string }[]) : [];
    const removed = Array.isArray(result.removed) ? (result.removed as { id: string; value: string }[]) : [];
    setStatus({ kind: 'saved', message: 'Change undone — committed' });
    watchUntilLive(
      needlesFor(restored, true),
      'Change undone — committed, the site is building (usually 2 to 4 minutes)',
      'Change undone',
      needlesFor(removed, true),
    );
  }

  return (
    <div data-lf-chrome="">
      <style>{`@keyframes lf-pulse { 0%,100% { opacity: 1 } 50% { opacity: .35 } }`}</style>
      <div style={bar}>
        <span style={{ fontWeight: 700 }}>Inline editing</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, opacity: 0.9 }}>
          <span aria-hidden="true" style={{ ...light, ...lightFor(status.kind, pending.length > 0) }} />
          <span>
            {status.kind === 'saving'
              ? 'Saving…'
              : status.kind === 'checking'
                ? `${status.message} · ${formatSeconds(status.seconds ?? 0)}`
                : status.kind === 'live'
                  ? `${status.message}${status.seconds ? ` · took ${formatSeconds(status.seconds)}` : ''}`
                  : status.kind === 'error' || status.kind === 'saved' || status.kind === 'stale'
                    ? status.message
                    : pending.length
                      ? `${pending.length} unsaved`
                      : `${count} editable on this page`}
          </span>
        </span>
        <button
          style={{ ...button, opacity: pending.length ? 1 : 0.45 }}
          onClick={save}
          disabled={!pending.length}
        >
          Publish
        </button>
        <button style={ghost} onClick={() => window.location.reload()} disabled={!pending.length}>
          Discard
        </button>
        {(status.kind === 'saved' || status.kind === 'checking' || status.kind === 'live' || status.kind === 'stale') &&
        (sanityUndo?.length || imageUndo?.length) ? (
          <button style={ghost} onClick={undoLast}>
            Undo
          </button>
        ) : null}
        <button
          style={{ ...ghost, background: showAll ? 'rgba(255,255,255,.18)' : 'transparent' }}
          onClick={() => setShowAll((on) => !on)}
        >
          {showAll ? 'Hide editable' : 'Show editable'}
        </button>
        <button style={ghost} onClick={openHistory}>
          History
        </button>
        <a style={ghost} href="/api/lf-edit/signout">
          Sign out
        </a>
      </div>

      {historyOpen && (
        <div style={{ ...panel, width: 520, maxHeight: '60vh', overflow: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ margin: '0 0 10px', fontWeight: 700 }}>Recent publishes</p>
            <button style={{ ...ghost, color: '#14212b', borderColor: '#cfd9e2' }} onClick={() => setHistoryOpen(false)}>
              Close
            </button>
          </div>
          {publishes === null && <p style={{ margin: 0, opacity: 0.7 }}>Loading…</p>}
          {publishes?.length === 0 && <p style={{ margin: 0, opacity: 0.7 }}>Nothing published yet.</p>}
          {publishes?.map((entry) => (
            <div
              key={entry.hash}
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderTop: '1px solid #eef2f5',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 600 }}>{entry.summary}</p>
                <p style={{ margin: '2px 0 0', fontSize: 12, opacity: 0.7 }}>
                  {new Date(entry.date).toLocaleString()} · {entry.editor}
                  {entry.fields.length ? ` · ${entry.fields.slice(0, 3).join(', ')}` : ''}
                </p>
              </div>
              {entry.reverted ? (
                <span style={{ fontSize: 12, opacity: 0.6, whiteSpace: 'nowrap' }}>undone</span>
              ) : (
                <button
                  style={{ ...button, background: '#8c1d18', padding: '6px 12px' }}
                  onClick={() => undoPublish(entry.hash)}
                >
                  Undo
                </button>
              )}
            </div>
          ))}
        </div>
      )}

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

      {assetTarget && (
        <div style={panel}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ margin: '0 0 8px', fontWeight: 700 }}>Replace image</p>
            <button
              style={{ ...ghost, color: '#14212b', borderColor: '#cfd9e2' }}
              onClick={() => setAssetTarget(null)}
            >
              Close
            </button>
          </div>
          <button style={button} onClick={() => openPicker(assetTarget.id)}>
            Choose a picture…
          </button>
          <p style={{ margin: '8px 0 0', fontSize: 12, opacity: 0.7 }}>
            PNG, JPEG, WebP or GIF, up to 4 MB. It goes onto the site when you press Publish.
          </p>

          {assetTarget.content && !assetTarget.address && (
            <button
              style={linkButton}
              onClick={() => setAssetTarget({ ...assetTarget, address: true })}
            >
              Use an address instead
            </button>
          )}

          {assetTarget.content && assetTarget.address && (
            <>
              <p style={{ margin: '12px 0 6px', fontWeight: 600 }}>Image address</p>
              <input
                autoFocus
                defaultValue={assetTarget.current}
                style={input}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') setAssetTarget(null);
                  if (event.key === 'Enter') {
                    const value = (event.target as HTMLInputElement).value.trim();
                    const el = document.querySelector<HTMLImageElement>(
                      `[data-lf-id="${assetTarget.id}"]`,
                    );
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
              <p style={{ margin: '8px 0 0', fontSize: 12, opacity: 0.7 }}>
                Enter to apply, Escape to cancel.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
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

const light: React.CSSProperties = {
  width: 9,
  height: 9,
  borderRadius: '50%',
  flexShrink: 0,
  transition: 'background .3s, box-shadow .3s',
};

/** Grey: nothing pending. Amber: unsaved or in flight. Green: confirmed on the public page. Red: a problem. */
function lightFor(kind: Status['kind'], dirty: boolean): React.CSSProperties {
  if (kind === 'error' || kind === 'stale') return { background: '#e5484d', boxShadow: '0 0 0 3px rgba(229,72,77,.25)' };
  if (kind === 'live') return { background: '#30a46c', boxShadow: '0 0 0 3px rgba(48,164,108,.25)' };
  if (kind === 'saving' || kind === 'checking') return { background: '#f5a524', boxShadow: '0 0 0 3px rgba(245,165,36,.25)', animation: 'lf-pulse 1.2s ease-in-out infinite' };
  if (kind === 'saved' || dirty) return { background: '#f5a524' };
  return { background: 'rgba(255,255,255,.35)' };
}

const bar: React.CSSProperties = {
  position: 'fixed',
  left: 16,
  bottom: 16,
  zIndex: 2147483000,
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '10px 14px',
  borderRadius: 999,
  background: '#0d1b2a',
  color: '#fff',
  font: '13px/1.2 ui-sans-serif, system-ui, sans-serif',
  boxShadow: '0 10px 30px rgba(0,0,0,.25)',
};

const button: React.CSSProperties = {
  border: 0,
  borderRadius: 999,
  padding: '7px 14px',
  background: '#2f7de1',
  color: '#fff',
  font: '600 13px ui-sans-serif, system-ui, sans-serif',
  cursor: 'pointer',
};

const ghost: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,.28)',
  borderRadius: 999,
  padding: '6px 12px',
  background: 'transparent',
  color: '#fff',
  font: '13px ui-sans-serif, system-ui, sans-serif',
  cursor: 'pointer',
  textDecoration: 'none',
};

const panel: React.CSSProperties = {
  position: 'fixed',
  left: 16,
  bottom: 74,
  zIndex: 2147483000,
  width: 420,
  padding: 14,
  borderRadius: 12,
  background: '#fff',
  color: '#0d1b2a',
  font: '13px/1.4 ui-sans-serif, system-ui, sans-serif',
  boxShadow: '0 16px 40px rgba(0,0,0,.22)',
};

/** A plain-text button that reads as a link: the secondary way to change a picture. */
const linkButton: React.CSSProperties = {
  display: 'block',
  marginTop: 10,
  padding: 0,
  border: 0,
  background: 'transparent',
  color: '#2f7de1',
  font: '13px ui-sans-serif, system-ui, sans-serif',
  textDecoration: 'underline',
  cursor: 'pointer',
};

const input: React.CSSProperties = {
  width: '100%',
  padding: '9px 10px',
  border: '1px solid #cfd9e2',
  borderRadius: 8,
  font: '13px ui-sans-serif, system-ui, sans-serif',
};
