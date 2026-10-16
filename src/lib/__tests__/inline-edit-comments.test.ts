/**
 * Comments on a page: the request this site signs for the spine, what the
 * browser may ask for, and how a pin finds its spot again.
 */
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import test from 'node:test';

import {
  actorFor,
  askComments,
  commentsEndpoint,
  COMMENTS_OFF_MESSAGE,
  readOp,
} from '../inline-edit/comments';
import {
  pointIn,
  quoteOf,
  readAnchor,
  resolveAnchor,
  selectorFor,
  spotWithin,
  stableId,
  wordsOf,
  type CommentAnchor,
  type ElementLike,
} from '../inline-edit/comment-anchor';

const HOOK = 'https://loudface-spine-hooks.arnel.workers.dev/editor/receipt';
const SECRET = 'comments-test-secret';
const ID = '11111111-2222-4333-8444-555555555555';

function withEnv<T>(values: Record<string, string | undefined>, run: () => T): T {
  const kept: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(values)) {
    kept[key] = process.env[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  try {
    return run();
  } finally {
    for (const [key, value] of Object.entries(kept)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

const SITE = { LF_SPINE_HOOK_URL: HOOK, LF_SPINE_HOOK_SECRET: SECRET, LF_GITHUB_REPO: 'LoudFace/delshad-legal' };

test('comments go to the receipt worker, beside the receipts', () => {
  withEnv(SITE, () => {
    assert.equal(commentsEndpoint()?.url, 'https://loudface-spine-hooks.arnel.workers.dev/editor/comments');
  });
  withEnv({ ...SITE, LF_SPINE_HOOK_SECRET: undefined }, () => assert.equal(commentsEndpoint(), null));
  withEnv({ ...SITE, LF_GITHUB_REPO: undefined }, () => assert.equal(commentsEndpoint(), null));
});

test('a site without the receipt values says comments are off, and asks nobody', async () => {
  const real = globalThis.fetch;
  let asked = false;
  globalThis.fetch = (async () => {
    asked = true;
    return new Response('{}');
  }) as typeof fetch;
  try {
    const result = await withEnv({ LF_SPINE_HOOK_URL: undefined, LF_SPINE_HOOK_SECRET: undefined }, () =>
      askComments({ op: 'list' }, actorFor('a@b.co', [])),
    );
    assert.deepEqual(result, { ok: false, status: 503, error: COMMENTS_OFF_MESSAGE });
    assert.equal(asked, false);
  } finally {
    globalThis.fetch = real;
  }
});

test('a request is signed over its exact bytes and names the repo, the person and the time', async () => {
  const real = globalThis.fetch;
  const seen: { url: string; signature: string; body: string }[] = [];
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = init?.headers as Record<string, string>;
    seen.push({ url: String(input), signature: headers['x-lf-signature-256'], body: String(init?.body) });
    return new Response(JSON.stringify({
      ok: true,
      comments: [{
        id: ID, thread_id: null, page_path: '/about', anchor: { selector: 'h1' }, body: 'Soften this',
        author_email: 'jdelshad@delshadlegal.com', author_name: 'jdelshad', author_is_owner: false,
        resolved_at: null, resolved_by: null, edited_at: null, deleted_at: null,
        created_at: '2026-10-16T10:00:00Z', updated_at: '2026-10-16T10:00:00Z',
      }],
      now: '2026-10-16T10:00:05Z',
    }));
  }) as typeof fetch;
  try {
    const result = await withEnv(SITE, () =>
      askComments({ op: 'list' }, actorFor('JDelshad@DelshadLegal.com', []), () => new Date('2026-10-16T10:00:00Z')),
    );
    assert.equal(seen.length, 1);
    const body = JSON.parse(seen[0].body);
    assert.equal(seen[0].signature, `sha256=${createHmac('sha256', SECRET).update(seen[0].body).digest('hex')}`);
    assert.deepEqual(body, {
      op: 'list',
      repo: 'LoudFace/delshad-legal',
      actor: { email: 'jdelshad@delshadlegal.com', name: 'jdelshad', owner: false },
      at: '2026-10-16T10:00:00.000Z',
    });
    assert.ok(result.ok);
    if (result.ok) {
      assert.equal(result.comments[0].author.name, 'jdelshad');
      assert.equal(result.comments[0].page, '/about');
      assert.equal(result.now, '2026-10-16T10:00:05Z');
    }
  } finally {
    globalThis.fetch = real;
  }
});

test('the worker\'s own words reach the person; a spine error code does not', async () => {
  const real = globalThis.fetch;
  try {
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ error: 'only the person who wrote a comment can change it' }), { status: 403 })) as typeof fetch;
    const refused = await withEnv(SITE, () => askComments({ op: 'edit', id: ID, body: 'x' }, actorFor('a@b.co', [])));
    assert.deepEqual(refused, { ok: false, status: 403, error: 'only the person who wrote a comment can change it' });

    globalThis.fetch = (async () => new Response(JSON.stringify({ error: 'spine_http_500' }), { status: 502 })) as typeof fetch;
    const down = await withEnv(SITE, () => askComments({ op: 'list' }, actorFor('a@b.co', [])));
    assert.equal(down.ok, false);
    if (!down.ok) assert.doesNotMatch(down.error, /spine_http/);

    globalThis.fetch = (async () => {
      throw new Error('network down');
    }) as typeof fetch;
    const gone = await withEnv(SITE, () => askComments({ op: 'list' }, actorFor('a@b.co', [])));
    assert.equal(gone.ok, false);
    if (!gone.ok) assert.equal(gone.status, 502);
  } finally {
    globalThis.fetch = real;
  }
});

