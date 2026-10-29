import 'server-only';

/**
 * The sign-in email, in one place.
 *
 * Both the sign-in page and the Editors panel send the same mail: an invited
 * person and a returning one get an identical link, so there is one message to
 * keep right and one place a failure is logged.
 *
 * The log carries the reason a send was refused, never the link — a sign-in
 * link in a log is a way in.
 */
import { createJoinToken, createSignInToken } from './session';
import { loadEditors } from './editors';
import { SIGN_IN_MINUTES, freshInvite, signInMinutesFor } from './editors-list';

export type SignInMail = {
  /** The link itself. Never logged, never put in a response a stranger can read. */
  link: string;
  /** A mail service is configured on this site. */
  configured: boolean;
  /** The mail service accepted it. False when it refused, or when none is configured. */
  mailed: boolean;
};

/** Build the link for `email` and, if a mail service is configured, send it. */
export async function sendSignInLink(email: string, origin: string): Promise<SignInMail> {
  // A freshly invited address gets the invitation: a 12-hour link and a line
  // naming who invited them. Everyone else gets the everyday 15-minute link.
  const { list } = await loadEditors().catch(() => ({ list: { editors: [] } }));
  const invite = freshInvite(list.editors, email);
  const minutes = signInMinutesFor(invite);
  const host = origin.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const link = `${origin.replace(/\/$/, '')}/api/lf-edit/verify?token=${createSignInToken(email, minutes)}`;
  const subject = invite ? `You can now edit ${host}` : 'Your link to edit the site';
  const text = invite
    ? `${invite.addedBy || 'LoudFace'} invited you to edit ${host}.\n\nOpen this link to start. It lasts 12 hours. You can change text, pictures and links on the page and press Publish; the site shows you when the change is live.\n\n${link}\n\nLater, type your email at https://${host}/edit for a new link any time.\n`
    : `Open this link to edit the site. It lasts 12 hours.\n\n${link}\n`;
  return deliver(email, subject, text, link);
}

/**
 * A commenter's link (2026-10-29): the same 12-hour sign-in, worded for
 * comments, naming who invited them when somebody did.
 */
export async function sendCommentSignInLink(
  email: string,
  origin: string,
  invitedBy?: string,
): Promise<SignInMail> {
  const host = origin.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const link = `${origin.replace(/\/$/, '')}/api/lf-edit/verify?token=${createSignInToken(email, SIGN_IN_MINUTES)}`;
  const subject = invitedBy ? `${invitedBy} invited you to comment on ${host}` : `Your link to comment on ${host}`;
  const text = invitedBy
    ? `${invitedBy} invited you to leave comments on ${host}.\n\nOpen this link to start. It lasts 12 hours. Press Comment, or the C key, and click anywhere on the page to leave a note; everyone working on the site sees it.\n\n${link}\n\nLater, type your email at https://${host}/edit for a new link any time.\n`
    : `Open this link to comment on ${host}. It lasts 12 hours.\n\n${link}\n`;
  return deliver(email, subject, text, link);
}

/**
 * The answer to a share link: proof that the address is theirs. Only this
 * link, opened, adds them as a commenter (`verify` route), so a typed address
 * is never added on its own.
 */
export async function sendJoinLink(email: string, origin: string, linkToken: string): Promise<SignInMail> {
  const host = origin.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const link = `${origin.replace(/\/$/, '')}/api/lf-edit/verify?token=${createJoinToken(email, linkToken)}`;
  const subject = `Confirm your email to comment on ${host}`;
  const text = `You asked to leave comments on ${host}.\n\nOpen this link to confirm it is your address and start. It lasts 12 hours. Press Comment, or the C key, and click anywhere on the page to leave a note.\n\n${link}\n\nIf you did not ask for this, ignore this email; nothing happens until the link is opened.\n`;
  return deliver(email, subject, text, link);
}

/** Send one sign-in mail through Resend, or log it in development. */
async function deliver(email: string, subject: string, text: string, link: string): Promise<SignInMail> {
  // The editor's own key first (2026-10-29): a client site may already hold a
  // RESEND_API_KEY for its contact form, on another Resend account that cannot
  // send from our sender. Eight Strands did.
  const key = process.env.LF_EDIT_RESEND_KEY || process.env.RESEND_API_KEY;
  const from = process.env.LF_EDIT_FROM;
  if (!key || !from) {
    if (process.env.NODE_ENV !== 'production') {
      // No mail service configured: in development the link is logged, so
      // testing needs no inbox.
      console.log(`\n[inline edit] sign-in link for ${email}:\n${link}\n`);
    }
    return { link, configured: false, mailed: false };
  }

  const sent = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from,
      to: email,
      subject,
      text,
    }),
  }).catch(() => null);

  // A refused send used to look exactly like a delivered one: the client waited
  // for a mail that was never going out.
  if (!sent || !sent.ok) {
    const detail = sent ? `${sent.status} ${(await sent.text().catch(() => '')).slice(0, 300)}` : 'no response';
    console.error(`[inline edit] Resend did not accept the sign-in email: ${detail}`);
    return { link, configured: true, mailed: false };
  }
  return { link, configured: true, mailed: true };
}
