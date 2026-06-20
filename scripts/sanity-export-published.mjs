#!/usr/bin/env node
// Exports every published blogPost + caseStudy from Sanity as a JSON snapshot.
// Used by /refresh-calendar to keep the Notion content calendar in sync with Sanity.
//
// Run with: node scripts/sanity-export-published.mjs
// Output:   scripts/sanity-published-snapshot.json

import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@sanity/client';

const ROOT = '/Users/arnel/Code Projects/LoudFace Agency/loudface-website';

const env = Object.fromEntries(
  fs.readFileSync(path.join(ROOT, '.env.local'), 'utf8')
    .split('\n')
    .map(l => l.trim().match(/^([A-Z_]+)=(.*)$/))
    .filter(Boolean)
    .map(m => [m[1], m[2]])
);

const client = createClient({
  projectId: 'xjjjqhgt',
  dataset: 'production',
  apiVersion: '2025-03-29',
  useCdn: false,
  token: env.SANITY_API_TOKEN,
});

const SITE = 'https://www.loudface.co';

async function main() {
  const blogPosts = await client.fetch(`
    *[_type == "blogPost" && defined(slug.current) && !(_id in path("drafts.**"))] | order(publishedDate desc) {
      _id,
      "type": "blogPost",
      "slug": slug.current,
      "title": name,
      "publishedDate": publishedDate,
      "lastUpdated": lastUpdated,
      "metaDescription": metaDescription,
      "excerpt": excerpt
    }
  `);

  const caseStudies = await client.fetch(`
    *[_type == "caseStudy" && defined(slug.current) && !(_id in path("drafts.**"))] | order(publishedDate desc) {
      _id,
      "type": "caseStudy",
      "slug": slug.current,
      "title": name,
      "publishedDate": publishedDate,
      "lastUpdated": lastUpdated,
      "metaDescription": metaDescription,
      "excerpt": excerpt
    }
  `);

  const all = [
    ...blogPosts.map(p => ({ ...p, url: `${SITE}/blog/${p.slug}`, contentType: 'Blog Post' })),
    ...caseStudies.map(p => ({ ...p, url: `${SITE}/case-studies/${p.slug}`, contentType: 'Case Study' })),
  ];

  const outPath = path.join(ROOT, 'scripts', 'sanity-published-snapshot.json');
  fs.writeFileSync(outPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    counts: { blogPosts: blogPosts.length, caseStudies: caseStudies.length, total: all.length },
    posts: all,
  }, null, 2));

  console.log(`Exported ${all.length} posts (${blogPosts.length} blog + ${caseStudies.length} case studies)`);
  console.log(`Snapshot: ${outPath}`);
}

main().catch(err => { console.error(err); process.exit(1); });
