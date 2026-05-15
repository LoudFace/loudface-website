#!/usr/bin/env node
/**
 * Refresh /blog/webflow-split-testing-setup for 2026.
 *
 * Companion to /blog/best-webflow-split-testing-tools-compared (just refreshed).
 * This piece focuses on SETUP — the three methods to actually run a test.
 * Same _id, same slug. Cross-link to the tools piece.
 */

import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";
import path from "node:path";

if (!process.env.SANITY_API_TOKEN) {
	try {
		const envPath = path.resolve(process.cwd(), ".env.local");
		const env = readFileSync(envPath, "utf8");
		const m = env.match(/^SANITY_API_TOKEN=(.+)$/m);
		if (m) process.env.SANITY_API_TOKEN = m[1].trim();
	} catch {}
}

const client = createClient({
	projectId: "xjjjqhgt",
	dataset: "production",
	apiVersion: "2025-03-29",
	useCdn: false,
	token: process.env.SANITY_API_TOKEN,
});

const DOC_ID = "imported-blogPost-67be8cb06f129dc684d052de";

const NEW_NAME = "How to Set Up A/B Testing in Webflow (2026): Three Methods Compared";
const NEW_META_TITLE = "How to Set Up A/B Testing in Webflow (2026)";
const NEW_META_DESCRIPTION =
	"Three ways to A/B test in Webflow in 2026: Webflow Optimize ($299/mo), third-party tools (Optibase, VWO), or manual CMS swap. Setup steps, decision logic, and the traffic threshold that determines which method actually works.";
const NEW_EXCERPT =
	"Three methods to A/B test in Webflow in 2026 — Webflow Optimize, third-party scripts, manual CMS swap. Which is right for your page depends on traffic volume per variant, not price.";

