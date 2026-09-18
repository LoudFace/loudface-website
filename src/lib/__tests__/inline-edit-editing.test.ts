/**
 * The decisions the editing surface makes on a client's keystroke, as pure
 * functions: what Enter does, what a paste puts on the page, when a field
 * counts as emptied, and when a visitor is offered the way back into editing.
 *
 * Run with: npx tsx --test src/lib/__tests__/inline-edit-editing.test.ts
 *
 * Each of these was a browser-only behaviour before, decided inside an event
 * handler nothing could run without a browser. They were also each wrong in a
 * way a client meets on their first afternoon: Enter threw away a line break in
 * an article, a paste from Word put markup on the page that the publish would
 * drop, emptying a field said nothing until Publish, and coming back after
 * lunch showed no editor at all.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resumeHref, showResumeChip } from '../inline-edit/guard';
import { EMPTY_FIELD_MESSAGE, enterAction, isEmptyValue, pasteInsert } from '../inline-edit/sanitize';

const PLAIN = 'Growth for B2B SaaS';
const RICH = 'We write <a href="/blog">the words</a> that rank.';

describe('showResumeChip', () => {
  it('offers the way back to a signed-in editor whose Draft Mode has lapsed', () => {
    // The case this exists for: Draft Mode's cookie dies with the window, the
    // session lasts eight hours, and the client came back after lunch.
    assert.equal(showResumeChip('arnel@loudface.co', false), true);
  });

  it('says nothing to an anonymous visitor', () => {
    // The whole rule the published HTML depends on: no session, no chip, so a
    // visitor's page is byte-identical to a site without the editor.
    assert.equal(showResumeChip(null, false), false);
    assert.equal(showResumeChip(undefined, false), false);
    assert.equal(showResumeChip('', false), false);
  });

  it('says nothing when the editor is already up', () => {
    assert.equal(showResumeChip('arnel@loudface.co', true), false);
  });

  it('sends them back to the page they are on', () => {
    assert.equal(resumeHref('/case-studies/pond'), '/api/lf-edit/resume?next=%2Fcase-studies%2Fpond');
  });

  it('never sends them off this site, whatever the pathname says', () => {
    // Same rule as every other redirect target: safeNext, not a second copy.
    assert.equal(resumeHref('//evil.example'), '/api/lf-edit/resume?next=%2F');
    assert.equal(resumeHref('https://evil.example'), '/api/lf-edit/resume?next=%2F');
  });
});

describe('enterAction', () => {
  it('ignores every other key', () => {
    assert.equal(enterAction('a', false, { stored: PLAIN }), 'ignore');
    assert.equal(enterAction('Escape', true, { stored: RICH }), 'ignore');
  });

  it('commits on Enter, in a plain field and in a rich one', () => {
    assert.equal(enterAction('Enter', false, { stored: PLAIN }), 'commit');
    assert.equal(enterAction('Enter', false, { stored: RICH }), 'commit');
    assert.equal(enterAction('Enter', false, { stored: '', body: true }), 'commit');
  });

  it('breaks the line on Shift+Enter where a break survives the publish', () => {
    assert.equal(enterAction('Enter', true, { stored: RICH }), 'break');
    assert.equal(enterAction('Enter', true, { stored: 'One line<br>another' }), 'break');
    assert.equal(enterAction('Enter', true, { stored: '', body: true }), 'break');
  });

  it('commits on Shift+Enter in a plain field, rather than faking a break', () => {
    // A plain value is cleaned back to one line on the way to disk, so a break
    // here would be on screen and nowhere else.
    assert.equal(enterAction('Enter', true, { stored: PLAIN }), 'commit');
  });
});

describe('pasteInsert', () => {
  const clip = (html: string, text: string) => ({ html, text });

  it('puts plain text into a plain field, whatever the clipboard carries', () => {
    const result = pasteInsert(
      clip('<span style="color:red"><b>Bold</b> words</span>', 'Bold words'),
      { stored: PLAIN },
    );
    assert.deepEqual(result, { mode: 'text', value: 'Bold words' });
  });

  it('keeps the tags a rich field keeps, and drops the rest', () => {
    const result = pasteInsert(
      clip('<p class="x" style="color:red">A <strong>strong</strong> <em>word</em></p>', 'A strong word'),
      { stored: RICH },
    );
    assert.equal(result.mode, 'html');
    assert.equal(result.value, 'A <strong>strong</strong> <em>word</em>');
  });

  it('keeps a safe link and throws away an unsafe one', () => {
    const safe = pasteInsert(clip('<a href="/pricing">pricing</a>', 'pricing'), { stored: RICH });
    assert.equal(safe.value, '<a href="/pricing">pricing</a>');

    const unsafe = pasteInsert(clip('<a href="javascript:alert(1)">tap</a>', 'tap'), { stored: RICH });
    assert.deepEqual(unsafe, { mode: 'text', value: 'tap' });
  });

  it('never lets a script through, in either kind of field', () => {
    const rich = pasteInsert(clip('<script>alert(1)</script>ok', 'ok'), { stored: RICH });
    assert.equal(rich.value.includes('script'), false);
    const plain = pasteInsert(clip('<script>alert(1)</script>ok', 'ok'), { stored: PLAIN });
    assert.equal(plain.value, 'ok');
  });

  it('pastes plain text into an article body', () => {
    // A body is written back sentence by sentence; new tags have nowhere to go.
    const result = pasteInsert(clip('<b>New</b> sentence.', 'New sentence.'), { stored: RICH, body: true });
    assert.deepEqual(result, { mode: 'text', value: 'New sentence.' });
  });

  it('falls back to the plain text when the clipboard has no HTML', () => {
    assert.deepEqual(pasteInsert(clip('', 'Just words'), { stored: RICH }), { mode: 'text', value: 'Just words' });
  });
});

describe('isEmptyValue', () => {
  it('sees an emptied field however the browser spells it', () => {
    assert.equal(isEmptyValue(''), true);
    assert.equal(isEmptyValue('   '), true);
    assert.equal(isEmptyValue('<br>'), true);
    assert.equal(isEmptyValue('&nbsp;'), true);
    assert.equal(isEmptyValue('<div><br></div>'), true);
  });

  it('leaves a field with words in it alone', () => {
    assert.equal(isEmptyValue('a'), false);
    assert.equal(isEmptyValue('<b>Growth</b>'), false);
  });

  it('has one line, and it is the one the publish would have said later', () => {
    assert.equal(EMPTY_FIELD_MESSAGE, 'A field cannot be left empty');
  });
});
