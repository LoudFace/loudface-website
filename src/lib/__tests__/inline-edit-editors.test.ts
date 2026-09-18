/**
 * Tests for src/lib/inline-edit/editors-list.ts
 *
 * Run with: npx tsx --test src/lib/__tests__/inline-edit-editors.test.ts
 *
 * This list decides who can sign in to a client's site. The rules it has to
 * hold: a malformed file never locks anybody out, an address is one address
 * however it was typed, an owner is never turned into an editor, and the file
 * it writes is a diff a human can read.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isOwner,
  isValidEmail,
  mergeAccess,
  normalizeEmail,
  parseEditors,
  serializeEditors,
  withEditor,
  withoutEditor,
  type EditorList,
} from '../inline-edit/editors-list';

const OWNERS = ['arnel@loudface.co', 'hello@loudface.co'];
const NOW = '2026-09-18T10:00:00.000Z';

const listOf = (...emails: string[]): EditorList => ({
  editors: emails.map((email) => ({ email, addedBy: 'arnel@loudface.co', addedAt: NOW })),
});

describe('parseEditors', () => {
  it('reads a valid file', () => {
    const text = JSON.stringify({
      editors: [{ email: 'Client@Example.com', addedBy: 'arnel@loudface.co', addedAt: NOW }],
    });
    assert.deepEqual(parseEditors(text).editors, [
      { email: 'client@example.com', addedBy: 'arnel@loudface.co', addedAt: NOW },
    ]);
  });

  it('reads the empty file the repository starts with', () => {
    assert.deepEqual(parseEditors('{\n  "editors": []\n}\n'), { editors: [] });
  });

  it('never throws on a malformed file', () => {
    // Each of these would lock every invited editor out of the site if it threw.
    for (const bad of ['', 'not json', '[]', 'null', '{}', '{"editors":"nope"}', '{"editors":{}}']) {
      assert.deepEqual(parseEditors(bad), { editors: [] }, `threw or mis-read: ${bad}`);
    }
  });

  it('drops entries that are not editors, and keeps the rest', () => {
    const text = JSON.stringify({
      editors: [
        'client@example.com',
        null,
        { addedBy: 'arnel@loudface.co' },
        { email: 'not an address' },
        { email: 'good@example.com' },
      ],
    });
    assert.deepEqual(parseEditors(text).editors, [
      { email: 'good@example.com', addedBy: '', addedAt: '' },
    ]);
  });

  it('keeps one row per address when the file repeats one', () => {
    const text = JSON.stringify({
      editors: [
        { email: 'client@example.com', addedBy: 'a@loudface.co', addedAt: NOW },
        { email: 'CLIENT@example.com', addedBy: 'b@loudface.co', addedAt: NOW },
      ],
    });
    assert.equal(parseEditors(text).editors.length, 1);
    assert.equal(parseEditors(text).editors[0].addedBy, 'a@loudface.co');
  });
});

describe('isValidEmail', () => {
  it('accepts an ordinary address', () => {
    for (const good of ['a@b.co', 'client@example.com', 'first.last+tag@sub.example.co.uk']) {
      assert.equal(isValidEmail(good), true, good);
    }
  });

  it('rejects spaces, a missing @, and a domain with no dot', () => {
    for (const bad of [
      'client example.com',
      'client @example.com',
      'client@ example.com',
      'clientexample.com',
      'client@localhost',
      '@example.com',
      'client@',
      'a@b@c.com',
      'client@example.com, other@example.com',
      '',
      '   ',
    ]) {
      assert.equal(isValidEmail(bad), false, bad);
    }
    assert.equal(isValidEmail(undefined), false);
    assert.equal(isValidEmail(42), false);
  });

  it('normalises case and surrounding space', () => {
    assert.equal(normalizeEmail('  Client@Example.COM '), 'client@example.com');
    assert.equal(isValidEmail('  Client@Example.COM '), true);
  });
});

describe('mergeAccess', () => {
  it('is the owners then the invited, lower-cased, with no repeats', () => {
    const merged = mergeAccess(['Arnel@LoudFace.co', 'hello@loudface.co'], listOf('client@example.com').editors);
    assert.deepEqual(merged, ['arnel@loudface.co', 'hello@loudface.co', 'client@example.com']);
  });

  it('counts somebody who is both once', () => {
    const merged = mergeAccess(OWNERS, listOf('arnel@loudface.co', 'client@example.com').editors);
    assert.deepEqual(merged, ['arnel@loudface.co', 'hello@loudface.co', 'client@example.com']);
  });

  it('is just the owners when nobody has been invited', () => {
    assert.deepEqual(mergeAccess(OWNERS, []), OWNERS);
  });

  it('knows who is an owner whatever the typing', () => {
    assert.equal(isOwner(OWNERS, ' Arnel@LoudFace.CO '), true);
    assert.equal(isOwner(OWNERS, 'client@example.com'), false);
  });
});

describe('withEditor', () => {
  it('appends, keeping the order people were invited in', () => {
    let list: EditorList = { editors: [] };
    list = withEditor(list, 'first@example.com', 'arnel@loudface.co', NOW, OWNERS);
    list = withEditor(list, 'second@example.com', 'arnel@loudface.co', NOW, OWNERS);
    list = withEditor(list, 'third@example.com', 'first@example.com', NOW, OWNERS);
    assert.deepEqual(list.editors.map((editor) => editor.email), [
      'first@example.com',
      'second@example.com',
      'third@example.com',
    ]);
  });

  it('stamps who added them and when', () => {
    const list = withEditor({ editors: [] }, 'Client@Example.com', 'Arnel@LoudFace.co', new Date(NOW));
    assert.deepEqual(list.editors[0], {
      email: 'client@example.com',
      addedBy: 'arnel@loudface.co',
      addedAt: NOW,
    });
  });

  it('leaves the list it was given alone', () => {
    const before = listOf('client@example.com');
    withEditor(before, 'other@example.com', 'arnel@loudface.co', NOW, OWNERS);
    assert.equal(before.editors.length, 1);
  });

  it('refuses a duplicate, however it is typed', () => {
    const list = listOf('client@example.com');
    assert.throws(
      () => withEditor(list, ' CLIENT@example.com ', 'arnel@loudface.co', NOW, OWNERS),
      /already has access/,
    );
  });

  it('refuses an owner, and says they are already one', () => {
    assert.throws(
      () => withEditor({ editors: [] }, 'Arnel@LoudFace.co', 'hello@loudface.co', NOW, OWNERS),
      /already an owner/,
    );
  });

  it('refuses an address that is not one', () => {
    assert.throws(
      () => withEditor({ editors: [] }, 'client example.com', 'arnel@loudface.co', NOW, OWNERS),
      /does not look like an email address/,
    );
  });
});

describe('withoutEditor', () => {
  it('removes one person and leaves the others in order', () => {
    const list = listOf('a@example.com', 'b@example.com', 'c@example.com');
    const next = withoutEditor(list, ' B@Example.com ', OWNERS);
    assert.deepEqual(next.editors.map((editor) => editor.email), ['a@example.com', 'c@example.com']);
    assert.equal(list.editors.length, 3, 'changed the list it was given');
  });

  it('refuses an owner: their address is not in this file', () => {
    assert.throws(() => withoutEditor(listOf('client@example.com'), 'arnel@loudface.co', OWNERS), /fixed/);
  });

  it('refuses somebody who is not on the list', () => {
    assert.throws(() => withoutEditor(listOf('client@example.com'), 'nobody@example.com', OWNERS), /not on the list/);
  });

  it('allows an editor to remove themselves', () => {
    const next = withoutEditor(listOf('client@example.com'), 'client@example.com', OWNERS);
    assert.deepEqual(next.editors, []);
  });
});

describe('serializeEditors', () => {
  it('is pretty-printed JSON with a trailing newline', () => {
    const text = serializeEditors(listOf('client@example.com'));
    assert.ok(text.endsWith('\n'), 'no trailing newline');
    assert.ok(text.includes('\n  "editors": ['), `not pretty-printed:\n${text}`);
    assert.equal(text, `${JSON.stringify(JSON.parse(text), null, 2)}\n`);
  });

  it('writes the empty file the repository starts with', () => {
    assert.equal(serializeEditors({ editors: [] }), '{\n  "editors": []\n}\n');
  });

  it('is stable: the same list is always the same bytes, fields in the same order', () => {
    const list = listOf('a@example.com', 'b@example.com');
    assert.equal(serializeEditors(list), serializeEditors(list));
    const scrambled: EditorList = {
      editors: list.editors.map(({ email, addedBy, addedAt }) => ({ addedAt, addedBy, email })),
    };
    assert.equal(serializeEditors(scrambled), serializeEditors(list));
  });

  it('round-trips through the parser', () => {
    const list = withEditor({ editors: [] }, 'client@example.com', 'arnel@loudface.co', NOW, OWNERS);
    assert.deepEqual(parseEditors(serializeEditors(list)), list);
  });

  it('adding one person changes one line plus the brackets', () => {
    // An invite has to read as an invite in the commit, not as a rewritten file.
    const before = serializeEditors(listOf('a@example.com')).split('\n');
    const after = serializeEditors(
      withEditor(listOf('a@example.com'), 'b@example.com', 'arnel@loudface.co', NOW, OWNERS),
    ).split('\n');
    const added = after.filter((line) => !before.includes(line));
    assert.ok(added.length <= 6, `an invite rewrote too much:\n${added.join('\n')}`);
  });
});
