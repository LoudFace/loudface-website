/**
 * Upload the SEO Survival Playbook illustration as the thumbnail for
 * "The Complete Guide to Answer Engine Optimization (AEO) in 2026".
 *
 * Steps:
 *   1. Upload the local PNG to Sanity as an image asset.
 *   2. Patch the draft with the thumbnail image reference.
 *   3. Publish via the draft -> publish transaction pattern.
 *
 * Run: npx tsx scripts/set-aeo-thumbnail.ts
 */

import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

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

const DOC_ID = '32d87708-ad43-4d72-8e91-2598dfbdf4fe';
const IMAGE_PATH = '/Users/arnel/Downloads/nQbvS9cfSAZPvFgJ5LwL6_bg0MdQ4t.png';
const IMAGE_FILENAME = 'aeo-guide-2026-thumbnail.png';
const THUMBNAIL_ALT =
  'The SEO Survival Playbook: How to optimize for AI engines. Illustration of a glowing summit path winding up a purple mountain under a night sky.';

async function main() {
  if (!fs.existsSync(IMAGE_PATH)) {
    throw new Error(`Image not found at ${IMAGE_PATH}`);
  }
  const stats = fs.statSync(IMAGE_PATH);
  console.log(`[set-aeo-thumbnail] Uploading ${IMAGE_PATH} (${stats.size} bytes)`);

  // 1. Upload the image asset.
  const buffer = fs.readFileSync(IMAGE_PATH);
  const asset = await sanity.assets.upload('image', buffer, {
    filename: IMAGE_FILENAME,
    contentType: 'image/png',
  });
  console.log(`[set-aeo-thumbnail] Asset uploaded: ${asset._id}`);

  // 2. Fetch the existing doc so we can seed the draft.
  const existing = await sanity.getDocument(DOC_ID);
  if (!existing) {
    throw new Error(`Document ${DOC_ID} not found`);
  }

  const draftId = `drafts.${DOC_ID}`;
  await sanity
    .createIfNotExists({ ...existing, _id: draftId })
    .catch(() => null);

  const thumbnail = {
    _type: 'image',
    asset: { _type: 'reference', _ref: asset._id },
    alt: THUMBNAIL_ALT,
  };

  const now = new Date().toISOString();

  // 3. Patch draft with the thumbnail.
  const result = await sanity
    .patch(draftId)
    .set({
      thumbnail,
      lastUpdated: now,
    })
    .commit();

  console.log(`[set-aeo-thumbnail] Draft patched. _rev=${result._rev}`);

  // 4. Publish: replace the published doc with the draft content, then delete the draft.
  await sanity
    .transaction()
    .createOrReplace({ ...result, _id: DOC_ID })
    .delete(draftId)
    .commit();

  console.log(`[set-aeo-thumbnail] Published ${DOC_ID}`);
  console.log(`[set-aeo-thumbnail] Thumbnail asset: ${asset.url}`);
}

main().catch((err) => {
  console.error('[set-aeo-thumbnail] FAILED');
  console.error(err);
  process.exit(1);
});
