import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
const env = readFileSync(".env.local", "utf8").split("\n").reduce((a, l) => { const m = l.match(/^([^=]+)=(.*)$/); if (m) a[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, ""); return a; }, {});
const client = createClient({ projectId: "xjjjqhgt", dataset: "production", apiVersion: "2025-03-29", useCdn: false, token: env.SANITY_API_TOKEN });

const docs = await client.fetch(`*[_type == "blogPost" && !(_id in path("drafts.**"))]{
  "slug": slug.current,
  name,
  publishedDate,
  lastUpdated,
  _createdAt,
  _updatedAt,
  "contentLength": length(content)
}`);

console.log(`Total published blogPosts: ${docs.length}\n`);
console.log(`Note: _createdAt = 2026-03-29 for nearly all pieces (Sanity migration date), so I'm using lastUpdated + publishedDate as the real signal.\n`);

// Group by lastUpdated cohort
const cohorts = { fresh: [], refreshed: [], stale: [] };
const now = new Date("2026-05-16");
const fourteenDaysAgo = new Date(now); fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
const thirtyDaysAgo = new Date(now); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

for (const d of docs) {
  const updated = new Date(d.lastUpdated || d._updatedAt);
  // Did the piece get touched recently?
  if (updated >= fourteenDaysAgo) cohorts.refreshed.push(d);
  else if (updated >= thirtyDaysAgo) cohorts.refreshed.push(d); // 14-30 days ago = still recent
  else cohorts.stale.push(d);
}

// Sort each by lastUpdated descending
cohorts.refreshed.sort((a, b) => new Date(b.lastUpdated || b._updatedAt) - new Date(a.lastUpdated || a._updatedAt));
cohorts.stale.sort((a, b) => new Date(a.lastUpdated || a._updatedAt) - new Date(b.lastUpdated || b._updatedAt));

console.log(`=== Pieces TOUCHED in last 30 days (DO NOT refresh): ${cohorts.refreshed.length}`);
for (const d of cohorts.refreshed.slice(0, 20)) {
  const updated = d.lastUpdated?.slice(0, 10) ?? "?";
  const published = d.publishedDate?.slice(0, 10) ?? "?";
  console.log(`  updated=${updated}  pub=${published}  /blog/${d.slug}`);
}
if (cohorts.refreshed.length > 20) console.log(`  ... and ${cohorts.refreshed.length - 20} more`);

console.log(`\n=== Pieces NOT touched in 30+ days (genuine refresh candidates): ${cohorts.stale.length}`);
for (const d of cohorts.stale) {
  const updated = d.lastUpdated?.slice(0, 10) ?? "?";
  const published = d.publishedDate?.slice(0, 10) ?? "?";
  console.log(`  updated=${updated}  pub=${published}  /blog/${d.slug}  (${d.contentLength ?? 0} chars)`);
}

console.log(`\n=== Pieces with the OLDEST publishedDate that haven't been touched recently ===`);
const stalePubDate = cohorts.stale
  .filter(d => d.publishedDate)
  .sort((a, b) => new Date(a.publishedDate) - new Date(b.publishedDate));
for (const d of stalePubDate) {
  const updated = d.lastUpdated?.slice(0, 10) ?? "?";
  const published = d.publishedDate?.slice(0, 10) ?? "?";
  console.log(`  pub=${published}  updated=${updated}  /blog/${d.slug}`);
}
