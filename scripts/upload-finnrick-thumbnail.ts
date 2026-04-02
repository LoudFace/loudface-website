/**
 * Captures a screenshot of finnrick.com and uploads it as the case study thumbnail in Sanity.
 *
 * Usage: npx tsx scripts/upload-finnrick-thumbnail.ts
 * Requires: SANITY_API_TOKEN in .env.local
 */

import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import path from 'path';
import { execSync } from 'child_process';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });

const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const SANITY_TOKEN = process.env.SANITY_API_TOKEN;

if (!SANITY_PROJECT_ID || !SANITY_DATASET || !SANITY_TOKEN) {
  console.error('Missing Sanity env vars.');
  process.exit(1);
}

const sanity = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: '2025-03-29',
  useCdn: false,
  token: SANITY_TOKEN,
});

const CASE_STUDY_ID = 'case-study-finnrick-analytics';
const CLIENT_ID = 'client-finnrick-analytics';
const TMP_PATH = '/tmp/finnrick-screenshot.png';

async function captureScreenshot() {
  console.log('📸 Capturing finnrick.com screenshot...');

  // Use Chrome in headless mode to take a screenshot
  const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  execSync(
    `"${chromePath}" --headless=new --disable-gpu --window-size=1280,800 --screenshot="${TMP_PATH}" --hide-scrollbars https://finnrick.com`,
    { timeout: 30000 }
  );

  if (!fs.existsSync(TMP_PATH)) {
    throw new Error('Screenshot failed — file not created');
  }

  console.log(`✓ Screenshot saved to ${TMP_PATH}`);
}

async function uploadAndPatch() {
  // Upload image to Sanity
  console.log('⬆️  Uploading to Sanity...');
  const imageBuffer = fs.readFileSync(TMP_PATH);
  const asset = await sanity.assets.upload('image', imageBuffer, {
    filename: 'finnrick-homepage.png',
    contentType: 'image/png',
  });
  console.log(`✓ Uploaded asset: ${asset._id}`);

  const imageRef = {
    _type: 'image',
    asset: { _type: 'reference', _ref: asset._id },
    alt: 'Finnrick Analytics homepage showing peptide vendor ratings',
  };

  // Patch case study — use raw mutation to handle hyphenated field names
  console.log('🔗 Patching case study...');
  await sanity
    .transaction()
    .createOrReplace({
      ...(await sanity.getDocument(CASE_STUDY_ID)),
      mainProjectImageThumbnail: imageRef,
    } as any)
    .commit();
  console.log('✓ Case study thumbnail updated');

  // Clean up
  fs.unlinkSync(TMP_PATH);
  console.log('\n✅ Done! Finnrick case study thumbnail is now set.');
}

async function main() {
  await captureScreenshot();
  await uploadAndPatch();
}

main().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
