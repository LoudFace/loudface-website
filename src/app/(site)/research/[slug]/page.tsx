/**
 * /research/<slug> — a research paper, v11 direction G (approved by Arnel on 3 Nov 2026; spec docs/research-section.md).
 *
 * Composed from src/app/research-v11 inside the (site) group. The paper is its Sanity `research` document, read
 * whole; the "More research" strip and the bylines come from fetchResearchDetailData(), which throws on a failed read.
 * An unknown slug is a 404. Copy lives in research-v11.json.
 * JSON-LD: ScholarlyArticle (headline, the finding as its description and as the speakable part, authors as Person,
 * the LoudFace Organization as publisher by @id), Dataset when the paper sets datasetMeta, and the breadcrumb.
 */
export const revalidate = 60;

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import '../../../home-v11/home-v11.css';
import '../../../research-v11/research.css';
import { fetchItemBySlug, fetchResearchDetailData, fetchSlugs } from '@/lib/cms-data';
import { getHomeV11Content, getResearchV11Content } from '@/lib/content-utils';
import { buildArticleAuthorSchema, buildDatasetSchema, buildFAQSchema, buildImageObject, buildOrganizationPublisher, serializeJsonLd } from '@/lib/schema-utils';
import { buildNoIndexMetadata, buildPageMetadata, truncateSeoDescription } from '@/lib/seo-utils';
import type { BlogPost, ResearchStudy, TeamMember } from '@/lib/types';
import { SERIES } from '../../../research-v11/contract';
import { authorsOf } from '../../../research-v11/people';
import { ResearchPaperV11 } from '../../../research-v11/ResearchPaperV11';
import { SITE, bodyView, isoDay, moreResearch, paperUrl, toCard } from '../../../research-v11/view';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await fetchSlugs('research');
  return slugs.map((slug) => ({ slug }));
}

const descriptionOf = (s: ResearchStudy) =>
  truncateSeoDescription(s['meta-description'])
  || truncateSeoDescription(s['headline-finding'])
  || truncateSeoDescription(s.excerpt)
  || s['meta-description']?.trim()
  || s['headline-finding']?.trim()
  || '';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const s = await fetchItemBySlug<ResearchStudy>('research', slug);
  if (!s) return buildNoIndexMetadata('Research');
  // buildPageMetadata fits the title to 60 characters; the live SEO title is kept in metaTitle.
  return buildPageMetadata({
    title: s['meta-title'] || s['paper-title'] || s.name,
    description: descriptionOf(s),
    canonicalPath: `/research/${slug}`,
    type: 'article',
    imageUrl: s.thumbnail?.url || '/opengraph-image',
    publishedTime: s['published-date'],
    modifiedTime: s['last-updated'] || s['published-date'],
  });
}

export default async function ResearchPaperPage({ params }: PageProps) {
  const { slug } = await params;
  const [study, { studies, teamMembers }, c, home] = await Promise.all([
    fetchItemBySlug<ResearchStudy>('research', slug),
    fetchResearchDetailData(),
    getResearchV11Content(),
    getHomeV11Content(),
  ]);
  if (!study) notFound();

  const card = toCard(study);
  const authors = authorsOf(study, teamMembers);
  const v = {
    study,
    card,
    authors,
    body: bodyView(study.content, study.figures),
    more: moreResearch(slug, studies),
    superseded: study.superseded,
  };

  const url = paperUrl(slug);
  const members = (study.authors ?? []).map((id) => teamMembers.get(id)).filter((m): m is TeamMember => !!m);
  const image = buildImageObject(study.thumbnail?.url);
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    '@id': `${url}#paper`,
    url,
    headline: study['meta-title'] || study['paper-title'] || study.name,
    ...(study['paper-title'] && { name: study['paper-title'] }),
    alternativeHeadline: study.name,
    description: study['headline-finding'] || study.excerpt || study.name,
    ...(image && { image }),
    ...(isoDay(study['published-date']) && { datePublished: study['published-date'] }),
    dateModified: study['last-updated'] || study['published-date'],
    author: members.length ? members.map(buildArticleAuthorSchema) : buildArticleAuthorSchema(null),
    publisher: buildOrganizationPublisher(),
    about: { '@type': 'Thing', name: SERIES[card.series].name },
    ...(study['key-takeaways']?.length && { abstract: study['key-takeaways'].join(' ') }),
    ...(study.supersedes && { isBasedOn: paperUrl(study.supersedes) }),
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    isPartOf: { '@type': 'CollectionPage', '@id': `${SITE}/research#page` },
    speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '[data-speakable]'] },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Research', item: `${SITE}/research` },
      { '@type': 'ListItem', position: 3, name: study.name },
    ],
  };

  // Dataset — only when the paper sets datasetMeta. The helper reads two fields the research read carries under the
  // same names as a blog post's ('dataset-meta', 'published-date').
  const datasetSchema = buildDatasetSchema(
    { 'dataset-meta': study['dataset-meta'], 'published-date': study['published-date'] } as unknown as BlogPost,
    url,
  );

  return (
    <>
      {[articleSchema, breadcrumbSchema, datasetSchema, buildFAQSchema(study.faq ?? [])].filter(Boolean).map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema as object) }} />
      ))}
      <ResearchPaperV11 c={c} home={home} v={v} />
    </>
  );
}
