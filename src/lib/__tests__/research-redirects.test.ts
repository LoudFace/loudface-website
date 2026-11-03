/**
 * The 12 studies that moved from /blog to /research on 3 Nov 2026 (redirects() in next.config.ts).
 * Run with `npm run test:redirects`. Nothing here reaches the network: Next's own config tester runs the real
 * next.config against made-up requests.
 *
 * Each old post URL, and its Markdown twin, must answer a permanent 308 to the same slug under /research, in one hop.
 * The list is written out here on purpose: a slug dropped from next.config.ts fails this test instead of quietly
 * sending its links back to a blog post the blog no longer lists.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getRedirectUrl,
  unstable_getResponseFromNextConfig,
} from 'next/experimental/testing/server';
import nextConfig from '../../../next.config';

const MOVED = [
  'do-ai-engines-recommend-the-same-agencies',
  'how-long-does-seo-take',
  'state-of-b2b-saas-seo',
  'state-of-b2b-saas-content-marketing',
  'state-of-b2b-saas-marketing-ai-search',
  'ai-share-of-voice-formula',
  'hr-tech-ai-visibility-index-2026',
  'devtools-ai-visibility-index-2026',
  'cybersecurity-saas-ai-visibility-index-2026',
  'which-ai-engine-cites-fintech-brands',
  'ai-answer-gap-b2b-saas-2026',
  'ai-citation-benchmark-b2b-saas-2026',
];

const respond = (url: string) => unstable_getResponseFromNextConfig({ url, nextConfig });

test('each moved study answers a 308 from /blog/<slug> to /research/<slug>, query kept', async () => {
  for (const slug of MOVED) {
    const response = await respond(`https://www.loudface.co/blog/${slug}?utm_source=chatgpt.com`);
    assert.equal(response.status, 308, slug);
    assert.equal(getRedirectUrl(response), `https://www.loudface.co/research/${slug}?utm_source=chatgpt.com`, slug);
  }
});

test('the Markdown twin of each moved study redirects to the paper\'s twin', async () => {
  for (const slug of MOVED) {
    const response = await respond(`https://www.loudface.co/blog/${slug}.md`);
    assert.equal(response.status, 308, slug);
    assert.equal(getRedirectUrl(response), `https://www.loudface.co/research/${slug}.md`, slug);
  }
});

test('the paper URLs themselves, the hub and an ordinary blog post are not redirected', async () => {
  for (const path of ['/research', `/research/${MOVED[0]}`, '/blog', '/blog/best-aeo-agencies']) {
    const response = await respond(`https://www.loudface.co${path}`);
    assert.equal(response.status, 200, path);
    assert.equal(getRedirectUrl(response), null, path);
  }
});

test('next.config.ts moves exactly these 12 studies', async () => {
  const rules = (await nextConfig.redirects?.()) ?? [];
  const moved = rules
    .filter((rule) => rule.source.startsWith('/blog/') && rule.destination.startsWith('/research/') && !rule.source.endsWith('.md'))
    .map((rule) => rule.source.replace('/blog/', ''));
  assert.deepEqual(moved.sort(), [...MOVED].sort());
});
