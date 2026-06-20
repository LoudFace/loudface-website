#!/usr/bin/env node
/**
 * One-off SEO title + meta rewrite for high-impression, zero-click pages.
 *
 * Updates Sanity seoPage and blogPost docs with titles/metas designed to
 * earn the click at our existing average position. Prints before/after.
 *
 * Run: node scripts/update-seo-titles.mjs
 */

import { createClient } from 'next-sanity';
import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '..', '.env.local') });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !dataset || !token) {
  console.error('Missing Sanity env. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_TOKEN.');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2025-03-29',
  useCdn: false,
  token,
});

// --- Updates: keep titles ≤ 48 chars (template appends " | LoudFace"), descriptions 120-160. ---
const seoPageUpdates = [
  {
    slug: 'fintech',
    metaTitle: 'Fintech SEO: Compliance-Safe B2B Growth',
    metaDescription: 'Compliance-safe SEO for fintech, banks, and consumer financial apps. We rank for regulated terms while AI engines cite your brand as the trusted source.',
  },
  {
    slug: 'healthcare',
    metaTitle: 'Healthcare SEO: HIPAA-Aware Growth',
    metaDescription: 'HIPAA-aware healthcare SEO for telehealth, DTC health, and clinics. Get found on Google + cited in ChatGPT for high-intent patient and provider queries.',
  },
  {
    slug: 'startups',
    metaTitle: 'Startup SEO: Zero to Pipeline in 90 Days',
    metaDescription: 'SEO for early-stage startups. We build pipeline from zero in 90 days using SEO, AEO, and CRO as one system. No 18-month plans, no vanity traffic.',
  },
  {
    slug: 'ecommerce',
    metaTitle: 'Ecommerce SEO: Revenue-Driven Growth',
    metaDescription: 'Ecommerce SEO for DTC and B2B brands. We rank product, category, and content pages while AI engines cite your store for high-intent shopping queries.',
  },
];

const blogPostUpdates = [
  {
    slug: 'answer-engine-optimization-guide-2026',
    metaTitle: 'AEO 2026: Cited by ChatGPT, Perplexity & Gemini',
    metaDescription: 'How B2B SaaS brands get cited inside ChatGPT, Perplexity, Claude, and Google AI Overviews in 2026. Tactical playbook with metrics, examples, and a citation audit.',
  },
  {
    slug: 'webflow-agency-pricing',
    metaTitle: 'Webflow Agency Pricing: $1,500 to $50,000+',
    metaDescription: 'Real Webflow agency pricing for 2026 — quotes from $1,500 starter sites to $50,000+ enterprise builds. Benchmarking by scope, agency tier, and engagement type.',
  },
  {
    slug: 'best-aeo-agencies-b2b-saas-2026',
    metaTitle: 'Best AEO Agencies for B2B SaaS in 2026 (Ranked)',
    metaDescription: 'The 10 best Answer Engine Optimization (AEO) agencies for B2B SaaS in 2026, ranked by methodology, client outcomes, and pricing transparency. Free audit included.',
  },
];

function sanitize(s) {
  return s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"');
}

async function patchType(docType, updates) {
  console.log(`\n=== ${docType} ===`);
  const slugs = updates.map((u) => u.slug);
  const docs = await client.fetch(
    `*[_type == $type && slug.current in $slugs]{_id, "slug": slug.current, name, metaTitle, metaDescription}`,
    { type: docType, slugs },
  );

  if (docs.length === 0) {
    console.warn(`  No matching docs found for ${docType}. Slugs queried: ${slugs.join(', ')}`);
    return;
  }

  for (const update of updates) {
    const doc = docs.find((d) => d.slug === update.slug);
    if (!doc) {
      console.warn(`  [skip] ${update.slug} — not found in Sanity`);
      continue;
    }

    const beforeTitle = doc.metaTitle ?? '(empty)';
    const beforeDesc = doc.metaDescription ?? '(empty)';
    const newTitle = sanitize(update.metaTitle);
    const newDesc = sanitize(update.metaDescription);

    if (beforeTitle === newTitle && beforeDesc === newDesc) {
      console.log(`  [no-op] ${update.slug}`);
      continue;
    }

    console.log(`  [patch] ${update.slug}`);
    console.log(`    title  : "${beforeTitle}"  →  "${newTitle}" (${newTitle.length} chars)`);
    console.log(`    desc   : "${beforeDesc.slice(0, 60)}..."`);
    console.log(`           → "${newDesc.slice(0, 60)}..." (${newDesc.length} chars)`);

    await client.patch(doc._id).set({ metaTitle: newTitle, metaDescription: newDesc }).commit();
  }
}

async function main() {
  console.log(`Sanity project: ${projectId} / ${dataset}`);
  await patchType('seoPage', seoPageUpdates);
  await patchType('blogPost', blogPostUpdates);
  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
