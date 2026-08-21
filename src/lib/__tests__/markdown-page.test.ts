/**
 * Tests for src/lib/markdown-page.ts
 *
 * Run with: npx tsx --env-file=.env.local --test src/lib/__tests__/markdown-page.test.ts
 *
 * The invariant these protect: a page that merely FAILED to render must never
 * be reported as a page that does not EXIST. The route caches "not-found" for
 * an hour, so getting this wrong takes a live page off the agent-readable web
 * over one bad second. Only an upstream 404 or 410 is a real absence.
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { renderPageMarkdown } from '../markdown-page';

const realFetch = globalThis.fetch;

/** Point renderPageMarkdown at a canned response and report what it decided. */
async function statusFor(stub: () => Promise<Response>): Promise<string> {
  globalThis.fetch = stub as unknown as typeof globalThis.fetch;
  try {
    const result = await renderPageMarkdown('/some-page', 'http://localhost:3005');
    return result.status;
  } finally {
    globalThis.fetch = realFetch;
  }
}

const responding = (status: number, body = '') => () =>
  Promise.resolve(new Response(body, { status }));

const pageHtml = (inner: string) => `<html><body>${inner}</body></html>`;
const realPage = (body: string) => pageHtml(`<main><h1>Hello</h1><p>${body}</p></main>`);

after(() => {
  globalThis.fetch = realFetch;
});

describe('renderPageMarkdown', () => {
  before(() => {
    // The CMS lookup runs first and must not reach the network in a test.
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ??= 'test';
    process.env.NEXT_PUBLIC_SANITY_DATASET ??= 'production';
  });

  it('treats 404 as a page that genuinely does not exist', async () => {
    assert.equal(await statusFor(responding(404)), 'not-found');
  });

  it('treats 410 as a page that genuinely does not exist', async () => {
    assert.equal(await statusFor(responding(410)), 'not-found');
  });

  // Everything below would previously have been cached as a 404 for an hour.
  it('treats 500 as a failure, not a missing page', async () => {
    assert.equal(await statusFor(responding(500)), 'error');
  });

  it('treats 503 as a failure, not a missing page', async () => {
    assert.equal(await statusFor(responding(503)), 'error');
  });

  it('treats 429 as a failure, not a missing page', async () => {
    assert.equal(await statusFor(responding(429)), 'error');
  });

  it('treats 403 as a failure, not a missing page', async () => {
    assert.equal(await statusFor(responding(403)), 'error');
  });

  it('treats a thrown fetch as a failure, not a missing page', async () => {
    assert.equal(
      await statusFor(() => Promise.reject(new Error('ECONNRESET'))),
      'error'
    );
  });

  it('treats a 200 with no <main> as a failure — likely a half-rendered page', async () => {
    assert.equal(
      await statusFor(responding(200, pageHtml('<div>error boundary</div>'))),
      'error'
    );
  });

  it('treats a 200 with a near-empty <main> as a failure', async () => {
    assert.equal(await statusFor(responding(200, realPage('hi'))), 'error');
  });

  it('renders a healthy page', async () => {
    const status = await statusFor(
      responding(200, realPage('Real body content. '.repeat(30)))
    );
    assert.equal(status, 'ok');
  });

  it('puts the canonical URL in the rendered Markdown', async () => {
    globalThis.fetch = responding(
      200,
      realPage('Real body content. '.repeat(30))
    ) as unknown as typeof globalThis.fetch;
    try {
      const result = await renderPageMarkdown('/some-page', 'http://localhost:3005');
      assert.equal(result.status, 'ok');
      if (result.status !== 'ok') return;
      assert.match(result.markdown, /Source: https:\/\/www\.loudface\.co\/some-page/);
    } finally {
      globalThis.fetch = realFetch;
    }
  });
});
