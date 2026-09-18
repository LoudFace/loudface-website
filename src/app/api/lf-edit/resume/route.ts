/**
 * Come back to editing without a new sign-in link.
 *
 * Draft Mode's cookie lasts as long as the browser window, while a session
 * lasts eight hours. A client who closed the tab and came back therefore still
 * had a valid session but no editing bar, and no way to get one but a fresh
 * email. This route turns Draft Mode back on for a session that is still good,
 * and sends them to the page they asked for.
 */
import { cookies, draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { currentEditor } from '@/lib/inline-edit/session';
import { PAUSED_COOKIE, editorOffResponse, safeNext } from '@/lib/inline-edit/guard';

export async function GET(request: Request) {
  const off = editorOffResponse();
  if (off) return off;

  const next = safeNext(new URL(request.url).searchParams.get('next'));
  if (!(await currentEditor())) redirect('/edit');

  // Back in the editor, so the "Edit this page" chip has nothing left to offer.
  (await cookies()).delete(PAUSED_COOKIE);
  (await draftMode()).enable();
  redirect(next);
}
