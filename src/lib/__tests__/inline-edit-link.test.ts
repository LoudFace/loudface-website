/**
 * Tests for changing where a link points.
 *
 * Run with: npx tsx --test src/lib/__tests__/inline-edit-link.test.ts
 *
 * Three rules pay for themselves here.
 *
 *   - The sibling lookup. A link's words are a content value and its address is
 *     the field next to them, but the page and the file spell the same link
 *     three ways (`/pricing`, `/pricing/`, `https://www.loudface.co/pricing`).
 *     Match on the name alone and a card with two address fields gets the wrong
 *     one; match on the value without reducing it first and nothing matches.
 *   - The address rule. `cleanValue` strips tags, and `javascript:alert(1)` has
 *     none, so it walks straight through the cleaner and into an href. The
 *     address rule is the thing that stops it, and it has to stop it in a field
 *     the client can reach: an `href` key, or any field that already held one.
 *   - The article body. A body is megabytes of stored HTML with dozens of links
 *     in it, several pointing at the same page. Changing one means changing the
 *     n-th `href` and not one byte besides — either quote style, both left as
 *     they were written.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  ADDRESS_REFUSAL,
  findSiblingAddressId,
  isAddressKey,
  isSafeHref,
  normalizeHrefForMatch,
  siblingAddressKeys,
} from '../inline-edit/link-edit';
import { applyLinkReplacements, parseBodyEdit } from '../inline-edit/body-edit';
import { cleanValue } from '../inline-edit/sanitize';
import { applyToText } from '../inline-edit/content-text';

const ORIGIN = 'https://www.loudface.co';

/** The shape of nav.json: a list of links, each a label with its address beside it. */
const NAV = {
  links: [
    { label: 'Case studies', href: '/case-studies' },
    { label: 'Blog', href: '/blog' },
  ],
  dropdownCta: { prompt: 'Looking for a new agency partner?', action: 'Get in touch →' },
};

// ---------------------------------------------------------------------------
// Which field holds the address
// ---------------------------------------------------------------------------

describe('findSiblingAddressId', () => {
  it('finds the href next to a label', () => {
    const found = findSiblingAddressId(NAV, 'nav:links.0.label', '/case-studies', ORIGIN);
    assert.equal(found.id, 'nav:links.0.href');
  });

  it('takes the sibling that holds this address, not the first one it meets', () => {
    const found = findSiblingAddressId(NAV, 'nav:links.1.label', '/blog', ORIGIN);
    assert.equal(found.id, 'nav:links.1.href');
  });

  it('matches a link the page wrote out with the site address in front', () => {
    const found = findSiblingAddressId(NAV, 'nav:links.0.label', `${ORIGIN}/case-studies`, ORIGIN);
    assert.equal(found.id, 'nav:links.0.href');
  });

  it('matches a link the page wrote with a trailing slash', () => {
    const found = findSiblingAddressId(NAV, 'nav:links.0.label', '/case-studies/', ORIGIN);
    assert.equal(found.id, 'nav:links.0.href');
  });

  it('matches with the site address and a trailing slash at once', () => {
    const found = findSiblingAddressId(NAV, 'nav:links.1.label', `${ORIGIN}/blog/`, ORIGIN);
    assert.equal(found.id, 'nav:links.1.href');
  });

  it('matches a stored absolute address against a relative one on the page', () => {
    const data = { cta: { label: 'Pricing', href: `${ORIGIN}/pricing` } };
    const found = findSiblingAddressId(data, 'home:cta.label', '/pricing', ORIGIN);
    assert.equal(found.id, 'home:cta.href');
  });

  it('answers null when no sibling holds that address', () => {
    const found = findSiblingAddressId(NAV, 'nav:links.0.label', '/somewhere-else', ORIGIN);
    assert.equal(found.id, null);
    assert.ok(found.reason, 'a refusal has to say why');
  });

  it('answers null when the object has no address field at all', () => {
    const found = findSiblingAddressId(NAV, 'nav:dropdownCta.prompt', '/pricing', ORIGIN);
    assert.equal(found.id, null);
    assert.ok(found.reason, 'a refusal has to say why');
  });

  it('answers null for a value with no siblings to look at', () => {
    const found = findSiblingAddressId(NAV, 'nav:links', '/blog', ORIGIN);
    assert.equal(found.id, null);
  });

  it('answers null for something that is not a content id', () => {
    const found = findSiblingAddressId(NAV, 'not-an-id', '/blog', ORIGIN);
    assert.equal(found.id, null);
  });

  it('finds each of the address key names a content file uses', () => {
    for (const key of siblingAddressKeys) {
      const data = { card: { title: 'Pricing', [key]: '/pricing' } };
      const found = findSiblingAddressId(data, 'home:card.title', '/pricing', ORIGIN);
      assert.equal(found.id, `home:card.${key}`, `${key} was not recognised as an address field`);
      assert.ok(isAddressKey(key), `${key} is not treated as an address key`);
    }
  });
});

