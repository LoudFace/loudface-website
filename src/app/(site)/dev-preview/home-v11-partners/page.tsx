import type { Metadata } from 'next';
import '../../../home-v11/home-v11.css';
import '../../../service-v11/service-v11.css';
import '../../../service-v11/cro-sections.css';
import '../../../service-v11/svc.css';
import '../../../partners-v11/partners.css';
import { getHomeV11Content, getPartnersV11Content } from '@/lib/content-utils';
import { PartnersV11 } from '../../../partners-v11/PartnersV11';

export const metadata: Metadata = { title: 'Partners v11 preview', robots: { index: false, follow: false } };
export const revalidate = 3600;

/** Preview of the v11 /partners page before the live route switches over. */
export default async function PartnersV11Preview() {
  const [c, home] = await Promise.all([getPartnersV11Content(), getHomeV11Content()]);
  return <PartnersV11 c={c} home={home} />;
}
