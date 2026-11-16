/**
 * The People panel's rules as values: who may be invited as what, what the
 * panel says after each outcome, and the one list of everyone with access.
 *
 * Pure, so the tests can pin the wording the panel shows. The routes keep the
 * real permissions; this decides what is offered and what is said.
 */
import { INVITE_LINK_MINUTES, SIGN_IN_MINUTES, isValidEmail, normalizeEmail } from './editors-list';

export type InviteRole = 'edit' | 'comment';
export type ExistingRole = 'owner' | InviteRole;

export const ROLE_OPTIONS: { role: InviteRole; label: string; detail: string }[] = [
  { role: 'edit', label: 'Can edit', detail: 'changes text, pictures and links, and publishes' },
  { role: 'comment', label: 'Can comment', detail: 'leaves notes on the page, changes nothing' },
];

export const NOT_OWNER_NOTE = 'Only LoudFace can add editors. Ask your LoudFace contact.';
export const EMPTY_ACCESS_NOTE = 'Only LoudFace has access so far.';
export const SHARE_LINK_NOTE =
  'Anyone with this link can ask to comment. They confirm their email first. It never lets anyone edit.';
export const INVALID_EMAIL = 'That does not look like an email address';
export const REMOVED_NOTE = 'Removed. Their current session ends within 8 hours.';
export const OFFLINE_NOTE = 'Could not reach the site, try again';

export const NEXT_STEPS = (address: string): string[] => [
  'They get an email with a sign-in link.',
  'They open it and they are in. No password, no account to create.',
  `To come back later they go to ${address} and type their email.`,
];

/** "12 hours", "1 hour", "15 minutes": a link's lifetime the way a person says it. */
export function lifetimeLabel(minutes: number): string {
  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return `${hours} hour${hours === 1 ? '' : 's'}`;
  }
  return `${minutes} minute${minutes === 1 ? '' : 's'}`;
}

/** How long the link in an invitation to this role works. */
export const inviteLifetime = (role: InviteRole): string =>
  lifetimeLabel(role === 'edit' ? INVITE_LINK_MINUTES : SIGN_IN_MINUTES);

/** Owners may offer both roles; anyone else may only offer comments. */
export const roleAllowed = (owner: boolean, role: InviteRole): boolean => owner || role === 'comment';

/** The role the choice shows: the one picked if it is allowed, else the first allowed one. */
export function effectiveRole(chosen: InviteRole | null, owner: boolean): InviteRole {
  if (chosen && roleAllowed(owner, chosen)) return chosen;
  return owner ? 'edit' : 'comment';
}

export type AccessLists = {
  owners: string[];
  editors: string[];
  commenters: string[];
};

/** What an address can already do on the site, the strongest first. */
export function existingRole(email: string, lists: AccessLists): ExistingRole | null {
  const wanted = normalizeEmail(email);
  const has = (list: string[]) => list.some((entry) => normalizeEmail(entry) === wanted);
  if (has(lists.owners)) return 'owner';
  if (has(lists.editors)) return 'edit';
  if (has(lists.commenters)) return 'comment';
  return null;
}

/**
 * The sentence for an address that needs no invitation, or null when inviting
 * is still worth doing. Someone who can only comment may be invited to edit.
 */
export function alreadyHasAccess(email: string, existing: ExistingRole | null, wanted: InviteRole): string | null {
  const address = normalizeEmail(email);
  if (existing === 'owner') return `${address} is already an owner and has full access`;
  if (existing === 'edit') {
    return wanted === 'edit'
      ? `${address} can already edit this site`
      : `${address} can already edit this site, so they can comment too`;
  }
  if (existing === 'comment' && wanted === 'comment') return `${address} can already comment on this site`;
  return null;
}

/** The sentence for an address the panel will not send, or null when it may be sent. */
export function invalidInvite(email: string): string | null {
  const address = normalizeEmail(email);
  // A pipe separates the fields of a sign-in token (the commenters route refuses it too).
  return isValidEmail(address) && !address.includes('|') ? null : INVALID_EMAIL;
}

export type InviteOutcome = { kind: 'sent' | 'unmailed'; text: string };

/** What the panel says once the server has saved the invitation. */
export function inviteOutcome(role: InviteRole, email: string, mailed: boolean, address: string): InviteOutcome {
  const target = normalizeEmail(email);
  if (mailed) {
    return { kind: 'sent', text: `Invitation sent to ${target}. The link in it works for ${inviteLifetime(role)}.` };
  }
  return {
    kind: 'unmailed',
    text: `${target} has access now, but the email did not go out. Send them this address: ${address} — they type their email there and get a link.`,
  };
}

/** " on 18 September 2026" is not shown for a missing or unreadable stamp. */
export function addedDate(addedAt: string): string {
  const when = new Date(addedAt);
  if (!addedAt || Number.isNaN(when.getTime())) return '';
  return when.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

const nameOf = (email: string): string => email.split('@')[0] || 'someone';

export type PersonRow = {
  email: string;
  role: ExistingRole;
  detail: string;
  you: boolean;
  /** Which list a removal goes to; null for an owner, who cannot be removed. */
  removeFrom: 'editors' | 'commenters' | null;
};

export type AccessInput = {
  owners: { email: string }[];
  editors: { email: string; addedBy: string; addedAt: string }[];
  you: string;
  owner: boolean;
};
export type CommenterInput = { email: string; addedBy: string; addedVia: string; addedAt: string };

/**
 * The one list: owners, then editors, then commenters. Someone who is both an
 * editor and a commenter is listed once, as the stronger role. Remove appears
 * only for owners, which is who the routes let remove anyone.
 */
export function peopleRows(access: AccessInput, commenters: CommenterInput[]): PersonRow[] {
  const you = normalizeEmail(access.you);
  const seen = new Set<string>();
  const rows: PersonRow[] = [];
  const add = (row: Omit<PersonRow, 'you'>) => {
    const key = normalizeEmail(row.email);
    if (seen.has(key)) return;
    seen.add(key);
    rows.push({ ...row, you: key === you });
  };
  for (const person of access.owners) {
    add({ email: person.email, role: 'owner', detail: 'Owner · LoudFace', removeFrom: null });
  }
  for (const person of access.editors) {
    const date = addedDate(person.addedAt);
    add({
      email: person.email,
      role: 'edit',
      detail: `Can edit · added by ${nameOf(person.addedBy)}${date ? `, ${date}` : ''}`,
      removeFrom: access.owner ? 'editors' : null,
    });
  }
  for (const person of commenters) {
    add({
      email: person.email,
      role: 'comment',
      detail:
        person.addedVia === 'link'
          ? 'Can comment · joined with the share link'
          : `Can comment · invited by ${nameOf(person.addedBy)}`,
      removeFrom: access.owner ? 'commenters' : null,
    });
  }
  return rows;
}

/** True when nobody but the owners has access, which is when the list says so. */
export const onlyOwners = (rows: PersonRow[]): boolean => rows.every((row) => row.role === 'owner');
