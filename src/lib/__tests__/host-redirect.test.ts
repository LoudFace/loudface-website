/**
 * The vercel.app host redirect at the top of redirects() in next.config.ts.
 * Run with `npm run test:redirects`. Nothing here reaches the network: Next's
 * own config tester runs the real next.config against made-up requests.
 *
 * The production alias loudface-website.vercel.app must answer every URL with
 * a 308 to the same path and query on www.loudface.co. Every other host must
 * pass through untouched: www itself (a match there would loop the live site),
 * and the preview and deployment hosts the team and the weekly cron use.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getRedirectUrl,
  unstable_getResponseFromNextConfig,
} from 'next/experimental/testing/server';
import nextConfig from '../../../next.config';

const respond = (url: string) => unstable_getResponseFromNextConfig({ url, nextConfig });

test('the vercel.app alias sends a page to the same path and query on www with a 308', async () => {
  const response = await respond(
    'https://loudface-website.vercel.app/blog/best-aeo-agencies?utm_source=chatgpt.com&x=1',
  );
  assert.equal(response.status, 308);
  assert.equal(
    getRedirectUrl(response),
    'https://www.loudface.co/blog/best-aeo-agencies?utm_source=chatgpt.com&x=1',
  );
});

test('the vercel.app alias sends the homepage and the Markdown copies to www', async () => {
  const home = await respond('https://loudface-website.vercel.app/');
  assert.equal(home.status, 308);
  assert.equal(getRedirectUrl(home), 'https://www.loudface.co/');

  const markdown = await respond('https://loudface-website.vercel.app/blog/best-aeo-agencies.md');
  assert.equal(markdown.status, 308);
  assert.equal(getRedirectUrl(markdown), 'https://www.loudface.co/blog/best-aeo-agencies.md');
});

test('the host rule runs before the path rules, so an old path still reaches www in one hop', async () => {
  const response = await respond('https://loudface-website.vercel.app/work');
  assert.equal(response.status, 308);
  assert.equal(getRedirectUrl(response), 'https://www.loudface.co/work');
});

test('www, preview and deployment hosts are never sent anywhere by the host rule', async () => {
  for (const host of [
    'www.loudface.co',
    'loudface-website-git-main-loud-face.vercel.app',
    'loudface-website-4yt0su7hc-loud-face.vercel.app',
    'loudface-website.vercel.app.example.com',
    'loudface-websiteXvercelXapp',
  ]) {
    const response = await respond(`https://${host}/blog/best-aeo-agencies`);
    assert.equal(response.status, 200, host);
    assert.equal(getRedirectUrl(response), null, host);
  }
});
