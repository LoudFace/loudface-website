import 'server-only';

/**
 * Writing content back, and undoing it.
 *
 * A publish is one git commit: every value the editor changed, written into the
 * files they came from, committed in the editor's name. That gives us history,
 * an audit trail and an undo for free — undo is itself a commit, so nothing is
 * ever lost.
 *
 * Two places a commit can be made:
 *   - the working copy, in development (`git` on this machine);
 *   - the repository on GitHub, in production, where there is no working copy
 *     and no writable disk. Same commit, built over the API.
 *
 * Values are replaced in the file's own text rather than by re-serialising the
 * document, so a copy change stays a one-line diff a human can review.
 *
 * Every commit carries a machine-readable trailer, `LF-Changes`, listing each
 * field with its old and new value. Undo on GitHub reads that trailer and puts
 * the old values back — but only if the field still holds the value the commit
 * gave it. A later edit is never silently overwritten.
 */
import { execFile } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { cleanValue } from './sanitize';
import {
  commitDetail,
  commitFiles,
  commitsTouching,
  hasGitHubCredentials,
  headSha,
  readFileAt,
  repoFromEnv,
  type Repo,
} from './github';

const run = promisify(execFile);

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, 'src', 'data', 'content');
const CONTENT_PREFIX = 'src/data/content/';
const FILE_NAME = /^[a-z0-9-]+$/;
const PATH_SEGMENT = /^[A-Za-z0-9_]+$/;
const TRAILER = 'LF-Changes';

export type Change = { id: string; value: string };
export type Applied = { id: string; file: string; path: string; before: string; after: string };
export type Mode = 'git' | 'github';
/** What an undo put back on the page: each field and the text it now carries again. */
export type Undone = { hash: string; restored: Change[] };

export type Publish = {
  hash: string;
  date: string;
  editor: string;
  summary: string;
  fields: string[];
  reverted: boolean;
};

/** Where publishes go. GitHub whenever we have credentials for it, unless told otherwise. */
export function mode(): Mode {
  const forced = process.env.LF_EDIT_STORE;
  if (forced === 'git' || forced === 'github') return forced;
  return hasGitHubCredentials() && repoFromEnv() ? 'github' : 'git';
}

// ---------------------------------------------------------------------------
// Pure part: one change against one file's text
// ---------------------------------------------------------------------------

function parseId(id: string): { file: string; segments: string[]; fieldPath: string } {
  const [file, fieldPath] = id.split(':');
  if (!file || !fieldPath || !FILE_NAME.test(file)) throw new Error(`Bad content id: ${id}`);
  const segments = fieldPath.split('.');
  if (!segments.length || !segments.every((segment) => PATH_SEGMENT.test(segment))) {
    throw new Error(`Bad field path: ${fieldPath}`);
  }
  return { file, segments, fieldPath };
}

function walk(root: unknown, segments: string[]): { parent: Record<string, unknown>; key: string } | null {
  let node: unknown = root;
  for (let i = 0; i < segments.length - 1; i++) {
    if (typeof node !== 'object' || node === null) return null;
    node = (node as Record<string, unknown>)[segments[i]];
  }
  const key = segments[segments.length - 1];
  if (typeof node !== 'object' || node === null) return null;
  const parent = node as Record<string, unknown>;
  return key in parent ? { parent, key } : null;
}

/** Read one string field out of a file's text. */
export function readField(raw: string, id: string): string {
  const { file, segments, fieldPath } = parseId(id);
  const target = walk(JSON.parse(raw), segments);
  if (!target) throw new Error(`${fieldPath} does not exist in ${file}.json`);
  const value = target.parent[target.key];
  if (typeof value !== 'string') throw new Error('Only text values are editable');
  return value;
}

/**
 * Write one value into a file's text. `next` is the new file text; the value is
 * cleaned against what it replaces, so plain stays plain and rich keeps its links.
 * Pass `exact` to skip cleaning (undo restores a stored value verbatim).
 */
