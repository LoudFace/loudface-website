/**
 * Tests for src/lib/inline-edit/sanity-rules.ts
 *
 * Run with: npx tsx --test src/lib/__tests__/inline-edit-sanity.test.ts
 *
 * Three questions decide whether a click on a page may change a CMS document,
 * and each of them was a real hole before:
 *
 *   - a Studio draft of the same field used to be read as the "before" and
 *     written back, so an unfinished Studio edit went live the moment a client
 *     changed any word on that page;
 *   - any document id the page happened to carry could be patched, including
 *     drafts and Sanity's own system documents;
 *   - the picture a replacement left behind was kept for ever.
 *
 * `sanity-store.ts` itself imports `server-only` and cannot be loaded here, so
 * the decisions live in `sanity-rules.ts` and are tested as values.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  DRAFT_KEPT_NOTE,
  documentRefusal,
  draftDecision,
  shouldDeleteAsset,
} from '../inline-edit/sanity-rules';
import { EDITABLE_TYPES, pathsFor } from '../revalidate-paths';

describe('draftDecision', () => {
  it('has nothing to do when the document has no draft', () => {
    assert.equal(draftDecision(false, undefined, 'Our story'), null);
  });

  it('writes the draft when it says exactly what was published', () => {
    // The two were in step, so they stay in step and Studio shows the new words.
    assert.equal(draftDecision(true, 'Our story', 'Our story'), 'patch');
  });

  it('leaves a draft that says something else alone', () => {
    // Somebody is mid-sentence in Studio. Writing this would throw their work
    // away; this is the whole reason the rule exists.
    assert.equal(draftDecision(true, 'Our story, rewritten', 'Our story'), 'keep');
  });

  it('leaves a draft alone when the field is missing from it', () => {
    assert.equal(draftDecision(true, undefined, 'Our story'), 'keep');
  });

  it('leaves a draft alone when the field is not text at all', () => {
    assert.equal(draftDecision(true, { current: 'our-story' }, 'Our story'), 'keep');
  });

  it('never compares loosely: an empty draft value is not a missing one', () => {
    assert.equal(draftDecision(true, '', ''), 'patch');
    assert.equal(draftDecision(true, '', 'Our story'), 'keep');
  });

  it('has one sentence for the client, and it does not blame them', () => {
    assert.match(DRAFT_KEPT_NOTE, /Studio draft/);
  });
});

describe('documentRefusal', () => {
  it('lets through a published document of a type the site renders', () => {
    assert.equal(documentRefusal('abc123', 'blogPost'), null);
    assert.equal(documentRefusal('abc123', 'teamMember'), null);
  });

  it('refuses a draft: the editor publishes, it never promotes somebody else’s work', () => {
    assert.match(documentRefusal('drafts.abc123', 'blogPost') ?? '', /Studio draft/);
  });

  it('refuses a system document', () => {
    assert.equal(typeof documentRefusal('_.releases.r1', 'system.release'), 'string');
  });

  it('refuses a type this site has no page for', () => {
    // A settings singleton, a media tag, anything added to the schema later:
    // nothing renders it at a known address, so a click on a page is not what
    // changed it.
    for (const type of ['siteSettings', 'sanity.imageAsset', 'redirect']) {
      assert.equal(typeof documentRefusal('abc123', type), 'string', `allowed ${type}`);
    }
  });

  it('refuses a document whose type could not be read', () => {
    assert.equal(typeof documentRefusal('abc123', undefined), 'string');
  });
});

describe('EDITABLE_TYPES', () => {
  it('names only types pathsFor knows, so the two cannot drift apart', () => {
    // A type pathsFor does not name falls through to the homepage purge, which
    // is the same answer it gives for a type nobody has heard of.
    const fallback = pathsFor('something-nobody-added-yet', undefined).join('|');
    for (const type of EDITABLE_TYPES) {
      assert.notEqual(pathsFor(type, 'a-slug').join('|'), fallback, `${type} has no route of its own`);
    }
  });

  it('holds the types the site actually renders', () => {
    for (const type of ['blogPost', 'caseStudy', 'teamMember', 'seoPage']) {
      assert.equal(EDITABLE_TYPES.has(type), true, `${type} missing`);
    }
  });
});

describe('shouldDeleteAsset', () => {
  it('deletes a picture nothing points at any more', () => {
    assert.equal(shouldDeleteAsset(0), true);
  });

  it('keeps one a draft still uses', () => {
    // count(*[references($id)]) counts drafts too, which is what makes an
    // unfinished Studio edit enough to save the old picture.
    assert.equal(shouldDeleteAsset(1), false);
    assert.equal(shouldDeleteAsset(4), false);
  });
});
