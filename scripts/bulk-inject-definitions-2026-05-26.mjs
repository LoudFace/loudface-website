#!/usr/bin/env node
/**
 * Bulk definition-section injection — 2026-05-26
 *
 * The 2026-05-26 structural audit found that only 21% of applicable articles
 * have a "What is X?" definition section — the AEO category-vocabulary play
 * that makes AI models anchor the article to a defined topic. 79% don't.
 *
 * A subagent generated 20 voice-matched definition sections (200-300 words
 * each, anti-slop validated) at:
 *   .claude/definition-sections-2026-05-26.json
 *
 * This script injects each section's HTML into its target blogPost in Sanity,
 * placed BEFORE the first H2 in the body content. After this script runs,
 * the 20 priority articles each open with a definition section that claims
 * the article's category vocabulary.
 *
 * Usage:
 *   node scripts/bulk-inject-definitions-2026-05-26.mjs --dry-run
 *   node scripts/bulk-inject-definitions-2026-05-26.mjs
 *
 * Idempotency: each section's <h2> is checked against existing content. If
 * the H2 text is already present (from a prior run), the article is skipped.
 */

import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@sanity/client';

const ROOT = '/Users/arnel/Code Projects/LoudFace Agency/loudface-website';
const DRY_RUN = process.argv.includes('--dry-run');

const SECTIONS_PATH = path.join(ROOT, '.claude/definition-sections-2026-05-26.json');

const env = Object.fromEntries(
  fs
    .readFileSync(path.join(ROOT, '.env.local'), 'utf8')
    .split('\n')
    .map((l) => l.trim().match(/^([A-Z_]+)=(.*)$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2]]),
);

if (!env.SANITY_API_TOKEN) {
  console.error('Missing SANITY_API_TOKEN in .env.local');
  process.exit(1);
}

const sanity = createClient({
  projectId: 'xjjjqhgt',
  dataset: 'production',
  apiVersion: '2025-03-29',
  useCdn: false,
  token: env.SANITY_API_TOKEN,
});

const NOW = new Date().toISOString();

// Extract the H2 text content from a section's HTML to use for idempotency.
function extractH2Text(html) {
  const match = html.match(/<h2[^>]*>([^<]+)<\/h2>/i);
  return match ? match[1].trim() : null;
}

// Inject the section's HTML right before the first H2 in body content.
// If no H2 exists, append at the end.
function injectBeforeFirstH2(body, sectionHtml) {
  const firstH2 = body.search(/<h2\b/i);
  if (firstH2 === -1) {
    return (body || '').trimEnd() + '\n' + sectionHtml;
  }
  return body.slice(0, firstH2) + sectionHtml + '\n' + body.slice(firstH2);
}

async function main() {
  console.log(`[migration] Mode: ${DRY_RUN ? 'DRY RUN (no writes)' : 'LIVE'}`);

  const data = JSON.parse(fs.readFileSync(SECTIONS_PATH, 'utf8'));
  const sections = data.sections || {};
  const slugs = Object.keys(sections);
  console.log(`[migration] Loaded ${slugs.length} definition sections from JSON.`);

  // Fetch all target articles in one GROQ query
  const groqQuery = `*[_type=="blogPost" && slug.current in $slugs]{
    _id, "slug": slug.current, name, content, lastUpdated
  }`;
  const posts = await sanity.fetch(groqQuery, { slugs });
  console.log(`[migration] Found ${posts.length} matching blogPost docs in Sanity.\n`);

  const missing = slugs.filter((s) => !posts.find((p) => p.slug === s));
  if (missing.length) {
    console.warn(`[migration] WARNING: ${missing.length} JSON slugs have no Sanity match:`);
    missing.forEach((s) => console.warn(`    - ${s}`));
    console.warn('');
  }

  let skipped = 0;
  let patched = 0;
  let errors = 0;
  const examples = [];

  for (const post of posts) {
    const section = sections[post.slug];
    if (!section) {
      console.warn(`[migration] No section data for ${post.slug} — skipping`);
      continue;
    }

    const h2Text = extractH2Text(section.html);
    const existingContent = post.content || '';

    // Idempotency: if H2 text already exists in content, skip
    if (h2Text && existingContent.includes(h2Text)) {
      skipped++;
      console.log(`[migration] SKIP ${post.slug} (H2 "${h2Text}" already present)`);
      continue;
    }

    const newContent = injectBeforeFirstH2(existingContent, section.html);
    const sizeDelta = newContent.length - existingContent.length;

    if (DRY_RUN) {
      patched++;
      if (examples.length < 5) {
        examples.push({ slug: post.slug, topic: section.topic, h2Text, sizeDelta });
      }
      console.log(`[migration] WOULD PATCH ${post.slug} (+${sizeDelta} chars, H2: "${h2Text}")`);
      continue;
    }

    try {
      await sanity
        .patch(post._id)
        .set({ content: newContent, lastUpdated: NOW })
        .commit({ visibility: 'async' });
      patched++;
      console.log(`[migration] PATCHED ${post.slug} (+${sizeDelta} chars)`);
      if (examples.length < 5) {
        examples.push({ slug: post.slug, topic: section.topic, h2Text, sizeDelta });
      }
    } catch (err) {
      errors++;
      console.error(`[migration] ERROR on ${post.slug}: ${err.message}`);
    }
  }

  console.log(`\n[migration] SUMMARY`);
  console.log(`  JSON sections:           ${slugs.length}`);
  console.log(`  Sanity matches:          ${posts.length}`);
  console.log(`  Skipped (already had H2): ${skipped}`);
  console.log(`  ${DRY_RUN ? 'Would patch' : 'Patched'}:                 ${patched}`);
  console.log(`  Errors:                  ${errors}`);

  if (examples.length) {
    console.log(`\n[migration] First ${examples.length} ${DRY_RUN ? 'planned' : 'patched'}:`);
    for (const e of examples) {
      console.log(`  ${e.slug}: "${e.topic}" → H2 "${e.h2Text}" (+${e.sizeDelta} chars)`);
    }
  }

  if (DRY_RUN) {
    console.log(`\n[migration] DRY RUN — no writes. Re-run without --dry-run to apply.`);
  } else if (patched > 0) {
    console.log(`\n[migration] Patches submitted. Sanity webhook chain firing per article.`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
