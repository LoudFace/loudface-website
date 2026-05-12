/**
 * Draft mode ENABLE endpoint — called by Sanity Presentation when an editor
 * starts a preview session. Flips Next.js draft mode on (sets a signed cookie)
 * so that subsequent SSR fetches via `getServerClient()` return drafts.
 *
 * The helper from `next-sanity/draft-mode` validates the request against the
 * Sanity project's CORS origins, requires authentication via the token, and
 * redirects to the preview URL when successful.
 */
import { defineEnableDraftMode } from 'next-sanity/draft-mode';
import { client } from '@/lib/sanity.client';

export const { GET } = defineEnableDraftMode({
  client: client.withConfig({ token: process.env.SANITY_API_TOKEN }),
});
