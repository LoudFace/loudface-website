import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
const env = readFileSync(".env.local", "utf8").split("\n").reduce((a, l) => { const m = l.match(/^([^=]+)=(.*)$/); if (m) a[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, ""); return a; }, {});
const client = createClient({ projectId: "xjjjqhgt", dataset: "production", apiVersion: "2025-03-29", useCdn: false, token: env.SANITY_API_TOKEN });

// Pull every published blogPost with all relevant date fields
const docs = await client.fetch(`*[_type == "blogPost" && !(_id in path("drafts.**"))]{
  "slug": slug.current,
  name,
  publishedDate,
  lastUpdated,
  _createdAt,
  _updatedAt,
  "contentLength": length(content)
} | order(_createdAt desc)`);

console.log(`Total published blogPosts: ${docs.length}\n`);

console.log("=== Most recently CREATED (last 30 days) ===");
console.log("These were newly published in the recent batches — DO NOT refresh\n");
const now = new Date("2026-05-16");
const thirtyDaysAgo = new Date(now);
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

const recentlyCreated = docs.filter(d => new Date(d._createdAt) >= thirtyDaysAgo);
for (const d of recentlyCreated.slice(0, 50)) {
  const created = d._createdAt?.slice(0, 10) ?? "?";
  const published = d.publishedDate?.slice(0, 10) ?? "?";
  const updated = d.lastUpdated?.slice(0, 10) ?? "?";
  console.log(`  created=${created}  published=${published}  updated=${updated}  /blog/${d.slug}`);
}

console.log(`\nTotal recently created (last 30d): ${recentlyCreated.length}\n`);

console.log("=== OLDER pieces by _createdAt, but lastUpdated bumped recently ===");
console.log("These are old pieces I refreshed in the recent batches — DO NOT re-refresh\n");
const refreshedRecently = docs.filter(d => {
  const created = new Date(d._createdAt);
  const updated = new Date(d.lastUpdated || d._updatedAt);
  return created < thirtyDaysAgo && updated >= thirtyDaysAgo;
});
for (const d of refreshedRecently.slice(0, 50)) {
  const created = d._createdAt?.slice(0, 10) ?? "?";
  const published = d.publishedDate?.slice(0, 10) ?? "?";
  const updated = d.lastUpdated?.slice(0, 10) ?? "?";
  console.log(`  created=${created}  published=${published}  updated=${updated}  /blog/${d.slug}`);
}
console.log(`\nTotal refreshed recently (created>30d ago, updated<30d ago): ${refreshedRecently.length}\n`);

console.log("=== ACTUAL stale refresh candidates ===");
console.log("Old _createdAt AND old lastUpdated — these are the genuine refresh candidates\n");
const sixtyDaysAgo = new Date(now);
sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
const stale = docs.filter(d => {
  const created = new Date(d._createdAt);
  const updated = new Date(d.lastUpdated || d._updatedAt);
  return created < sixtyDaysAgo && updated < sixtyDaysAgo;
}).sort((a, b) => new Date(a.lastUpdated || a._updatedAt) - new Date(b.lastUpdated || b._updatedAt));
for (const d of stale.slice(0, 30)) {
  const created = d._createdAt?.slice(0, 10) ?? "?";
  const published = d.publishedDate?.slice(0, 10) ?? "?";
  const updated = d.lastUpdated?.slice(0, 10) ?? "?";
  console.log(`  created=${created}  published=${published}  updated=${updated}  /blog/${d.slug}  (${d.contentLength ?? 0} chars)`);
}
console.log(`\nTotal stale candidates (both dates >60d): ${stale.length}\n`);
