'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  PRIORITY_LABELS,
  REQUEST_TYPE_LABELS,
  REQUEST_TYPES,
  STATUS_LABELS,
  URGENCIES,
  URGENCY_LABELS,
  type ClientView,
  type ElementContext,
  type FeedbackRequest,
  type RequestType,
  type Urgency,
} from '@/lib/feedback/types';
import { formatDate, formatDateTime, pageLabel } from './format';
import styles from './feedback.module.css';

/**
 * The feedback button and panel. Loaded only for a signed-in feedback user
 * (see FeedbackLoader). Everything it renders carries data-fb-root, so the
 * picker ignores it and the screenshot leaves it out.
 */

interface Session {
  client: string;
  name: string;
  role: 'team' | 'client';
  contacts: string[];
}

const OWNER_KEY = 'lf_fb_owner';

function rememberedOwner(contacts: string[]): string | null {
  try {
    const saved = window.localStorage.getItem(OWNER_KEY);
    return saved && contacts.includes(saved) ? saved : null;
  } catch {
    return null;
  }
}

type Row = ClientView & Partial<Pick<FeedbackRequest, 'priority'>>;

interface Picked {
  element: Element;
  context: ElementContext;
}

type Tab = 'new' | 'mine';

const MAX_SHOT_EDGE = 1800;

/* ── Helpers ─────────────────────────────────────────────────────────── */

function isOurs(node: Element | null): boolean {
  return Boolean(node?.closest('[data-fb-root]'));
}

/** Short, stable CSS path: stops at the first id, else tag:nth-of-type steps. */
function selectorFor(element: Element): string {
  const steps: string[] = [];
  let node: Element | null = element;
  while (node && node !== document.body && steps.length < 8) {
    if (node.id && /^[A-Za-z][\w-]*$/.test(node.id)) {
      steps.unshift(`#${node.id}`);
      break;
    }
    const tag = node.tagName.toLowerCase();
    const parent: Element | null = node.parentElement;
    if (parent) {
      const same = Array.from(parent.children).filter((child) => child.tagName === node!.tagName);
      steps.unshift(same.length > 1 ? `${tag}:nth-of-type(${same.indexOf(node) + 1})` : tag);
    } else {
      steps.unshift(tag);
    }
    node = parent;
  }
  return steps.join(' > ');
}

/** Pointing at an icon path or a word should pick the thing it belongs to. */
function usefulTarget(element: Element): Element {
  let node: Element = element;
  if (node instanceof SVGElement && node.ownerSVGElement) node = node.ownerSVGElement;
  while (node.parentElement && node.parentElement !== document.body) {
    const rect = node.getBoundingClientRect();
    if (rect.width >= 48 && rect.height >= 24) break;
    node = node.parentElement;
  }
  return node;
}

function contextFor(element: Element): ElementContext {
  const rect = element.getBoundingClientRect();
  const text = ((element as HTMLElement).innerText ?? element.textContent ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200);
  return {
    selector: selectorFor(element),
    text,
    rect: {
      x: Math.round(rect.left + window.scrollX),
      y: Math.round(rect.top + window.scrollY),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    },
  };
}

function isOpaque(color: string): boolean {
  return color !== 'transparent' && !/rgba\([^)]*,\s*0\)$/.test(color);
}

/** First ancestor that paints its own background: the section the team needs for context. */
function contextBox(element: Element): { box: Element; background: string } {
  let node: Element | null = element;
  while (node && node !== document.body) {
    const style = getComputedStyle(node);
    const paints = isOpaque(style.backgroundColor) || style.backgroundImage !== 'none';
    const rect = node.getBoundingClientRect();
    if (paints && rect.height <= window.innerHeight * 3) {
      return { box: node, background: isOpaque(style.backgroundColor) ? style.backgroundColor : '#1a1040' };
    }
    node = node.parentElement;
  }
  const bodyColor = getComputedStyle(document.body).backgroundColor;
  return { box: element, background: isOpaque(bodyColor) ? bodyColor : '#ffffff' };
}

/**
 * Screenshot of the section around the picked element, with the element
 * outlined, so the team sees what was meant and where it sits.
 */
