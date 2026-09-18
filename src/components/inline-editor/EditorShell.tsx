'use client';

/**
 * The editor shell — the frame a signed-in client sees around their own site.
 *
 * It owns no editing logic. The brain stays in InlineEditor.tsx: discovery,
 * staging, publishing, the status light. This file is the surface that brain is
 * shown on — a top bar, a rail of four panels, and a framed canvas the site
 * itself scrolls inside.
 *
 * Four panels: Pages, History, Editors, Settings. Pages is the sitemap as a
 * list, and it is the one way to get from one page of the site to another
 * without leaving the editor — the site's own menu does not reach every page,
 * and a client asked for it back. Media and the health rows stay out: every
 * picture Media listed is one the client can click on the page, and the health
 * rows answer a question LoudFace asks (`/api/lf-edit/health`, still there),
 * never the client.
 *
 * The canvas is the scroll container on purpose. The site's header is
 * `sticky top-0`, and a sticky element sticks to its nearest scrolling
 * ancestor; with the document scrolling it would stick to the viewport and sit
 * over the editor bar. Scrolling inside the canvas puts it under the bar, where
 * a client expects it.
 *
 * Every surface here carries `data-lf-chrome` so discovery skips it: the editor
 * must never offer its own words as editable text. The root does NOT carry it —
 * the site sits inside the root, and one marker there would make discovery skip
 * the whole page.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { undoneSummary } from '../../lib/inline-edit/publish-history';

export type ShellTone = 'ok' | 'busy' | 'bad' | 'idle';
/** What the status light says, in the short form the bar has room for. */
export type ShellStatus = { tone: ShellTone; text: string; title?: string };
export type ShellPublish = {
  hash: string;
  date: string;
  editor: string;
  summary: string;
  fields: string[];
  reverted: boolean;
};
type Invited = { email: string; addedBy: string; addedAt: string };
/** `owner` says whether the person reading the panel may change the list at all. */
type Access = { owners: { email: string }[]; editors: Invited[]; you: string; owner: boolean };
/** One route from the sitemap, as the Pages panel lists it. */
type Route = { path: string; group: string };

export type EditorShellProps = {
  children: React.ReactNode;
  status: ShellStatus;
  pendingCount: number;
  editableCount: number;
  onPublish: () => void;
  onDiscard: () => void;
  canUndo: boolean;
  onUndo: () => void;
  showAll: boolean;
  onShowAll: (on: boolean) => void;
  publishes: ShellPublish[] | null;
  onOpenHistory: () => void;
  onUndoPublish: (hash: string, doneWord?: string) => void;
  /** Popovers that must sit above the canvas: the link panel, the image panel, the file picker. */
  overlays?: React.ReactNode;
};

const INK = '#14212b';
const MUTE = '#5b6b7a';
const LINE = '#e6ebf0';
const BRAND = '#4f46e5';
const PAGE = '#f3f5f8';
const FONT = 'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif';
const TOP = 52;
const RAIL = 60;
const PANEL_WIDTH = 320;
const Z = 2147483000;
const AVATAR_COLOURS = ['#4f46e5', '#0ea5e9', '#f97316', '#16a34a', '#db2777'];

type Tab = 'pages' | 'history' | 'editors' | 'settings';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'pages', label: 'Pages', icon: <Icon d="M4 5h16v14H4zM4 10h16" /> },
  { id: 'history', label: 'History', icon: <Icon d="M3 12a9 9 0 1 0 3-6.7M3 3v5h5M12 7v5l3 2" /> },
  {
    id: 'editors',
    label: 'Editors',
    icon: (
      <Icon>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.5 20a6.5 6.5 0 0 1 13 0M17 11a3 3 0 1 0 0-6M21.5 20a6 6 0 0 0-4.5-5.8" />
      </Icon>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: (
      <Icon>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
      </Icon>
    ),
  },
];

/** The eye in the top bar, open when the dotted outlines are on. */
const EYE_OPEN = 'M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z';
const EYE_SHUT = 'M3 3l18 18M10.6 6.1A9.9 9.9 0 0 1 12 6c6.4 0 10 6 10 6a17 17 0 0 1-3.6 4.2M6.3 7.9A17 17 0 0 0 2 12s3.6 6 10 6a10 10 0 0 0 3.2-.5';

