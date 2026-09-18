/**
 * Tests for reading a list of commits as a list of publishes.
 *
 * Run with: npx tsx --test src/lib/__tests__/inline-edit-history.test.ts
 *
 * One rule pays for itself here. Undo makes a revert commit, and a revert
 * commit is a commit, so it appears at the top of History. On 2026-09-18 the
 * row offered "Undo", a client pressed it, and the nav went back to pointing at
 * the wrong page with nothing on screen saying that is what would happen.
 *
 * Two halves fix it: the row says what it is (`undoneSummary`), and a revert
 * that has itself been reverted is marked as done (`revertedShas`), so the
 * offer is never made twice.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isPublishSummary, landedRecently, revertedShas, undoneSummary } from '../inline-edit/publish-history';

/** A publish, its undo, and the undo of that undo — the three git really writes. */
const PUBLISH = 'a'.repeat(40);
const REVERT = 'b'.repeat(40);
const REDO = 'c'.repeat(40);

const publishMessage = 'Content: nav:links.1.href\n\n- nav:links.1.href\n  was: /blog\n  now: /case-studies';
const revertMessage = `Revert "Content: nav:links.1.href"\n\nThis reverts commit ${PUBLISH}.`;
const redoMessage = `Revert "Revert "Content: nav:links.1.href""\n\nThis reverts commit ${REVERT}.`;

const first = (message: string) => message.split('\n')[0];

describe('undoneSummary', () => {
  it('reads what a revert commit undid', () => {
    assert.equal(undoneSummary(first(revertMessage)), 'Content: nav:links.1.href');
  });

  it('answers null for an ordinary publish, which undid nothing', () => {
    assert.equal(undoneSummary(first(publishMessage)), null);
  });

  it('reads a revert of a revert, so even that row can say what it does', () => {
    assert.equal(undoneSummary(first(redoMessage)), 'Revert "Content: nav:links.1.href"');
  });
});

describe('revertedShas', () => {
  it('marks the publish once it has been undone', () => {
    const reverted = revertedShas([revertMessage, publishMessage]);
    assert.equal(reverted.has(PUBLISH), true);
    assert.equal(reverted.has(REVERT), false);
  });

  it('marks the undo itself once a later commit has undone IT', () => {
    // The row that offered "Undo" on a revert: after a redo it is spent, so the
    // History panel shows "undone" and no button at all.
    const reverted = revertedShas([redoMessage, revertMessage, publishMessage]);
    assert.equal(reverted.has(REVERT), true);
    assert.equal(reverted.has(PUBLISH), true);
    assert.equal(reverted.has(REDO), false);
  });

  it('finds nothing in a history of plain publishes', () => {
    assert.equal(revertedShas([publishMessage]).size, 0);
  });

  it('ignores a message that only talks about reverting', () => {
    assert.equal(revertedShas(['Content: about:intro\n\n  now: This reverts commit nothing']).size, 0);
  });
});

describe('isPublishSummary', () => {
  it('keeps a publish', () => {
    assert.equal(isPublishSummary(first(publishMessage)), true);
  });

  it('keeps the undo of a publish, which a client may want back', () => {
    assert.equal(isPublishSummary(first(revertMessage)), true);
  });

  it('leaves out a revert of a revert: that change is already offered above', () => {
    assert.equal(isPublishSummary(first(redoMessage)), false);
  });

  it('leaves out a commit this editor did not make', () => {
    assert.equal(isPublishSummary('Editors: added sam@example.com'), false);
    assert.equal(isPublishSummary('fix: the hero grid on mobile'), false);
  });
});

/**
 * Did a publish whose answer never arrived actually land?
 *
 * A commit can be made and the response lost — a dropped connection, a function
 * that outlived its request. The editor then reported "could not reach the
 * site" over words that were already on the repository, and a client who
 * pressed Publish again made a second commit of the same change.
 */
describe('landedRecently', () => {
  const NOW = Date.parse('2026-09-18T12:00:00.000Z');
  const row = (over: Partial<{ date: string; editor: string; fields: string[] }> = {}) => ({
    date: '2026-09-18T11:59:30.000Z',
    editor: 'client@example.com',
    fields: ['about:hero.title', 'about:hero.blurb'],
    ...over,
  });

  it('accepts the newest row when it is this person, just now, with these fields', () => {
    assert.equal(landedRecently([row()], 'client@example.com', ['about:hero.title'], NOW), true);
  });

  it('compares addresses the way every other part of the editor does', () => {
    assert.equal(landedRecently([row()], 'Client@Example.com ', ['about:hero.title'], NOW), true);
  });

  it('refuses a row somebody else made', () => {
    assert.equal(landedRecently([row()], 'someone@else.com', ['about:hero.title'], NOW), false);
  });

  it('refuses a row from before this sitting', () => {
    const old = row({ date: '2026-09-18T11:50:00.000Z' });
    assert.equal(landedRecently([old], 'client@example.com', ['about:hero.title'], NOW), false);
  });

  it('refuses a row that does not cover every field that was sent', () => {
    // Half the publish landing is not the publish landing: the rest stays staged.
    assert.equal(
      landedRecently([row()], 'client@example.com', ['about:hero.title', 'about:cta.label'], NOW),
      false,
    );
  });

  it('refuses an empty history, an empty list of fields and an unreadable date', () => {
    assert.equal(landedRecently([], 'client@example.com', ['about:hero.title'], NOW), false);
    assert.equal(landedRecently([row()], 'client@example.com', [], NOW), false);
    assert.equal(landedRecently([row({ date: 'never' })], 'client@example.com', ['about:hero.title'], NOW), false);
  });

  it('only ever looks at the newest row', () => {
    // An older publish of the same fields is not proof that this one landed.
    const older = row({ date: '2026-09-18T11:40:00.000Z' });
    assert.equal(
      landedRecently([row({ editor: 'someone@else.com' }), older], 'client@example.com', ['about:hero.title'], NOW),
      false,
    );
  });
});
