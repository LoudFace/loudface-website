/**
 * Webflow Development service page — v11 service template (ServicePageV11, since 2026-09-26; the v11 config is the v3 config or its override in service-v11/configs.tsx).
 * Copy: services-webflow.json (adapted into SERVICE_CONFIGS.webflow). Screenshots
 * come LIVE from Sanity by slug (getServiceImages) with CDN fallbacks. Shared
 * Header renders dark-hero (wired in (site)/layout.tsx for /services/*); shared
 * Footer suppressed there so only FooterV3 renders inside .svcv3.
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
  // The v11 page's config (the v3 config, or its v11 override); the FAQPage JSON-LD reads the FAQ this page shows.
  const config = getServiceConfigV11('webflow')!;
  const [images, home, data] = await Promise.all([getServiceImages(), getHomeV11Content(), getHomeV11Data()]);
  const jsonLd = buildServiceJsonLd({
    slug: 'webflow',
    serviceType: 'Webflow Development',
    name: 'Webflow Development Services',
    description: metadata.description as string,
    breadcrumbName: 'Webflow Development',
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