test('an owner is one of ours by the owner list, never by the domain alone', () => {
  assert.equal(actorFor('arnel@loudface.co', ['arnel@loudface.co']).owner, true);
  assert.equal(actorFor('abhay@loudface.co', ['arnel@loudface.co']).owner, false);
});

test('the browser may ask for five things, and nothing else', () => {
  const anchor = { v: 1, selector: 'h1', rx: 0.5, ry: 0.5, px: 0.5, py: 10 };
  assert.deepEqual(readOp({ op: 'create', id: ID, page: '/about?x=1', anchor, body: ' Soften ' }), {
    op: 'create', id: ID, page: '/about', anchor, body: 'Soften',
  });
  assert.equal(readOp({ op: 'create', id: ID, page: '//evil.com', anchor, body: 'x' }), null);
  assert.equal(readOp({ op: 'create', id: ID, page: '/about', anchor: [1], body: 'x' }), null);
  assert.equal(readOp({ op: 'create', id: ID, page: '/about', anchor: { big: 'x'.repeat(5000) }, body: 'x' }), null);
  assert.equal(readOp({ op: 'create', id: ID, page: '/about', anchor, body: '   ' }), null);
  assert.equal(readOp({ op: 'create', id: 'nope', page: '/about', anchor, body: 'x' }), null);
  assert.deepEqual(readOp({ op: 'reply', id: ID, thread: ID, body: 'ok' }), { op: 'reply', id: ID, thread: ID, body: 'ok' });
  assert.equal(readOp({ op: 'reply', id: ID, body: 'ok' }), null);
  assert.deepEqual(readOp({ op: 'resolve', id: ID, resolved: false }), { op: 'resolve', id: ID, resolved: false });
  assert.deepEqual(readOp({ op: 'resolve', id: ID }), { op: 'resolve', id: ID, resolved: true });
  assert.deepEqual(readOp({ op: 'delete', id: ID }), { op: 'delete', id: ID });
  assert.equal(readOp({ op: 'list', id: ID }), null);
  assert.equal(readOp({ op: 'drop table', id: ID }), null);
  assert.equal(readOp(null), null);
});

// ── Anchoring ────────────────────────────────────────────────────────────────

type Fake = ElementLike & { children: Fake[]; parentElement: Fake | null };

function el(tagName: string, attrs: Record<string, string> = {}, kids: Fake[] = [], text = ''): Fake {
  const node: Fake = {
    tagName: tagName.toUpperCase(),
    id: attrs.id,
    parentElement: null,
    children: kids,
    getAttribute: (name: string) => attrs[name] ?? null,
    get textContent() {
      return text + kids.map((kid) => kid.textContent ?? '').join('');
    },
  };
  for (const kid of kids) kid.parentElement = node;
  return node;
}

test('a quote is the words a person sees: no marks, no stega, flat, clipped', () => {
  assert.equal(quoteOf('  Hello\u{E0001}\u{E0061}\n  world​ '), 'Hello world');
  assert.equal(quoteOf('x'.repeat(300)).length, 120);
  assert.equal(quoteOf(null), '');
});

test('a picture quotes its alt text, or its file name', () => {
  assert.equal(wordsOf(el('img', { alt: 'Jonathan Delshad', src: '/a.jpg' })), 'Jonathan Delshad');
  assert.equal(wordsOf(el('img', { src: '/_next/image/team%20photo.webp?w=640' })), 'team photo.webp');
});

test('only an id a person wrote is a stable name', () => {
  for (const good of ['pricing', 'faq-section', 'hero_title']) assert.equal(stableId(good), true, good);
  for (const bad of [':r1:', '«r3»', 'radix-12', 'headlessui-menu-3', 'item-12345', 'a1b2c3d4e5', '', '1abc']) {
    assert.equal(stableId(bad), false, bad);
  }
});

