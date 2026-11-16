/**
 * The sign-in mails, HTML and plain text. Pure string work, free of
 * `server-only`, so the tests can read what a client's inbox gets. Every
 * interpolated value is escaped: a host, a name and a link all come from
 * outside this file. Tables and inline styles only, so it renders in every
 * mail client, and it reads with images blocked.
 */
import { BRAND, BRAND_TINT, firstName } from './brand';

export type MailKind = 'edit' | 'comment' | 'join' | 'signin';

export type MailHtmlInput = {
  kind: MailKind;
  host: string;
  /** The site's origin, where the invitation screenshots are served from. */
  origin: string;
  link: string;
  /** Who invited them; empty for a returning sign-in or a share-link join. */
  invitedBy?: string;
  /** "12 hours". */
  lifetime: string;
};

type Invitation = Extract<MailKind, 'edit' | 'comment'>;
type Step = { title: string; line: string };

const COLOR = {
  ground: '#f4f6f8',
  card: '#ffffff',
  border: '#e3e8ee',
  ink: '#0d1b2a',
  body: '#334155',
  muted: '#5b6b7b',
  faint: '#8a97a5',
  brand: BRAND,
  tint: BRAND_TINT,
  onBrand: '#ffffff',
};

const FONT = "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const CARD_WIDTH = 560;
const PAD = '32px 5.7%';
const THUMB_ALT = 'The site with the editing bar on top and a headline being edited';
const THUMB_CAPTION = 'This is what opens: your own site, with an editing bar on top.';
const BRAND_LINE = 'Site editor by LoudFace';
const STEPS_LABEL = 'How it works';

const BUTTON: Record<MailKind, string> = {
  edit: 'Open the site editor',
  signin: 'Open the site editor',
  comment: 'Start commenting',
  join: 'Confirm my email',
};

const PREHEADER: Record<MailKind, string> = {
  edit: 'Open the link to start. No password, nothing to install.',
  comment: 'Open the link to start. No password, nothing to install.',
  signin: 'Open the link to sign in. No password needed.',
  join: 'Open the link to confirm your email. No password needed.',
};

const LEAD: Record<MailKind, string> = {
  edit: 'You can now change the words, pictures and links on the site yourself, right on the page. No password, and nothing to install.',
  comment: 'You can now leave notes right on the page for the people working on the site. No password, and nothing to install.',
  signin: 'Open the link to get back to editing. No password needed.',
  join: 'Confirm this is your address to start leaving comments.',
};

const STEPS: Record<Invitation, Step[]> = {
  edit: [
    { title: 'Click any text or picture', line: 'Anything outlined in blue can be changed. You type right on the page.' },
    { title: 'Press Publish', line: 'Your change is live on the site in about a minute.' },
    { title: 'Changed your mind?', line: 'History lists every change, each with an Undo button.' },
  ],
  comment: [
    { title: 'Press Comment', line: 'It is in the bar at the top of the page.' },
    { title: 'Click anywhere and type your note', line: 'A numbered pin marks the exact spot.' },
    { title: 'Everyone on the site sees it', line: 'They can reply, and mark it done.' },
  ],
};

const isInvitation = (kind: MailKind): kind is Invitation => kind === 'edit' || kind === 'comment';

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export const buttonLabel = (kind: MailKind): string => BUTTON[kind];

/** The headline: who invited them, to what, on which site. */
export function headline({ kind, host, invitedBy }: Pick<MailHtmlInput, 'kind' | 'host' | 'invitedBy'>): string {
  if (kind === 'edit') return invitedBy ? `${firstName(invitedBy)} invited you to edit ${host}` : `You can now edit ${host}`;
  if (kind === 'comment') {
    return invitedBy ? `${firstName(invitedBy)} invited you to comment on ${host}` : `You can now comment on ${host}`;
  }
  if (kind === 'join') return `Confirm your email to comment on ${host}`;
  return `Sign in to edit ${host}`;
}

/** "The button works for 12 hours. After that, ..." */
export const lifetimeLine = ({ host, lifetime }: Pick<MailHtmlInput, 'host' | 'lifetime'>): string =>
  `The button works for ${lifetime}. After that, go to ${host}/edit, type this email address, and you get a fresh link.`;

/** The small print: why this mail arrived and what to do if it was not expected. */
export function reasonLine({ kind, host, invitedBy }: Pick<MailHtmlInput, 'kind' | 'host' | 'invitedBy'>): string {
  if (isInvitation(kind)) {
    const why = invitedBy ? `${invitedBy} added you to ${host}` : `you were added to ${host}`;
    return `You received this because ${why}. If you did not expect it, you can ignore this email.`;
  }
  if (kind === 'join') {
    return 'If you did not ask for this, ignore this email; nothing happens until the link is opened.';
  }
  return `You received this because a sign-in link was asked for on ${host}. If that was not you, you can ignore this email.`;
}

const paragraph = (style: string, inner: string): string => `<p style="margin:0;${FONT};${style}">${inner}</p>`;
const spacer = (px: number): string => `<tr><td style="height:${px}px;line-height:${px}px;font-size:1px">&nbsp;</td></tr>`;
const row = (inner: string): string => `<tr><td style="padding:0">${inner}</td></tr>`;

