/**
 * /apply/legal — the Meta-ads application page for law firms (Arnel, 2026-11-02: three campaigns, info and coaching at
 * /apply, B2B SaaS at /apply/saas, law firms at /apply/legal). The same page and card as /apply (design D), with its own
 * copy (apply-legal.json), chart and proof (VERTICALS in apply-v11/ApplyV11.tsx). Noindex, no site header, and outside the
 * sitemap, llms.txt, the agent surface and the Markdown twins through the /apply prefix, like /apply itself.
 */
export const revalidate = 60;

import type { Metadata } from 'next';
import '../../../home-v11/home-v11.css';
import '../../../apply-v11/apply.css';
import { getApplyContent } from '@/lib/content-utils';
import { getHomeV11Data } from '../../../home-v11/data';
import { ApplyV11 } from '../../../apply-v11/ApplyV11';

export const metadata: Metadata = {
  title: 'Apply: 3× your firm’s organic traffic',
  description: 'Senior strategists, writers and developers run law firms’ websites end to end so Google ranks them and AI answers name them. 3× your organic traffic, or we work for free until you have it.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/apply/legal' },
};

export default async function ApplyLegalPage() {
  const [c, data] = await Promise.all([getApplyContent('legal'), getHomeV11Data()]);
  return <ApplyV11 c={c} data={data} vertical="legal" />;
}
