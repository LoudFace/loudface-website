#!/usr/bin/env node
/**
 * Bulk structural inject — 2026-05-26 (round 3 — final corpus retrofit)
 *
 * Reads three round-3 subagent JSON payloads and injects content into the
 * corresponding Sanity blogPost documents:
 *
 *   1. .claude/comparison-tables-2026-05-26.json   → 6 listicle comparison
 *      tables (1 marked action=skip and respected).
 *   2. .claude/definition-sections-2026-05-26-longtail.json → 40 long-tail
 *      definition sections (round 1 covered the priority 20; this is the
 *      remainder where a definition adds value).
 *   3. .claude/calendly-figma-retrofit-2026-05-26.json → 2 articles, each
 *      with a definition section AND a decision-matrix table (concatenated
 *      into one injected block per article).
 *
 * All injections placed before the first <h2> in body content. Idempotent
 * via H2-text presence check.
 *
 * Usage:
 *   node scripts/bulk-inject-structural-r3-2026-05-26.mjs --dry-run
 *   node scripts/bulk-inject-structural-r3-2026-05-26.mjs
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

if (!env.SANITY_API_TOKEN) {
  console.error('Missing SANITY_API_TOKEN');
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

// Load payloads
const comparisonPayload = JSON.parse(
  fs.readFileSync(path.join(ROOT, '.claude/comparison-tables-2026-05-26.json'), 'utf8'),
).tables || {};
const longtailPayload = JSON.parse(
  fs.readFileSync(path.join(ROOT, '.claude/definition-sections-2026-05-26-longtail.json'), 'utf8'),
).sections || {};
const calendlyFigmaPayload = JSON.parse(
  fs.readFileSync(path.join(ROOT, '.claude/calendly-figma-retrofit-2026-05-26.json'), 'utf8'),
).articles || {};

// Filter out skipped comparison tables
const comparisons = Object.fromEntries(
  Object.entries(comparisonPayload).filter(([, v]) => v.action !== 'skip'),
);

// Build per-slug payload map
// For Calendly/Figma: combine definition + decisionMatrix into one block
const perSlug = {};
for (const [slug, entry] of Object.entries(comparisons)) {
  perSlug[slug] = perSlug[slug] || {};
  perSlug[slug].comparison = entry.html;
}
for (const [slug, entry] of Object.entries(longtailPayload)) {
  perSlug[slug] = perSlug[slug] || {};
  perSlug[slug].longtail = entry.html;
}
for (const [slug, entry] of Object.entries(calendlyFigmaPayload)) {
  perSlug[slug] = perSlug[slug] || {};
  perSlug[slug].calendlyFigma =
    (entry.definition?.html || '') + '\n' + (entry.decisionMatrix?.html || '');
}

const slugs = Object.keys(perSlug);

console.log(`[migration] Mode: ${DRY_RUN ? 'DRY RUN (no writes)' : 'LIVE'}`);
console.log(`[migration] Payloads — comparisons: ${Object.keys(comparisons).length}, longtail-defs: ${Object.keys(longtailPayload).length}, calendly+figma: ${Object.keys(calendlyFigmaPayload).length}`);
console.log(`[migration] Total unique slugs: ${slugs.length}\n`);

function extractH2Text(html) {
  const match = html.match(/<h2[^>]*>([^<]+)<\/h2>/i);
  return match ? match[1].trim() : null;
}

function injectBeforeFirstH2(body, sectionHtml) {
  const firstH2 = body.search(/<h2\b/i);
  if (firstH2 === -1) {
    return (body || '').trimEnd() + '\n' + sectionHtml;
  }
  return body.slice(0, firstH2) + sectionHtml + '\n' + body.slice(firstH2);
}

async function main() {
  const posts = await sanity.fetch(
    `*[_type=="blogPost" && slug.current in $slugs]{
      _id, "slug": slug.current, name, content, lastUpdated
    }`,
    { slugs },
  );
  console.log(`[migration] Found ${posts.length} matching docs in Sanity.\n`);

  const missing = slugs.filter((s) => !posts.find((p) => p.slug === s));
  if (missing.length) {
    console.warn(`[migration] ${missing.length} slugs not found in Sanity:`);
    missing.forEach((s) => console.warn(`    - ${s}`));
    console.warn('');
  }

  let patched = 0;
  let skipped = 0;
  let errors = 0;

  for (const post of posts) {
    const payload = perSlug[post.slug];
    if (!payload) continue;

    // Choose the block to inject (priority: calendly-figma > comparison > longtail)
    let blockHtml = payload.calendlyFigma || payload.comparison || payload.longtail;
    let blockType = payload.calendlyFigma
      ? 'calendly-figma'
      : payload.comparison
        ? 'comparison'
        : 'longtail';

    if (!blockHtml || blockHtml.trim().length === 0) {
      console.log(`[migration] SKIP ${post.slug} (no block content)`);
      skipped++;
      continue;
    }

    const h2Text = extractH2Text(blockHtml);
    const content = post.content || '';

    if (h2Text && content.includes(h2Text)) {
      console.log(`[migration] SKIP ${post.slug} (${blockType}: H2 "${h2Text}" already present)`);
      skipped++;
      continue;
    }

    const newContent = injectBeforeFirstH2(content, blockHtml);
    const sizeDelta = newContent.length - content.length;

    if (DRY_RUN) {
      console.log(`[migration] WOULD PATCH ${post.slug} (${blockType}, +${sizeDelta} chars, H2: "${h2Text}")`);
      patched++;
      continue;
    }

    try {
      await sanity
        .patch(post._id)
        .set({ content: newContent, lastUpdated: NOW })
        .commit({ visibility: 'async' });
      console.log(`[migration] PATCHED ${post.slug} (${blockType}, +${sizeDelta} chars)`);
      patched++;
    } catch (err) {
      errors++;
      console.error(`[migration] ERROR on ${post.slug}: ${err.message}`);
    }
  }

  console.log(`\n[migration] SUMMARY`);
  console.log(`  Slugs processed:         ${posts.length}`);
  console.log(`  ${DRY_RUN ? 'Would patch' : 'Patched'}:                 ${patched}`);
  console.log(`  Skipped:                 ${skipped}`);
  console.log(`  Errors:                  ${errors}`);

  if (DRY_RUN) {
    console.log(`\n[migration] DRY RUN — re-run without --dry-run to apply.`);
  } else if (patched > 0) {
    console.log(`\n[migration] Patches submitted. Sanity webhook chain firing per article.`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
