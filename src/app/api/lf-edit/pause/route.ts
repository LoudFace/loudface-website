/**
 * Turn the editor off without signing out.
 *
 * The client asked to see their own site the way a visitor sees it — the
 * animations run, nothing is outlined, no bar across the top — and then to get
 * back to editing with one click. Signing out did the first half and cost them
 * a fresh email for the second.
 *
 * So this route disables Draft Mode and KEEPS the session. It leaves a small
 * mark behind (`lf-paused`) that the page's own script reads to show the "Edit
 * this page" chip. `resume` and `signout` both clear that mark.
 */
import { cookies, draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, currentEditor } from '@/lib/inline-edit/session';
import { PAUSED_COOKIE, editorOffResponse, pausedCookieOptions, safeNext } from '@/lib/inline-edit/guard';

export async function GET(request: Request) {
  const off = editorOffResponse();
  if (off) return off;

  const next = safeNext(new URL(request.url).searchParams.get('next'));
  const jar = await cookies();

  // "View site" means view the site, whatever state the cookies are in. A
  // session that ran out under an open tab used to land here and be sent to
  // /edit instead, with Draft Mode still on, so the bar came back on the next
  // page (2026-09-21). Now Draft Mode goes off either way; only the way back
  // in (the paused mark and the chip) needs a session that is still good.
  if (await currentEditor()) {
    jar.set(PAUSED_COOKIE, '1', pausedCookieOptions);
  } else {
    jar.delete(SESSION_COOKIE);
    jar.delete(PAUSED_COOKIE);
  }
  (await draftMode()).disable();
  redirect(next);
}