function Icon({ d, children, size = 18 }: { d?: string; children?: React.ReactNode; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      style={{ stroke: 'currentColor', fill: 'none', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }}
      aria-hidden="true"
    >
      {d ? <path d={d} /> : children}
    </svg>
  );
}

/** Initials for an avatar: "arnel@loudface.co" reads as AL, "jo" as JO. */
function initials(email: string): string {
  const name = email.split('@')[0] ?? '';
  const parts = name.split(/[._-]+/).filter(Boolean);
  if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (name.slice(0, 2) || '?').toUpperCase();
}

/** "arnel@loudface.co" → "Arnel", which is what a person calls themselves. */
function firstName(email: string): string {
  const name = (email.split('@')[0] ?? '').split(/[._-]+/)[0] ?? '';
  return name ? name[0].toUpperCase() + name.slice(1) : 'you';
}

/**
 * The page's own name for the breadcrumb: the page title with the site's own
 * suffix taken off, and with the SEO tail after it dropped. A title tag is
 * written for a search result ("About LoudFace — AI-Native B2B SaaS Organic
 * Growth"); the bar has room for the name of the page.
 */
function pageTitle(): string {
  const raw = (typeof document === 'undefined' ? '' : document.title) || '';
  const first = raw.split(/\s+[|·—–]\s+/)[0] ?? raw;
  const short = first.replace(/\s*\bLoudFace\b\s*$/i, '').trim() || first.trim();
  return (short.length > 34 ? `${short.slice(0, 33)}…` : short) || 'This page';
}

/** Every route in the sitemap, as paths grouped by their first segment. */
function parseSitemap(xml: string): Route[] {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  const seen = new Set<string>();
  const out: Route[] = [];
  for (const loc of doc.querySelectorAll('loc')) {
    const href = loc.textContent?.trim();
    if (!href) continue;
    let path: string;
    try {
      path = new URL(href).pathname.replace(/\/$/, '') || '/';
    } catch {
      continue;
    }
    if (seen.has(path)) continue;
    seen.add(path);
    const segment = path === '/' ? '' : path.split('/')[1];
    out.push({ path, group: segment ? segment.replace(/-/g, ' ') : 'Main pages' });
  }
  return out;
}

