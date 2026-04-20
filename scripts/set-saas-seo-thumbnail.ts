/**
 * Upload and set thumbnail for the B2B SaaS SEO agencies blog post.
 *
 * Run: npx tsx scripts/set-saas-seo-thumbnail.ts
 */

import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2025-03-29',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

const DOC_ID = 'blogPost-best-b2b-saas-seo-agencies';
const IMAGE_PATH = path.resolve(process.cwd(), 'scripts/assets/saas-seo-agencies-thumbnail.png');
const ALT = 'Podium chart graphic ranking the 15+ best B2B SaaS SEO agencies in 2026';

async function main() {
  const buffer = fs.readFileSync(IMAGE_PATH);
  console.log('Uploading image:', IMAGE_PATH, `(${buffer.length} bytes)`);

  const asset = await sanity.assets.upload('image', buffer, {
    filename: 'saas-seo-agencies-thumbnail.png',
    contentType: 'image/png',
  });
  console.log('Asset uploaded:', asset._id);

  const result = await sanity
    .patch(DOC_ID)
    .set({
      thumbnail: {
        _type: 'image',
        asset: { _type: 'reference', _ref: asset._id },
        alt: ALT,
      },
    })
    .commit();

  console.log('Thumbnail set on:', result._id);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
