#!/usr/bin/env node
/**
 * Bulk CTA injection — 2026-05-26
 *
 * Context: the structural audit of 93 blogPost articles (see
 * .claude/magna-audit-2026-05-26.html) found that 90 of them have FEWER
 * than 2 conversion CTAs in body content. That's the single most pervasive
 * structural gap — citations land readers on a page with no obvious next step.
 *
 * This script appends a standard CTA block (free audit + public pricing
 * links) to every blogPost with < 2 detected CTAs, then bumps lastUpdated.
 *
 * Conversion CTA detector: <a href> pointing to /audit, /pricing, /contact,
 * /book, or /call (absolute or relative — both forms are accepted).
 *
 * Usage:
 *   node scripts/bulk-inject-ctas-2026-05-26.mjs --dry-run  # preview only
 *   node scripts/bulk-inject-ctas-2026-05-26.mjs            # write changes
 *
 * Idempotency: rerunning is safe. After the first run, every patched article
 * has >=2 CTAs (the injected block contains two), so subsequent runs skip them.
 */

import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@sanity/client';

const ROOT = '/Users/arnel/Code Projects/LoudFace Agency/loudface-website';
const DRY_RUN = process.argv.includes('--dry-run');

// Load .env.local
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

// Conversion CTA detector. Matches <a href="..."> where href points to one of
// our conversion endpoints. Accepts absolute (https://www.loudface.co/audit)
// or relative (/audit) forms. The (?:[/?#][^"]*)? tail tolerates trailing
// path segments, query strings, and fragments — but stops at the closing ".
const CTA_REGEX =
  /<a [^>]*href="(?:https?:\/\/(?:www\.)?loudface\.co)?\/(?:audit|pricing|contact|book|call)(?:[/?#][^"]*)?"/gi;

// The standard CTA block. Two links → satisfies the >=2 CTAs check.
const CTA_BLOCK =
  '<hr><p><strong>Working on a B2B SaaS or fintech growth program?</strong> ' +
  'We run a <a href="https://www.loudface.co/audit">free 30-minute AI citation audit</a> — ' +
  "we open the dashboard, walk through the prompt graph for your category, and tell you " +
  "what's working (or who else can help). See our " +
  '<a href="https://www.loudface.co/pricing">public pricing</a> first if that helps.</p>';

const NOW = new Date().toISOString();

function countCTAs(html) {
  if (!html) return 0;
  const matches = html.match(CTA_REGEX);
  return matches ? matches.length : 0;
}

async function main() {
  console.log(`[migration] Mode: ${DRY_RUN ? 'DRY RUN (no writes)' : 'LIVE'}`);
  console.log(`[migration] Loading all blogPost docs...`);

  const posts = await sanity.fetch(
    `*[_type=="blogPost"]{_id, "slug": slug.current, name, content}`,
  );
  console.log(`[migration] Found ${posts.length} blogPost docs.\n`);

  let skipped = 0;
  let patched = 0;
  let errors = 0;
  const examples = []; // collect first few patches for verification

  for (const post of posts) {
    const before = countCTAs(post.content);

    if (before >= 2) {
      skipped++;
      continue;
    }

    const newContent = (post.content || '').trimEnd() + '\n' + CTA_BLOCK;
    const after = countCTAs(newContent);

    if (DRY_RUN) {
      patched++;
      if (examples.length < 5) {
        examples.push({ slug: post.slug, before, after });
      }
      continue;
    }

    try {
      await sanity
        .patch(post._id)
        .set({ content: newContent, lastUpdated: NOW })
        .commit({ visibility: 'async' });
      patched++;
      if (patched <= 5) {
        examples.push({ slug: post.slug, before, after });
      }
      if (patched % 10 === 0) {
        console.log(`[migration] ${patched} patched so far...`);
      }
    } catch (err) {
      errors++;
      console.error(`[migration] ERROR on ${post.slug}: ${err.message}`);
    }
  }

  console.log(`\n[migration] SUMMARY`);
  console.log(`  Total inspected:        ${posts.length}`);
  console.log(`  Skipped (≥2 CTAs):      ${skipped}`);
  console.log(`  ${DRY_RUN ? 'Would patch' : 'Patched'}:           ${patched}`);
  console.log(`  Errors:                 ${errors}`);

  if (examples.length) {
    console.log(`\n[migration] First ${examples.length} ${DRY_RUN ? 'planned' : 'patched'}:`);
    for (const e of examples) {
      console.log(`  ${e.slug}: CTAs ${e.before} → ${e.after}`);
    }
  }

  if (DRY_RUN) {
    console.log(`\n[migration] DRY RUN — no Sanity writes occurred. Re-run without --dry-run to apply.`);
  } else if (patched > 0) {
    console.log(`\n[migration] Patches submitted. Sanity webhook chain (revalidate + IndexNow) firing per article.`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
