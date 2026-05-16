// Batch 14 audit — apply the new 4-stage filter to the 4 candidate pieces
// before any refresh-or-301 decision.
// Filter: publishedDate >30d ago, lastUpdated >30d ago, NOT in next.config.ts
// redirects, NOT in Activity Log last 7 days.
import { createClient } from "@sanity/client";
import { readFileSync } from "fs";

const env = readFileSync(".env.local", "utf8").split("\n").reduce((a, l) => {
  const m = l.match(/^([^=]+)=(.*)$/);
  if (m) a[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  return a;
}, {});

const client = createClient({
  projectId: "xjjjqhgt",
  dataset: "production",
  apiVersion: "2025-03-29",
  useCdn: false,
  token: env.SANITY_API_TOKEN,
});

const candidates = [
  "machine-to-machine-marketing",
  "zero-click-content-that-drives-revenue",
  "ai-first-content-architecture",
  "seo-survival-playbook",
];

// Stage 3: read next.config.ts redirect map
const nextConfig = readFileSync("next.config.ts", "utf8");
const redirectedSlugs = [...nextConfig.matchAll(/source: '\/blog\/([^']+)'/g)].map(
  (m) => m[1],
);

const now = new Date("2026-05-16");
const thirtyDaysAgo = new Date(now);
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

console.log(`\n=== Batch 14 4-stage audit (cutoff: 2026-04-16) ===\n`);

for (const slug of candidates) {
  const doc = await client.fetch(
    `*[_type == "blogPost" && slug.current == $slug][0]{_id, name, publishedDate, lastUpdated, "len": length(content)}`,
    { slug },
  );

  if (!doc) {
    console.log(`/blog/${slug}: MISSING from Sanity\n`);
    continue;
  }

  const pubDate = new Date(doc.publishedDate);
  const updatedDate = new Date(doc.lastUpdated);

  // Stage 1: publishedDate > 30d ago?
  const stage1 = pubDate < thirtyDaysAgo;
  // Stage 2: lastUpdated > 30d ago?
  const stage2 = updatedDate < thirtyDaysAgo;
  // Stage 3: not in redirects?
  const stage3 = !redirectedSlugs.includes(slug);
  // Stage 4: not in Activity Log last 7d (skipped — would require Notion fetch)
  // For audit purposes, we'll mark stage 4 as needs-manual-check

  const allPass = stage1 && stage2 && stage3;

  console.log(`/blog/${slug}`);
  console.log(`  publishedDate: ${doc.publishedDate?.slice(0, 10)}  →  Stage 1 (>30d): ${stage1 ? "✓" : "✗"}`);
  console.log(`  lastUpdated:   ${doc.lastUpdated?.slice(0, 10)}  →  Stage 2 (>30d): ${stage2 ? "✓" : "✗"}`);
  console.log(`  in redirects:  ${redirectedSlugs.includes(slug)}  →  Stage 3 (not redirected): ${stage3 ? "✓" : "✗"}`);
  console.log(`  Stage 4 (Activity Log 7d): needs manual Notion check`);
  console.log(`  → GENUINE STALE CANDIDATE: ${allPass ? "YES" : "NO"}`);
  console.log(`  Content length: ${doc.len} chars\n`);
}
