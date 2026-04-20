import { createClient, type SanityClient } from '@sanity/client';
import { requireEnv } from './env';
import fs from 'fs';

let cachedClient: SanityClient | null = null;

export function sanityClient(): SanityClient {
  if (cachedClient) return cachedClient;
  cachedClient = createClient({
    projectId: requireEnv('NEXT_PUBLIC_SANITY_PROJECT_ID'),
    dataset: requireEnv('NEXT_PUBLIC_SANITY_DATASET'),
    apiVersion: '2025-03-29',
    useCdn: false,
    token: requireEnv('SANITY_API_TOKEN'),
  });
  return cachedClient;
}

/** Sanity's draft convention: prepending "drafts." keeps the published doc untouched. */
export function draftId(publishedId: string): string {
  return publishedId.startsWith('drafts.') ? publishedId : `drafts.${publishedId}`;
}

export function publishedId(anyId: string): string {
  return anyId.replace(/^drafts\./, '');
}

export async function fetchBlogPostBySlug(slug: string) {
  const client = sanityClient();
  const query = `*[_type == "blogPost" && slug.current == $slug][0]{
    _id,
    _rev,
    name,
    "slug": slug.current,
    excerpt,
    content,
    visuals,
    thumbnail
  }`;
  return client.fetch(query, { slug });
}

export async function uploadImageAsset(localPath: string, filename: string) {
  const client = sanityClient();
  const buffer = fs.readFileSync(localPath);
  const asset = await client.assets.upload('image', buffer, {
    filename,
    contentType: 'image/png',
  });
  return asset;
}
