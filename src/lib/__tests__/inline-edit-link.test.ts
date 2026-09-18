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
  addressLabelPrefix,
  anchorCarries,
  anchorsIn,
  countAnchors,
  enoughAnchors,
  fewEnoughAnchors,
  findSiblingAddressId,
  hrefMatches,
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

// ---------------------------------------------------------------------------
// Reading the anchors back off the live page
// ---------------------------------------------------------------------------

/**
 * The nav as Next writes it, and the whole of fault one in one fixture.
 *
 * Two links. One already points at `/case-studies`. The client moved the other
 * one, "Blog", to the same page. Asking whether `href="/case-studies"` appears
 * anywhere in this HTML answers yes before the site has built, which is exactly
 * what turned the light green on www.loudface.co on 2026-09-18.
 */
const NAV_BEFORE = `<nav class="flex gap-6" aria-label="Main">
  <a class="text-sm font-medium" href="/case-studies" data-lf-id="nav:links.0.label">Case&nbsp;studies</a>
  <a href='/blog' class="text-sm font-medium"><span data-lf-id="nav:links.1.label">Blog</span></a>
</nav>`;

/** The same nav once the change is really live: "Blog" points at the new page. */
const NAV_AFTER = NAV_BEFORE.replace("href='/blog'", `href="/case-studies"`);

describe('anchorsIn', () => {
  it('reads every anchor with its address and its words', () => {
    const anchors = anchorsIn(NAV_BEFORE);
    assert.deepEqual(anchors, [
      { href: '/case-studies', text: 'Case studies' },
      { href: '/blog', text: 'Blog' },
    ]);
  });

  it('reads an address written before the class and one written after it', () => {
    const anchors = anchorsIn(
      `<a href="/a" class="x">A</a><a class="y" data-thing="1" href="/b">B</a>`,
    );
    assert.deepEqual(anchors.map((anchor) => anchor.href), ['/a', '/b']);
  });

  it('reads single quotes, double quotes and no quotes alike', () => {
    const anchors = anchorsIn(`<a href='/a'>A</a><a href="/b">B</a><a href=/c>C</a>`);
    assert.deepEqual(anchors.map((anchor) => anchor.href), ['/a', '/b', '/c']);
  });

  it('takes the words out of nested tags', () => {
    const anchors = anchorsIn(
      `<a href="/pricing"><span class="i"><svg></svg></span><span>See <b>pricing</b></span></a>`,
    );
    assert.deepEqual(anchors, [{ href: '/pricing', text: 'See pricing' }]);
  });

  it('decodes entities and straightens quotes, the way the page check does', () => {
    const anchors = anchorsIn(`<a href="/x">Tom&#39;s &#8220;plan&#8221; &amp; ours</a>`);
    assert.equal(anchors[0].text, `Tom's "plan" & ours`);
  });

  it('takes the editor’s invisible markers out of the words', () => {
    const anchors = anchorsIn(`<a href="/x">\u{E0001}\u{E006E}Blog​</a>`);
    assert.equal(anchors[0].text, 'Blog');
  });

  it('skips an anchor with no address at all', () => {
    assert.deepEqual(anchorsIn(`<a name="top">Top</a><a href="/x">X</a>`), [
      { href: '/x', text: 'X' },
    ]);
  });

  it('does not mistake another attribute ending in href for the address', () => {
    assert.deepEqual(anchorsIn(`<a data-href="/wrong" href="/right">R</a>`), [
      { href: '/right', text: 'R' },
    ]);
  });

  it('finds nothing in a page with no links', () => {
    assert.deepEqual(anchorsIn('<p>No links here at all.</p>'), []);
  });
});

describe('hrefMatches', () => {
  it('matches a page that wrote the address with a trailing slash', () => {
    assert.equal(hrefMatches('/case-studies/', '/case-studies'), true);
  });

  it('matches a change typed with a trailing slash against a page without one', () => {
    assert.equal(hrefMatches('/case-studies', '/case-studies/'), true);
  });

  it('matches the percent-encoded form', () => {
    assert.equal(hrefMatches(encodeURIComponent('/case-studies'), '/case-studies'), true);
  });

  it('does not match a different page whose address starts the same', () => {
    assert.equal(hrefMatches('/case-studies-2026', '/case-studies'), false);
  });
});

