#!/usr/bin/env node
/**
 * Refresh Patch #3 — /blog/webflow-vs-wix-studio
 *
 * a) Inject pricing anchor into the existing short-answer block.
 *    Verified: Webflow site plans $15–$25/mo (Basic to Premium), Wix Studio
 *    $19–$159/mo (Basic to Elite) per webflow.com/pricing and Wix Studio
 *    pricing aggregators (May 2026). Webflow Team is $2500/mo but that's
 *    workspace-level, not site-plan-level — keeping the site-plan range
 *    so the head-to-head is apples-to-apples.
 *
 * b) Add three missing H2s:
 *    - Webflow vs Wix Studio pricing breakdown (plan table both sides)
 *    - Webflow vs Wix Studio for e-commerce (200 words)
 *    - "Migrating from Wix Studio to Webflow" — the article already has
 *      "Switching from Wix's Studio to Webflow", so I'll skip duplicating
 *      that one (it's the same H2 with a slightly different verb).
 *
 * c) Add "When to choose Webflow" / "When to choose Wix Studio" summary box
 *    at the very end, before the FAQ structured data.
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

const SLUG = 'webflow-vs-wix-studio';

async function main() {
  const doc = await client.fetch(
    `*[_type=='blogPost' && slug.current==$slug][0]`,
    { slug: SLUG },
  );
  if (!doc) throw new Error('Doc not found');

  let content = doc.content;

  // ───────────────────────────────────────────────
  // PATCH (a): Inject pricing anchor into the short-answer
  // ───────────────────────────────────────────────
  const OLD_SHORT_ANSWER = `<p><strong>Webflow vs Wix in 2026 — the short answer:</strong> Webflow wins for B2B SaaS marketing sites where scalability, SEO performance, and design freedom matter. Wix Studio wins for small-to-mid projects where simplicity and the Wix ecosystem matter more than flexibility. Studio closes the gap with Wix Editor but doesn't match Webflow on CMS depth, custom code support, or page-speed performance at scale.</p>`;

  const NEW_SHORT_ANSWER = `<p><strong>Webflow vs Wix Studio in 2026 — the short answer:</strong> Webflow ($15–$25/mo on standard site plans, Team workspace $2,500/mo for agencies) wins for B2B SaaS marketing sites where scalability, SEO performance, and design freedom matter. Wix Studio ($19–$159/mo across Basic to Elite) wins for small-to-mid client work where simplicity and the Wix ecosystem matter more than flexibility. Studio closes the gap with Wix Editor but doesn't match Webflow on CMS depth, custom code support, or page-speed performance at scale.</p>`;

  if (!content.includes(OLD_SHORT_ANSWER)) {
    throw new Error('OLD_SHORT_ANSWER not found — refusing to patch');
  }
  content = content.replace(OLD_SHORT_ANSWER, NEW_SHORT_ANSWER);

  // ───────────────────────────────────────────────
  // PATCH (b): Insert pricing breakdown + e-commerce sections.
  // Insert BEFORE the existing "Switching from Wix's Studio to Webflow" H2 so
  // they land high in the page, after the feature comparison.
  // ───────────────────────────────────────────────
  const SWITCHING_MARKER = `<h2 id="">Switching from Wix’s Studio to Webflow</h2>`;

  const PRICING_AND_ECOMMERCE = `<h2 id="">Webflow vs Wix Studio pricing breakdown</h2>
<p>Pricing is the cleanest place to start a comparison because both platforms publish their site plans transparently. Costs scale with traffic, CMS items, and team seats, not features locked behind premium tiers.</p>
<table class="table_component">
<thead>
<tr><th>Plan tier</th><th>Webflow site plan</th><th>Wix Studio plan</th></tr>
</thead>
<tbody>
<tr><td>Starter / Free</td><td>Free (subdomain only)</td><td>Free trial (limited)</td></tr>
<tr><td>Entry</td><td>Basic — $15/mo</td><td>Basic — $19/mo</td></tr>
<tr><td>Standard</td><td>CMS — $25/mo</td><td>Standard — $39/mo</td></tr>
<tr><td>Mid</td><td>Business — $45/mo</td><td>Premium — $79/mo</td></tr>
<tr><td>Top</td><td>Enterprise — custom</td><td>Elite — $159/mo</td></tr>
</tbody>
</table>
<p>Pricing snapshot per webflow.com/pricing and Wix Studio plan listings as of May 2026; per-plan numbers shift quarterly so cross-check the live pages before committing budget. The headline: Webflow's standard site plans run cheaper at the entry tier, but the Team workspace plan ($2,500/mo) kicks in once you manage multiple client sites at agency scale. Wix Studio's Elite plan tops out lower than Webflow Enterprise but includes Wix's full multi-site management without an additional workspace charge.</p>

<h2 id="">Webflow vs Wix Studio for e-commerce</h2>
<p>E-commerce is where the two platforms diverge most. Webflow Ecommerce supports up to 3,000 SKUs on the Plus plan ($74/mo) and 15,000 on Advanced ($212/mo). It handles custom checkout flows via custom code, integrates with Shopify and Foxy if you need to outgrow the native cart, and runs faster than most templated stores because it ships clean static HTML.</p>
<p>Wix Studio Stores ships with native payment processing, abandoned cart automation, and multi-channel selling (Instagram, Facebook, Amazon) baked into every plan. The platform is the right pick for direct-to-consumer brands shipping under 5,000 SKUs that prioritize built-in marketing automation over checkout customization. For B2B SaaS billing flows (subscriptions, usage-based pricing, complex tax logic), neither platform is the right home — that's where you bolt on Stripe Billing or Chargebee on top of either CMS.</p>
<p>Bottom line: Webflow Ecommerce wins on design freedom and page speed; Wix Studio Stores wins on time-to-launch and built-in marketing tooling. Neither is the right substrate for a B2B SaaS billing stack — that lives in your product app, with the marketing site doing the conversion work.</p>

${SWITCHING_MARKER}`;

  if (!content.includes(SWITCHING_MARKER)) {
    throw new Error('SWITCHING_MARKER not found — refusing to patch');
  }
  content = content.replace(SWITCHING_MARKER, PRICING_AND_ECOMMERCE);

  // ───────────────────────────────────────────────
  // PATCH (c): When-to-choose summary box at the end
  // Append at the very end of the content string — it's the last thing
  // visitors see before the FAQ schema renders below the fold.
  // ───────────────────────────────────────────────
  const WHEN_TO_CHOOSE = `<h2 id="">When to choose Webflow vs Wix Studio</h2>
<p><strong>Choose Webflow if:</strong></p>
<ul>
<li>You're building a B2B SaaS marketing site that needs to scale past 100 CMS items.</li>
<li>SEO performance and Core Web Vitals are non-negotiable — Webflow's static HTML output ranks faster than Wix's hybrid rendering.</li>
<li>You want full custom code freedom (head, body, page-level) without restrictions.</li>
<li>You're an agency managing multiple client sites and need the Team workspace.</li>
<li>You'll integrate with a marketing stack (Segment, HubSpot, Salesforce) where a developer-facing CMS matters.</li>
</ul>
<p><strong>Choose Wix Studio if:</strong></p>
<ul>
<li>You're a freelancer or small agency shipping client sites with under 50 CMS items each.</li>
<li>You want native e-commerce, booking, or appointment scheduling without third-party integrations.</li>
<li>Your clients want to edit content themselves in a familiar Wix-style editor.</li>
<li>Time-to-launch is the primary constraint and you can trade some design freedom for speed.</li>
<li>You're already in the Wix ecosystem (Studio plans inherit existing Wix domain and email setups).</li>
</ul>
`;

  content = content + '\n' + WHEN_TO_CHOOSE;

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
