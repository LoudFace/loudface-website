/**
 * Tests for the id a content value carries, end to end.
 *
 * Run with: npx tsx --test src/lib/__tests__/inline-edit-content-ids.test.ts
 *
 * One side of the editor writes the id onto a value (`mark-tree.ts`); the other
 * side has to accept it back (`content-text.ts`). They are separate files with
 * separate rules about what a path may look like, so this walks every value in
 * every content file and checks the two agree. It also prints what the site
 * leaves alone, because "why can the client not click this?" is the question
 * that brings people back to these rules.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseId } from '../inline-edit/content-text';
import { markString } from '../inline-edit/mark-tree';
import { decode } from '../inline-edit/mark';
import { collect, contentFiles } from './content-fixture';

const files = contentFiles();

describe('content ids', () => {
  it('finds the content files to check', () => {
    assert.ok(files.length > 0, 'no content files found under src/data/content');
  });

  for (const file of files) {
    const { markable, skipped } = collect(file);

    it(`${file.name}: every markable value has an id the store accepts`, () => {
      assert.ok(markable.length > 0, `${file.name} has no editable strings at all`);

      for (const value of markable) {
        const parsed = parseId(value.id);
        assert.equal(parsed.file, file.file, `${value.id} points at the wrong file`);
        assert.equal(parsed.fieldPath, value.path.join('.'), `${value.id} lost part of its path`);
        assert.deepEqual(parsed.segments, value.path);
      }
    });

    it(`${file.name}: the id written onto a value is the id read back off it`, () => {
      for (const value of markable) {
        const marked = markString(file.file, value.path, value.value);
        if (value.image) {
          // An image keeps its id in the query, so the path still works.
          assert.ok(marked.includes(`lf=${encodeURIComponent(value.id)}`), `${value.id} lost its query mark`);
          continue;
        }
        assert.equal(decode(marked), value.id, `${value.id} did not survive the round trip`);
      }
    });

    it(`${file.name}: lists what the site leaves alone`, () => {
      const summary = new Map<string, number>();
      for (const value of skipped) summary.set(value.reason, (summary.get(value.reason) ?? 0) + 1);
      const parts = [...summary].map(([reason, n]) => `${reason}: ${n}`).join(', ');
      console.log(`  ${file.name}: ${markable.length} editable, skipped ${parts || 'nothing'}`);
      for (const value of skipped.slice(0, 5)) {
        console.log(`    ${value.reason.padEnd(8)} ${value.path.join('.')} = ${JSON.stringify(value.value.slice(0, 60))}`);
      }
      // A report, never a failure: these are the rules working as intended.
      assert.ok(true);
    });
  }
});

describe('parseId refuses a path that is not content', () => {
  for (const bad of [
    'homepage:__proto__.polluted',
    'homepage:hero.__proto__',
    'homepage:constructor.prototype',
    'homepage:hero.prototype.x',
    'homepage:hero headline',
    '../secrets:hero.headline',
    'homepage',
    'homepage:',
  ]) {
    it(`refuses ${bad}`, () => {
      assert.throws(() => parseId(bad), /Bad (content id|field path)/);
    });
  }
});
