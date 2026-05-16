/**
 * Backfill `directAnswer` on every published blog post.
 *
 * Strategy:
 *   1. For each post, look for a TL;DR-style first paragraph in the
 *      content HTML and lift the text after the marker.
 *   2. Fall back to the first paragraph with ≥ 20 words if no TL;DR
 *      marker exists.
 *   3. Truncate to ~75 words so the rendered block stays tight.
 *   4. Skip posts that already have `directAnswer` set (don't overwrite
 *      curated entries).
 *
 * Run with `--dry-run` first to preview, then without to commit.
 *
 *   cd loudface-website
 *   node scripts/backfill-direct-answer.mjs --dry-run
 *   node scripts/backfill-direct-answer.mjs
 */

import { createClient } from "@sanity/client";
import { readFileSync } from "fs";

const env = readFileSync(".env.local", "utf8").split("\n").reduce((a, l) => {
  const m = l.match(/^([^=]+)=(.*)$/);
  if (m) a[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  return a;
}, {});

const DRY = process.argv.includes("--dry-run");

const client = createClient({
  projectId: "xjjjqhgt",
  dataset: "production",
  apiVersion: "2025-03-29",
  useCdn: false,
  token: env.SANITY_API_TOKEN,
});

function truncateWords(text, max) {
  const words = text.trim().split(/\s+/);
  if (words.length <= max) return text.trim();
  return words.slice(0, max).join(" ") + "…";
}

function extractDirectAnswer(html) {
  if (!html) return null;

  const tldrRegex =
    /<p\b[^>]*>\s*(?:<(?:strong|b)[^>]*>\s*)?TL;DR[:\s]*(?:<\/(?:strong|b)>)?\s*([\s\S]*?)<\/p>/i;
  const tldrMatch = html.match(tldrRegex);
  if (tldrMatch) {
    const txt = tldrMatch[1].replace(/<[^>]*>/g, "").trim();
    if (txt.length > 20) return { source: "tldr", text: truncateWords(txt, 75) };
  }

  const pRegex = /<p\b[^>]*>([\s\S]*?)<\/p>/gi;
  let m;
  while ((m = pRegex.exec(html)) !== null) {
    const text = m[1].replace(/<[^>]*>/g, "").trim();
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length >= 20) return { source: "first-paragraph", text: truncateWords(text, 75) };
  }

  return null;
}

const posts = await client.fetch(`*[_type == "blogPost"]{
  _id,
  name,
  "slug": slug.current,
  directAnswer,
  content
}`);

console.log(`Found ${posts.length} blog posts. Mode: ${DRY ? "DRY RUN" : "COMMIT"}`);
console.log("");

let patched = 0;
let skippedHasField = 0;
let skippedNoMatch = 0;

for (const post of posts) {
  if (post.directAnswer?.trim()) {
    skippedHasField++;
    continue;
  }

  const extracted = extractDirectAnswer(post.content);
  if (!extracted) {
    skippedNoMatch++;
    console.log(`  ✗ ${post.slug} — no extractable answer`);
    continue;
  }

  console.log(`  ✓ ${post.slug} (${extracted.source}, ${extracted.text.split(/\s+/).length}w)`);
  console.log(`    "${extracted.text.slice(0, 100)}${extracted.text.length > 100 ? "…" : ""}"`);

  if (!DRY) {
    await client
      .patch(post._id)
      .set({ directAnswer: extracted.text })
      .commit();
  }
  patched++;
}

console.log("");
console.log(`Summary:`);
console.log(`  ${patched} patched`);
console.log(`  ${skippedHasField} skipped (directAnswer already set)`);
console.log(`  ${skippedNoMatch} skipped (no extractable answer)`);
console.log(`  ${posts.length} total`);
console.log(DRY ? `\nDry run. Re-run without --dry-run to commit.` : `\nDone.`);
