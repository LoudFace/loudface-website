/**
 * Strip manual <div class="blog-table-wrap">...</div> from blog post
 * content fields. The page's extractTocAndAddIds re-wraps every <table>
 * automatically at render time — manual wrappers create a nested doubled
 * wrapper that breaks the corner-radius math (visible as white-gap
 * artifacts at the rounded corners).
 *
 * Strategy:
 *   - For each <div class="blog-table-wrap"> ... </div> that contains
 *     exactly one <table>, replace the entire wrapped block with just
 *     the inner <table>...</table>.
 *
 * Run: node scripts/strip-doubled-table-wrappers.mjs [--dry-run]
 */
import { createClient } from "@sanity/client";
import { readFileSync } from "fs";

const env = readFileSync(".env.local", "utf8").split("\n").reduce((a, l) => {
  const m = l.match(/^([^=]+)=(.*)$/); if (m) a[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, ""); return a;
}, {});

const DRY = process.argv.includes("--dry-run");

const client = createClient({
  projectId: "xjjjqhgt",
  dataset: "production",
  apiVersion: "2025-03-29",
  useCdn: false,
  token: env.SANITY_API_TOKEN,
});

const slugs = await client.fetch(`*[_type == "blogPost"]{ "slug": slug.current }`);

let patched = 0;
for (const { slug } of slugs) {
  const p = await client.fetch(`*[_type == "blogPost" && slug.current == "${slug}"][0]{ _id, "slug": slug.current, content }`);
  if (!p?.content) continue;
  if (!/<div class="blog-table-wrap"/.test(p.content)) continue;

  // Strip the wrapper. The pattern matches:
  //   <div class="blog-table-wrap"...>\n?<table>...</table>\n?</div>
  // and replaces with just the inner <table>...</table>.
  const cleaned = p.content.replace(
    /<div class="blog-table-wrap"[^>]*>\s*(<table\b[\s\S]*?<\/table>)\s*<\/div>/g,
    "$1"
  );

  const before = (p.content.match(/<div class="blog-table-wrap"/g) || []).length;
  const after = (cleaned.match(/<div class="blog-table-wrap"/g) || []).length;

  if (before === after) {
    console.log(`✗ ${slug} — regex didn't match (${before} wrappers remain)`);
    continue;
  }

  console.log(`✓ ${slug} — stripped ${before - after} manual wrapper(s)`);

  if (!DRY) {
    await client
      .patch(p._id)
      .set({ content: cleaned, lastUpdated: new Date().toISOString() })
      .commit();
  }
  patched++;
}

console.log(`\n${DRY ? "DRY RUN — " : ""}Patched ${patched} post(s).`);
