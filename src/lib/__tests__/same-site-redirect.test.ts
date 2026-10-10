/**
 * Where /api/draft-mode/disable may send the browser: only somewhere on this
 * site. Run with `npm run test:same-site`. Nothing here reaches the network.
 *
 * Until 2026-10-10 the route followed any ?redirect= value, so
 * ?redirect=https://example.com/x sent a visitor from www.loudface.co to
 * example.com: an open redirect a phishing link could borrow. The helper
 * compares origins, never prefixes, because "/\example.com" and
 * "/<tab>/example.com" start with one slash and a browser still leaves the
 * site on them.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { sameSiteRedirect } from '../same-site-redirect';

const ORIGIN = 'https://www.loudface.co';
const HOME = `${ORIGIN}/`;

const target = (value: string | null) => sameSiteRedirect(value, ORIGIN).href;

test('keeps a path on this site, with its query and hash', () => {
  assert.equal(
    target('/blog/best-aeo-agencies?utm_source=x&x=1#faq'),
    `${ORIGIN}/blog/best-aeo-agencies?utm_source=x&x=1#faq`,
  );
  assert.equal(target('/blog'), `${ORIGIN}/blog`);
  assert.equal(target('/'), HOME);
});

test('keeps a full URL on this site', () => {
  assert.equal(target(`${ORIGIN}/blog`), `${ORIGIN}/blog`);
});

test('sends every other host to the home page', () => {
  for (const value of [
    'https://example.com/x',
    '//example.com',
    '/\\example.com',
    '\\\\example.com',
    '/\t/example.com',
    'https://www.loudface.co.example.com/',
    'https://www.loudface.co@example.com/',
    'http://www.loudface.co/x',
    'javascript:alert(1)',
    'data:text/html,hi',
  ]) {
    assert.equal(target(value), HOME, JSON.stringify(value));
  }
});

test('stays on the site when the path normalises to //host', () => {
  // "/.//example.com" becomes the path "//example.com". Resolving that path
  // again would leave the site, which is why the helper returns a full URL.
  const url = sameSiteRedirect('/.//example.com', ORIGIN);
  assert.equal(url.origin, ORIGIN);
  assert.equal(url.href, `${ORIGIN}//example.com`);
});

test('sends a missing, empty or malformed value to the home page', () => {
  for (const value of [null, '', 'http://[::1']) {
    assert.equal(target(value), HOME, JSON.stringify(value));
  }
});

test('the draft-mode exit route sends ?redirect= through the helper', () => {
  const route = readFileSync(
    new URL('../../app/api/draft-mode/disable/route.ts', import.meta.url),
    'utf8',
  );
  assert.match(route, /NextResponse\.redirect\(sameSiteRedirect\(url\.searchParams\.get\('redirect'\), url\.origin\)\)/);
});
