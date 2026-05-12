import { createClient } from 'next-sanity';
import { draftMode } from 'next/headers';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;
const apiVersion = '2025-03-29';

/**
 * Public, read-only client. Uses CDN in production.
 * Use for: published-content reads from anywhere (server or browser).
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: process.env.NODE_ENV === 'production',
});

/**
 * Server-only client with write permissions. Bypasses CDN.
 * Use for: migrations, webhook handlers, anything that needs to mutate data.
 */
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

/**
 * Draft-aware server client. Reads Next.js draft-mode state and returns:
 *   - draft mode ON  → authenticated client, drafts perspective, stega encoding
 *     (powers Visual Editing — click-to-edit overlays in /studio/presentation)
 *   - draft mode OFF → the standard public read-only client
 *
 * Use this in server components / route handlers that fetch content the
 * editor may want to preview before publishing (case-study slug page, blog
 * slug page, team-member page, etc).
 *
 * MUST be called from a server context. Will throw in client components.
 */
export const getServerClient = async () => {
  const isDraft = (await draftMode()).isEnabled;
  if (!isDraft) return client;

  return client.withConfig({
    useCdn: false,
    perspective: 'drafts',
    token: process.env.SANITY_API_TOKEN,
    stega: {
      enabled: true,
      studioUrl: '/studio',
    },
  });
};
