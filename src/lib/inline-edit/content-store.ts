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
 * document, so a copy change stays a one-line diff a human can review. That
 * part is pure and lives in `content-text.ts`, where a test can run it over
 * every value in `src/data/content` without the Next runtime.
 *
 * Every commit carries a machine-readable trailer, `LF-Changes`, listing each
 * field with its old and new value. Undo on GitHub reads that trailer and puts
 * the old values back — but only if the field still holds the value the commit
 * gave it. A later edit is never silently overwritten.
 */
import { execFile } from 'node:child_process';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { applyToText, parseId, readField } from './content-text';
import { isPublishSummary, revertedShas } from './publish-history';
import { UPLOAD_DIR } from './image-edit';
import {
  commitDetail,
  commitFiles,
  commitsTouching,
  hasGitHubCredentials,
  headSha,
  listFilesUnder,
  readFileAt,
  repoFromEnv,
  type CommitFile,
  type Repo,
} from './github';

const run = promisify(execFile);

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, 'src', 'data', 'content');
const CONTENT_PREFIX = 'src/data/content/';
/**
 * The one folder outside the content files a publish may also write to: images
 * an editor uploaded from the page. Undo puts the JSON path back; the picture
 * itself stays where it is, because nothing else in the repository can tell
 * whether some other page started pointing at it in the meantime.
 */
const UPLOAD_PREFIX = `${UPLOAD_DIR}/`;
const TRAILER = 'LF-Changes';

/**
 * What a client is told when this site has no way to publish. A deployed site
 * has no working copy and no git binary, so the local store would fail with
 * "spawn git ENOENT" — a message about our plumbing, not about their site.
 */
const NOT_SWITCHED_ON =
  'Publishing is not switched on for this site yet: no GitHub credentials are configured';

export { applyToText, readField } from './content-text';

/**
 * One value to write. `exact` skips cleaning and is set by the server alone,
 * after it has verified its own undo token — never from a request body.
 */
export type Change = { id: string; value: string; exact?: boolean; expected?: string };
export type Applied = { id: string; file: string; path: string; before: string; after: string };
/**
 * A file that rides along in the same commit as the content change that points
 * at it — today only an uploaded image. One commit, so a page never goes live
 * naming a picture the repository does not have yet.
 */
export type ExtraFile = { path: string; base64: string };
export type Mode = 'git' | 'github';
/** What an undo put back on the page: each field and the text it now carries again. */
export type Undone = { hash: string; restored: Change[]; removed: Change[] };

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
    const result = applyToText(raw, change.id, change.value, change.exact === true, change.expected);
    texts.set(file, result.next);
    applied.push({ id: change.id, file, path: fieldPath, before: result.before, after: result.after });
  }

  const files: Record<string, string> = {};
  for (const [file, text] of texts) files[`${CONTENT_PREFIX}${file}.json`] = text;
  return { files, applied };
}