describe('anchorCarries — the status light for one link', () => {
  it('says no while the nav still points "Blog" at the old page', () => {
    // The fault, in one line: `/case-studies` IS in this HTML, under the other
    // link. The link that was edited has not moved.
    assert.ok(NAV_BEFORE.includes('href="/case-studies"'));
    assert.equal(anchorCarries(anchorsIn(NAV_BEFORE), { href: '/case-studies', text: 'Blog' }), false);
  });

  it('says yes once "Blog" itself points at the new page', () => {
    assert.equal(anchorCarries(anchorsIn(NAV_AFTER), { href: '/case-studies', text: 'Blog' }), true);
  });

  it('still sees the untouched link under its own words', () => {
    assert.equal(
      anchorCarries(anchorsIn(NAV_AFTER), { href: '/case-studies', text: 'Case studies' }),
      true,
    );
  });

  it('the old destination is gone from that label, and only from that label', () => {
    // What `linksAbsent` asks: no anchor saying "Blog" points at /blog any more.
    assert.equal(anchorCarries(anchorsIn(NAV_BEFORE), { href: '/blog', text: 'Blog' }), true);
    assert.equal(anchorCarries(anchorsIn(NAV_AFTER), { href: '/blog', text: 'Blog' }), false);
  });

  it('accepts a page that wrote the new address with a trailing slash', () => {
    const page = NAV_BEFORE.replace("href='/blog'", `href="/case-studies/"`);
    assert.equal(anchorCarries(anchorsIn(page), { href: '/case-studies', text: 'Blog' }), true);
  });

  it('matches a label drawn with something else beside it in the same link', () => {
    const page = `<a href="/blog"><span>Blog</span><span class="badge">12</span></a>`;
    assert.equal(anchorCarries(anchorsIn(page), { href: '/blog', text: 'Blog' }), true);
  });

  it('falls back to the address alone when the link has no words', () => {
    const page = `<a href="/blog" aria-label="Blog"><svg></svg></a>`;
    assert.equal(anchorCarries(anchorsIn(page), { href: '/blog', text: '' }), true);
    assert.equal(anchorCarries(anchorsIn(page), { href: '/elsewhere', text: '' }), false);
  });
});

describe('addressLabelPrefix', () => {
  it('turns a restored address id into the prefix its label shares', () => {
    assert.equal(addressLabelPrefix('nav:links.1.href'), 'nav:links.1.');
  });

  it('answers the same prefix for the label beside it', () => {
    assert.equal(addressLabelPrefix('nav:links.1.label'), 'nav:links.1.');
  });

  it('answers null for a field with no siblings, so the caller falls back', () => {
    assert.equal(addressLabelPrefix('home:href'), null);
  });

  it('answers null for something that is not a content id', () => {
    assert.equal(addressLabelPrefix('nonsense'), null);
  });
});

// ---------------------------------------------------------------------------
// Counting, because the same link is on the page twice
// ---------------------------------------------------------------------------

/**
 * The nav and the footer, which is the whole of the second fault.
 *
 * Both say "Blog" and both point at `/blog`. The client moved the nav one to
 * `/case-studies`. Asking "does any Blog link still point at /blog" answers yes
 * for ever, because the footer never changes, so the light sat amber for the
 * full six minutes on 2026-09-18 with the change already live.
 */
const PAGE_BEFORE = `<nav><a href="/case-studies">Case studies</a><a href="/blog"><span>Blog</span></a></nav>
<footer><a class="text-xs" href="/blog">Blog</a><a href="/contact">Contact</a></footer>`;

/** The same page once the nav link has moved. The footer is untouched. */
const PAGE_AFTER = PAGE_BEFORE.replace('<a href="/blog"><span>Blog</span></a>', '<a href="/case-studies"><span>Blog</span></a>');

/** What the editor counts before it changes anything, and what it then asks for. */
const BLOG = { href: '/blog', text: 'Blog' };
const MOVED = { href: '/case-studies', text: 'Blog' };

