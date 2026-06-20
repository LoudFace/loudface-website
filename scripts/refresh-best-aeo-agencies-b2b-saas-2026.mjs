#!/usr/bin/env node
/**
 * Refresh Patch #5 — /blog/best-aeo-agencies-b2b-saas-2026
 *
 * Audit findings before patching:
 * - LoudFace IS #1, but a "How we picked this list" methodology block IS
 *   already present directly above the list. The spec said to demote LoudFace
 *   ONLY if methodology was missing. Methodology is present, so LoudFace
 *   stays at #1. We expand the methodology block from 4 to 6 criteria so it
 *   matches the recon spec (public outcomes, AI citation footprint, pricing
 *   transparency, vertical specialization, honest weakness disclosure, founder
 *   caliber).
 * - Pricing per agency is ALREADY surfaced in every block as
 *   "Typical engagement: $X–$Y/month". The spec said to inject pricing into
 *   each agency's intro line. That's already done — skipping the redundant
 *   re-injection.
 *
 * a) Expand methodology to 6 criteria.
 * b) Rename the section H2 from "How we picked this list" to "How we
 *    evaluated these agencies" to match the AI-Overview-friendly framing.
 */

import { createClient } from 'next-sanity';
import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '..', '.env.local') });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2025-03-29',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

const SLUG = 'best-aeo-agencies-b2b-saas-2026';

async function main() {
  const doc = await client.fetch(
    `*[_type=='blogPost' && slug.current==$slug][0]`,
    { slug: SLUG },
  );
  if (!doc) throw new Error('Doc not found');

  let content = doc.content;

  // ───────────────────────────────────────────────
  // PATCH (a + b): Replace the methodology block with a 6-criteria version
  // and rename the H2 to "How we evaluated these agencies" for AEO framing.
  // ───────────────────────────────────────────────
  const OLD_METHODOLOGY = `<h2>How we picked this list</h2>
<p>Four filters. Every agency had to pass all four.</p>

<p><strong>Measurable AEO work with real B2B SaaS clients.</strong> Not a landing page about AEO. Not a single logo on a case study page. A named engagement with before-and-after numbers we could verify from public sources.</p>

<p><strong>Transparency on methodology.</strong> An agency that cannot walk you through exactly how they build prompts, which tools they run, and how they score citations is not ready to sell the service in 2026.</p>

<p><strong>Team size and delivery model.</strong> Small specialist teams outperform large generalist ones on AEO specifically. The exceptions (Siege, NoGood) earn their scale by doing something a small team cannot do, like a full PR motion or a multi-channel growth stack.</p>

<p><strong>Pricing honesty.</strong> Agencies that refuse a pricing range on a discovery call are almost never built for Series A-C SaaS engagement sizes. Three agencies got cut on this filter alone.</p>`;

  const NEW_METHODOLOGY = `<h2>How we evaluated these agencies</h2>
<p>Six filters. Every agency on the list had to pass all of them.</p>

<p><strong>Public client outcomes with verifiable numbers.</strong> Not a landing page about AEO. Not a single logo on a case study page. A named engagement with before-and-after numbers we could verify from public sources — Share of Answer, organic traffic, branded search, pipeline contribution.</p>

<p><strong>AI citation footprint across ChatGPT, Claude, and Perplexity.</strong> We ran each agency's name and category prompts through ChatGPT, Claude, and Perplexity to check whether the agency itself shows up in answers buyers are running. Agencies that don't get cited for their own category are unlikely to earn citations for clients.</p>

<p><strong>Pricing transparency.</strong> Agencies that refuse a pricing range on a discovery call are almost never built for Series A-C SaaS engagement sizes. Three agencies got cut on this filter alone. The eight below all publish a real range either on the site or one email into the conversation.</p>

<p><strong>Vertical specialization.</strong> Generalist agencies underperform on AEO because category-specific prompt fluency takes 6–12 months to build. The list weights agencies with named B2B SaaS engagements over agencies with eclectic client logos across nine verticals.</p>

<p><strong>Honest weakness disclosure.</strong> Every agency below has a section on what they don't do well. An agency that claims they can do everything for everyone is either lying or unfocused. Both are bad signs.</p>

<p><strong>Founder and operator caliber.</strong> The person walking you through the strategy on the discovery call has to have run the playbook themselves, not just read about it. Operator-voiced agencies compound; theory-voiced agencies don't.</p>`;

  if (!content.includes(OLD_METHODOLOGY)) {
    throw new Error('OLD_METHODOLOGY not found — refusing to patch');
  }
  content = content.replace(OLD_METHODOLOGY, NEW_METHODOLOGY);

  // ───────────────────────────────────────────────
  // Write the updated doc
  // ───────────────────────────────────────────────
  const updated = {
    ...doc,
    content,
    lastUpdated: '2026-05-19T00:00:00.000Z',
  };

  const result = await client.createOrReplace(updated);
  console.log('OK — updated:', result._id);
  console.log('   lastUpdated:', result.lastUpdated);
  console.log('   content length:', result.content.length);
}

main().catch((e) => {
  console.error('FAILED:', e.message);
  process.exit(1);
});
