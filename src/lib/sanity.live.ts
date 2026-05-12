import { defineLive } from 'next-sanity/live';
import { client } from './sanity.client';

/**
 * Sanity Live — the official next-sanity helper for live, draft-aware data
 * fetching with Visual Editing support.
 *
 * Provides:
 * - `sanityFetch`: server-side fetch helper that automatically returns drafts
 *   (with stega encoding) when Next.js draft mode is enabled, and published
 *   content otherwise. Calls subscribe to Content Lake updates.
 * - `SanityLive`: client component to mount once at the layout root. It
 *   establishes the EventSource connection to the Content Lake so subscribed
 *   queries refresh as soon as edits are saved in Studio — no manual refresh
 *   needed in the Presentation iframe.
 *
 * Mount `<SanityLive />` unconditionally in the (site) layout — it's the
 * piece that lets the Presentation comlink establish on first iframe load,
 * before draft mode is even toggled on.
 *
 * Bumped apiVersion to v2025-02-19 (or newer) is required for the live API.
 */
export const { sanityFetch, SanityLive } = defineLive({
  client: client.withConfig({ apiVersion: 'v2025-02-19' }),
});
