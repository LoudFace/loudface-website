import { homeShare } from './og-v11/share';

// Node runtime (not edge): the image reads its fonts and photograph from /public, and only the Node runtime honors
// `revalidate` for ISR caching. Generated once and cached ~31 days.
export const revalidate = 2678400;
export const alt = 'LoudFace - AI-Native B2B SaaS Organic Growth';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** The site's default share card in v11 (og-v11/share.tsx): the homepage photograph with the line beside it. */
export default async function Image() {
  return homeShare({
    line: 'AI-Native Organic Growth for B2B SaaS',
    sub: 'GEO, SEO, AEO, content, and conversion across your stack',
    url: 'www.loudface.co',
  });
}
