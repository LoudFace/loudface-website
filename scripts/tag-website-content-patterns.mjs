#!/usr/bin/env node
/**
 * One-shot script: tag every Website Content row with its Pattern via heuristics.
 *
 * Runs against the new Pattern relation column on Website Content (added
 * 2026-05-15). Reads NOTION_API_TOKEN from the worker's .env (the
 * "LoudFace SEO Sync Worker" Internal integration has access to both DBs
 * via cascaded sharing from the strategy page).
 *
 * Heuristics (highest specificity first). Posts that match no rule are
 * skipped and reported for human triage — bias toward leaving Pattern empty
 * over mis-tagging.
 *
 * Run from project root:
 *   node scripts/tag-website-content-patterns.mjs           # apply
 *   node scripts/tag-website-content-patterns.mjs --dry-run # preview only
 */

import fs from "node:fs";

const WORKER_ENV = "/Users/arnel/Code Projects/LoudFace Agency/loudface-website/workers/loudface-seo-sync/.env";
const env = Object.fromEntries(
	fs.readFileSync(WORKER_ENV, "utf8")
		.split("\n")
		.map((l) => l.match(/^([A-Z_]+)=(.*)$/))
		.filter(Boolean)
		.map((m) => [m[1], m[2]]),
);
const TOKEN = env.NOTION_API_TOKEN;
if (!TOKEN) throw new Error("NOTION_API_TOKEN not found in worker .env");

const WEBSITE_CONTENT_DS_ID = "347b6339-4d10-806a-99b3-000b881621e5";
const PATTERNS_REGISTRY_DS_ID = "a6c661c7-aeb4-4fb5-ad0a-7962288366c1";
const API = "https://api.notion.com/v1";
const NOTION_VERSION = "2025-09-03";

const DRY_RUN = process.argv.includes("--dry-run");