export function EditorShell(props: EditorShellProps) {
  const { children, status, pendingCount, editableCount, showAll, onShowAll } = props;
  const [tab, setTab] = useState<Tab | null>(null);
  const [mobile, setMobile] = useState(false);
  /** Discard asks first: the bar turns into the question, never a browser dialog. */
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  /** The ⋯ menu on a phone, where Discard and Undo do not fit in the bar. */
  const [overflow, setOverflow] = useState(false);
  const [access, setAccess] = useState<Access | null>(null);
  const [accessNote, setAccessNote] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [routes, setRoutes] = useState<Route[] | null>(null);
  const [title, setTitle] = useState('This page');
  const [host, setHost] = useState('');
  const canvas = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const here = usePathname();

  // The document must not scroll: the canvas is the scrollport, which is what
  // keeps the site's sticky header under the editor bar instead of over it.
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const kept = { html: html.style.overflow, body: body.style.overflow, bg: body.style.background };
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    body.style.background = PAGE;
    return () => {
      html.style.overflow = kept.html;
      body.style.overflow = kept.body;
      body.style.background = kept.bg;
    };
  }, []);

  // The site's own code reads the document scroll: the header decides "past the
  // hero" from window.scrollY and listens to window 'scroll'. With the canvas
  // as the scrollport those never move, and on loudface.co the header stayed
  // transparent over white sections (measured live, 2026-09-18). While the shell
  // is up, window.scrollY and pageYOffset answer with the canvas position and
  // every canvas scroll is re-announced on window. Restored on unmount.
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const own = { scrollY: Object.getOwnPropertyDescriptor(window, 'scrollY'), pageYOffset: Object.getOwnPropertyDescriptor(window, 'pageYOffset') };
    const read = () => el.scrollTop;
    Object.defineProperty(window, 'scrollY', { get: read, configurable: true });
    Object.defineProperty(window, 'pageYOffset', { get: read, configurable: true });
    const announce = () => window.dispatchEvent(new Event('scroll'));
    el.addEventListener('scroll', announce, { passive: true });
    return () => {
      el.removeEventListener('scroll', announce);
      for (const [name, desc] of Object.entries(own)) {
        if (desc) Object.defineProperty(window, name, desc);
        else delete (window as unknown as Record<string, unknown>)[name];
      }
    };
  }, []);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)');
    const read = () => setMobile(query.matches);
    read();
    query.addEventListener('change', read);
    return () => query.removeEventListener('change', read);
  }, []);

  useEffect(() => {
    setTitle(pageTitle());
    setHost(window.location.host.replace(/^www\./, ''));
  }, []);

  // Who else edits this site: the top bar needs it for the avatars, and the
  // Editors panel needs the same answer, so it is read once.
  const loadAccess = useCallback(async () => {
    try {
      const response = await fetch('/api/lf-edit/editors');
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result?.error) {
        setAccessNote(result?.error ?? 'The list of editors could not be read');
        return;
      }
      setAccess(result as Access);
    } catch {
      setAccessNote('Could not reach the site, try again');
    }
  }, []);
  useEffect(() => {
    loadAccess();
  }, [loadAccess]);

  // Escape closes whichever panel is open, wherever the focus happens to be.
  useEffect(() => {
    if (!tab) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setTab(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [tab]);

  const openTab = (next: Tab) => {
    const open = tab === next ? null : next;
    setTab(open);
    if (open === 'history') props.onOpenHistory();
    if (open === 'pages' && routes === null) {
      fetch('/sitemap.xml')
        .then((response) => response.text())
        .then((xml) => setRoutes(parseSitemap(xml)))
        .catch(() => setRoutes([]));
    }
  };

  /**
   * Go to another page of the site without leaving the editor.
   *
   * This is the same move a link click inside the canvas makes: a router push,
   * so only the page under the shell is replaced. A plain full page load would
   * work too — the editor comes back from the cookies — but it would throw away
   * every edit staged and not yet published. The canvas is the scrollport, so
   * it is the thing that goes back to the top, not the document.
   */
  const goToPage = (path: string) => {
    if (path === here) return;
    router.push(path);
    canvas.current?.scrollTo({ top: 0 });
  };

  async function invite() {
    const email = inviteEmail.trim();
    if (!email || inviting) return;
    setInviting(true);
    setAccessNote('');
    try {
      const response = await fetch('/api/lf-edit/editors', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result?.error) {
        setAccessNote(result?.error ?? 'That invitation could not be sent');
        return;
      }
      setAccess(result as Access);
      setInviteEmail('');
      setAccessNote(
        result.mailed
          ? `Invitation sent to ${email}. The link in it lasts 12 hours; they can ask for a new one at /edit any time.`
          : `${email} now has access, but the invitation email could not be sent. Ask them to open /edit and request a link.`,
      );
    } catch {
      setAccessNote('Could not reach the site, try again');
    } finally {
      setInviting(false);
    }
  }

  async function removeEditor(email: string) {
    setAccessNote('');
    try {
      const response = await fetch('/api/lf-edit/editors', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result?.error) {
        setAccessNote(result?.error ?? 'That person could not be removed');
        return;
      }
      setAccess(result as Access);
      setAccessNote('Removed. Their current session ends within 8 hours.');
    } catch {
      setAccessNote('Could not reach the site, try again');
    }
  }

  const people = useMemo(() => {
    if (!access) return [] as string[];
    return [...access.owners.map((owner) => owner.email), ...access.editors.map((person) => person.email)];
  }, [access]);
  const you = access?.you ?? '';

  const dot = (tone: ShellTone, size = 8) => (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        flexShrink: 0,
        background: tone === 'bad' ? '#dc2626' : tone === 'busy' ? '#f59e0b' : tone === 'ok' ? '#16a34a' : '#c3ccd6',
        boxShadow:
          tone === 'bad'
            ? '0 0 0 3px rgba(220,38,38,.18)'
            : tone === 'busy'
              ? '0 0 0 3px rgba(245,158,11,.2)'
              : tone === 'ok'
                ? '0 0 0 3px rgba(22,163,74,.18)'
                : 'none',
        animation: tone === 'busy' ? 'lf-pulse 1.2s ease-in-out infinite' : undefined,
      }}
    />
  );

  return (
    <>
      <div style={{ ...shellRoot, background: PAGE }}>
        <style>{`
          @keyframes lf-pulse { 0%,100% { opacity: 1 } 50% { opacity: .4 } }
          [data-lf-chrome] button:focus-visible, [data-lf-chrome] a:focus-visible, [data-lf-chrome] input:focus-visible {
            outline: 2px solid ${BRAND}; outline-offset: 2px;
          }
        `}</style>

        {/* Top bar */}
        <header data-lf-chrome="" style={{ ...topBar, padding: mobile ? '0 12px' : '0 16px 0 14px' }}>
          <span style={brandMark}>lf</span>
          <span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Site editor</span>
          <span style={pill}>
            {dot('ok')}
            Editing
          </span>
          {!mobile && (
            <span style={crumb}>
              {host}
              <Icon d="m9 6 6 6-6 6" size={14} />
              <b style={{ color: INK, fontWeight: 500 }}>{title}</b>
            </span>
          )}

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: mobile ? 10 : 8 }}>
            {!mobile && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: MUTE }} title={status.title}>
                {dot(status.tone)}
                {status.text}
              </span>
            )}
            {/* One click, next to the light, instead of three clicks into a
                panel: a client who cannot find anything to type in needs this
                first, not last. The switch in Settings is the same state. */}
            <button
              style={{ ...iconBtn, color: showAll ? BRAND : MUTE, background: showAll ? '#eef2ff' : 'transparent' }}
              title="Show what can be edited"
              aria-label="Show what can be edited"
              aria-pressed={showAll}
              onClick={() => onShowAll(!showAll)}
            >
              <Icon size={17}>
                <path d={showAll ? EYE_OPEN : EYE_SHUT} />
                {showAll && <circle cx="12" cy="12" r="2.6" />}
              </Icon>
            </button>
            {!mobile && <span style={separator} />}
            <span style={{ display: 'flex' }}>
              {people.slice(0, 2).map((email, index) => (
                <span
                  key={email}
                  title={email}
                  style={{ ...avatar, background: AVATAR_COLOURS[index % AVATAR_COLOURS.length], marginLeft: index ? -8 : 0 }}
                >
                  {initials(email)}
                </span>
              ))}
              {people.length > 2 && (
                <span style={{ ...avatar, background: '#94a3b8', marginLeft: -8 }}>+{people.length - 2}</span>
              )}
            </span>
            {!mobile && people.length > 0 && (
              <span style={{ color: MUTE, whiteSpace: 'nowrap' }}>
                {people.length} editor{people.length === 1 ? '' : 's'}
                {you ? ` · you are ${firstName(you)}` : ''}
              </span>
            )}
            <span style={separator} />

            {confirmDiscard ? (
              <>
                <span style={{ color: MUTE, whiteSpace: 'nowrap' }}>
                  Throw away {pendingCount} unsaved change{pendingCount === 1 ? '' : 's'}?
                </span>
                <button
                  style={{ ...btn, color: '#b42318', borderColor: '#f3c9c4' }}
                  onClick={() => {
                    setConfirmDiscard(false);
                    props.onDiscard();
                  }}
                >
                  Discard
                </button>
                <button style={{ ...btn, ...primaryBtn }} onClick={() => setConfirmDiscard(false)}>
                  Keep
                </button>
              </>
            ) : (
              <>
                {!mobile && (
                  <button
                    style={{ ...btn, opacity: pendingCount ? 1 : 0.6 }}
                    onClick={() => setConfirmDiscard(true)}
                    disabled={!pendingCount}
                  >
                    Discard
                  </button>
                )}
                {!mobile && props.canUndo && (
                  <button style={btn} onClick={props.onUndo}>
                    Undo
                  </button>
                )}
                {/* A phone has no room for three buttons, and hiding Discard and
                    Undo left a client on a phone with no way to take an edit
                    back. They live behind ⋯ instead. */}
                {mobile && (pendingCount > 0 || props.canUndo) && (
                  <span style={{ position: 'relative' }}>
                    <button style={iconBtn} aria-label="More actions" onClick={() => setOverflow(!overflow)}>
                      <Icon d="M5 12h.01M12 12h.01M19 12h.01" />
                    </button>
                    {overflow && (
                      <span style={overflowMenu}>
                        <button
                          style={{ ...btn, border: 0, justifyContent: 'flex-start', opacity: pendingCount ? 1 : 0.6 }}
                          disabled={!pendingCount}
                          onClick={() => {
                            setOverflow(false);
                            setConfirmDiscard(true);
                          }}
                        >
                          Discard
                        </button>
                        {props.canUndo && (
                          <button
                            style={{ ...btn, border: 0, justifyContent: 'flex-start' }}
                            onClick={() => {
                              setOverflow(false);
                              props.onUndo();
                            }}
                          >
                            Undo
                          </button>
                        )}
                      </span>
                    )}
                  </span>
                )}
                <button
                  style={{ ...btn, ...primaryBtn, opacity: pendingCount ? 1 : 0.65 }}
                  onClick={props.onPublish}
                  disabled={!pendingCount}
                >
                  Publish
                </button>
              </>
            )}
          </div>
        </header>

        {/* Rail — a column on a desktop, a tab bar on a phone */}
        <nav
          data-lf-chrome=""
          style={
            mobile
              ? { ...railBase, left: 0, right: 0, bottom: 0, top: 'auto', height: RAIL, width: 'auto', flexDirection: 'row', justifyContent: 'space-around', padding: '8px 6px 0', background: '#fff', borderTop: `1px solid ${LINE}` }
              : railBase
          }
        >
          {TABS.map((item) => (
            <div key={item.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <button
                aria-pressed={tab === item.id}
                onClick={() => openTab(item.id)}
                style={{
                  ...railBtn,
                  color: tab === item.id ? BRAND : MUTE,
                  background: tab === item.id ? '#fff' : 'transparent',
                  boxShadow: tab === item.id ? `0 1px 2px rgba(20,33,43,.08), 0 0 0 1px ${LINE}` : 'none',
                }}
              >
                {item.icon}
              </button>
              <small style={{ fontSize: 10, lineHeight: 1.2, fontWeight: 500, color: MUTE, marginTop: -2 }}>{item.label}</small>
            </div>
          ))}
        </nav>

        {/* The panel the rail opens */}
        {tab && (
          <section
            data-lf-chrome=""
            style={
              mobile
                ? { ...panelBase, left: 0, right: 0, width: 'auto', top: TOP, bottom: RAIL, borderRight: 'none' }
                : panelBase
            }
          >
            <div style={panelHead}>
              <strong style={{ fontWeight: 600 }}>{TABS.find((item) => item.id === tab)!.label}</strong>
              <button style={iconBtn} onClick={() => setTab(null)} aria-label="Close panel">
                <Icon d="M6 6l12 12M18 6 6 18" size={16} />
              </button>
            </div>
            <div style={panelBody}>
              {tab === 'pages' && <Pages routes={routes} here={here} onGo={goToPage} />}
              {tab === 'history' && (
                <History
                  publishes={props.publishes}
                  // The panel closes on an undo, as it did before the shell: the
                  // list it is showing is one commit out of date the moment the
                  // undo lands, and the light in the bar is where the answer is.
                  onUndo={(hash, doneWord) => {
                    setTab(null);
                    props.onUndoPublish(hash, doneWord);
                  }}
                />
              )}
              {tab === 'editors' && (
                <Editors
                  access={access}
                  note={accessNote}
                  inviteEmail={inviteEmail}
                  setInviteEmail={setInviteEmail}
                  inviting={inviting}
                  onInvite={invite}
                  onRemove={removeEditor}
                />
              )}
              {tab === 'settings' && (
                <Settings you={you} showAll={showAll} onShowAll={onShowAll} editableCount={editableCount} />
              )}
            </div>
          </section>
        )}

        {/* The canvas: the site, framed, and the only thing that scrolls */}
        <div
          ref={canvas}
          style={
            mobile
              ? { ...canvasBase, left: 0, right: 0, top: TOP, bottom: RAIL, borderRadius: 0, boxShadow: 'none' }
              : canvasBase
          }
        >
          {children}
        </div>

        {props.overlays}
      </div>
    </>
  );
}

