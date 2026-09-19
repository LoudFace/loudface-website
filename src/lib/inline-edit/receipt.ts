/**
 * The receipt an edit leaves behind.
 *
 * Arnel, 2026-09-18: "If they break something, we won't be able to have a
 * receipt on it." Until now a publish left two different traces and neither
 * said enough. A content-file publish is a commit, so it reached the results
 * chart as a `deploy` — the same mark a developer shipping a feature makes,
 * with no page, no fields and no person on it. A Sanity publish patches a
 * document and makes no commit at all, so it reached nothing.
 *
 * Every publish and every undo now posts one line to the LoudFace spine's
 * webhooks worker, which turns it into a `site_edit` mark on the client's
 * results timeline: who edited, when, which page, and what each field said
 * before and after.
 *
 * Three rules this file keeps:
 *
 *  - It never fails a publish. The words are already live by the time a
 *    receipt is sent; a receipt that cannot be delivered is a line in the log,
 *    not an error on a client's screen.
 *  - It never delays one. The call is not awaited past its own five-second
 *    timeout, and the route returns without waiting for it at all.
 *  - It does nothing at all without both environment values. A site that has
 *    not been given the hook address and the shared secret simply has no
 *    receipts, which is how every site behaves before it is set up.
 */
/*
 * Free of `server-only`, like `editors-list.ts`, so the tests can load it
 * without the Next runtime. Nothing here belongs in a browser bundle either:
 * only the publish and undo routes import it.
 */
import { createHmac } from 'node:crypto';
import { after } from 'next/server';

/** One field the editor changed, and the words on either side of the change. */
export type ReceiptChange = { id: string; before: string; after: string };

export type ReceiptPayload = {
  /** The repository the spine knows this site by, as `owner/name`. */
  repo: string;
  /** The public address of the site, for the reader. */
  site: string;
  action: 'publish' | 'undo';
  /** When the edit happened, ISO 8601. */
  at: string;
  editor: { email: string; name: string };
  page: { path: string; url: string };
  changes: ReceiptChange[];
  /** The commit sha for a file publish, the document id for a Sanity one. */
  ref: string;
  /** Where that reference can be read: the commit on GitHub. */
  refUrl?: string;
};

/** A receipt is a courtesy to the timeline, never a step in the publish. */
const TIMEOUT_MS = 5000;

/** Where receipts go, and what proves they came from this site. */
function settings(): { url: string; secret: string } | null {
  const url = (process.env.LF_SPINE_HOOK_URL ?? '').trim();
  const secret = (process.env.LF_SPINE_HOOK_SECRET ?? '').trim();
  if (!url || !secret) return null;
  return { url, secret };
}

/** The signature the worker checks, over the exact bytes it will read. */
export function signBody(secret: string, body: string): string {
  return `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`;
}

/**
 * The name to print beside the edit. There is no name in a session — an editor
 * signs in with an address and nothing else — so the local part is who, and
 * the worker refuses to print an address on a client-facing chart anyway.
 */
export function nameFor(email: string): string {
  return (email.split('@')[0] ?? '').trim() || 'Somebody';
}

/**
 * The page the editor was on, from the browser's own Referer. The editor
 * publishes over `fetch` from the page it edited, so the header is that page.
 * A request without one leaves the page blank rather than guessing at it.
 */
export function pageFrom(referer: string | null, siteUrl?: string): { path: string; url: string } {
  const raw = (referer ?? '').trim();
  if (!raw) return { path: '', url: (siteUrl ?? '').trim() };
  try {
    const parsed = new URL(raw);
    return { path: parsed.pathname || '/', url: `${parsed.origin}${parsed.pathname}` };
  } catch {
    return { path: '', url: (siteUrl ?? '').trim() };
  }
}

/** What this site is called in the spine, and where it lives. */
export function siteIdentity(): { repo: string; site: string } {
  return {
    repo: (process.env.LF_GITHUB_REPO ?? '').trim(),
    site: (process.env.LF_SITE_URL ?? '').trim(),
  };
}

/**
 * Post one receipt. Returns what happened, for the tests and for the log; no
 * caller is expected to wait on it or to act on the answer.
 */
export async function sendReceipt(
  payload: ReceiptPayload,
): Promise<'sent' | 'off' | 'failed'> {
  const where = settings();
  if (!where) return 'off';
  const body = JSON.stringify(payload);
  const stop = AbortSignal.timeout(TIMEOUT_MS);
  try {
    const response = await fetch(where.url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-lf-signature-256': signBody(where.secret, body),
      },
      body,
      signal: stop,
    });
    if (!response.ok) {
      console.warn(`[lf-edit] the edit receipt was refused: ${response.status}`);
      return 'failed';
    }
    return 'sent';
  } catch (error) {
    console.warn(
      `[lf-edit] the edit receipt did not reach the spine: ${
        error instanceof Error ? error.message : 'unknown error'
      }`,
    );
    return 'failed';
  }
}

/**
 * Send a receipt and forget it. Nothing here can throw into a publish, and a
 * slow spine cannot hold a client's Publish button. The route calls this and
 * returns; the request finishes it.
 */
export function recordEdit(input: {
  action: 'publish' | 'undo';
  editorEmail: string;
  referer: string | null;
  changes: ReceiptChange[];
  ref: string;
  refUrl?: string;
}): void {
  try {
    const { repo, site } = siteIdentity();
    if (!repo) return;
    // Runs once the response has gone out. A bare promise was frozen with the
    // function on Vercel the moment the route returned, and no receipt ever
    // left the site (measured 2026-09-18: the first real edit had no mark).
    after(() => sendReceipt({
      repo,
      site,
      action: input.action,
      at: new Date().toISOString(),
      editor: { email: input.editorEmail, name: nameFor(input.editorEmail) },
      page: pageFrom(input.referer, site),
      changes: input.changes,
      ref: input.ref,
      ...(input.refUrl ? { refUrl: input.refUrl } : {}),
    }).catch(() => undefined));
  } catch {
    // A receipt is never the reason a publish fails.
  }
}

/** The commit's own page on GitHub, when this site publishes through GitHub. */
export function commitUrl(repo: string, sha: string): string | undefined {
  if (!repo || !sha) return undefined;
  return `https://github.com/${repo}/commit/${sha}`;
}
