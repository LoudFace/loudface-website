// One-off audit for the SEO title-truncation fix (2026-05-26).
//
// Queries Sanity production for blog posts with metaTitle > 48 chars,
// simulates the old vs new truncation, and reports which posts will
// improve once the fix ships vs which still need a manual edit.
//
// Run: node scripts/audit-meta-titles.mjs

import { createClient } from "@sanity/client";
import { readFileSync } from "fs";

const env = readFileSync(".env.local", "utf8").split("\n").reduce((a, l) => {
  const m = l.match(/^([^=]+)=(.*)$/);
  if (m) a[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  return a;
}, {});

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID || "xjjjqhgt",
  dataset: env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2025-03-29",
  useCdn: false,
  token: env.SANITY_API_TOKEN,
  perspective: "published",
});

const BRAND_SUFFIX = " | LoudFace";
const MAX = 60 - BRAND_SUFFIX.length; // 48

// Mirrors src/lib/seo-utils.ts before the fix
function truncateOld(title, maxLength = MAX) {
  if (!title) return title;
  let cleaned = title;
  if (cleaned.endsWith(BRAND_SUFFIX)) {
    cleaned = cleaned.slice(0, -BRAND_SUFFIX.length).trim();
  }
  cleaned = cleaned.replace(/\s*[-|]\s*[Ll]oud[Ff]ace\s*$/, "").trim();
  if (cleaned.length <= maxLength) return cleaned;
  let truncated = cleaned.slice(0, maxLength).trim();
  if (cleaned[maxLength] && cleaned[maxLength] !== " ") {
    const lastSpace = truncated.lastIndexOf(" ");
    if (lastSpace > maxLength * 0.7) {
      truncated = truncated.slice(0, lastSpace).trim();
    }
  }
  truncated = truncated.replace(/[,;:—–\-]$/, "").trim();
  return truncated;
}

// Mirrors src/lib/seo-utils.ts after the fix
function truncateNew(title, maxLength = MAX) {
  if (!title) return title;
  let cleaned = title;
  if (cleaned.endsWith(BRAND_SUFFIX)) {
    cleaned = cleaned.slice(0, -BRAND_SUFFIX.length).trim();
  }
  cleaned = cleaned.replace(/\s*[-|]\s*[Ll]oud[Ff]ace\s*$/, "").trim();
  if (cleaned.length <= maxLength) return cleaned;
  let truncated = cleaned.slice(0, maxLength).trim();
  if (cleaned[maxLength] && cleaned[maxLength] !== " ") {
    const lastSpace = truncated.lastIndexOf(" ");
    if (lastSpace > maxLength * 0.7) {
      truncated = truncated.slice(0, lastSpace).trim();
    }
  }
  truncated = truncated.replace(/[,;:—–\-&]$/, "").trim();
  truncated = truncated
    .replace(/\s+(?:and|or|the|a|an|of|to|in|on|at|for|with|&)$/i, "")
    .trim();
  return truncated;
}

const CONNECTIVES = new Set([
  "and", "or", "the", "a", "an", "of", "to", "in", "on", "at", "for", "with",
]);

function endsBadly(s) {
  if (!s) return false;
  if (/[&,;:\-—–]$/.test(s)) return true;
  const lastWord = s.split(/\s+/).pop()?.toLowerCase() ?? "";
  return CONNECTIVES.has(lastWord);
}

const rows = await client.fetch(`
  *[_type == "blogPost" && defined(metaTitle) && length(metaTitle) > 48][]{
    _id,
    "slug": slug.current,
    metaTitle,
    "len": length(metaTitle)
  } | order(len desc)
`);

console.log(`\nFound ${rows.length} blog post(s) with metaTitle > 48 chars.\n`);

const fixed = [];
const stillBad = [];
const alreadyClean = [];

for (const r of rows) {
  const before = truncateOld(r.metaTitle);
  const after = truncateNew(r.metaTitle);
  const wasBad = endsBadly(before);
  const stillBadAfter = endsBadly(after);
  const entry = { ...r, before, after, wasBad, stillBadAfter };
  if (wasBad && !stillBadAfter) fixed.push(entry);
  else if (stillBadAfter) stillBad.push(entry);
  else alreadyClean.push(entry);
}

const fmt = (e) =>
  `  /blog/${e.slug}  (metaTitle: ${e.len} chars)\n` +
  `    full:    ${JSON.stringify(e.metaTitle)}\n` +
  `    before:  ${JSON.stringify(e.before)}  (${e.before.length} chars)\n` +
  `    after:   ${JSON.stringify(e.after)}  (${e.after.length} chars)\n`;

console.log(`━━━ FIXED BY THIS PR (${fixed.length}) ━━━`);
console.log("These posts currently render with a dangling &/word in SERP; fix cleans them up automatically.\n");
fixed.forEach((e) => console.log(fmt(e)));

console.log(`\n━━━ STILL NEED MANUAL SANITY EDIT (${stillBad.length}) ━━━`);
console.log("These posts will STILL render with a dangling word even after the fix (rare edge cases). Edit metaTitle in Sanity Studio.\n");
stillBad.forEach((e) => console.log(fmt(e)));

console.log(`\n━━━ ALREADY CLEAN, just over 48 chars (${alreadyClean.length}) ━━━`);
console.log("These truncate cleanly today; included for completeness.\n");
alreadyClean.forEach((e) => console.log(fmt(e)));
