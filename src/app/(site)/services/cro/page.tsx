/**
 * CRO service page — v11 service template (switched 2026-09-26; was the v3 "artifact stage" template).
 * Copy: services-cro.json (adapted into SERVICE_CONFIGS.cro).
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
  title: 'Conversion Rate Optimization Services',
  description:
    'Turn existing traffic into revenue with systematic CRO. Conversion audits, headline and CTA testing, and weekly pipeline reporting. Book a free audit.',
  alternates: { canonical: '/services/cro' },
  openGraph: {
    title: 'Conversion Rate Optimization Services | LoudFace',
    description:
      'Turn existing traffic into revenue with systematic CRO. Conversion audits, headline and CTA testing, and weekly pipeline reporting. Book a free audit.',
    type: 'website',
    url: '/services/cro',
    siteName: 'LoudFace',
    locale: 'en_US',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'LoudFace CRO Services' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@loudface',
    title: 'Conversion Rate Optimization Services | LoudFace',
    description:
      'Turn existing traffic into revenue with systematic CRO. Conversion audits, headline and CTA testing, and weekly pipeline reporting. Book a free audit.',
    images: ['/opengraph-image'],
  },
};

export default async function CroServicePage() {
  // The v11 page's config (the v3 config, or its v11 override); the FAQPage JSON-LD reads the FAQ this page shows.
  const config = getServiceConfigV11('cro')!;
  const [images, home, data] = await Promise.all([getServiceImages(), getHomeV11Content(), getHomeV11Data()]);
  const jsonLd = buildServiceJsonLd({
    slug: 'cro',
    serviceType: 'Conversion Rate Optimization',
    name: 'Conversion Rate Optimization Services',
    description: metadata.description as string,
    breadcrumbName: 'CRO',
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
