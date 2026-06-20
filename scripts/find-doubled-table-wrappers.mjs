/**
 * Scan all blog posts in Sanity for the doubled-table-wrapper bug.
 */
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

// First get the count + slugs to know what we're dealing with
const slugs = await client.fetch(`*[_type == "blogPost"]{ "slug": slug.current }`);
console.log(`Total blog posts: ${slugs.length}`);

let hits = 0;
const dirty = [];

// Fetch one at a time to avoid the JSON-parse bug on large responses
for (const { slug } of slugs) {
  try {
    const p = await client.fetch(`*[_type == "blogPost" && slug.current == "${slug}"][0]{ _id, "slug": slug.current, content }`);
    if (!p?.content) continue;
    const matches = [...p.content.matchAll(/<div class="blog-table-wrap"[^>]*>/g)];
    if (matches.length > 0) {
      hits++;
      dirty.push({ slug: p.slug, _id: p._id, count: matches.length });
      console.log(`✗ ${p.slug} — ${matches.length} manual wrapper(s)`);
    }
  } catch (e) {
    console.log(`  ERR ${slug}: ${e.message}`);
  }
}

console.log(`\nScanned ${slugs.length} blog posts. ${hits} have manually-wrapped tables.`);
