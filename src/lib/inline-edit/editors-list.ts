/**
 * Who may edit, as a value.
 *
 * The pure half of `editors.ts`: no disk, no GitHub, no request. Access is two
 * lists added together — the owner addresses in `LF_EDITOR_EMAILS` (us, fixed,
 * not removable from the site) and the invited editors in
 * `src/data/editors.json`, which the panel writes as ordinary commits.
 *
 * It lives apart from `editors.ts`, and free of `server-only`, so the tests can
 * run the parsing, merging and validation the site runs.
 */

/** One invited editor, as stored. */
export type Editor = { email: string; addedBy: string; addedAt: string };
/** The whole file. */
export type EditorList = { editors: Editor[] };

/** Addresses are compared lower-cased and trimmed, everywhere, always. */
export const normalizeEmail = (value: string): string => value.trim().toLowerCase();

/**
 * Good enough to invite: one `@`, something either side, a dot in the domain,
 * no whitespace and no comma (a comma would split an allow-list entry in two).
 * Deliberately not RFC 5322: this decides whether to send an email, and the
 * email either arrives or it does not.
 */
export function isValidEmail(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const email = normalizeEmail(value);
  if (!email || email.length > 254) return false;
  if (/[\s,;<>"\\]/.test(email)) return false;
  return /^[^@]+@[^@.]+(\.[^@.]+)+$/.test(email);
}

/** One stored entry, or null if it is not one. */
function toEditor(value: unknown): Editor | null {
  if (!value || typeof value !== 'object') return null;
  const entry = value as Record<string, unknown>;
  if (!isValidEmail(entry.email)) return null;
  return {
    email: normalizeEmail(entry.email as string),
    addedBy: typeof entry.addedBy === 'string' ? entry.addedBy : '',
    addedAt: typeof entry.addedAt === 'string' ? entry.addedAt : '',
  };
}

/**
 * The file's text as a list.
 *
 * Tolerant on purpose: this file is read on every sign-in attempt, and a
 * half-written or hand-edited copy must cost nobody their access to the site.
 * Malformed JSON reads as an empty list, and an entry that is not an editor is
 * dropped rather than throwing. The owners in `LF_EDITOR_EMAILS` are unaffected
 * either way, so LoudFace can always still get in and fix it.
 */
export function parseEditors(text: string): EditorList {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { editors: [] };
  }
  if (!data || typeof data !== 'object') return { editors: [] };
  const raw = (data as { editors?: unknown }).editors;
  if (!Array.isArray(raw)) return { editors: [] };

  const seen = new Set<string>();
  const editors: Editor[] = [];
  for (const item of raw) {
    const editor = toEditor(item);
    if (!editor || seen.has(editor.email)) continue;
    seen.add(editor.email);
    editors.push(editor);
  }
  return { editors };
}

/** Everyone who may sign in: the owners plus the invited, lower-cased, no repeats, owners first. */
export function mergeAccess(owners: string[], editors: Editor[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const email of [...owners.map(normalizeEmail), ...editors.map((editor) => editor.email)]) {
    if (!email || seen.has(email)) continue;
    seen.add(email);
    out.push(email);
  }
  return out;
}

export const isOwner = (owners: string[], email: string): boolean =>
  owners.map(normalizeEmail).includes(normalizeEmail(email));

/**
 * The list with one more person on the end. Order is kept: the file reads as
 * the order people were invited in, which is what the panel shows.
 *
 * Throws with the sentence the panel shows: a bad address, somebody who is
 * already an editor, or one of our own addresses, which is an owner and needs
 * no invitation.
 */
export function withEditor(
  list: EditorList,
  email: string,
  addedBy: string,
  now: Date | string = new Date(),
  owners: string[] = [],
): EditorList {
  if (!isValidEmail(email)) throw new Error('That does not look like an email address');
  const wanted = normalizeEmail(email);
  if (isOwner(owners, wanted)) throw new Error(`${wanted} is already an owner`);
  if (list.editors.some((editor) => editor.email === wanted)) {
    throw new Error(`${wanted} already has access`);
  }
  const addedAt = typeof now === 'string' ? now : now.toISOString();
  return {
    editors: [...list.editors, { email: wanted, addedBy: normalizeEmail(addedBy), addedAt }],
  };
}

/**
 * The list without one person. An owner is refused: their address comes from
 * `LF_EDITOR_EMAILS` and is not in this file, so removing it here would report
 * success and change nothing.
 */
export function withoutEditor(list: EditorList, email: string, owners: string[] = []): EditorList {
  const wanted = normalizeEmail(email);
  if (isOwner(owners, wanted)) throw new Error('LoudFace addresses are fixed');
  if (!list.editors.some((editor) => editor.email === wanted)) {
    throw new Error(`${wanted} is not on the list`);
  }
  return { editors: list.editors.filter((editor) => editor.email !== wanted) };
}

/**
 * The file's text. Pretty-printed with a trailing newline and the fields always
 * in the same order, so an invite is a one-line diff in the commit.
 */
export function serializeEditors(list: EditorList): string {
  const editors = list.editors.map(({ email, addedBy, addedAt }) => ({ email, addedBy, addedAt }));
  return `${JSON.stringify({ editors }, null, 2)}\n`;
}

/** How long a sign-in link lasts, in minutes. */
export const SIGN_IN_MINUTES = 15;
export const INVITE_LINK_MINUTES = 12 * 60;
/** An invite counts as fresh for this long after it was committed. */
export const FRESH_INVITE_MINUTES = 15;

/**
 * The first link after an invite lasts 12 hours (Arnel, 2026-09-18: "Can we
 * make it a 12-hour invite?"); a person asking for a link at /edit later gets
 * the everyday 15 minutes. "Fresh" is read off the invite's own timestamp in
 * the editor file, so nothing has to be passed between the team app and the
 * site: the address was added a moment ago, therefore this is the invitation.
 */
export function freshInvite(editors: Editor[], email: string, now = new Date()): Editor | null {
  const wanted = normalizeEmail(email);
  const entry = editors.find((e) => normalizeEmail(e.email) === wanted);
  if (!entry?.addedAt) return null;
  const added = Date.parse(entry.addedAt);
  if (Number.isNaN(added)) return null;
  const age = now.getTime() - added;
  return age >= 0 && age <= FRESH_INVITE_MINUTES * 60_000 ? entry : null;
}

export const signInMinutesFor = (invite: Editor | null): number =>
  invite ? INVITE_LINK_MINUTES : SIGN_IN_MINUTES;
