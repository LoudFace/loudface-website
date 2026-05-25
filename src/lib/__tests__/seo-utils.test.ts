/**
 * Tests for src/lib/seo-utils.ts
 *
 * Run with: npx tsx --test src/lib/__tests__/seo-utils.test.ts
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { truncateSeoTitle } from '../seo-utils';

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
