/**
 * Comment-only access (2026-10-29): commenters live in the Spine, a share link
 * lets someone ask to join, and nothing a commenter's session reaches can
 * change the site.
 */
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import {
  forgetAccess,
  inviteCommenter,
  isCommenter,
  isShareToken,
  joinUrl,
  joinWithLink,
  shareLinkIsLive,
} from '../inline-edit/commenters';

const HOOK = 'https://loudface-spine-hooks.arnel.workers.dev/editor/receipt';
const SECRET = 'commenters-test-secret';
/** Shaped like a share token, plainly not one. */
const TOKEN = 'share-link-test-token'.padEnd(32, 'x');

const ENV = {
  LF_SPINE_HOOK_URL: HOOK,
  LF_SPINE_HOOK_SECRET: SECRET,
  LF_GITHUB_REPO: 'LoudFace/loudface-website',
  LF_SITE_URL: 'https://www.loudface.co',
};

async function withSpine<T>(
  answer: (body: Record<string, unknown>) => { status: number; json: unknown },
  run: (calls: { body: Record<string, unknown>; signature: string | null }[]) => Promise<T>,
): Promise<T> {
  const kept: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(ENV)) {
    kept[key] = process.env[key];
    process.env[key] = value;
  }
  const calls: { body: Record<string, unknown>; signature: string | null }[] = [];
  const real = globalThis.fetch;
  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
    calls.push({ body, signature: new Headers(init?.headers).get('x-lf-signature-256') });
    const { status, json } = answer(body);
    return new Response(JSON.stringify(json), { status, headers: { 'content-type': 'application/json' } });
  }) as typeof fetch;
  forgetAccess();
  try {
    return await run(calls);
  } finally {
    globalThis.fetch = real;
    for (const [key, value] of Object.entries(kept)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    forgetAccess();
  }
}

test('a share token is url-safe and long enough to be ours', () => {
  assert.equal(isShareToken(TOKEN), true);
  assert.equal(isShareToken('short'), false);
  assert.equal(isShareToken(`${TOKEN}|signin`), false);
  assert.equal(isShareToken(`${TOKEN}/../x`), false);
  assert.equal(isShareToken(undefined), false);
});

test('the share link opens this site’s sign-in page with the token', () => {
  const kept = process.env.LF_SITE_URL;
  process.env.LF_SITE_URL = 'https://www.loudface.co/';
  try {
    assert.equal(joinUrl(TOKEN), `https://www.loudface.co/edit?join=${TOKEN}`);
  } finally {
    if (kept === undefined) delete process.env.LF_SITE_URL;
    else process.env.LF_SITE_URL = kept;
  }
});

test('isCommenter asks the Spine once a minute, signed, and says no on any failure', async () => {
  await withSpine(
    (body) => ({ status: 200, json: { ok: true, commenter: body.email === 'maria@client.com', name: null } }),
    async (calls) => {
      assert.equal(await isCommenter('Maria@Client.com '), true);
      assert.equal(await isCommenter('maria@client.com'), true);
      assert.equal(calls.length, 1, 'the second answer came from the cache');
      assert.equal(calls[0].body.op, 'access');
      assert.equal(calls[0].body.repo, 'LoudFace/loudface-website');
      const expected = `sha256=${createHmac('sha256', SECRET).update(JSON.stringify(calls[0].body)).digest('hex')}`;
      assert.equal(calls[0].signature, expected);
      assert.equal(await isCommenter('nobody@client.com'), false);
    },
  );
  await withSpine(
    () => ({ status: 502, json: { error: 'spine_http_500' } }),
    async () => {
      assert.equal(await isCommenter('maria@client.com'), false, 'an error lets nobody in');
    },
  );
});

test('an invitation forgets the cached answer for that address', async () => {
  let commenter = false;
  await withSpine(
    (body) => {
      if (body.op === 'invite') {
        commenter = true;
        return { status: 200, json: { ok: true, created: true } };
      }
      return { status: 200, json: { ok: true, commenter } };
    },
    async () => {
      assert.equal(await isCommenter('new@client.com'), false);
      const actor = { email: 'arnel@loudface.co', name: 'arnel', owner: true };
      const added = await inviteCommenter('new@client.com', actor);
      assert.deepEqual(added, { ok: true, data: { created: true } });
      assert.equal(await isCommenter('new@client.com'), true);
    },
  );
});

test('a turned-off share link lets nobody join', async () => {
  await withSpine(
    (body) =>
      body.op === 'join'
        ? { status: 410, json: { error: 'this share link is no longer active' } }
        : { status: 200, json: { ok: true, live: false } },
    async (calls) => {
      assert.equal(await shareLinkIsLive(TOKEN), false);
      assert.equal(await joinWithLink(TOKEN, 'someone@client.com'), false);
      assert.equal(await joinWithLink('not a token', 'someone@client.com'), false);
      assert.equal(calls.filter((call) => call.body.op === 'join').length, 1, 'a malformed token never reaches the Spine');
    },
  );
});

test('every route that changes the site asks for an editor, not just a session', () => {
  // A commenter holds a real session since 2026-10-29. A route that only
  // checked currentEditor() would let them publish.
  const root = path.join(process.cwd(), 'src', 'app', 'api', 'lf-edit');
  for (const route of ['route.ts', 'image/route.ts', 'undo/route.ts', 'history/route.ts', 'link/route.ts', 'status/route.ts']) {
    const source = readFileSync(path.join(root, route), 'utf8');
    assert.match(source, /currentWriter\(\)/, `${route} must check currentWriter()`);
    assert.doesNotMatch(source, /currentEditor\(\)/, `${route} must not accept any session`);
  }
});
