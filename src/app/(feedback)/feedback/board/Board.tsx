'use client';

import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import {
  PRIORITIES,
  PRIORITY_LABELS,
  REQUEST_TYPE_LABELS,
  REQUEST_TYPES,
  STATUSES,
  STATUS_LABELS,
  URGENCIES,
  URGENCY_LABELS,
  type FeedbackRequest,
  type RequestStatus,
  type TeamUpdate,
} from '@/lib/feedback/types';
import { formatDate, formatDateTime, pageLabel } from '@/components/feedback/format';
import styles from './board.module.css';

/**
 * The team board. One set of records, three ways to look at it:
 *   - Status: a column per step, for daily triage.
 *   - Pages:  grouped by client, then by page, to batch work on one page.
 *   - List:   one row per request, for scanning and sorting.
 * Filters narrow every view. Edits save as soon as a field changes.
 */

type View = 'status' | 'pages' | 'list';

const CLOSED: RequestStatus[] = ['done', 'wont_do'];
const URGENCY_RANK = { urgent: 0, this_week: 1, no_rush: 2 } as const;
const PRIORITY_RANK = { high: 0, medium: 1, low: 2 } as const;

/** Urgent and high-priority first, then the oldest: the order to work in. */
function triageOrder(a: FeedbackRequest, b: FeedbackRequest): number {
  const pa = a.priority ? PRIORITY_RANK[a.priority] : 3;
  const pb = b.priority ? PRIORITY_RANK[b.priority] : 3;
  if (pa !== pb) return pa - pb;
  const ua = URGENCY_RANK[a.urgency];
  const ub = URGENCY_RANK[b.urgency];
  if (ua !== ub) return ua - ub;
  return a.created_at.localeCompare(b.created_at);
}

/** Past its delivery date and still open. Dates compare as YYYY-MM-DD strings. */
function isOverdue(r: FeedbackRequest, today: string): boolean {
  return Boolean(r.due_date) && r.due_date! < today && !CLOSED.includes(r.status);
}

