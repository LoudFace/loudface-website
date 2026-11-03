/**
 * /research — the research hub, v11 direction G (approved by Arnel on 3 Nov 2026; spec docs/research-section.md).
 *
 * Composed from src/app/research-v11 inside the (site) group. The papers are the Sanity `research` documents:
 * fetchResearchIndexData() throws on a failed read, so the hub never renders or caches without its papers; the
 * featured paper is read whole as well, for its second figure. Copy lives in research-v11.json; metadata and JSON-LD
 * read it raw. `?series=<key>` filters the paper grid on the server (every card stays in the HTML, the others
 * hidden), so the filter works without JavaScript; the canonical stays /research.
 * JSON-LD: the breadcrumb, and the page as a CollectionPage whose ItemList is every paper, newest first.
 */
export const revalidate = 60;

import type { Metadata } from 'next';
import '../../home-v11/home-v11.css';
import '../../research-v11/research.css';
import { fetchItemBySlug, fetchResearchIndexData } from '@/lib/cms-data';
import { getHomeV11Content, getResearchV11Content, rawContent, type ResearchV11Content } from '@/lib/content-utils';
import { serializeJsonLd } from '@/lib/schema-utils';
import type { ResearchStudy } from '@/lib/types';
import { SERIES, type SeriesKey } from '../../research-v11/contract';
import { researchers } from '../../research-v11/people';
import { ResearchIndexV11 } from '../../research-v11/ResearchIndexV11';
import { SITE, hubView, isoDay, paperUrl, toCard } from '../../research-v11/view';

const META = rawContent<ResearchV11Content>('research-v11').meta;

export const metadata: Metadata = {
  // The root layout applies `template: "%s | LoudFace"`, so no suffix here.
  title: META.title,
  description: META.description,
  alternates: { canonical: '/research' },
  openGraph: {
    title: META.ogTitle,
    description: META.description,
    type: 'website',
    url: '/research',
    siteName: 'LoudFace',
    locale: 'en_US',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: META.ogImageAlt }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@loudface',
    title: META.ogTitle,
    description: META.description,
    images: ['/opengraph-image'],
  },
};

const isSeries = (s: string | undefined): s is SeriesKey => !!s && Object.hasOwn(SERIES, s);

export default async function ResearchPage({ searchParams }: { searchParams: Promise<{ series?: string }> }) {
  const { series } = await searchParams;
  const [c, home, { studies, teamMembers }] = await Promise.all([getResearchV11Content(), getHomeV11Content(), fetchResearchIndexData()]);
  const v = hubView(studies);
  const featured = v.featured ? await fetchItemBySlug<ResearchStudy>('research', v.featured.slug) : null;
  const featuredFigures = (featured?.figures ?? []).filter((f) => f.placement !== 'lead');
  // The card read leaves out engines and the data window; the whole read fills them in for the featured panel.
  if (featured) v.featured = toCard(featured);
  const people = researchers(studies, teamMembers, home.team);

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Research', item: `${SITE}/research` },
    ],
  };

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE}/research#page`,
    url: `${SITE}/research`,
    name: META.ogTitle,
    description: META.description,
    publisher: { '@id': `${SITE}/#organization` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: v.papers.length,
      itemListElement: v.papers.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: paperUrl(p.slug),
        item: {
          '@type': 'ScholarlyArticle',
          '@id': `${paperUrl(p.slug)}#paper`,
          url: paperUrl(p.slug),
          headline: p.paperTitle || p.name,
          ...(p.finding && { description: p.finding }),
          ...(isoDay(p.date) && { datePublished: isoDay(p.date) }),
        },
      })),
    },
  };

  return (
    <>
      {[breadcrumbSchema, collectionSchema].map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }} />
      ))}
      <ResearchIndexV11 c={c} home={home} v={v} featuredFigures={featuredFigures} people={people} active={isSeries(series) ? series : null} />
    </>
  );
}
