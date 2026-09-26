/**
 * Copywriting service page — v11 service template (ServicePageV11, since 2026-09-26; the v11 config is the v3 config or its override in service-v11/configs.tsx).
 * Copy: services-copywriting.json (adapted into SERVICE_CONFIGS.copywriting).
 */
export const revalidate = 60;

import type { Metadata } from 'next';
import '../../../home-v11/home-v11.css';
import '../../../service-v11/service-v11.css';
import '../../../service-v11/cro-sections.css';
import '../../../service-v11/svc.css';
import { getHomeV11Content } from '@/lib/content-utils';
import { getServiceImages } from '../../../service-v3/data';
import { getServiceConfigV11 } from '../../../service-v11/configs';
import { getHomeV11Data } from '../../../home-v11/data';
import { ServicePageV11 } from '../../../service-v11/ServicePageV11';
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
  // The v11 page's config (the v3 config, or its v11 override); the FAQPage JSON-LD reads the FAQ this page shows.
  const config = getServiceConfigV11('copywriting')!;
  const [images, home, data] = await Promise.all([getServiceImages(), getHomeV11Content(), getHomeV11Data()]);
  const jsonLd = buildServiceJsonLd({
    slug: 'copywriting',
    serviceType: 'Messaging & Copywriting',
    name: 'Messaging & Copywriting Services',
    description: metadata.description as string,
    breadcrumbName: 'Copywriting',
    faq: config.faq.items,
  });

  return (
    <>
      {jsonLd.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}
      <ServicePageV11 config={config} images={images} home={home} data={data} />
    </>
  );
}
