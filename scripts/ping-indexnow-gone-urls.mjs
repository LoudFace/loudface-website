#!/usr/bin/env node
/**
 * Ping IndexNow for URLs that now return 410, to accelerate deindex on
 * Bing / Yandex / ChatGPT-search. Google does not participate in IndexNow,
 * so Google deindex still happens passively over 30-60 days. For Google
 * specifically, use the GSC URL Removal tool if immediate deindex is needed.
 *
 * Reads the GONE_URLS from middleware.ts implicitly — hardcoded here so the
 * script stays self-contained.
 */

import { readFileSync } from "node:fs";
import path from "node:path";

if (!process.env.INDEXNOW_KEY) {
	try {
		const envPath = path.resolve(process.cwd(), ".env.local");
		const env = readFileSync(envPath, "utf8");
		const m = env.match(/^INDEXNOW_KEY=(.+)$/m);
		if (m) process.env.INDEXNOW_KEY = m[1].trim();
	} catch {}
}

const KEY = process.env.INDEXNOW_KEY;
if (!KEY) {
	console.error("INDEXNOW_KEY not found in env or .env.local");
	process.exit(1);
}

const HOST = "www.loudface.co";
const ORIGIN = `https://${HOST}`;

const GONE_URLS = [
	"/case-studies/finnrick-analytics",
	"/case-studies/mycryptoguide",
	"/case-studies/draw-things",
];

const urlList = GONE_URLS.map((p) => `${ORIGIN}${p}`);

console.log(`Pinging IndexNow for ${urlList.length} GONE URLs...`);
urlList.forEach((u) => console.log(`  ${u}`));

const res = await fetch("https://api.indexnow.org/IndexNow", {
	method: "POST",
	headers: { "Content-Type": "application/json; charset=utf-8" },
	body: JSON.stringify({
		host: HOST,
		key: KEY,
		keyLocation: `${ORIGIN}/${KEY}.txt`,
		urlList,
	}),
});

const text = await res.text().catch(() => "");
console.log(`\nIndexNow response: ${res.status} ${res.statusText}`);
if (text) console.log(`  body: ${text.slice(0, 300)}`);
console.log(
	`\n✓ Bing / Yandex / ChatGPT-search will recrawl within hours and see 410s.`,
);
console.log(
	`  For Google: submit https://www.loudface.co/case-studies/finnrick-analytics`,
);
console.log(
	`  via the GSC URL Removal tool if immediate Google deindex is needed.`,
);
