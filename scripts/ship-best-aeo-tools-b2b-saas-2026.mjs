#!/usr/bin/env node
/**
 * Ship "Best AEO tools for B2B SaaS in 2026 (Ranked)" to Sanity production.
 * Run from project root: node scripts/ship-best-aeo-tools-b2b-saas-2026.mjs
 *
 * Source: Notion calendar entry 360b63394d1081ee8658ecafb06b8106
 * Loop step: /ship-content. The Sanity webhook chain (revalidate + IndexNow)
 * will fire automatically when this commit lands.
 *
 * 2026-05-15 rewrite: anti-slop pass. Cut 6 em-dashes in prose down to 0,
 * cut "Not X, Y" patterns from 2 to 1 (kept the "tool-users, not tool-sellers"
 * line; rewrote the BrandRank one). Body content held to 1,481 prose words.
 * Linter passes clean (no blockers, no should-fix).
 */

import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@sanity/client';

const ROOT = '/Users/arnel/Code Projects/LoudFace Agency/loudface-website';

// Load .env.local
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

if (!env.SANITY_API_TOKEN) {
  console.error('Missing SANITY_API_TOKEN');
  process.exit(1);
}

const SLUG = 'best-aeo-tools-for-b2b-saas-2026';
const DOC_ID = `blogPost-${SLUG}`;

// Body HTML lives in /tmp/aeo-tools-rewrite.html so the linter has a stable
// target. Read it from disk at ship time so the on-disk file is the source
// of truth for what shipped.
const content = fs.readFileSync('/tmp/aeo-tools-rewrite.html', 'utf8');

const faqs = [
  { _type: 'object', _key: 'faq0', question: 'Which AEO tool should I start with in 2026?', answer: "Peec. The combination of cross-LLM coverage, prompt-portfolio thinking, and competitor tracking is the strongest entry point. If pricing is a blocker, start with Otterly's $29 Lite tier for citation auditing and add a tracker later." },
  { _type: 'object', _key: 'faq1', question: "What's the difference between AEO tools and SEO tools?", answer: "AEO tools track citations in LLM answers (ChatGPT, Claude, Perplexity, Gemini). SEO tools track positions in search engines (Google, Bing). The data sources differ, the metrics differ, the optimization moves differ. Some vendors bundle both (Ahrefs' Rankscale, Semrush's AI tools), but treat the AEO module as the secondary product." },
  { _type: 'object', _key: 'faq2', question: 'How much should a B2B SaaS company spend on AEO tools in 2026?', answer: "Most B2B SaaS teams should expect $300–800/month on AEO tooling once the program is running. Below that, you're under-tooled. Above that, you're probably over-tooled relative to the content team that has to act on the data." },
  { _type: 'object', _key: 'faq3', question: "Do I need an AEO tool if I'm already tracking SEO?", answer: "Yes. AEO is a separate signal from SEO. Pages can rank #3 on Google and never be cited by ChatGPT. Different mechanics, different inputs. If your buyers run their first category search inside an LLM (most B2B SaaS buyers in 2026 do), SEO data alone misses the layer where shortlists form." },
  { _type: 'object', _key: 'faq4', question: 'Can I do AEO without any tools?', answer: "For a single brand tracking under 10 prompts, yes. Manually, in a spreadsheet, with weekly LLM checks. Past that threshold, the labor cost of manual tracking exceeds tool cost. Most B2B SaaS teams hit the threshold within a quarter of starting." },
  { _type: 'object', _key: 'faq5', question: 'How accurate are AEO tools at tracking LLM citations?', answer: "Accurate enough to make decisions, not literal. LLM responses vary across sessions, regions, and model updates. A tool that says you're cited 12% of the time on a given prompt means \"roughly 12% in our sample,\" not \"exactly 12% of all queries globally.\" Treat trends as more reliable than point estimates." },
  { _type: 'object', _key: 'faq6', question: 'Which AEO tools have first-party usage data you can trust?', answer: "Agencies that actually run AEO programs in production (LoudFace among them) are the most reliable source. They're using these tools to make daily decisions, not just reviewing them. Vendor case studies are useful but apply the usual skepticism. Agency-specific subreddits are surprisingly honest." },
  { _type: 'object', _key: 'faq7', question: 'Will these tools still matter in 2027?', answer: "Probably consolidated. The pure-play AEO category is young and over-tooled. Expect M&A and pricing pressure through 2026 into 2027. Buy on quarterly contracts where you can. Long annual lock-ins in a moving category are a bad trade." },
];

const doc = {
  _id: DOC_ID,
  _type: 'blogPost',
  name: 'Best AEO tools for B2B SaaS in 2026 (Ranked)',
  slug: { _type: 'slug', current: SLUG },
  metaTitle: 'Best AEO Tools for B2B SaaS in 2026: 6 Ranked',
  metaDescription: 'The 6 AEO tools worth paying for in 2026: Peec, Otterly, AthenaHQ, Profound, Rankscale, BrandRank. Verified pricing, honest tradeoffs, first-party data.',
  excerpt: "An honest ranking of the AEO tools we actually use at LoudFace: Peec, Otterly, AthenaHQ, Profound, Rankscale, BrandRank, with verified pricing and tradeoffs.",
  content,
  faq: faqs,
  category: { _ref: 'imported-category-67bced81857d76ee5b3795b1', _type: 'reference' },
  author: { _ref: 'imported-teamMember-68d81a1688d5ed0743d0b8b6', _type: 'reference' },
  publishedDate: '2026-05-14T13:00:00.000Z',
  lastUpdated: '2026-05-15T12:00:00.000Z',
  featured: false,
  timeToRead: '10 min read',
  // Preserve the existing hero image asset
  thumbnail: {
    _type: 'image',
    asset: {
      _ref: 'image-9d8639da2d38ebac6d292036a29c952cd9f725ce-1088x608-png',
      _type: 'reference',
    },
  },
};

async function main() {
  console.log(`Shipping ${DOC_ID} to Sanity...`);
  await client.createOrReplace(doc);
  console.log(`✓ Sanity document created/replaced`);
  console.log(`Live URL will be: https://www.loudface.co/blog/${SLUG}`);
  console.log('Sanity webhook → revalidate → IndexNow chain firing now. Wait ~5s, then curl to verify.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
