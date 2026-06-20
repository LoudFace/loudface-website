#!/usr/bin/env node
/**
 * Import a client's Webflow blog collection into the Notion Website Content
 * database, tagged with the client's Client relation.
 *
 * Usage:
 *   node scripts/import-webflow-blog.mjs --client <slug> [--dry-run] [--limit N]
 *
 * Behavior:
 *   - Reads tenant config from clients.json (blogCollectionId, tokenEnvVar,
 *     notionRelationId, domain).
 *   - Paginates Webflow CMS API (100 items/page) until exhausted.
 *   - Skips items where isDraft === true or isArchived === true.
 *   - For each remaining item, builds canonical URL using the client's
 *     domain + observed path pattern (Toku uses /resources/{slug}).
 *   - Pre-loads existing Notion rows for this client and skips any URL that
 *     already exists — re-running the script is a no-op on imported rows.
 *   - Creates one Notion page per new Webflow item, with:
 *       Title           = heading || name
 *       URL             = canonical URL
 *       Status          = "Published"
 *       Client          = relation to clients.json notionRelationId
 *       Content Type    = "Blog Post"
 *       Publish Date    = displayed-publish-date || createdOn
 *       Last Updated    = lastUpdated (top-level Webflow field)
 *       Meta Description = short-description (truncated to 2000 chars)
 *   - Throttles writes to ~3/sec to stay under Notion API limits.
 *
 * Env required:
 *   - NOTION_API_TOKEN
 *   - <client.cmsConfig.tokenEnvVar> (e.g. WEBFLOW_TOKEN_TOKU)
 *
 * Loaded automatically from workers/loudface-seo-sync/.env if present.
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, "..");
const CLIENTS_PATH = resolve(REPO_ROOT, "clients.json");
const ENV_PATH = resolve(REPO_ROOT, "workers/loudface-seo-sync/.env");

const WEBSITE_CONTENT_DATA_SOURCE_ID = "347b6339-4d10-806a-99b3-000b881621e5";
const NOTION_VERSION = "2025-09-03";

// Per-client URL path convention. Add new entries as more Webflow tenants
// onboard. Anything not in this map falls back to /blog/{slug}.
const URL_PATH_BY_CLIENT = {
	toku: "/resources",
};

// ----- args -----------------------------------------------------------------

function parseArgs(argv) {
	const args = { dryRun: false, limit: Infinity };
	for (let i = 2; i < argv.length; i++) {
		const a = argv[i];
		if (a === "--client") args.client = argv[++i];
		else if (a === "--dry-run") args.dryRun = true;
		else if (a === "--limit") args.limit = Number(argv[++i]);
		else if (a === "-h" || a === "--help") {
			console.log("Usage: node scripts/import-webflow-blog.mjs --client <slug> [--dry-run] [--limit N]");
			process.exit(0);
		}
	}
	if (!args.client) {
		console.error("ERROR: --client <slug> is required");
		process.exit(1);
	}
	return args;
}

// ----- env loader (lightweight, no dotenv dep) ------------------------------

function loadEnvFile(path) {
	let raw;
	try {
		raw = readFileSync(path, "utf8");
	} catch {
		return;
	}
	for (const line of raw.split("\n")) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#")) continue;
		const eq = trimmed.indexOf("=");
		if (eq <= 0) continue;
		const k = trimmed.slice(0, eq).trim();
		const v = trimmed.slice(eq + 1).trim();
		if (!(k in process.env)) process.env[k] = v;
	}
}

// ----- HTTP helpers ---------------------------------------------------------

async function fetchJson(url, init) {
	const res = await fetch(url, init);
	const text = await res.text();
	if (!res.ok) {
		throw new Error(`${init?.method ?? "GET"} ${url} → ${res.status}\n${text.slice(0, 500)}`);
	}
	return text ? JSON.parse(text) : {};
}

function sleep(ms) {
	return new Promise((r) => setTimeout(r, ms));
}

// ----- Webflow fetch --------------------------------------------------------

async function fetchAllWebflowItems(collectionId, token) {
	const items = [];
	let offset = 0;
	const limit = 100;
	while (true) {
		const url = `https://api.webflow.com/v2/collections/${collectionId}/items?limit=${limit}&offset=${offset}`;
		const page = await fetchJson(url, {
			headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
		});
		const pageItems = page.items ?? [];
		items.push(...pageItems);
		const total = page.pagination?.total ?? items.length;
		process.stdout.write(`\rFetching Webflow items: ${items.length}/${total}`);
		if (pageItems.length < limit || items.length >= total) break;
		offset += limit;
	}
	process.stdout.write("\n");
	return items;
}

// ----- Notion: read existing rows -------------------------------------------

async function fetchExistingTokuUrls(notionToken, clientRelationId) {
	const seen = new Set();
	let cursor;
	do {
		const body = {
			page_size: 100,
			filter: {
				property: "Client",
				relation: { contains: clientRelationId },
			},
		};
		if (cursor) body.start_cursor = cursor;
		const res = await fetchJson(
			`https://api.notion.com/v1/data_sources/${WEBSITE_CONTENT_DATA_SOURCE_ID}/query`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${notionToken}`,
					"Notion-Version": NOTION_VERSION,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(body),
			},
		);
		for (const row of res.results ?? []) {
			const url = row.properties?.URL?.url;
			if (url) seen.add(url.replace(/\/$/, "").toLowerCase());
		}
		cursor = res.next_cursor ?? undefined;
	} while (cursor);
	return seen;
}

// ----- Notion: create row ---------------------------------------------------

async function createNotionRow(notionToken, clientRelationId, item, urlPath) {
	const fd = item.fieldData ?? {};
	const title = (fd.heading ?? fd.name ?? "(untitled)").slice(0, 2000);
	const slug = fd.slug;
	if (!slug) throw new Error(`Item ${item.id} has no slug`);
	const url = `https://www.toku.com${urlPath}/${slug}`;
	const publishDateRaw = fd["displayed-publish-date"] ?? item.createdOn ?? null;
	const lastUpdatedRaw = item.lastUpdated ?? null;
	const metaDesc = (fd["short-description"] ?? "").slice(0, 2000);

	const props = {
		Title: { title: [{ text: { content: title } }] },
		URL: { url },
		Status: { status: { name: "Published" } },
		Client: { relation: [{ id: clientRelationId }] },
		"Content Type": { select: { name: "Blog Post" } },
	};
	if (publishDateRaw) {
		props["Publish Date"] = { date: { start: publishDateRaw.slice(0, 10) } };
	}
	if (lastUpdatedRaw) {
		props["Last Updated"] = { date: { start: lastUpdatedRaw.slice(0, 10) } };
	}
	if (metaDesc) {
		props["Meta Description"] = { rich_text: [{ text: { content: metaDesc } }] };
	}

	await fetchJson(`https://api.notion.com/v1/pages`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${notionToken}`,
			"Notion-Version": NOTION_VERSION,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			parent: { data_source_id: WEBSITE_CONTENT_DATA_SOURCE_ID },
			properties: props,
		}),
	});
	return url;
}

// ----- main -----------------------------------------------------------------

async function main() {
	const args = parseArgs(process.argv);
	loadEnvFile(ENV_PATH);

	const clients = JSON.parse(readFileSync(CLIENTS_PATH, "utf8"));
	const client = clients[args.client];
	if (!client) {
		console.error(`ERROR: client '${args.client}' not found in clients.json`);
		process.exit(1);
	}
	if (client.cmsType !== "webflow") {
		console.error(`ERROR: client '${args.client}' has cmsType '${client.cmsType}', expected 'webflow'`);
		process.exit(1);
	}
	const tokenName = client.cmsConfig?.tokenEnvVar;
	const cmsToken = process.env[tokenName];
	if (!cmsToken) {
		console.error(`ERROR: env var ${tokenName} not set (loaded from ${ENV_PATH})`);
		process.exit(1);
	}
	const notionToken = process.env.NOTION_API_TOKEN;
	if (!notionToken) {
		console.error(`ERROR: NOTION_API_TOKEN not set`);
		process.exit(1);
	}
	const urlPath = URL_PATH_BY_CLIENT[args.client] ?? "/blog";
	const collectionId = client.cmsConfig?.blogCollectionId;
	if (!collectionId) {
		console.error(`ERROR: client '${args.client}' has no cmsConfig.blogCollectionId`);
		process.exit(1);
	}

	console.log(`Client:          ${args.client} (${client.displayName})`);
	console.log(`Webflow site:    ${client.cmsConfig.siteId}`);
	console.log(`Collection:      ${collectionId}`);
	console.log(`URL pattern:     https://www.${client.domain}${urlPath}/{slug}`);
	console.log(`Dry run:         ${args.dryRun}`);
	console.log(`Limit:           ${args.limit === Infinity ? "(no limit)" : args.limit}`);
	console.log();

	const items = await fetchAllWebflowItems(collectionId, cmsToken);
	const live = items.filter((it) => !it.isDraft && !it.isArchived);
	console.log(`Webflow items: ${items.length} total → ${live.length} live (after draft/archived filter)`);

	console.log("Fetching existing Notion rows for this client...");
	const existing = await fetchExistingTokuUrls(notionToken, client.notionRelationId);
	console.log(`Existing Notion rows for ${client.displayName}: ${existing.size}`);

	const toCreate = [];
	const skipped = [];
	for (const it of live) {
		const slug = it.fieldData?.slug;
		if (!slug) {
			skipped.push({ id: it.id, reason: "no slug" });
			continue;
		}
		const url = `https://www.${client.domain}${urlPath}/${slug}`;
		const norm = url.replace(/\/$/, "").toLowerCase();
		if (existing.has(norm)) {
			skipped.push({ id: it.id, reason: "already in Notion", url });
			continue;
		}
		toCreate.push(it);
		if (toCreate.length >= args.limit) break;
	}
	console.log(`Plan: create ${toCreate.length}, skip ${skipped.length}`);

	if (args.dryRun) {
		console.log("\n--- DRY RUN: first 5 items that would be created ---");
		for (const it of toCreate.slice(0, 5)) {
			const fd = it.fieldData ?? {};
			console.log(`  + ${fd.slug}`);
			console.log(`    title: ${(fd.heading ?? fd.name ?? "(untitled)").slice(0, 80)}`);
			console.log(`    url:   https://www.${client.domain}${urlPath}/${fd.slug}`);
			console.log(`    date:  ${(fd["displayed-publish-date"] ?? it.createdOn ?? "").slice(0, 10)}`);
		}
		console.log("\nDry run complete. Re-run without --dry-run to create rows.");
		return;
	}

	console.log("\nCreating Notion rows (throttled to ~3/sec)...");
	let created = 0;
	let failed = 0;
	for (const it of toCreate) {
		try {
			const url = await createNotionRow(notionToken, client.notionRelationId, it, urlPath);
			created++;
			process.stdout.write(`\rCreated ${created}/${toCreate.length}  (last: ${url.slice(-60)})           `);
		} catch (e) {
			failed++;
			console.error(`\n  FAIL ${it.fieldData?.slug ?? it.id}: ${e.message.slice(0, 200)}`);
		}
		await sleep(330); // ~3 req/sec
	}
	process.stdout.write("\n");
	console.log(`\nDone. created=${created} failed=${failed} skipped=${skipped.length}`);
}

main().catch((e) => {
	console.error("FATAL:", e);
	process.exit(1);
});
