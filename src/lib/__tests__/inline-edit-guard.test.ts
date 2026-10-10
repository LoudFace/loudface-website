/**
 * Tests for src/lib/inline-edit/guard.ts
 *
 * Run with: npx tsx --test src/lib/__tests__/inline-edit-guard.test.ts
 *
 * The pure rules every /api/lf-edit route and the site layout share: where a
 * redirect may go, when the editor is up, when the resume chip shows, and how
 * the paused mark is read.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { editorIsUp, isPaused, pauseHref, resumeHref, safeNext, showResumeChip } from '../inline-edit/guard';

describe('editorIsUp', () => {
  it('needs Draft Mode and a session together', () => {
    assert.equal(editorIsUp('arnel@loudface.co', true), true);
  });

  it('is off when the session ran out under an open tab', () => {
    // Draft Mode's cookie outlives the eight-hour session; the bar must not
    // render from Draft Mode alone (2026-09-21: every button answered /edit).
    assert.equal(editorIsUp(null, true), false);
    assert.equal(editorIsUp(undefined, true), false);
    assert.equal(editorIsUp('', true), false);
  });

  it('is off when Draft Mode is off, session or not', () => {
    assert.equal(editorIsUp('arnel@loudface.co', false), false);
    assert.equal(editorIsUp(null, false), false);
  });
});

describe('showResumeChip', () => {
  it('shows only for a session with Draft Mode off and not paused', () => {
    assert.equal(showResumeChip('a@b.co', false), true);
    assert.equal(showResumeChip('a@b.co', true), false);
    assert.equal(showResumeChip('a@b.co', false, true), false);
    assert.equal(showResumeChip(null, false), false);
  });
});

describe('safeNext', () => {
  it('keeps a path on this site', () => {
    assert.equal(safeNext('/about'), '/about');
    assert.equal(safeNext('/blog/post?x=1'), '/blog/post?x=1');
  });

  it('falls back on anything that could leave the site', () => {
    assert.equal(safeNext('//evil.example'), '/');
    assert.equal(safeNext('https://evil.example'), '/');
    assert.equal(safeNext('/a\\b'), '/');
    assert.equal(safeNext(null), '/');
    assert.equal(safeNext('', '/x'), '/x');
  });

  it('falls back when a browser would read the path as another host', () => {
    // A browser drops tabs and newlines before it reads an address, so each of
    // these becomes "//evil.example" (2026-10-10: /api/lf-edit/pause followed
    // the tab to example.com).
    assert.equal(safeNext('/\t/evil.example'), '/');
    assert.equal(safeNext('/\n/evil.example'), '/');
    assert.equal(safeNext('/\r\n/evil.example'), '/');
  });

  it('never answers a path that starts with //', () => {
    // These stay on the site once, but normalise to "//evil.example", which a
    // second resolve would send to that host.
    assert.equal(safeNext('/.//evil.example'), '/');
    assert.equal(safeNext('/a/..//evil.example'), '/');
  });

  it('answers the path the browser will see, query and hash kept', () => {
    assert.equal(safeNext('/blog/post?x=1#top'), '/blog/post?x=1#top');
    assert.equal(safeNext('/a/./b/../c'), '/a/c');
  });
});

describe('paused mark', () => {
  it('matches the whole cookie name only', () => {
    assert.equal(isPaused('lf-paused=1'), true);
    assert.equal(isPaused('a=1; lf-paused=1; b=2'), true);
    assert.equal(isPaused('not-lf-paused=1'), false);
    assert.equal(isPaused('lf-paused=0'), false);
    assert.equal(isPaused(null), false);
  });

  it('links carry the page back through the safe-next rule', () => {
    assert.equal(pauseHref('/pricing'), '/api/lf-edit/pause?next=%2Fpricing');
    assert.equal(resumeHref('//evil'), '/api/lf-edit/resume?next=%2F');
  });
});
