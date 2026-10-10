/**
 * Draft mode DISABLE endpoint — clears the Next.js draft-mode cookie and
 * redirects back to the URL specified by `?redirect=...` (falls back to home).
 * Only URLs on this site are followed, so the route is not an open redirect.
 *
 * Called by the VisualEditing toolbar's "Exit preview" button.
 */
import { draftMode } from 'next/headers';
import { NextResponse } from 'next/server';
import { sameSiteRedirect } from '@/lib/same-site-redirect';

export async function GET(request: Request) {
  const draft = await draftMode();
  draft.disable();

  const url = new URL(request.url);
  return NextResponse.redirect(sameSiteRedirect(url.searchParams.get('redirect'), url.origin));
}
