#!/usr/bin/env node
/**
 * Direct Answer (TL;DR) audit against Glasp's high-performing-TLDR pattern.
 *
 * Background — what we're checking against:
 *   Glasp's diagnostic across 400k YouTube Q&A pages found that AI-bot-frequently-requested
 *   pages had TL;DRs that were ~10x longer than rarely-requested pages, used descriptive-prose
 *   openers ~15x more often, and named the entity/topic in the first sentence. Source:
 *   "How Glasp grew ChatGPT traffic from 500 to 19,000 daily sessions in 4 months" (Sean Ellis,
 *   May 22 2026).
 *
 *   Our spec (per `voices/loudface.md` + `blogPost.ts`) targets 40–60 words for `directAnswer`,
 *   which is ~200–400 chars. We're not YouTube Q&A — we're B2B SaaS content (listicles, how-to,
 *   comparison) — so the absolute char range differs from Glasp's. But the *shape* rules carry:
 *     • Self-sufficient as a standalone answer
 *     • First sentence names the entity / topic explicitly
 *     • Descriptive opener — not throat-clearing
 *     • In our target length range (200–400 chars)
 *
 *   This script ranks every published blogPost by how badly its directAnswer deviates from
 *   that shape. Output is a refresh queue, not a "rewrite everything" mandate.
 *
 * Usage:
 *   node scripts/audit-direct-answers.mjs              # markdown table, top 30 worst
 *   node scripts/audit-direct-answers.mjs --json       # raw JSON, all rows
 *   node scripts/audit-direct-answers.mjs --all        # markdown, all rows
 */

import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@sanity/client';

const ROOT = '/Users/arnel/Code Projects/LoudFace Agency/loudface-website';
const argJson = process.argv.includes('--json');
const argAll = process.argv.includes('--all');

const env = Object.fromEntries(
  fs.readFileSync(path.join(ROOT, '.env.local'), 'utf8')
    .split('\n')
    .map(l => l.trim().match(/^([A-Z0-9_]+)=(.*)$/))
    .filter(Boolean)
    .map(m => [m[1], m[2].replace(/^"(.*)"$/, '$1')])
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

// --- Pattern rules ---

// Target length range for our content type (40–60 words ≈ 200–400 chars).
// Glasp's range was 80–150 chars for YouTube Q&A, which is shorter because their content
// type is summary-of-summary; ours is explanatory.
const MIN_CHARS_OK = 200;
const MAX_CHARS_OK = 400;
const MIN_CHARS_TOO_SHORT = 100;   // < this = placeholder territory
const MAX_CHARS_TOO_LONG = 600;    // > this = wall of text

// Throat-clearing openers — first sentence should NOT start with these
const BAD_OPENERS = [
  /^it'?s\b/i,
  /^there are\b/i,
  /^there is\b/i,
  /^in today'?s\b/i,
  /^in this\b/i,
  /^we believe\b/i,
  /^let'?s\b/i,
  /^this article\b/i,    // meta-commentary
  /^this guide\b/i,
  /^this post\b/i,
  /^in the world of\b/i,
  /^when it comes to\b/i,
  /^if you'?re\b/i,
];

// Stopwords to ignore when checking "does first sentence contain an entity"
const ENTITY_STOPWORDS = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'and', 'or', 'but', 'of', 'for', 'in', 'on', 'with', 'to', 'from', 'as', 'by', 'at', 'be', 'this', 'that', 'these', 'those', 'it', 'its', "it's", 'we', 'our', 'you', 'your']);

function firstSentence(text) {
  const m = text.match(/^[^.!?]+[.!?]/);
  return (m ? m[0] : text).trim();
}

