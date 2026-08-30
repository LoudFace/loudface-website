/**
 * Tests for ranked-list JSON-LD extraction.
 *
 * Run with: npx tsx --test src/lib/__tests__/schema-utils.test.ts
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildItemListSchema, extractRankedListFromHTML } from '../schema-utils';

describe('extractRankedListFromHTML', () => {
  it('preserves the existing three-item h3 behavior', () => {
    const html = '<h3>3. Gamma</h3><h3>1. Alpha</h3><h3>2. Beta</h3>';

    assert.deepEqual(extractRankedListFromHTML(html), ['Alpha', 'Beta', 'Gamma']);
  });

  it('extracts a ranked h2 roster with at least five entries', () => {
    const html = [
      '<h2>1. LoudFace: best for integrated GEO</h2>',
      '<h2>2. First Page Sage</h2>',
      '<h2>3. Omniscient Digital</h2>',
      '<h2>4. iPullRank</h2>',
      '<h2>5. The Digital Elevator</h2>',
    ].join('');

    assert.deepEqual(extractRankedListFromHTML(html), [
      'LoudFace: best for integrated GEO',
      'First Page Sage',
      'Omniscient Digital',
      'iPullRank',
      'The Digital Elevator',
    ]);
  });

  it('rejects short numbered h2 how-to sections', () => {
    const html = [
      '<h2>1. Add the embed</h2>',
      '<h2>2. Delay the script</h2>',
      '<h2>3. Measure the result</h2>',
      '<h2>4. Compare the data</h2>',
    ].join('');

    assert.deepEqual(extractRankedListFromHTML(html), []);
  });

  it('keeps h3 extraction isolated when both heading levels are numbered', () => {
    const html = [
      '<h2>1. Section one</h2>',
      '<h2>2. Section two</h2>',
      '<h2>3. Section three</h2>',
      '<h2>4. Section four</h2>',
      '<h2>5. Section five</h2>',
      '<h3>1. Alpha</h3>',
      '<h3>2. Beta</h3>',
      '<h3>3. Gamma</h3>',
    ].join('');

    assert.deepEqual(extractRankedListFromHTML(html), ['Alpha', 'Beta', 'Gamma']);
  });
});

describe('buildItemListSchema', () => {
  it('emits ItemList schema for a five-entry h2 roster', () => {
    const html = Array.from({ length: 5 }, (_, index) => `<h2>${index + 1}. Agency ${index + 1}</h2>`).join('');

    const schema = buildItemListSchema(html, 'Best GEO agencies', 'https://example.com/best-geo-agencies');

    assert.ok(schema);
    assert.equal((schema as { '@type': string })['@type'], 'ItemList');
    assert.equal((schema as { numberOfItems: number }).numberOfItems, 5);
  });
});
