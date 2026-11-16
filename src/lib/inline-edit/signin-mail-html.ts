/**
 * The HTML half of the sign-in mails. Pure string work, free of `server-only`,
 * so the tests can read what a client's inbox gets. Every interpolated value is
 * escaped: a host, a name and a link all come from outside this file.
 */

export type MailKind = 'edit' | 'comment' | 'join' | 'signin';

export type MailHtmlInput = {
  kind: MailKind;
  host: string;
  link: string;
  /** Who invited them; empty for a returning sign-in or a share-link join. */
  invitedBy?: string;
  /** "12 hours". */
  lifetime: string;
};

const BUTTON: Record<MailKind, string> = {
  edit: 'Open the site editor',
  signin: 'Open the site editor',
  comment: 'Start commenting',
  join: 'Confirm my email',
};

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** The one sentence that opens the mail: who, and which site. */
export function introSentence({ kind, host, invitedBy }: Pick<MailHtmlInput, 'kind' | 'host' | 'invitedBy'>): string {
  const who = invitedBy || 'LoudFace';
  if (kind === 'edit') return `${who} invited you to edit ${host}.`;
  if (kind === 'comment') return invitedBy ? `${invitedBy} invited you to leave comments on ${host}.` : `Here is your link to comment on ${host}.`;
  if (kind === 'join') return `You asked to leave comments on ${host}. Confirm this is your address to start.`;
  return `Here is your sign-in link for ${host}.`;
}

export const buttonLabel = (kind: MailKind): string => BUTTON[kind];

export function buildSignInHtml(input: MailHtmlInput): string {
  const { kind, host, link, lifetime } = input;
  const safeLink = escapeHtml(link);
  const font = "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
  const ignore = kind === 'join' ? ' If you did not ask for this, ignore this email; nothing happens until the link is opened.' : '';
  return [
    `<div style="${font};max-width:480px;margin:0 auto;padding:24px;color:#14212b;font-size:15px;line-height:1.5">`,
    `<p style="margin:0 0 20px">${escapeHtml(introSentence(input))}</p>`,
    `<p style="margin:0 0 20px"><a href="${safeLink}" style="display:inline-block;padding:12px 20px;border-radius:8px;background:#4f46e5;color:#ffffff;font-weight:600;text-decoration:none">${escapeHtml(buttonLabel(kind))}</a></p>`,
    `<p style="margin:0 0 20px;color:#5b6b7a;font-size:14px">The link works for ${escapeHtml(lifetime)}. Later, go to ${escapeHtml(host)}/edit and type this email address for a new link. No password needed.${escapeHtml(ignore)}</p>`,
    `<p style="margin:0;color:#8a97a4;font-size:12px;word-break:break-all">${safeLink}</p>`,
    `</div>`,
  ].join('');
}