function evaluate(directAnswer) {
  const issues = [];
  let severity = 'OK';

  if (!directAnswer || !directAnswer.trim()) {
    return { severity: 'CRITICAL', issues: ['missing-directanswer'], length: 0, firstSentence: '' };
  }

  const text = directAnswer.trim();
  const len = text.length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const fs1 = firstSentence(text);

  // Length checks
  if (len < MIN_CHARS_TOO_SHORT) {
    issues.push(`too-short (${len} chars, target 200-400)`);
    severity = bumpSeverity(severity, 'CRITICAL');
  } else if (len < MIN_CHARS_OK) {
    issues.push(`under-target (${len} chars, target 200-400)`);
    severity = bumpSeverity(severity, 'HIGH');
  } else if (len > MAX_CHARS_TOO_LONG) {
    issues.push(`too-long (${len} chars, target 200-400)`);
    severity = bumpSeverity(severity, 'HIGH');
  } else if (len > MAX_CHARS_OK) {
    issues.push(`over-target (${len} chars, target 200-400)`);
    severity = bumpSeverity(severity, 'MEDIUM');
  }

  // Throat-clearing openers
  for (const bad of BAD_OPENERS) {
    if (bad.test(fs1)) {
      issues.push(`weak-opener ("${fs1.slice(0, 40)}...")`);
      severity = bumpSeverity(severity, 'HIGH');
      break;
    }
  }

  // First sentence has a substantive content word (≥5 chars, not in stopwords)
  // — proxy for "names the entity/topic in the first sentence"
  const firstWords = fs1.toLowerCase().split(/[^a-z0-9'-]+/).filter(Boolean);
  const hasSubstantiveEntity = firstWords.some(w => w.length >= 5 && !ENTITY_STOPWORDS.has(w));
  if (!hasSubstantiveEntity) {
    issues.push('first-sentence-vague');
    severity = bumpSeverity(severity, 'MEDIUM');
  }

  // Sentence count — Glasp's high-performers averaged 2 sentences
  if (sentences.length < 2 && len > MIN_CHARS_OK) {
    issues.push(`single-sentence (${len} chars but no sentence break — break it up)`);
    severity = bumpSeverity(severity, 'LOW');
  }
  if (sentences.length > 5) {
    issues.push(`too-many-sentences (${sentences.length}, target 2-4)`);
    severity = bumpSeverity(severity, 'LOW');
  }

  return { severity, issues, length: len, sentences: sentences.length, firstSentence: fs1 };
}

const SEVERITY_RANK = { OK: 0, LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
function bumpSeverity(current, candidate) {
  return SEVERITY_RANK[candidate] > SEVERITY_RANK[current] ? candidate : current;
}

// --- Main ---
async function main() {
  const posts = await sanity.fetch(`*[_type=="blogPost" && defined(slug.current)]{
    _id, "slug": slug.current, name, directAnswer, publishedDate, lastUpdated
  } | order(publishedDate desc)`);

  console.error(`Audited ${posts.length} blogPosts...`);

  const audited = posts.map(p => {
    const ev = evaluate(p.directAnswer);
    return {
      slug: p.slug,
      name: p.name,
      length: ev.length,
      sentences: ev.sentences || 0,
      severity: ev.severity,
      issues: ev.issues,
      firstSentence: ev.firstSentence,
      publishedDate: p.publishedDate,
      lastUpdated: p.lastUpdated,
    };
  });

  // Sort by severity desc, then by length asc within severity
  const sorted = [...audited].sort((a, b) => {
    if (b.severity !== a.severity) return SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity];
    return a.length - b.length;
  });

  const counts = audited.reduce((acc, a) => { acc[a.severity] = (acc[a.severity] || 0) + 1; return acc; }, {});

  if (argJson) {
    console.log(JSON.stringify({ totalAudited: posts.length, severityCounts: counts, rows: sorted }, null, 2));
    return;
  }

  console.log(`# Direct Answer (TL;DR) audit\n`);
  console.log(`Audited **${posts.length}** blogPosts against the Glasp shape:`);
  console.log(`- Target length: 200–400 chars (40–60 words)`);
  console.log(`- First sentence names the entity / topic`);
  console.log(`- No throat-clearing opener ("It's...", "There are...", "This article...")`);
  console.log(`- 2–4 self-sufficient sentences\n`);

  console.log(`## Severity distribution\n`);
  console.log(`| Severity | Count | Description |`);
  console.log(`|---|---:|---|`);
  console.log(`| CRITICAL | ${counts.CRITICAL || 0} | Missing directAnswer entirely OR < 100 chars (placeholder) |`);
  console.log(`| HIGH | ${counts.HIGH || 0} | Wrong length range OR throat-clearing opener |`);
  console.log(`| MEDIUM | ${counts.MEDIUM || 0} | Length nearly right but small structural issues |`);
  console.log(`| LOW | ${counts.LOW || 0} | Sentence-count issue only |`);
  console.log(`| OK | ${counts.OK || 0} | Passes all checks |\n`);

  const toShow = argAll ? sorted : sorted.filter(r => r.severity !== 'OK').slice(0, 30);
  console.log(`## Refresh queue${argAll ? '' : ' (top 30 by severity)'}\n`);
  console.log(`| # | Severity | Slug | Length | Sentences | Issues |`);
  console.log(`|---|---|---|---:|---:|---|`);
  toShow.forEach((r, i) => {
    const slugLink = `[${r.slug.slice(0, 50)}${r.slug.length > 50 ? '…' : ''}](https://www.loudface.co/blog/${r.slug})`;
    console.log(`| ${i + 1} | ${r.severity} | ${slugLink} | ${r.length} | ${r.sentences} | ${r.issues.join('; ')} |`);
  });
  console.log();

  // Surface the actual first sentences for the top 10 — easier to scan
  console.log(`## First sentence preview (top 10 worst)\n`);
  toShow.slice(0, 10).forEach((r, i) => {
    console.log(`### ${i + 1}. ${r.name}`);
    console.log(`- **Slug:** \`${r.slug}\``);
    console.log(`- **Severity:** ${r.severity}`);
    console.log(`- **Length:** ${r.length} chars / ${r.sentences} sentences`);
    console.log(`- **First sentence:** ${r.firstSentence ? '_"' + r.firstSentence + '"_' : '_(empty)_'}`);
    console.log(`- **Issues:** ${r.issues.join(', ')}`);
    console.log();
  });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
