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
