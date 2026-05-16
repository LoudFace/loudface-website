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

// Keep under 48 chars to avoid truncation
const NEW_META_TITLE = "8 Webflow Agency Red Flags to Walk Away From";

console.log(`New metaTitle: "${NEW_META_TITLE}" (${NEW_META_TITLE.length} chars)`);

const result = await client
  .patch("imported-blogPost-67be8cab6abd92ebf2a4ea0f")
  .set({ metaTitle: NEW_META_TITLE })
  .commit();

console.log(`✓ Patched metaTitle for pitfalls-of-choosing-wrong-webflow-vendor`);
console.log(`  _rev: ${result._rev}`);
