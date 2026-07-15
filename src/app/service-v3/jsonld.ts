/**
 * Shared structured-data builder for the /services/<slug> child pages. Emits
 * Service + BreadcrumbList + FAQPage. The FAQPage answers are single-sourced
 * with the on-page accordion (config.faq.items), HTML stripped to plain text.
 */
import type { FaqItem } from './data';

const SITE = 'https://www.loudface.co';

function stripHtml(s: string): string {
  return s
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildServiceJsonLd(opts: {
  slug: string;
  serviceType: string;
  name: string;
  description: string;
  breadcrumbName: string;
  faq: FaqItem[];
}): object[] {
  const url = `${SITE}/services/${opts.slug}`;

  const service = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: opts.name,
    serviceType: opts.serviceType,
    description: opts.description,
    url,
    provider: {
      '@type': 'Organization',
      name: 'LoudFace',
      url: SITE,
    },
    areaServed: 'Worldwide',
    audience: {
      '@type': 'Audience',
      audienceType: 'B2B SaaS companies',
    },
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Services', item: `${SITE}/services` },
      { '@type': 'ListItem', position: 3, name: opts.breadcrumbName },
    ],
  };

  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: opts.faq.map((f) => ({
      '@type': 'Question',
      name: stripHtml(f.q),
      acceptedAnswer: { '@type': 'Answer', text: stripHtml(f.aHtml) },
    })),
  };

  return [service, breadcrumb, faqPage];
}