async function captureElement(element: Element): Promise<string | null> {
  try {
    const { domToCanvas } = await import('modern-screenshot');
    const { box, background } = contextBox(element);
    const boxRect = box.getBoundingClientRect();
    const target = element.getBoundingClientRect();
    const longest = Math.max(boxRect.width, boxRect.height, 1);
    const scale = Math.min(window.devicePixelRatio || 1, MAX_SHOT_EDGE / longest, 2);

    const capture = domToCanvas(box, {
      scale,
      backgroundColor: background,
      filter: (node) => !(node instanceof Element && node.hasAttribute('data-fb-root')),
    });
    const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 10_000));
    const canvas = await Promise.race([capture, timeout]);
    if (!canvas) return null;

    if (box !== element) {
      const context = canvas.getContext('2d');
      if (context) {
        const pad = 4;
        context.lineWidth = Math.max(3, 3 * scale);
        context.strokeStyle = '#ff4d4f';
        context.strokeRect(
          (target.left - boxRect.left - pad) * scale,
          (target.top - boxRect.top - pad) * scale,
          (target.width + pad * 2) * scale,
          (target.height + pad * 2) * scale
        );
      }
    }
    return canvas.toDataURL('image/jpeg', 0.8);
  } catch (error) {
    console.warn('[feedback] screenshot failed', error);
    return null;
  }
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
    cache: 'no-store',
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body?.error ?? 'Something went wrong. Try again.');
  return body as T;
}

/* ── Component ───────────────────────────────────────────────────────── */