/** The content files as text plus any uploaded files as bytes, ready for one commit. */
function commitMap(texts: Record<string, string>, extras: ExtraFile[] = []): Record<string, CommitFile> {
  const out: Record<string, CommitFile> = {};
  for (const [file, text] of Object.entries(texts)) out[file] = { text };
  for (const extra of extras) out[extra.path] = { base64: extra.base64 };
  return out;
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

function toPublishes(
  commits: { sha: string; date: string; email: string; message: string }[],
  limit: number,
): Publish[] {
  // Which commits a later one has undone. A revert of a revert names its target
  // the same way, so a row that has itself been undone is marked as undone —
  // that is what stops the History panel offering to undo an undo twice.
  const reverted = revertedShas(commits.map((commit) => commit.message));
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
    .filter((entry) => isPublishSummary(entry.summary))
    .slice(0, limit);
}

const author = (editor: string) => ({ name: `${editor.split('@')[0]} (site editor)`, email: editor });

/**
 * May undo touch this file? Content files, yes. Images an editor uploaded from
 * the page, yes: the commit that added one also changed the JSON path pointing
 * at it, and putting that path back is the whole undo. Anything else is code,
 * and code is undone in code.
 */
const isUndoable = (file: string) => file.startsWith(CONTENT_PREFIX) || file.startsWith(UPLOAD_PREFIX);

/**
 * Who may edit is not content, and undo must not touch it.
 *
 * An invite and a removal are commits like any other, but reverting one from
 * the History panel would silently give somebody back access, or take it away,
 * with no row in the Editors panel explaining it. The Editors panel is the one
 * place that list changes. (These commits carry no `LF-Changes` trailer either,
 * so they never appear in History in the first place; this is the second lock.)
 */
const EDITORS_FILE = 'src/data/editors.json';

function refuseEditorsCommit(message: string, files: string[] = []): void {
  if (message.split('\n')[0].startsWith('Editors:') || files.includes(EDITORS_FILE)) {
    throw new Error('Editors are managed from the Editors panel');
  }
}

// ---------------------------------------------------------------------------
// Backend: the working copy (development)
// ---------------------------------------------------------------------------

async function git(args: string[]): Promise<string> {
  const { stdout } = await run('git', args, { cwd: ROOT, maxBuffer: 4_000_000 });
  return stdout.trim();
}

const localStore = {
  async publish(
    changes: Change[],
    editor: string,
    extras: ExtraFile[] = [],
  ): Promise<{ hash: string; applied: Applied[] }> {
    const { files, applied } = await applyAll(changes, (file) =>
      readFile(path.join(CONTENT_DIR, `${file}.json`), 'utf8'),
    );
    const real = applied.filter((change) => change.before !== change.after);
    if (!real.length && !extras.length) return { hash: '', applied };

    for (const [file, text] of Object.entries(files)) await writeFile(path.join(ROOT, file), text, 'utf8');
    for (const extra of extras) {
      await mkdir(path.dirname(path.join(ROOT, extra.path)), { recursive: true });
      await writeFile(path.join(ROOT, extra.path), Buffer.from(extra.base64, 'base64'));
    }
    const paths = [...Object.keys(files), ...extras.map((extra) => extra.path)];
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

  async commitFile(file: string, text: string, message: string, editor: string): Promise<string> {
    await mkdir(path.dirname(path.join(ROOT, file)), { recursive: true });
    await writeFile(path.join(ROOT, file), text, 'utf8');
    await git(['add', file]);
    if (!(await git(['status', '--porcelain', '--', file]))) return '';

    const who = author(editor);
    await git([
      '-c', `user.name=${who.name}`, '-c', `user.email=${who.email}`,
      'commit', '-m', message, '--only', file,
    ]);
    if (process.env.LF_EDIT_PUSH === '1') await git(['push', 'origin', 'HEAD']);
    return git(['rev-parse', 'HEAD']);
  },

  async uploads(): Promise<string[]> {
    try {
      const names = await readdir(path.join(ROOT, UPLOAD_DIR), { recursive: true, withFileTypes: true });
      return names
        .filter((entry) => entry.isFile())
        .map((entry) => `${entry.parentPath.replace(`${ROOT}/`, '')}/${entry.name}`);
    } catch {
      return []; // nothing uploaded yet
    }
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
    const message = await git(['show', '--no-patch', '--format=%B', hash]);
    refuseEditorsCommit(message, touched);
    const outside = touched.filter((file) => !isUndoable(file));
    if (outside.length) throw new Error(`That change also touched ${outside[0]}; undo it in code, not here`);
    const recorded = trailerOf(message) ?? [];
    const who = author(editor);
    await git(['-c', `user.name=${who.name}`, '-c', `user.email=${who.email}`, 'revert', '--no-edit', hash]);
    if (process.env.LF_EDIT_PUSH === '1') await git(['push', 'origin', 'HEAD']);
    return {
      hash: (await git(['rev-parse', 'HEAD'])).trim(),
      restored: recorded.map(({ id, before }) => ({ id, value: before })),
      removed: recorded.map(({ id, after }) => ({ id, value: after })),
    };
  },
};

// ---------------------------------------------------------------------------
// Backend: the repository on GitHub (production)
// ---------------------------------------------------------------------------

function repo(): Repo {
  const value = repoFromEnv();
  if (!value) throw new Error('LF_GITHUB_REPO is not set');
  if (!hasGitHubCredentials()) throw new Error(NOT_SWITCHED_ON);
  return value;
}

/** Build and push a commit on the current head; retry once if the branch moved meanwhile. */
async function commitOnHead(
  target: Repo,
  build: (head: string) => Promise<{ files: Record<string, CommitFile>; message: string } | null>,
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
  async publish(
    changes: Change[],
    editor: string,
    extras: ExtraFile[] = [],
  ): Promise<{ hash: string; applied: Applied[] }> {
    const target = repo();
    let applied: Applied[] = [];
    const hash = await commitOnHead(
      target,
      async (head) => {
        const result = await applyAll(changes, (file) => readFileAt(target, `${CONTENT_PREFIX}${file}.json`, head));
        applied = result.applied;
        if (!applied.some((change) => change.before !== change.after) && !extras.length) return null;
        return { files: commitMap(result.files, extras), message: messageOf(summaryOf(applied), applied) };
      },
      editor,
    );
    return { hash, applied };
  },

  async commitFile(file: string, text: string, message: string, editor: string): Promise<string> {
    return commitOnHead(repo(), async () => ({ files: { [file]: { text } }, message }), editor);
  },

  async uploads(): Promise<string[]> {
    const target = repo();
    try {
      return await listFilesUnder(target, `${UPLOAD_DIR}/`, await headSha(target));
    } catch (error) {
      // Not being able to look is not a reason to fail an upload; the file is
      // simply committed under its own name, as it was before this check.
      console.error(`[inline edit] could not list ${UPLOAD_DIR}: ${String(error)}`);
      return [];
    }
  },

  async history(limit: number): Promise<Publish[]> {
    return toPublishes(await commitsTouching(repo(), CONTENT_PREFIX.replace(/\/$/, ''), limit * 2), limit);
  },

  async undo(hash: string, editor: string): Promise<Undone> {
    if (!/^[0-9a-f]{7,40}$/.test(hash)) throw new Error('Not a commit');
    const target = repo();
    const detail = await commitDetail(target, hash);
    refuseEditorsCommit(detail.message, detail.files);
    const outside = detail.files.filter((file) => !isUndoable(file));
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
          files: commitMap(files),
          message: messageOf(`Revert "${summary}"`, applied, `This reverts commit ${detail.sha}.`),
        };
      },
      editor,
    );
    return {
      hash: hashOut,
      restored: recorded.map(({ id, before }) => ({ id, value: before })),
      removed: recorded.map(({ id, after }) => ({ id, value: after })),
    };
  },
};

