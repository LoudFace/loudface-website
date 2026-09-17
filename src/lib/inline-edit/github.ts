import 'server-only';

/**
 * The repository over the GitHub API.
 *
 * Production has no working copy and no writable disk, so a publish there is
 * built out of Git objects: blobs for the changed files, a tree on top of the
 * current head, a commit authored by the editor, and the branch moved to it.
 * One publish is still one commit, exactly as in development.
 *
 * Credentials, one of:
 *   LF_GITHUB_TOKEN                          a fine-grained token limited to this
 *                                            repository with Contents: read and write
 *   LF_GITHUB_APP_ID + LF_GITHUB_APP_PRIVATE_KEY + LF_GITHUB_INSTALLATION_ID
 *                                            our GitHub App installed on this repository;
 *                                            we mint an hour-long installation token
 * Plus LF_GITHUB_REPO ("owner/name") and optionally LF_GITHUB_BRANCH (main).
 */
import { createSign } from 'node:crypto';

const API = 'https://api.github.com';

export type Repo = { owner: string; name: string; branch: string };

export function repoFromEnv(): Repo | null {
  const full = process.env.LF_GITHUB_REPO;
  if (!full || !full.includes('/')) return null;
  const [owner, name] = full.split('/');
  return { owner, name, branch: process.env.LF_GITHUB_BRANCH || 'main' };
}

export function hasGitHubCredentials(): boolean {
  return Boolean(
    process.env.LF_GITHUB_TOKEN ||
      (process.env.LF_GITHUB_APP_ID &&
        process.env.LF_GITHUB_APP_PRIVATE_KEY &&
        process.env.LF_GITHUB_INSTALLATION_ID),
  );
}

let appToken: { value: string; expires: number } | null = null;

function appJwt(appId: string, privateKey: string): string {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({ iat: now - 60, exp: now + 9 * 60, iss: appId }),
  ).toString('base64url');
  const signer = createSign('RSA-SHA256');
  signer.update(`${header}.${payload}`);
  const signature = signer.sign(privateKey.replace(/\\n/g, '\n')).toString('base64url');
  return `${header}.${payload}.${signature}`;
}

async function token(): Promise<string> {
  if (process.env.LF_GITHUB_TOKEN) return process.env.LF_GITHUB_TOKEN;

  if (appToken && appToken.expires > Date.now() + 60_000) return appToken.value;

  const appId = process.env.LF_GITHUB_APP_ID!;
  const key = process.env.LF_GITHUB_APP_PRIVATE_KEY!;
  const installation = process.env.LF_GITHUB_INSTALLATION_ID!;
  const response = await fetch(`${API}/app/installations/${installation}/access_tokens`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${appJwt(appId, key)}`,
      accept: 'application/vnd.github+json',
      'x-github-api-version': '2022-11-28',
    },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`GitHub App token: ${response.status} ${await response.text()}`);
  const data = (await response.json()) as { token: string; expires_at: string };
  appToken = { value: data.token, expires: new Date(data.expires_at).getTime() };
  return data.token;
}

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${await token()}`,
      accept: 'application/vnd.github+json',
      'x-github-api-version': '2022-11-28',
      ...(init.body ? { 'content-type': 'application/json' } : {}),
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`GitHub ${init.method ?? 'GET'} ${path}: ${response.status} ${text.slice(0, 300)}`);
  }
  return (await response.json()) as T;
}

const base = (repo: Repo) => `/repos/${repo.owner}/${repo.name}`;

/** The commit the branch points at right now. */
export async function headSha(repo: Repo): Promise<string> {
  const ref = await api<{ object: { sha: string } }>(`${base(repo)}/git/ref/heads/${repo.branch}`);
  return ref.object.sha;
}

/** A file's text at a commit. */
export async function readFileAt(repo: Repo, path: string, ref: string): Promise<string> {
  const data = await api<{ content: string; encoding: string }>(
    `${base(repo)}/contents/${path.split('/').map(encodeURIComponent).join('/')}?ref=${ref}`,
  );
  if (data.encoding !== 'base64') throw new Error(`Unexpected encoding for ${path}`);
  return Buffer.from(data.content, 'base64').toString('utf8');
}

/**
 * One file in a commit: text for a content file, base64 for an uploaded image.
 *
 * The blob API takes either, as long as the `encoding` field says which. Sending
 * a picture as `utf-8` does not fail — it silently mangles every byte above 127,
 * which is most of a JPEG — so the two cases are separate shapes here rather
 * than a string plus a flag someone can forget to set.
 */
export type CommitFile = { text: string } | { base64: string };

export type CommitInput = {
  parent: string;
  files: Record<string, CommitFile>; // path -> new content
  message: string;
  author: { name: string; email: string };
};

/** Write files as one commit on top of `parent`, then move the branch to it. */
export async function commitFiles(repo: Repo, input: CommitInput): Promise<string> {
  const parent = await api<{ tree: { sha: string } }>(`${base(repo)}/git/commits/${input.parent}`);

  const tree = await Promise.all(
    Object.entries(input.files).map(async ([path, content]) => {
      const blob = await api<{ sha: string }>(`${base(repo)}/git/blobs`, {
        method: 'POST',
        body: JSON.stringify(
          'text' in content
            ? { content: content.text, encoding: 'utf-8' }
            : { content: content.base64, encoding: 'base64' },
        ),
      });
      return { path, mode: '100644', type: 'blob', sha: blob.sha };
    }),
  );

  const newTree = await api<{ sha: string }>(`${base(repo)}/git/trees`, {
    method: 'POST',
    body: JSON.stringify({ base_tree: parent.tree.sha, tree }),
  });

  const commit = await api<{ sha: string }>(`${base(repo)}/git/commits`, {
    method: 'POST',
    body: JSON.stringify({
      message: input.message,
      tree: newTree.sha,
      parents: [input.parent],
      author: { ...input.author, date: new Date().toISOString() },
    }),
  });

  // Fast-forward only. If someone pushed in between, the caller re-reads and retries.
  await api(`${base(repo)}/git/refs/heads/${repo.branch}`, {
    method: 'PATCH',
    body: JSON.stringify({ sha: commit.sha, force: false }),
  });
  return commit.sha;
}

export type RemoteCommit = {
  sha: string;
  date: string;
  email: string;
  message: string;
  files: string[];
};

/** Recent commits that touched `path`, newest first. */
export async function commitsTouching(repo: Repo, path: string, limit: number): Promise<RemoteCommit[]> {
  const list = await api<
    { sha: string; commit: { message: string; author: { date: string; email: string } } }[]
  >(`${base(repo)}/commits?sha=${repo.branch}&path=${encodeURIComponent(path)}&per_page=${limit}`);
  return list.map((entry) => ({
    sha: entry.sha,
    date: entry.commit.author.date,
    email: entry.commit.author.email,
    message: entry.commit.message,
    files: [],
  }));
}

/** One commit with the files it touched and its first parent. */
export async function commitDetail(
  repo: Repo,
  sha: string,
): Promise<RemoteCommit & { parent: string | null }> {
  const data = await api<{
    sha: string;
    parents: { sha: string }[];
    files?: { filename: string }[];
    commit: { message: string; author: { date: string; email: string } };
  }>(`${base(repo)}/commits/${sha}`);
  return {
    sha: data.sha,
    date: data.commit.author.date,
    email: data.commit.author.email,
    message: data.commit.message,
    files: (data.files ?? []).map((file) => file.filename),
    parent: data.parents[0]?.sha ?? null,
  };
}
