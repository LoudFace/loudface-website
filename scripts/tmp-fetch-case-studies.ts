import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2025-03-29',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
  perspective: 'raw',
});

const slugs = [
  'delshad-legal-content-engine',
  'trademomentum-niche-aeo-organic-growth',
  'genie-teacher-organic-growth',
  'loudface-aeo-case-study',
  'toku-ai-cited-pipeline',
];

async function main() {
  for (const slug of slugs) {
    const docs = await sanity.fetch(
      `*[_type == "caseStudy" && slug.current == $slug]`,
      { slug }
    );
    console.log('=== ' + slug + ' (' + docs.length + ' docs) ===');
    console.log(JSON.stringify(docs, null, 2));
    console.log('');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
