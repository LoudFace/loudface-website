import 'server-only';

/**
 * Writing content back, and undoing it.
 *
 * A publish is one git commit: every value the editor changed, written into the
 * files they came from, committed in the editor's name. That gives us history,
 * an audit trail and an undo for free — undo is a revert, which is itself a
 * commit, so nothing is ever lost.
 *
 * Values are replaced in the file's own text rather than by re-serialising the
 * document, so a copy change stays a one-line diff a human can review.
 */
import { execFile } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { strip as stripMarks } from './mark';

const run = promisify(execFile);

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, 'src', 'data', 'content');
const CONTENT_PREFIX = 'src/data/content/';
const FILE_NAME = /^[a-z0-9-]+$/;
const PATH_SEGMENT = /^[A-Za-z0-9_]+$/;
const BR = '@@LF_BR@@';

export type Change = { id: string; value: string };
export type Applied = { id: string; file: string; path: string; before: string; after: string };

/** Only <br> survives; every other tag is stripped rather than escaped. */
function cleanValue(value: string): string {
  return stripMarks(value)
    .replace(/<br\s*\/?>/gi, BR)
    .replace(/<[^>]*>/g, '')
    .replace(new RegExp(BR, 'g'), '<br>')
    .replace(/&nbsp;/g, ' ')
    .replace(/[?&]lf=[^&\s"']*/g, '')
    .trim();
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

async function git(args: string[]): Promise<string> {
  const { stdout } = await run('git', args, { cwd: ROOT, maxBuffer: 4_000_000 });
  return stdout.trim();
}

/** Apply one change to its file. Returns what changed, or throws a readable error. */
export async function applyChange(change: Change): Promise<Applied> {
  const [file, fieldPath] = change.id.split(':');
  if (!file || !fieldPath || !FILE_NAME.test(file)) throw new Error(`Bad content id: ${change.id}`);

  const segments = fieldPath.split('.');
  if (!segments.length || !segments.every((segment) => PATH_SEGMENT.test(segment))) {
    throw new Error(`Bad field path: ${fieldPath}`);
  }

  const filePath = path.join(CONTENT_DIR, `${file}.json`);
  if (!filePath.startsWith(CONTENT_DIR + path.sep)) throw new Error('Outside the content directory');

  const raw = await readFile(filePath, 'utf8');
  const json = JSON.parse(raw);
  const target = walk(json, segments);
  if (!target) throw new Error(`${fieldPath} does not exist in ${file}.json`);
  if (typeof target.parent[target.key] !== 'string') throw new Error('Only text values are editable');

  const before = target.parent[target.key] as string;
  const after = cleanValue(change.value);
  if (!after) throw new Error('A value cannot be emptied from the page');
  if (after === before) return { id: change.id, file, path: fieldPath, before, after };

  // Replace the value in the file's own text so the diff stays one line.
  const needle = `${JSON.stringify(target.key)}: ${JSON.stringify(before)}`;
  const first = raw.indexOf(needle);
  const unique = first !== -1 && raw.indexOf(needle, first + 1) === -1;

  let next: string;
  if (unique) {
    const replacement = `${JSON.stringify(target.key)}: ${JSON.stringify(after)}`;
    next = raw.slice(0, first) + replacement + raw.slice(first + needle.length);
    JSON.parse(next); // never write a file we cannot read back
  } else {
    target.parent[target.key] = after;
    next = JSON.stringify(json, null, 2) + '\n';
  }
  await writeFile(filePath, next, 'utf8');
  return { id: change.id, file, path: fieldPath, before, after };
}

/** Commit everything that changed, in the editor's name. */
export async function commitChanges(applied: Applied[], editor: string): Promise<string> {
  const files = [...new Set(applied.map((change) => `${CONTENT_PREFIX}${change.file}.json`))];
  await git(['add', ...files]);

  const status = await git(['status', '--porcelain', '--', ...files]);
  if (!status) return '';

  const fields = applied.map((change) => `${change.file}:${change.path}`);
  const summary =
    applied.length === 1
      ? `Content: ${fields[0]}`
      : `Content: ${applied.length} values on ${new Set(applied.map((a) => a.file)).size} page(s)`;
  const body = applied
    .map((change) => `- ${change.file}:${change.path}\n  was: ${change.before}\n  now: ${change.after}`)
    .join('\n');

  await git([
    '-c',
    `user.name=${editor.split('@')[0]} (site editor)`,
    '-c',
    `user.email=${editor}`,
    'commit',
    '-m',
    summary,
    '-m',
    body,
    '--only',
    ...files,
  ]);

  if (process.env.LF_EDIT_PUSH === '1') {
    await git(['push', 'origin', 'HEAD']);
  }
  return git(['rev-parse', 'HEAD']);
}

export type Publish = {
  hash: string;
  date: string;
  editor: string;
  summary: string;
  fields: string[];
  reverted: boolean;
};

/** Recent publishes, newest first. */
export async function history(limit = 15): Promise<Publish[]> {
  const log = await git([
    'log',
    `-n${limit * 2}`,
    '--format=%H%aI%ae%s%b',
    '--',
    CONTENT_PREFIX,
  ]);
  if (!log) return [];

  const reverted = new Set(
    [...log.matchAll(/This reverts commit ([0-9a-f]{40})/g)].map((match) => match[1]),
  );

  return log
    .split('\n')
    .filter(Boolean)
    .map((entry) => {
      const [hash, date, editor, summary, body = ''] = entry.split('');
      return {
        hash,
        date,
        editor,
        summary,
        fields: [...body.matchAll(/^- (\S+)/gm)].map((match) => match[1]),
        reverted: reverted.has(hash),
      };
    })
    .filter((entry) => entry.summary.startsWith('Content:') || entry.summary.startsWith('Revert "Content:'))
    .slice(0, limit);
}

/** Undo one publish. Refuses anything that touched more than content. */
export async function undo(hash: string, editor: string): Promise<string> {
  if (!/^[0-9a-f]{7,40}$/.test(hash)) throw new Error('Not a commit');

  const touched = (await git(['show', '--name-only', '--format=', hash])).split('\n').filter(Boolean);
  const outside = touched.filter((file) => !file.startsWith(CONTENT_PREFIX));
  if (outside.length) throw new Error(`That change also touched ${outside[0]}; undo it in code, not here`);

  await git([
    '-c',
    `user.name=${editor.split('@')[0]} (site editor)`,
    '-c',
    `user.email=${editor}`,
    'revert',
    '--no-edit',
    hash,
  ]);
  return git(['rev-parse', 'HEAD']);
}
