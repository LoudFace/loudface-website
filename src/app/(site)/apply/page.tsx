/**
 * /apply — the Meta-ads application page (design D, picked by Arnel on 2026-10-31).
 *
 * Visitors arrive from an ad: no site header, one application card that qualifies on revenue (under $100K a month is
 * turned away), sends Meta a Lead (POST /api/apply) and opens the Cal.com booker for the funnel's own event type
 * (arnelbukva/loudface-intro-call-apply, id 7718812). An ad landing page, so it is noindex, outside the sitemap,
 * llms.txt and the agent surface (src/lib/agent-surface.ts), and has no Markdown twin (next.config.ts).
 * Copy in apply.json; the figures are the case studies' published numbers (home-v11/data.ts).
 */
export const revalidate = 60;

import type { Metadata } from 'next';
import '../../home-v11/home-v11.css';
import '../../apply-v11/apply.css';
import { getApplyContent } from '@/lib/content-utils';
import { getHomeV11Data } from '../../home-v11/data';
import { ApplyV11 } from '../../apply-v11/ApplyV11';

export const metadata: Metadata = {
  title: 'Apply: 25% more organic traffic in 3 months',
  description: 'Senior strategists, writers and developers ship the pages Google ranks and AI answers cite. 25% more organic traffic in 3 months, or we work for free until you have it.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/apply' },
};

export default async function ApplyPage() {
  const [c, data] = await Promise.all([getApplyContent(), getHomeV11Data()]);
  return <ApplyV11 c={c} data={data} />;
}