/**
 * The site's own sitemap as a list, grouped by first segment, the page you are
 * on marked. Clicking one hands it to the shell, which pushes the route.
 */
function Pages({ routes, here, onGo }: { routes: Route[] | null; here: string; onGo: (path: string) => void }) {
  const current = here.replace(/\/$/, '') || '/';
  if (routes === null) return <p style={quiet}>Reading the site&rsquo;s pages…</p>;
  if (!routes.length) return <p style={quiet}>The list of pages could not be read.</p>;
  const groups = new Map<string, Route[]>();
  for (const route of routes) {
    const list = groups.get(route.group) ?? [];
    list.push(route);
    groups.set(route.group, list);
  }
  return (
    <>
      {[...groups].map(([group, list]) => (
        <div key={group} style={{ marginBottom: 14 }}>
          <p style={groupLabel}>{group}</p>
          {list.map((route) => {
            const on = route.path === current;
            return (
              <a
                key={route.path}
                href={route.path}
                aria-current={on ? 'page' : undefined}
                onClick={(event) => {
                  // A modified click still belongs to the browser: a client who
                  // means "open this in a new tab" should get one.
                  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
                  event.preventDefault();
                  onGo(route.path);
                }}
                style={{
                  ...listRow,
                  color: on ? BRAND : INK,
                  background: on ? '#eef2ff' : 'transparent',
                  fontWeight: on ? 600 : 400,
                }}
              >
                <span style={ellipsis}>{route.path}</span>
                {on && <span style={{ fontSize: 11, color: BRAND }}>you are here</span>}
              </a>
            );
          })}
        </div>
      ))}
    </>
  );
}

