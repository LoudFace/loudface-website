import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
const env = readFileSync(".env.local", "utf8").split("\n").reduce((a, l) => { const m = l.match(/^([^=]+)=(.*)$/); if (m) a[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, ""); return a; }, {});
const client = createClient({ projectId: "xjjjqhgt", dataset: "production", apiVersion: "2025-03-29", useCdn: false, token: env.SANITY_API_TOKEN });

const candidates = [
  "best-aeo-software",
  "pitfalls-of-choosing-wrong-webflow-vendor",
  "top-webflow-agency",
  "why-choose-loudface-webflow-agency",
  "how-to-choose-the-right-webflow-agency-for-your-brand",
  "ai-enhanced-webflow-development",
  "top-10-webflow-agency-templates",
  "seo-vs-aeo-for-webflow",
  "aeo-for-webflow-how-to-make-your-site-discoverable-by-ai-search-engines",
];

for (const slug of candidates) {
  const doc = await client.fetch(`*[_type == "blogPost" && slug.current == $slug][0]{_id, name, metaTitle, metaDescription, lastUpdated, "len": length(content)}`, { slug });
  if (!doc) {
    console.log(`[MISSING] /blog/${slug}`);
    continue;
  }
  console.log(`\n=== /blog/${slug} ===`);
  console.log(`  _id: ${doc._id}`);
  console.log(`  name: ${doc.name}`);
  console.log(`  metaTitle: ${doc.metaTitle}`);
  console.log(`  metaDescription: ${doc.metaDescription?.slice(0,100)}...`);
  console.log(`  lastUpdated: ${doc.lastUpdated?.slice(0,10)}`);
  console.log(`  content length: ${doc.len}`);
}
