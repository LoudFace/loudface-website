/**
 * Tests for ranked-list JSON-LD extraction.
 *
 * Run with: npx tsx --test src/lib/__tests__/schema-utils.test.ts
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildItemListSchema, extractRankedListFromHTML, isRankedListTitle } from '../schema-utils';

type ItemList = {
  '@type': string;
  numberOfItems: number;
  itemListElement: { '@type': string; position: number; name: string; url?: string }[];
};

describe('extractRankedListFromHTML', () => {
  it('reads numbered h3 entries in page order and keeps the name before the colon', () => {
    const html = [
      '<h3>1. <strong>LoudFace</strong>: best for seed to Series B SaaS</h3>',
      '<h3>2. NoGood: best for full-stack growth</h3>',
      '<h3>3. Refine Labs &amp; Co: best for Series B+</h3>',
    ].join('<p>Body.</p>');

    assert.deepEqual(extractRankedListFromHTML(html), ['LoudFace', 'NoGood', 'Refine Labs & Co']);
  });

  it('keeps an entry without a colon whole', () => {
    const html = '<h3>1. LoudFace</h3><h3>2. Skale</h3><h3>3. Omniscient Digital</h3>';

    assert.deepEqual(extractRankedListFromHTML(html), ['LoudFace', 'Skale', 'Omniscient Digital']);
  });

  it('reads names the way the page renders them', () => {
    const html = [
      '<h3>1. Loud<strong>Face</strong></h3>',
      '<h3>2. O\u2019Neil &#38; Co</h3>',
      '<h3>3. Acme Inc.</h3>',
    ].join('');

    assert.deepEqual(extractRankedListFromHTML(html), ['LoudFace', "O'Neil & Co", 'Acme Inc.']);
  });

  it('reads body h1 headings as h2, as the renderer shows them', () => {
    const html = Array.from({ length: 5 }, (_, i) => `<h1>${i + 1}. Agency ${i + 1}</h1>`).join('');

    assert.equal(extractRankedListFromHTML(html).length, 5);
  });

  it('rejects numbers that are out of page order', () => {
    const html = '<h3>3. Gamma</h3><h3>1. Alpha</h3><h3>2. Beta</h3>';

    assert.deepEqual(extractRankedListFromHTML(html), []);
  });

  it('rejects two numbered lists that restart at 1 instead of merging them', () => {
    const html = [
      '<h3>1. Starter</h3>', '<h3>2. Basic</h3>', '<h3>3. CMS</h3>',
      '<h3>1. Core</h3>', '<h3>2. Growth</h3>', '<h3>3. Agency</h3>',
    ].join('');

    assert.deepEqual(extractRankedListFromHTML(html), []);
  });

  it('extracts a ranked h2 roster with at least five entries', () => {
    const html = Array.from({ length: 5 }, (_, i) => `<h2>${i + 1}. Agency ${i + 1}</h2>`).join('');

    assert.deepEqual(extractRankedListFromHTML(html), ['Agency 1', 'Agency 2', 'Agency 3', 'Agency 4', 'Agency 5']);
  });

  it('rejects short numbered h2 how-to sections', () => {
    const html = Array.from({ length: 4 }, (_, i) => `<h2>${i + 1}. Step ${i + 1}</h2>`).join('');

    assert.deepEqual(extractRankedListFromHTML(html), []);
  });

  it('prefers h3 entries when both heading levels are numbered', () => {
    const html = [
      ...Array.from({ length: 5 }, (_, i) => `<h2>${i + 1}. Section ${i + 1}</h2>`),
      '<h3>1. Alpha</h3>', '<h3>2. Beta</h3>', '<h3>3. Gamma</h3>',
    ].join('');

    assert.deepEqual(extractRankedListFromHTML(html), ['Alpha', 'Beta', 'Gamma']);
  });

  it('falls back to a ranked table when the entries are paragraphs (proptech shape)', () => {
    const html = [
      '<h2>The nine agencies, ranked</h2>',
      '<table><thead><tr><th>Agency</th><th>Best for</th></tr></thead><tbody>',
      '<tr><td>1. LoudFace</td><td>Proptech SaaS</td></tr>',
      '<tr><td>2. DerivateX</td><td>$5M to $50M ARR</td></tr>',
      '<tr><td>3. Insivia</td><td>Real estate software</td></tr>',
      '</tbody></table>',
      '<table><tr><th>Brand</th><th>Visibility</th></tr><tr><td>DerivateX</td><td>68.9%</td></tr></table>',
      '<p><strong>1. LoudFace.</strong> Best for proptech.</p>',
    ].join('');

    assert.deepEqual(extractRankedListFromHTML(html), ['LoudFace', 'DerivateX', 'Insivia']);
  });

  it('returns nothing for a post with no ranked entries', () => {
    assert.deepEqual(extractRankedListFromHTML('<h2>Intro</h2><p>Text.</p>'), []);
    assert.deepEqual(extractRankedListFromHTML(undefined), []);
  });
});

describe('isRankedListTitle', () => {
  it('accepts ranking titles and rejects guides', () => {
    assert.equal(isRankedListTitle('Best SEO & AEO Agencies for Legal Tech SaaS (2026)'), true);
    assert.equal(isRankedListTitle('Alternatives to Animalz for B2B SaaS Content (Ranked)'), true);
    assert.equal(isRankedListTitle('Why Businesses Choose Loudface as Their Webflow Development Agency'), false);
    assert.equal(isRankedListTitle('Schema Markup for AEO in 2026: The 5 Types That Matter'), false);
  });
});

describe('buildItemListSchema', () => {
  const ranked = Array.from({ length: 5 }, (_, i) => `<h3>${i + 1}. Agency ${i + 1}: best for X</h3>`).join('');

  it('emits ListItems with position and name, and no url', () => {
    const schema = buildItemListSchema(ranked, 'Best GEO agencies (Ranked)', 'https://example.com/best') as ItemList;

    assert.equal(schema['@type'], 'ItemList');
    assert.equal(schema.numberOfItems, 5);
    assert.deepEqual(schema.itemListElement[0], { '@type': 'ListItem', position: 1, name: 'Agency 1' });
    assert.ok(schema.itemListElement.every((item) => !('url' in item)));
  });

  it('emits nothing on a ranking title with no ranked body', () => {
    assert.equal(buildItemListSchema('<h2>Intro</h2><p>Text.</p>', 'Best GEO agencies', 'https://example.com/best'), null);
  });

  it('emits nothing on a numbered post whose title is not a ranking', () => {
    assert.equal(buildItemListSchema(ranked, 'Five moves when traffic drops', 'https://example.com/moves'), null);
  });
});
