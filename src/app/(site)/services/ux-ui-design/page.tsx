/**
 * UX/UI Design service page — v3 "artifact stage" template (componentized).
 * Copy: services-ux-ui-design.json (adapted into SERVICE_CONFIGS['ux-ui-design']).
 */
export const revalidate = 60;

import type { Metadata } from 'next';
import '../../../service-v3/service-v3.css';
import { getServiceImages, getServiceConfig } from '../../../service-v3/data';
import { ServicePageV3 } from '../../../service-v3/ServicePageV3';
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
  const config = getServiceConfig('ux-ui-design')!;
  const images = await getServiceImages();
  const jsonLd = buildServiceJsonLd({
    slug: 'ux-ui-design',
    serviceType: 'UX/UI Design',
    name: 'UX/UI Design Services',
    description: metadata.description as string,
    breadcrumbName: 'UX/UI Design',
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
