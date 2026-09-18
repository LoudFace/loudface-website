/**
 * Tests for src/lib/inline-edit/content-text.ts against the real content files.
 *
 * Run with: npx tsx --test src/lib/__tests__/inline-edit-apply.test.ts
 *
 * A publish edits the file's own text, not a re-serialised copy of it, so that
 * a copy change stays a one-line diff a human can review. This edits every
 * string in every content file and checks two things each time: the file still
 * parses and holds the new value, and the diff stayed one line — or, where the
 * same text appears twice in the file and the text edit cannot be aimed, that
 * the re-serialised file is the original with exactly that one field changed.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { applyToText, readField } from '../inline-edit/content-text';
import { collect, contentFiles } from './content-fixture';

/** How many lines differ between two versions of a file. */
function changedLines(before: string, after: string): number {
  const a = before.split('\n');
  const b = after.split('\n');
  if (a.length !== b.length) return Infinity;
  let n = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) n++;
  return n;
}

/** The value at a path, for the deep-equality check. */
function at(root: unknown, path: string[]): unknown {
  let node: unknown = root;
  for (const segment of path) node = (node as Record<string, unknown>)[segment];
  return node;
}

/**
 * A different value to write into this field.
 *
 * A field holding an address keeps holding an address — `applyToText` refuses
 * anything else there — so an image path is edited into another image path
 * rather than into a sentence. Everything else takes a word on the end.
 */
function probe(value: { value: string; image: boolean }): string {
  return value.image ? value.value.replace(/(\.[A-Za-z0-9]+)$/, '-x$1') : `${value.value} x`;
}

/** A copy of the parsed file with one field replaced. */
function withField(data: unknown, path: string[], value: string): unknown {
  const copy = JSON.parse(JSON.stringify(data));
  let node: Record<string, unknown> = copy as Record<string, unknown>;
  for (const segment of path.slice(0, -1)) node = node[segment] as Record<string, unknown>;
  node[path[path.length - 1]] = value;
  return copy;
}

describe('applyToText over every content value', () => {
  for (const file of contentFiles()) {
    const { markable } = collect(file);

    it(`${file.name}: ${markable.length} values write back cleanly`, () => {
      assert.ok(markable.length > 0, `${file.name} has no editable strings at all`);

      for (const value of markable) {
        const result = applyToText(file.raw, value.id, probe(value));

        assert.equal(result.before, value.value, `${value.id}: read the wrong old value`);
        assert.notEqual(result.after, result.before, `${value.id}: the edit did not change anything`);

        const parsed = JSON.parse(result.next);
        assert.equal(at(parsed, value.path), result.after, `${value.id}: the field does not hold the new value`);
        assert.equal(readField(result.next, value.id), result.after, `${value.id}: cannot be read back`);

        const lines = changedLines(file.raw, result.next);
        if (lines !== 1) {
          // The same text twice in one file: the value cannot be aimed at in the
          // text, so the file is written out again. Nothing else may move.
          assert.deepEqual(
            parsed,
            withField(file.data, value.path, result.after),
            `${value.id}: the re-serialised file changed more than that one field`,
          );
        }
      }
    });

    it(`${file.name}: an ordinary sentence is stored exactly as typed`, () => {
      // Nothing here for the cleaner to reshape: no markup, no entity to decode
      // (&amp; becomes &, by design) and no whitespace but single plain spaces
      // (a run, a tab or a no-break space collapses, also by design). What the
      // client typed has to come out the other end character for character.
      const plain = markable.filter(
        (value) =>
          !value.image &&
          !value.value.includes('<') &&
          !value.value.includes('&') &&
          !/[^\S ]| {2,}/.test(value.value) &&
          value.value === value.value.trim(),
      );
      assert.ok(plain.length > 0, `${file.name}: no plain sentence to check`);
      for (const value of plain) {
        const result = applyToText(file.raw, value.id, `${value.value} x`);
        assert.equal(result.after, `${value.value} x`, `${value.id}: the cleaner changed a plain sentence`);
      }
    });
  }
});

describe('applyToText refuses what it cannot write', () => {
  const file = contentFiles()[0];
  const first = collect(file).markable[0];

  it('refuses a field that does not exist', () => {
    assert.throws(() => applyToText(file.raw, `${file.file}:no.such.field`, 'x'), /does not exist/);
  });

  it('refuses to empty a value from the page', () => {
    assert.throws(() => applyToText(file.raw, first.id, '   '), /cannot be emptied/);
  });

  it('refuses a path through __proto__', () => {
    assert.throws(() => applyToText(file.raw, `${file.file}:__proto__.polluted`, 'x'), /Bad field path/);
    assert.equal(({} as Record<string, unknown>).polluted, undefined);
  });
});