test('a path stops at the editor\'s content id, then a written id, then counts tags', () => {
  const heading = el('h1', { 'data-lf-id': 'about:hero.title' }, [], 'Our practice');
  const span = el('span', {}, [], 'here');
  const para = el('p', {}, [span]);
  const second = el('p', {}, [], 'two');
  const section = el('section', { id: 'team' }, [para, second]);
  const generated = el('div', { id: ':r5:' }, [heading]);
  const main = el('main', {}, [generated, section]);
  const root = el('div', {}, [main]);

  assert.equal(selectorFor(heading, root), '[data-lf-id="about:hero.title"]');
  assert.equal(selectorFor(span, root), '#team > p:nth-of-type(1) > span');
  assert.equal(selectorFor(second, root), '#team > p:nth-of-type(2)');
  assert.equal(selectorFor(generated, root), ':scope > main > div');
  assert.equal(selectorFor(el('a', { 'data-lf-id': 'x"y' }), root), '[data-lf-id="x\\"y"]');
});

test('the spot inside an element is a fraction, so it holds at any width', () => {
  const box = { left: 100, top: 200, width: 400, height: 100 };
  assert.deepEqual(spotWithin(box, 200, 250), { rx: 0.25, ry: 0.5 });
  assert.deepEqual(spotWithin(box, 9999, -5), { rx: 1, ry: 0 });
  assert.deepEqual(spotWithin({ left: 0, top: 0, width: 0, height: 0 }, 5, 5), { rx: 0.5, ry: 0.5 });
  assert.deepEqual(pointIn({ left: 10, top: 20, width: 200, height: 40 }, 0.25, 0.5), { x: 60, y: 40 });
});

test('an anchor is read back only when it is one the editor wrote', () => {
  const good = { v: 1, selector: 'h1', tag: 'h1', quote: 'Hi', rx: 0.1, ry: 0.2, px: 0.3, py: 400, vw: 1440 };
  assert.deepEqual(readAnchor(good), good);
  assert.equal(readAnchor({ ...good, selector: '' }), null);
  assert.equal(readAnchor({ ...good, rx: 'x' }), null);
  assert.equal(readAnchor(null), null);
});

test('a pin is found where it was put, then by its words, else it is detached', () => {
  const anchor: CommentAnchor = { v: 1, selector: '#a', tag: 'h2', quote: 'Our record', rx: 0, ry: 0, px: 0, py: 0, vw: 1440 };
  const same = el('h2', {}, [], 'Our record');
  const edited = el('h2', {}, [], 'Our results');
  const moved = el('h2', {}, [], 'Our record');
  const other = el('h2', {}, [], 'Something else');

  assert.deepEqual(resolveAnchor(anchor, () => same, () => []), { el: same, state: 'exact' });
  // The words were edited in the editor: still this element, and the thread says so.
  assert.deepEqual(resolveAnchor(anchor, () => edited, () => []), { el: edited, state: 'changed' });
  assert.deepEqual(resolveAnchor(anchor, () => null, () => [other, moved]), { el: moved, state: 'moved' });
  // Two matches are a guess, and a guess is not made.
  assert.deepEqual(resolveAnchor(anchor, () => null, () => [moved, el('h2', {}, [], 'Our record')]), { el: null, state: 'detached' });
  assert.deepEqual(resolveAnchor(anchor, () => { throw new Error('bad selector'); }, () => []), { el: null, state: 'detached' });
});

test('an element that is gone hands its pin to the part of the page around it, never to the page itself', () => {
  const section = el('section', { id: 'team' });
  const deep: CommentAnchor = {
    v: 1, selector: '#team > div:nth-of-type(2) > a', tag: 'a', quote: 'Gone button', rx: 0, ry: 0, px: 0, py: 0, vw: 1440,
  };
  const asked: string[] = [];
  const found = resolveAnchor(deep, (selector) => {
    asked.push(selector);
    return selector === '#team' ? section : null;
  }, () => []);
  assert.deepEqual(found, { el: section, state: 'parent' });
  assert.deepEqual(asked, ['#team > div:nth-of-type(2) > a', '#team > div:nth-of-type(2)', '#team']);

  const top: CommentAnchor = { ...deep, selector: ':scope > main > a' };
  const tried: string[] = [];
  const none = resolveAnchor(top, (selector) => {
    tried.push(selector);
    return null;
  }, () => []);
  assert.equal(none.state, 'detached');
  assert.ok(!tried.includes(':scope'), 'the page root is never a spot');
});
