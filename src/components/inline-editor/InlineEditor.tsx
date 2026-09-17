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

type Change = { id: string; value: string; label: string };
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
type SanityUndo = { id: string; value: string };

const START = '\u{E0001}';
const BASE = 0xe0000;
const MARKS = /[\u{E0000}-\u{E007F}]/gu;
const OUTLINE = '2px solid #2f7de1';
const OUTLINE_HOVER = '2px dashed #9dc3f2';
/** Sanity fields the editor never makes clickable: the whole-article body. */
const BODY_PATH = new Set(['content', 'body']);
/** A text node inside any of these never becomes an editable field. */
const BLOCKED_ANCESTORS = 'script, style, title, noscript, template, [data-lf-chrome]';

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

  document.querySelectorAll<HTMLImageElement>('img[src*="lf="]').forEach((img) => {
    if (img.dataset.lfId) return;
    const id = new URLSearchParams((img.getAttribute('src') ?? '').split('?')[1] ?? '').get('lf');
    if (!id) return;
    img.dataset.lfId = id;
    img.dataset.lfType = 'image';
    found.push(img);
  });

  return found;
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

const formatSeconds = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export function InlineEditor() {
  const [changes, setChanges] = useState<Record<string, Change>>({});
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [assetTarget, setAssetTarget] = useState<{ id: string; current: string } | null>(null);
  const [count, setCount] = useState(0);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [publishes, setPublishes] = useState<Publish[] | null>(null);
  const [sanityUndo, setSanityUndo] = useState<SanityUndo[] | null>(null);
  const originals = useRef<Map<string, string>>(new Map());
  const bodySnapshots = useRef<Map<string, BodySnapshot>>(new Map());

  const record = useCallback((id: string, value: string, label: string) => {
    setChanges((prev) => ({ ...prev, [id]: { id, value, label } }));
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

  useEffect(() => {
    const wired = new WeakSet<HTMLElement>();

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
        setAssetTarget({
          id,
          current: ((el as HTMLImageElement).getAttribute('src') ?? '').split('?')[0],
        });
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
      if (nodes.length) setCount((n) => n + nodes.length);
    }

    wire();
    // Sections that mount late: sliders, tabs, anything client-rendered.
    const observer = new MutationObserver(() => wire());
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [record, unstage]);

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
  function watchUntilLive(needles: string[], waiting: string, doneWord: string) {
    const state = liveCheck.current;
    if (state.timer) clearTimeout(state.timer);
    state.stop = false;
    const started = Date.now();
    const path = window.location.pathname;
    const limit = 6 * 60 * 1000;

    if (!needles.length) {
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
          body: JSON.stringify({ path, needles }),
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

  async function save() {
    if (!pending.length) return;
    setStatus({ kind: 'saving' });
    liveCheck.current.stop = true;
    const sent = pending.map(({ id, value }) => ({ id, value }));
    const response = await fetch('/api/lf-edit', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ changes: sent }),
    });
    const result = await response.json().catch(() => ({ error: response.statusText }));
    if (!response.ok) {
      setStatus({ kind: 'error', message: result.error ?? 'Publish failed' });
      return;
    }
    setChanges({});
    originals.current.clear();
    bodySnapshots.current.clear();

    const sanity: { id: string; before: string }[] = result.sanity ?? [];
    const sanityCount = sanity.length;
    const contentCount = Math.max(0, (result.published ?? 0) - sanityCount);
    setSanityUndo(sanityCount ? sanity.map(({ id, before }) => ({ id, value: before })) : null);

    const total = contentCount + sanityCount;
    if (!total) {
      setStatus({ kind: 'saved', message: 'Nothing changed' });
      return;
    }
    const saved = `${total} change${total === 1 ? '' : 's'} saved`;
    const needles = needlesFor(sent);

    // Development, content files only: the file is committed locally and the
    // dev server re-reads it, so a reload shows it at once.
    if (contentCount && !sanityCount && result.mode !== 'github') {
      setStatus({ kind: 'saved', message: `${saved} — committed` });
      setTimeout(() => window.location.reload(), 900);
      return;
    }

    // Everything else is confirmed against the public page, not assumed.
    const waiting =
      contentCount && result.mode === 'github'
        ? `${saved} — committed, the site is building (usually 2 to 4 minutes)`
        : `${saved} to the CMS — refreshing the public page`;
    watchUntilLive(needles, waiting, saved);
  }

  async function undoSanityPublish() {
    if (!sanityUndo?.length) return;
    setStatus({ kind: 'saving' });
    liveCheck.current.stop = true;
    const response = await fetch('/api/lf-edit', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ changes: sanityUndo, exact: true }),
    });
    const result = await response.json().catch(() => ({ error: response.statusText }));
    if (!response.ok) {
      setStatus({ kind: 'error', message: result.error ?? 'Undo failed' });
      return;
    }
    const restored = sanityUndo;
    setSanityUndo(null);
    watchUntilLive(needlesFor(restored, true), 'Reverted in the CMS — refreshing the public page', 'Reverted');
  }

  async function openHistory() {
    setHistoryOpen(true);
    setPublishes(null);
    const response = await fetch('/api/lf-edit/history');
    const result = await response.json().catch(() => ({ publishes: [] }));
    setPublishes(result.publishes ?? []);
  }

  async function undoPublish(hash: string) {
    setStatus({ kind: 'saving' });
    const response = await fetch('/api/lf-edit/undo', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ hash }),
    });
    const result = await response.json().catch(() => ({ error: response.statusText }));
    if (!response.ok) {
      setStatus({ kind: 'error', message: result.error ?? 'Undo failed' });
      return;
    }
    setStatus({ kind: 'saved', message: result.mode === 'github' ? 'Change undone — live in about two minutes' : 'Change undone' });
    setHistoryOpen(false);
    if (result.mode !== 'github') setTimeout(() => window.location.reload(), 900);
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
        {(status.kind === 'saved' || status.kind === 'checking' || status.kind === 'live' || status.kind === 'stale') && sanityUndo?.length ? (
          <button style={ghost} onClick={undoSanityPublish}>
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

      {assetTarget && (
        <div style={panel}>
          <p style={{ margin: '0 0 8px', fontWeight: 700 }}>Image address</p>
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
                  el.setAttribute('src', value);
                  record(assetTarget.id, value, value.slice(0, 42));
                }
                setAssetTarget(null);
              }
            }}
          />
          <p style={{ margin: '8px 0 0', fontSize: 12, opacity: 0.7 }}>
            Enter to apply, Escape to cancel.
          </p>
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

const input: React.CSSProperties = {
  width: '100%',
  padding: '9px 10px',
  border: '1px solid #cfd9e2',
  borderRadius: 8,
  font: '13px ui-sans-serif, system-ui, sans-serif',
};
