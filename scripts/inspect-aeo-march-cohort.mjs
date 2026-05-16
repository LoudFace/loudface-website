import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
const env = readFileSync(".env.local", "utf8").split("\n").reduce((a, l) => { const m = l.match(/^([^=]+)=(.*)$/); if (m) a[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, ""); return a; }, {});
const client = createClient({ projectId: "xjjjqhgt", dataset: "production", apiVersion: "2025-03-29", useCdn: false, token: env.SANITY_API_TOKEN });

const slugs = [
  "machine-to-machine-marketing",
  "how-to-become-a-trusted-llm-source",
  "zero-click-content-that-drives-revenue",
  "share-of-answer",
  "ai-first-content-architecture",
  "how-to-structure-content-for-ai-extraction",
  "seo-survival-playbook",
  "eeat-in-the-age-of-ai",
  "answer-engine-optimization-guide-2026",
];

for (const slug of slugs) {
  const doc = await client.fetch(`*[_type == "blogPost" && slug.current == $slug][0]{_id, name, metaTitle, metaDescription, lastUpdated, "len": length(content)}`, { slug });
  if (!doc) { console.log(`[MISSING] /blog/${slug}\n`); continue; }
  console.log(`\n=== /blog/${slug} ===`);
  console.log(`  _id: ${doc._id}`);
  console.log(`  name: ${doc.name}`);
  console.log(`  metaTitle: ${doc.metaTitle}`);
  console.log(`  metaDescription: ${doc.metaDescription?.slice(0,120)}...`);
  console.log(`  lastUpdated: ${doc.lastUpdated?.slice(0,10)}`);
  console.log(`  content length: ${doc.len}`);
}
