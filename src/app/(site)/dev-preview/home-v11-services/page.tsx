import type { Metadata } from 'next';
import '../../../home-v11/home-v11.css';
import '../../../service-v11/service-v11.css';
import '../../../service-v11/cro-sections.css';
import '../../../service-v11/svc.css';
import '../../../services-v11/hub.css';
import { getHomeV11Content, getServicesContent } from '@/lib/content-utils';
import { getServiceImages } from '../../../service-v3/data';
import { ServicesHubV11 } from '../../../services-v11/ServicesHubV11';

export const metadata: Metadata = { title: 'Services hub v11 preview', robots: { index: false, follow: false } };
export const revalidate = 3600;

/** Preview of the v11 services hub before /services switches over. */
export default async function ServicesHubV11Preview() {
  const [c, home, images] = await Promise.all([getServicesContent(), getHomeV11Content(), getServiceImages()]);
  return <ServicesHubV11 c={c} home={home} images={images} />;
}
