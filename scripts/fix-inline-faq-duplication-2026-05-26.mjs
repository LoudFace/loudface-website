#!/usr/bin/env node
/**
 * Strip inline FAQ sections from blogPost body content.
 *
 * The page template renders the `faq` array field as its own FAQ section
 * below the body. When the body content ALSO contains an `<h2>Frequently
 * Asked Questions</h2>` block (with the same Q&As as the `faq` array),
 * readers see the FAQ rendered twice.
 *
 * This bug already had a stripping path in the canonical ship scripts
 * (e.g. ship-best-aeo-agency-fintech-companies-2026.mjs lines 60-86 strip
 * the markdown FAQ section before HTML conversion). But articles shipped
 * through other paths can still arrive in Sanity with the inline FAQ
 * embedded — first observed 2026-05-26 on best-llm-seo-aeo-agencies-b2b-saas-2026.
 *
 * This script:
 *   1. Queries every blogPost with faq.length > 0 (so the array path is real)
 *   2. Detects if content contains an inline FAQ H2 pattern
 *   3. Strips from the FAQ H2 up to the next H2 (preserves the CTA section that
 *      typically follows)
 *   4. Patches Sanity with the cleaned content
 *
 * Idempotent. Re-runs detect "no inline FAQ" and skip.
 *
 * Usage:
 *   node scripts/fix-inline-faq-duplication-2026-05-26.mjs --dry-run
 *   node scripts/fix-inline-faq-duplication-2026-05-26.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@sanity/client';

const ROOT = '/Users/arnel/Code Projects/LoudFace Agency/loudface-website';
const DRY_RUN = process.argv.includes('--dry-run');

const env = Object.fromEntries(
  fs.readFileSync(path.join(ROOT, '.env.local'), 'utf8').split('\n')
    .map((l) => l.trim().match(/^([A-Z_]+)=(.*)$/)).filter(Boolean)
    .map((m) => [m[1], m[2]])
);

const sanity = createClient({
  projectId: 'xjjjqhgt', dataset: 'production', apiVersion: '2025-03-29',
  useCdn: false, token: env.SANITY_API_TOKEN,
});

const NOW = new Date().toISOString();

// Match the FAQ H2 (case-insensitive, tolerates variants) up to the NEXT
// <h2 ...>, <hr> (CTA block marker), or end of content. Stopping at <hr>
// is critical — the bulk-CTA-injection migration appended a <hr><p> block
// to the end of body content, and on articles where the FAQ H2 was the
// last H2 in body, that CTA sits IMMEDIATELY after the orphan FAQ H2.
// Without the <hr> lookahead, this regex would strip the CTA too.
const FAQ_H2_REGEX = /<h2[^>]*>\s*(?:FAQ|FAQs|Frequently\s+Asked\s+Questions?|Common\s+Questions?)\s*<\/h2>[\s\S]*?(?=<h2\b|<hr\b|$)/i;

async function main() {
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no writes)' : 'LIVE'}`);
  console.log('Fetching all blogPosts with non-empty faq array...');

  const posts = await sanity.fetch(`*[_type=="blogPost" && count(faq) > 0]{
    _id, "slug": slug.current, content, "faqCount": count(faq), "contentLen": length(content)
  }`);
  console.log(`Found ${posts.length} blogPosts with FAQ arrays.\n`);

  let stripped = 0;
  let skipped = 0;
  let errors = 0;

  for (const post of posts) {
    const match = (post.content || '').match(FAQ_H2_REGEX);
    if (!match) {
      skipped++;
      continue;
    }

    const removed = match[0];
    const newContent = (post.content || '').replace(FAQ_H2_REGEX, '');
    const sizeDelta = newContent.length - (post.content || '').length;

    if (DRY_RUN) {
      console.log(`WOULD STRIP: ${post.slug}`);
      console.log(`  faq array: ${post.faqCount} items`);
      console.log(`  removing ${-sizeDelta} chars (FAQ block + intervening Q&As)`);
      console.log(`  first 80 chars of removed block: ${removed.slice(0, 80).replace(/\s+/g, ' ')}...`);
      stripped++;
      continue;
    }

    try {
      await sanity.patch(post._id)
        .set({ content: newContent, lastUpdated: NOW })
        .commit({ visibility: 'sync' });
      console.log(`STRIPPED: ${post.slug} (faqArray=${post.faqCount}, removed ${-sizeDelta} chars)`);
      stripped++;
    } catch (err) {
      errors++;
      console.error(`ERROR on ${post.slug}: ${err.message}`);
    }
  }

  console.log(`\nSUMMARY`);
  console.log(`  Inspected: ${posts.length}`);
  console.log(`  ${DRY_RUN ? 'Would strip' : 'Stripped'}: ${stripped}`);
  console.log(`  Skipped (no inline FAQ): ${skipped}`);
  console.log(`  Errors: ${errors}`);

  if (DRY_RUN) {
    console.log(`\nDRY RUN — re-run without --dry-run to apply.`);
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
