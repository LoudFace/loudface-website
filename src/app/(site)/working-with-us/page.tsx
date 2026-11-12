/**
 * Working with us — v11 (Arnel, 12 Nov 2026).
 *
 * What LoudFace needs from a client, what slows the work and what gets results. Composed from src/app/working-v11.
 * The copy is working-with-us.json, the same file the proposal's Working together tab reads.
 */
export const revalidate = 60;

import type { Metadata } from 'next';
import '../../home-v11/home-v11.css';
import '../../service-v11/service-v11.css';
import '../../pricing-v11/pricing.css';
import '../../working-v11/working.css';
import { getHomeV11Content, getWorkingWithUsContent, rawContent, type WorkingWithUsContent } from '@/lib/content-utils';
import { WorkingV11 } from '../../working-v11/WorkingV11';
import { serializeJsonLd } from '@/lib/schema-utils';

const TITLE = 'Working with LoudFace: what we need from you';
const DESCRIPTION =
  'The fifteen things LoudFace needs from a client to do its best work, what slows the work without each one, and what we promise in return.';

/** The page went live on 12 Nov 2026; MODIFIED moves with each copy change. */
const PUBLISHED = '2026-11-12';
const MODIFIED = '2026-11-12';

export const metadata: Metadata = {
  // The root layout applies `template: "%s | LoudFace"`, so no suffix here.
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/working-with-us' },
  openGraph: {
    title: `${TITLE} | LoudFace`,
    description: DESCRIPTION,
    type: 'website',
    url: '/working-with-us',
    siteName: 'LoudFace',
    locale: 'en_US',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Working with LoudFace' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@loudface',
    title: `${TITLE} | LoudFace`,
    description: DESCRIPTION,
    images: ['/opengraph-image'],
  },
};

export default async function WorkingWithUsPage() {
  const [c, home] = await Promise.all([getWorkingWithUsContent(), getHomeV11Content()]);

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.loudface.co' },
      { '@type': 'ListItem', position: 2, name: 'Working with us' },
    ],
  };

  const speakableSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: TITLE,
    description: DESCRIPTION,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    publisher: { '@id': 'https://www.loudface.co/#organization' },
    speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '[data-speakable]'] },
    url: 'https://www.loudface.co/working-with-us',
  };

  // the questions exactly as the page shows them, read unmarked so editor markers never reach the schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: rawContent<WorkingWithUsContent>('working-with-us').page.faq.items.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };

  return (
    <>
      {[breadcrumbSchema, speakableSchema, faqSchema].map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }} />
      ))}
      <WorkingV11 c={c} home={home} />
    </>
  );
}