// ---------------------------------------------------------------------------
// Public surface
// ---------------------------------------------------------------------------

/**
 * The backend for this request. The working copy is a development convenience;
 * a deployed site that ends up in `git` mode is misconfigured (a missing or
 * misspelled LF_GITHUB_* value), and shelling out to git there would only turn
 * that into an unreadable error, so we name the real problem instead.
 */
function store() {
  if (mode() === 'github') return githubStore;
  if (process.env.NODE_ENV === 'production') throw new Error(NOT_SWITCHED_ON);
  return localStore;
}

/**
 * Publish a batch of changes as one commit. Returns the commit and what changed.
 * `extras` are files committed alongside — an uploaded image and the JSON value
 * naming it land together, so no deploy ever serves a path that is not there.
 */
export async function publish(changes: Change[], editor: string, extras: ExtraFile[] = []) {
  const result = await store().publish(changes, editor, extras);
  return { ...result, mode: mode() };
}

/**
 * Commit one whole file, in the editor's name, through whichever backend this
 * site publishes with. Used by the Editors panel: an invite is a commit like
 * any other, but it carries no `LF-Changes` trailer, so it is not a publish —
 * it never shows in History and can never be undone as if it were content.
 */
export const commitFile = async (file: string, text: string, message: string, editor: string) =>
  store().commitFile(file, text, message, editor);

/**
 * Every uploaded picture already in the repository, as repository paths. The
 * image route looks its file's hash up in here and reuses a path rather than
 * committing the same bytes a second time.
 */
export const uploadedFiles = async (): Promise<string[]> => store().uploads();

/** Recent publishes, newest first. */
export const history = async (limit = 15) => store().history(limit);

/** Undo one publish. Refuses anything that touched more than content. */
export const undo = async (hash: string, editor: string) => store().undo(hash, editor);
