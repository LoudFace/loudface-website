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
 * editor is up and the chip would be noise.
 */
export function showResumeChip(session: string | null | undefined, draftMode: boolean): boolean {
  return Boolean(session) && !draftMode;
}

/** Where that chip sends them: back to this same page, with Draft Mode on again. */
export function resumeHref(pathname: string): string {
  return `/api/lf-edit/resume?next=${encodeURIComponent(safeNext(pathname))}`;
}
