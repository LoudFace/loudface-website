/**
 * SEO for B2B — the v11 industry template (IndustryPageV11, switched 2026-09-26).
 *
 * The local JSON (seo-for-b2b.json) remains the content authority; b2bView (seo-for-v11/views.ts) adapts it as
 * this route's v3 view did, including the client testimonial chosen by the same CMS selection the programmatic
 * /seo-for/<industry> route uses. Metadata and the BreadcrumbList + Service + FAQPage JSON-LD are unchanged (read
 * from the unmarked module copy).
 */
import type { Metadata } from 'next';
import '../../../home-v11/home-v11.css';
import '../../../service-v11/service-v11.css';
import '../../../service-v11/cro-sections.css';
import '../../../service-v11/svc.css';
import '../../../case-v11/case.css';
import '../../../seo-for-v11/industry.css';
import { rawContent } from '@/lib/content-utils';
import type { SeoForB2bContent } from '@/lib/content-utils';
import { IndustryPageV11 } from '../../../seo-for-v11/IndustryPageV11';
import { relatedCards } from '../../../seo-for-v11/related';
import { getIndustryShell } from '../../../seo-for-v11/shell';
import { b2bView } from '../../../seo-for-v11/views';

// Module scope: metadata only, never marked for editing.
const content = rawContent<SeoForB2bContent>('seo-for-b2b');

export const metadata: Metadata = {
  title: content.meta.title,
  description: content.meta.description,
  alternates: {
    canonical: '/seo-for/b2b',
  },
  openGraph: {
    title: `${content.meta.title} | LoudFace`,
    description: content.meta.description,
    type: 'website',
    url: '/seo-for/b2b',
    siteName: 'LoudFace',
    locale: 'en_US',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: `${content.meta.title} | LoudFace`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@loudface',
    title: `${content.meta.title} | LoudFace`,
    description: content.meta.description,
    images: ['/opengraph-image'],
  },
};

export default async function B2bPage() {
  const [{ home, c, data, cards }, view] = await Promise.all([getIndustryShell(), b2bView()]);

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.loudface.co',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'SEO Services by Industry',
        item: 'https://www.loudface.co/seo-for',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'B2B Growth Autopilot',
      },
    ],
  };

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'B2B Growth Autopilot: SEO, AEO & CRO',
    description: content.meta.description,
    provider: {
      '@type': 'Organization',
      name: 'LoudFace',
      url: 'https://www.loudface.co',
    },
    areaServed: 'Worldwide',
    serviceType: 'Search Engine Optimization',
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: content.faq.items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <>
      {[breadcrumbSchema, serviceSchema, faqSchema].map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <IndustryPageV11 v={view} c={c} home={home} data={data} related={relatedCards(cards, 'b2b', view.work.map((w) => w.slug))} />
    </>
  );
}
