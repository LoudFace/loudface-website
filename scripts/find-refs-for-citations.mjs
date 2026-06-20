/**
 * Look up the author + category references we need for the new blog post.
 * - Author: Arnel Bukva (teamMember slug `arnel-bukva` or similar)
 * - Category: similar pieces use which category? Sample 3 founder bylines.
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

// Find Arnel
const authors = await client.fetch(`*[_type == "teamMember" && (name match "Arnel*" || slug.current match "arnel*")][0..2]{ _id, name, "slug": slug.current }`);
console.log("--- AUTHORS ---");
console.log(JSON.stringify(authors, null, 2));

// What categories do similar pieces use?
const similar = await client.fetch(`*[_type == "blogPost" && (slug.current match "*share-of-answer*" || slug.current match "*how-to-structure*" || slug.current match "*citation-authority*" || slug.current match "*aeo-strategies*")]{
  name, "slug": slug.current, "category": category->{_id, name, "slug": slug.current}
}`);
console.log("\n--- SIMILAR PIECES ---");
console.log(JSON.stringify(similar, null, 2));

// All categories — let me see them
const cats = await client.fetch(`*[_type == "category"]{ _id, name, "slug": slug.current }`);
console.log("\n--- ALL CATEGORIES ---");
console.log(JSON.stringify(cats, null, 2));

// Does the slug already exist?
const conflict = await client.fetch(`*[_type == "blogPost" && slug.current == "how-long-do-ai-citations-take"]{ _id, name, publishedDate }`);
console.log("\n--- SLUG CONFLICT CHECK ---");
console.log(JSON.stringify(conflict, null, 2));