describe('countAnchors', () => {
  it('counts both copies of the same link', () => {
    assert.equal(countAnchors(anchorsIn(PAGE_BEFORE), BLOG), 2);
  });

  it('counts none before the change, one after it', () => {
    assert.equal(countAnchors(anchorsIn(PAGE_BEFORE), MOVED), 0);
    assert.equal(countAnchors(anchorsIn(PAGE_AFTER), MOVED), 1);
  });

  it('does not count a link whose words are different', () => {
    assert.equal(countAnchors(anchorsIn(PAGE_AFTER), { href: '/case-studies', text: 'Case studies' }), 1);
  });
});

describe('the publish of a link the footer also carries', () => {
  // Before: 2 anchors say Blog → /blog, 0 say Blog → /case-studies.
  // So the published page must have at least 1 of the new pair and at most 1
  // of the old one: the footer's.
  const wanted = { ...MOVED, atLeast: 0 + 1 };
  const gone = { ...BLOG, atMost: 2 - 1 };

  it('is not live while the nav link has not moved', () => {
    assert.equal(enoughAnchors(anchorsIn(PAGE_BEFORE), wanted), false);
    assert.equal(fewEnoughAnchors(anchorsIn(PAGE_BEFORE), gone), false);
  });

  it('is live once it has, with the footer link left alone', () => {
    assert.equal(enoughAnchors(anchorsIn(PAGE_AFTER), wanted), true);
    assert.equal(fewEnoughAnchors(anchorsIn(PAGE_AFTER), gone), true);
  });

  it('would have gone green too early, and stayed amber for ever, without the counts', () => {
    // The two older questions, on the same fixtures: yes before the change,
    // and no after it.
    assert.equal(anchorCarries(anchorsIn(PAGE_BEFORE), BLOG), true);
    assert.equal(anchorCarries(anchorsIn(PAGE_AFTER), BLOG), true);
  });
});

describe('the undo of that publish', () => {
  // Counted on the page as it stands, which is PAGE_AFTER: 1 anchor says
  // Blog → /blog (the footer), 1 says Blog → /case-studies (the nav).
  const wanted = { ...BLOG, atLeast: 1 + 1 };
  const gone = { ...MOVED, atMost: 1 - 1 };

  it('is not live while the nav link still points at the new page', () => {
    assert.equal(enoughAnchors(anchorsIn(PAGE_AFTER), wanted), false);
    assert.equal(fewEnoughAnchors(anchorsIn(PAGE_AFTER), gone), false);
  });

  it('is live once both Blog links point at /blog again', () => {
    assert.equal(enoughAnchors(anchorsIn(PAGE_BEFORE), wanted), true);
    assert.equal(fewEnoughAnchors(anchorsIn(PAGE_BEFORE), gone), true);
  });

  it('is the case the footer would have answered on its own', () => {
    // One anchor already says Blog → /blog before the undo has done anything.
    assert.equal(anchorCarries(anchorsIn(PAGE_AFTER), BLOG), true);
  });
});

describe('a request with no counts on it', () => {
  it('still means one of the new pair', () => {
    assert.equal(enoughAnchors(anchorsIn(NAV_AFTER), { href: '/case-studies', text: 'Blog' }), true);
    assert.equal(enoughAnchors(anchorsIn(NAV_BEFORE), { href: '/case-studies', text: 'Blog' }), false);
  });

  it('still means none of the old pair', () => {
    assert.equal(fewEnoughAnchors(anchorsIn(NAV_AFTER), { href: '/blog', text: 'Blog' }), true);
    assert.equal(fewEnoughAnchors(anchorsIn(NAV_BEFORE), { href: '/blog', text: 'Blog' }), false);
  });

  it('reads a count of zero as zero, not as nothing', () => {
    assert.equal(enoughAnchors(anchorsIn(NAV_BEFORE), { href: '/nowhere', text: 'Blog', atLeast: 0 }), true);
  });

  it('counts across trailing-slash and encoded spellings alike', () => {
    const page = `<a href="/blog/">Blog</a><a href="${encodeURIComponent('/blog')}">Blog</a>`;
    assert.equal(countAnchors(anchorsIn(page), BLOG), 2);
    assert.equal(fewEnoughAnchors(anchorsIn(page), { ...BLOG, atMost: 1 }), false);
    assert.equal(enoughAnchors(anchorsIn(page), { ...BLOG, atLeast: 2 }), true);
  });
});
