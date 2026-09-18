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
import { currentEditor } from '@/lib/inline-edit/session';
import { PAUSED_COOKIE, editorOffResponse, pausedCookieOptions, safeNext } from '@/lib/inline-edit/guard';

export async function GET(request: Request) {
  const off = editorOffResponse();
  if (off) return off;

  const next = safeNext(new URL(request.url).searchParams.get('next'));
  if (!(await currentEditor())) redirect('/edit');

  (await cookies()).set(PAUSED_COOKIE, '1', pausedCookieOptions);
  (await draftMode()).disable();
  redirect(next);
}
