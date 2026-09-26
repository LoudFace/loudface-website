/**
 * Free AI visibility audit — v11 (switched 2026-09-26).
 *
 * Composed from src/app/audit-v11 inside the (site) group: the live AuditLandingForm (its submission and tracking
 * unchanged, restyled by audit.css) beside the example report's scorecard, the problem copy beside the example's
 * category-discovery table, client proof, the FAQ, and the form again on the closing stage. Copy in ai-audit.json.
 * SEO metadata and the BreadcrumbList JSON-LD are unchanged; the FAQPage JSON-LD the shared FAQ section used to emit
 * is built here from the FAQ this page shows.
 */
import type { Metadata } from 'next';
import '../../home-v11/home-v11.css';
import '../../service-v11/service-v11.css';
import '../../service-v11/cro-sections.css';
import '../../service-v11/svc.css';
import '../../audit-v11/audit.css';
import { getAiAuditContent, getHomeV11Content, rawContent, type AiAuditContent } from '@/lib/content-utils';
import { AuditPageV11 } from '../../audit-v11/AuditPageV11';

export const metadata: Metadata = {
  title: 'Free AI Visibility Audit for B2B SaaS',
  description:
    'Check where your brand stands across ChatGPT, Claude, Gemini, and Perplexity versus competitors. Get a free AI search presence score and a personal Loom walkthrough.',
  alternates: {
    canonical: '/ai-audit',
  },
  openGraph: {
    title: 'Free AI Visibility Audit for B2B SaaS | LoudFace',
    description:
      'Check where your brand stands across ChatGPT, Claude, Gemini, and Perplexity versus competitors. Get a free AI search presence score and a personal Loom walkthrough.',
    type: 'website',
    url: '/ai-audit',
    siteName: 'LoudFace',
    locale: 'en_US',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'LoudFace AI Visibility Audit',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@loudface',
    title: 'Free AI Visibility Audit for B2B SaaS | LoudFace',
    description:
      'Check where your brand stands across ChatGPT, Claude, Gemini, and Perplexity versus competitors. Get a free AI search presence score and a personal Loom walkthrough.',
    images: ['/opengraph-image'],
  },
};

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

export default async function AiAuditPage() {
  const [c, home] = await Promise.all([getAiAuditContent(), getHomeV11Content()]);

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
      { '@type': 'ListItem', position: 2, name: 'AI Visibility Audit' },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: rawContent<AiAuditContent>('ai-audit').faq.items.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: stripHtml(f.answer) },
    })),
  };

  return (
    <>
      {[breadcrumbSchema, faqSchema].map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <AuditPageV11 c={c} home={home} />
    </>
  );
}
