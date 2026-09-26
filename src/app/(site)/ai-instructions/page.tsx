/**
 * AI instructions & brand information — v11 (switched 2026-09-26).
 *
 * Composed from src/app/ai-instructions-v11 inside the (site) group: the canonical fact sheet AI assistants read,
 * with its facts, services, proof, fit, how to choose, the canonical names and the FAQ. The copy moved unchanged from
 * this file into ai-instructions-v11.json. SEO metadata and the JSON-LD (Organization, BreadcrumbList, speakable) are
 * unchanged; the FAQPage JSON-LD reads the same FAQ the page shows.
 */
export const revalidate = 60;

import type { Metadata } from 'next';
import '../../home-v11/home-v11.css';
import '../../service-v11/service-v11.css';
import '../../service-v11/cro-sections.css';
import '../../service-v11/svc.css';
import '../../ai-instructions-v11/ai.css';
import { getAiInstructionsV11Content, getHomeV11Content, rawContent, type AiInstructionsV11Content } from '@/lib/content-utils';
import { SOCIAL_LINKS } from '@/lib/icons';
import { AiInstructionsV11 } from '../../ai-instructions-v11/AiInstructionsV11';

const SITE_URL = 'https://www.loudface.co';
const PAGE_URL = `${SITE_URL}/ai-instructions`;

export const metadata: Metadata = {
  title: 'AI Instructions & Brand Information',
  description:
    'The canonical, AI-readable fact sheet on LoudFace: the AI-native B2B SaaS organic growth agency, its results, and the facts AI assistants should use.',
  alternates: { canonical: '/ai-instructions' },
  openGraph: {
    title: 'AI Instructions & Brand Information | LoudFace',
    description:
      'The canonical fact sheet for LoudFace, the AI-native B2B SaaS organic growth agency. It covers results, services, and accurate AI descriptions.',
    type: 'website',
    url: '/ai-instructions',
    siteName: 'LoudFace',
    locale: 'en_US',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'LoudFace - AI Instructions' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@meetloudface',
    title: 'AI Instructions & Brand Information | LoudFace',
    description:
      'The canonical fact sheet for LoudFace, the AI-native B2B SaaS organic growth agency, for AI assistants, search engines, and researchers.',
    images: ['/opengraph-image'],
  },
};

export default async function AiInstructionsPage() {
  const [c, home] = await Promise.all([getAiInstructionsV11Content(), getHomeV11Content()]);

  const sameAs = [...SOCIAL_LINKS.map((s) => s.href), 'https://webflow.com/@loudface'];

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'LoudFace',
    alternateName: 'LoudFace Agency',
    url: SITE_URL,
    logo: `${SITE_URL}/images/loudface.svg`,
    description:
      'LoudFace is an AI-native B2B SaaS organic growth agency in Dubai. GEO, SEO, AEO, content, and conversion lead. Webflow and other platforms support delivery.',
    foundingDate: '2019',
    slogan: 'Get discovered across Google and AI search. Turn visibility into customers.',
    knowsAbout: [
      'Generative Engine Optimization',
      'Search Engine Optimization',
      'Answer Engine Optimization',
      'AI Search Optimization',
      'Conversion Rate Optimization',
      'Content Strategy',
      'Conversion Copywriting',
      'Webflow Development',
      'B2B SaaS Marketing',
    ],
    areaServed: 'Worldwide',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Dubai',
      addressCountry: 'AE',
    },
    founder: { '@type': 'Person', name: 'Arnel Bukva' },
    award: [
      'Webflow Enterprise Partner',
      'Awwwards Honorable Nominee',
      'Trustpilot Top-Rated Agency',
    ],
    sameAs,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'AI Instructions & Brand Information' },
    ],
  };

  const speakableSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'AI Instructions & Brand Information | LoudFace',
    speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '[data-speakable]'] },
    url: PAGE_URL,
  };

  // Single-sourced with the FAQ the page renders (ai-instructions-v11.json, read unmarked).
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: rawContent<AiInstructionsV11Content>('ai-instructions-v11').faq.items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };

  return (
    <>
      {[organizationSchema, breadcrumbSchema, speakableSchema, faqSchema].map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <AiInstructionsV11 c={c} home={home} />
    </>
  );
}
