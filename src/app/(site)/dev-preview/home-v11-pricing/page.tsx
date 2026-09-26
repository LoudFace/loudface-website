import type { Metadata } from 'next';
import '../../../home-v11/home-v11.css';
import '../../../service-v11/service-v11.css';
import '../../../service-v11/cro-sections.css';
import '../../../service-v11/svc.css';
import '../../../pricing-v11/pricing.css';
import { getHomeV11Content, getPricingContent, getPricingV11Content } from '@/lib/content-utils';
import { getHomeV11Data } from '../../../home-v11/data';
import { PricingV11 } from '../../../pricing-v11/PricingV11';

export const metadata: Metadata = { title: 'Pricing v11 preview', robots: { index: false, follow: false } };
export const revalidate = 3600;

/** Preview of the v11 pricing page before /pricing switches over. */
export default async function PricingV11Preview() {
  const [c, x, home, data] = await Promise.all([getPricingContent(), getPricingV11Content(), getHomeV11Content(), getHomeV11Data()]);
  return <PricingV11 c={c} x={x} home={home} data={data} />;
}
