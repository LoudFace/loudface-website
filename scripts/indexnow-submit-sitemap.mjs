#!/usr/bin/env node
/**
 * One-shot IndexNow submission of every URL in the public sitemap.
 *
 * Run this manually after first deploying the key file, then any time you
 * want to force a re-crawl of the whole site. Day-to-day, the Sanity webhook
 * at /api/revalidate already pushes individual URLs to IndexNow.
 *
 * Usage:
 *   INDEXNOW_KEY=<key> node scripts/indexnow-submit-sitemap.mjs
 *   (or load from .env.local automatically below)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const HOST = 'www.loudface.co';
const ORIGIN = `https://${HOST}`;
const SITEMAP_URL = `${ORIGIN}/sitemap.xml`;
const ENDPOINT = 'https://api.indexnow.org/IndexNow';

function loadEnv() {
  const envPath = path.join(ROOT, '.env.local');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}

async function main() {
  loadEnv();
  const key = process.env.INDEXNOW_KEY;
  if (!key) {
    console.error('Missing INDEXNOW_KEY (set in .env.local or env)');
    process.exit(1);
  }

  console.log(`Fetching ${SITEMAP_URL}…`);
  const xml = await fetch(SITEMAP_URL).then((r) => r.text());
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter(Boolean);

  if (urls.length === 0) {
    console.error('Sitemap returned no <loc> URLs.');
    process.exit(1);
  }
  console.log(`Submitting ${urls.length} URL(s) to IndexNow…`);

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: HOST,
      key,
      keyLocation: `${ORIGIN}/${key}.txt`,
      urlList: urls,
    }),
  });

  const body = await res.text().catch(() => '');
  console.log(`IndexNow responded ${res.status} ${res.statusText}${body ? ` — ${body.slice(0, 200)}` : ''}`);

  if (!res.ok && res.status !== 202) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
