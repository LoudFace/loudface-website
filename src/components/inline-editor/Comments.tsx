'use client';

/**
 * Comments on the page, 2026-10-16.
 *
 * Arnel: "point and click anywhere on the canvas to leave a comment annotation
 * that other people in the tool can also see."
 *
 * Three pieces, all mounted by EditorShell:
 *
 *  - `useSiteComments` reads every comment on the site from
 *    `/api/lf-edit/comments`, then asks for what changed every ten seconds
 *    while the tab is in view, so a colleague's comment shows up without a
 *    reload. Writes go out at once and show at once; a refused write is taken
 *    back and the words stay in the box.
 *  - `CommentLayer` is comment mode. While it is on, a click anywhere on the
 *    site drops a pin there and nothing else happens: no link is followed, no
 *    text starts editing, no button presses. Pins are drawn in a layer over
 *    the canvas and re-placed every frame from the element they are tied to
 *    (`src/lib/inline-edit/comment-anchor.ts`), so sticky headers, carousels
 *    and a page that grows as it loads all carry their pins with them.
 *  - `CommentsPanel` is the list: this page's threads, open first, and how
 *    many are open on every other page.
 *
 * Every surface carries `data-lf-chrome`, so the editor never offers a
 * comment's own words as editable text, and comment mode never pins a comment
 * to another comment.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  pointIn,
  readAnchor,
  resolveAnchor,
  selectorFor,
  spotWithin,
  wordsOf,
  type AnchorState,
  type CommentAnchor,
} from '../../lib/inline-edit/comment-anchor';
import type { SiteComment } from '../../lib/inline-edit/comments';

const INK = '#14212b';
const MUTE = '#5b6b7a';
const LINE = '#e6ebf0';
const BRAND = '#4f46e5';
const AMBER = '#b45309';
const FONT = 'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif';
const POLL_MS = 10_000;
const POPOVER_WIDTH = 320;
const AVATAR_COLOURS = ['#4f46e5', '#0ea5e9', '#f97316', '#16a34a', '#db2777', '#7c3aed'];

/** The page as comments key it: the path, without a trailing slash. */
export function pageKey(path: string): string {
  return path.replace(/\/+$/, '') || '/';
}