describe('normalizeHrefForMatch', () => {
  const same: [string, string][] = [
    ['/pricing', '/pricing'],
    ['/pricing/', '/pricing'],
    [`${ORIGIN}/pricing`, '/pricing'],
    [`${ORIGIN}/pricing/`, '/pricing'],
    ['  /pricing  ', '/pricing'],
    [ORIGIN, '/'],
    [`${ORIGIN}/`, '/'],
    ['/', '/'],
  ];
  for (const [given, wanted] of same) {
    it(`reduces ${given || '(empty)'} to ${wanted}`, () => {
      assert.equal(normalizeHrefForMatch(given, ORIGIN), wanted);
    });
  }

  it('leaves another site alone', () => {
    assert.equal(normalizeHrefForMatch('https://example.com/a', ORIGIN), 'https://example.com/a');
  });
});

// ---------------------------------------------------------------------------
// What counts as an address
// ---------------------------------------------------------------------------

describe('isSafeHref', () => {
  const accepted = [
    '/x',
    '/case-studies/toku-ai-cited-pipeline',
    'https://',
    'https://www.loudface.co/pricing',
    'http://localhost:3005/x',
    'mailto:hello@loudface.co',
    'tel:+38761234567',
    '#a',
    '  /x  ',
    'https://x.com/s?q=a%20b&r=1',
  ];
  for (const href of accepted) {
    it(`accepts ${href}`, () => assert.equal(isSafeHref(href), true));
  }

  const refused = [
    ['javascript:alert(1)', 'a script address'],
    ['JaVaScRiPt:alert(1)', 'a script address in mixed case'],
    ['data:text/html,<script>alert(1)</script>', 'a data address'],
    ['vbscript:msgbox(1)', 'another script scheme'],
    ['/x y', 'a space in the middle'],
    ['/x\ty', 'a tab in the middle'],
    ['/x\ny', 'a newline in the middle'],
    ['', 'nothing at all'],
    ['   ', 'nothing but spaces'],
    ['pricing', 'a bare word with no scheme and no slash'],
    ['/x" onmouseover="alert(1)', 'a quote break-out'],
    ["/x' onmouseover='alert(1)", 'a single-quote break-out'],
    ['/x<script>', 'an angle bracket'],
    [`/${'x'.repeat(4000)}`, 'a paste far past any real address'],
  ];
  for (const [href, why] of refused) {
    it(`refuses ${why}`, () => assert.equal(isSafeHref(href), false));
  }

  it('accepts //host, because the sanitizer does and the two must agree', () => {
    // A protocol-relative address is an ordinary link to another site. The
    // editor's field and `cleanValue` have to take the same view of it, or a
    // client would be told to fix a link the cleaner then keeps anyway.
    // `safeNext` in guard.ts refuses it, but that is about where we send a
    // browser after sign-in, which is a different question.
    assert.equal(isSafeHref('//example.com/a'), true);
  });
});

// ---------------------------------------------------------------------------
// The address rule where a client can actually reach it
// ---------------------------------------------------------------------------

describe('applyToText on an address field', () => {
  const raw = `${JSON.stringify(NAV, null, 2)}\n`;

  it('writes a new address into an href', () => {
    const result = applyToText(raw, 'nav:links.0.href', '/work');
    assert.equal(result.after, '/work');
    assert.equal(JSON.parse(result.next).links[0].href, '/work');
  });

  it('keeps the change to one line', () => {
    const result = applyToText(raw, 'nav:links.0.href', '/work');
    const before = raw.split('\n');
    const after = result.next.split('\n');
    assert.equal(before.length, after.length);
    assert.equal(before.filter((line, i) => line !== after[i]).length, 1);
  });

  for (const bad of ['javascript:alert(1)', 'data:text/html,x', 'not an address', '/x" onmouseover="y']) {
    it(`refuses ${bad} in an href field`, () => {
      assert.throws(() => applyToText(raw, 'nav:links.0.href', bad), new RegExp(ADDRESS_REFUSAL));
    });
  }

  it('refuses an unsafe value where the stored value was an address', () => {
    const file = `${JSON.stringify({ hero: { image: '/images/team.webp' } }, null, 2)}\n`;
    assert.throws(
      () => applyToText(file, 'hero:hero.image', 'javascript:alert(1)'),
      new RegExp(ADDRESS_REFUSAL),
    );
  });

  it('leaves an ordinary sentence alone', () => {
    const result = applyToText(raw, 'nav:links.0.label', 'Client stories');
    assert.equal(result.after, 'Client stories');
  });
});