export function applyToText(
  raw: string,
  id: string,
  value: string,
  exact = false,
): { next: string; before: string; after: string } {
  const { file, segments, fieldPath } = parseId(id);
  const json = JSON.parse(raw);
  const target = walk(json, segments);
  if (!target) throw new Error(`${fieldPath} does not exist in ${file}.json`);
  if (typeof target.parent[target.key] !== 'string') throw new Error('Only text values are editable');

  const before = target.parent[target.key] as string;
  const after = exact ? value : cleanValue(value, before);
  if (!after) throw new Error('A value cannot be emptied from the page');
  if (after === before) return { next: raw, before, after };

  // Replace the value in the file's own text so the diff stays one line. An
  // object member is matched with its key; a list item is matched on its own,
  // as long as the same string appears nowhere else in the file.
  const inList = Array.isArray(target.parent);
  const needle = inList ? JSON.stringify(before) : `${JSON.stringify(target.key)}: ${JSON.stringify(before)}`;
  const first = raw.indexOf(needle);
  const unique = first !== -1 && raw.indexOf(needle, first + 1) === -1;

  let next: string;
  if (unique) {
    const replacement = inList ? JSON.stringify(after) : `${JSON.stringify(target.key)}: ${JSON.stringify(after)}`;
    next = raw.slice(0, first) + replacement + raw.slice(first + needle.length);
    JSON.parse(next); // never write a file we cannot read back
  } else {
    target.parent[target.key] = after;
    next = JSON.stringify(json, null, 2) + '\n';
  }
  return { next, before, after };
}

/** Apply a batch of changes to the files they touch. `read` fetches a file's current text. */
async function applyAll(
  changes: Change[],
  read: (file: string) => Promise<string>,
): Promise<{ files: Record<string, string>; applied: Applied[] }> {
  const texts = new Map<string, string>();
  const applied: Applied[] = [];

  for (const change of changes) {
    const { file, fieldPath } = parseId(change.id);
    const raw = texts.get(file) ?? (await read(file));
    const result = applyToText(raw, change.id, change.value);
    texts.set(file, result.next);
    applied.push({ id: change.id, file, path: fieldPath, before: result.before, after: result.after });
  }

  const files: Record<string, string> = {};
  for (const [file, text] of texts) files[`${CONTENT_PREFIX}${file}.json`] = text;
  return { files, applied };
}

// ---------------------------------------------------------------------------
// Commit messages
// ---------------------------------------------------------------------------

function summaryOf(applied: Applied[]): string {
  const real = applied.filter((change) => change.before !== change.after);
  if (real.length === 1) return `Content: ${real[0].file}:${real[0].path}`;
  return `Content: ${real.length} values on ${new Set(real.map((a) => a.file)).size} page(s)`;
}

function messageOf(summary: string, applied: Applied[], extra = ''): string {
  const real = applied.filter((change) => change.before !== change.after);
  const body = real
    .map((change) => `- ${change.file}:${change.path}\n  was: ${oneLine(change.before)}\n  now: ${oneLine(change.after)}`)
    .join('\n');
  const trailer = `${TRAILER}: ${Buffer.from(
    JSON.stringify(real.map(({ id, before, after }) => ({ id, before, after }))),
  ).toString('base64')}`;
  const parts = [summary, '', body];
  if (extra) parts.push('', extra);
  parts.push('', trailer);
  return parts.join('\n');
}

const oneLine = (value: string) => value.replace(/\s+/g, ' ').slice(0, 200);

function trailerOf(message: string): { id: string; before: string; after: string }[] | null {
  const match = new RegExp(`^${TRAILER}: ([A-Za-z0-9+/=]+)$`, 'm').exec(message);
  if (!match) return null;
  try {
    return JSON.parse(Buffer.from(match[1], 'base64').toString('utf8'));
  } catch {
    return null;
  }
}

function fieldsOf(message: string): string[] {
  const trailer = trailerOf(message);
  if (trailer) return trailer.map((change) => change.id);
  return [...message.matchAll(/^- (\S+)/gm)].map((match) => match[1]);
}

