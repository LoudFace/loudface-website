/**
 * Blog Post Detail Page — v3 "answer-first" template (componentized in
 * src/app/blog-v3). Electric lead band → AEO direct-answer citation card
 * straddling the seam → ~70ch reading column + sticky rail → FAQ accordion →
 * author proof bento → night related-gallery → cover CTA → FooterV3.
 *
 * The entire DATA / SCHEMA / METADATA pipeline is preserved verbatim from the
 * previous template: same HTML normalization + TOC extraction, same two-tier
 * related selection, same 5 JSON-LD schemas, same generateMetadata truncation.
 * Only the presentation layer changed.
 *
 * ISR: revalidates every 60s; new slugs render on-demand (dynamicParams).
 */
export const revalidate = 60;

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { fetchCollection, fetchBlogPostData, fetchItemBySlug } from '@/lib/cms-data';
import { formatReadTime } from '@/lib/blog-utils';
import { RelatedComparisons } from '@/components/sections';
import { buildNoIndexMetadata, buildPageMetadata, truncateSeoTitle, truncateSeoDescription, rewriteLegacyUrls } from '@/lib/seo-utils';
import {
  extractFAQFromHTML,
  buildFAQSchema,
  buildItemListSchema,
  buildSpeakableSchema,
  buildArticleAuthorSchema,
  buildOrganizationPublisher,
  buildImageObject,
} from '@/lib/schema-utils';
import { autoLinkServiceMentions, buildHeadingWithId } from '@/lib/html-utils';
import type { BlogPost, Category, TeamMember } from '@/lib/types';

import '../../../blog-v3/blog-v3.css';
import { Lead } from '../../../blog-v3/Lead';
import { AnswerCard } from '../../../blog-v3/AnswerCard';
import { MobileToc } from '../../../blog-v3/MobileToc';
import { BlogBodyV3 } from '../../../blog-v3/BlogBodyV3';
import { ReadingRail } from '../../../blog-v3/ReadingRail';
import { Faq } from '../../../blog-v3/Faq';
import { AuthorBento } from '../../../blog-v3/AuthorBento';
import { RelatedGallery, type RelatedPost } from '../../../blog-v3/RelatedGallery';
import { CoverCTA } from '../../../blog-v3/CoverCTA';
import { BlogV3Scripts } from '../../../blog-v3/Scripts';
import { FooterV3 } from '../../../home-v3/FooterV3';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const items = await fetchCollection<Record<string, unknown>>('blog');
  return items
    .filter((item) => item.slug)
    .map((item) => ({ slug: item.slug as string }));
}

