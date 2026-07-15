/**
 * Tests for src/lib/html-utils.ts
 *
 * Run with: npx tsx --test src/lib/__tests__/html-utils.test.ts
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildHeadingWithId, countIdAttributes, stripIdAttributes } from '../html-utils';

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
