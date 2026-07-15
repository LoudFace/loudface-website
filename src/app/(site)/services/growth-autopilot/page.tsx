/**
 * Growth Autopilot service page — v3 "artifact stage" template (componentized).
 * Copy: services-growth-autopilot.json (adapted into
 * SERVICE_CONFIGS['growth-autopilot']). AI-audit link rides as the hero secondary
 * text link (its relevant lead magnet).
 */
export const revalidate = 60;

import type { Metadata } from 'next';
import '../../../service-v3/service-v3.css';
import { getServiceImages, getServiceConfig } from '../../../service-v3/data';
import { ServicePageV3 } from '../../../service-v3/ServicePageV3';
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
  const config = getServiceConfig('growth-autopilot')!;
  const images = await getServiceImages();
  const jsonLd = buildServiceJsonLd({
    slug: 'growth-autopilot',
    serviceType: 'Growth Autopilot',
    name: 'Growth Autopilot',
    description: metadata.description as string,
    breadcrumbName: 'Growth Autopilot',
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
