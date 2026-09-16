'use client';

/**
 * Inline editor — prototype, 2026-09-16.
 *
 * Mounted only while Draft Mode is on. It finds every element the server
 * tagged with data-lf-id, lets an editor click one and type in place, and
 * sends changed values to /api/lf-edit, which writes them back into the JSON
 * file the value came from.
 *
 * Deliberately narrow: text, an image source, a link destination. No layout,
 * no section moving, no component choice.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

type Change = { id: string; value: string; label: string };
type Status = { kind: 'idle' | 'saving' | 'saved' | 'error'; message?: string };


/** Place the text caret at the clicked point, falling back to the end. */
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

const OUTLINE = '2px solid #2f7de1';
const OUTLINE_HOVER = '2px dashed #9dc3f2';

export function InlineEditor() {
  const [changes, setChanges] = useState<Record<string, Change>>({});
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [assetTarget, setAssetTarget] = useState<{ id: string; type: string; current: string } | null>(null);
  const originals = useRef<Map<string, string>>(new Map());

  const record = useCallback((id: string, value: string, label: string) => {
    setChanges((prev) => ({ ...prev, [id]: { id, value, label } }));
  }, []);

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-lf-id]'));

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
      const type = el.dataset.lfType ?? 'text';

      if (type === 'image' || type === 'link') {
        event.preventDefault();
        event.stopPropagation();
        const current =
          type === 'image'
            ? (el as HTMLImageElement).getAttribute('src') ?? ''
            : el.getAttribute('href') ?? '';
        setAssetTarget({ id, type, current });
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
      // Put the caret where the editor actually clicked. Without this the
      // caret lands at an arbitrary point and the first keystroke appears in
      // the middle of a word.
      placeCaret(el, event as MouseEvent);
    };

    const onBlur = (event: Event) => {
      const el = event.currentTarget as HTMLElement;
      const id = el.dataset.lfId!;
      el.contentEditable = 'false';
      el.style.outline = '';
      const before = originals.current.get(id) ?? '';
      if (el.innerHTML !== before) {
        record(id, el.innerHTML, (el.textContent ?? '').slice(0, 42));
      }
    };

    const onKeyDown = (event: Event) => {
      const el = event.currentTarget as HTMLElement;
      const key = (event as KeyboardEvent).key;
      if (key === 'Escape') {
        const id = el.dataset.lfId!;
        el.innerHTML = originals.current.get(id) ?? el.innerHTML;
        el.blur();
      }
      if (key === 'Enter' && !(event as KeyboardEvent).shiftKey) {
        event.preventDefault();
        el.blur();
      }
      // Select-all inside the field being edited, never the whole page.
      if ((key === 'a' || key === 'A') && ((event as KeyboardEvent).metaKey || (event as KeyboardEvent).ctrlKey)) {
        event.preventDefault();
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(el);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    };

    nodes.forEach((el) => {
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
      el.addEventListener('click', onClick, true);
      el.addEventListener('blur', onBlur);
      el.addEventListener('keydown', onKeyDown);
      el.style.cursor = 'text';
    });

    return () => {
      nodes.forEach((el) => {
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mouseleave', onLeave);
        el.removeEventListener('click', onClick, true);
        el.removeEventListener('blur', onBlur);
        el.removeEventListener('keydown', onKeyDown);
        el.style.cursor = '';
        el.style.outline = '';
      });
    };
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
    setStatus({ kind: 'saved', message: `${pending.length} change${pending.length > 1 ? 's' : ''} published` });
    setTimeout(() => window.location.reload(), 700);
  }

  function discard() {
    window.location.reload();
  }

  return (
    <>
      <div style={bar}>
        <span style={{ fontWeight: 700 }}>Inline editing</span>
        <span style={{ opacity: 0.75 }}>
          {status.kind === 'saving'
            ? 'Saving…'
            : status.kind === 'error'
              ? status.message
              : status.kind === 'saved'
                ? status.message
                : pending.length
                  ? `${pending.length} unsaved`
                  : 'Click any text, image or button'}
        </span>
        <button style={{ ...button, opacity: pending.length ? 1 : 0.45 }} onClick={save} disabled={!pending.length}>
          Publish
        </button>
        <button style={ghost} onClick={discard} disabled={!pending.length}>
          Discard
        </button>
        <a style={ghost} href="/api/draft-mode/disable">
          Exit
        </a>
      </div>

      {assetTarget && (
        <div style={panel}>
          <p style={{ margin: '0 0 8px', fontWeight: 700 }}>
            {assetTarget.type === 'image' ? 'Image address' : 'Link destination'}
          </p>
          <input
            autoFocus
            defaultValue={assetTarget.current}
            style={input}
            onKeyDown={(event) => {
              if (event.key === 'Escape') setAssetTarget(null);
              if (event.key === 'Enter') {
                const value = (event.target as HTMLInputElement).value.trim();
                const el = document.querySelector<HTMLElement>(`[data-lf-id="${assetTarget.id}"]`);
                if (el && value) {
                  if (assetTarget.type === 'image') el.setAttribute('src', value);
                  else el.setAttribute('href', value);
                  record(assetTarget.id, value, value.slice(0, 42));
                }
                setAssetTarget(null);
              }
            }}
          />
          <p style={{ margin: '8px 0 0', fontSize: 12, opacity: 0.7 }}>Enter to apply, Escape to cancel.</p>
        </div>
      )}
    </>
  );
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