const NEW_CONTENT = `
<p><strong>TL;DR:</strong> Three ways to A/B test in Webflow in 2026. <strong>Webflow Optimize</strong> (native, $299/mo, requires Webflow Enterprise) runs tests inside the Designer with no external scripts. <strong>Third-party tools</strong> (Optibase, VWO, AB Tasty) inject a tracking script and run variants client-side. Best when you need P2BB statistics or multivariate testing. <strong>Manual CMS swaps</strong> (free, slower) use Webflow's CMS to swap content variations with custom URL routing. Only worth it on very low-traffic pages where commercial tools would never reach statistical confidence. Pick by traffic volume per variant, not by price.</p>

<p>I have set up A/B testing on Webflow client sites for two years. The pattern that wastes the most time: teams pick a tool first, then figure out what to test. The right order is reversed. Decide what you are testing, what counts as a win, and what traffic the page actually gets. Then pick the tool that fits.</p>

<p>This guide is the setup half. For the tool comparison, see <a href="/blog/best-webflow-split-testing-tools-compared">Best Webflow A/B Testing Tools (2026)</a>. Same evidence, different cut.</p>

<h2>Before you set anything up: the one-question filter</h2>

<p>Most A/B tests on Webflow sites fail before they start because the page does not get enough traffic to produce a confident result. Run this check first.</p>

<p><strong>Question:</strong> does the page you want to test get at least 1,000 visitors per variant per week?</p>

<ul>
<li><strong>Yes</strong> → Webflow Optimize or VWO. Frequentist statistics will reach confidence in a reasonable window.</li>
<li><strong>No, but it gets at least 200 per variant per week</strong> → Optibase. P2BB statistics produce honest results at lower volumes.</li>
<li><strong>No, less than 200 per variant per week</strong> → do not A/B test this page. Pick a higher-traffic page, or test a bigger change (full redesign as a split-URL test), or skip A/B testing entirely. Running tests on pages that cannot statistically converge is theater.</li>
</ul>

<p>If you have not run that check, the rest of this guide will not help.</p>

<h2>What you can A/B test on a Webflow site</h2>

<p>Anything on the page that the rendered HTML controls. Practically:</p>

<ul>
<li><strong>Hero copy:</strong> headline, subheadline, CTA text</li>
<li><strong>Hero layout:</strong> single column vs split, image vs no image, CTA position</li>
<li><strong>Pricing structure:</strong> tier ordering, feature emphasis, billing toggle position</li>
<li><strong>Form copy and length:</strong> field count, button text, "what happens next" reassurance</li>
<li><strong>Trust signals:</strong> testimonial placement, logo bar above or below fold</li>
<li><strong>Page-level redesign:</strong> split-URL testing (two entirely different pages)</li>
</ul>

<p>What you generally should NOT test on a Webflow site:</p>

<ul>
<li>Button color in isolation (effect size is below the noise floor)</li>
<li>Tiny copy changes (sub-5-word edits rarely move conversion enough to detect)</li>
<li>Anything that changes session behavior across multiple pages (single-page tests cannot measure cross-page effects)</li>
</ul>

<h2>Method 1: Webflow Optimize (native, $299/month)</h2>

<p>The default pick for marketing teams already on Webflow Enterprise. Tests build inside the Webflow Designer. No external scripts. No code injection. Audience segmentation and AI personalization layered on top.</p>

<h3>Setup steps</h3>

<ol>
<li><strong>Enable Optimize</strong> in your Webflow Workspace. Available on Enterprise sites only.</li>
<li><strong>Open the page</strong> you want to test in the Designer.</li>
<li><strong>Click "Create variant"</strong> from the Optimize panel. Webflow creates a clean copy of the page that you edit directly.</li>
<li><strong>Modify the variant:</strong> change the hero headline, swap the CTA, restructure the pricing block. Same Designer canvas, same Style Manager.</li>
<li><strong>Set the conversion goal:</strong> a button click, form submit, or page view of a thank-you page. Optimize tracks the goal automatically.</li>
<li><strong>Define audience and traffic split:</strong> usually 50/50 between control and variant on all visitors, but you can segment by device, location, or referrer.</li>
<li><strong>Publish the test.</strong> Webflow handles variant delivery server-side, which preserves Core Web Vitals (no client-side flicker, no FOOC).</li>
</ol>

<h3>When this is the wrong choice</h3>

<ul>
<li>You are not on Webflow Enterprise.</li>
<li>You want P2BB statistics (Optimize uses Bayesian, which is similar but not identical).</li>
<li>You want to test pages in your CMS Collection at scale across many slugs simultaneously (Optimize handles this but the Workspace UI is built for landing pages first).</li>
</ul>

<h2>Method 2: Third-party tools (Optibase, VWO, AB Tasty)</h2>

<p>The pick for teams not on Webflow Enterprise, or teams that need features Optimize does not have (P2BB, multivariate, heatmaps).</p>

<h3>Setup steps (universal)</h3>

<ol>
<li><strong>Sign up for the tool</strong> and grab the tracking script.</li>
<li><strong>Paste the script</strong> into Webflow's Project Settings → Custom Code → Head Code. Universal across all pages on the site.</li>
<li><strong>In the tool's dashboard,</strong> create a new experiment targeting the URL of the page you want to test.</li>
<li><strong>Build the variant</strong> using the tool's visual editor. The editor injects DOM changes client-side at page load.</li>
<li><strong>Set the goal:</strong> click event, form submit, or custom JavaScript event. Configure the corresponding tracking in the tool.</li>
<li><strong>Set traffic allocation</strong> and launch.</li>
</ol>

<h3>Optibase-specific</h3>

<p>Optibase has a deeper Webflow integration than the rest. After installing the script, you can pick Webflow CMS items directly inside Optibase's editor rather than working from the DOM. This is the closest a third-party tool gets to feeling native.</p>

<p>Sustainability flag: Optibase had not shipped a meaningful update since July 2024 as of late 2024. The product still works, but if you are starting a long-running program in 2026, that maintenance status is worth weighing.</p>

<h3>VWO-specific</h3>

<p>VWO is the choice when you also need heatmaps, session recordings, or multivariate testing in the same tool. Setup is heavier (more events to instrument) but the consolidation saves you from buying Hotjar separately.</p>

<h3>When third-party is the wrong choice</h3>

<ul>
<li>The tracking script adds 30-100ms to your Core Web Vitals. If you are already at the LCP threshold, this can flip a page from passing to failing.</li>
<li>Client-side variant injection can produce a brief flash of original content (FOOC) on slow connections.</li>
<li>If you are on Webflow Enterprise and your team is willing to pay the Optimize delta, native wins on integration cleanliness.</li>
</ul>

<h2>Method 3: Manual CMS swap (free, slowest)</h2>

<p>The honest path for pages with very low traffic where any commercial tool would be wasted. Free. Crude. Works.</p>

<h3>Setup steps</h3>

<ol>
<li><strong>Create two CMS items</strong> in a Collection. Call them "variant_a" and "variant_b" (or whatever the test is).</li>
<li><strong>Use a URL parameter</strong> (e.g., <code>?v=a</code> and <code>?v=b</code>) to switch between them. A small custom-code snippet reads the URL parameter and renders the matching Collection item.</li>
<li><strong>Use GA4 custom dimensions</strong> to track which variant the user saw. Instrument the goal (click, form submit) with the same dimension attached.</li>
<li><strong>Manually split traffic</strong> by either: (a) updating ad campaign URLs to alternate the <code>?v=</code> parameter, or (b) using a custom-code 50/50 random assignment on page load that persists in a cookie.</li>
<li><strong>Export GA4 data</strong> to Google Sheets every two weeks. Run the statistical analysis manually (chi-square or Z-test for proportions). The honest answer is sometimes "not enough data yet."</li>
</ol>

<h3>When this method is the right choice</h3>

<ul>
<li>Page traffic is under 200 visitors per variant per week. Commercial tools cannot reach confidence here.</li>
<li>You are validating a hypothesis cheaply before investing in a tool.</li>
<li>You need to test something a tool's visual editor cannot do (custom interaction logic, content randomization at the field level).</li>
</ul>

<h3>When this method is the wrong choice</h3>

<ul>
<li>You want to run more than one test at a time. Manual setup does not scale.</li>
<li>You need statistical results faster than two weeks of manual export.</li>
<li>You are responsible for the statistical accuracy. There is no tool catching the mistakes for you.</li>
</ul>

<h2>Which method should you pick?</h2>

<p>Three honest questions in order:</p>

<ol>
<li><strong>Are you on Webflow Enterprise?</strong> If yes, Optimize is the default. Only look elsewhere if you specifically need P2BB statistics, multivariate testing, or heatmaps inside the same tool.</li>
<li><strong>What is your traffic per variant per week?</strong> Under 1,000 means Frequentist will not converge. Over 1,000 means any tool works.</li>
<li><strong>What is your budget?</strong> Optibase at $19/month is the rational pick when budget is the binding constraint and the page gets at least 200 visitors per variant per week.</li>
</ol>

<h2>How to write copy variants worth testing</h2>

<p>The setup is the easy part. Designing the test is where most teams lose.</p>

<p>The variant has to be different enough to detect, beyond simple word choice. Three patterns that produce detectable lifts:</p>

<ol>
<li><strong>Reframe the value, not just the verb.</strong> Changing "Get started" to "Start free trial" rarely moves the needle. Changing "Get started" to "See how Toku pays your team in stablecoins" reframes the entire offer.</li>
<li><strong>Change the proof structure.</strong> Test "trusted by Stripe, Coinbase, OpenSea" against "trusted by 200+ Web3 companies" against no proof at all. Each is a different argument shape.</li>
<li><strong>Change the page hierarchy.</strong> Move the pricing block above the feature list. Move the testimonials above the form. These are layout tests, and they often produce bigger effects than copy tests.</li>
</ol>

<p>What does not produce detectable lifts on most Webflow sites:</p>

<ul>
<li>Single-word copy edits ("Sign up" vs "Sign me up")</li>
<li>Color variants on the same CTA</li>
<li>Punctuation changes</li>
<li>Em dash vs comma</li>
</ul>

<p>The traffic required to detect a 5% lift is roughly 20× what is required to detect a 25% lift. Big swings need less data.</p>

<h2>Best practices: the non-negotiables</h2>

<p>After many client engagements, these are the four rules I do not break.</p>

<ol>
<li><strong>Run tests for a full business cycle.</strong> Minimum 7 days. Ideal 14 days. Conversion intent differs between weekday and weekend; ending a test early misses the weekly cycle.</li>
<li><strong>Set guardrail metrics.</strong> A "winning" headline that tanks revenue is a loss. Track a secondary metric (revenue per visitor, bounce rate, time on page) that fails the test if it moves the wrong direction.</li>
<li><strong>Pre-register the hypothesis.</strong> Write down what you expect to happen and why, before launching. Stops you from post-hoc rationalizing a noisy result as a "win."</li>
<li><strong>Keep a post-test holdout.</strong> Keep a small percentage of traffic on the control variant for 30 days after declaring a winner. Confirms the lift was real and not a regression to the mean.</li>
</ol>

<p>The two unforced errors I see most often: ending tests early (because the lift looks "obvious") and not setting guardrails (because the team is focused on one metric and ignores the rest).</p>

<h2>The honest takeaway</h2>

<p>The right A/B testing setup on Webflow follows from the page rather than the tool. High-traffic landing page on Webflow Enterprise: Optimize. Mid-traffic page off Enterprise: Optibase. Low-traffic page with a big change to validate: manual CMS swap. Compare tools after you have decided what you are testing and what counts as a win.</p>

<p>If you want help structuring an experimentation program for a B2B SaaS site on Webflow, <a href="/services/seo-aeo">we run this work as part of our SEO + AEO engagements</a>. The setup is the easy part. The harder part is picking the changes worth testing.</p>
`.trim();

