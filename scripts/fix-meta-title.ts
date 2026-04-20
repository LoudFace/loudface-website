import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });
import { createClient } from 'next-sanity';

const c = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2025-03-29',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

async function main() {
  const newTitle = 'Best B2B SaaS SEO Agencies in 2026 (Ranked)'; // 43 chars
  console.log('New metaTitle length:', newTitle.length);

  const r = await c
    .patch('blogPost-best-b2b-saas-seo-agencies')
    .set({ metaTitle: newTitle })
    .commit();
  console.log('metaTitle:', r.metaTitle);
}

main().catch(console.error);
