import { partnersShare } from '../../og-v11/share';

// Node runtime (not edge): the image reads its fonts from /public, and only the Node runtime honors `revalidate` for
// ISR caching. Generated once and cached ~31 days.
export const revalidate = 2678400;
export const alt = '10% lifetime commission — LoudFace Partner Program';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** The partner program's share card in v11 (og-v11/share.tsx): the offer over a drawn payout run. */
export default async function Image() {
  return partnersShare({
    line: '10% lifetime commission',
    sub: 'Refer one B2B SaaS client. Earn for as long as they stay.',
    url: 'loudface.co/partners',
  });
}