const isPublish = (summary: string) =>
  summary.startsWith('Content:') || summary.startsWith('Revert "Content:');

function toPublishes(
  commits: { sha: string; date: string; email: string; message: string }[],
  limit: number,
): Publish[] {
  const reverted = new Set(
    commits.flatMap((commit) =>
      [...commit.message.matchAll(/This reverts commit ([0-9a-f]{40})/g)].map((match) => match[1]),
    ),
  );
  return commits
    .map((commit) => {
      const summary = commit.message.split('\n')[0];
      return {
        hash: commit.sha,
        date: commit.date,
        editor: commit.email,
        summary,
        fields: fieldsOf(commit.message),
        reverted: reverted.has(commit.sha),
      };
    })
    .filter((entry) => isPublish(entry.summary))
    .slice(0, limit);
}

const author = (editor: string) => ({ name: `${editor.split('@')[0]} (site editor)`, email: editor });

// ---------------------------------------------------------------------------
// Backend: the working copy (development)
// ---------------------------------------------------------------------------

async function git(args: string[]): Promise<string> {
  const { stdout } = await run('git', args, { cwd: ROOT, maxBuffer: 4_000_000 });
  return stdout.trim();
}

const localStore = {
  async publish(changes: Change[], editor: string): Promise<{ hash: string; applied: Applied[] }> {
    const { files, applied } = await applyAll(changes, (file) =>
      readFile(path.join(CONTENT_DIR, `${file}.json`), 'utf8'),
    );
    const real = applied.filter((change) => change.before !== change.after);
    if (!real.length) return { hash: '', applied };

    for (const [file, text] of Object.entries(files)) await writeFile(path.join(ROOT, file), text, 'utf8');
    const paths = Object.keys(files);
    await git(['add', ...paths]);
    if (!(await git(['status', '--porcelain', '--', ...paths]))) return { hash: '', applied };

    const who = author(editor);
    await git([
      '-c', `user.name=${who.name}`, '-c', `user.email=${who.email}`,
      'commit', '-m', messageOf(summaryOf(applied), applied), '--only', ...paths,
    ]);
    if (process.env.LF_EDIT_PUSH === '1') await git(['push', 'origin', 'HEAD']);
    return { hash: await git(['rev-parse', 'HEAD']), applied };
  },

  async history(limit: number): Promise<Publish[]> {
    const log = await git(['log', `-n${limit * 2}`, '--format=%H%x1f%aI%x1f%ae%x1f%B%x1e', '--', CONTENT_PREFIX]);
    if (!log) return [];
    const commits = log
      .split('\x1e')
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const [sha, date, email, message = ''] = entry.split('\x1f');
        return { sha, date, email, message };
      });
    return toPublishes(commits, limit);
  },

  async undo(hash: string, editor: string): Promise<Undone> {
    if (!/^[0-9a-f]{7,40}$/.test(hash)) throw new Error('Not a commit');
    const touched = (await git(['show', '--name-only', '--format=', hash])).split('\n').filter(Boolean);
    const outside = touched.filter((file) => !file.startsWith(CONTENT_PREFIX));
    if (outside.length) throw new Error(`That change also touched ${outside[0]}; undo it in code, not here`);
    const recorded = trailerOf(await git(['show', '--no-patch', '--format=%B', hash])) ?? [];
    const who = author(editor);
    await git(['-c', `user.name=${who.name}`, '-c', `user.email=${who.email}`, 'revert', '--no-edit', hash]);
    if (process.env.LF_EDIT_PUSH === '1') await git(['push', 'origin', 'HEAD']);
    return { hash: (await git(['rev-parse', 'HEAD'])).trim(), restored: recorded.map(({ id, before }) => ({ id, value: before })) };
  },
};

// ---------------------------------------------------------------------------
// Backend: the repository on GitHub (production)
// ---------------------------------------------------------------------------

