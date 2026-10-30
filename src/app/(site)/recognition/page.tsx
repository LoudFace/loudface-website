/**
 * Recognition — v11 (built 2026-10-30, the Honours board Arnel approved in Paper).
 *
 * Composed from src/app/recognition-v11 inside the (site) group. The honours are the `recognition` documents in Sanity
 * (status "listed", not hidden), kept current weekly by the content engine's recognition sync, plus the
 * `recognition-ai-standing` document; getRecognitionData() throws on a failed read and on an empty result, so the page
 * never renders or caches without its honours. Copy lives in recognition-v11.json; metadata and JSON-LD read it raw.
 * JSON-LD: the breadcrumb, and the page as a CollectionPage about LoudFace whose ItemList is the honours shown, each
 * the publisher's own page.
 */
export const revalidate = 3600;

import type { Metadata } from 'next';
import '../../home-v11/home-v11.css';
import '../../recognition-v11/recognition.css';
import { getHomeV11Content, getRecognitionV11Content, rawContent, type RecognitionV11Content } from '@/lib/content-utils';
import { serializeJsonLd } from '@/lib/schema-utils';
import { RecognitionV11 } from '../../recognition-v11/RecognitionV11';
import { getRecognitionData } from '../../recognition-v11/data';

const SITE = 'https://www.loudface.co';
const META = rawContent<RecognitionV11Content>('recognition-v11').meta;

export const metadata: Metadata = {
  // The root layout applies `template: "%s | LoudFace"`, so no suffix here.
  title: META.title,
  description: META.description,
  alternates: { canonical: '/recognition' },
  openGraph: {
    title: `${META.ogTitle} | LoudFace`,
    description: META.description,
    type: 'website',
    url: '/recognition',
    siteName: 'LoudFace',
    locale: 'en_US',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: META.ogImageAlt }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@loudface',
    title: `${META.ogTitle} | LoudFace`,
    description: META.description,
    images: ['/opengraph-image'],
  },
};

export default async function RecognitionPage() {
  const [c, home, d] = await Promise.all([getRecognitionV11Content(), getHomeV11Content(), getRecognitionData()]);

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Recognition', item: `${SITE}/recognition` },
    ],
  };

  // Every honour the full record shows, in its order: the publisher's own page, named by the list's own title.
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE}/recognition#page`,
    url: `${SITE}/recognition`,
    name: META.ogTitle,
    description: META.description,
    about: { '@id': `${SITE}/#organization` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: d.byCitations.length,
      itemListElement: d.byCitations.map((h, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: h.url,
        name: h.title,
      })),
    },
  };

  return (
    <>
      {[breadcrumbSchema, collectionSchema].map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }} />
      ))}
      <RecognitionV11 c={c} home={home} d={d} />
    </>
  );
}
