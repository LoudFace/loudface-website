/**
 * SEO/AEO service page — v11 service template (ServicePageV11, since 2026-09-26; the v11 config is the v3 config or its override in service-v11/configs.tsx).
 * Copy: services-seo-aeo.json (adapted into SERVICE_CONFIGS['seo-aeo']). The
 * AI-audit link rides as the hero secondary text link (its relevant lead magnet).
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
  // The v11 page's config (the v3 config, or its v11 override); the FAQPage JSON-LD reads the FAQ this page shows.
  const config = getServiceConfigV11('seo-aeo')!;
  const [images, home, data] = await Promise.all([getServiceImages(), getHomeV11Content(), getHomeV11Data()]);
  const jsonLd = buildServiceJsonLd({
    slug: 'seo-aeo',
    serviceType: 'SEO, AEO & GEO',
    name: 'AEO Agency for B2B SaaS',
    description: metadata.description as string,
    breadcrumbName: 'AEO Agency for B2B SaaS',
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
