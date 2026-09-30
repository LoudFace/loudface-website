/**
 * Tests for src/lib/html-utils.ts
 *
 * Run with: npx tsx --test src/lib/__tests__/html-utils.test.ts
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildHeadingWithId, countIdAttributes, prepareBodyTables, stripIdAttributes } from '../html-utils';

/** The invariant: no emitted tag may carry two id attributes. */
function assertSingleId(html: string) {
  for (const openTag of html.match(/<[a-z][a-z0-9]*\b[^>]*>/gi) ?? []) {
    assert.ok(
      countIdAttributes(openTag) <= 1,
      `emitted a tag with ${countIdAttributes(openTag)} id attributes: ${openTag}`,
    );
  }
}

/** What the browser actually does: first id on a tag wins, the rest are discarded. */
function firstId(openTag: string): string | undefined {
  return openTag.match(/\sid\s*=\s*"([^"]*)"/i)?.[1];
}

describe('buildHeadingWithId', () => {
  it('strips the stray id="" the CMS export ships on headings', () => {
    // Real failure observed 2026-07-15: the TOC pipeline appended its generated id
    // without stripping the CMS one, emitting <h2 id="" id="section-0-background">.
    // The parser keeps the FIRST id, so the anchor target did not exist and every
    // TOC link was dead on 20 of 26 case studies and 16 blog posts, every viewport.
    const result = buildHeadingWithId('h2', ' id=""', 'section-0-background', 'Background');

    assert.equal(result, '<h2 id="section-0-background">Background</h2>');
    assertSingleId(result);
    assert.equal(firstId(result), 'section-0-background', 'the injected id must be the one the parser keeps');
  });

  it('replaces a non-empty pre-existing id rather than shadowing it', () => {
    const result = buildHeadingWithId('h2', ' id="legacy-anchor"', 'section-1-the-work', 'The work');

    assertSingleId(result);
    assert.equal(firstId(result), 'section-1-the-work');
  });

  it('preserves every non-id attribute', () => {
    const result = buildHeadingWithId('h2', ' class="h-sec" data-x="1"', 'section-2-results', 'Results');

    assert.equal(result, '<h2 class="h-sec" data-x="1" id="section-2-results">Results</h2>');
    assertSingleId(result);
  });

  it('does not mistake attributes whose name merely ends in id', () => {
    const result = buildHeadingWithId('h2', ' data-id="7" aria-hidden="false"', 'section-3-x', 'X');

    assert.match(result, /data-id="7"/, 'data-id is not an id attribute and must survive');
    assertSingleId(result);
    assert.equal(firstId(result), 'section-3-x');
  });

  it('handles single-quoted and unquoted ids', () => {
    for (const attrs of [" id='quoted'", ' id=bare']) {
      const result = buildHeadingWithId('h2', attrs, 'section-4-y', 'Y');
      assertSingleId(result);
      assert.equal(firstId(result), 'section-4-y', `failed for attrs: ${attrs}`);
    }
  });

  it('emits a single id for headings with no attributes at all', () => {
    const result = buildHeadingWithId('h2', '', 'section-5-z', 'Z');

    assert.equal(result, '<h2 id="section-5-z">Z</h2>');
    assertSingleId(result);
  });

  it('keeps inline markup in the heading content intact', () => {
    const result = buildHeadingWithId('h2', ' id=""', 'section-6-w', 'A <em>bold</em> claim');

    assert.equal(result, '<h2 id="section-6-w">A <em>bold</em> claim</h2>');
    assertSingleId(result);
  });
});

describe('stripIdAttributes', () => {
  it('removes every id attribute, leaving the rest untouched', () => {
    assert.equal(stripIdAttributes(' id="" class="x"'), ' class="x"');
    assert.equal(stripIdAttributes(' class="x"'), ' class="x"');
    assert.equal(stripIdAttributes(''), '');
  });
});

describe('countIdAttributes', () => {
  it('detects the double-id tag that shipped', () => {
    assert.equal(countIdAttributes('<h2 id="" id="section-0-background">'), 2);
    assert.equal(countIdAttributes('<h2 id="section-0-background">'), 1);
    assert.equal(countIdAttributes('<h2 class="h-sec">'), 0);
    assert.equal(countIdAttributes('<h2 data-id="7">'), 0);
  });
});

