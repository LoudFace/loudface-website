/**
 * Organic-growth pillar page (v11 service template since 2026-09-26).
 * Copy: SERVICE_CONFIGS['organic-growth'] in service-v3/data.tsx. The AI-audit
 * link rides as the hero secondary text link (its relevant lead magnet).
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
  // The v11 page's config (the v3 config, or its v11 override); the FAQPage JSON-LD reads the FAQ this page shows.
  const config = getServiceConfigV11('organic-growth')!;
  const [images, home, data] = await Promise.all([getServiceImages(), getHomeV11Content(), getHomeV11Data()]);
  const jsonLd = buildServiceJsonLd({
    slug: 'organic-growth',
    serviceType: 'Organic Growth (SEO, AEO, Content, CRO)',
    name: 'Organic Growth Agency for B2B SaaS',
    description: metadata.description as string,
    breadcrumbName: 'Organic Growth Agency for B2B SaaS',
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