function repo(): Repo {
  const value = repoFromEnv();
  if (!value) throw new Error('LF_GITHUB_REPO is not set');
  if (!hasGitHubCredentials()) {
    throw new Error('Publishing is not switched on for this site yet: no GitHub credentials are configured');
  }
  return value;
}

/** Build and push a commit on the current head; retry once if the branch moved meanwhile. */
async function commitOnHead(
  target: Repo,
  build: (head: string) => Promise<{ files: Record<string, string>; message: string } | null>,
  editor: string,
): Promise<string> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const head = await headSha(target);
    const built = await build(head);
    if (!built) return '';
    try {
      return await commitFiles(target, { parent: head, files: built.files, message: built.message, author: author(editor) });
    } catch (error) {
      const text = error instanceof Error ? error.message : '';
      if (attempt === 0 && /PATCH .*refs\/heads.*(422|409)/.test(text)) continue;
      throw error;
    }
  }
  throw new Error('The repository moved twice while publishing; try again');
}

const githubStore = {
  async publish(changes: Change[], editor: string): Promise<{ hash: string; applied: Applied[] }> {
    const target = repo();
    let applied: Applied[] = [];
    const hash = await commitOnHead(
      target,
      async (head) => {
        const result = await applyAll(changes, (file) => readFileAt(target, `${CONTENT_PREFIX}${file}.json`, head));
        applied = result.applied;
        if (!applied.some((change) => change.before !== change.after)) return null;
        return { files: result.files, message: messageOf(summaryOf(applied), applied) };
      },
      editor,
    );
    return { hash, applied };
  },

  async history(limit: number): Promise<Publish[]> {
    return toPublishes(await commitsTouching(repo(), CONTENT_PREFIX.replace(/\/$/, ''), limit * 2), limit);
  },

  async undo(hash: string, editor: string): Promise<Undone> {
    if (!/^[0-9a-f]{7,40}$/.test(hash)) throw new Error('Not a commit');
    const target = repo();
    const detail = await commitDetail(target, hash);
    const outside = detail.files.filter((file) => !file.startsWith(CONTENT_PREFIX));
    if (outside.length) throw new Error(`That change also touched ${outside[0]}; undo it in code, not here`);

    const recorded = trailerOf(detail.message);
    if (!recorded?.length) throw new Error('That publish predates undo and has to be reverted in code');

    const hashOut = await commitOnHead(
      target,
      async (head) => {
        const texts = new Map<string, string>();
        const applied: Applied[] = [];
        for (const change of recorded) {
          const { file, fieldPath } = parseId(change.id);
          const raw = texts.get(file) ?? (await readFileAt(target, `${CONTENT_PREFIX}${file}.json`, head));
          const current = readField(raw, change.id);
          if (current !== change.after) {
            throw new Error(`${change.id} was edited again after that publish; undo the newer change first`);
          }
          const result = applyToText(raw, change.id, change.before, true);
          texts.set(file, result.next);
          applied.push({ id: change.id, file, path: fieldPath, before: result.before, after: result.after });
        }
        const files: Record<string, string> = {};
        for (const [file, text] of texts) files[`${CONTENT_PREFIX}${file}.json`] = text;
        const summary = detail.message.split('\n')[0];
        return {
          files,
          message: messageOf(`Revert "${summary}"`, applied, `This reverts commit ${detail.sha}.`),
        };
      },
      editor,
    );
    return { hash: hashOut, restored: recorded.map(({ id, before }) => ({ id, value: before })) };
  },
};

// ---------------------------------------------------------------------------
// Public surface
// ---------------------------------------------------------------------------

const store = () => (mode() === 'github' ? githubStore : localStore);

/** Publish a batch of changes as one commit. Returns the commit and what changed. */
export async function publish(changes: Change[], editor: string) {
  const result = await store().publish(changes, editor);
  return { ...result, mode: mode() };
}

/** Recent publishes, newest first. */
export const history = (limit = 15) => store().history(limit);

/** Undo one publish. Refuses anything that touched more than content. */
export const undo = (hash: string, editor: string) => store().undo(hash, editor);