const NEW_FAQ = [
	{
		_key: "faq1",
		_type: "faqItem",
		question: "What is A/B testing in marketing?",
		answer:
			"<p>A/B testing (also called split testing) compares two or more versions of a webpage or element by splitting traffic between them and tracking which version converts better. The control is the original; the variant is the change being tested. The output is statistical: which version performed better at the agreed-upon goal, and with what confidence. Used well, A/B testing replaces guesswork with data. Used badly, it produces noise that teams over-interpret as signal.</p>",
	},
	{
		_key: "faq2",
		_type: "faqItem",
		question: "How do I set up A/B testing in Webflow in 2026?",
		answer:
			"<p>Three methods. (1) Webflow Optimize (native, $299/month, Webflow Enterprise only) builds variants inside the Designer and tracks goals automatically. (2) Third-party tools (Optibase $19/month, VWO $199/month) inject a tracking script into Webflow's custom code section and run variants client-side. (3) Manual CMS swap uses Webflow's CMS to render variants based on URL parameters, with GA4 tracking the goal. Pick by traffic volume per variant and budget rather than by price alone.</p>",
	},
	{
		_key: "faq3",
		_type: "faqItem",
		question: "Does Webflow have a built-in A/B testing tool?",
		answer:
			"<p>Yes. Webflow Optimize launched at the 2024 Webflow Conference and is available on Webflow Enterprise. It includes A/B testing, audience segmentation, and AI personalization with no external scripts required. Pricing starts at $299/month. If you are on Webflow Enterprise and want native A/B testing without the integration overhead of third-party tools, this is the default pick.</p>",
	},
	{
		_key: "faq4",
		_type: "faqItem",
		question: "What is the minimum traffic a page needs to A/B test?",
		answer:
			"<p>For Frequentist statistics (Webflow Optimize default, VWO, AB Tasty): at least 1,000 visitors per variant per week. For P2BB statistics (Optibase): at least 200 visitors per variant per week. Below 200 per variant per week, no commercial tool will produce a confident result in any reasonable time. Pick a higher-traffic page, test a bigger change, or skip A/B testing on that page.</p>",
	},
	{
		_key: "faq5",
		_type: "faqItem",
		question: "Can I A/B test without a paid tool?",
		answer:
			"<p>Yes, with Webflow's CMS plus GA4 plus manual analysis in Google Sheets. The setup uses URL parameters (?v=a, ?v=b) to switch between two CMS items, tracks which variant the user saw with a GA4 custom dimension, and exports the data every two weeks for statistical analysis. Free, slow, and you carry the statistical accuracy yourself. Worth it on very low-traffic pages where commercial tools would be overkill. Not worth it on any page that gets enough traffic to justify Optibase at $19/month.</p>",
	},
	{
		_key: "faq6",
		_type: "faqItem",
		question: "How long should I run an A/B test?",
		answer:
			"<p>Minimum 7 days. Ideal 14 days. Even if statistical confidence arrives sooner, you want to capture both the weekday and weekend conversion patterns. Conversion intent differs across the week and ending a test early misses that cycle. After declaring a winner, keep a small percentage of traffic on the control variant for 30 days to confirm the lift was real and not a regression to the mean.</p>",
	},
	{
		_key: "faq7",
		_type: "faqItem",
		question: "What should I A/B test on a B2B SaaS Webflow site?",
		answer:
			"<p>Test changes worth detecting. Hero headline (especially the value proposition phrasing). Hero CTA copy and placement. Pricing card structure and tier order. Form length and field labels. Testimonial placement. Page-level redesigns via split-URL testing when the change is too big for variant-level testing. Do not waste cycles on button colors, single-word copy edits, or punctuation. Effect sizes are usually below the noise floor for any realistic B2B SaaS Webflow site's traffic.</p>",
	},
];

const TODAY = new Date().toISOString();

const result = await client
	.patch(DOC_ID)
	.set({
		name: NEW_NAME,
		metaTitle: NEW_META_TITLE,
		metaDescription: NEW_META_DESCRIPTION,
		excerpt: NEW_EXCERPT,
		content: NEW_CONTENT,
		faq: NEW_FAQ,
		lastUpdated: TODAY,
	})
	.commit();

console.log(`✓ Refreshed /blog/webflow-split-testing-setup`);
console.log(`  _id: ${result._id}`);
console.log(`  _rev: ${result._rev}`);
console.log(`  content length: ${result.content.length} chars`);
console.log(`  faq entries: ${result.faq.length}`);
console.log(`  lastUpdated: ${result.lastUpdated}`);
