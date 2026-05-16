import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
const env = readFileSync(".env.local", "utf8").split("\n").reduce((a, l) => { const m = l.match(/^([^=]+)=(.*)$/); if (m) a[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, ""); return a; }, {});
const client = createClient({ projectId: "xjjjqhgt", dataset: "production", apiVersion: "2025-03-29", useCdn: false, token: env.SANITY_API_TOKEN });

for (const slug of ["ai-enhanced-webflow-development", "webflow-ai-revolution"]) {
  const doc = await client.fetch(`*[_type == "blogPost" && slug.current == $slug][0]{_id, name, metaTitle, metaDescription, lastUpdated, content}`, { slug });
  if (!doc) { console.log(`MISSING /blog/${slug}\n`); continue; }
  console.log(`=== /blog/${slug} ===`);
  console.log(`  _id: ${doc._id}`);
  console.log(`  name: ${doc.name}`);
  console.log(`  metaTitle: ${doc.metaTitle}`);
  console.log(`  metaDescription: ${doc.metaDescription}`);
  console.log(`  lastUpdated: ${doc.lastUpdated}`);
  console.log(`  --- first 1000 chars of content ---`);
  console.log(`  ${doc.content?.slice(0, 1000)?.replace(/\n/g, '\n  ')}`);
  console.log();
}