function button(label: string, link: string): string {
  const anchor = `<a href="${escapeHtml(link)}" style="display:inline-block;padding:0 24px;height:44px;line-height:44px;border-radius:8px;${FONT};font-size:16px;font-weight:600;color:${COLOR.onBrand};text-decoration:none;white-space:nowrap">${escapeHtml(label)}</a>`;
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="${COLOR.brand}" style="background:${COLOR.brand};border-radius:8px;height:44px">${anchor}</td></tr></table>`;
}

function thumbnail({ kind, origin, link }: Pick<MailHtmlInput, 'kind' | 'origin' | 'link'>): string {
  const src = `${origin.replace(/\/$/, '')}/editor-invite/${kind}.jpg`;
  const image = `<img src="${escapeHtml(src)}" alt="${THUMB_ALT}" width="496" style="display:block;width:100%;max-width:496px;height:auto;border:1px solid ${COLOR.border};border-radius:10px;${FONT};font-size:13px;color:${COLOR.muted}">`;
  return [
    `<a href="${escapeHtml(link)}" style="text-decoration:none">${image}</a>`,
    `<div style="height:8px;line-height:8px;font-size:1px">&nbsp;</div>`,
    paragraph(`font-size:13px;line-height:1.4;color:${COLOR.muted}`, THUMB_CAPTION),
  ].join('');
}

function stepRow(number: number, { title, line }: Step): string {
  const circle = `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="28" height="28" align="center" valign="middle" bgcolor="${COLOR.tint}" style="width:28px;height:28px;border-radius:14px;background:${COLOR.tint};${FONT};font-size:14px;font-weight:600;line-height:28px;color:${COLOR.brand};text-align:center">${number}</td></tr></table>`;
  const text = [
    paragraph(`font-size:15px;font-weight:600;line-height:28px;color:${COLOR.ink}`, escapeHtml(title)),
    paragraph(`font-size:14px;line-height:20px;color:${COLOR.muted}`, escapeHtml(line)),
  ].join('');
  return `<tr><td width="28" valign="top" style="width:28px;padding:0 0 16px">${circle}</td><td valign="top" style="padding:0 0 16px 12px">${text}</td></tr>`;
}

function steps(kind: Invitation): string {
  const rows = STEPS[kind].map((step, index) => stepRow(index + 1, step)).join('');
  return [
    paragraph(`font-size:13px;font-weight:600;line-height:1.4;color:${COLOR.muted}`, STEPS_LABEL),
    `<div style="height:12px;line-height:12px;font-size:1px">&nbsp;</div>`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>`,
  ].join('');
}

const divider = `<div style="height:1px;line-height:1px;font-size:1px;background:${COLOR.border}">&nbsp;</div>`;

export function buildSignInHtml(input: MailHtmlInput): string {
  const { kind, host, link, lifetime } = input;
  const safeLink = escapeHtml(link);
  const blocks = [
    row(paragraph(`font-size:13px;line-height:1.4;color:${COLOR.muted}`, `${escapeHtml(host)} · Site editor`)),
    spacer(12),
    row(paragraph(`font-size:24px;line-height:1.25;font-weight:700;color:${COLOR.ink}`, escapeHtml(headline(input)))),
    spacer(12),
    row(paragraph(`font-size:16px;line-height:1.5;color:${COLOR.body}`, escapeHtml(LEAD[kind]))),
    spacer(24),
    row(button(buttonLabel(kind), link)),
    ...(isInvitation(kind) ? [spacer(24), row(thumbnail(input)), spacer(28), row(steps(kind))] : []),
    spacer(isInvitation(kind) ? 12 : 28),
    row(divider),
    spacer(20),
    row(paragraph(`font-size:14px;line-height:1.5;color:${COLOR.muted}`, escapeHtml(lifetimeLine({ host, lifetime })))),
    spacer(20),
    row(paragraph(`font-size:12px;line-height:1.5;color:${COLOR.faint}`, escapeHtml(reasonLine(input)))),
    spacer(8),
    row(paragraph(`font-size:12px;line-height:1.5;color:${COLOR.faint};word-break:break-all`, safeLink)),
  ].join('');

  const card = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:${CARD_WIDTH}px;background:${COLOR.card};border:1px solid ${COLOR.border};border-radius:12px"><tr><td style="padding:${PAD}"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${blocks}</table></td></tr></table>`;
  const preheader = `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;font-size:1px;line-height:1px">${escapeHtml(PREHEADER[kind])}</div>`;
  const credit = paragraph(`font-size:12px;line-height:1.4;color:${COLOR.faint};text-align:center;padding-top:16px`, BRAND_LINE);
  return [
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"></head>',
    `<body style="margin:0;padding:0;background:${COLOR.ground}">`,
    preheader,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${COLOR.ground}" style="background:${COLOR.ground}"><tr><td align="center" style="padding:24px 12px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:${CARD_WIDTH}px"><tr><td>${card}</td></tr><tr><td>${credit}</td></tr></table></td></tr></table>`,
    '</body></html>',
  ].join('');
}

/** The same mail as plain text: headline, lead, link, the steps, the lifetime, the reason. */
export function buildSignInText(input: MailHtmlInput): string {
  const { kind, link } = input;
  const how = isInvitation(kind)
    ? [`${STEPS_LABEL}:`, ...STEPS[kind].map((step, index) => `${index + 1}. ${step.title}. ${step.line}`), '']
    : [];
  return [
    `${headline(input)}.`,
    '',
    LEAD[kind],
    '',
    `${buttonLabel(kind)}: ${link}`,
    '',
    ...how,
    lifetimeLine(input),
    '',
    reasonLine(input),
    '',
    BRAND_LINE,
    '',
  ].join('\n');
}
