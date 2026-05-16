#!/usr/bin/env node
/**
 * Remove the "toku login +700%" vanity-metric bullet from /blog/webflow-for-fintech
 * and replace with honest signal (NEW branded queries that didn't exist before).
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

const DOC_ID = "imported-blogPost-696e9240f28f0336ccaf9f62";

const OLD_LINE = `<li><strong>+700% branded search lift</strong> on "toku login": the spillover signal that AI citations are landing</li>`;
const NEW_LINE = `<li><strong>NEW branded queries appearing from zero</strong> ("toku web3", "toku token", "toku app"): brand-modifier searches that didn't exist before the engagement window. Net-new searches are the cleanest signal that AI citations are driving discovery, because they only appear when someone learned about Toku from a new surface.</li>`;

const current = await client.getDocument(DOC_ID);
if (!current?.content?.includes(OLD_LINE)) {
	console.error("Old line not found verbatim — manual review needed");
	process.exit(1);
}
const newContent = current.content.replace(OLD_LINE, NEW_LINE);

const result = await client
	.patch(DOC_ID)
	.set({ content: newContent, lastUpdated: new Date().toISOString() })
	.commit();

console.log(`✓ Fixed /blog/webflow-for-fintech: removed toku login bullet, added NEW-queries framing`);
console.log(`  _rev: ${result._rev}`);