function colourFor(email: string): string {
  let sum = 0;
  for (const ch of email) sum = (sum * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_COLOURS[sum % AVATAR_COLOURS.length];
}

function initials(name: string): string {
  const parts = name.split(/[._\s-]+/).filter(Boolean);
  if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (name.slice(0, 2) || '?').toUpperCase();
}

function displayName(name: string): string {
  const first = name.split(/[._\s-]+/)[0] ?? name;
  return first ? first[0].toUpperCase() + first.slice(1) : 'Somebody';
}

/** "just now", "4m", "3h", "Oct 14": short enough for the line under a name. */
function ago(iso: string, now = Date.now()): string {
  const then = Date.parse(iso);
  if (!Number.isFinite(then)) return '';
  const s = Math.max(0, Math.round((now - then) / 1000));
  if (s < 45) return 'just now';
  if (s < 3600) return `${Math.round(s / 60)}m`;
  if (s < 86_400) return `${Math.round(s / 3600)}h`;
  if (s < 7 * 86_400) return `${Math.round(s / 86_400)}d`;
  return new Date(then).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// ── The store ────────────────────────────────────────────────────────────────

export type Thread = SiteComment & { replies: SiteComment[]; number: number };

export type CommentStore = {
  /** False until the first read; `off` when the site has no comments set up. */
  ready: boolean;
  off: boolean;
  error: string;
  you: string;
  owner: boolean;
  /** Every live thread on the site, with its replies, numbered per page in the order they were made. */
  threads: Thread[];
  create: (input: { page: string; anchor: CommentAnchor; body: string }) => Promise<{ id?: string; error?: string }>;
  reply: (thread: string, body: string) => Promise<{ error?: string }>;
  edit: (id: string, body: string) => Promise<{ error?: string }>;
  resolve: (id: string, resolved: boolean) => Promise<{ error?: string }>;
  remove: (id: string) => Promise<{ error?: string }>;
};

type Pending = SiteComment & { pending?: boolean };

const stamp = () => new Date().toISOString();
const NO_SNAPSHOT: SiteComment['snapshot'] = { ready: false, takenAt: null, error: null };
/** A picture is taken in about ten seconds; after this long without one, it is not coming. */
const SNAPSHOT_WAIT_MS = 2 * 60_000;

/** Where the editor reads a thread's picture. */
export const snapshotSrc = (id: string) => `/api/lf-edit/comments/snapshot?id=${encodeURIComponent(id)}`;

export function useSiteComments(owner: boolean): CommentStore {
  const [byId, setById] = useState<Map<string, Pending>>(() => new Map());
  const [ready, setReady] = useState(false);
  const [off, setOff] = useState(false);
  const [error, setError] = useState('');
  const [you, setYou] = useState('');
  const since = useRef<string | null>(null);
  const busy = useRef(false);

  const merge = useCallback((rows: SiteComment[]) => {
    if (!rows.length) return;
    setById((current) => {
      const next = new Map(current);
      for (const row of rows) {
        if (row.deletedAt) next.delete(row.id);
        else next.set(row.id, row);
      }
      return next;
    });
  }, []);

  const read = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    try {
      const query = since.current ? `?since=${encodeURIComponent(since.current)}` : '';
      const response = await fetch(`/api/lf-edit/comments${query}`, { cache: 'no-store' });
      const result = await response.json().catch(() => ({}));
      if (response.status === 503) {
        setOff(true);
        return;
      }
      if (!response.ok || result?.error) {
        setError(result?.error ?? 'Comments could not be read');
        return;
      }
      setError('');
      setOff(false);
      if (typeof result.you === 'string') setYou(result.you);
      merge(result.comments ?? []);
      if (typeof result.now === 'string') since.current = result.now;
    } catch {
      setError('Could not reach the site, comments will refresh when it is back');
    } finally {
      busy.current = false;
      setReady(true);
    }
  }, [merge]);

  useEffect(() => {
    read();
    const tick = window.setInterval(() => {
      if (document.visibilityState === 'visible') read();
    }, POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible') read();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(tick);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [read]);

  /** Send one write. The row the spine sends back replaces whatever was shown. */
  const send = useCallback(
    async (body: Record<string, unknown>): Promise<{ error?: string; row?: SiteComment }> => {
      try {
        const response = await fetch('/api/lf-edit/comments', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || result?.error) return { error: result?.error ?? 'That did not save, try again' };
        const rows: SiteComment[] = result.comments ?? [];
        merge(rows);
        return { row: rows[0] };
      } catch {
        return { error: 'Could not reach the site, try again' };
      }
    },
    [merge],
  );

  /** Show a change now, and put the old state back if the spine refuses it. */
  const optimistic = useCallback(
    async (id: string, change: (row: Pending | undefined) => Pending | null, body: Record<string, unknown>) => {
      let before: Pending | undefined;
      setById((current) => {
        before = current.get(id);
        const next = new Map(current);
        const changed = change(before);
        if (changed) next.set(id, changed);
        else next.delete(id);
        return next;
      });
      const result = await send(body);
      if (result.error) {
        setById((current) => {
          const next = new Map(current);
          if (before) next.set(id, before);
          else next.delete(id);
          return next;
        });
      }
      return result;
    },
    [send],
  );

  const author = useCallback(
    () => ({ email: you, name: (you.split('@')[0] ?? '') || 'you', owner }),
    [you, owner],
  );

  const create = useCallback<CommentStore['create']>(
    async ({ page, anchor, body }) => {
      const id = crypto.randomUUID();
      const now = stamp();
      const row: Pending = {
        id, threadId: null, page, anchor: anchor as unknown as Record<string, unknown>, body, author: author(),
        resolvedAt: null, resolvedBy: null, editedAt: null, deletedAt: null, createdAt: now, updatedAt: now, pending: true,
        snapshot: NO_SNAPSHOT,
      };
      const result = await optimistic(id, () => row, { op: 'create', id, page, anchor, body });
      return result.error ? { error: result.error } : { id };
    },
    [optimistic, author],
  );

  const reply = useCallback<CommentStore['reply']>(
    async (thread, body) => {
      const id = crypto.randomUUID();
      const now = stamp();
      const parent = byId.get(thread);
      const row: Pending = {
        id, threadId: thread, page: parent?.page ?? '/', anchor: null, body, author: author(),
        resolvedAt: null, resolvedBy: null, editedAt: null, deletedAt: null, createdAt: now, updatedAt: now, pending: true,
        snapshot: NO_SNAPSHOT,
      };
      const result = await optimistic(id, () => row, { op: 'reply', id, thread, body });
      // A reply reopens a resolved thread on the spine; show that without waiting for the poll.
      if (!result.error && parent?.resolvedAt) merge([{ ...parent, resolvedAt: null, resolvedBy: null }]);
      return { error: result.error };
    },
    [optimistic, author, byId, merge],
  );

  const edit = useCallback<CommentStore['edit']>(
    async (id, body) => {
      const result = await optimistic(id, (row) => (row ? { ...row, body, editedAt: stamp() } : null), { op: 'edit', id, body });
      return { error: result.error };
    },
    [optimistic],
  );

  const resolve = useCallback<CommentStore['resolve']>(
    async (id, resolved) => {
      const result = await optimistic(
        id,
        (row) => (row ? { ...row, resolvedAt: resolved ? stamp() : null, resolvedBy: resolved ? you : null } : null),
        { op: 'resolve', id, resolved },
      );
      return { error: result.error };
    },
    [optimistic, you],
  );

  const remove = useCallback<CommentStore['remove']>(
    async (id) => {
      const result = await optimistic(id, () => null, { op: 'delete', id });
      if (!result.error) {
        // A thread takes its replies with it.
        setById((current) => {
          const next = new Map(current);
          for (const [key, row] of next) if (row.threadId === id) next.delete(key);
          return next;
        });
      }
      return { error: result.error };
    },
    [optimistic],
  );

  const threads = useMemo(() => {
    const roots: Thread[] = [];
    const replies = new Map<string, SiteComment[]>();
    for (const row of byId.values()) {
      if (row.threadId) {
        const list = replies.get(row.threadId) ?? [];
        list.push(row);
        replies.set(row.threadId, list);
      }
    }
    const byPage = new Map<string, SiteComment[]>();
    for (const row of byId.values()) {
      if (row.threadId) continue;
      const key = pageKey(row.page);
      byPage.set(key, [...(byPage.get(key) ?? []), row]);
    }
    for (const list of byPage.values()) {
      list.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      list.forEach((row, index) => {
        roots.push({
          ...row,
          number: index + 1,
          replies: (replies.get(row.id) ?? []).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
        });
      });
    }
    return roots;
  }, [byId]);

  return { ready, off, error, you, owner, threads, create, reply, edit, resolve, remove };
}

// ── Comment mode, pins and threads ──────────────────────────────────────────

type Draft = { anchor: CommentAnchor; x: number; y: number };
type Placed = { el: Element | null; state: AnchorState; checked: number };

const COMMENT_CURSOR =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'%3E%3Cpath d='M3 25V12a9 9 0 0 1 9-9h4a9 9 0 0 1 0 18H8z' fill='%234f46e5' stroke='white' stroke-width='2'/%3E%3C/svg%3E\") 3 25, crosshair";

/** The key a person holds with Enter to send: ⌘ on a Mac, Ctrl elsewhere. */
function modKey(): string {
  return typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl';
}

/** True while focus is somewhere a person types, so `C` is a letter and not a shortcut. */
function typingSomewhere(): boolean {
  const el = document.activeElement as HTMLElement | null;
  if (!el) return false;
  return el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName);
}

export function CommentLayer({
  canvas,
  store,
  page,
  commenting,
  setCommenting,
  openThread,
  setOpenThread,
  showResolved,
  mobile,
}: {
  canvas: React.RefObject<HTMLDivElement | null>;
  store: CommentStore;
  page: string;
  commenting: boolean;
  setCommenting: (on: boolean) => void;
  openThread: string | null;
  setOpenThread: (id: string | null) => void;
  showResolved: boolean;
  mobile: boolean;
}) {
  const layer = useRef<HTMLDivElement | null>(null);
  const hoverBox = useRef<HTMLDivElement | null>(null);
  const hovered = useRef<Element | null>(null);
  const pins = useRef(new Map<string, HTMLElement>());
  const popover = useRef<HTMLDivElement | null>(null);
  const placed = useRef(new Map<string, Placed>());
  const [draft, setDraft] = useState<Draft | null>(null);
  const [states, setStates] = useState<Record<string, AnchorState>>({});

  const here = pageKey(page);
  const visible = useMemo(
    () => store.threads.filter((t) => pageKey(t.page) === here && (showResolved || !t.resolvedAt || t.id === openThread)),
    [store.threads, here, showResolved, openThread],
  );

  // Leaving comment mode, or the page, closes what was open in it.
  useEffect(() => {
    if (!commenting) {
      setDraft(null);
      hovered.current = null;
    }
  }, [commenting]);
  useEffect(() => {
    setDraft(null);
    placed.current.clear();
  }, [here]);

  // The InlineEditor and the cursor style read this to stand down while commenting.
  useEffect(() => {
    const root = document.documentElement;
    if (commenting) root.dataset.lfCommenting = '1';
    else delete root.dataset.lfCommenting;
    return () => {
      delete root.dataset.lfCommenting;
    };
  }, [commenting]);

  // `C` turns comment mode on and off; Escape closes the box, then the mode.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (draft) setDraft(null);
        else if (openThread) setOpenThread(null);
        else if (commenting) setCommenting(false);
        return;
      }
      if ((event.key === 'c' || event.key === 'C') && !event.metaKey && !event.ctrlKey && !event.altKey && !typingSomewhere()) {
        event.preventDefault();
        setCommenting(!commenting);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [commenting, draft, openThread, setCommenting, setOpenThread]);

  // In comment mode a click on the site is a pin and nothing else. The
  // listeners sit on window in the capture phase, so they run before the
  // site's own handlers and before the editor's, and stop them all.
  useEffect(() => {
    if (!commenting) return;
    const box = canvas.current;
    if (!box) return;
    const onSite = (event: Event) => {
      const target = event.target as Element | null;
      return Boolean(target && box.contains(target) && !target.closest('[data-lf-chrome]'));
    };
    const swallow = (event: Event) => {
      if (!onSite(event)) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    };
    const onClick = (event: MouseEvent) => {
      if (!onSite(event)) return;
      swallow(event);
      const target = event.target as Element;
      const rect = target.getBoundingClientRect();
      const frame = box.getBoundingClientRect();
      const { rx, ry } = spotWithin(rect, event.clientX, event.clientY);
      const anchor: CommentAnchor = {
        v: 1,
        selector: selectorFor(target, box),
        tag: target.tagName.toLowerCase(),
        quote: wordsOf(target),
        rx,
        ry,
        px: Math.round(((event.clientX - frame.left) / Math.max(1, box.clientWidth)) * 10_000) / 10_000,
        py: Math.round(event.clientY - frame.top + box.scrollTop),
        vw: box.clientWidth,
        vh: box.clientHeight,
      };
      setOpenThread(null);
      setDraft({ anchor, x: event.clientX, y: event.clientY });
    };
    const onMove = (event: PointerEvent) => {
      hovered.current = onSite(event) ? (event.target as Element) : null;
    };
    const kinds = ['pointerdown', 'mousedown', 'mouseup', 'dblclick', 'auxclick', 'contextmenu', 'submit'] as const;
    window.addEventListener('click', onClick, true);
    for (const kind of kinds) window.addEventListener(kind, swallow, true);
    window.addEventListener('pointermove', onMove, true);
    return () => {
      window.removeEventListener('click', onClick, true);
      for (const kind of kinds) window.removeEventListener(kind, swallow, true);
      window.removeEventListener('pointermove', onMove, true);
      hovered.current = null;
    };
  }, [commenting, canvas, setOpenThread]);

  // Every frame while pins are shown: lay the layer over the canvas, find each
  // pin's element again, and move the pin, the hover box and the open thread to
  // where those elements are now. Direct style writes, no React render.
  useEffect(() => {
    if (!commenting && !openThread) return;
    let frame = 0;
    let lastStates = '';
    const loop = () => {
      frame = requestAnimationFrame(loop);
      draw();
    };
    // Also on every scroll and resize, not only on the next frame: a browser
    // that is short of frames (a background tab coming back, a slow phone)
    // must never show a pin beside the thing it was put on.
    const draw = () => {
      const box = canvas.current;
      const sheet = layer.current;
      if (!box || !sheet) return;
      const area = box.getBoundingClientRect();
      sheet.style.left = `${area.left}px`;
      sheet.style.top = `${area.top}px`;
      sheet.style.width = `${box.clientWidth}px`;
      sheet.style.height = `${box.clientHeight}px`;

      const hover = hoverBox.current;
      const over = hovered.current;
      if (hover) {
        if (commenting && !draft && over && over.isConnected) {
          const r = over.getBoundingClientRect();
          hover.style.display = 'block';
          hover.style.transform = `translate(${r.left - area.left}px, ${r.top - area.top}px)`;
          hover.style.width = `${r.width}px`;
          hover.style.height = `${r.height}px`;
        } else hover.style.display = 'none';
      }

      const now = performance.now();
      const seen: Record<string, AnchorState> = {};
      let openAt: { x: number; y: number } | null = null;
      for (const thread of visible) {
        const anchor = readAnchor(thread.anchor);
        const pin = pins.current.get(thread.id);
        if (!anchor || !pin) continue;
        let spot = placed.current.get(thread.id);
        const stale = !spot || (spot.el ? !spot.el.isConnected : now - spot.checked > 1500);
        if (stale) {
          const found = resolveAnchor(
            anchor,
            (selector) => box.querySelector(selector),
            (tag) => box.getElementsByTagName(tag),
          );
          spot = { el: found.el, state: found.state, checked: now };
          placed.current.set(thread.id, spot);
        }
        seen[thread.id] = spot!.state;
        let x: number;
        let y: number;
        if (spot!.el) {
          const p = pointIn(spot!.el.getBoundingClientRect(), anchor.rx, anchor.ry);
          x = p.x - area.left;
          y = p.y - area.top;
        } else {
          x = anchor.px * box.clientWidth;
          y = anchor.py - box.scrollTop;
        }
        pin.style.transform = `translate(${Math.round(x)}px, ${Math.round(y) - 30}px)`;
        if (thread.id === openThread) openAt = { x, y };
      }
      if (draft) openAt = { x: draft.x - area.left, y: draft.y - area.top };
      const pop = popover.current;
      if (pop && openAt) {
        const width = Math.min(POPOVER_WIDTH, box.clientWidth - 24);
        const height = pop.offsetHeight || 200;
        // Clear of the pin, which stands 30px to the right of its spot.
        let left = openAt.x + 40;
        if (left + width > box.clientWidth - 12) left = openAt.x - width - 12;
        left = Math.max(12, Math.min(left, box.clientWidth - width - 12));
        const top = Math.max(12, Math.min(openAt.y - 34, box.clientHeight - height - 12));
        if (!mobile) {
          pop.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;
          pop.style.width = `${width}px`;
        }
      }
      const key = JSON.stringify(seen);
      if (key !== lastStates) {
        lastStates = key;
        setStates(seen);
      }
    };
    frame = requestAnimationFrame(loop);
    const box = canvas.current;
    box?.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    return () => {
      cancelAnimationFrame(frame);
      box?.removeEventListener('scroll', draw);
      window.removeEventListener('resize', draw);
    };
  }, [commenting, openThread, visible, draft, canvas, mobile]);

  // A thread opened from the list is brought into view, once, when it opens.
  useEffect(() => {
    if (!openThread) return;
    const box = canvas.current;
    const thread = store.threads.find((t) => t.id === openThread);
    const anchor = thread ? readAnchor(thread.anchor) : null;
    if (!box || !anchor) return;
    const found = resolveAnchor(anchor, (selector) => box.querySelector(selector), (tag) => box.getElementsByTagName(tag));
    const area = box.getBoundingClientRect();
    const y = found.el ? pointIn(found.el.getBoundingClientRect(), anchor.rx, anchor.ry).y - area.top : anchor.py - box.scrollTop;
    if (y < 60 || y > box.clientHeight - 60) {
      box.scrollTo({ top: Math.max(0, box.scrollTop + y - box.clientHeight / 3), behavior: 'smooth' });
    }
    // Only on opening: following the thread as the list refreshes would yank the page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openThread]);

  // A draft stays where it was clicked as the page scrolls.
  const draftScroll = useRef(0);
  useEffect(() => {
    if (!draft) return;
    const box = canvas.current;
    if (!box) return;
    draftScroll.current = box.scrollTop;
    const onScroll = () => {
      const delta = box.scrollTop - draftScroll.current;
      draftScroll.current = box.scrollTop;
      setDraft((current) => (current ? { ...current, y: current.y - delta } : current));
    };
    box.addEventListener('scroll', onScroll, { passive: true });
    return () => box.removeEventListener('scroll', onScroll);
  }, [draft, canvas]);

  const open = visible.find((thread) => thread.id === openThread) ?? null;
  const showPins = commenting || Boolean(openThread);
  const draftAt = draft && canvas.current ? (() => {
    const area = canvas.current!.getBoundingClientRect();
    return { x: draft.x - area.left, y: draft.y - area.top };
  })() : null;

  return (
    <div
      ref={layer}
      data-lf-chrome=""
      style={{ position: 'fixed', overflow: 'hidden', pointerEvents: 'none', zIndex: 4, borderRadius: mobile ? 0 : 14 }}
    >
      <style>{`
        html[data-lf-commenting] [data-lf-canvas], html[data-lf-commenting] [data-lf-canvas] * { cursor: ${COMMENT_CURSOR} !important; }
        @keyframes lf-pin-in { from { transform: scale(.6); opacity: 0 } to { transform: none; opacity: 1 } }
      `}</style>

      <div
        ref={hoverBox}
        style={{
          position: 'absolute', left: 0, top: 0, display: 'none', borderRadius: 4,
          outline: `1.5px solid ${BRAND}`, background: 'rgba(79,70,229,.06)', pointerEvents: 'none',
        }}
      />

      {showPins && visible.map((thread) => (
        <button
          key={thread.id}
          ref={(node) => {
            if (node) pins.current.set(thread.id, node);
            else pins.current.delete(thread.id);
          }}
          aria-label={`Comment ${thread.number} by ${displayName(thread.author.name)}`}
          onClick={() => {
            setDraft(null);
            setOpenThread(openThread === thread.id ? null : thread.id);
          }}
          style={pinStyle(thread, states[thread.id], thread.id === openThread)}
        >
          <span style={{ animation: 'lf-pin-in .16s ease-out' }}>{thread.number}</span>
        </button>
      ))}

      {draft && draftAt && (
        <span
          style={{
            ...pinBase, background: BRAND, color: '#fff', pointerEvents: 'none',
            transform: `translate(${Math.round(draftAt.x)}px, ${Math.round(draftAt.y) - 30}px)`,
          }}
        >
          +
        </span>
      )}

      {(draft || open) && (
        <div
          ref={popover}
          role="dialog"
          aria-label={draft ? 'New comment' : `Comment ${open!.number}`}
          style={{
            ...popoverStyle,
            ...(mobile ? { left: 12, right: 12, bottom: 12, top: 'auto', width: 'auto' } : {}),
          }}
        >
          {draft ? (
            <Composer
              placeholder="Add a comment"
              action="Post"
              autoFocus
              onCancel={() => setDraft(null)}
              onSubmit={async (body) => {
                const result = await store.create({ page: here, anchor: draft.anchor, body });
                if (result.error) return result.error;
                setDraft(null);
                if (result.id) setOpenThread(result.id);
                return '';
              }}
            />
          ) : (
            open && <ThreadView thread={open} state={states[open.id]} store={store} onClose={() => setOpenThread(null)} />
          )}
        </div>
      )}
    </div>
  );
}

function pinStyle(thread: Thread, state: AnchorState | undefined, active: boolean): React.CSSProperties {
  const resolved = Boolean(thread.resolvedAt);
  const lost = state === 'detached' || state === 'parent';
  return {
    ...pinBase,
    pointerEvents: 'auto',
    cursor: 'pointer',
    background: resolved ? '#fff' : lost ? '#fff' : colourFor(thread.author.email),
    color: resolved ? MUTE : lost ? AMBER : '#fff',
    border: lost ? `2px dashed ${AMBER}` : resolved ? `2px solid ${LINE}` : '2px solid #fff',
    boxShadow: active
      ? `0 0 0 3px rgba(79,70,229,.35), 0 6px 16px rgba(20,33,43,.25)`
      : '0 4px 12px rgba(20,33,43,.22)',
    zIndex: active ? 2 : 1,
  };
}

const pinBase: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  top: 0,
  width: 30,
  height: 30,
  display: 'grid',
  placeItems: 'center',
  padding: 0,
  // The bottom-left corner is the point: it sits on the spot that was clicked.
  borderRadius: '15px 15px 15px 3px',
  font: `600 12px ${FONT}`,
  willChange: 'transform',
};

const popoverStyle: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  top: 0,
  width: POPOVER_WIDTH,
  maxHeight: 'min(520px, calc(100% - 24px))',
  display: 'flex',
  flexDirection: 'column',
  background: '#fff',
  border: `1px solid ${LINE}`,
  borderRadius: 12,
  boxShadow: '0 16px 40px rgba(20,33,43,.2)',
  pointerEvents: 'auto',
  font: `13px/1.45 ${FONT}`,
  color: INK,
  zIndex: 3,
  cursor: 'auto',
};

function Avatar({ name, email, size = 24 }: { name: string; email: string; size?: number }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center',
        background: colourFor(email), color: '#fff', font: `600 ${Math.round(size * 0.4)}px ${FONT}`,
      }}
    >
      {initials(name)}
    </span>
  );
}

