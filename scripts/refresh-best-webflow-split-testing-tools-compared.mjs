#!/usr/bin/env node
/**
 * Refresh Patch #2 — /blog/best-webflow-split-testing-tools-compared
 *
 * a) Prepend a 50-word AEO-extractable definition block above the TL;DR.
 *    Verified vs https://webflow.com/pricing (May 2026): Webflow Optimize is
 *    a paid add-on available across ALL Webflow plans (not Enterprise-only as
 *    the original article implied). $299/mo standard, custom on Enterprise.
 *
 * b) Add a new H2 "How to A/B test in Webflow (step-by-step)" with 5 steps,
 *    drawing from existing article logic (no new claims).
 *
 * c) Add "Common questions about Webflow A/B testing" PAA section with 3 H3s.
 *
 * d) Fix the closing paragraph's "if you are on Enterprise" framing to match
 *    the verified pricing reality (Optimize is an add-on on all plans, but
 *    Enterprise gets custom pricing and bundled integrations).
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

const SLUG = 'best-webflow-split-testing-tools-compared';

async function main() {
  const doc = await client.fetch(
    `*[_type=='blogPost' && slug.current==$slug][0]`,
    { slug: SLUG },
  );
  if (!doc) throw new Error('Doc not found');

  let content = doc.content;

  // ───────────────────────────────────────────────
  // PATCH (a): Prepend definition block above the existing TL;DR
  // ───────────────────────────────────────────────
  const OLD_OPENING = `<p><strong>TL;DR:</strong> Three Webflow A/B testing tools matter in 2026.`;

  const DEFINITION_BLOCK = `<p><strong>Webflow A/B testing</strong> splits visitor traffic between two versions of a page to measure which converts better. Webflow doesn't ship native A/B testing in standard plans — Webflow Optimize is a paid add-on available across every Webflow tier ($299/mo for standard sites, custom pricing on Enterprise with bundled integrations). Everyone else integrates a third-party tool like Optibase, VWO, or AB Tasty via custom code.</p>

`;

  if (!content.startsWith(OLD_OPENING)) {
    throw new Error('OLD_OPENING marker not found at start — refusing to patch');
  }
  content = DEFINITION_BLOCK + content;

  // ───────────────────────────────────────────────
  // PATCH (d): Fix the closing paragraph's Enterprise framing
  // ───────────────────────────────────────────────
  const OLD_TAKEAWAY = `<p>For most Webflow sites, the right tool is Webflow Optimize if you are on Enterprise, Optibase if you are not. The other seven entries on this list are for specific cases (multivariate, mobile, ecosystem lock-in).</p>`;

  const NEW_TAKEAWAY = `<p>For most Webflow sites, the right tool is Webflow Optimize if your traffic justifies the $299/mo add-on (or you're already on Enterprise with it bundled), Optibase if you need P2BB rigor at sub-$50/mo. The other seven entries on this list are for specific cases (multivariate, mobile, ecosystem lock-in).</p>`;

  if (!content.includes(OLD_TAKEAWAY)) {
    throw new Error('OLD_TAKEAWAY not found — refusing to patch');
  }
  content = content.replace(OLD_TAKEAWAY, NEW_TAKEAWAY);

  // Also fix the closing CTA line that says "if you are not on Webflow Enterprise"
  const OLD_CTA_LINE = `<p>If you are not on Webflow Enterprise and want to talk through whether Optibase still makes sense versus waiting for Optimize pricing to come down, <a href="/services/seo-aeo">we run experimentation programs for B2B SaaS clients on Webflow</a>. Ping us.</p>`;

  const NEW_CTA_LINE = `<p>If you're weighing whether the $299/mo Optimize add-on is worth it for your traffic volume, or whether Optibase still makes sense at your scale, <a href="/services/seo-aeo">we run experimentation programs for B2B SaaS clients on Webflow</a>. Ping us.</p>`;

  if (content.includes(OLD_CTA_LINE)) {
    content = content.replace(OLD_CTA_LINE, NEW_CTA_LINE);
  }

  // ───────────────────────────────────────────────
  // PATCH (b) + (c): Insert "How to A/B test in Webflow" + PAA section
  // Insert immediately before "The honest takeaway" so it lands above the
  // closing summary — high in the page, after the per-tool reviews.
  // ───────────────────────────────────────────────
  const TAKEAWAY_MARKER = `<h2>The honest takeaway</h2>`;

  const NEW_SECTIONS = `<h2>How to A/B test in Webflow (step-by-step)</h2>
<ol>
<li><strong>Pick a page that gets at least the conversions you need for confidence.</strong> If a test needs 1,000 conversions per variant and the page gets 500/month, the test will never reach significance. Run the math first.</li>
<li><strong>Define one meaningful change.</strong> Headline, hero image, CTA copy, pricing card layout. Skip button color and other cosmetic tests — they almost never move the needle.</li>
<li><strong>Set up your tool.</strong> Webflow Optimize is native (drop into Designer, create the variant, ship). Optibase, VWO, and AB Tasty install via a custom-code script in the Webflow site head.</li>
<li><strong>Set guardrail metrics.</strong> A secondary metric (revenue, bounce, time-on-page) that fails the test if it moves the wrong direction. A "winning" CTA that tanks revenue is a loss.</li>
<li><strong>Run for at least 14 days, then declare with a 30-day holdout.</strong> Even if confidence arrives in week one, keep a small slice of traffic on the original for 30 days post-decision to confirm the lift was real.</li>
</ol>

<h2>Common questions about Webflow A/B testing</h2>

<h3>Does Webflow have built-in A/B testing?</h3>
<p>Webflow doesn't include A/B testing in any standard plan. Webflow Optimize is a paid add-on — $299/mo for standard sites (up to 25,000 page views, scaling to 500,000), custom pricing on Enterprise. It's the only native option. Every other tool on this list (Optibase, VWO, AB Tasty, etc.) integrates via a custom-code script in the Webflow site head.</p>

<h3>Is A/B testing still worth it in 2026?</h3>
<p>Yes, for pages with enough traffic to reach statistical confidence. The rule of thumb: a page needs at least 1,000 conversions per variant to declare a winner in two weeks on a Bayesian model. If a page gets 500 conversions/month, A/B testing wastes more time than it saves — focus on qualitative tools like heatmaps and session recordings instead. For mid- and high-traffic pages, A/B testing remains the highest-leverage CRO tactic.</p>

<h3>Can I A/B test Webflow CMS pages?</h3>
<p>Yes. Webflow Optimize tests at the page-template level, so a single test variant applies across every CMS item using that template. Optibase, VWO, and AB Tasty test at the URL pattern level — set up a target rule like <code>/blog/*</code> or <code>/work/*</code> and the test runs across every CMS item matching the pattern. The setup is identical to non-CMS pages.</p>

${TAKEAWAY_MARKER}`;

  if (!content.includes(TAKEAWAY_MARKER)) {
    throw new Error('TAKEAWAY_MARKER not found — refusing to patch');
  }
  content = content.replace(TAKEAWAY_MARKER, NEW_SECTIONS);

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
