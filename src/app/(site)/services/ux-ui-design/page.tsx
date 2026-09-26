/**
 * UX/UI Design service page — v11 service template (ServicePageV11, since 2026-09-26; the v11 config is the v3 config or its override in service-v11/configs.tsx).
 * Copy: services-ux-ui-design.json (adapted into SERVICE_CONFIGS['ux-ui-design']).
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
  title: 'UX/UI Design Services',
  description:
    'Conversion-focused design systems for B2B and SaaS websites. Component libraries, design tokens, and layouts built for humans, search, and AI.',
  alternates: { canonical: '/services/ux-ui-design' },
  openGraph: {
    title: 'UX/UI Design Services | LoudFace',
    description:
      'Conversion-focused design systems for B2B and SaaS websites. Component libraries, design tokens, and layouts built for humans, search, and AI.',
    type: 'website',
    url: '/services/ux-ui-design',
    siteName: 'LoudFace',
    locale: 'en_US',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'LoudFace UX/UI Design' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@loudface',
    title: 'UX/UI Design Services | LoudFace',
    description:
      'Conversion-focused design systems for B2B and SaaS websites. Component libraries, design tokens, and layouts built for humans, search, and AI.',
    images: ['/opengraph-image'],
  },
};

export default async function UxUiDesignServicePage() {
  // The v11 page's config (the v3 config, or its v11 override); the FAQPage JSON-LD reads the FAQ this page shows.
  const config = getServiceConfigV11('ux-ui-design')!;
  const [images, home, data] = await Promise.all([getServiceImages(), getHomeV11Content(), getHomeV11Data()]);
  const jsonLd = buildServiceJsonLd({
    slug: 'ux-ui-design',
    serviceType: 'UX/UI Design',
    name: 'UX/UI Design Services',
    description: metadata.description as string,
    breadcrumbName: 'UX/UI Design',
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
