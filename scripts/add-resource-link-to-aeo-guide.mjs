#!/usr/bin/env node
/**
 * One-off: Append a contextual "Further reading" reference to the AEO
 * mega-guide that links to the open-source awesome-list on GitHub Pages.
 *
 * Purpose: establish a crawl path from a high-impression page on
 * loudface.co (the AEO guide gets ~2,300 monthly impressions) to the
 * arnelbukva.github.io subdomain so Googlebot discovers and indexes it
 * on the next recrawl. Also bumps `last-updated` so sitemap freshness
 * signals catch Google's attention.
 *
 * Idempotent: detects the link by URL and skips if already present.
 *
 * Run: node scripts/add-resource-link-to-aeo-guide.mjs
 */

import { createClient } from 'next-sanity';
import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '..', '.env.local') });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !dataset || !token) {
  console.error('Missing Sanity env.');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2025-03-29',
  useCdn: false,
  token,
});

const SLUG = 'answer-engine-optimization-guide-2026';
const GITHUB_URL = 'https://arnelbukva.github.io/awesome-answer-engine-optimization/';
const APPEND_HTML = `\n<h2>Further reading</h2>\n<p>For ongoing reference, we maintain an open-source curated list of AEO and GEO resources — tools, research papers, agencies, schemas, and tutorials — at <a href="${GITHUB_URL}" rel="external">Awesome Answer Engine Optimization</a>. The list is released under CC0 and updated monthly.</p>\n`;

async function main() {
  const doc = await client.fetch(
    `*[_type == "blogPost" && slug.current == $slug][0]{_id, name, "slug": slug.current, content, "lastUpdated": lastUpdated}`,
    { slug: SLUG },
  );

  if (!doc) {
    console.error(`Post not found: ${SLUG}`);
    process.exit(1);
  }

  console.log(`Found: ${doc.name}`);
  console.log(`Doc ID: ${doc._id}`);
  console.log(`Current content length: ${doc.content?.length ?? 0} chars`);
  console.log(`Current lastUpdated: ${doc.lastUpdated ?? '(unset)'}`);

  // Idempotency: skip if link already present.
  if (doc.content?.includes(GITHUB_URL)) {
    console.log('\nLink already present. Bumping lastUpdated only.');
    await client
      .patch(doc._id)
      .set({ lastUpdated: new Date().toISOString() })
      .commit();
    console.log('Done.');
    return;
  }

  const newContent = (doc.content ?? '') + APPEND_HTML;
  const today = new Date().toISOString();

  console.log(`\nAppending "Further reading" section linking to:`);
  console.log(`  ${GITHUB_URL}`);
  console.log(`New content length: ${newContent.length} chars (+${newContent.length - (doc.content?.length ?? 0)})`);
  console.log(`Setting lastUpdated to: ${today}`);

  await client
    .patch(doc._id)
    .set({ content: newContent, lastUpdated: today })
    .commit();

  console.log('\nPatched. Sanity ISR will revalidate within 60s.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
