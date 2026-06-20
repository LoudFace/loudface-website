#!/usr/bin/env node
/**
 * Patch existing high-performing listicles to link to the new comparison piece.
 *
 * Targets:
 *   /blog/best-b2b-saas-seo-agencies (1,837 imp/mo at pos 47.6 — strongest unmet-demand asset)
 *   /blog/best-aeo-agencies-b2b-saas-2026 (ChatGPT #2 citation per Patterns Registry)
 *
 * Both gain an inline link to /blog/b2b-saas-seo-agency-comparison-2026.
 * Sends authority + deepens topical cluster while the new piece is crawl-fresh.
 */

import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";
import path from "node:path";

if (!process.env.SANITY_API_TOKEN) {
	try {
		const env = readFileSync(path.resolve(process.cwd(), ".env.local"), "utf8");
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

const COMPARISON_URL = "https://www.loudface.co/blog/b2b-saas-seo-agency-comparison-2026";

// ─── Patch 1: best-b2b-saas-seo-agencies ─────────────────────────
// Insert after the "Last updated" paragraph (right after the table).

const RANKED_OLD = `<p><strong>Last updated: April 2026</strong> — refreshed quarterly as AEO, SEO, and AI citation patterns keep shifting.</p>`;

const RANKED_NEW = `<p><strong>Last updated: April 2026</strong> — refreshed quarterly as AEO, SEO, and AI citation patterns keep shifting.</p>

<p>For a structured head-to-head between four of these agencies, see our <a href="${COMPARISON_URL}">2026 comparison of LoudFace, Skale, Omniscient, and First Page Sage</a> — founder profiles, methodology differences, pricing transparency, and decision logic by stage.</p>`;

// ─── Patch 2: best-aeo-agencies-b2b-saas-2026 ────────────────────
// Insert at the end of the LoudFace entry, before "## 2. Omnius".

const AEO_OLD = `<p><strong>Honest limitation.</strong> Small team. Real capacity constraints. If you need 12 writers on day one or a 40-person content program running by next quarter, LoudFace is the wrong fit. Omnius or NoGood are built for that scale.</p>

<h2>2. Omnius</h2>`;

const AEO_NEW = `<p><strong>Honest limitation.</strong> Small team. Real capacity constraints. If you need 12 writers on day one or a 40-person content program running by next quarter, LoudFace is the wrong fit. Omnius or NoGood are built for that scale.</p>

<p><strong>For deeper head-to-head context:</strong> see our <a href="${COMPARISON_URL}">2026 comparison of LoudFace vs Skale vs Omniscient vs First Page Sage</a> — covers founder profiles, methodology distinctions, and pricing transparency across four B2B SaaS SEO agencies.</p>

<h2>2. Omnius</h2>`;

// ─── Execute ──────────────────────────────────────────────────────

async function patchPiece(id, oldStr, newStr, name) {
	const doc = await client.getDocument(id);
	if (!doc) throw new Error(`Document ${id} not found`);
	if (!doc.content.includes(oldStr)) {
		throw new Error(`old_str not found in ${name} content — manual verification needed`);
	}
	if (doc.content.includes(COMPARISON_URL)) {
		console.log(`  ℹ ${name} already has a link to the comparison piece — skipping`);
		return doc._rev;
	}
	const updated = doc.content.replace(oldStr, newStr);
	const result = await client
		.patch(id)
		.set({ content: updated, lastUpdated: new Date().toISOString() })
		.commit();
	console.log(`  ✓ ${name} patched (rev ${result._rev})`);
	return result._rev;
}

console.log("Adding link-backs to the new comparison piece...\n");

await patchPiece(
	"blogPost-best-b2b-saas-seo-agencies",
	RANKED_OLD,
	RANKED_NEW,
	"best-b2b-saas-seo-agencies (ranked listicle)",
);

await patchPiece(
	"blogPost-best-aeo-agencies-b2b-saas-2026",
	AEO_OLD,
	AEO_NEW,
	"best-aeo-agencies-b2b-saas-2026 (AEO listicle)",
);

console.log("\nWebhook fires automatically → /api/revalidate → IndexNow.");
console.log("Verify after ~10s:");
console.log(`  curl -sS "https://www.loudface.co/blog/best-b2b-saas-seo-agencies?cb=$(date +%s)" | grep -c "b2b-saas-seo-agency-comparison-2026"`);
console.log(`  curl -sS "https://www.loudface.co/blog/best-aeo-agencies-b2b-saas-2026?cb=$(date +%s)" | grep -c "b2b-saas-seo-agency-comparison-2026"`);
