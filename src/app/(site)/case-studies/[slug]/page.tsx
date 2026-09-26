/**
 * Case study detail — v11 (switched 2026-09-26).
 *
 * Composed from src/app/case-v11 inside the (site) group. getCaseView (case-v11/view.ts) carries this route's
 * former data prep unchanged (resolvers, body processing with TOC ids, related-work scoring, charts, instruments,
 * FAQ items); CaseStudyV11 draws it. generateStaticParams, generateMetadata and the JSON-LD (BreadcrumbList, Article,
 * FAQPage, speakable, Review) are unchanged and read the same view the page shows.
 */
export const revalidate = 60;

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import '../../../home-v11/home-v11.css';
import '../../../service-v11/service-v11.css';
import '../../../service-v11/cro-sections.css';
import '../../../service-v11/svc.css';
import '../../../case-v11/case.css';
import { fetchCollection, fetchItemBySlug } from '@/lib/cms-data';
import {
  buildNoIndexMetadata,
  buildPageMetadata,
  truncateSeoTitle,
  truncateSeoDescription,
} from '@/lib/seo-utils';
import {
  buildFAQSchema,
  buildSpeakableSchema,
  buildReviewSchema,
  buildImageObject,
  buildOrganizationPublisher,
} from '@/lib/schema-utils';
import type { CaseStudy } from '@/lib/types';
import { getHomeV11Content } from '@/lib/content-utils';
import { getCaseView } from '../../../case-v11/view';
import { CaseStudyV11 } from '../../../case-v11/CaseStudyV11';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const items = await fetchCollection<Record<string, unknown>>('case-studies');
  return items
    .filter((item) => item.slug)
    .map((item) => ({
      slug: item.slug as string,
    }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const study = await fetchItemBySlug<CaseStudy>('case-studies', slug);

  if (!study) {
    return buildNoIndexMetadata('Case Study Not Found');
  }

  const rawTitle = study['project-title'] || study.name;
  const title = truncateSeoTitle(rawTitle);
  const summary = study['paragraph-summary']?.replace(/\s+/g, ' ').trim();
  // Truncate CMS summary to SERP limits; if too short, extend with contextual suffix
  let description = truncateSeoDescription(summary);
  if (!description) {
    const base = summary
      ? `${summary} See how LoudFace helped ${study.name} achieve measurable results with our design and development approach.`
      : `See how LoudFace helped ${study.name} achieve measurable results. Full case study with approach, metrics, and outcomes.`;
    description = truncateSeoDescription(base) || base;
  }

  const imageUrl = study['main-project-image-thumbnail']?.url;

  return buildPageMetadata({
    title,
    description,
    canonicalPath: `/case-studies/${slug}`,
    type: 'article',
    imageUrl,
  });
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const [v, home] = await Promise.all([getCaseView(slug), getHomeV11Content()]);
  if (!v) notFound();
  const { study, client, projectTitle, testimonial, testimonialQuote, faqItems } = v;

  // ── Structured data (BreadcrumbList + Article + FAQPage + Speakable + Review) ──
  const canonicalUrl = `https://www.loudface.co/case-studies/${slug}`;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.loudface.co' },
      { '@type': 'ListItem', position: 2, name: 'Case Studies', item: 'https://www.loudface.co/case-studies' },
      { '@type': 'ListItem', position: 3, name: projectTitle },
    ],
  };

  const caseStudyImage = buildImageObject(study['main-project-image-thumbnail']?.url);
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: projectTitle,
    url: canonicalUrl,
    description: study['paragraph-summary'] || `Case study: ${projectTitle}`,
    ...(caseStudyImage && { image: caseStudyImage }),
    ...(study._createdAt && { datePublished: study._createdAt }),
    ...(study._updatedAt && { dateModified: study._updatedAt }),
    author: { '@type': 'Organization', name: 'LoudFace', url: 'https://www.loudface.co' },
    publisher: buildOrganizationPublisher(),
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
  };

  // FAQ: the view's items (hand-written CMS FAQ, else auto-extracted from H2 headings), the same ones the page shows
  const faqSchema = buildFAQSchema(faqItems);
  const speakableSchema = buildSpeakableSchema(projectTitle, canonicalUrl);

  const reviewSchema = testimonialQuote
    ? buildReviewSchema(
        { name: testimonial!.name, role: testimonial!.role, quote: testimonialQuote },
        client?.name || study.name,
      )
    : null;

  return (
    <>
      {/* Structured Data — native script tags for SSR visibility to crawlers */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableSchema) }} />
      {reviewSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }} />
      )}
      <CaseStudyV11 v={v} home={home} />
    </>
  );
}
