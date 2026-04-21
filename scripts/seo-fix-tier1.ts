/**
 * Tier 1 SEO fixer — safe, deterministic, no judgment calls.
 *
 *   1. thumbnail.alt: default to the post name when missing. Sensible fallback,
 *      always preferable to an empty alt attribute.
 *   2. lastUpdated: default to publishedDate when missing. Fills schema.org
 *      `dateModified` so the article schema validates.
 *   3. timeToRead: compute "X min read" from word count (225 WPM) when missing.
 *
 * Run: npx tsx scripts/seo-fix-tier1.ts
 */

import { sanityClient } from './visuals/lib/sanity';

interface Row {
  _id: string;
  slug: string;
  name: string;
  content?: string;
  publishedDate?: string;
  lastUpdated?: string;
  timeToRead?: string;
  thumbnail?: { _type: 'image'; asset: { _type: 'reference'; _ref: string }; alt?: string };
}

const WPM = 225;

function wordCount(html: string): number {
  if (!html) return 0;
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.split(' ').filter(Boolean).length;
}

function calcTimeToRead(html?: string): string | null {
  if (!html) return null;
  const wc = wordCount(html);
  if (wc === 0) return null;
  const minutes = Math.max(1, Math.round(wc / WPM));
  return `${minutes} min read`;
}

async function main() {
  const client = sanityClient();

  const rows = await client.fetch<Row[]>(
    `*[_type == "blogPost" && !(_id in path("drafts.**"))]{
      _id,
      "slug": slug.current,
      name,
      content,
      publishedDate,
      lastUpdated,
      timeToRead,
      thumbnail
    }`,
  );

  let altFixed = 0;
  let lastUpdatedFixed = 0;
  let timeToReadFixed = 0;

  for (const row of rows) {
    const patches: Record<string, unknown> = {};

    // 1. Thumbnail alt: fill with post.name when missing/blank. Only patches
    //    when there's actually a thumbnail image to apply alt to.
    if (row.thumbnail?.asset && (!row.thumbnail.alt || !row.thumbnail.alt.trim())) {
      patches.thumbnail = {
        ...row.thumbnail,
        alt: row.name,
      };
      altFixed++;
    }

    // 2. lastUpdated default to publishedDate when missing.
    if (!row.lastUpdated && row.publishedDate) {
      patches.lastUpdated = row.publishedDate;
      lastUpdatedFixed++;
    }

    // 3. timeToRead computed from word count when missing.
    if (!row.timeToRead) {
      const ttr = calcTimeToRead(row.content);
      if (ttr) {
        patches.timeToRead = ttr;
        timeToReadFixed++;
      }
    }

    if (Object.keys(patches).length === 0) continue;

    const changed = Object.keys(patches).join(', ');
    console.log(`  · ${row.slug}: ${changed}`);
    await client.patch(row._id).set(patches).commit();
  }

  console.log(`\n━━━ Tier 1 summary ━━━`);
  console.log(`  thumbnail.alt set:  ${altFixed}`);
  console.log(`  lastUpdated set:    ${lastUpdatedFixed}`);
  console.log(`  timeToRead set:     ${timeToReadFixed}`);
  console.log(`  Total field writes: ${altFixed + lastUpdatedFixed + timeToReadFixed}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
