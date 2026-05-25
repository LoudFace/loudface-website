#!/usr/bin/env node
/**
 * Bulk structural inject — 2026-05-26 (round 2)
 *
 * Reads three subagent-generated JSON files and injects their content into
 * the corresponding Sanity blogPost documents:
 *
 *   1. .claude/criteria-tables-2026-05-26.json  → 9 evaluation criteria tables
 *      (HTML blocks injected before the first <h2> in body content)
 *
 *   2. .claude/timelines-2026-05-26.json        → 10 "What to expect" timelines
 *      (HTML blocks injected before the first <h2> in body content)
 *
 *   3. .claude/tldr-backfills-2026-05-26.json   → 11 directAnswer fields
 *      (Field update, replaces empty / too-short existing directAnswer)
 *
 * Total: up to 30 patches across ~28 unique articles (some get both body +
 * directAnswer in one transaction).
 *
 * Idempotency:
 *   - Body inject: skips if the section's <h2> text is already present.
 *   - TLDR backfill: overwrites unconditionally (the slug list is curated
 *     to articles flagged as having empty / short directAnswer).
 *
 * Usage:
 *   node scripts/bulk-inject-structural-2026-05-26.mjs --dry-run
 *   node scripts/bulk-inject-structural-2026-05-26.mjs
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

// Load all 3 JSON payloads
const criteria = JSON.parse(
  fs.readFileSync(path.join(ROOT, '.claude/criteria-tables-2026-05-26.json'), 'utf8'),
).tables || {};
const timelines = JSON.parse(
  fs.readFileSync(path.join(ROOT, '.claude/timelines-2026-05-26.json'), 'utf8'),
).timelines || {};
const tldrs = JSON.parse(
  fs.readFileSync(path.join(ROOT, '.claude/tldr-backfills-2026-05-26.json'), 'utf8'),
).tldrs || {};

// Union of all affected slugs (criteria, timelines, TLDRs)
const slugs = Array.from(
  new Set([
    ...Object.keys(criteria),
    ...Object.keys(timelines),
    ...Object.keys(tldrs),
  ]),
);

console.log(`[migration] Mode: ${DRY_RUN ? 'DRY RUN (no writes)' : 'LIVE'}`);
console.log(`[migration] Total unique slugs to process: ${slugs.length}`);
console.log(
  `[migration] Payloads: ${Object.keys(criteria).length} criteria, ${Object.keys(timelines).length} timelines, ${Object.keys(tldrs).length} TLDRs`,
);

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
  // Fetch all target articles in one GROQ query
  const posts = await sanity.fetch(
    `*[_type=="blogPost" && slug.current in $slugs]{
      _id, "slug": slug.current, name, content, directAnswer, lastUpdated
    }`,
    { slugs },
  );
  console.log(`[migration] Found ${posts.length} matching docs in Sanity.\n`);

  const missing = slugs.filter((s) => !posts.find((p) => p.slug === s));
  if (missing.length) {
    console.warn(`[migration] WARNING: ${missing.length} slugs not found in Sanity:`);
    missing.forEach((s) => console.warn(`    - ${s}`));
    console.warn('');
  }

  let patched = 0;
  let bodySkipped = 0;
  let errors = 0;
  const actions = []; // per-slug action log

  for (const post of posts) {
    const action = {
      slug: post.slug,
      addedCriteria: false,
      addedTimeline: false,
      updatedTldr: false,
      skippedBody: null,
    };

    const setFields = {};
    let newContent = post.content || '';
    let bodyChanged = false;

    // --- Body injection (criteria OR timeline, mutex by design) ---
    const bodyBlock = criteria[post.slug] || timelines[post.slug];
    if (bodyBlock) {
      const blockType = criteria[post.slug] ? 'criteria' : 'timeline';
      const h2Text = extractH2Text(bodyBlock.html);

      if (h2Text && newContent.includes(h2Text)) {
        action.skippedBody = `H2 "${h2Text}" already present`;
        bodySkipped++;
      } else {
        newContent = injectBeforeFirstH2(newContent, bodyBlock.html);
        bodyChanged = true;
        if (blockType === 'criteria') action.addedCriteria = true;
        else action.addedTimeline = true;
      }
    }

    if (bodyChanged) {
      setFields.content = newContent;
    }

    // --- TLDR backfill ---
    const tldr = tldrs[post.slug];
    if (tldr && tldr.directAnswer) {
      setFields.directAnswer = tldr.directAnswer;
      action.updatedTldr = true;
    }

    // Skip if nothing to update
    if (Object.keys(setFields).length === 0) {
      actions.push(action);
      continue;
    }

    setFields.lastUpdated = NOW;

    if (DRY_RUN) {
      patched++;
      actions.push(action);
      continue;
    }

    try {
      await sanity
        .patch(post._id)
        .set(setFields)
        .commit({ visibility: 'async' });
      patched++;
      actions.push(action);
    } catch (err) {
      errors++;
      console.error(`[migration] ERROR on ${post.slug}: ${err.message}`);
    }
  }

  // Per-slug action report
  console.log(`[migration] Per-slug actions:`);
  for (const a of actions) {
    const parts = [];
    if (a.addedCriteria) parts.push('+criteria');
    if (a.addedTimeline) parts.push('+timeline');
    if (a.updatedTldr) parts.push('+tldr');
    if (a.skippedBody) parts.push(`SKIP(${a.skippedBody})`);
    if (parts.length === 0) parts.push('no change');
    console.log(`  ${a.slug}: ${parts.join(' ')}`);
  }

  console.log(`\n[migration] SUMMARY`);
  console.log(`  Slugs processed: ${posts.length}`);
  console.log(`  ${DRY_RUN ? 'Would patch' : 'Patched'}: ${patched}`);
  console.log(`  Body skipped (already had H2): ${bodySkipped}`);
  console.log(`  Errors: ${errors}`);

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