describe('prepareBodyTables', () => {
  const ranked =
    '<table>\n<thead><tr><th>Agency</th><th>Best for</th><th>Starting price (its own site, 29 Sep 2026)</th></tr></thead>\n' +
    '<tbody>\n<tr><td><strong>1. LoudFace</strong></td><td>B2B "marketplaces"</td><td>From $5k/mo</td></tr>\n' +
    '<tr><td>10. Directive Consulting</td><td>GEO inside <a href="/x">paid</a></td><td>Not published</td></tr>\n</tbody>\n</table>';

  it('labels every body cell with its column header and keeps the text byte for byte', () => {
    const out = prepareBodyTables(ranked);
    assert.match(out, /^<div class="blog-table-wrap is-stack"><table /);
    assert.equal((out.match(/data-label="Agency"/g) ?? []).length, 2);
    assert.equal((out.match(/data-label="Starting price \(its own site, 29 Sep 2026\)"/g) ?? []).length, 2);
    // the inline editor matches body text by sentence: only attributes may change, never text
    assert.equal(out.replace(/<[^>]*>/g, ''), ranked.replace(/<[^>]*>/g, ''));
  });

  it('adds table roles so a stacked phone layout keeps its semantics', () => {
    const out = prepareBodyTables(ranked);
    assert.match(out, /<table[^>]* role="table"/);
    assert.equal((out.match(/role="rowgroup"/g) ?? []).length, 2);
    assert.equal((out.match(/role="row"/g) ?? []).length, 3);
    assert.equal((out.match(/role="columnheader"/g) ?? []).length, 3);
    assert.equal((out.match(/role="cell"/g) ?? []).length, 6);
  });

  it('marks the key column length, the column count, figure cells and our own row', () => {
    const out = prepareBodyTables(ranked);
    // "10. Directive Consulting" is 24 characters: it wraps, in a column wide enough to keep "10." with "Directive"
    assert.match(out, /<table[^>]* data-key="mid"/);
    assert.match(out, /<table[^>]* data-cols="3"/);
    assert.doesNotMatch(out, /data-rank/);
    // "From $5k/mo" is prose that starts with a word: only a cell that is one figure or range gets tabular figures
    assert.doesNotMatch(out, /data-num/);
    assert.match(prepareBodyTables('<table><thead><tr><th>A</th><th>Price</th></tr></thead><tbody><tr><td>x</td><td>$5,000/mo</td></tr></tbody></table>'), /data-num=""/);
    assert.match(out, /<tr role="row" data-us="">/);
  });

  it('escapes a quote in a header and leaves a long key column wrapping', () => {
    const table = '<table><thead><tr><th>The "question"</th><th>Answer</th></tr></thead><tbody>' +
      '<tr><td>Walk me through one recent client piece, from topic to publish</td><td>Yes</td></tr></tbody></table>';
    const out = prepareBodyTables(table);
    assert.match(out, /data-label="The &quot;question&quot;"/);
    assert.doesNotMatch(out, /data-key/);
  });

  it('treats a bare rank column as ranked and reads the key length from the name beside it', () => {
    const table = '<table><thead><tr><th>#</th><th>Agency</th><th>Price</th></tr></thead><tbody>' +
      '<tr><td>1</td><td>LoudFace</td><td>From $5K/mo</td></tr><tr><td>2</td><td>NoGood</td><td>On request</td></tr></tbody></table>';
    const out = prepareBodyTables(table);
    assert.match(out, /<table[^>]* data-rank=""/);
    assert.match(out, /<table[^>]* data-key="short"/);
  });

  it('keeps the scrolling frame for a table without a thead, with two header rows, spanning cells or row headers', () => {
    const noHead = '<table header-row="true"><tr><td>Question</td><td>Red flag</td></tr><tr><td>1. Walk me</td><td>No</td></tr></table>';
    const twoRows = '<table><thead><tr><th>A</th><th>B</th></tr><tr><td>x</td><td>y</td></tr></thead></table>';
    const spanning = '<table><thead><tr><th colspan="2">A</th></tr></thead><tbody><tr><td>x</td><td>y</td></tr></tbody></table>';
    const rowHeader = '<table><thead><tr><th>A</th><th>B</th></tr></thead><tbody><tr><th>x</th><td>y</td></tr></tbody></table>';
    for (const table of [noHead, twoRows, spanning, rowHeader]) {
      assert.equal(prepareBodyTables(table), `<div class="blog-table-wrap">${table}</div>`);
    }
  });

  it('drops pasted inline styles and empty captions, and wraps every table in the body', () => {
    const html = '<p>a</p><table style="border-collapse:collapse;"><caption><p><br></p></caption><thead><tr><th style="padding:8px;">A</th>' +
      '<th>B</th></tr></thead><tbody><tr><td style="font-size:14px;">x</td><td>y</td></tr></tbody></table><p>b</p><table><tr><td>z</td></tr></table>';
    const out = prepareBodyTables(html);
    assert.doesNotMatch(out, /style=|<caption/);
    assert.equal((out.match(/class="blog-table-wrap/g) ?? []).length, 2);
    assert.match(out, /^<p>a<\/p><div class="blog-table-wrap is-stack">/);
  });
});
