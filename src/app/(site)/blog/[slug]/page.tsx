/**
 * Blog post — v11 (switched 2026-09-26).
 *
 * Composed from src/app/blog-v11 inside the (site) group. getBlogPostView (blog-v11/view.ts) prepares the post
 * exactly as this route did (body normalisation, contents ids, service auto-links, FAQ fallback, two-tier related
 * selection); BlogPostV11 draws it, the body through the same BlogBodyV3 renderer (inline visuals included).
 * generateStaticParams, generateMetadata and the JSON-LD (BlogPosting, BreadcrumbList, FAQPage, ItemList, Dataset,
 * speakable) are unchanged. The old comparison cross-links block is gone: six of its seven targets now 301 elsewhere.
 */
export const revalidate = 60;

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { fetchSlugs, fetchBlogPostData, fetchItemBySlug } from '@/lib/cms-data';
import { buildNoIndexMetadata, buildPageMetadata, truncateSeoTitle, truncateSeoDescription } from '@/lib/seo-utils';
import {
  extractFAQFromHTML,
  buildFAQSchema,
  buildItemListSchema,
  buildSpeakableSchema,
  buildDatasetSchema,
  buildArticleAuthorSchema,
  buildOrganizationPublisher,
  buildImageObject,
} from '@/lib/schema-utils';
import type { BlogPost } from '@/lib/types';
import { getBlogV11Content, getHomeV11Content } from '@/lib/content-utils';
import '../../../home-v11/home-v11.css';
import '../../../service-v11/service-v11.css';
import '../../../service-v11/svc.css';
import '../../../case-v11/case.css';
import '../../../blog-v11/blog.css';
import { BUYER_INTENT_SLUGS } from '../../../blog-v3/buyer-intent-slugs';
import { BlogPostV11 } from '../../../blog-v11/BlogPostV11';
import { getBlogPostView } from '../../../blog-v11/view';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  // Slugs only. This used to call fetchCollection('blog'), which pulled every
  // article body just to read the URL segment off each one.
  const slugs = await fetchSlugs('blog');
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const post = await fetchItemBySlug<BlogPost>('blog', slug);
  if (!post) {
    return buildNoIndexMetadata('Blog Post');
  }

  const rawTitle = post['meta-title'] || post.name;
  const title = truncateSeoTitle(rawTitle);
  const description = truncateSeoDescription(post['meta-description'])
    || truncateSeoDescription(post.excerpt)
    || '';
  const imageUrl = post.thumbnail?.url || '/opengraph-image';

  return buildPageMetadata({
    title,
    description,
    canonicalPath: `/blog/${slug}`,
    type: 'article',
    imageUrl,
    publishedTime: post['published-date'],
    modifiedTime: post['last-updated'] || post['published-date'],
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;

  // fetchBlogPostData and fetchItemBySlug are memoised per request, so the view and the JSON-LD share one read.
  const [cmsData, post, v, c, home] = await Promise.all([
    fetchBlogPostData(),
    fetchItemBySlug<BlogPost>('blog', slug),
    getBlogPostView(slug),
    getBlogV11Content(),
    getHomeV11Content(),
  ]);

  if (!post || !v) {
    notFound();
  }

  const author = post.author ? cmsData.teamMembers.get(post.author) || null : null;

  const canonicalUrl = `https://www.loudface.co/blog/${slug}`;

  const articleImage = buildImageObject(post.thumbnail?.url);
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.name,
    url: canonicalUrl,
    description: post.excerpt || '',
    ...(articleImage && { image: articleImage }),
    datePublished: post['published-date'],
    dateModified: post['last-updated'] || post['published-date'],
    author: buildArticleAuthorSchema(author),
    publisher: buildOrganizationPublisher(),
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.loudface.co' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.loudface.co/blog' },
      { '@type': 'ListItem', position: 3, name: post.name },
    ],
  };

  // FAQ: prefer hand-written CMS FAQ, fall back to auto-extracted from H2 headings.
  const faqItems = post.faq?.length ? post.faq : extractFAQFromHTML(post.content);
  const faqSchema = buildFAQSchema(faqItems);
  const itemListSchema = buildItemListSchema(post.content, post.name, canonicalUrl);
  const speakableSchema = buildSpeakableSchema(post.name, canonicalUrl);
  // Dataset schema — only emits on opt-in first-party data studies (datasetMeta set).
  const datasetSchema = buildDatasetSchema(post, canonicalUrl);

  return (
    <>
      {/* Structured Data — native script tags for SSR visibility to crawlers */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}
      {itemListSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      )}
      {datasetSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }} />
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableSchema) }} />
      <BlogPostV11 c={c} home={home} v={v} nextStep={BUYER_INTENT_SLUGS.has(slug)} />
    </>
  );
}
