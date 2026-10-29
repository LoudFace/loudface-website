/**
 * Who may comment on this site, and the share link (2026-10-29).
 *
 * GET               the commenters, the live share link, and whether the
 *                   person asking may remove people or change the link.
 * POST {op:'invite', email}  anyone signed in: adds a commenter and emails them
 *                            a sign-in link naming who invited them.
 * POST {op:'link'}           anyone signed in: the share link, made if none.
 * POST {op:'link_reset'}     owners: a new link; the old one stops working.
 * POST {op:'link_off'}       owners: no share link at all.
 * POST {op:'remove', email}  owners: takes someone's comment access away.
 *
 * Commenters live in the Spine, not in the repository, so none of this needs
 * GitHub (`src/lib/inline-edit/commenters.ts`). The Spine's door checks the
 * owner-only operations again; this route refuses them first so a commenter
 * never sees a button that answers 403.
 */
import { headers } from 'next/headers';
import { currentEditor, isAllowed, mayComment, owners } from '@/lib/inline-edit/session';
import { editorOffResponse } from '@/lib/inline-edit/guard';
import { actorFor } from '@/lib/inline-edit/comments';
import { isValidEmail, normalizeEmail } from '@/lib/inline-edit/editors-list';
import {
  inviteCommenter,
  listCommenters,
  removeCommenter,
  resetShareLink,
  shareLink,
  turnOffShareLink,
} from '@/lib/inline-edit/commenters';
import { sendCommentSignInLink } from '@/lib/inline-edit/signin-mail';

export const dynamic = 'force-dynamic';

const WINDOW_MS = 60 * 60_000;
const INVITES_PER_WINDOW = 20;
/** In memory, per server instance: a person invites a handful, a script hundreds. */
const invites = new Map<string, number[]>();

function tooManyInvites(email: string): boolean {
  const now = Date.now();
  const recent = (invites.get(email) ?? []).filter((at) => now - at < WINDOW_MS);
  recent.push(now);
  invites.set(email, recent);
  return recent.length > INVITES_PER_WINDOW;
}

/** The address the visitor used, for the link in the email. */
async function publicOrigin(request: Request): Promise<string> {
  if (process.env.LF_SITE_URL) return process.env.LF_SITE_URL.replace(/\/$/, '');
  const head = await headers();
  const host = head.get('x-forwarded-host') ?? head.get('host');
  const proto = head.get('x-forwarded-proto') ?? 'https';
  return host ? `${proto}://${host}` : new URL(request.url).origin;
}

async function signedIn(): Promise<string | null> {
  const email = await currentEditor();
  return email && (await mayComment(email)) ? email : null;
}

/** The panel's data after any change: the list, the link, and what the reader may do. */
async function panel(email: string) {
  const actor = actorFor(email, owners());
  const listed = await listCommenters(actor);
  if (!listed.ok) return Response.json({ error: listed.error }, { status: listed.status });
  return Response.json({ ...listed.data, you: actor.email, manage: actor.owner });
}

export async function GET() {
  const off = editorOffResponse();
  if (off) return off;
  const email = await signedIn();
  if (!email) return Response.json({ error: 'Sign in first' }, { status: 401 });
  return panel(email);
}

export async function POST(request: Request) {
  const off = editorOffResponse();
  if (off) return off;
  const email = await signedIn();
  if (!email) return Response.json({ error: 'Sign in first' }, { status: 401 });
  const actor = actorFor(email, owners());

  const body = (await request.json().catch(() => ({}))) as { op?: unknown; email?: unknown };
  const op = typeof body.op === 'string' ? body.op : '';
  const target = typeof body.email === 'string' ? normalizeEmail(body.email) : '';

  if (op === 'invite') {
    // A pipe separates the fields of a sign-in token, so an address with one is refused.
    if (!isValidEmail(target) || target.includes('|')) {
      return Response.json({ error: 'That does not look like an email address' }, { status: 400 });
    }
    if (tooManyInvites(actor.email)) {
      return Response.json({ error: 'That is a lot of invitations at once. Wait an hour and try again' }, { status: 429 });
    }
    // An editor can already comment; inviting them would only add a second row.
    if (await isAllowed(target)) {
      return Response.json({ error: `${target} can already edit this site, so they can comment too` }, { status: 400 });
    }
    const added = await inviteCommenter(target, actor);
    if (!added.ok) return Response.json({ error: added.error }, { status: added.status });
    const mail = await sendCommentSignInLink(target, await publicOrigin(request), actor.email);
    const answer = await panel(email);
    const data = await answer.json();
    return Response.json({ ...data, mailed: mail.mailed, created: added.data.created }, { status: answer.status });
  }

  if (op === 'link') {
    const link = await shareLink(actor);
    if (!link.ok) return Response.json({ error: link.error }, { status: link.status });
    return panel(email);
  }

  if (op === 'link_reset' || op === 'link_off' || op === 'remove') {
    if (!actor.owner) return Response.json({ error: 'Ask LoudFace to change the share link or remove people' }, { status: 403 });
    const done =
      op === 'link_reset'
        ? await resetShareLink(actor)
        : op === 'link_off'
          ? await turnOffShareLink(actor)
          : await removeCommenter(target, actor);
    if (!done.ok) return Response.json({ error: done.error }, { status: done.status });
    return panel(email);
  }

  return Response.json({ error: 'That request could not be read' }, { status: 400 });
}
