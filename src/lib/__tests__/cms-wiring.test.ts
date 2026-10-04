/**
 * Pins the wiring the retry test cannot see. Reads src/lib/cms-data.ts; nothing
 * reaches Sanity. Run with `npm run test:cms`.
 *
 * The list composers must let a failed read through (their Markdown copies are
 * cached for an hour, so an empty list there would be cached too), and every
 * withRetry call must spread its retry tag into the fetch options, or the retry
 * replays the first failure inside a render.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../cms-data.ts', import.meta.url), 'utf8');

function fn(name: string) {
  const start = source.indexOf(`export async function ${name}(`);
  assert.ok(start >= 0, `${name} not found`);
  return source.slice(start, source.indexOf('\n}\n', start));
}

for (const name of ['fetchHomepageData', 'fetchBlogIndexData', 'fetchCaseStudyIndexData']) {
  test(`${name} lets a failed read through instead of returning empty data`, () => {
    assert.doesNotMatch(fn(name), /\}\s*catch\b|\.catch\(|allSettled/);
  });
}

test('every withRetry call passes its retry tag on to the fetch', () => {
  const calls = [...source.matchAll(/withRetry\((async )?\((\w*)\) =>/g)];
  assert.ok(calls.length >= 14, `expected the 14 retried reads, found ${calls.length}`);
  for (const call of calls) assert.equal(call[2], 'retry', `a withRetry callback ignores its retry tag: ${call[0]}`);
  assert.equal((source.match(/\.\.\.retry\b|, retry\)/g) ?? []).length, calls.length + 1);
});

test('the booking confirmation reads only the cover helper, which answers undefined on failure', () => {
  const cover = fn('fetchLatestBlogCover');
  assert.match(cover, /\}\s*catch\b[\s\S]*return undefined;/);
  for (const page of ['../../app/(site)/thank-you/page.tsx', '../../app/(site)/dev-preview/home-v11-thanks/page.tsx']) {
    const text = readFileSync(new URL(page, import.meta.url), 'utf8');
    assert.match(text, /fetchLatestBlogCover\(\)/, page);
    assert.doesNotMatch(text, /fetchBlogIndexData|fetchHomepageData/, page);
  }
});
