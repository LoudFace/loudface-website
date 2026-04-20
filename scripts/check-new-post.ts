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

c.fetch(
  `*[_type == "blogPost" && slug.current == "best-b2b-saas-seo-agencies"][0]{
    _id, name, metaTitle, metaDescription, excerpt, timeToRead, featured,
    publishedDate, lastUpdated,
    "author": author->name,
    "faqCount": count(faq),
    "contentLength": length(content)
  }`,
).then((d) => console.log(JSON.stringify(d, null, 2)));
