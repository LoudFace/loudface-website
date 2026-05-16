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

const result = await client
  .patch("imported-blogPost-68e6ba39d00043772830604c")
  .set({ metaTitle: "Best Webflow Agencies 2026: Top 15+ Ranked" })
  .commit();

console.log(`✓ Patched metaTitle for best-webflow-agencies`);
console.log(`  _rev: ${result._rev}`);