function History({
  publishes,
  onUndo,
}: {
  publishes: ShellPublish[] | null;
  onUndo: (hash: string, doneWord?: string) => void;
}) {
  if (publishes === null) return <p style={quiet}>Loading…</p>;
  if (!publishes.length) return <p style={quiet}>Nothing published yet.</p>;
  return (
    <>
      {publishes.map((entry) => {
        // A revert commit is a commit, so it shows up here like any other.
        // Undoing one puts the change back, which is a redo; the row says so.
        const undid = undoneSummary(entry.summary);
        return (
          <div key={entry.hash} style={{ ...listItem, display: 'block' }}>
            <p style={{ margin: 0, fontWeight: 600 }}>{undid ? `undo of ${undid}` : entry.summary}</p>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: MUTE }}>
              {new Date(entry.date).toLocaleString()} · {entry.editor}
              {entry.fields.length ? ` · ${entry.fields.slice(0, 3).join(', ')}` : ''}
            </p>
            {entry.reverted ? (
              <span style={{ fontSize: 12, color: MUTE }}>undone</span>
            ) : (
              <button
                style={{ ...btn, marginTop: 8 }}
                onClick={() => onUndo(entry.hash, undid ? 'Change put back' : 'Change undone')}
              >
                {undid ? 'Redo' : 'Undo'}
              </button>
            )}
          </div>
        );
      })}
    </>
  );
}

