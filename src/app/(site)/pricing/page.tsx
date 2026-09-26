/**
 * Pricing — v11 (the approved pricing v1 board; switched 2026-09-26).
 *
 * Composed from src/app/pricing-v11 inside the (site) group. Copy in pricing.json (the live page's words) and
 * pricing-v11.json (the plan boards, steps and examples); the charts come from getHomeV11Data. SEO metadata and the
 * JSON-LD are unchanged; the FAQPage schema reads the same pricing.json FAQ the page shows (PRICING_FAQ).
 */
export const revalidate = 60;

import type { Metadata } from 'next';
import { getHomeV11Content, getPricingContent, getPricingV11Content } from '@/lib/content-utils';
import '../../home-v11/home-v11.css';
import '../../service-v11/service-v11.css';
import '../../service-v11/cro-sections.css';
import '../../service-v11/svc.css';
import '../../pricing-v11/pricing.css';
import { PRICING_FAQ } from '../../pricing-v3/data';
import { getHomeV11Data } from '../../home-v11/data';
import { PricingV11 } from '../../pricing-v11/PricingV11';

export const metadata: Metadata = {
  title: 'Pricing: Solo, Dual & Scale Autopilot Plans',
  description:
    'Pick your Autopilot tier: Solo for one focused track, Dual for Build + Growth in parallel, or Scale for multi-track velocity. Custom-scoped to your goals.',
  alternates: {
    canonical: '/pricing',
  },
  openGraph: {
    title: 'Pricing: Solo, Dual & Scale Autopilot Plans | LoudFace',
    description:
      'Pick your Autopilot tier: Solo for one focused track, Dual for Build + Growth in parallel, or Scale for multi-track velocity. Custom-scoped to your goals.',
    type: 'website',
    url: '/pricing',
    siteName: 'LoudFace',
    locale: 'en_US',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'LoudFace Pricing',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@loudface',
    title: 'Pricing: Solo, Dual & Scale Autopilot Plans | LoudFace',
    description:
      'Pick your Autopilot tier: Solo for one focused track, Dual for Build + Growth in parallel, or Scale for multi-track velocity. Custom-scoped to your goals.',
    images: ['/opengraph-image'],
  },
};

export default async function PricingPage() {
  const [c, x, home, data] = await Promise.all([getPricingContent(), getPricingV11Content(), getHomeV11Content(), getHomeV11Data()]);

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.loudface.co' },
      { '@type': 'ListItem', position: 2, name: 'Pricing' },
    ],
  };

  const speakableSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Pricing: Solo, Dual & Scale Autopilot Plans',
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable]'],
    },
    url: 'https://www.loudface.co/pricing',
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: PRICING_FAQ.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  return (
    <>
      {[breadcrumbSchema, speakableSchema, faqSchema].map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <PricingV11 c={c} x={x} home={home} data={data} />
    </>
  );
}
