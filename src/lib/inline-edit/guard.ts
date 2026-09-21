/**
 * The off switch, and the one rule for redirect targets.
 *
 * Both are shared by every `/api/lf-edit/*` route. Nothing here touches the
 * request, so this file stays free of `server-only` and is easy to test.
 */

/** LF_INLINE_EDIT=off takes the editor off this site, its API routes included. */
export const inlineEditingEnabled = (): boolean => process.env.LF_INLINE_EDIT !== 'off';

/**
 * The answer every editor route gives when the site has editing switched off:
 * nothing to sign in to, nothing to publish to, and nothing that says otherwise.
 * Returns null when editing is on, so a route reads as one line at the top.
 */
export function editorOffResponse(): Response | null {
  if (inlineEditingEnabled()) return null;
  return Response.json({ error: 'The editor is switched off on this site' }, { status: 404 });
}

/**
 * Where a route may send the browser next.
 *
 * Only a path on this site: one leading slash, no `//host` (which is a full
 * address to somewhere else) and no backslash (which some browsers read as a
 * slash). Anything else falls back to the home page.
 */
export function safeNext(value: string | null | undefined, fallback = '/'): string {
  if (!value) return fallback;
  if (!value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return fallback;
  return value;
}

/**
 * Should a page show the "Resume editing" chip?
 *
 * Draft Mode's cookie dies with the browser window; the session cookie lives
 * eight hours. A client who closed the tab after lunch came back to their own
 * site with no bar, no chip and nothing to click — the only way back in was a
 * fresh email. The layout can see both facts (the session cookie is httpOnly
 * and readable on the server), so it offers the way back.
 *
 * No session means no chip, which is what keeps an anonymous visitor's HTML
 * byte-identical to a site without the editor. Draft Mode already on means the
 * editor is up and the chip would be noise. Paused means the client pressed
 * "View site" on purpose: `EditChip` offers the way back from the browser, so
 * this server-rendered one stands down and they never see two chips at once.
 */
export function showResumeChip(
  session: string | null | undefined,
  draftMode: boolean,
  paused = false,
): boolean {
  return Boolean(session) && !draftMode && !paused;
}

/**
 * Should the page carry the editor at all?
 *
 * Only with both facts: Draft Mode on, and a session that still opens. Draft
 * Mode's cookie lasts the browser window; the session lasts eight hours. A tab
 * left open overnight therefore reaches the morning with Draft Mode on and no
 * session, and a bar rendered from Draft Mode alone would offer buttons that
 * all answer "sign in" (measured 2026-09-21: "View site" landed on /edit).
 * Draft Mode alone is also what Sanity's Presentation tool switches on for a
 * Studio preview, and that preview gets no editing bar.
 */
export function editorIsUp(session: string | null | undefined, draftMode: boolean): boolean {
  return draftMode && Boolean(session);
}

/** Where that chip sends them: back to this same page, with Draft Mode on again. */
export function resumeHref(pathname: string): string {
  return `/api/lf-edit/resume?next=${encodeURIComponent(safeNext(pathname))}`;
}

/**
 * The editor is paused.
 *
 * "View site" turns Draft Mode off and leaves the session alone, so the client
 * sees their own site exactly as a visitor does — animations and all — and can
 * come back without another email. The mark is a cookie because the page's own
 * script has to read it: `EditChip` renders from it, and the layout stays free
 * of any extra server work for an anonymous visitor.
 *
 * Not httpOnly for that reason, and it carries nothing: the value is the single
 * character `1`. The session cookie next to it stays httpOnly and is still the
 * only thing that lets anybody edit.
 */
export const PAUSED_COOKIE = 'lf-paused';

/** As long as a session can last, so the mark never outlives the way back in. */
const PAUSED_HOURS = 8;

export const pausedCookieOptions = {
  httpOnly: false as const,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: PAUSED_HOURS * 60 * 60,
};

/**
 * Is the paused mark in this `document.cookie` string?
 *
 * Matched on a whole name, never a substring: a cookie called
 * `not-lf-paused=1` must not turn the chip on.
 */
export function isPaused(cookieString: string | null | undefined): boolean {
  if (!cookieString) return false;
  return cookieString
    .split(';')
    .some((part) => part.trim() === `${PAUSED_COOKIE}=1`);
}

/** Where "View site" sends them: this same page, with the editor off. */
export function pauseHref(pathname: string): string {
  return `/api/lf-edit/pause?next=${encodeURIComponent(safeNext(pathname))}`;
}
