/**
 * CRO service page — v3 "artifact stage" template (componentized).
 * Copy: services-cro.json (adapted into SERVICE_CONFIGS.cro).
 */
export const revalidate = 60;

import type { Metadata } from 'next';
import '../../../service-v3/service-v3.css';
import { getServiceImages, getServiceConfig } from '../../../service-v3/data';
import { ServicePageV3 } from '../../../service-v3/ServicePageV3';
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
  const config = getServiceConfig('cro')!;
  const images = await getServiceImages();
  const jsonLd = buildServiceJsonLd({
    slug: 'cro',
    serviceType: 'Conversion Rate Optimization',
    name: 'Conversion Rate Optimization Services',
    description: metadata.description as string,
    breadcrumbName: 'CRO',
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
