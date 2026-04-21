/**
 * Upload the folder-stack illustration as the thumbnail for
 * "Best AEO Agencies for B2B SaaS in 2026 (Ranked)".
 *
 * Steps:
 *   1. Upload the local PNG to Sanity as an image asset.
 *   2. Patch the published doc with the thumbnail reference (no draft
 *      round-trip — the article is already published and has no active
 *      draft).
 *
 * Run: npx tsx scripts/set-best-aeo-agencies-thumbnail.ts
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2025-03-29',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
  perspective: 'raw',
});

const DOC_ID = 'blogPost-best-aeo-agencies-b2b-saas-2026';
const IMAGE_PATH = '/Users/arnel/Downloads/7sIWs2XO9-TGUt9epnGaI_3D2OZQT9.png';
const IMAGE_FILENAME = 'best-aeo-agencies-b2b-saas-2026-thumbnail.png';
const THUMBNAIL_ALT =
  'Stacked manila file folders labeled AEO Agencies, Strategy, SEO, and 2026 against a deep blue background, representing a field guide to the best AEO agencies for B2B SaaS.';

async function main() {
  if (!fs.existsSync(IMAGE_PATH)) {
    throw new Error(`Image not found at ${IMAGE_PATH}`);
  }
  const stats = fs.statSync(IMAGE_PATH);
  console.log(`→ Uploading ${IMAGE_PATH} (${(stats.size / 1024).toFixed(0)} KB)`);

  const buffer = fs.readFileSync(IMAGE_PATH);
  const asset = await sanity.assets.upload('image', buffer, {
    filename: IMAGE_FILENAME,
    contentType: 'image/png',
  });
  console.log(`→ Asset uploaded: ${asset._id}`);

  const thumbnail = {
    _type: 'image',
    asset: { _type: 'reference', _ref: asset._id },
    alt: THUMBNAIL_ALT,
  };

  const result = await sanity
    .patch(DOC_ID)
    .set({
      thumbnail,
      lastUpdated: new Date().toISOString(),
    })
    .commit();

  console.log(`✓ Thumbnail attached to ${result._id} (rev ${result._rev}).`);
  console.log(`  Asset URL: ${asset.url}`);
  console.log(`  Live: https://www.loudface.co/blog/best-aeo-agencies-b2b-saas-2026`);
}

main().catch((err) => {
  console.error('✗ Failed:');
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
