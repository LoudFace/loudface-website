import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import '../../../../home-v11/home-v11.css';
import '../../../../service-v11/service-v11.css';
import '../../../../service-v11/cro-sections.css';
import '../../../../service-v11/svc.css';
import { getHomeV11Content } from '@/lib/content-utils';
import { getServiceImages, SERVICE_CONFIGS } from '../../../../service-v3/data';
import { getServiceConfigV11 } from '../../../../service-v11/configs';
import { ServicePageV11 } from '../../../../service-v11/ServicePageV11';
import { getHomeV11Data } from '../../../../home-v11/data';

export const metadata: Metadata = {
  title: 'Service template v11 preview',
  robots: { index: false, follow: false },
};

export const revalidate = 3600;

export function generateStaticParams() {
  return Object.keys(SERVICE_CONFIGS).map((slug) => ({ slug }));
}

/** Preview of the v11 service template on any /services/<slug> config, before the live routes switch over. */
export default async function ServiceV11Preview({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const config = getServiceConfigV11(slug);
  if (!config) notFound();
  const [home, images, data] = await Promise.all([getHomeV11Content(), getServiceImages(), getHomeV11Data()]);
  return <ServicePageV11 config={config} images={images} home={home} data={data} />;
}
