/**
 * GEO Agency service page (/services/geo-agency) — v11 service template (since 2026-09-26)
 * (componentized). Copy: services-geo-agency.json (adapted into
 * SERVICE_CONFIGS['geo-agency']). The GEO↔AEO disambiguation from the hub is
 * respected; the "seven questions to ask a GEO agency" checklist is preserved as
 * the final FAQ item. AI-audit link rides as the hero secondary text link.
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
  // The v11 page's config (the v3 config, or its v11 override); the FAQPage JSON-LD reads the FAQ this page shows.
  const config = getServiceConfigV11('geo-agency')!;
  const [images, home, data] = await Promise.all([getServiceImages(), getHomeV11Content(), getHomeV11Data()]);
  const jsonLd = buildServiceJsonLd({
    slug: 'geo-agency',
    serviceType: 'Generative Engine Optimization',
    name: 'Generative Engine Optimization (GEO) Agency',
    description: metadata.description as string,
    breadcrumbName: 'Generative Engine Optimization (GEO) Agency',
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
