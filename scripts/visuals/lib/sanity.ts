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
    // "raw" returns BOTH draft and published documents in a single query.
    // We need this so plan.ts can plan visuals for a freshly-created draft
    // that has no published version yet. Without it, Sanity v6+ defaults to
    // "published" and the planner reports "No blogPost found with slug".
    perspective: 'raw',
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
  // Return the FULL document (no projection). createOrReplace writes every
  // field we pass in, so a partial projection would silently wipe fields like
  // metaTitle, author, categories, faq, etc. when a fresh draft is created.
  // The slug field stays as its native object shape `{_type: 'slug', current}`.
  const query = `*[_type == "blogPost" && slug.current == $slug][0]`;
  return client.fetch(query, { slug });
}

/** Delete a document by ID. Used to clean up broken drafts. */
export async function deleteDocument(id: string): Promise<void> {
  const client = sanityClient();
  await client.delete(id);
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
