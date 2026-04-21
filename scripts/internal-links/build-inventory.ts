/**
 * Build the inventory JSON for the internal-link fix.
 *
 * Outputs `scripts/internal-links/inventory.json` with:
 *   - allPosts: lightweight summary of every published blogPost
 *       (slug, name, excerpt, categoryName) — the pool agents pick link
 *       targets FROM.
 *   - targets: the subset with < 3 internal links, each with its full
 *       HTML content — these are the posts agents rewrite.
 *
 * Agents read this file, pick target links for each source post, and
 * write patch JSON files to scripts/internal-links/patches/<slug>.json.
 *
 * Run: npx tsx scripts/internal-links/build-inventory.ts
 */

import fs from 'fs';
import path from 'path';
import { sanityClient } from '../visuals/lib/sanity';

interface PostRow {
  _id: string;
  slug: string;
  name: string;
  excerpt?: string;
  content?: string;
  categoryName?: string;
}

interface AllPostSummary {
  slug: string;
  name: string;
  excerpt: string;
  categoryName: string;
}

interface TargetPost extends AllPostSummary {
  currentInternalLinks: number;
  content: string;
}

interface Inventory {
  generatedAt: string;
  allPosts: AllPostSummary[];
  targets: TargetPost[];
}

function countInternalLinks(html: string): number {
  const matches = html.match(/href="([^"]+)"/g) ?? [];
  return matches.filter((m) =>
    /href="(https?:\/\/(www\.)?loudface\.co[^"]*|\/[^"]*)/.test(m),
  ).length;
}

async function main() {
  const client = sanityClient();

  const rows = await client.fetch<PostRow[]>(
    `*[_type == "blogPost" && !(_id in path("drafts.**"))]{
      _id,
      "slug": slug.current,
      name,
      excerpt,
      content,
      "categoryName": category->name
    }`,
  );

  const allPosts: AllPostSummary[] = rows
    .filter((r) => r.slug && r.name)
    .map((r) => ({
      slug: r.slug!,
      name: r.name!,
      excerpt: (r.excerpt ?? '').trim(),
      categoryName: r.categoryName ?? '(uncategorized)',
    }));

  const targets: TargetPost[] = rows
    .filter((r) => r.slug && r.content && r.name)
    .map((r) => ({
      slug: r.slug!,
      name: r.name!,
      excerpt: (r.excerpt ?? '').trim(),
      categoryName: r.categoryName ?? '(uncategorized)',
      content: r.content!,
      currentInternalLinks: countInternalLinks(r.content!),
    }))
    .filter((p) => p.currentInternalLinks < 3);

  const inventory: Inventory = {
    generatedAt: new Date().toISOString(),
    allPosts: allPosts.sort((a, b) => a.slug.localeCompare(b.slug)),
    targets: targets.sort((a, b) => a.currentInternalLinks - b.currentInternalLinks),
  };

  const outPath = path.resolve(process.cwd(), 'scripts/internal-links/inventory.json');
  fs.writeFileSync(outPath, JSON.stringify(inventory, null, 2));

  console.log(`→ ${allPosts.length} total posts in the catalog`);
  console.log(`→ ${targets.length} targets with < 3 internal links`);
  const by0 = targets.filter((t) => t.currentInternalLinks === 0).length;
  const by1 = targets.filter((t) => t.currentInternalLinks === 1).length;
  const by2 = targets.filter((t) => t.currentInternalLinks === 2).length;
  console.log(`    0 links: ${by0}   1 link: ${by1}   2 links: ${by2}`);
  console.log(`✓ Saved → ${path.relative(process.cwd(), outPath)}`);

  // Print the 40 target slugs grouped into batches so we can hand each to
  // a parallel agent. 10 per batch = 4 agents total.
  const BATCH_SIZE = 10;
  console.log(`\nBatches (for parallel agents):`);
  for (let i = 0; i < targets.length; i += BATCH_SIZE) {
    const batch = targets.slice(i, i + BATCH_SIZE);
    console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.map((b) => b.slug).join(', ')}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
