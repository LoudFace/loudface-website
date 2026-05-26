#!/usr/bin/env node
/**
 * Fix em-dash in CTA block + duplicate H2 in AEO guide — 2026-05-26
 *
 * Quality audit found two real issues from today's structural retrofit:
 *
 *   1. The CTA block I injected across 83 articles contains an em-dash:
 *      "...free 30-minute AI citation audit</a> — we open the dashboard..."
 *      That em-dash violates the anti-slop voice rule. Replace it with
 *      a period + capitalized "We" to break the sentence cleanly.
 *
 *   2. answer-engine-optimization-guide-2026 has a duplicate H2 after
 *      today's definition injection: the new patch added
 *      "What is Answer Engine Optimization?" but the article body already
 *      had a "What is answer engine optimization?" section (lowercase)
 *      with different content (AEO vs SEO/GEO disambiguation). Both will
 *      produce duplicate FAQPage schema entries if extracted. Rename the
 *      original to its real topic.
 *
 * Usage:
 *   node scripts/fix-cta-emdash-and-dup-h2-2026-05-26.mjs --dry-run
 *   node scripts/fix-cta-emdash-and-dup-h2-2026-05-26.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@sanity/client';

const ROOT = '/Users/arnel/Code Projects/LoudFace Agency/loudface-website';
const DRY_RUN = process.argv.includes('--dry-run');

const env = Object.fromEntries(
  fs
    .readFileSync(path.join(ROOT, '.env.local'), 'utf8')
    .split('\n')
    .map((l) => l.trim().match(/^([A-Z_]+)=(.*)$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2]]),
);

const sanity = createClient({
  projectId: 'xjjjqhgt',
  dataset: 'production',
  apiVersion: '2025-03-29',
  useCdn: false,
  token: env.SANITY_API_TOKEN,
});

const NOW = new Date().toISOString();

// Em-dash before "we open the dashboard" — bug from the bulk-inject-ctas script.
// Replace " — we open" with ". We open" (period + capital W).
const OLD_CTA_DASH = '">free 30-minute AI citation audit</a> — we open the dashboard';
const NEW_CTA_DASH = '">free 30-minute AI citation audit</a>. We open the dashboard';

// Duplicate H2 fix for answer-engine-optimization-guide-2026.
const AEO_GUIDE_SLUG = 'answer-engine-optimization-guide-2026';
const OLD_AEO_H2 = '<h2 id="what-is-answer-engine-optimization" id="section-2-what-is-answer-engine-optimization">What is answer engine optimization?</h2>';
// The page template may add the id automatically; match by inner text instead.
// We replace the lowercase variant (original article body) while leaving the
// new patched variant (capitalized) intact at the top of the article.
const OLD_AEO_H2_TEXT = '>What is answer engine optimization?</h2>';
const NEW_AEO_H2_TEXT = '>How AEO differs from SEO, GEO, and AI SEO</h2>';

async function main() {
  console.log(`[fix] Mode: ${DRY_RUN ? 'DRY RUN (no writes)' : 'LIVE'}`);

  const posts = await sanity.fetch(`*[_type=="blogPost"]{
    _id, "slug": slug.current, content
  }`);
  console.log(`[fix] Loaded ${posts.length} blogPost docs.\n`);

  let ctaFixed = 0;
  let aeoH2Fixed = false;
  let errors = 0;

  for (const post of posts) {
    let content = post.content || '';
    let changed = false;
    const actions = [];

    // ─── Fix 1: em-dash in CTA ─────────────────────────────────────
    if (content.includes(OLD_CTA_DASH)) {
      content = content.replace(OLD_CTA_DASH, NEW_CTA_DASH);
      changed = true;
      actions.push('cta-emdash');
    }

    // ─── Fix 2: duplicate H2 in the AEO guide only ─────────────────
    if (post.slug === AEO_GUIDE_SLUG && content.includes(OLD_AEO_H2_TEXT)) {
      content = content.replace(OLD_AEO_H2_TEXT, NEW_AEO_H2_TEXT);
      changed = true;
      actions.push('aeo-h2-rename');
    }

    if (!changed) continue;

    if (DRY_RUN) {
      console.log(`[fix] WOULD PATCH ${post.slug} (${actions.join(', ')})`);
      if (actions.includes('cta-emdash')) ctaFixed++;
      if (actions.includes('aeo-h2-rename')) aeoH2Fixed = true;
      continue;
    }

    try {
      await sanity
        .patch(post._id)
        .set({ content, lastUpdated: NOW })
        .commit({ visibility: 'async' });
      console.log(`[fix] PATCHED ${post.slug} (${actions.join(', ')})`);
      if (actions.includes('cta-emdash')) ctaFixed++;
      if (actions.includes('aeo-h2-rename')) aeoH2Fixed = true;
    } catch (err) {
      errors++;
      console.error(`[fix] ERROR on ${post.slug}: ${err.message}`);
    }
  }

  console.log(`\n[fix] SUMMARY`);
  console.log(`  CTA em-dash fixed:  ${ctaFixed} articles`);
  console.log(`  AEO H2 renamed:     ${aeoH2Fixed ? 'yes' : 'no'}`);
  console.log(`  Errors:             ${errors}`);

  if (DRY_RUN) {
    console.log(`\n[fix] DRY RUN — re-run without --dry-run to apply.`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