export function Board({
  initial,
  me,
  contacts,
}: {
  initial: FeedbackRequest[];
  me: string;
  contacts: Record<string, string[]>;
}) {
  const [today] = useState(() => new Date().toISOString().slice(0, 10));
  const [requests, setRequests] = useState(initial);
  const [view, setView] = useState<View>('status');
  const [client, setClient] = useState('all');
  const [type, setType] = useState('all');
  const [urgency, setUrgency] = useState('all');
  const [owner, setOwner] = useState('all');
  const [showClosed, setShowClosed] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [error, setError] = useState<string | null>(null);

  const clients = useMemo(() => Array.from(new Set(requests.map((r) => r.client_slug))).sort(), [requests]);
  const owners = useMemo(
    () => Array.from(new Set(requests.map((r) => r.owner).filter((o): o is string => Boolean(o)))).sort(),
    [requests]
  );

  const visible = useMemo(
    () =>
      requests
        .filter((r) => client === 'all' || r.client_slug === client)
        .filter((r) => type === 'all' || r.type === type)
        .filter((r) => urgency === 'all' || r.urgency === urgency)
        .filter((r) => owner === 'all' || (owner === 'none' ? !r.owner : r.owner === owner))
        .filter((r) => showClosed || view === 'status' || !CLOSED.includes(r.status))
        .sort(triageOrder),
    [requests, client, type, urgency, owner, showClosed, view]
  );

  const selected = requests.find((r) => r.id === selectedId) ?? null;
  const newCount = requests.filter((r) => r.status === 'new').length;
  const urgentOpen = requests.filter((r) => r.urgency === 'urgent' && !CLOSED.includes(r.status)).length;
  const overdue = requests.filter((r) => isOverdue(r, today)).length;

  function replace(next: FeedbackRequest) {
    setRequests((current) => current.map((r) => (r.id === next.id ? next : r)));
  }

  // Edits go out one at a time, in the order they were made.
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  function save(id: string, change: TeamUpdate) {
    queue.current = queue.current.then(() => send(id, change));
  }

  async function send(id: string, change: TeamUpdate) {
    setError(null);
    const response = await fetch(`/api/feedback/requests/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(change),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) return setError(body.error ?? 'The change did not save.');
    replace(body.request);
  }

  async function sendReply(id: string) {
    if (!reply.trim()) return;
    const response = await fetch(`/api/feedback/requests/${id}/comments`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ body: reply }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) return setError(body.error ?? 'The reply did not send.');
    replace(body.request);
    setReply('');
  }

  const card = (r: FeedbackRequest) => (
    <button
      key={r.id}
      type="button"
      className={`${styles.card} ${r.id === selectedId ? styles.cardOn : ''}`}
      onClick={() => setSelectedId(r.id)}
    >
      <span className={styles.cardTop}>
        <span className={styles.ref}>{r.ref}</span>
        <span className={styles.badges}>
          {isOverdue(r, today) && <span className={styles.overdue}>Overdue</span>}
          <span className={`${styles.urgency} ${styles[`u_${r.urgency}`]}`}>{URGENCY_LABELS[r.urgency]}</span>
        </span>
      </span>
      <span className={styles.cardNote}>{r.note}</span>
      <span className={styles.meta}>
        {REQUEST_TYPE_LABELS[r.type]} · {pageLabel(r.page?.path)}
      </span>
      <span className={styles.meta}>
        {r.owner ?? 'No owner'}
        {r.priority ? ` · ${PRIORITY_LABELS[r.priority]}` : ''}
        {r.due_date ? ` · due ${formatDate(r.due_date)}` : ''}
      </span>
    </button>
  );

  const pageGroups = useMemo(() => {
    const groups = new Map<string, FeedbackRequest[]>();
    for (const r of visible) {
      const key = `${r.client_slug}|${pageLabel(r.page?.path)}`;
      groups.set(key, [...(groups.get(key) ?? []), r]);
    }
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [visible]);

  return (
    <div className={styles.root}>
      <header className={styles.top}>
        <div>
          <h1 className={styles.title}>Client requests</h1>
          <p className={styles.sub}>
            {requests.length} total · {newCount} new · {urgentOpen} urgent and open · {overdue} overdue · signed in as {me}
          </p>
        </div>
        <div className={styles.topActions}>
          <a className={styles.link} href="/api/feedback/export">
            Export (JSON)
          </a>
          <Link className={styles.link} href="/">
            Back to the site
          </Link>
        </div>
      </header>

      <div className={styles.toolbar}>
        <div className={styles.segment} role="tablist" aria-label="View">
          {(['status', 'pages', 'list'] as const).map((v) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={view === v}
              className={view === v ? styles.segOn : styles.seg}
              onClick={() => setView(v)}
            >
              {v === 'status' ? 'By status' : v === 'pages' ? 'By page' : 'List'}
            </button>
          ))}
        </div>
        <select className={styles.select} value={client} onChange={(e) => setClient(e.target.value)} aria-label="Client">
          <option value="all">All clients</option>
          {clients.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select className={styles.select} value={type} onChange={(e) => setType(e.target.value)} aria-label="Type">
          <option value="all">All types</option>
          {REQUEST_TYPES.map((t) => (
            <option key={t} value={t}>
              {REQUEST_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
        <select className={styles.select} value={urgency} onChange={(e) => setUrgency(e.target.value)} aria-label="Urgency">
          <option value="all">Any urgency</option>
          {URGENCIES.map((u) => (
            <option key={u} value={u}>
              {URGENCY_LABELS[u]}
            </option>
          ))}
        </select>
        <select className={styles.select} value={owner} onChange={(e) => setOwner(e.target.value)} aria-label="Owner">
          <option value="all">Any owner</option>
          <option value="none">No owner</option>
          {owners.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        {view !== 'status' && (
          <label className={styles.check}>
            <input type="checkbox" checked={showClosed} onChange={(e) => setShowClosed(e.target.checked)} /> Show done
          </label>
        )}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.main}>
        <div className={styles.content}>
          {requests.length === 0 && (
            <p className={styles.empty}>No requests yet. Open the site with the feedback link and send the first one.</p>
          )}

          {view === 'status' && requests.length > 0 && (
            <div className={styles.columns}>
              {STATUSES.map((s) => {
                const items = visible.filter((r) => r.status === s);
                return (
                  <section key={s} className={styles.column}>
                    <h2 className={styles.colHead}>
                      {STATUS_LABELS[s]} <span>{items.length}</span>
                    </h2>
                    {items.map(card)}
                  </section>
                );
              })}
            </div>
          )}

          {view === 'pages' &&
            pageGroups.map(([key, items]) => {
              const [slug, path] = key.split('|');
              return (
                <section key={key} className={styles.group}>
                  <h2 className={styles.groupHead}>
                    <span className={styles.ref}>{slug}</span> {path} <span>{items.length}</span>
                  </h2>
                  <div className={styles.groupGrid}>{items.map(card)}</div>
                </section>
              );
            })}

          {view === 'list' && visible.length > 0 && (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Ref</th>
                  <th>Request</th>
                  <th>Page</th>
                  <th>Type</th>
                  <th>Urgency</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Owner</th>
                  <th>Due</th>
                  <th>Sent</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => (
                  <tr key={r.id} onClick={() => setSelectedId(r.id)} className={r.id === selectedId ? styles.rowOn : ''}>
                    <td className={styles.ref}>{r.ref}</td>
                    <td className={styles.tdNote}>{r.note}</td>
                    <td>{pageLabel(r.page?.path)}</td>
                    <td>{REQUEST_TYPE_LABELS[r.type]}</td>
                    <td>{URGENCY_LABELS[r.urgency]}</td>
                    <td>{STATUS_LABELS[r.status]}</td>
                    <td>{r.priority ? PRIORITY_LABELS[r.priority] : '—'}</td>
                    <td>{r.owner ?? '—'}</td>
                    <td className={isOverdue(r, today) ? styles.overdueText : ''}>{r.due_date ? formatDate(r.due_date) : '—'}</td>
                    <td>{formatDate(r.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {selected && (
          <aside className={styles.drawer} aria-label={`Request ${selected.ref}`}>
            <div className={styles.drawerHead}>
              <span className={styles.ref}>
                {selected.ref} · {selected.client_slug}
              </span>
              <button type="button" className={styles.close} onClick={() => setSelectedId(null)} aria-label="Close">
                ×
              </button>
            </div>

            <p className={styles.note}>{selected.note}</p>

            <div className={styles.edit}>
              <label>
                Status
                <select value={selected.status} onChange={(e) => save(selected.id, { status: e.target.value as RequestStatus })}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Priority
                <select
                  value={selected.priority ?? ''}
                  onChange={(e) => save(selected.id, { priority: (e.target.value || null) as TeamUpdate['priority'] })}
                >
                  <option value="">Not set</option>
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {PRIORITY_LABELS[p]}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Owner
                <select
                  value={selected.owner ?? ''}
                  onChange={(e) => save(selected.id, { owner: e.target.value || null })}
                >
                  <option value="">Nobody yet</option>
                  {Array.from(
                    new Set([...(contacts[selected.client_slug] ?? []), ...(selected.owner ? [selected.owner] : [])])
                  ).map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Expected delivery
                <input
                  type="date"
                  value={selected.due_date ?? ''}
                  onChange={(e) => save(selected.id, { due_date: e.target.value || null })}
                />
              </label>
              <label>
                Type
                <select
                  value={selected.type}
                  onChange={(e) => save(selected.id, { type: e.target.value as FeedbackRequest['type'] })}
                >
                  {REQUEST_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {REQUEST_TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Urgency
                <select
                  value={selected.urgency}
                  onChange={(e) => save(selected.id, { urgency: e.target.value as FeedbackRequest['urgency'] })}
                >
                  {URGENCIES.map((u) => (
                    <option key={u} value={u}>
                      {URGENCY_LABELS[u]}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {selected.has_screenshot && (
              // eslint-disable-next-line @next/next/no-img-element
              <img className={styles.shot} src={`/api/feedback/requests/${selected.id}/screenshot`} alt="Screenshot sent with the request" />
            )}

            <dl className={styles.facts}>
              <dt>Page</dt>
              <dd>
                {selected.page ? (
                  <a
                    className={styles.link}
                    href={`${selected.page.path}?fb_focus=${selected.id}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {pageLabel(selected.page.path)} — open at the section
                  </a>
                ) : (
                  'General request'
                )}
              </dd>
              {selected.element?.text && (
                <>
                  <dt>Section text</dt>
                  <dd>“{selected.element.text.slice(0, 140)}”</dd>
                </>
              )}
              <dt>Sent by</dt>
              <dd>
                {selected.created_by.name} · {formatDateTime(selected.created_at)}
              </dd>
              {selected.device && (
                <>
                  <dt>Screen</dt>
                  <dd>
                    {selected.device.viewport.width}×{selected.device.viewport.height} · {selected.device.user_agent}
                  </dd>
                </>
              )}
            </dl>

            <h3 className={styles.h3}>Thread</h3>
            <div className={styles.thread}>
              {selected.comments.length === 0 && <p className={styles.meta}>No replies yet.</p>}
              {selected.comments.map((c) => (
                <div key={c.id} className={c.author.role === 'team' ? styles.msgTeam : styles.msg}>
                  <span className={styles.meta}>
                    {c.author.name} · {formatDateTime(c.created_at)}
                  </span>
                  {c.body}
                </div>
              ))}
              <textarea
                className={styles.textarea}
                rows={2}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Reply to the client"
              />
              <button type="button" className={styles.button} onClick={() => sendReply(selected.id)}>
                Send reply
              </button>
            </div>

            <h3 className={styles.h3}>History</h3>
            <ul className={styles.history}>
              {selected.events
                .slice()
                .reverse()
                .map((ev, i) => (
                  <li key={i}>
                    {formatDateTime(ev.at)} · {ev.by.name}:{' '}
                    {ev.field === 'created' ? 'sent the request' : `${ev.field.replace('_', ' ')} ${ev.from ?? '—'} → ${ev.to ?? '—'}`}
                  </li>
                ))}
            </ul>
          </aside>
        )}
      </div>
    </div>
  );
}
