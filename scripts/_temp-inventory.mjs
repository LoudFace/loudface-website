import { readFileSync } from 'node:fs';
import { createClient } from '@sanity/client';

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n')
    .map(l => l.trim().match(/^([A-Z_]+)=(.*)$/))
    .filter(Boolean).map(m => [m[1], m[2]])
);

const client = createClient({
  projectId: 'xjjjqhgt',
  dataset: 'production',
  apiVersion: '2025-03-29',
  useCdn: false,
  token: env.SANITY_API_TOKEN,
});

const blog = await client.fetch(`*[_type == "blogPost" && defined(slug.current)] | order(publishedDate desc) [0...80] { "slug": slug.current, name, "industry": industry, publishedDate }`);
const cs = await client.fetch(`*[_type == "caseStudy" && defined(slug.current)] | order(publishedDate desc) { "slug": slug.current, name, industry }`);

console.log('## CASE STUDIES');
for (const c of cs) {
  console.log(`- /case-studies/${c.slug} — ${c.name} (industry: ${c.industry || 'unspecified'})`);
}
console.log('\n## BLOG POSTS (last 80)');
for (const b of blog) {
  console.log(`- /blog/${b.slug} — ${b.name}`);
}
