/**
 * Tests for the stale-revision check: `isStale` and `applyToText`'s `expected`.
 *
 * Run with: npx tsx --test src/lib/__tests__/inline-edit-stale.test.ts
 *
 * Two people editing one sentence in the same sitting used to mean the second
 * Publish silently threw the first away, with nothing on screen saying so.
 * Undo has had this check since it was written; publish had not.
 *
 * The hard part is not refusing — it is NOT refusing on an ordinary publish.
 * What the browser sends is the element's innerHTML, which carries whatever
 * whitespace and markup the browser felt like adding, so the comparison runs
 * both values through the same cleaner a publish writes through.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isStale, staleMessage } from '../inline-edit/sanitize';
import { applyToText } from '../inline-edit/content-text';

const file = JSON.stringify(
  { hero: { title: 'Growth for B2B SaaS', blurb: 'We write <a href="/blog">the words</a> that rank.' } },
  null,
  2,
);

describe('isStale', () => {
  it('says nothing is wrong when no expectation was sent', () => {
    // An older editor, or an undo: neither carries one, and neither is checked.
    assert.equal(isStale('Growth for B2B SaaS', undefined), false);
  });

  it('accepts the value the page rendered', () => {
    assert.equal(isStale('Growth for B2B SaaS', 'Growth for B2B SaaS'), false);
  });

  it('accepts the browser’s own spacing around the same words', () => {
    // This is the case that would otherwise refuse every second publish.
    assert.equal(isStale('Growth for B2B SaaS', '  Growth   for B2B SaaS '), false);
  });

  it('accepts a rich value the browser handed back with its own markup', () => {
    const stored = 'We write <a href="/blog">the words</a> that rank.';
    assert.equal(isStale(stored, '<span style="color:red">We write <a href="/blog">the words</a> that rank.</span>'), false);
  });

  it('refuses when somebody else changed the words', () => {
    assert.equal(isStale('Growth for B2B SaaS today', 'Growth for B2B SaaS'), true);
  });

  it('refuses when somebody else moved the link inside a rich value', () => {
    assert.equal(
      isStale('We write <a href="/research">the words</a> that rank.', 'We write <a href="/blog">the words</a> that rank.'),
      true,
    );
  });

  it('has one sentence, and it says what to do', () => {
    assert.match(staleMessage('hero.title'), /^Someone changed hero\.title since you opened the page; reload/);
  });
});

describe('applyToText with an expectation', () => {
  it('writes the change when the file still says what the page showed', () => {
    const result = applyToText(file, 'hero:hero.title', 'Growth for B2B SaaS teams', false, 'Growth for B2B SaaS');
    assert.equal(result.after, 'Growth for B2B SaaS teams');
  });

  it('refuses the whole publish when the file has moved on', () => {
    assert.throws(
      () => applyToText(file, 'hero:hero.title', 'Growth for B2B SaaS teams', false, 'Something else entirely'),
      /Someone changed hero\.title since you opened the page/,
    );
  });

  it('still writes when no expectation is sent', () => {
    const result = applyToText(file, 'hero:hero.title', 'Growth, plainly');
    assert.equal(result.after, 'Growth, plainly');
  });

  it('lets an undo through, whatever the field now holds', () => {
    // An undo carries a value this server signed and has already checked
    // against the commit it is undoing; a second check here would only ever
    // refuse the undo of a change somebody has since edited.
    const result = applyToText(file, 'hero:hero.title', 'Growth for B2B SaaS', true, 'not what is there');
    assert.equal(result.after, 'Growth for B2B SaaS');
  });
});
