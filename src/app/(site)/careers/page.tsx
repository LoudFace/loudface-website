/**
 * Careers — v11 (switched 2026-09-26).
 *
 * Composed from src/app/careers-v11 inside the (site) group. Open roles come live from Notion (fetchOpenRoles); the
 * page copy is careers-v11.json. SEO metadata and the BreadcrumbList JSON-LD are unchanged.
 */
export const revalidate = 3600;

import type { Metadata } from 'next';
import '../../home-v11/home-v11.css';
import '../../service-v11/service-v11.css';
import '../../service-v11/svc.css';
import '../../careers-v11/careers.css';
import { fetchOpenRoles } from '@/lib/careers-data';
import { getCareersV11Content, getHomeV11Content } from '@/lib/content-utils';
import { CareersV11 } from '../../careers-v11/CareersV11';

const SITE_URL = 'https://www.loudface.co';
const PAGE_URL = `${SITE_URL}/careers`;

export const metadata: Metadata = {
  title: 'Careers — Remote Growth, Content & Delivery Roles',
  // 120-160 chars (MIN_META_DESCRIPTION is 120; Ahrefs flags both ends).
  description:
    'Careers at LoudFace. Join a remote team that helps B2B SaaS companies get discovered across Google and AI search, then turn visibility into customers.',
  alternates: { canonical: '/careers' },
  openGraph: {
    title: 'Careers at LoudFace',
    description:
      'A remote team that runs organic growth, content, conversion, and delivery work for B2B SaaS. See what we hire for and how hiring works.',
    type: 'website',
    url: '/careers',
    siteName: 'LoudFace',
    locale: 'en_US',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Careers at LoudFace' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@meetloudface',
    title: 'Careers at LoudFace',
    description:
      'A remote team that runs organic growth, content, conversion, and delivery work for B2B SaaS. See what we hire for and how hiring works.',
    images: ['/opengraph-image'],
  },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Careers', item: PAGE_URL },
  ],
};

export default async function CareersPage() {
  const [result, c, home] = await Promise.all([fetchOpenRoles(), getCareersV11Content(), getHomeV11Content()]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <CareersV11 result={result} home={home} c={c} />
    </>
  );
}
