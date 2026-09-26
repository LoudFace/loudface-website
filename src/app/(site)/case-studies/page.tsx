/**
 * Case studies index — v11 (switched 2026-09-26).
 *
 * Composed from src/app/work-v11 inside the (site) group: the studies from Sanity (fetchCaseStudyIndexData) with
 * their clients, the published result charts, and client proof. Copy in work-v11.json. SEO metadata is unchanged, and
 * so is the JSON-LD: a CollectionPage listing every study (current offering first, featured first within it) plus the
 * BreadcrumbList.
 */
export const revalidate = 60;

import type { Metadata } from 'next';
import '../../home-v11/home-v11.css';
import '../../service-v11/service-v11.css';
import '../../service-v11/svc.css';
import '../../work-v11/work.css';
import { fetchCaseStudyIndexData } from '@/lib/cms-data';
import type { CaseStudy } from '@/lib/types';
import { getHomeV11Content, getWorkV11Content } from '@/lib/content-utils';
import { getHomeV11Data } from '../../home-v11/data';
import { WorkIndexV11 } from '../../work-v11/WorkIndexV11';

const SITE = 'https://www.loudface.co';

// Order of the CollectionPage list: current offering first, web design & branding last.
const DISCIPLINE_ORDER = [
  'AI Search & Organic Growth',
  'Conversion Optimization',
  'Web Design & Branding',
];
const FALLBACK_DISCIPLINE = 'Web Design & Branding';

export const metadata: Metadata = {
  title: 'Our Work | Case Studies & Portfolio',
  description:
    "LoudFace case studies across AI search & organic growth, conversion optimization, and web design & branding — real results: AI citations, conversion lifts, and launches.",
  alternates: { canonical: '/case-studies' },
  openGraph: {
    title: 'Case Studies & Portfolio | LoudFace',
    description:
      "LoudFace case studies across AI search & organic growth, conversion optimization, and web design & branding.",
    type: 'website',
    url: '/case-studies',
    siteName: 'LoudFace',
    locale: 'en_US',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'LoudFace Case Studies' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@loudface',
    title: 'Case Studies & Portfolio | LoudFace',
    description:
      "LoudFace case studies across AI search & organic growth, conversion optimization, and web design & branding.",
    images: ['/opengraph-image'],
  },
};

const disciplineRank = (d: string) => {
  const i = DISCIPLINE_ORDER.indexOf(d);
  return i === -1 ? DISCIPLINE_ORDER.length : i;
};

export default async function WorkPage() {
  const [c, home, cms, data] = await Promise.all([getWorkV11Content(), getHomeV11Content(), fetchCaseStudyIndexData(), getHomeV11Data()]);
  const studies = cms.caseStudies as (CaseStudy & { id: string })[];

  // Structured data — every study, current offering first, featured first within a discipline.
  const listed = studies
    .filter((s) => s.slug)
    .map((s) => ({
      slug: s.slug,
      title: s['project-title'] || s.name,
      discipline: Array.isArray(s.disciplines) && s.disciplines.length ? s.disciplines[0] : FALLBACK_DISCIPLINE,
      featured: Boolean(s.featured),
    }))
    .sort((a, b) => disciplineRank(a.discipline) - disciplineRank(b.discipline) || Number(b.featured) - Number(a.featured));

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Case Studies',
    description: "LoudFace's portfolio across AI search, conversion, and web design & branding.",
    url: `${SITE}/case-studies`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: listed.map((card, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${SITE}/case-studies/${card.slug}`,
        name: card.title,
      })),
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Case Studies' },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <WorkIndexV11 c={c} home={home} data={data} studies={studies} clients={cms.clients} />
    </>
  );
}
