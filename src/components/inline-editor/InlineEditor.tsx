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

type Change = { id: string; value: string; label: string };
type Status = { kind: 'idle' | 'saving' | 'saved' | 'error'; message?: string };

const START = '\u{E0001}';
const BASE = 0xe0000;
const MARKS = /[\u{E0000}-\u{E007F}]/gu;
const OUTLINE = '2px solid #2f7de1';
const OUTLINE_HOVER = '2px dashed #9dc3f2';

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

const strip = (text: string) => text.replace(MARKS, '');

function countMarks(el: Element | null): number {
  if (!el) return 0;
  let n = 0;
  for (const char of el.textContent ?? '') if (char === START) n++;
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
    if (!text.data.includes(START)) continue;
    const id = decodeMark(text.data);
    const el = fieldElement(text);
    if (!id || !el || el.dataset.lfId || el.closest('[data-lf-chrome]')) continue;
    el.dataset.lfId = id;
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

export function InlineEditor() {
  const [changes, setChanges] = useState<Record<string, Change>>({});
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [assetTarget, setAssetTarget] = useState<{ id: string; current: string } | null>(null);
  const [count, setCount] = useState(0);
  const originals = useRef<Map<string, string>>(new Map());

  const record = useCallback((id: string, value: string, label: string) => {
    setChanges((prev) => ({ ...prev, [id]: { id, value, label } }));
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
      event.preventDefault();
      event.stopPropagation();
      if (!originals.current.has(id)) originals.current.set(id, el.innerHTML);
      el.contentEditable = 'true';
      el.spellcheck = true;
      el.style.outline = OUTLINE;
      el.style.outlineOffset = '3px';
      el.focus();
      placeCaret(el, event as MouseEvent);
    };

    const onBlur = (event: Event) => {
      const el = event.currentTarget as HTMLElement;
      const id = el.dataset.lfId!;
      el.contentEditable = 'false';
      el.style.outline = '';
      if (el.innerHTML !== (originals.current.get(id) ?? '')) {
        record(id, strip(el.innerHTML), strip(el.textContent ?? '').slice(0, 42));
      }
    };

    const onKeyDown = (event: Event) => {
      const el = event.currentTarget as HTMLElement;
      const key = (event as KeyboardEvent).key;
      const meta = (event as KeyboardEvent).metaKey || (event as KeyboardEvent).ctrlKey;
      if (key === 'Escape') {
        el.innerHTML = originals.current.get(el.dataset.lfId!) ?? el.innerHTML;
        el.blur();
      }
      if (key === 'Enter' && !(event as KeyboardEvent).shiftKey) {
        event.preventDefault();
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
  }, [record]);

  const pending = Object.values(changes);

  async function save() {
    if (!pending.length) return;
    setStatus({ kind: 'saving' });
    for (const change of pending) {
      const response = await fetch('/api/lf-edit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: change.id, value: change.value }),
      });
      if (!response.ok) {
        const detail = await response.json().catch(() => ({ error: response.statusText }));
        setStatus({ kind: 'error', message: `${change.id}: ${detail.error ?? 'failed'}` });
        return;
      }
    }
    setChanges({});
    originals.current.clear();
    setStatus({
      kind: 'saved',
      message: `${pending.length} change${pending.length > 1 ? 's' : ''} published`,
    });
    setTimeout(() => window.location.reload(), 700);
  }

  return (
    <div data-lf-chrome="">
      <div style={bar}>
        <span style={{ fontWeight: 700 }}>Inline editing</span>
        <span style={{ opacity: 0.75 }}>
          {status.kind === 'saving'
            ? 'Saving…'
            : status.kind === 'error' || status.kind === 'saved'
              ? status.message
              : pending.length
                ? `${pending.length} unsaved`
                : `${count} editable on this page`}
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
        <a style={ghost} href="/api/draft-mode/disable">
          Exit
        </a>
      </div>

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
