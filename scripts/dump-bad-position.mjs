/**
 * Reproduce the failing CMS fetch and dump 80 chars around position 784600.
 */
import { readFileSync } from "fs";

const env = readFileSync(".env.local", "utf8").split("\n").reduce((a, l) => {
  const m = l.match(/^([^=]+)=(.*)$/);
  if (m) a[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  return a;
}, {});

const PROJECT = "xjjjqhgt";
const DATASET = "production";
const TOKEN = env.SANITY_API_TOKEN;

const QUERY = `*[_type == "blogPost"] | order(publishedDate desc) {
  "id": _id, name, "slug": slug.current,
  "meta-title": metaTitle,
  "meta-description": metaDescription,
  "thumbnail": thumbnail { "url": asset->url, "alt": alt },
  excerpt,
  "direct-answer": directAnswer,
  content,
  "time-to-read": timeToRead,
  featured,
  "published-date": publishedDate,
  "last-updated": lastUpdated,
  "author": author._ref,
  "category": category._ref,
  "categories": categories[]._ref,
  "faq": faq[]{ question, answer },
  "visuals": visuals[]{ _key, position, type, alt, caption, "asset": asset { "url": asset->url, "alt": alt }, generation, chart, capture }
}`;

const url = `https://${PROJECT}.api.sanity.io/v2025-03-29/data/query/${DATASET}?query=${encodeURIComponent(QUERY)}`;
const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
const raw = await res.text();
console.log(`Response length: ${raw.length} chars`);

const pos = 784600;
const start = Math.max(0, pos - 60);
const end = Math.min(raw.length, pos + 60);
const slice = raw.slice(start, end);
console.log(`Bytes ${start}–${end}:`);
console.log(JSON.stringify(slice));
console.log("");
console.log(`Char at ${pos}:`, raw.charCodeAt(pos), `U+${raw.charCodeAt(pos).toString(16).toUpperCase().padStart(4, "0")}`);
console.log(`Char at ${pos - 1}:`, raw.charCodeAt(pos - 1), `U+${raw.charCodeAt(pos - 1).toString(16).toUpperCase().padStart(4, "0")}`);
console.log(`Char at ${pos + 1}:`, raw.charCodeAt(pos + 1), `U+${raw.charCodeAt(pos + 1).toString(16).toUpperCase().padStart(4, "0")}`);

// Also find ALL control characters in the response
const CONTROL = new RegExp("[\\u0000-\\u0008\\u000b\\u000c\\u000e-\\u001f]", "g");
const allCtrl = [];
let m;
while ((m = CONTROL.exec(raw)) !== null) {
  allCtrl.push({ idx: m.index, cp: m[0].codePointAt(0) });
  if (allCtrl.length > 10) break;
}
console.log(`\nFirst ${allCtrl.length} bad-control-char positions (excluding \\t \\n \\r):`);
for (const c of allCtrl) {
  const ctx = raw.slice(Math.max(0, c.idx - 40), c.idx + 40);
  console.log(`  idx ${c.idx} U+${c.cp.toString(16).toUpperCase().padStart(4, "0")} → ${JSON.stringify(ctx)}`);
}

// Try parsing directly to reproduce the error
console.log("\n--- JSON.parse attempt ---");
try {
  const parsed = JSON.parse(raw);
  console.log(`✓ Parsed OK. ${parsed.result?.length || 0} blog posts.`);
} catch (e) {
  console.log(`✗ ${e.message}`);
  // Show the exact area Sanity's client is choking on
  const m = e.message.match(/position (\d+)/);
  if (m) {
    const p = parseInt(m[1], 10);
    console.log(`Context around position ${p}:`);
    console.log(JSON.stringify(raw.slice(Math.max(0, p - 60), p + 60)));
    console.log(`Char at ${p}: U+${raw.charCodeAt(p).toString(16).toUpperCase().padStart(4, "0")} (${raw.charCodeAt(p)})`);
  }
}