async function notionFetch(path, { method = "POST", body } = {}) {
	const res = await fetch(`${API}${path}`, {
		method,
		headers: {
			Authorization: `Bearer ${TOKEN}`,
			"Content-Type": "application/json",
			"Notion-Version": NOTION_VERSION,
		},
		body: body ? JSON.stringify(body) : undefined,
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Notion ${path} failed: ${res.status} ${text}`);
	}
	return res.json();
}

async function queryAll(dataSourceId) {
	const all = [];
	let cursor;
	do {
		const res = await notionFetch(`/data_sources/${dataSourceId}/query`, {
			body: { page_size: 100, start_cursor: cursor },
		});
		all.push(...res.results);
		cursor = res.has_more ? res.next_cursor : undefined;
	} while (cursor);
	return all;
}

function plainText(rich) {
	return (rich ?? []).map((t) => t.plain_text || "").join("");
}

function classify(title, url) {
	if (!url) return { pattern: null, reason: "no URL" };
	let path;
	try {
		path = new URL(url).pathname.toLowerCase();
	} catch {
		return { pattern: null, reason: "invalid URL" };
	}
	const slug = path.split("/").filter(Boolean).pop() || "";

	// Exact paths
	if (path === "/" || path === "") return { pattern: "Brand-only homepage SEO" };
	if (path === "/pricing") return { pattern: "Pricing-intent content" };

	// Industry landing pages
	if (path.startsWith("/seo-for/")) {
		return { pattern: "Industry-specific landing pages (/seo-for/[vertical])" };
	}

	// Case studies — only ex-clients fit a current pattern
	if (path.startsWith("/case-studies/")) {
		const exClients = ["finnrick", "mycryptoguide", "draw-things"];
		if (exClients.some((c) => path.includes(c))) {
			return { pattern: "Client-relationship case studies for ex-clients" };
		}
		return { pattern: null, reason: "active case study — no current pattern" };
	}

	// Blog posts
	if (path.startsWith("/blog/")) {
		// Listicles — "best-X" or "top-N-X" pattern
		if (/^best-/.test(slug) || /^top-\d+-/.test(slug)) {
			return { pattern: '"Best X for B2B SaaS 2026" year-stamped listicles' };
		}

		// X vs Y comparisons
		if (/-vs-/.test(slug)) {
			return { pattern: '"X vs Y" comparison pages' };
		}

		// AEO playbook
		if (/aeo|answer-engine|ai-search|ai-extraction|share-of-answer|ai-overview|ai-first|ai-cited|ai-citation|ai-mentions|llms-txt|cited-by-chatgpt|new-search-funnel/.test(slug)) {
			return { pattern: "AEO playbook content (extraction-optimized)" };
		}

		// Tactical / setup how-to (killed)
		if (/split-testing-setup|ab-testing-setup|how-to-set-up|how-to-install|how-to-add-|configure-|setup-|tutorial/.test(slug)) {
			return { pattern: "Tactical / setup how-to posts (A/B testing, split-testing setup, etc.)" };
		}

		// Generic Webflow how-to (killed)
		if (/figma-to-webflow|marketing-funnel|webflow-tips|webflow-tutorial/.test(slug)) {
			return { pattern: "Generic Webflow how-to content (Figma to Webflow, marketing funnel, etc.)" };
		}
	}

	return { pattern: null, reason: "no rule matched" };
}

async function main() {
	console.log(`Mode: ${DRY_RUN ? "DRY RUN (no writes)" : "APPLY"}`);

	console.log("Fetching Patterns Registry...");
	const patternRows = await queryAll(PATTERNS_REGISTRY_DS_ID);
	const patternByName = new Map();
	for (const p of patternRows) {
		const name = plainText(p.properties.Pattern?.title);
		if (name) patternByName.set(name, p.id);
	}
	console.log(`Loaded ${patternByName.size} patterns:`);
	for (const name of patternByName.keys()) console.log(`  - ${name}`);

	console.log("\nFetching Website Content rows...");
	const posts = await queryAll(WEBSITE_CONTENT_DS_ID);
	console.log(`Loaded ${posts.length} Website Content rows.\n`);

	let tagged = 0;
	let skippedNoRule = 0;
	let skippedMissingPattern = 0;
	let errors = 0;
	const skippedExamples = [];

	for (const post of posts) {
		const title = plainText(post.properties.Title?.title);
		const url = post.properties.URL?.url;
		const { pattern, reason } = classify(title, url);

		if (!pattern) {
			skippedNoRule++;
			if (skippedExamples.length < 25) {
				skippedExamples.push(`  ${title || "(no title)"} ${url ? `[${url}]` : ""} — ${reason}`);
			}
			continue;
		}

		const patternId = patternByName.get(pattern);
		if (!patternId) {
			skippedMissingPattern++;
			console.log(`  ⚠ pattern not in registry: "${pattern}" for "${title}"`);
			continue;
		}

		if (DRY_RUN) {
			tagged++;
			console.log(`  [dry] ${title} → ${pattern}`);
			continue;
		}

		try {
			await notionFetch(`/pages/${post.id}`, {
				method: "PATCH",
				body: {
					properties: {
						Pattern: { relation: [{ id: patternId }] },
					},
				},
			});
			tagged++;
			console.log(`  ✓ ${title} → ${pattern}`);
		} catch (e) {
			errors++;
			console.log(`  ✗ ${title} → ${e.message}`);
		}
	}

	console.log("\n=== Summary ===");
	console.log(`Tagged: ${tagged}`);
	console.log(`Skipped (no heuristic matched, needs human review): ${skippedNoRule}`);
	console.log(`Skipped (pattern in classifier but not in registry — fix classifier): ${skippedMissingPattern}`);
	console.log(`Errors: ${errors}`);

	if (skippedNoRule > 0) {
		console.log("\nSample of unclassified posts (max 25 shown):");
		for (const s of skippedExamples) console.log(s);
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
