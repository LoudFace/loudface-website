/**
 * The Team App's "Open editor" button lands here (`src/lib/inline-edit/handoff.ts`).
 *
 * GET   says whether this site takes a handoff, and which address it answers
 *       to, so the Team App seals the token for the right origin (the button
 *       may know the site as loudface.co while it answers as www.loudface.co).
 * POST  form fields `token` and `next`: check the token, check the person may
 *       edit this site, open the session exactly as the emailed link does, and
 *       land on `next`. Always a 303, so the browser follows with a GET.
 */
import { cookies, draftMode } from 'next/headers';
import { editorOffResponse, PAUSED_COOKIE, safeNext } from '@/lib/inline-edit/guard';
import { isAllowed, SESSION_COOKIE, createSessionToken, sessionCookieOptions } from '@/lib/inline-edit/session';
import { openHandoff, originOf } from '@/lib/inline-edit/handoff';

export const dynamic = 'force-dynamic';

/** The address this site answers to: LF_SITE_URL, else the request's own. */
function siteOrigin(request: Request): string {
  return originOf(process.env.LF_SITE_URL ?? '') ?? new URL(request.url).origin;
}

export async function GET(request: Request) {
  const off = editorOffResponse();
  if (off) return off;
  const ready = Boolean(process.env.LF_TEAM_HANDOFF_SECRET);
  return Response.json({ ready, origin: siteOrigin(request) }, { status: ready ? 200 : 503 });
}

export async function POST(request: Request) {
  const off = editorOffResponse();
  if (off) return off;
  const origin = siteOrigin(request);
  const to = (path: string) => Response.redirect(new URL(path, origin), 303);

  const form = await request.formData().catch(() => null);
  const token = typeof form?.get('token') === 'string' ? (form!.get('token') as string) : '';
  const next = typeof form?.get('next') === 'string' ? (form!.get('next') as string) : '/';

  const result = openHandoff(process.env.LF_TEAM_HANDOFF_SECRET, token, origin);
  if (!result.ok) return to(`/edit?handoff=${result.reason === 'expired' ? 'expired' : 'failed'}`);
  // The seal says who; this site still decides whether they may edit it.
  if (!(await isAllowed(result.email))) return to('/edit?handoff=denied');

  const jar = await cookies();
  jar.set(SESSION_COOKIE, createSessionToken(result.email), sessionCookieOptions);
  jar.delete(PAUSED_COOKIE);
  (await draftMode()).enable();
  return to(safeNext(next));
}
