#!/usr/bin/env node
/**
 * Refresh /seo-for/fintech with:
 *  - 2026 stamp in metaTitle + heroSubtitle (currently absent)
 *  - AI engines as a third gatekeeper in heroSubtitle + heroDescription
 *  - Toku named as a fintech proof point in mainBody (currently no named clients)
 *  - Cross-link to /blog/best-b2b-saas-webflow-agencies-2026 (just-shipped sibling)
 *
 * Preserves the existing page's accumulated authority (last updated 2026-05-09).
 * Run from project root:
 *   node scripts/refresh-seo-for-fintech-2026.mjs
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

const FINTECH_ID = "imported-seoPage-6988a88cbf695b2d5ff36a17";

const NEW_META_TITLE = "Fintech SEO 2026: Compliance-Safe + AI-Cited Growth";
const NEW_HERO_SUBTITLE = "In 2026, FinTech SEO has three gatekeepers: search algorithms, AI engines, and regulators.";
const NEW_HERO_DESCRIPTION =
	'Your website is classified as YMYL (Your Money or Your Life), which means Google holds financial content to the same elevated quality standards as healthcare. On top of that, SEC and FINRA advertising rules restrict what you can say and how you can say it. Terms like "guaranteed returns" aren\'t just bad copy; they\'re illegal. And you\'re competing for keywords against NerdWallet and Investopedia, sites with over a decade of backlinks and trust signals. Now AI engines — ChatGPT, Perplexity, Gemini, Google AI Overviews — also decide which fintech brands get cited when buyers ask about your category. Standard SEO playbooks break down fast in this environment. We build the SEO + AEO architecture that earns the citations.';

// Fetch current mainBody, surgically insert one Toku-named proof paragraph + cross-link
// at the end of "The Customer Acquisition Case" section (which currently closes with
// the line about ecommerce SEO).

const current = await client.getDocument(FINTECH_ID);
if (!current) {
	console.error("Document not found");
	process.exit(1);
}

const OLD_BODY_TAIL = `<p>For fintech companies still early in their SEO journey, we've written extensively on our <a href=\"/blog\">blog</a> about building organic growth engines in regulated industries. And if you're operating in adjacent financial verticals, our work in <a href=\"/seo-for/ecommerce\">ecommerce SEO</a> covers the conversion-focused strategies that apply when fintech products sell directly to consumers.</p>`;

const NEW_BODY_TAIL = `<p>For fintech companies still early in their SEO journey, we've written extensively on our <a href=\"/blog\">blog</a> about building organic growth engines in regulated industries. And if you're operating in adjacent financial verticals, our work in <a href=\"/seo-for/ecommerce\">ecommerce SEO</a> covers the conversion-focused strategies that apply when fintech products sell directly to consumers.</p>

<h3>What This Looks Like in 2026: A Fintech Proof Point</h3>
<p>We've seen the AI-citation lane play out firsthand. <a href=\"/case-studies/toku-ai-cited-pipeline\">Toku</a>, a fintech stablecoin-payroll platform, went from 0 to 86% AI visibility on its core category prompt over a single Feb–May 2026 window. That's not paid acquisition. That's not a content campaign that ends when the budget stops. That's compounding citation pickup that gets reinforced every time an AI engine retrieves the answer. For fintech brands ready to take the AI-citation lane seriously, our <a href=\"/blog/best-b2b-saas-webflow-agencies-2026\">2026 B2B SaaS Webflow agency comparison</a> covers the structural moves — schema density, direct-answer paragraphs, question-phrased H2s — that separate cited from uncited sites in the new search funnel.</p>`;

if (!current.mainBody.includes(OLD_BODY_TAIL)) {
	console.error("Old body tail not found verbatim — manual review needed");
	process.exit(1);
}

const newBody = current.mainBody.replace(OLD_BODY_TAIL, NEW_BODY_TAIL);

const result = await client
	.patch(FINTECH_ID)
	.set({
		metaTitle: NEW_META_TITLE,
		heroSubtitle: NEW_HERO_SUBTITLE,
		heroDescription: NEW_HERO_DESCRIPTION,
		mainBody: newBody,
	})
	.commit();

console.log(`✓ Refreshed /seo-for/fintech`);
console.log(`  _id: ${result._id}`);
console.log(`  _rev: ${result._rev}`);
console.log(`  mainBody length: ${result.mainBody.length} chars (was ${current.mainBody.length})`);
console.log(`\nVerify:`);
console.log(`  curl -sS \"https://www.loudface.co/seo-for/fintech?cb=$(date +%s)\" | grep -oE 'Toku|2026|best-b2b-saas-webflow' | sort -u`);