// ---------------------------------------------------------------------------
// The cleaner must not touch an address
// ---------------------------------------------------------------------------

describe('cleanValue and addresses', () => {
  const addresses = [
    '/pricing',
    '/case-studies/toku-ai-cited-pipeline',
    'https://www.loudface.co/blog/x',
    'https://x.com/s?q=a&r=1',
    'mailto:hello@loudface.co',
    'tel:+38761234567',
    '#pricing',
  ];
  for (const address of addresses) {
    it(`leaves ${address} exactly as it is`, () => {
      assert.equal(cleanValue(address, '/somewhere'), address);
    });
  }

  it('keeps a rewritten href in a rich value', () => {
    const stored = 'Read the <a href="/pricing">pricing</a> page';
    const edited = 'Read the <a href="/plans">pricing</a> page';
    assert.equal(cleanValue(edited, stored), edited);
  });

  it('keeps a rewritten href when the browser handed back extra attributes', () => {
    const stored = 'Read the <a href="/pricing">pricing</a> page';
    const edited = 'Read the <a href="/plans" class="x" target="_blank">pricing</a> page';
    const result = cleanValue(edited, stored);
    assert.ok(result.includes('href="/plans"'), `lost the new address: ${result}`);
    assert.ok(!result.includes('class='), `kept an attribute we do not write: ${result}`);
  });

  it('drops a link whose new address is not safe, keeping its words', () => {
    const stored = 'Read the <a href="/pricing">pricing</a> page';
    const result = cleanValue('Read the <a href="javascript:alert(1)">pricing</a> page', stored);
    assert.equal(result, 'Read the pricing page');
  });
});

// ---------------------------------------------------------------------------
// One link in an article body
// ---------------------------------------------------------------------------

const BODY =
  '<p>Read the <a href="/pricing">plans</a> today.</p>' +
  "<p>Or the <a href='/pricing'>same page</a> again, and the <a href='/pricing'>third</a> time.</p>" +
  '<p>Nothing to do with <a href="/blog">the blog</a>.</p>';

