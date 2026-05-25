/**
 * Tests for src/lib/seo-utils.ts
 *
 * Run with: npx tsx --test src/lib/__tests__/seo-utils.test.ts
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { truncateSeoTitle, truncateSeoDescription } from '../seo-utils';

describe('truncateSeoTitle', () => {
  it('strips trailing & when truncation lands on an ampersand', () => {
    // Real failure observed 2026-05-26: this title rendered as
    // "Answer Engine Optimization (AEO) Strategies &" in the SERP,
    // ending with "&" → 0.01% CTR at position 9 with 12,079 impressions.
    const input = 'Answer Engine Optimization (AEO) Strategies & Best Practices 2026';
    const result = truncateSeoTitle(input);
    assert.ok(
      !result.endsWith('&'),
      `expected not to end with "&", got "${result}"`,
    );
    assert.ok(
      !/\band$/i.test(result),
      `expected not to end with "and", got "${result}"`,
    );
  });

  it('strips trailing "and" when truncation lands on it', () => {
    const input = 'Webflow vs Wix Studio in 2026 and Why It Matters';
    const result = truncateSeoTitle(input, 35);
    assert.ok(
      !/\band$/i.test(result),
      `expected not to end with "and", got "${result}"`,
    );
  });

  it('leaves short titles unchanged even if they end in a connective', () => {
    // 21 chars — well under the 48-char default — so no truncation runs
    // and the trailing "to" is preserved as the editor wrote it.
    assert.equal(
      truncateSeoTitle('The Complete Guide to'),
      'The Complete Guide to',
    );
  });

  it('strips each known dangling connective word', () => {
    const connectives = [
      'and',
      'or',
      'the',
      'a',
      'an',
      'of',
      'to',
      'in',
      'on',
      'at',
      'for',
      'with',
    ];
    const prefix = 'x'.repeat(40);
    for (const word of connectives) {
      const input = `${prefix} ${word} more words after`;
      const result = truncateSeoTitle(input);
      assert.ok(
        !new RegExp(`\\s${word}$`, 'i').test(result),
        `expected not to end with " ${word}" for input "${input}", got "${result}"`,
      );
    }
  });

  it('still strips trailing punctuation (regression for existing behavior)', () => {
    const input = 'A long title with several phrases, separated by commas, that goes on';
    const result = truncateSeoTitle(input);
    assert.ok(
      !/[,;:\-—–]$/.test(result),
      `unexpected trailing punctuation in "${result}"`,
    );
  });

  it('strips existing brand suffix from CMS titles', () => {
    assert.equal(
      truncateSeoTitle('Webflow SEO Guide | LoudFace'),
      'Webflow SEO Guide',
    );
  });
});

describe('truncateSeoDescription', () => {
  // Long enough to exceed MIN_META_DESCRIPTION (120) so the function actually runs.
  const long = (suffix: string) =>
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ' +
    suffix;

  it('strips trailing & when truncation lands on it', () => {
    const input = long('with extras & more bonus content that pushes well past the budget so we definitely truncate this');
    const result = truncateSeoDescription(input, 150);
    assert.ok(result, 'expected non-null result');
    assert.ok(!result.endsWith('&'), `expected not to end with "&", got "${result}"`);
  });

  it('strips trailing connective word', () => {
    const input = long('and definitely much more text that pushes us well over whatever sensible limit we chose for this test');
    const result = truncateSeoDescription(input, 150);
    assert.ok(result, 'expected non-null result');
    assert.ok(
      !/\b(and|or|the|a|an|of|to|in|on|at|for|with)$/i.test(result),
      `expected not to end with a connective word, got "${result}"`,
    );
  });

  it('returns null when description is too short to be useful', () => {
    assert.equal(truncateSeoDescription('Too short.'), null);
  });

  it('returns description as-is when under the limit', () => {
    const input = long('and that is the end of the line right here').slice(0, 155).trim();
    const result = truncateSeoDescription(input, 160);
    assert.equal(result, input);
  });
});
