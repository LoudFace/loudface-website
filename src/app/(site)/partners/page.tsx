/**
 * Partner program — v11 (switched 2026-09-26).
 *
 * Composed from src/app/partners-v11 inside the (site) group. The application form (PartnerApplicationForm, posting
 * to /api/partner-apply) and the tracked CTA links (PartnersCTALink) are the live ones, unchanged. Copy moved to
 * partners-v11.json (partners.json stays: it holds the legacy strip's labels). SEO metadata and the BreadcrumbList
 * JSON-LD are unchanged; the FAQPage JSON-LD the shared FAQ section used to emit is built here from the FAQ this page
 * shows.
 */
import type { Metadata } from 'next';
import '../../home-v11/home-v11.css';
import '../../service-v11/service-v11.css';
import '../../service-v11/cro-sections.css';
import '../../service-v11/svc.css';
import '../../partners-v11/partners.css';
import { getHomeV11Content, getPartnersV11Content, rawContent, type PartnersV11Content } from '@/lib/content-utils';
import { PartnersV11 } from '../../partners-v11/PartnersV11';

export const metadata: Metadata = {
  title: 'fCMO Partner Program — 10% Lifetime Commission',
  description:
    'Partner program for fractional CMOs and growth advisors. Refer clients, earn 10% of their retainer every month they stay. No caps, no expiry.',
  alternates: {
    canonical: '/partners',
  },
  openGraph: {
    title: 'fCMO Partner Program — 10% Lifetime Commission | LoudFace',
    description:
      'Refer a client. Earn 10% of their retainer for as long as they stay. No caps. No expiry.',
    type: 'website',
    url: '/partners',
    siteName: 'LoudFace',
    locale: 'en_US',
    images: [
      {
        url: '/partners/opengraph-image',
        width: 1200,
        height: 630,
        alt: '10% lifetime commission — LoudFace Partner Program',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@loudface',
    title: 'fCMO Partner Program — 10% Lifetime Commission | LoudFace',
    description:
      'Refer a client. Earn 10% of their retainer for as long as they stay. No caps. No expiry.',
    images: ['/partners/opengraph-image'],
  },
};

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

export default async function PartnersPage() {
  const [c, home] = await Promise.all([getPartnersV11Content(), getHomeV11Content()]);

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.loudface.co' },
      { '@type': 'ListItem', position: 2, name: 'Partner Program' },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: rawContent<PartnersV11Content>('partners-v11').faq.items.map((f) => ({
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
      <PartnersV11 c={c} home={home} />
    </>
  );
}
