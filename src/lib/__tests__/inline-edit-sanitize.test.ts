/**
 * Tests for src/lib/inline-edit/sanitize.ts
 *
 * Run with: npx tsx --test src/lib/__tests__/inline-edit-sanitize.test.ts
 *
 * cleanValue is the last thing between a signed-in client's typing and a field
 * the site renders with dangerouslySetInnerHTML. These are the strings that got
 * through before: an anchor that was never closed kept its raw tag text, so an
 * onmouseover handler and a javascript: address rode along on it.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { cleanValue, decodeEntities } from '../inline-edit/sanitize';

/** A value the page renders as HTML: cleaning keeps the small tag whitelist. */
const RICH = 'Read the <a href="/pricing">pricing</a> page';
/** A value the page renders as text: cleaning drops every tag. */
const PLAIN = 'Design and build';

/** Nothing that can run, and no attribute we did not write ourselves. */
function assertInert(result: string, source: string) {
  assert.ok(!/javascript:/i.test(result), `kept a javascript: address from ${source}: ${result}`);
  assert.ok(!/\son[a-z]+\s*=/i.test(result), `kept an event handler from ${source}: ${result}`);
  assert.ok(!/<(script|svg|img|iframe|style|object|embed)\b/i.test(result), `kept a live tag from ${source}: ${result}`);
  for (const tag of result.match(/<[a-z][a-z0-9]*\b[^>]*>/gi) ?? []) {
    assert.ok(
      /^<(a href="[^"]*"|strong|em|b|i|br)>$/i.test(tag),
      `emitted a tag we do not write ourselves: ${tag} (from ${source})`,
    );
  }
}

describe('cleanValue against attack strings', () => {
  const attacks = [
    'unclosed anchor with a handler:  <a href="/x" onmouseover="alert(1)">hover',
    'unclosed anchor, javascript href: <a href="javascript:alert(1)">x',
    'inline svg with onload:           <svg onload=alert(1)>',
    'entity-encoded javascript href:   <a href="&#106;avascript:alert(1)">x</a>',
    'hex-encoded javascript href:      <a href="&#x6a;avascript:alert(1)">x</a>',
    'image with an error handler:      <img src=x onerror=alert(1)>',
    'a script tag inside a value:      before <script>alert(1)</script> after',
    'an unclosed script tag:           before <script>alert(1)',
    'an anchor closing tag on its own: text</a><a href=javascript:alert(1)>more',
    'a handler on an allowed tag:      <strong onclick="alert(1)">bold</strong>',
    'a style tag with its contents:    <style>body{display:none}</style>keep',
    'quote break-out in an href:       <a href=\'/x" onmouseover="alert(1)\'>x</a>',
    'an out-of-range code point:       &#1114112;',
  ];

  for (const attack of attacks) {
    const input = attack.slice(attack.indexOf(': ') + 2).trim();
    const name = attack.slice(0, attack.indexOf(': ')).trim();

    it(`neutralises ${name} in a rich value`, () => {
      const result = cleanValue(input, RICH);
      assertInert(result, input);
    });

    it(`neutralises ${name} in a plain value`, () => {
      const result = cleanValue(input, PLAIN);
      assert.ok(!/</.test(result), `a plain value kept markup: ${result}`);
      assertInert(result, input);
    });
  }

  it('keeps the visible words of an unclosed anchor and drops its handler', () => {
    // The exact string that got through before: the generic tag pass saw
    // `<a href="` at the start and passed the whole raw tag through.
    const result = cleanValue('<a href="/x" onmouseover="alert(1)">hover', RICH);
    assert.equal(result, '<a href="/x">hover');
  });

  it('drops an anchor whose address is not one we allow, keeping the text', () => {
    assert.equal(cleanValue('<a href="javascript:alert(1)">x', RICH), 'x');
    assert.equal(cleanValue('<a href="javascript:alert(1)">x</a>', RICH), 'x');
  });

  it('decodes an entity-encoded address before judging it', () => {
    assert.equal(cleanValue('<a href="&#106;avascript:alert(1)">x</a>', RICH), 'x');
  });

  it('does not throw on a code point outside Unicode', () => {
    assert.doesNotThrow(() => decodeEntities('&#1114112;'));
    assert.equal(decodeEntities('&#1114112;'), '&#1114112;');
    assert.equal(cleanValue('&#1114112;', PLAIN), '&#1114112;');
  });
});

describe('cleanValue on ordinary edits', () => {
  it('drops tags from a value the page renders as text', () => {
    assert.equal(cleanValue('Design and <b>build</b>', PLAIN), 'Design and build');
  });

  it('decodes entities in a plain value rather than double-escaping them', () => {
    assert.equal(cleanValue('Design &amp; build', PLAIN), 'Design & build');
  });

  it('keeps a relative link, strong, em and br in a rich value', () => {
    const edited = 'See <a href="/pricing">pricing</a>, <strong>now</strong> <em>really</em><br>today';
    assert.equal(cleanValue(edited, RICH), edited);
  });

  it('keeps an http link in a rich value', () => {
    const edited = 'Read <a href="https://loudface.co/blog">the blog</a>';
    assert.equal(cleanValue(edited, RICH), edited);
  });

  it('keeps mailto and tel links', () => {
    const mail = 'Write to <a href="mailto:hello@loudface.co">us</a>';
    const phone = 'Call <a href="tel:+38761123456">us</a>';
    assert.equal(cleanValue(mail, RICH), mail);
    assert.equal(cleanValue(phone, RICH), phone);
  });

  it('keeps an anchor to an id on the page', () => {
    const edited = 'Jump to <a href="#pricing">pricing</a>';
    assert.equal(cleanValue(edited, RICH), edited);
  });

  it('drops the span a browser inserts while typing, keeping the words', () => {
    assert.equal(cleanValue('<span style="color:red">Design</span> and build', RICH), 'Design and build');
  });
});
