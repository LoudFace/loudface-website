#!/usr/bin/env node
/**
 * Fix the branded-search-spillover section in the Toku case study.
 *
 * The original table included "toku login +700%" framed as an AEO spillover
 * signal. That's actually existing-customer noise (users finding the login
 * page via Google), not net-new AI-driven discovery. The honest signal is
 * brand-modifier queries that didn't exist before the engagement (NEW from
 * zero), which only appear when someone learns about Toku from a new surface.
 *
 * This fix:
 * - Drops "toku login" row entirely
 * - Reorders the table to lead with the three NEW-from-zero queries (clearest signal)
 * - Tightens the framing paragraph to focus on net-new queries
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

const DOC_ID = "0991ec36-3e3b-4b79-84ee-e7a46337be03";

const OLD_SECTION = `<p>When an AI engine names a brand, the buyer opens Google and types that brand name. Strongest indirect signal the AI work is landing. Five branded-variant queries grew sharply between February and April:</p>
<table>
<thead><tr><th>Branded Query</th><th>Feb</th><th>April</th><th>Change</th></tr></thead>
<tbody>
<tr><td>toku login</td><td>1</td><td>8</td><td><strong>+700%</strong></td></tr>
<tr><td>toku eor</td><td>8</td><td>17</td><td><strong>+112%</strong></td></tr>
<tr><td>toku web3</td><td>0</td><td>11</td><td>NEW</td></tr>
<tr><td>toku token</td><td>0</td><td>6</td><td>NEW</td></tr>
<tr><td>toku app</td><td>0</td><td>5</td><td>NEW</td></tr>
</tbody>
</table>
<p>Nobody types "toku web3" into Google because they saw a billboard. They type it because they read a Reddit thread, watched a YouTube explainer, or, increasingly, asked an AI "what's the best crypto payroll vendor" and were handed Toku. The branded-search lift is the receipt the AEO work leaves behind.</p>`;

const NEW_SECTION = `<p>When an AI engine names a brand, the buyer opens Google and types that brand name. The cleanest signal: brand-modifier queries that didn't exist before the engagement window. Three brand-modifier queries appeared NEW between February and April, and a fourth (the category-term "eor" search) grew sharply:</p>
<table>
<thead><tr><th>Branded Query</th><th>Feb</th><th>April</th><th>Change</th></tr></thead>
<tbody>
<tr><td>toku web3</td><td>0</td><td>11</td><td><strong>NEW</strong></td></tr>
<tr><td>toku token</td><td>0</td><td>6</td><td><strong>NEW</strong></td></tr>
<tr><td>toku app</td><td>0</td><td>5</td><td><strong>NEW</strong></td></tr>
<tr><td>toku eor</td><td>8</td><td>17</td><td>+112%</td></tr>
</tbody>
</table>
<p>Nobody types "toku web3" into Google because they saw a billboard. They type it because they read a Reddit thread, watched a YouTube explainer, or, increasingly, asked an AI "what's the best crypto payroll vendor" and were handed Toku. The branded-search lift on the NEW queries is the receipt the AEO work leaves behind. Login and account-tied searches are excluded from this analysis: those grow with the customer base, not with AI citations.</p>`;

const current = await client.getDocument(DOC_ID);
if (!current?.mainBody?.includes(OLD_SECTION)) {
	console.error("Old section not found verbatim — manual review needed");
	console.error("First 300 chars of expected section:", OLD_SECTION.slice(0, 300));
	process.exit(1);
}

const newBody = current.mainBody.replace(OLD_SECTION, NEW_SECTION);

const result = await client
	.patch(DOC_ID)
	.set({ mainBody: newBody })
	.commit();

console.log(`✓ Fixed Toku case study branded-search section`);
console.log(`  _id: ${result._id}`);
console.log(`  _rev: ${result._rev}`);
console.log(`  mainBody now ${result.mainBody.length} chars`);
