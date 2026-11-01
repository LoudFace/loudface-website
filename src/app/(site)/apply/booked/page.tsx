/**
 * /apply/booked — where an /apply booking lands (boards "Proposed · Apply booked · show-up page", approved by Arnel on
 * 2026-11-01). The /apply calendar step sends the visitor here after Cal.com confirms the booking, with nothing about
 * them in the address. Its job is the show-up rate: three steps before the call, Arnel's line, two real Search Console
 * charts and the signed guarantee. Like /apply it is noindex, has no site header (isBareRoute), and stays out of the
 * sitemap, llms.txt, the agent surface and the Markdown twins (the /apply prefix covers it in agent-surface.ts and
 * next.config.ts). The regular /thank-you is untouched. Copy in apply-booked.json.
 */
export const revalidate = 60;

import type { Metadata } from 'next';
import '../../../home-v11/home-v11.css';
import '../../../apply-v11/apply.css';
import '../../../apply-v11/booked.css';
import { getApplyBookedContent, getApplyContent } from '@/lib/content-utils';
import { getHomeV11Data } from '../../../home-v11/data';
import { BookedV11 } from '../../../apply-v11/BookedV11';

export const metadata: Metadata = {
  title: 'Your call is booked',
  description: 'Your call with Arnel is booked. Three small things make sure it happens and is worth your time.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/apply/booked' },
};

export default async function ApplyBookedPage() {
  const [c, apply, data] = await Promise.all([getApplyBookedContent(), getApplyContent(), getHomeV11Data()]);
  return <BookedV11 c={c} apply={apply} data={data} />;
}
