import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
const env = readFileSync(".env.local", "utf8").split("\n").reduce((a, l) => { const m = l.match(/^([^=]+)=(.*)$/); if (m) a[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, ""); return a; }, {});
const client = createClient({ projectId: "xjjjqhgt", dataset: "production", apiVersion: "2025-03-29", useCdn: false, token: env.SANITY_API_TOKEN });

// Pull every published blogPost with slug + lastUpdated, sorted by stale-first
const docs = await client.fetch(`*[_type == "blogPost" && !(_id in path("drafts.**"))] | order(lastUpdated asc){
  "slug": slug.current,
  name,
  lastUpdated,
  "contentLength": length(content)
}`);

console.log(`Total published blogPosts: ${docs.length}\n`);
console.log("=== Stalest 25 (oldest lastUpdated first) ===\n");
for (const d of docs.slice(0, 25)) {
  const date = d.lastUpdated ? d.lastUpdated.slice(0, 10) : "never";
  console.log(`[${date}] /blog/${d.slug} — ${d.name?.slice(0, 80) ?? "(no name)"} (${d.contentLength ?? 0} chars)`);
}

console.log("\n=== Cohort markers ===\n");
const byYear = {};
for (const d of docs) {
  const y = d.lastUpdated?.slice(0, 7) ?? "never";
  byYear[y] = (byYear[y] ?? 0) + 1;
}
for (const [y, n] of Object.entries(byYear).sort()) {
  console.log(`${y}: ${n} posts`);
}
