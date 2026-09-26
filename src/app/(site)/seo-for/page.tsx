/**
 * SEO services by industry (the /seo-for hub) — v11 (IndustryHubV11, switched 2026-09-26).
 *
 * Composed from src/app/seo-for-v11 inside the (site) group: one card for every industry page (the Sanity seoPages
 * plus the three code-owned long reads), the published results, the program sheet, the clients and the FAQ. Copy in
 * seo-for-hub.json and industry-v11.json. Metadata and the BreadcrumbList + Service + ItemList JSON-LD are unchanged;
 * the FAQPage JSON-LD the shared FAQ section used to emit is built here from the FAQ this page shows.
 */
import type { Metadata } from 'next';
import '../../home-v11/home-v11.css';
import '../../service-v11/service-v11.css';
import '../../service-v11/cro-sections.css';
import '../../service-v11/svc.css';
import '../../seo-for-v11/industry.css';
import { fetchSeoPages } from '@/lib/cms-data';
import { getSeoForHubContent, rawContent, type SeoForHubContent } from '@/lib/content-utils';
import type { SeoPage } from '@/lib/types';
import { IndustryHubV11 } from '../../seo-for-v11/IndustryHubV11';
import { getIndustryShell } from '../../seo-for-v11/shell';

export const metadata: Metadata = {
  title: 'SEO Services by Industry',
  description:
    'Industry-specific SEO for E-Commerce, Healthcare, SaaS, Startups, B2B, and FinTech. Custom search optimization built around your vertical.',
  alternates: {
    canonical: '/seo-for',
  },
  openGraph: {
    title: 'SEO Services by Industry | LoudFace',
    description:
      'Industry-specific SEO for E-Commerce, Healthcare, SaaS, Startups, B2B, and FinTech. Custom search optimization built around your vertical.',
    type: 'website',
    url: '/seo-for',
    siteName: 'LoudFace',
    locale: 'en_US',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'LoudFace SEO Services by Industry' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@loudface',
    title: 'SEO Services by Industry | LoudFace',
    description:
      'Industry-specific SEO for E-Commerce, Healthcare, SaaS, Startups, B2B, and FinTech. Custom search optimization built around your vertical.',
    images: ['/opengraph-image'],
  },
};

// The code-owned long reads, listed with the Sanity seoPages in the ItemList JSON-LD.
const CODE_OWNED_HR_TECH_PAGE: SeoPage = {
  id: 'code-hr-tech',
  name: 'HR Tech SaaS',
  slug: 'hr-tech',
  'meta-description':
    'SEO, AEO and GEO for HR tech SaaS. Build a buyer-led discovery system for HRIS, ATS and payroll categories.',
  'hero-headline': 'SEO, AEO and GEO for HR Tech SaaS',
};

const CODE_OWNED_EDTECH_PAGE: SeoPage = {
  id: 'code-edtech',
  name: 'EdTech SaaS',
  slug: 'edtech',
  'meta-description':
    'SEO, AEO and GEO for edtech SaaS. Build the evidence, privacy, rostering and procurement pages institutional buyers check before they buy.',
  'hero-headline': 'SEO, AEO and GEO for EdTech SaaS',
};

const CODE_OWNED_AI_STARTUPS_PAGE: SeoPage = {
  id: 'code-ai-startups',
  name: 'AI Startups',
  slug: 'ai-startups',
  'meta-description':
    'SEO, AEO and GEO for AI startups. Build the data-handling, governance, accuracy and documentation pages a security reviewer checks before they buy.',
  'hero-headline': 'SEO, AEO and GEO for AI Startups',
};

export default async function SeoForHubPage() {
  const [h, { home, c, data, cards }, cmsSeoPages] = await Promise.all([getSeoForHubContent(), getIndustryShell(), fetchSeoPages()]);
  const seoPages = [
    ...cmsSeoPages.filter(
      (page) =>
        page.slug !== CODE_OWNED_HR_TECH_PAGE.slug &&
        page.slug !== CODE_OWNED_EDTECH_PAGE.slug &&
        page.slug !== CODE_OWNED_AI_STARTUPS_PAGE.slug
    ),
    CODE_OWNED_HR_TECH_PAGE,
    CODE_OWNED_EDTECH_PAGE,
    CODE_OWNED_AI_STARTUPS_PAGE,
  ];
  // --- Structured Data ---
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
      },
    ],
  };

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Industry-Specific SEO Services',
    description:
      'Custom search engine optimization programs tailored to specific industry verticals including E-Commerce, Healthcare, SaaS, Startups, B2B, and FinTech.',
    provider: {
      '@type': 'Organization',
      name: 'LoudFace',
      url: 'https://www.loudface.co',
    },
    areaServed: 'Worldwide',
    serviceType: 'Search Engine Optimization',
  };

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'SEO Services by Industry',
    itemListElement: seoPages.map((page, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: page['hero-headline'] || page.name,
      url: `https://www.loudface.co/seo-for/${page.slug}`,
    })),
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: rawContent<SeoForHubContent>('seo-for-hub').faq.items.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };

  return (
    <>
      {/* Structured Data — native script for SSR visibility to crawlers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      {seoPages.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        />
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <IndustryHubV11 h={h} cards={cards} c={c} home={home} data={data} />
    </>
  );
}
