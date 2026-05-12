/**
 * Draft mode DISABLE endpoint — clears the Next.js draft-mode cookie and
 * redirects back to the URL specified by `?redirect=...` (falls back to home).
 *
 * Called by the VisualEditing toolbar's "Exit preview" button.
 */
import { draftMode } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const draft = await draftMode();
  draft.disable();

  const url = new URL(request.url);
  const redirectPath = url.searchParams.get('redirect') || '/';
  return NextResponse.redirect(new URL(redirectPath, url.origin));
}
