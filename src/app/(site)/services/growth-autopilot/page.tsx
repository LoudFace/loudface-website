/**
 * Growth Autopilot service page — v11 service template (ServicePageV11, since 2026-09-26; the v11 config is the v3 config or its override in service-v11/configs.tsx).
 * Copy: services-growth-autopilot.json (adapted into
 * SERVICE_CONFIGS['growth-autopilot']). AI-audit link rides as the hero secondary
 * text link (its relevant lead magnet).
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
  title: 'Growth Autopilot — SEO, AEO & CRO as One System',
  description:
    'Turn your website into a revenue channel. We run SEO, AEO, and CRO as one integrated system for B2B SaaS companies. Get a free AI Visibility Audit.',
  alternates: { canonical: '/services/growth-autopilot' },
  openGraph: {
    title: 'Growth Autopilot — SEO, AEO & CRO as One System | LoudFace',
    description:
      'Turn your website into a revenue channel. We run SEO, AEO, and CRO as one integrated system for B2B SaaS companies. Get a free AI Visibility Audit.',
    type: 'website',
    url: '/services/growth-autopilot',
    siteName: 'LoudFace',
    locale: 'en_US',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'LoudFace Growth Autopilot' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@loudface',
    title: 'Growth Autopilot — SEO, AEO & CRO as One System | LoudFace',
    description:
      'Turn your website into a revenue channel. We run SEO, AEO, and CRO as one integrated system for B2B SaaS companies. Get a free AI Visibility Audit.',
    images: ['/opengraph-image'],
  },
};

export default async function GrowthAutopilotServicePage() {
  // The v11 page's config (the v3 config, or its v11 override); the FAQPage JSON-LD reads the FAQ this page shows.
  const config = getServiceConfigV11('growth-autopilot')!;
  const [images, home, data] = await Promise.all([getServiceImages(), getHomeV11Content(), getHomeV11Data()]);
  const jsonLd = buildServiceJsonLd({
    slug: 'growth-autopilot',
    serviceType: 'Growth Autopilot',
    name: 'Growth Autopilot',
    description: metadata.description as string,
    breadcrumbName: 'Growth Autopilot',
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
