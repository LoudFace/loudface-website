/**
 * Services (hub) — v11 (switched 2026-09-26).
 *
 * Composed from src/app/services-v11 inside the (site) group. Copy in services.json; the service pictures come from
 * Sanity by slug (getServiceImages). SEO metadata and the JSON-LD (BreadcrumbList, the ItemList of services, FAQPage
 * from the same services.json FAQ the page shows, speakable) are unchanged.
 *
 * NOTE: /services previously 301-redirected to /services/webflow (next.config.ts). That redirect was removed so this
 * hub can resolve. Do NOT re-add it.
 */
export const revalidate = 60;

import type { Metadata } from 'next';
import { getHomeV11Content, getServicesContent } from '@/lib/content-utils';
import '../../home-v11/home-v11.css';
import '../../service-v11/service-v11.css';
import '../../service-v11/cro-sections.css';
import '../../service-v11/svc.css';
import '../../services-v11/hub.css';
import { SERVICES_FAQ, SERVICES } from '../../services-v3/data';
import { getServiceImages } from '../../service-v3/data';
import { ServicesHubV11 } from '../../services-v11/ServicesHubV11';

const SITE = 'https://www.loudface.co';

export const metadata: Metadata = {
  // The (site) layout's title template ("%s | LoudFace") appends the brand.
  title: 'GEO, SEO, AEO & Conversion Services for B2B SaaS',
  description:
    'GEO, SEO, AEO, content, and conversion services for B2B SaaS. LoudFace adds design and delivery work across your stack when it supports growth.',
  alternates: {
    canonical: '/services',
  },
  openGraph: {
    title: 'GEO, SEO, AEO & Conversion Services for B2B SaaS | LoudFace',
    description:
      'GEO, SEO, AEO, content, and conversion services for B2B SaaS. LoudFace adds design and delivery work across your stack when it supports growth.',
    type: 'website',
    url: '/services',
    siteName: 'LoudFace',
    locale: 'en_US',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'LoudFace Services' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@loudface',
    title: 'GEO, SEO, AEO & Conversion Services for B2B SaaS | LoudFace',
    description:
      'GEO, SEO, AEO, content, and conversion services for B2B SaaS. LoudFace adds design and delivery work across your stack when it supports growth.',
    images: ['/opengraph-image'],
  },
};

export default async function ServicesPage() {
  const [c, home, images] = await Promise.all([getServicesContent(), getHomeV11Content(), getServiceImages()]);

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Services', item: `${SITE}/services` },
    ],
  };

  const servicesListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'LoudFace services for B2B SaaS',
    description:
      'Services for B2B SaaS organic growth: GEO, SEO, AEO, content, and conversion. Design and delivery, including Webflow, support the program across stacks.',
    itemListElement: SERVICES.map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: s.serviceName,
      url: `${SITE}/services/${s.slug}`,
    })),
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: SERVICES_FAQ.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  const speakableSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'GEO, SEO, AEO & Conversion Services for B2B SaaS',
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable]'],
    },
    url: `${SITE}/services`,
  };

  return (
    <>
      {[breadcrumbSchema, servicesListSchema, faqSchema, speakableSchema].map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <ServicesHubV11 c={c} home={home} images={images} />
    </>
  );
}
