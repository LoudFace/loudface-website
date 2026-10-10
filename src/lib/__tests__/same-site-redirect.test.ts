/**
 * Where /api/draft-mode/disable and the /fb/<token> link may send the browser:
 * only somewhere on this site. Run with `npm run test:same-site`. Nothing here
 * reaches the network. The editor's /api/lf-edit routes follow the same rule
 * through `safeNext`, tested in inline-edit-guard.test.ts; the last test here
 * checks that all five routes call their check.
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

test('sends a value with user details to the home page', () => {
  // The origin is this site's, but the address the visitor sees reads as
  // example.com, and Firefox asks whether to log in to the site as it.
  for (const value of [
    'https://example.com@www.loudface.co/x',
    '//example.com@www.loudface.co/x',
    'https://user:pass@www.loudface.co/x',
  ]) {
    assert.equal(target(value), HOME, value);
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

test('the routes that follow a value from their own URL check it first', () => {
  for (const [file, call] of [
    [
      '../../app/api/draft-mode/disable/route.ts',
      "sameSiteRedirect(url.searchParams.get('redirect'), url.origin)",
    ],
    [
      '../../app/fb/[token]/route.ts',
      "sameSiteRedirect(request.nextUrl.searchParams.get('to'), request.nextUrl.origin)",
    ],
    // The editor's routes redirect relative to the page, so they use safeNext.
    ['../../app/api/lf-edit/pause/route.ts', "safeNext(new URL(request.url).searchParams.get('next'))"],
    ['../../app/api/lf-edit/resume/route.ts', "safeNext(new URL(request.url).searchParams.get('next'))"],
    ['../../app/api/lf-edit/verify/route.ts', "safeNext(url.searchParams.get('next'))"],
  ]) {
    const route = readFileSync(new URL(file, import.meta.url), 'utf8');
    assert.ok(route.includes(call), `${file} must redirect through ${call}`);
  }
});
