/**
 * The Team App's one-click sign-in: what a handoff token proves and what it
 * never proves. Whether the person may edit is the route's question
 * (isAllowed), asked after the token is good.
 */
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import test from 'node:test';

import { HANDOFF_SECONDS, openHandoff, originOf, sealHandoff } from '../inline-edit/handoff';

const SECRET = 'handoff-test-secret';
const NOW = Date.parse('2026-10-16T12:00:00Z');

test('a token the Team App sealed opens for the site it names, for one minute', () => {
  const token = sealHandoff(SECRET, 'Arnel@LoudFace.co', 'https://www.loudface.co/some/page', NOW);
  assert.deepEqual(openHandoff(SECRET, token, 'https://www.loudface.co', NOW + 1000), { ok: true, email: 'arnel@loudface.co' });
  assert.deepEqual(openHandoff(SECRET, token, 'https://www.loudface.co', NOW + HANDOFF_SECONDS * 1000 + 1), { ok: false, reason: 'expired' });
});

test('a token for one site is useless on another, even with the same secret', () => {
  const token = sealHandoff(SECRET, 'arnel@loudface.co', 'https://www.loudface.co', NOW);
  assert.deepEqual(openHandoff(SECRET, token, 'https://delshadlegal.com', NOW), { ok: false, reason: 'wrong-site' });
  assert.deepEqual(openHandoff(SECRET, token, 'https://loudface.co', NOW), { ok: false, reason: 'wrong-site' });
});

test('a wrong secret, a changed address, a sign-in token or junk is refused', () => {
  const token = sealHandoff(SECRET, 'arnel@loudface.co', 'https://www.loudface.co', NOW);
  assert.equal(openHandoff('another-secret', token, 'https://www.loudface.co', NOW).ok, false);
  const [, signature] = token.split('.');
  const forged = `${Buffer.from(`handoff|someone@else.com|${NOW + 30_000}|https://www.loudface.co`).toString('base64url')}.${signature}`;
  assert.deepEqual(openHandoff(SECRET, forged, 'https://www.loudface.co', NOW), { ok: false, reason: 'bad' });
  for (const junk of ['', 'x', 'a.b', '..']) assert.deepEqual(openHandoff(SECRET, junk, 'https://www.loudface.co', NOW), { ok: false, reason: 'bad' });
});

test('a deadline further out than a handoff can be was not made by the Team App', () => {
  const payload = `handoff|arnel@loudface.co|${NOW + 24 * 3600_000}|https://www.loudface.co`;
  const long = `${Buffer.from(payload).toString('base64url')}.${createHmac('sha256', SECRET).update(payload).digest('base64url')}`;
  assert.deepEqual(openHandoff(SECRET, long, 'https://www.loudface.co', NOW), { ok: false, reason: 'bad' });
});

test('a site with no secret takes no handoff at all', () => {
  const token = sealHandoff(SECRET, 'arnel@loudface.co', 'https://www.loudface.co', NOW);
  assert.deepEqual(openHandoff(undefined, token, 'https://www.loudface.co', NOW), { ok: false, reason: 'off' });
  assert.deepEqual(openHandoff('', token, 'https://www.loudface.co', NOW), { ok: false, reason: 'off' });
});

test('an origin is https and nothing else, except a laptop', () => {
  assert.equal(originOf('https://www.loudface.co/about?x=1'), 'https://www.loudface.co');
  assert.equal(originOf('http://www.loudface.co'), null);
  assert.equal(originOf('http://localhost:1356/x'), 'http://localhost:1356');
  assert.equal(originOf('not a url'), null);
});
