import 'server-only';

/**
 * Reading the editor list, without waiting for a build.
 *
 * The list is a file in the repository, `src/data/editors.json`, and an invite
 * is one commit on it. A deployed site therefore has two copies: the one
 * bundled into the running build, which is as old as the build, and the one at
 * the branch head, which is current the moment the commit lands.
 *
 * A person invited at 10:00 must be able to sign in at 10:01, so the live read
 * is the branch head over the GitHub API, cached in memory for a minute per
 * server instance. If that call fails the bundled copy is used instead and the
 * reason is logged: an invite might be a minute late, but nobody already on the
 * list is ever locked out by a GitHub outage.
 *
 * Owners (`LF_EDITOR_EMAILS`) are not in this file and are never read from it.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import bundledFile from '../../data/editors.json';
import { parseEditors, type EditorList } from './editors-list';
import { mode } from './content-store';
import { headSha, readFileAt, repoFromEnv } from './github';

/** Where the list lives, as one string both backends and the commit message use. */
export const EDITORS_FILE = 'src/data/editors.json';

/** Which copy answered: the branch head, the working copy, or the build's own. */
export type EditorSource = 'github' | 'git' | 'bundled';

const CACHE_MS = 60_000;

let cached: { at: number; list: EditorList; source: EditorSource } | null = null;

/** The copy compiled into this build. Current at build time, stale after an invite. */
const bundled = (): EditorList => parseEditors(JSON.stringify(bundledFile));

/**
 * Forget the cached copy.
 *
 * Called right after the panel commits, so the person who just pressed Invite
 * sees the new row at once rather than up to a minute later.
 */
export function forgetEditors(): void {
  cached = null;
}

/** The invited editors, and which copy they came from. */
export async function loadEditors(): Promise<{ list: EditorList; source: EditorSource }> {
  if (mode() === 'git') {
    // A working copy on disk: always current, nothing to cache.
    try {
      const text = await readFile(path.join(process.cwd(), EDITORS_FILE), 'utf8');
      return { list: parseEditors(text), source: 'git' };
    } catch (error) {
      console.error(`[inline edit] could not read ${EDITORS_FILE} from disk: ${String(error)}`);
      return { list: bundled(), source: 'bundled' };
    }
  }

  if (cached && Date.now() - cached.at < CACHE_MS) {
    return { list: cached.list, source: cached.source };
  }

  const repo = repoFromEnv();
  if (repo) {
    try {
      const text = await readFileAt(repo, EDITORS_FILE, await headSha(repo));
      cached = { at: Date.now(), list: parseEditors(text), source: 'github' };
      return { list: cached.list, source: 'github' };
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      console.error(`[inline edit] could not read ${EDITORS_FILE} at the branch head: ${detail}`);
    }
  }

  // Cached as well, so a GitHub outage is not one API attempt per sign-in.
  cached = { at: Date.now(), list: bundled(), source: 'bundled' };
  return { list: cached.list, source: 'bundled' };
}
