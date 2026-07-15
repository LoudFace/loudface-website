/**
 * Webflow Development service page — v3 "artifact stage" template (componentized).
 * Copy: services-webflow.json (adapted into SERVICE_CONFIGS.webflow). Screenshots
 * come LIVE from Sanity by slug (getServiceImages) with CDN fallbacks. Shared
 * Header renders dark-hero (wired in (site)/layout.tsx for /services/*); shared
 * Footer suppressed there so only FooterV3 renders inside .svcv3.
 */
export const revalidate = 60;

import type { Metadata } from 'next';
import '../../../service-v3/service-v3.css';
import { getServiceImages, getServiceConfig } from '../../../service-v3/data';
import { ServicePageV3 } from '../../../service-v3/ServicePageV3';
import { buildServiceJsonLd } from '../../../service-v3/jsonld';

export const metadata: Metadata = {
  title: 'Webflow Development Services',
  description:
    'Scale-first Webflow development with component-based architecture. Split test faster, ship landing pages in hours, and grow without technical debt.',
  alternates: { canonical: '/services/webflow' },
  openGraph: {
    title: 'Webflow Development Services | LoudFace',
    description:
      'Scale-first Webflow development with component-based architecture. Split test faster, ship landing pages in hours, and grow without technical debt.',
    type: 'website',
    url: '/services/webflow',
    siteName: 'LoudFace',
    locale: 'en_US',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'LoudFace Webflow Development' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@loudface',
    title: 'Webflow Development Services | LoudFace',
    description:
      'Scale-first Webflow development with component-based architecture. Split test faster, ship landing pages in hours, and grow without technical debt.',
    images: ['/opengraph-image'],
  },
};

export default async function WebflowServicePage() {
  const config = getServiceConfig('webflow')!;
  const images = await getServiceImages();
  const jsonLd = buildServiceJsonLd({
    slug: 'webflow',
    serviceType: 'Webflow Development',
    name: 'Webflow Development Services',
    description: metadata.description as string,
    breadcrumbName: 'Webflow Development',
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
