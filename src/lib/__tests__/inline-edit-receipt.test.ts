/**
 * The receipt an edit leaves on the client's results timeline.
 *
 * What is proved here: the payload the worker reads, the signature it checks,
 * and the silence of a site that has not been given the two environment
 * values. The publish itself is never allowed to depend on any of it.
 */
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import test from 'node:test';

import {
  commitUrl,
  nameFor,
  pageFrom,
  sendReceipt,
  signBody,
  siteIdentity,
  type ReceiptPayload,
} from '../inline-edit/receipt';

const HOOK = 'https://loudface-spine-hooks.arnel.workers.dev/editor/receipt';
const SECRET = 'receipt-test-secret';

const payload = (over: Partial<ReceiptPayload> = {}): ReceiptPayload => ({
  repo: 'LoudFace/delshad-legal',
  site: 'https://delshadlegal.com',
  action: 'publish',
  at: '2026-09-18T09:30:00.000Z',
  editor: { email: 'jdelshad@delshadlegal.com', name: 'jdelshad' },
  page: { path: '/about', url: 'https://delshadlegal.com/about' },
  changes: [{ id: 'about.heading', before: 'Our firm', after: 'Our practice' }],
  ref: 'a1b2c3d4',
  refUrl: 'https://github.com/LoudFace/delshad-legal/commit/a1b2c3d4',
  ...over,
});

/** A worker that records what it was asked, in place of the real one. */
function stubFetch() {
  const seen: { url: string; headers: Record<string, string>; body: string }[] = [];
  const real = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    seen.push({
      url: String(input),
      headers: (init?.headers ?? {}) as Record<string, string>,
      body: String(init?.body ?? ''),
    });
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }) as typeof fetch;
  return { seen, restore: () => { globalThis.fetch = real; } };
}

function withEnv<T>(values: Record<string, string | undefined>, run: () => T): T {
  const before: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(values)) {
    before[key] = process.env[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  try {
    return run();
  } finally {
    for (const [key, value] of Object.entries(before)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

test('the signature is an HMAC over the exact bytes the worker will read', () => {
  const body = JSON.stringify(payload());
  const expected = `sha256=${createHmac('sha256', SECRET).update(body).digest('hex')}`;
  assert.equal(signBody(SECRET, body), expected);
  assert.notEqual(signBody(SECRET, body), signBody(SECRET, `${body} `));
  assert.notEqual(signBody(SECRET, body), signBody('another-secret', body));
});

test('the payload is posted signed, as JSON, to the address the site was given', async () => {
  const stub = stubFetch();
  try {
    const sent = payload();
    const outcome = await withEnv(
      { LF_SPINE_HOOK_URL: HOOK, LF_SPINE_HOOK_SECRET: SECRET },
      () => sendReceipt(sent),
    );
    assert.equal(await outcome, 'sent');
    assert.equal(stub.seen.length, 1);
    assert.equal(stub.seen[0].url, HOOK);
    assert.equal(stub.seen[0].headers['content-type'], 'application/json');
    assert.equal(
      stub.seen[0].headers['x-lf-signature-256'],
      signBody(SECRET, stub.seen[0].body),
    );
    assert.deepEqual(JSON.parse(stub.seen[0].body), sent);
  } finally {
    stub.restore();
  }
});

test('a site with neither value, or only one, sends nothing at all', async () => {
  for (const env of [
    { LF_SPINE_HOOK_URL: undefined, LF_SPINE_HOOK_SECRET: undefined },
    { LF_SPINE_HOOK_URL: HOOK, LF_SPINE_HOOK_SECRET: undefined },
    { LF_SPINE_HOOK_URL: undefined, LF_SPINE_HOOK_SECRET: SECRET },
  ]) {
    const stub = stubFetch();
    try {
      const outcome = await withEnv(env, () => sendReceipt(payload()));
      assert.equal(await outcome, 'off');
      assert.equal(stub.seen.length, 0);
    } finally {
      stub.restore();
    }
  }
});

test('a spine that refuses or never answers is a log line, not a failure', async () => {
  const real = globalThis.fetch;
  try {
    globalThis.fetch = (async () => new Response('no', { status: 500 })) as typeof fetch;
    assert.equal(
      await withEnv({ LF_SPINE_HOOK_URL: HOOK, LF_SPINE_HOOK_SECRET: SECRET }, () =>
        sendReceipt(payload())),
      'failed',
    );
    globalThis.fetch = (async () => { throw new Error('network down'); }) as typeof fetch;
    assert.equal(
      await withEnv({ LF_SPINE_HOOK_URL: HOOK, LF_SPINE_HOOK_SECRET: SECRET }, () =>
        sendReceipt(payload())),
      'failed',
    );
  } finally {
    globalThis.fetch = real;
  }
});

test('the page comes from the page the editor was on', () => {
  assert.deepEqual(pageFrom('https://delshadlegal.com/about?x=1'), {
    path: '/about',
    url: 'https://delshadlegal.com/about',
  });
  assert.deepEqual(pageFrom('https://delshadlegal.com/'), {
    path: '/',
    url: 'https://delshadlegal.com/',
  });
  // No Referer, and nothing invented: the site's own address, and no path.
  assert.deepEqual(pageFrom(null, 'https://delshadlegal.com'), {
    path: '',
    url: 'https://delshadlegal.com',
  });
  assert.deepEqual(pageFrom('not a url', 'https://delshadlegal.com'), {
    path: '',
    url: 'https://delshadlegal.com',
  });
});

test('who, and where the commit can be read', () => {
  assert.equal(nameFor('jdelshad@delshadlegal.com'), 'jdelshad');
  assert.equal(nameFor('arnel@loudface.co'), 'arnel');
  assert.equal(nameFor(''), 'Somebody');
  assert.equal(
    commitUrl('LoudFace/delshad-legal', 'abc123'),
    'https://github.com/LoudFace/delshad-legal/commit/abc123',
  );
  assert.equal(commitUrl('', 'abc123'), undefined);
  assert.equal(commitUrl('LoudFace/delshad-legal', ''), undefined);
});

test('the site names itself from its own environment', () => {
  const identity = withEnv(
    { LF_GITHUB_REPO: 'LoudFace/delshad-legal', LF_SITE_URL: 'https://delshadlegal.com' },
    () => siteIdentity(),
  );
  assert.deepEqual(identity, {
    repo: 'LoudFace/delshad-legal',
    site: 'https://delshadlegal.com',
  });
});