function Editors({
  access,
  note,
  inviteEmail,
  setInviteEmail,
  inviting,
  onInvite,
  onRemove,
}: {
  access: Access | null;
  note: string;
  inviteEmail: string;
  setInviteEmail: (value: string) => void;
  inviting: boolean;
  onInvite: () => void;
  onRemove: (email: string) => void;
}) {
  return (
    <>
      {access === null && !note && <p style={quiet}>Loading…</p>}

      {access?.owners.map((owner) => (
        <div key={owner.email} style={listItem}>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontWeight: 600, ...ellipsis }}>{owner.email}</p>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: MUTE }}>owner · LoudFace</p>
          </div>
        </div>
      ))}

      {access?.editors.map((person) => (
        <div key={person.email} style={listItem}>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontWeight: 600, ...ellipsis }}>
              {person.email}
              {person.email === access.you ? ' (you)' : ''}
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: MUTE }}>
              editor · added by {person.addedBy.split('@')[0] || 'someone'}
              {addedOn(person.addedAt)}
            </p>
          </div>
          {access.owner && (
            <button style={{ ...btn, color: '#b42318', borderColor: '#f3c9c4' }} onClick={() => onRemove(person.email)}>
              Remove
            </button>
          )}
        </div>
      ))}

      {access && !access.editors.length && <p style={{ ...quiet, marginTop: 10 }}>Nobody else has been invited yet.</p>}

      {/* Only LoudFace changes who edits a site. An invited editor sees the list
          and one line saying where to ask, rather than buttons that 403. */}
      {access && !access.owner && (
        <p style={{ ...quiet, marginTop: 14 }}>Ask LoudFace to add or remove editors.</p>
      )}

      {access?.owner && (
      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <input
          type="email"
          placeholder="colleague@company.com"
          value={inviteEmail}
          disabled={inviting}
          style={{ ...field, flex: 1, minWidth: 0 }}
          onChange={(event) => setInviteEmail(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') onInvite();
          }}
        />
        <button
          style={{ ...btn, ...primaryBtn, opacity: inviting || !inviteEmail.trim() ? 0.5 : 1 }}
          onClick={onInvite}
          disabled={inviting || !inviteEmail.trim()}
        >
          {inviting ? 'Inviting…' : 'Invite'}
        </button>
      </div>
      )}

      <p style={{ ...quiet, marginTop: 10, minHeight: 16 }}>
        {note ||
          (access?.owner
            ? 'An invitation is a sign-in link by email. Removing someone stops new sign-ins; a session they already have ends within 8 hours.'
            : '')}
      </p>
    </>
  );
}