export default function FeedbackWidget() {
  const [session, setSession] = useState<Session | null>(null);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('new');

  const [picking, setPicking] = useState(false);
  const [hoverRect, setHoverRect] = useState<DOMRect | null>(null);
  const [picked, setPicked] = useState<Picked | null>(null);
  const [shot, setShot] = useState<string | null>(null);
  const [shotState, setShotState] = useState<'none' | 'capturing' | 'done' | 'failed'>('none');

  const [type, setType] = useState<RequestType | null>(null);
  const [urgency, setUrgency] = useState<Urgency | null>(null);
  const [owner, setOwner] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentRef, setSentRef] = useState<string | null>(null);

  const [rows, setRows] = useState<Row[] | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [focusRect, setFocusRect] = useState<DOMRect | null>(null);

  const hoverTarget = useRef<Element | null>(null);

  /* Who is signed in. A 404 means the cookie is not valid: stay invisible. */
  useEffect(() => {
    api<Session>('/api/feedback/session')
      .then((value) => {
        setSession(value);
        // Most clients talk to the same person every time: start from their last pick.
        setOwner(rememberedOwner(value.contacts));
      })
      .catch(() => setSession(null));
  }, []);

  const loadRows = useCallback(async () => {
    try {
      const { requests } = await api<{ requests: Row[] }>('/api/feedback/requests');
      setRows(requests);
    } catch {
      setRows([]);
    }
  }, []);

  useEffect(() => {
    if (session && open && tab === 'mine') void loadRows();
  }, [session, open, tab, loadRows]);

  /* ?fb_focus=<id> — the team board's "Open on page" link. */
  useEffect(() => {
    if (!session) return;
    const id = new URLSearchParams(window.location.search).get('fb_focus');
    if (!id) return;
    api<{ request: Row }>(`/api/feedback/requests/${id}`)
      .then(({ request }) => {
        const selector = request.element?.selector;
        const target = selector ? document.querySelector(selector) : null;
        if (!target) return;
        target.scrollIntoView({ block: 'center', behavior: 'smooth' });
        const show = () => setFocusRect(target.getBoundingClientRect());
        setTimeout(show, 600);
        setTimeout(() => setFocusRect(null), 5000);
      })
      .catch(() => undefined);
  }, [session]);

  /* The picker: hover highlights, click picks, Escape cancels. The page
     underneath gets no clicks while it runs. */
  useEffect(() => {
    if (!picking) return;
    let frame = 0;

    const targetAt = (x: number, y: number) => {
      const element = document.elementFromPoint(x, y);
      if (!element || isOurs(element) || element === document.documentElement || element === document.body) {
        return null;
      }
      return usefulTarget(element);
    };

    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const target = targetAt(event.clientX, event.clientY);
        hoverTarget.current = target;
        setHoverRect(target ? target.getBoundingClientRect() : null);
      });
    };

    const block = (event: Event) => {
      if (isOurs(event.target as Element)) return;
      event.preventDefault();
      event.stopPropagation();
    };

    const onClick = (event: MouseEvent) => {
      if (isOurs(event.target as Element)) return;
      event.preventDefault();
      event.stopPropagation();
      const target = targetAt(event.clientX, event.clientY) ?? hoverTarget.current;
      if (target) choose(target);
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPicking(false);
        setHoverRect(null);
        setOpen(true);
      }
    };

    document.addEventListener('pointermove', onMove, true);
    document.addEventListener('pointerdown', block, true);
    document.addEventListener('mousedown', block, true);
    document.addEventListener('mouseup', block, true);
    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', onKey, true);
    document.documentElement.classList.add(styles.pickingCursor);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('pointermove', onMove, true);
      document.removeEventListener('pointerdown', block, true);
      document.removeEventListener('mousedown', block, true);
      document.removeEventListener('mouseup', block, true);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('keydown', onKey, true);
      document.documentElement.classList.remove(styles.pickingCursor);
    };
  }, [picking]);

  async function choose(element: Element) {
    setPicking(false);
    setHoverRect(null);
    setPicked({ element, context: contextFor(element) });
    setOpen(true);
    setShot(null);
    setShotState('capturing');
    const image = await captureElement(element);
    setShot(image);
    setShotState(image ? 'done' : 'failed');
  }

  function startPicking() {
    setError(null);
    setSentRef(null);
    setOpen(false);
    setPicking(true);
  }

  function widen() {
    const parent = picked?.element.parentElement;
    if (parent && parent !== document.body && parent !== document.documentElement) void choose(parent);
  }

  function clearPicked() {
    setPicked(null);
    setShot(null);
    setShotState('none');
  }

  function resetForm() {
    clearPicked();
    setType(null);
    setUrgency(null);
    setNote('');
  }

  async function send() {
    if (!type) return setError('Pick a request type.');
    if (!urgency) return setError('Pick how urgent it is.');
    if (!owner) return setError('Pick who should handle it.');
    if (!note.trim()) return setError('Write a short note.');
    setSending(true);
    setError(null);
    try {
      const { request } = await api<{ request: Row }>('/api/feedback/requests', {
        method: 'POST',
        body: JSON.stringify({
          type,
          urgency,
          owner,
          note,
          page: { url: window.location.href, path: window.location.pathname, title: document.title },
          element: picked?.context ?? null,
          device: {
            user_agent: navigator.userAgent,
            viewport: { width: window.innerWidth, height: window.innerHeight },
            pixel_ratio: window.devicePixelRatio || 1,
          },
          screenshot: shot,
        }),
      });
      setSentRef(request.ref);
      try {
        window.localStorage.setItem(OWNER_KEY, owner);
      } catch {
        // Remembering the pick is a convenience only.
      }
      resetForm();
      setRows(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  }

  async function sendReply(id: string) {
    if (!reply.trim()) return;
    try {
      const { request } = await api<{ request: Row }>(`/api/feedback/requests/${id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ body: reply }),
      });
      setRows((current) => current?.map((row) => (row.id === id ? request : row)) ?? current);
      setReply('');
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function review(id: string, decision: 'approve' | 'reopen') {
    if (decision === 'reopen' && !reply.trim()) {
      return setError('Write what is still not right, then press "Still not right".');
    }
    setError(null);
    try {
      const { request } = await api<{ request: Row }>(`/api/feedback/requests/${id}/review`, {
        method: 'POST',
        body: JSON.stringify({ decision, body: reply }),
      });
      setRows((current) => current?.map((row) => (row.id === id ? request : row)) ?? current);
      setReply('');
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function exit() {
    await fetch('/api/feedback/exit', { method: 'POST' }).catch(() => undefined);
    window.location.reload();
  }

  if (!session) return null;

  const detail = rows?.find((row) => row.id === detailId) ?? null;
  const openCount = rows?.filter((row) => row.status !== 'done' && row.status !== 'wont_do').length;

  return (
    <div data-fb-root className={styles.root}>
      {hoverRect && (
        <div
          className={styles.highlight}
          style={{ top: hoverRect.top, left: hoverRect.left, width: hoverRect.width, height: hoverRect.height }}
        />
      )}
      {focusRect && (
        <div
          className={`${styles.highlight} ${styles.focus}`}
          style={{ top: focusRect.top, left: focusRect.left, width: focusRect.width, height: focusRect.height }}
        />
      )}

      {picking && (
        <div className={styles.pickBar} role="status">
          <span>Click the part of the page you mean.</span>
          <button
            type="button"
            className={styles.textButton}
            onClick={() => {
              setPicking(false);
              setHoverRect(null);
              setOpen(true);
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {!picking && !open && (
        <button
          type="button"
          className={`${styles.launcher} lf-lifts-for-consent`}
          onClick={() => setOpen(true)}
          aria-label="Open feedback"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4A2.5 2.5 0 0 1 4 13.5v-8Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
          Feedback
        </button>
      )}

      {open && !picking && (
        <section className={styles.panel} aria-label="Feedback">
          <header className={styles.panelHead}>
            <div className={styles.tabs} role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'new'}
                className={tab === 'new' ? styles.tabOn : styles.tab}
                onClick={() => setTab('new')}
              >
                New request
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'mine'}
                className={tab === 'mine' ? styles.tabOn : styles.tab}
                onClick={() => {
                  setTab('mine');
                  setDetailId(null);
                }}
              >
                My requests{openCount ? ` (${openCount})` : ''}
              </button>
            </div>
            <button type="button" className={styles.close} onClick={() => setOpen(false)} aria-label="Close">
              ×
            </button>
          </header>

          <div className={styles.body}>
            {tab === 'new' && (
              <>
                {sentRef && (
                  <p className={styles.success}>
                    Sent. Your reference is <strong>{sentRef}</strong>. You can follow it under My requests.
                  </p>
                )}

                <div className={styles.field}>
                  <span className={styles.label}>Where</span>
                  {picked ? (
                    <div className={styles.picked}>
                      {shotState === 'capturing' && <div className={styles.shotPending}>Taking a screenshot…</div>}
                      {shotState === 'done' && shot && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={shot} alt="Screenshot of the selected section" className={styles.shot} />
                      )}
                      {shotState === 'failed' && (
                        <div className={styles.shotPending}>No screenshot this time. The team still sees the exact section.</div>
                      )}
                      <p className={styles.pickedText}>
                        {picked.context.text ? `“${picked.context.text.slice(0, 90)}${picked.context.text.length > 90 ? '…' : ''}”` : 'Selected section'}
                      </p>
                      <div className={styles.row}>
                        <button type="button" className={styles.textButton} onClick={widen}>
                          Select a larger area
                        </button>
                        <button type="button" className={styles.textButton} onClick={startPicking}>
                          Pick again
                        </button>
                        <button type="button" className={styles.textButton} onClick={clearPicked}>
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.row}>
                      <button type="button" className={styles.secondary} onClick={startPicking}>
                        Point at the page
                      </button>
                      <span className={styles.hint}>or leave it empty for a general request</span>
                    </div>
                  )}
                </div>

                <div className={styles.field}>
                  <span className={styles.label}>Type</span>
                  <div className={styles.chips}>
                    {REQUEST_TYPES.map((value) => (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={type === value}
                        className={type === value ? styles.chipOn : styles.chip}
                        onClick={() => setType(value)}
                      >
                        {REQUEST_TYPE_LABELS[value]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.field}>
                  <span className={styles.label}>How urgent</span>
                  <div className={styles.chips}>
                    {URGENCIES.map((value) => (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={urgency === value}
                        className={urgency === value ? styles.chipOn : styles.chip}
                        onClick={() => setUrgency(value)}
                      >
                        {URGENCY_LABELS[value]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.field}>
                  <span className={styles.label}>Who should handle it?</span>
                  <div className={styles.chips}>
                    {session.contacts.map((name) => (
                      <button
                        key={name}
                        type="button"
                        aria-pressed={owner === name}
                        className={owner === name ? styles.chipOn : styles.chip}
                        onClick={() => setOwner(name)}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>

                <label className={styles.field}>
                  <span className={styles.label}>What should change?</span>
                  <textarea
                    className={styles.textarea}
                    rows={4}
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="For example: the button text should say “Book a call”."
                  />
                </label>

                {error && <p className={styles.error}>{error}</p>}

                <button type="button" className={styles.primary} onClick={send} disabled={sending || shotState === 'capturing'}>
                  {sending ? 'Sending…' : 'Send request'}
                </button>
              </>
            )}

            {tab === 'mine' && !detail && (
              <>
                {rows === null && <p className={styles.hint}>Loading…</p>}
                {rows?.length === 0 && <p className={styles.hint}>No requests yet.</p>}
                <ul className={styles.list}>
                  {rows?.map((row) => (
                    <li key={row.id}>
                      <button type="button" className={styles.listItem} onClick={() => setDetailId(row.id)}>
                        <span className={styles.listTop}>
                          <span className={styles.ref}>{row.ref}</span>
                          <span className={`${styles.status} ${styles[`s_${row.status}`]}`}>{STATUS_LABELS[row.status]}</span>
                        </span>
                        <span className={styles.listNote}>{row.note}</span>
                        <span className={styles.listMeta}>
                          {REQUEST_TYPE_LABELS[row.type]} · {pageLabel(row.page?.path)} · {formatDate(row.created_at)}
                          {row.due_date ? ` · due ${formatDate(row.due_date)}` : ''}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {tab === 'mine' && detail && (
              <div className={styles.detail}>
                <button type="button" className={styles.textButton} onClick={() => setDetailId(null)}>
                  ← All requests
                </button>
                <div className={styles.listTop}>
                  <span className={styles.ref}>{detail.ref}</span>
                  <span className={`${styles.status} ${styles[`s_${detail.status}`]}`}>{STATUS_LABELS[detail.status]}</span>
                </div>
                <dl className={styles.facts}>
                  <dt>Type</dt>
                  <dd>{REQUEST_TYPE_LABELS[detail.type]}</dd>
                  <dt>Urgency</dt>
                  <dd>{URGENCY_LABELS[detail.urgency]}</dd>
                  <dt>Page</dt>
                  <dd>{pageLabel(detail.page?.path)}</dd>
                  <dt>Handled by</dt>
                  <dd>{detail.owner ?? 'Not assigned yet'}</dd>
                  <dt>Expected</dt>
                  <dd>{detail.due_date ? formatDate(detail.due_date) : 'Not set yet'}</dd>
                  {session.role === 'team' && (
                    <>
                      <dt>Priority</dt>
                      <dd>{detail.priority ? PRIORITY_LABELS[detail.priority] : 'Not set'}</dd>
                    </>
                  )}
                </dl>
                <p className={styles.detailNote}>{detail.note}</p>
                {detail.has_screenshot && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/feedback/requests/${detail.id}/screenshot`}
                    alt="Screenshot sent with this request"
                    className={styles.shot}
                  />
                )}
                <div className={styles.thread}>
                  {detail.comments.map((comment) => (
                    <div key={comment.id} className={comment.author.role === 'team' ? styles.msgTeam : styles.msg}>
                      <span className={styles.msgHead}>
                        {comment.author.name} · {formatDateTime(comment.created_at)}
                      </span>
                      {comment.body}
                    </div>
                  ))}
                </div>
                {detail.status === 'ready_for_review' && (
                  <div className={styles.review}>
                    <p className={styles.reviewText}>
                      {detail.owner ?? 'The team'} marked this as ready. Check it on the page, then tell us.
                    </p>
                    <div className={styles.row}>
                      <button type="button" className={styles.primary} onClick={() => review(detail.id, 'approve')}>
                        Looks good
                      </button>
                      <button type="button" className={styles.secondary} onClick={() => review(detail.id, 'reopen')}>
                        Still not right
                      </button>
                    </div>
                    <p className={styles.hint}>For &ldquo;Still not right&rdquo;, write what is wrong in the box below first.</p>
                  </div>
                )}
                <textarea
                  className={styles.textarea}
                  rows={2}
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  placeholder="Write a reply"
                />
                {error && <p className={styles.error}>{error}</p>}
                <button type="button" className={styles.secondary} onClick={() => sendReply(detail.id)}>
                  Send reply
                </button>
              </div>
            )}
          </div>

          <footer className={styles.foot}>
            <span>
              Signed in as {session.name}
              {session.role === 'team' ? ' (team)' : ''}
            </span>
            <span className={styles.row}>
              {session.role === 'team' && (
                <a className={styles.textButton} href="/feedback/board">
                  Team board
                </a>
              )}
              <button type="button" className={styles.textButton} onClick={exit}>
                Leave feedback mode
              </button>
            </span>
          </footer>
        </section>
      )}
    </div>
  );
}
