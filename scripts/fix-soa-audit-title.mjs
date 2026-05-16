import { createClient } from "@sanity/client";
import { readFileSync } from "fs";

const env = readFileSync(".env.local", "utf8").split("\n").reduce((a, l) => {
  const m = l.match(/^([^=]+)=(.*)$/);
  if (m) a[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  return a;
}, {});

const client = createClient({
  projectId: "xjjjqhgt",
  dataset: "production",
  apiVersion: "2025-03-29",
  useCdn: false,
  token: env.SANITY_API_TOKEN,
});

// Keep under 48 chars to avoid Next.js title-template truncation
const NEW_META_TITLE = "Share-of-Answer Audit: 90-Minute Playbook";

console.log(`New metaTitle: "${NEW_META_TITLE}" (${NEW_META_TITLE.length} chars)`);
if (NEW_META_TITLE.length > 48) {
  console.error("ERROR: too long");
  process.exit(1);
}

const result = await client
  .patch("099633fb-5731-40c8-94c0-5bf32fa7f2c3")
  .set({
    metaTitle: NEW_META_TITLE,
    lastUpdated: new Date().toISOString(),
  })
  .commit();

console.log(`✓ Patched metaTitle for share-of-answer-audit-90-minutes`);
console.log(`  _rev: ${result._rev}`);