/**
 * Settings, and only what a client has any use for: who they are, the way out,
 * and the switch that shows them what is editable. The health rows that used to
 * sit here answer a LoudFace question and stayed at /api/lf-edit/health.
 */
function Settings({
  you,
  showAll,
  onShowAll,
  editableCount,
}: {
  you: string;
  showAll: boolean;
  onShowAll: (on: boolean) => void;
  editableCount: number;
}) {
  return (
    <>
      <p style={groupLabel}>You</p>
      <p style={{ margin: '0 0 4px', fontWeight: 600, ...ellipsis }}>{you || 'Signed in'}</p>
      <a href="/api/lf-edit/signout" style={{ ...btn, display: 'inline-flex', textDecoration: 'none', marginTop: 6 }}>
        Sign out
      </a>

      <p style={{ ...groupLabel, marginTop: 18 }}>This page</p>
      <button
        onClick={() => onShowAll(!showAll)}
        style={{ ...listRow, width: '100%', border: `1px solid ${LINE}`, borderRadius: 10, cursor: 'pointer', background: '#fff' }}
      >
        <span>Show what can be edited</span>
        <span
          style={{
            width: 34,
            height: 20,
            borderRadius: 999,
            background: showAll ? BRAND : '#cfd8e3',
            position: 'relative',
            flexShrink: 0,
            transition: 'background .2s',
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: 2,
              left: showAll ? 16 : 2,
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: '#fff',
              transition: 'left .2s',
            }}
          />
        </span>
      </button>
      <p style={{ ...quiet, marginTop: 8 }}>
        {editableCount} editable {editableCount === 1 ? 'thing' : 'things'} on this page.
      </p>
    </>
  );
}

/** " on 18 September 2026", or nothing at all if the stamp is missing or unreadable. */
function addedOn(addedAt: string): string {
  const when = new Date(addedAt);
  return addedAt && !Number.isNaN(when.getTime()) ? ` on ${when.toLocaleDateString()}` : '';
}

const shellRoot: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: Z,
  font: `13px/1.45 ${FONT}`,
  color: INK,
};

const topBar: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  height: TOP,
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  zIndex: 5,
};

const brandMark: React.CSSProperties = {
  width: 24,
  height: 24,
  borderRadius: 7,
  background: BRAND,
  color: '#fff',
  display: 'grid',
  placeItems: 'center',
  fontSize: 11,
  fontWeight: 700,
  flexShrink: 0,
};

