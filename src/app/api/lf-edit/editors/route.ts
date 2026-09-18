/**
 * Who has access: read it, invite somebody, remove somebody.
 *
 * The repository is the store. An invite and a removal are each one commit on
 * `src/data/editors.json`, authored by the editor who pressed the button, with
 * no `LF-Changes` trailer — so neither shows up in the publish History and
 * neither can be undone there as if it were a change to the site's words.
 *
 * Owners (`LF_EDITOR_EMAILS`) are LoudFace. They are not in the file, cannot be
 * invited twice and cannot be removed from the site.
 *
 * Removing somebody stops them signing in again. It does not end a session they
 * already hold: sessions are signed, not stored, so there is nothing to revoke.
 * Their current session runs out within eight hours. The panel says so. A
 * revocation list would mean a store to keep, which is the vendor dependency
 * this whole editor exists to avoid.
 */
import { currentEditor, owners } from '@/lib/inline-edit/session';
import { editorOffResponse } from '@/lib/inline-edit/guard';
import { commitFile } from '@/lib/inline-edit/content-store';
import { EDITORS_FILE, forgetEditors, loadEditors } from '@/lib/inline-edit/editors';
import {
  isOwner,
  isValidEmail,
  normalizeEmail,
  serializeEditors,
  withEditor,
  withoutEditor,
  type Editor,
} from '@/lib/inline-edit/editors-list';
import { sendSignInLink } from '@/lib/inline-edit/signin-mail';
import { headers } from 'next/headers';

const INVITE_WINDOW_MS = 60 * 60_000;
const INVITES_PER_WINDOW = 10;
/** In memory, per server instance: enough to stop one signed-in browser flooding a mailbox. */
const invites = new Map<string, number[]>();

function tooManyInvites(editor: string): boolean {
  const now = Date.now();
  const recent = (invites.get(editor) ?? []).filter((at) => now - at < INVITE_WINDOW_MS);
  recent.push(now);
  invites.set(editor, recent);
  if (invites.size > 200) {
    for (const [seen, times] of invites) {
      if (!times.some((at) => now - at < INVITE_WINDOW_MS)) invites.delete(seen);
    }
  }
  return recent.length > INVITES_PER_WINDOW;
}

/** The address the visitor actually used, for the link in the invitation email. */
async function publicOrigin(request: Request): Promise<string> {
  if (process.env.LF_SITE_URL) return process.env.LF_SITE_URL.replace(/\/$/, '');
  const head = await headers();
  const host = head.get('x-forwarded-host') ?? head.get('host');
  const proto = head.get('x-forwarded-proto') ?? 'https';
  return host ? `${proto}://${host}` : new URL(request.url).origin;
}

/** The whole panel's data: who we are, who they invited, who is asking. */
async function panel(editor: string): Promise<{
  owners: { email: string }[];
  editors: Editor[];
  you: string;
}> {
  const { list } = await loadEditors();
  return {
    owners: owners().map((email) => ({ email })),
    editors: list.editors,
    you: normalizeEmail(editor),
  };
}

const message = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export async function GET() {
  const off = editorOffResponse();
  if (off) return off;

  const editor = await currentEditor();
  if (!editor) return Response.json({ error: 'Sign in first' }, { status: 401 });

  try {
    return Response.json(await panel(editor));
  } catch (error) {
    return Response.json({ error: message(error, 'The editor list is unavailable') }, { status: 400 });
  }
}

export async function POST(request: Request) {
  const off = editorOffResponse();
  if (off) return off;

  const editor = await currentEditor();
  if (!editor) return Response.json({ error: 'Sign in first' }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { email?: unknown };
  const email = typeof body.email === 'string' ? normalizeEmail(body.email) : '';
  if (!isValidEmail(email)) {
    return Response.json({ error: 'That does not look like an email address' }, { status: 400 });
  }
  if (tooManyInvites(normalizeEmail(editor))) {
    return Response.json(
      { error: 'That is a lot of invitations in one hour. Try again later.' },
      { status: 429 },
    );
  }

  try {
    const { list } = await loadEditors();
    const next = withEditor(list, email, editor, new Date(), owners());
    await commitFile(EDITORS_FILE, serializeEditors(next), `Editors: invite ${email}`, editor);
    // The commit is the list. Drop the cached copy so the new row is in the
    // answer this request returns, not up to a minute later.
    forgetEditors();
  } catch (error) {
    return Response.json({ error: message(error, 'That invitation could not be saved') }, { status: 400 });
  }

  // The invitation is the same sign-in email a returning editor gets. A refused
  // send is reported honestly: they are on the list either way, and can ask for
  // their own link at /edit.
  let mailed = false;
  try {
    ({ mailed } = await sendSignInLink(email, await publicOrigin(request)));
  } catch (error) {
    console.error(`[inline edit] could not send the invitation to ${email}: ${String(error)}`);
  }

  return Response.json({ ok: true, ...(await panel(editor)), mailed });
}

export async function DELETE(request: Request) {
  const off = editorOffResponse();
  if (off) return off;

  const editor = await currentEditor();
  if (!editor) return Response.json({ error: 'Sign in first' }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { email?: unknown };
  const email = typeof body.email === 'string' ? normalizeEmail(body.email) : '';
  if (!email) return Response.json({ error: 'Which address?' }, { status: 400 });
  if (isOwner(owners(), email)) {
    return Response.json({ error: 'LoudFace addresses are fixed' }, { status: 400 });
  }

  try {
    const { list } = await loadEditors();
    const next = withoutEditor(list, email, owners());
    await commitFile(EDITORS_FILE, serializeEditors(next), `Editors: remove ${email}`, editor);
    forgetEditors();
  } catch (error) {
    return Response.json({ error: message(error, 'That removal could not be saved') }, { status: 400 });
  }

  return Response.json({ ok: true, ...(await panel(editor)) });
}
