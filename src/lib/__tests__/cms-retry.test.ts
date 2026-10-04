/**
 * The Sanity retry behind every CMS read in src/lib/cms-data.ts. Run with
 * `npm run test:cms`. Nothing here reaches Sanity.
 *
 * Inside a page render Next memoizes identical fetches, failures included, so
 * a retry only reaches Sanity when it asks with a URL of its own. These tests
 * pin that each retry gets its own request tag and that a persistent failure
 * still throws, which is what lets a failed refresh keep the last good page.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { withRetry } from '../cms-retry';

const noWait = { baseDelayMs: 0 };

test('a failed read is retried once with its own request tag, then the failure is thrown', async () => {
  const tags: Array<string | undefined> = [];
  await assert.rejects(
    withRetry(async (retry) => {
      tags.push(retry.tag);
      throw new TypeError('fetch failed');
    }, noWait),
    /fetch failed/,
  );
  assert.deepEqual(tags, [undefined, 'retry-2']);
});

test('the first request carries no tag, so it keeps its usual cache entry', async () => {
  const seen: Array<{ tag?: string }> = [];
  const value = await withRetry(async (retry) => {
    seen.push(retry);
    return ['case-study'];
  }, noWait);
  assert.deepEqual(value, ['case-study']);
  assert.deepEqual(seen, [{}]);
});

test('a blip that clears on the retry returns the data', async () => {
  let calls = 0;
  const value = await withRetry(async () => {
    calls += 1;
    if (calls === 1) throw new TypeError('fetch failed');
    return ['post'];
  }, noWait);
  assert.deepEqual(value, ['post']);
  assert.equal(calls, 2);
});

test('attempts: 3 tags the second and third requests', async () => {
  const tags: Array<string | undefined> = [];
  await assert.rejects(
    withRetry(async (retry) => {
      tags.push(retry.tag);
      throw new Error('down');
    }, { attempts: 3, baseDelayMs: 0 }),
  );
  assert.deepEqual(tags, [undefined, 'retry-2', 'retry-3']);
});