const pill: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  height: 26,
  padding: '0 10px 0 8px',
  borderRadius: 999,
  fontWeight: 600,
  fontSize: 12,
  background: '#ecfdf5',
  color: '#166534',
  whiteSpace: 'nowrap',
};

const crumb: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  color: MUTE,
  minWidth: 0,
  overflow: 'hidden',
  whiteSpace: 'nowrap',
};

const separator: React.CSSProperties = { width: 1, height: 20, background: LINE, flexShrink: 0 };

/** The ⋯ menu on a phone: Discard and Undo, under the button that opens them. */
const overflowMenu: React.CSSProperties = {
  position: 'absolute',
  top: 34,
  right: 0,
  display: 'flex',
  flexDirection: 'column',
  minWidth: 132,
  padding: 4,
  borderRadius: 10,
  background: '#fff',
  border: `1px solid ${LINE}`,
  boxShadow: '0 12px 30px rgba(20,33,43,.16)',
  zIndex: 7,
};

const avatar: React.CSSProperties = {
  width: 26,
  height: 26,
  borderRadius: '50%',
  border: '2px solid #fff',
  display: 'grid',
  placeItems: 'center',
  fontSize: 10,
  fontWeight: 600,
  color: '#fff',
  flexShrink: 0,
};

const btn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  height: 32,
  padding: '0 12px',
  borderRadius: 8,
  border: `1px solid ${LINE}`,
  background: '#fff',
  font: `500 13px ${FONT}`,
  color: INK,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

const primaryBtn: React.CSSProperties = {
  background: BRAND,
  borderColor: BRAND,
  color: '#fff',
  fontWeight: 600,
};

const iconBtn: React.CSSProperties = {
  width: 28,
  height: 28,
  display: 'grid',
  placeItems: 'center',
  border: 0,
  background: 'transparent',
  color: MUTE,
  borderRadius: 8,
  cursor: 'pointer',
};

const railBase: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  top: TOP,
  bottom: 0,
  width: RAIL,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 6,
  paddingTop: 10,
  zIndex: 5,
};

const railBtn: React.CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: 10,
  border: 0,
  display: 'grid',
  placeItems: 'center',
  cursor: 'pointer',
  padding: 0,
};

const panelBase: React.CSSProperties = {
  position: 'absolute',
  left: RAIL,
  top: TOP,
  bottom: 0,
  width: PANEL_WIDTH,
  background: '#fff',
  borderRight: `1px solid ${LINE}`,
  display: 'flex',
  flexDirection: 'column',
  zIndex: 6,
  boxShadow: '8px 0 24px rgba(20,33,43,.06)',
};

const panelHead: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 10px 12px 14px',
  borderBottom: `1px solid ${LINE}`,
  flexShrink: 0,
};

const panelBody: React.CSSProperties = { padding: 14, overflow: 'auto', flex: 1 };

const canvasBase: React.CSSProperties = {
  position: 'absolute',
  left: RAIL,
  top: TOP,
  right: 12,
  bottom: 12,
  borderRadius: 14,
  overflow: 'auto',
  background: '#fff',
  boxShadow: '0 8px 30px rgba(20,33,43,.14), 0 0 0 1px rgba(20,33,43,.06)',
  zIndex: 1,
};

const quiet: React.CSSProperties = { margin: 0, color: MUTE, fontSize: 12 };
const groupLabel: React.CSSProperties = {
  margin: '0 0 6px',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '.04em',
  textTransform: 'uppercase',
  color: MUTE,
};
const listRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  padding: '7px 8px',
  borderRadius: 8,
  textDecoration: 'none',
  color: INK,
  font: `13px ${FONT}`,
};
const listItem: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  padding: '10px 0',
  borderTop: `1px solid ${LINE}`,
};
const field: React.CSSProperties = {
  width: '100%',
  height: 32,
  padding: '0 10px',
  border: `1px solid ${LINE}`,
  borderRadius: 8,
  font: `13px ${FONT}`,
  color: INK,
  background: '#fff',
};
const ellipsis: React.CSSProperties = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };

export const shellTokens = { INK, MUTE, LINE, BRAND, FONT, TOP, RAIL, Z, btn, primaryBtn, field, iconBtn, quiet, listItem, ellipsis };
