/**
 * Organic-growth pillar page (v3 "artifact stage" template, componentized).
 * Copy: SERVICE_CONFIGS['organic-growth'] in service-v3/data.tsx. The AI-audit
 * link rides as the hero secondary text link (its relevant lead magnet).
 */
export const revalidate = 60;

import type { Metadata } from 'next';
import '../../../service-v3/service-v3.css';
import { getServiceImages, getServiceConfig } from '../../../service-v3/data';
import { ServicePageV3 } from '../../../service-v3/ServicePageV3';
import { buildServiceJsonLd } from '../../../service-v3/jsonld';

export const metadata: Metadata = {
  // Root layout applies `template: "%s | LoudFace"`, so do NOT add the suffix here.
  title: 'Organic Growth Agency for B2B SaaS | SEO, AEO & CRO',
  description:
    'LoudFace runs organic growth for B2B SaaS: SEO, AEO/GEO, content, and CRO as one compounding program by one senior team. From $5k/mo.',
  alternates: { canonical: '/services/organic-growth' },
  openGraph: {
    title: 'Organic Growth Agency for B2B SaaS | LoudFace',
    description:
      'LoudFace runs organic growth for B2B SaaS: SEO, AEO/GEO, content, and CRO as one compounding program by one senior team. From $5k/mo.',
    type: 'website',
    url: '/services/organic-growth',
    siteName: 'LoudFace',
    locale: 'en_US',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'LoudFace Organic Growth Agency for B2B SaaS' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@loudface',
    title: 'Organic Growth Agency for B2B SaaS | LoudFace',
    description:
      'LoudFace runs organic growth for B2B SaaS: SEO, AEO/GEO, content, and CRO as one compounding program by one senior team. From $5k/mo.',
    images: ['/opengraph-image'],
  },
};

export default async function OrganicGrowthServicePage() {
  const config = getServiceConfig('organic-growth')!;
  const images = await getServiceImages();
  const jsonLd = buildServiceJsonLd({
    slug: 'organic-growth',
    serviceType: 'Organic Growth (SEO, AEO, Content, CRO)',
    name: 'Organic Growth Agency for B2B SaaS',
    description: metadata.description as string,
    breadcrumbName: 'Organic Growth Agency for B2B SaaS',
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
