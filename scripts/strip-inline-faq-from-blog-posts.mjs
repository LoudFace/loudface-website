#!/usr/bin/env node
// scripts/strip-inline-faq-from-blog-posts.mjs
//
// Fixes the duplicate-FAQ render: when a blogPost has both faq[] populated
// AND its content HTML still contains an inline FAQ H2 + H3 section,
// the template renders BOTH (inline body + dedicated <FAQ> component).
//
// This script: for every blogPost where count(faq) > 0, strips the inline
// FAQ section from content (the <h2>FAQ|Frequently asked questions</h2>
// down to the next <h2> or end of content) and writes the cleaned content
// back. The dedicated <FAQ> component continues rendering from faq[].
//
// Usage:
//   node scripts/strip-inline-faq-from-blog-posts.mjs           → dry-run preview
//   node scripts/strip-inline-faq-from-blog-posts.mjs --apply   → commit changes

import { createClient } from '@sanity/client';
import { readFileSync } from 'fs';

const env = readFileSync('.env.local','utf8').split('\n').reduce((a,l)=>{
  const m = l.match(/^([^=]+)=(.*)$/);
  if (m) a[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g,'');
  return a;
},{});

const APPLY = process.argv.includes('--apply');

const c = createClient({
  projectId: 'xjjjqhgt',
  dataset: 'production',
  apiVersion: '2025-03-29',
  useCdn: false,
  token: env.SANITY_API_TOKEN || process.env.SANITY_API_TOKEN
});

// Match a FAQ H2 (any of: FAQ, FAQs, Frequently asked questions, Frequently Asked Questions, etc.)
// and everything from there up to (but not including) the next <h2> or end of content.
const FAQ_SECTION_PATTERN = /<h2\b[^>]*>\s*(?:FAQ|FAQs|Frequently\s+[Aa]sked\s+[Qq]uestions?)\s*<\/h2>[\s\S]*?(?=<h2\b|$)/i;

const rows = await c.fetch(`
  *[_type == "blogPost" && count(faq) > 0] {
    _id,
    _rev,
    "slug": slug.current,
    name,
    content,
    "faqCount": count(faq)
  } | order(publishedDate desc)
`);

console.log(`Mode: ${APPLY ? 'APPLY (will write)' : 'DRY-RUN (no writes)'}`);
console.log(`Candidates with faq[] populated: ${rows.length}`);
console.log('');

let affected = 0;
const mutations = [];

for (const r of rows) {
  if (!r.content) continue;
  const match = r.content.match(FAQ_SECTION_PATTERN);
  if (!match) continue;

  const cleaned = r.content.replace(FAQ_SECTION_PATTERN, '').trim();
  const beforeChars = r.content.length;
  const afterChars = cleaned.length;
  const stripped = beforeChars - afterChars;

  affected++;
  console.log(` ${r.slug}`);
  console.log(`   faq[]: ${r.faqCount}   stripped: ${stripped} chars   (before: ${beforeChars} → after: ${afterChars})`);
  console.log(`   matched H2: "${match[0].slice(0, 80).replace(/\n/g,'\\n')}…"`);
  console.log('');

  mutations.push({
    patch: {
      id: r._id,
      ifRevisionID: r._rev,
      set: { content: cleaned }
    }
  });
}

console.log(`Total affected: ${affected} of ${rows.length}`);
console.log('');

if (!APPLY) {
  console.log('— DRY RUN — re-run with --apply to commit changes —');
  process.exit(0);
}

if (affected === 0) {
  console.log('Nothing to do.');
  process.exit(0);
}

// POST mutations to Sanity
const res = await fetch(`https://xjjjqhgt.api.sanity.io/v2025-03-29/data/mutate/production`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${env.SANITY_API_TOKEN || process.env.SANITY_API_TOKEN}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ mutations })
});

const result = await res.json();
if (!res.ok || result.error) {
  console.error('FAILED:', JSON.stringify(result, null, 2));
  process.exit(1);
}

console.log(`Patched ${result.results?.length || mutations.length} docs successfully.`);
console.log('Sanity webhook will revalidate each affected URL via /api/revalidate.');
