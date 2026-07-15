/**
 * work-v3 SERVER data layer (/case-studies gallery).
 *
 * The HERO marquee screenshots come LIVE from Sanity by slug via the homepage's
 * getHomeV3Images helper — the same slug set + query the homepage SelectedWork
 * and services exhibits use, so the images survive asset re-uploads. All four
 * flagship slugs are inside HOME_SLUGS, so this single fetch already covers them;
 * components append their own crop params and fall back to the hardcoded CDN URL
 * (in ./content) when a slug is absent, so a fetch failure can never blank a panel.
 *
 * IMPORTANT: this module pulls the Sanity client (which uses next/headers), so it
 * is server-only. Import it ONLY from Server Components. Static content + types
 * that client components need live in ./content (which imports nothing server-only).
 */
export { getHomeV3Images as getWorkImages } from '../home-v3/data';
export type { WorkImages } from './content';
