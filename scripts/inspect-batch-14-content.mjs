import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
const env = readFileSync(".env.local", "utf8").split("\n").reduce((a, l) => { const m = l.match(/^([^=]+)=(.*)$/); if (m) a[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, ""); return a; }, {});
const client = createClient({ projectId: "xjjjqhgt", dataset: "production", apiVersion: "2025-03-29", useCdn: false, token: env.SANITY_API_TOKEN });

const slugs = [
  "machine-to-machine-marketing",
  "zero-click-content-that-drives-revenue",
  "ai-first-content-architecture",
  "seo-survival-playbook",
];

for (const slug of slugs) {
  const doc = await client.fetch(`*[_type == "blogPost" && slug.current == $slug][0]{_id, name, metaTitle, metaDescription, excerpt, content}`, { slug });
  console.log(`\n=== /blog/${slug} ===`);
  console.log(`name: ${doc.name}`);
  console.log(`metaTitle: ${doc.metaTitle}`);
  console.log(`metaDescription: ${doc.metaDescription}`);
  console.log(`excerpt: ${doc.excerpt?.slice(0, 200)}...`);
  console.log(`\n--- first 1500 chars of content ---`);
  console.log(doc.content?.slice(0, 1500));
}