// Extract TOC from content — identical normalization pipeline to the previous template.
function extractTocAndAddIds(html: string | undefined): { toc: { id: string; text: string }[]; html: string } {
  if (!html) return { toc: [], html: '' };

  // Downgrade any H1 tags in CMS content to H2 (page already has an H1)
  let normalized = html.replace(/<h1([^>]*)>(.*?)<\/h1>/gi, '<h2$1>$2</h2>');

  // Fix any HTTP links to our domain that should be HTTPS
  normalized = normalized.replace(/http:\/\/loudface\.co/g, 'https://www.loudface.co');

  // Rewrite legacy internal URLs to canonical paths (eliminates 308 redirect chains)
  normalized = rewriteLegacyUrls(normalized);

  // Replace curly/smart quotes with straight quotes in HTML attributes
  normalized = normalized.replace(/[“”]/g, '"');
  normalized = normalized.replace(/[‘’]/g, "'");

  // Escape <script> tags in CMS rich text so they display as code, not execute.
  normalized = normalized.replace(/<script\b/gi, '&lt;script');
  normalized = normalized.replace(/<\/script>/gi, '&lt;/script&gt;');

  // Fix malformed URLs from CMS rich text: <https://example.com> → https://example.com
  normalized = normalized.replace(/src="<(https?:\/\/[^">]+)>"/g, 'src="$1"');
  normalized = normalized.replace(/href="<(https?:\/\/[^">]+)>"/g, 'href="$1"');

  // Add alt text to CMS images that have empty, missing, or placeholder alt attributes
  normalized = normalized.replace(
    /<img([^>]*?)alt="(__wf_reserved_inherit)?"([^>]*?)>/gi,
    '<img$1alt="Blog post image"$3>',
  );
  normalized = normalized.replace(
    /<img(?![^>]*alt=)([^>]*?)>/gi,
    '<img alt="Blog post image"$1>',
  );

  // Wrap every <table> in a horizontally-scrollable container (.blog-table-wrap).
  normalized = normalized.replace(
    /<table\b[\s\S]*?<\/table>/gi,
    (match) => `<div class="blog-table-wrap">${match}<span class="table-cue"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>Scroll for the full table</span></div>`,
  );

  const toc: { id: string; text: string }[] = [];
  let index = 0;

  const processedHtml = normalized.replace(/<h2([^>]*)>(.*?)<\/h2>/gi, (_match, attrs, content) => {
    const text = content.replace(/<[^>]*>/g, '').trim();
    const id = `section-${index++}-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
    toc.push({ id, text });
    // buildHeadingWithId strips the id the CMS export already carries. Appending
    // ours without that emitted `<h2 id="" id="section-0-x">`; the parser keeps the
    // FIRST id, so every TOC anchor on this page silently resolved to nothing.
    return buildHeadingWithId('h2', attrs, id, content);
  });

  return { toc, html: processedHtml };
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

  const [cmsData, post] = await Promise.all([
    fetchBlogPostData(),
    fetchItemBySlug<BlogPost>('blog', slug),
  ]);
  const { blogPosts, categories, teamMembers } = cmsData;

  if (!post) {
    notFound();
  }

  let category: Category | null = null;
  let author: TeamMember | null = null;
  let relatedPosts: BlogPost[] = [];

  if (post.category) {
    category = categories.get(post.category) || null;
  }
  if (post.author) {
    author = teamMembers.get(post.author) || null;
  }

  // Two-tier related selection (verbatim): same-category first, then slug-affinity backfill.
  const sameCategoryPosts = blogPosts
    .filter((entry) => entry.slug !== slug && entry.category === post.category)
    .slice(0, 3);

  if (sameCategoryPosts.length < 3) {
    const slugKeywords = slug.split('-').filter((word) => word.length > 3);
    const remaining = 3 - sameCategoryPosts.length;
    const affinityPosts = blogPosts
      .filter(
        (entry) =>
          entry.slug !== slug &&
          !sameCategoryPosts.some((matched) => matched.slug === entry.slug),
      )
      .map((entry) => ({
        ...entry,
        affinity: slugKeywords.filter((keyword) => entry.slug.includes(keyword)).length,
      }))
      .sort((a, b) => b.affinity - a.affinity)
      .slice(0, remaining);

    relatedPosts = [...sameCategoryPosts, ...affinityPosts];
  } else {
    relatedPosts = sameCategoryPosts;
  }

  const COMPARISON_SLUGS = [
    'webflow-vs-wix-studio',
    'webflow-vs-squarespace',
    'webflow-vs-hubspot',
    'webflow-vs-wordpress-org',
    'webflow-vs-wordpress-com',
    'webflow-vs-editorx',
    'webflow-vs-popular-alternatives',
  ];
  const isComparisonPost = COMPARISON_SLUGS.includes(slug);

  const { toc, html: processedContent } = extractTocAndAddIds(post.content);
  const linkedContent = autoLinkServiceMentions(processedContent);
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
  const showFaq = faqItems.length >= 2;
  if (showFaq) {
    toc.push({ id: 'faq', text: 'Frequently Asked Questions' });
  }
  const faqSchema = buildFAQSchema(faqItems);
  const itemListSchema = buildItemListSchema(post.content, post.name, canonicalUrl);
  const speakableSchema = buildSpeakableSchema(post.name, canonicalUrl);

  const readTime = formatReadTime(post['time-to-read']);
  const leadAuthor = author
    ? {
        name: author.name,
        slug: author.slug,
        jobTitle: author['job-title'],
        avatarUrl: author['profile-picture']?.url,
      }
    : null;

  const related: RelatedPost[] = relatedPosts.map((entry) => ({
    href: `/blog/${entry.slug}`,
    title: entry.name,
    categoryName: entry.category ? categories.get(entry.category)?.name : undefined,
    thumbnailUrl: entry.thumbnail?.url,
    readTime: formatReadTime(entry['time-to-read']),
  }));

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableSchema) }} />

      <div className="blogv3">
        <article>
          <Lead
            title={post.name}
            categoryName={category?.name}
            excerpt={post.excerpt}
            author={leadAuthor}
            publishedDate={post['published-date']}
            lastUpdated={post['last-updated']}
            readTime={readTime}
          />

          {/* SIGNATURE move — degrades to the plain header flow when absent (no empty card). */}
          {post['direct-answer'] && <AnswerCard answer={post['direct-answer']} articleUrl={canonicalUrl} />}

          <section className="read">
            <div className="container read-grid">
              <div className="read-main">
                <MobileToc items={toc} />
                {linkedContent ? (
                  <BlogBodyV3 html={linkedContent} visuals={post.visuals} />
                ) : (
                  <p className="prose">No content available for this post.</p>
                )}
              </div>
              <ReadingRail toc={toc} articleUrl={canonicalUrl} articleTitle={post.name} />
            </div>
          </section>

          {showFaq && <Faq items={faqItems} />}

          {leadAuthor && (
            <AuthorBento
              author={{ ...leadAuthor, bio: author?.['bio-summary'], linkedinUrl: author?.['linkedin-url'] }}
              publishedDate={post['published-date']}
              lastUpdated={post['last-updated']}
              categoryName={category?.name}
              readTime={readTime}
            />
          )}
        </article>

        {/* Comparison cross-links — preserved; only fires for the 7 webflow-vs-* slugs. */}
        {isComparisonPost && <RelatedComparisons currentSlug={slug} />}

        <RelatedGallery posts={related} />
        <CoverCTA />
        <FooterV3 />
      </div>

      <BlogV3Scripts />
    </>
  );
}
