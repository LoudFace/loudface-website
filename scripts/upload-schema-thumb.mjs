import { createClient } from "@sanity/client";
import { readFileSync, createReadStream } from "fs";

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

// 1. Upload the PNG as a Sanity image asset
const imagePath = "/tmp/schema-thumb.png";
const stream = createReadStream(imagePath);

console.log("Uploading schema-thumb.png to Sanity...");
const asset = await client.assets.upload("image", stream, {
  filename: "schema-markup-for-aeo-2026-hero.png",
  contentType: "image/png",
});

console.log(`✓ Asset uploaded: ${asset._id}`);
console.log(`  URL: ${asset.url}`);

// 2. Patch the blogPost document with the new thumbnail reference
const altText = "Editorial hero illustration for schema markup AEO article showing JSON-LD code panel extracted by ChatGPT, Perplexity, Claude, and Google AI Overviews.";

const patched = await client
  .patch("blogPost-schema-markup-for-aeo-2026")
  .set({
    thumbnail: {
      _type: "image",
      asset: { _type: "reference", _ref: asset._id },
      alt: altText,
    },
    lastUpdated: new Date().toISOString(),
  })
  .commit();

console.log(`✓ Patched blogPost-schema-markup-for-aeo-2026 (rev ${patched._rev})`);
