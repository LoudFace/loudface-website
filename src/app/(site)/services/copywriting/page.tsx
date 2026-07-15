/**
 * Copywriting service page — v3 "artifact stage" template (componentized).
 * Copy: services-copywriting.json (adapted into SERVICE_CONFIGS.copywriting).
 */
export const revalidate = 60;

import type { Metadata } from 'next';
import '../../../service-v3/service-v3.css';
import { getServiceImages, getServiceConfig } from '../../../service-v3/data';
import { ServicePageV3 } from '../../../service-v3/ServicePageV3';
import { buildServiceJsonLd } from '../../../service-v3/jsonld';

export const metadata: Metadata = {
  title: 'Messaging & Copywriting Services',
  description:
    'Copy-first messaging for B2B and SaaS websites. Positioning, conversion copy, and programmatic content optimized for humans, search, and AI citations.',
  alternates: { canonical: '/services/copywriting' },
  openGraph: {
    title: 'Messaging & Copywriting Services | LoudFace',
    description:
      'Copy-first messaging for B2B and SaaS websites. Positioning, conversion copy, and programmatic content optimized for humans, search, and AI citations.',
    type: 'website',
    url: '/services/copywriting',
    siteName: 'LoudFace',
    locale: 'en_US',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'LoudFace Copywriting Services' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@loudface',
    title: 'Messaging & Copywriting Services | LoudFace',
    description:
      'Copy-first messaging for B2B and SaaS websites. Positioning, conversion copy, and programmatic content optimized for humans, search, and AI citations.',
    images: ['/opengraph-image'],
  },
};

export default async function CopywritingServicePage() {
  const config = getServiceConfig('copywriting')!;
  const images = await getServiceImages();
  const jsonLd = buildServiceJsonLd({
    slug: 'copywriting',
    serviceType: 'Messaging & Copywriting',
    name: 'Messaging & Copywriting Services',
    description: metadata.description as string,
    breadcrumbName: 'Copywriting',
    faq: config.faq.items,
  });

  return (
    <div className="svcv3">
      {jsonLd.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}
      <ServicePageV3 config={config} images={images} />
    </div>
  );
}
