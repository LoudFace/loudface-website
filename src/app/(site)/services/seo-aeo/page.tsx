/**
 * SEO/AEO service page — v3 "artifact stage" template (componentized).
 * Copy: services-seo-aeo.json (adapted into SERVICE_CONFIGS['seo-aeo']). The
 * AI-audit link rides as the hero secondary text link (its relevant lead magnet).
 */
export const revalidate = 60;

import type { Metadata } from 'next';
import '../../../service-v3/service-v3.css';
import { getServiceImages, getServiceConfig } from '../../../service-v3/data';
import { ServicePageV3 } from '../../../service-v3/ServicePageV3';
import { buildServiceJsonLd } from '../../../service-v3/jsonld';

export const metadata: Metadata = {
  // Root layout applies `template: "%s | LoudFace"`, so do NOT add the suffix here.
  title: 'AEO Agency for B2B SaaS | SEO, AEO & GEO',
  description:
    'LoudFace is an AEO agency for B2B SaaS. We run SEO, AEO and GEO as one program so you rank on Google and get cited by ChatGPT, Perplexity and AI Overviews.',
  alternates: { canonical: '/services/seo-aeo' },
  openGraph: {
    title: 'AEO Agency for B2B SaaS | SEO, AEO & GEO | LoudFace',
    description:
      'LoudFace is an AEO agency for B2B SaaS. We run SEO, AEO and GEO as one program so you rank on Google and get cited by ChatGPT, Perplexity and AI Overviews.',
    type: 'website',
    url: '/services/seo-aeo',
    siteName: 'LoudFace',
    locale: 'en_US',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'LoudFace AEO Agency for B2B SaaS' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@loudface',
    title: 'AEO Agency for B2B SaaS | SEO, AEO & GEO | LoudFace',
    description:
      'LoudFace is an AEO agency for B2B SaaS. We run SEO, AEO and GEO as one program so you rank on Google and get cited by ChatGPT, Perplexity and AI Overviews.',
    images: ['/opengraph-image'],
  },
};

export default async function SeoAeoServicePage() {
  const config = getServiceConfig('seo-aeo')!;
  const images = await getServiceImages();
  const jsonLd = buildServiceJsonLd({
    slug: 'seo-aeo',
    serviceType: 'SEO, AEO & GEO',
    name: 'AEO Agency for B2B SaaS',
    description: metadata.description as string,
    breadcrumbName: 'AEO Agency for B2B SaaS',
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
