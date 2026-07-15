/**
 * GEO Agency service page (/services/geo-agency) — v3 "artifact stage" template
 * (componentized). Copy: services-geo-agency.json (adapted into
 * SERVICE_CONFIGS['geo-agency']). The GEO↔AEO disambiguation from the hub is
 * respected; the "seven questions to ask a GEO agency" checklist is preserved as
 * the final FAQ item. AI-audit link rides as the hero secondary text link.
 */
export const revalidate = 60;

import type { Metadata } from 'next';
import '../../../service-v3/service-v3.css';
import { getServiceImages, getServiceConfig } from '../../../service-v3/data';
import { ServicePageV3 } from '../../../service-v3/ServicePageV3';
import { buildServiceJsonLd } from '../../../service-v3/jsonld';

export const metadata: Metadata = {
  // Root layout applies `template: "%s | LoudFace"`, so do NOT add the suffix here.
  title: 'Generative Engine Optimization (GEO) Agency',
  description:
    'AI-native generative engine optimization agency for B2B SaaS. Get cited in ChatGPT, Perplexity, and Google AI Overviews, measured as share of answer.',
  alternates: { canonical: '/services/geo-agency' },
  openGraph: {
    title: 'Generative Engine Optimization (GEO) Agency | LoudFace',
    description:
      'AI-native generative engine optimization agency for B2B SaaS. Get cited in ChatGPT, Perplexity, and Google AI Overviews, measured as share of answer.',
    type: 'website',
    url: '/services/geo-agency',
    siteName: 'LoudFace',
    locale: 'en_US',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'LoudFace Generative Engine Optimization Agency' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@loudface',
    title: 'Generative Engine Optimization (GEO) Agency | LoudFace',
    description:
      'AI-native generative engine optimization agency for B2B SaaS. Get cited in ChatGPT, Perplexity, and Google AI Overviews, measured as share of answer.',
    images: ['/opengraph-image'],
  },
};

export default async function GeoAgencyServicePage() {
  const config = getServiceConfig('geo-agency')!;
  const images = await getServiceImages();
  const jsonLd = buildServiceJsonLd({
    slug: 'geo-agency',
    serviceType: 'Generative Engine Optimization',
    name: 'Generative Engine Optimization (GEO) Agency',
    description: metadata.description as string,
    breadcrumbName: 'Generative Engine Optimization (GEO) Agency',
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