/** A text box with Post and Cancel. Returns an error to show, or '' when it went through. */
function Composer({
  placeholder,
  action,
  initial = '',
  autoFocus,
  onSubmit,
  onCancel,
  compact,
}: {
  placeholder: string;
  action: string;
  initial?: string;
  autoFocus?: boolean;
  onSubmit: (body: string) => Promise<string>;
  onCancel?: () => void;
  compact?: boolean;
}) {
  const [text, setText] = useState(initial);
  const [sending, setSending] = useState(false);
  const [note, setNote] = useState('');
  const box = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (autoFocus) box.current?.focus();
  }, [autoFocus]);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(160, el.scrollHeight)}px`;
  }, [text]);

  const submit = async () => {
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setNote('');
    const error = await onSubmit(body);
    setSending(false);
    if (error) setNote(error);
    else setText('');
  };

  return (
    <div style={{ padding: compact ? '10px 12px 12px' : 12 }}>
      <textarea
        ref={box}
        value={text}
        placeholder={placeholder}
        rows={compact ? 1 : 2}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          event.stopPropagation();
          if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            submit();
          }
          if (event.key === 'Escape') onCancel?.();
        }}
        style={{
          width: '100%', boxSizing: 'border-box', resize: 'none', border: `1px solid ${LINE}`, borderRadius: 8,
          padding: '8px 10px', font: `13px/1.45 ${FONT}`, color: INK, outline: 'none', background: '#fff',
        }}
      />
      {note && <p style={{ margin: '6px 0 0', color: '#b42318', fontSize: 12 }}>{note}</p>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
        <span style={{ color: MUTE, fontSize: 11 }}>{modKey()} Enter to {action.toLowerCase()}</span>
        <span style={{ marginLeft: 'auto' }} />
        {onCancel && (
          <button style={smallBtn} onClick={onCancel}>
            Cancel
          </button>
        )}
        <button
          style={{ ...smallBtn, background: BRAND, borderColor: BRAND, color: '#fff', opacity: text.trim() && !sending ? 1 : 0.6 }}
          disabled={!text.trim() || sending}
          onClick={submit}
        >
          {sending ? 'Saving…' : action}
        </button>
      </div>
    </div>
  );
}

const smallBtn: React.CSSProperties = {
  height: 28,
  padding: '0 10px',
  borderRadius: 7,
  border: `1px solid ${LINE}`,
  background: '#fff',
  font: `500 12px ${FONT}`,
  color: INK,
  cursor: 'pointer',
};

const iconBtn: React.CSSProperties = {
  width: 28,
  height: 28,
  display: 'grid',
  placeItems: 'center',
  border: 0,
  background: 'transparent',
  color: MUTE,
  borderRadius: 7,
  cursor: 'pointer',
  padding: 0,
};

function Glyph({ d, size = 16 }: { d: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true"
      style={{ stroke: 'currentColor', fill: 'none', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round', flexShrink: 0 }}>
      <path d={d} />
    </svg>
  );
}

function ThreadView({
  thread,
  state,
  store,
  onClose,
}: {
  thread: Thread;
  state: AnchorState | undefined;
  store: CommentStore;
  onClose: () => void;
}) {
  const [note, setNote] = useState('');
  const resolved = Boolean(thread.resolvedAt);
  const anchor = readAnchor(thread.anchor);
  const list = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight });
  }, [thread.replies.length]);

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 8px 8px 12px', borderBottom: `1px solid ${LINE}` }}>
        <strong style={{ fontWeight: 600 }}>Comment {thread.number}</strong>
        {resolved && <span style={{ color: '#166534', fontSize: 12, fontWeight: 500 }}>· Resolved</span>}
        <span style={{ marginLeft: 'auto' }} />
        <button
          style={{ ...iconBtn, color: resolved ? '#166534' : MUTE }}
          title={resolved ? 'Reopen' : 'Resolve'}
          aria-label={resolved ? 'Reopen this comment' : 'Resolve this comment'}
          onClick={async () => {
            // Resolving closes the thread at once; if the spine refuses, the
            // store puts the pin back and the thread can be opened again.
            if (!resolved) {
              onClose();
              await store.resolve(thread.id, true);
              return;
            }
            const result = await store.resolve(thread.id, false);
            setNote(result.error ?? '');
          }}
        >
          <Glyph d={resolved ? 'M3 12a9 9 0 1 0 3-6.7M3 3v5h5' : 'M5 12.5l4.5 4.5L19 7.5'} />
        </button>
        <button style={iconBtn} aria-label="Close" onClick={onClose}>
          <Glyph d="M6 6l12 12M18 6 6 18" size={15} />
        </button>
      </div>

      {(state === 'changed' || state === 'parent' || state === 'detached') && (
        <p style={{ margin: 0, padding: '8px 12px', background: '#fffbeb', color: AMBER, fontSize: 12, borderBottom: `1px solid ${LINE}` }}>
          {state === 'changed'
            ? 'The words here changed after this comment was left.'
            : `${state === 'parent'
              ? 'The exact spot this was left on is gone, so the pin sits on the part of the page around it'
              : 'The spot this was left on is no longer on the page'}${anchor?.quote ? `. It was on “${anchor.quote}”` : ''}.`}
        </p>
      )}

      <div ref={list} style={{ overflow: 'auto', flex: 1, minHeight: 0 }}>
        {[thread, ...thread.replies].map((comment, index) => (
          <div key={comment.id}>
            <Message comment={comment} store={store} first={index === 0} width={anchor?.vw ?? 0} />
            {index === 0 && <Snapshot thread={thread} />}
          </div>
        ))}
      </div>

      {note && <p style={{ margin: 0, padding: '0 12px 6px', color: '#b42318', fontSize: 12 }}>{note}</p>}
      <div style={{ borderTop: `1px solid ${LINE}` }}>
        <Composer
          compact
          placeholder={resolved ? 'Reply to reopen' : 'Reply'}
          action="Reply"
          onSubmit={async (body) => (await store.reply(thread.id, body)).error ?? ''}
        />
      </div>
    </>
  );
}

/**
 * The picture of the live page at the pin, taken by the server just after the
 * thread was made. Until it lands (about ten seconds) the box says so; the
 * ten-second poll brings it in.
 */
function Snapshot({ thread }: { thread: Thread & { pending?: boolean } }) {
  const [broken, setBroken] = useState(false);
  const [givenUp, setGivenUp] = useState(false);
  const shot = thread.snapshot;
  useEffect(() => {
    if (shot.ready || shot.error) return;
    const left = SNAPSHOT_WAIT_MS - (Date.now() - Date.parse(thread.createdAt));
    const timer = window.setTimeout(() => setGivenUp(true), Math.max(0, left));
    return () => window.clearTimeout(timer);
  }, [shot.ready, shot.error, thread.createdAt]);
  const waiting = !shot.ready && !shot.error && !givenUp;
  if (shot.ready && !broken) {
    return (
      <a
        href={snapshotSrc(thread.id)}
        target="_blank"
        rel="noreferrer"
        title="Open the snapshot full size"
        style={{ display: 'block', margin: '0 12px 10px 44px', textDecoration: 'none' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- a private, signed-in image, never optimised */}
        <img
          src={snapshotSrc(thread.id)}
          alt={`The live page where comment ${thread.number} was left, with its pin`}
          onError={() => setBroken(true)}
          style={{ display: 'block', width: '100%', borderRadius: 8, border: `1px solid ${LINE}`, background: '#f3f5f8' }}
        />
        <span style={{ display: 'block', marginTop: 4, color: MUTE, fontSize: 11 }}>
          Live page when this was left{shot.takenAt ? ` · ${ago(shot.takenAt)}` : ''} · open full size
        </span>
      </a>
    );
  }
  if (waiting || thread.pending) {
    return (
      <div
        style={{
          margin: '0 12px 10px 44px', aspectRatio: '16 / 10', borderRadius: 8, border: `1px dashed ${LINE}`,
          display: 'grid', placeItems: 'center', color: MUTE, fontSize: 12, background: '#f8fafc',
          animation: 'lf-pin-in .2s ease-out',
        }}
      >
        Taking a picture of the live page…
      </div>
    );
  }
  return (
    <p style={{ margin: '0 12px 10px 44px', color: MUTE, fontSize: 11 }}>
      No snapshot{shot.error ? `: ${shot.error}` : broken ? ': it could not be loaded' : ''}.
    </p>
  );
}

function Message({ comment, store, first, width }: { comment: SiteComment & { pending?: boolean }; store: CommentStore; first: boolean; width: number }) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [note, setNote] = useState('');
  const mine = comment.author.email.toLowerCase() === store.you.toLowerCase();
  const canDelete = mine || store.owner;

  return (
    <div style={{ padding: '10px 12px', borderTop: first ? 0 : `1px solid ${LINE}`, opacity: comment.pending ? 0.6 : 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Avatar name={comment.author.name} email={comment.author.email} />
        <div style={{ minWidth: 0, lineHeight: 1.25 }}>
          <span style={{ fontWeight: 600 }}>{displayName(comment.author.name)}</span>
          {comment.author.owner && <span style={{ color: MUTE, fontSize: 11 }}> · LoudFace</span>}
          <br />
          <span style={{ color: MUTE, fontSize: 11 }} title={new Date(comment.createdAt).toLocaleString()}>
            {comment.pending ? 'Saving…' : ago(comment.createdAt)}
            {comment.editedAt ? ' · edited' : ''}
            {first && width ? ` · on a ${width}px-wide screen` : ''}
          </span>
        </div>
        <span style={{ marginLeft: 'auto' }} />
        {!editing && !comment.pending && mine && (
          <button style={iconBtn} title="Edit" aria-label="Edit comment" onClick={() => setEditing(true)}>
            <Glyph d="M4 20h4L19 9l-4-4L4 16zM14 6l4 4" size={14} />
          </button>
        )}
        {!editing && !comment.pending && canDelete && (
          <button style={iconBtn} title="Delete" aria-label="Delete comment" onClick={() => setConfirming(true)}>
            <Glyph d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" size={14} />
          </button>
        )}
      </div>

      {editing ? (
        <Composer
          compact
          autoFocus
          placeholder="Edit comment"
          action="Save"
          initial={comment.body}
          onCancel={() => setEditing(false)}
          onSubmit={async (body) => {
            const result = await store.edit(comment.id, body);
            if (!result.error) setEditing(false);
            return result.error ?? '';
          }}
        />
      ) : (
        <p style={{ margin: '6px 0 0 32px', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{comment.body}</p>
      )}

      {confirming && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0 0 32px' }}>
          <span style={{ color: MUTE, fontSize: 12 }}>{first ? 'Delete the whole thread?' : 'Delete this reply?'}</span>
          <button
            style={{ ...smallBtn, color: '#b42318', borderColor: '#f3c9c4' }}
            onClick={async () => {
              const result = await store.remove(comment.id);
              setConfirming(false);
              setNote(result.error ?? '');
            }}
          >
            Delete
          </button>
          <button style={smallBtn} onClick={() => setConfirming(false)}>
            Keep
          </button>
        </div>
      )}
      {note && <p style={{ margin: '6px 0 0 32px', color: '#b42318', fontSize: 12 }}>{note}</p>}
    </div>
  );
}

// ── The list ────────────────────────────────────────────────────────────────

export function CommentsPanel({
  store,
  page,
  showResolved,
  setShowResolved,
  onOpen,
  onGoTo,
}: {
  store: CommentStore;
  page: string;
  showResolved: boolean;
  setShowResolved: (on: boolean) => void;
  onOpen: (id: string) => void;
  onGoTo: (path: string) => void;
}) {
  const here = pageKey(page);
  const mine = store.threads.filter((t) => pageKey(t.page) === here);
  const open = mine.filter((t) => !t.resolvedAt);
  const done = mine.filter((t) => t.resolvedAt);
  const elsewhere = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of store.threads) {
      const key = pageKey(t.page);
      if (key === here || t.resolvedAt) continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts].sort((a, b) => b[1] - a[1]);
  }, [store.threads, here]);

  if (!store.ready) return <p style={quiet}>Reading comments…</p>;

  return (
    <div>
      <p style={{ ...quiet, marginBottom: 12 }}>
        Press <kbd style={kbd}>C</kbd> or the Comment button, then click anywhere on the page. Everyone who edits this site sees them.
      </p>
      {store.error && <p style={{ margin: '0 0 12px', color: '#b42318', fontSize: 12 }}>{store.error}</p>}

      <p style={groupLabel}>This page · {open.length} open</p>
      {!open.length && <p style={{ ...quiet, margin: '4px 0 12px' }}>No open comments here.</p>}
      {open.map((thread) => <Row key={thread.id} thread={thread} onOpen={onOpen} />)}

      {done.length > 0 && (
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0 8px', color: MUTE, fontSize: 12, cursor: 'pointer' }}>
          <input type="checkbox" checked={showResolved} onChange={(event) => setShowResolved(event.target.checked)} />
          Show {done.length} resolved
        </label>
      )}
      {showResolved && done.map((thread) => <Row key={thread.id} thread={thread} onOpen={onOpen} />)}

      {elsewhere.length > 0 && (
        <>
          <p style={{ ...groupLabel, marginTop: 18 }}>Other pages</p>
          {elsewhere.map(([path, count]) => (
            <button key={path} style={{ ...rowStyle, display: 'flex', alignItems: 'center' }} onClick={() => onGoTo(path)}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{path}</span>
              <span style={{ marginLeft: 'auto', color: MUTE, fontSize: 12, flexShrink: 0 }}>{count} open</span>
            </button>
          ))}
        </>
      )}
    </div>
  );
}

function Row({ thread, onOpen }: { thread: Thread; onOpen: (id: string) => void }) {
  const resolved = Boolean(thread.resolvedAt);
  return (
    <button style={rowStyle} onClick={() => onOpen(thread.id)}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          style={{
            ...pinBase, position: 'static', width: 22, height: 22, fontSize: 11, flexShrink: 0,
            background: resolved ? '#fff' : colourFor(thread.author.email), color: resolved ? MUTE : '#fff',
            border: resolved ? `1.5px solid ${LINE}` : 0, borderRadius: '11px 11px 11px 2px',
          }}
        >
          {thread.number}
        </span>
        <span style={{ fontWeight: 600 }}>{displayName(thread.author.name)}</span>
        <span style={{ color: MUTE, fontSize: 11 }}>{ago(thread.createdAt)}</span>
        {thread.replies.length > 0 && (
          <span style={{ marginLeft: 'auto', color: MUTE, fontSize: 11 }}>
            {thread.replies.length} repl{thread.replies.length === 1 ? 'y' : 'ies'}
          </span>
        )}
      </span>
      <span
        style={{
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          marginTop: 4, color: resolved ? MUTE : INK, textAlign: 'left',
        }}
      >
        {thread.body}
      </span>
      {thread.snapshot.ready && (
        // eslint-disable-next-line @next/next/no-img-element -- a private, signed-in image, never optimised
        <img
          src={snapshotSrc(thread.id)}
          alt=""
          loading="lazy"
          style={{
            display: 'block', width: '100%', height: 72, objectFit: 'cover', objectPosition: 'center 45%',
            marginTop: 8, borderRadius: 6, border: `1px solid ${LINE}`, opacity: resolved ? 0.6 : 1,
          }}
        />
      )}
    </button>
  );
}

const quiet: React.CSSProperties = { margin: 0, color: MUTE, fontSize: 12 };
const groupLabel: React.CSSProperties = {
  margin: '0 0 6px',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '.02em',
  color: MUTE,
};
const kbd: React.CSSProperties = {
  display: 'inline-block',
  padding: '0 5px',
  border: `1px solid ${LINE}`,
  borderRadius: 4,
  font: `600 11px ${FONT}`,
  color: INK,
};
const rowStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  textAlign: 'left',
  padding: '10px 10px',
  marginBottom: 6,
  border: `1px solid ${LINE}`,
  borderRadius: 10,
  background: '#fff',
  font: `13px/1.4 ${FONT}`,
  color: INK,
  cursor: 'pointer',
};

export function openCountOn(store: CommentStore, page: string): number {
  const here = pageKey(page);
  return store.threads.filter((t) => pageKey(t.page) === here && !t.resolvedAt).length;
}