describe('applyLinkReplacements', () => {
  it('replaces the first occurrence and nothing else', () => {
    const next = applyLinkReplacements(BODY, [{ from: '/pricing', to: '/plans', occurrence: 0 }]);
    assert.equal(
      next,
      '<p>Read the <a href="/plans">plans</a> today.</p>' +
        "<p>Or the <a href='/pricing'>same page</a> again, and the <a href='/pricing'>third</a> time.</p>" +
        '<p>Nothing to do with <a href="/blog">the blog</a>.</p>',
    );
  });

  it('replaces the second occurrence, which is written with single quotes', () => {
    const next = applyLinkReplacements(BODY, [{ from: '/pricing', to: '/plans', occurrence: 1 }]);
    assert.equal(
      next,
      '<p>Read the <a href="/pricing">plans</a> today.</p>' +
        "<p>Or the <a href='/plans'>same page</a> again, and the <a href='/pricing'>third</a> time.</p>" +
        '<p>Nothing to do with <a href="/blog">the blog</a>.</p>',
    );
  });

  it('replaces the third occurrence', () => {
    const next = applyLinkReplacements(BODY, [{ from: '/pricing', to: '/plans', occurrence: 2 }]);
    assert.ok(next.includes("<a href='/plans'>third</a>"), next);
    assert.ok(next.includes('<a href="/pricing">plans</a>'), next);
    assert.ok(next.includes("<a href='/pricing'>same page</a>"), next);
  });

  it('keeps the quote style the article was written with', () => {
    const single = applyLinkReplacements(BODY, [{ from: '/pricing', to: '/plans', occurrence: 1 }]);
    assert.ok(single.includes("href='/plans'"), `changed a single-quoted attribute: ${single}`);
    const double = applyLinkReplacements(BODY, [{ from: '/pricing', to: '/plans', occurrence: 0 }]);
    assert.ok(double.includes('href="/plans"'), `changed a double-quoted attribute: ${double}`);
  });

  it('changes nothing but the one attribute', () => {
    const next = applyLinkReplacements(BODY, [{ from: '/blog', to: '/writing', occurrence: 0 }]);
    assert.equal(next, BODY.replace('href="/blog"', 'href="/writing"'));
    assert.equal(next.length, BODY.length + '/writing'.length - '/blog'.length);
  });

  it('leaves inline styles, tables and svg untouched', () => {
    const rich =
      '<style>a{color:red}</style><table><tr><td>x &amp; y</td></tr></table>' +
      '<svg viewBox="0 0 2 2"><path d="M0 0"/></svg><a href="/a">go</a>';
    const next = applyLinkReplacements(rich, [{ from: '/a', to: '/b', occurrence: 0 }]);
    assert.equal(next, rich.replace('href="/a"', 'href="/b"'));
  });

  it('matches a stored address that carries an encoded ampersand', () => {
    const stored = '<a href="/s?a=1&amp;b=2">go</a>';
    const next = applyLinkReplacements(stored, [{ from: '/s?a=1&b=2', to: '/t?c=3&d=4', occurrence: 0 }]);
    assert.equal(next, '<a href="/t?c=3&amp;d=4">go</a>');
  });

  it('does nothing when the address is unchanged', () => {
    assert.equal(applyLinkReplacements(BODY, [{ from: '/blog', to: '/blog', occurrence: 0 }]), BODY);
  });

  it('applies several link changes in one pass', () => {
    const next = applyLinkReplacements(BODY, [
      { from: '/blog', to: '/writing', occurrence: 0 },
      { from: '/pricing', to: '/plans', occurrence: 0 },
    ]);
    assert.ok(next.includes('href="/writing"'), next);
    assert.ok(next.includes('<a href="/plans">plans</a>'), next);
  });

  it('refuses an occurrence that is not there', () => {
    assert.throws(
      () => applyLinkReplacements(BODY, [{ from: '/pricing', to: '/plans', occurrence: 3 }]),
      /Could not find a link/,
    );
  });

  it('refuses an address that is nowhere in the article', () => {
    assert.throws(
      () => applyLinkReplacements(BODY, [{ from: '/nowhere', to: '/plans', occurrence: 0 }]),
      /Could not find a link/,
    );
  });

  for (const bad of ['javascript:alert(1)', 'data:text/html,x', '/x y', '', '/x" onmouseover="y']) {
    it(`refuses ${bad || '(empty)'} as a new address`, () => {
      assert.throws(
        () => applyLinkReplacements(BODY, [{ from: '/blog', to: bad, occurrence: 0 }]),
        new RegExp(ADDRESS_REFUSAL),
      );
    });
  }

  it('writes nothing at all when one change in a batch cannot be placed', () => {
    assert.throws(() =>
      applyLinkReplacements(BODY, [
        { from: '/blog', to: '/writing', occurrence: 0 },
        { from: '/nowhere', to: '/plans', occurrence: 0 },
      ]),
    );
    // The caller keeps the original; nothing here mutates its argument.
    assert.ok(BODY.includes('href="/blog"'));
  });
});

describe('parseBodyEdit with links', () => {
  it('reads an edit that is only links', () => {
    const edit = parseBodyEdit(JSON.stringify({ links: [{ from: '/a', to: '/b', occurrence: 0 }] }));
    assert.equal(edit.replacements.length, 0);
    assert.equal(edit.links.length, 1);
  });

  it('reads an edit that is only sentences, as it always did', () => {
    const edit = parseBodyEdit(JSON.stringify({ replacements: [{ from: 'a', to: 'b', occurrence: 0 }] }));
    assert.equal(edit.replacements.length, 1);
    assert.equal(edit.links.length, 0);
  });

  it('reads an edit that is both', () => {
    const edit = parseBodyEdit(
      JSON.stringify({
        replacements: [{ from: 'a', to: 'b', occurrence: 0 }],
        links: [{ from: '/a', to: '/b', occurrence: 0 }],
      }),
    );
    assert.equal(edit.replacements.length, 1);
    assert.equal(edit.links.length, 1);
  });

  it('refuses an edit with nothing in it', () => {
    assert.throws(() => parseBodyEdit(JSON.stringify({ replacements: [], links: [] })), /holds no changes/);
  });

  it('refuses an unsafe address before it reaches the article', () => {
    assert.throws(
      () => parseBodyEdit(JSON.stringify({ links: [{ from: '/a', to: 'javascript:alert(1)', occurrence: 0 }] })),
      new RegExp(ADDRESS_REFUSAL),
    );
  });

  it('refuses a malformed link', () => {
    assert.throws(
      () => parseBodyEdit(JSON.stringify({ links: [{ from: '/a', to: '/b' }] })),
      /malformed/,
    );
  });
});
