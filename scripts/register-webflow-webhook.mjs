#!/usr/bin/env node
/**
 * Register (or update) a Webflow webhook pointing at our Notion worker's
 * webflowPublish endpoint. Reusable for any Webflow tenant in clients.json.
 *
 * Usage:
 *   node scripts/register-webflow-webhook.mjs --client <slug> \
 *       --url <notion-worker-webhook-url> \
 *       [--trigger collection_item_published] [--dry-run] [--list-only]
 *
 * Default trigger: collection_item_published. This fires when an editor
 * publishes an item live on the production site (which is what we want —
 * draft saves shouldn't create Notion rows).
 *
 * Idempotent: lists existing webhooks for the tenant's site first and
 * removes any prior registration for the same URL before creating the new
 * one. Re-running with the same args is a no-op (delete-then-create yields
 * the same final state).
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, "..");
const CLIENTS_PATH = resolve(REPO_ROOT, "clients.json");
const ENV_PATH = resolve(REPO_ROOT, "workers/loudface-seo-sync/.env");

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

function parseArgs(argv) {
	const args = { dryRun: false, listOnly: false, trigger: "collection_item_published" };
	for (let i = 2; i < argv.length; i++) {
		const a = argv[i];
		if (a === "--client") args.client = argv[++i];
		else if (a === "--url") args.url = argv[++i];
		else if (a === "--trigger") args.trigger = argv[++i];
		else if (a === "--dry-run") args.dryRun = true;
		else if (a === "--list-only") args.listOnly = true;
	}
	if (!args.client) {
		console.error("ERROR: --client <slug> is required");
		process.exit(1);
	}
	return args;
}

async function fetchJson(url, init) {
	const res = await fetch(url, init);
	const text = await res.text();
	if (!res.ok) {
		throw new Error(`${init?.method ?? "GET"} ${url} → ${res.status}\n${text.slice(0, 500)}`);
	}
	return text ? JSON.parse(text) : {};
}

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
	const token = process.env[tokenName];
	if (!token) {
		console.error(`ERROR: env var ${tokenName} not set`);
		process.exit(1);
	}
	const siteId = client.cmsConfig.siteId;

	console.log(`Tenant:        ${args.client} (${client.displayName})`);
	console.log(`Webflow site:  ${siteId}`);
	console.log(`Trigger:       ${args.trigger}`);

	const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

	// 1. List existing webhooks for this site
	const existing = await fetchJson(`https://api.webflow.com/v2/sites/${siteId}/webhooks`, { headers });
	const webhooks = existing.webhooks ?? [];
	console.log(`\nExisting webhooks: ${webhooks.length}`);
	for (const wh of webhooks) {
		console.log(`  - ${wh.id} | ${wh.triggerType} | ${wh.url}`);
	}

	if (args.listOnly) {
		console.log("\n(list-only mode — no changes)");
		return;
	}
	if (!args.url) {
		console.error("\nERROR: --url is required (unless --list-only)");
		process.exit(1);
	}

	// 2. Remove any prior registration of THIS url + trigger combo (idempotency)
	const conflicts = webhooks.filter(
		(wh) => wh.url === args.url && wh.triggerType === args.trigger,
	);
	for (const wh of conflicts) {
		if (args.dryRun) {
			console.log(`\nDRY: would delete existing webhook ${wh.id}`);
			continue;
		}
		await fetchJson(`https://api.webflow.com/v2/webhooks/${wh.id}`, {
			method: "DELETE",
			headers,
		});
		console.log(`\nDeleted prior webhook ${wh.id} (clean re-register)`);
	}

	// 3. Create the new webhook
	if (args.dryRun) {
		console.log(`\nDRY: would POST /v2/sites/${siteId}/webhooks with`);
		console.log(JSON.stringify({ triggerType: args.trigger, url: args.url }, null, 2));
		return;
	}
	const created = await fetchJson(`https://api.webflow.com/v2/sites/${siteId}/webhooks`, {
		method: "POST",
		headers,
		body: JSON.stringify({ triggerType: args.trigger, url: args.url }),
	});
	console.log(`\nCreated webhook ${created.id} → ${created.url}`);
	console.log(`Trigger: ${created.triggerType}`);
	console.log(`Workspace: ${created.workspaceId ?? "(n/a)"}`);
}

main().catch((e) => {
	console.error("FATAL:", e);
	process.exit(1);
});
