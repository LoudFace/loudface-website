/**
 * Blog index — v11 (switched 2026-09-26).
 *
 * Composed from src/app/blog-v11 inside the (site) group: the newest article as the cover beside the title, then the
 * rest of the page's posts, twelve a page, with every page linked as a plain server-rendered link (the crawl path to
 * older posts). Copy in blog-v11.json. Metadata (each paginated page its own canonical) and the Blog + BreadcrumbList
 * JSON-LD (the current page's posts) are unchanged.
 *
 * ISR: revalidates every 60s so new posts and thumbnail changes surface.
 */
export const revalidate = 60;

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchBlogIndexData } from '@/lib/cms-data';
import { formatReadTime } from '@/lib/blog-utils';
import { getRedirectedPaths } from '@/lib/redirected-paths';
import { getBlogV11Content, getHomeV11Content } from '@/lib/content-utils';
import '../../home-v11/home-v11.css';
import '../../service-v11/service-v11.css';
import '../../service-v11/svc.css';
import '../../blog-v11/blog.css';
import { BlogIndexV11 } from '../../blog-v11/BlogIndexV11';

const POSTS_PER_PAGE = 12;

// Paginated pages carry their own canonical. Until 2026-09-06 /blog?page=2..8
// all declared /blog as canonical, so Google folded them into page 1 and had
// no crawl path to the ~78 posts that only those pages link to.
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam || '1', 10) || 1);
  const path = page > 1 ? `/blog?page=${page}` : '/blog';
  return {
  title: page > 1 ? `B2B SaaS Organic Growth Insights – Page ${page}` : 'B2B SaaS Organic Growth Insights',
  description: 'Actionable GEO, SEO, AEO, content, and conversion insights from LoudFace. Browse B2B SaaS guides, tutorials, and Webflow delivery articles.',
  alternates: {
    canonical: path,
  },
  openGraph: {
    title: 'LoudFace Blog | B2B SaaS Organic Growth Insights',
    description: 'Actionable GEO, SEO, AEO, content, and conversion insights from LoudFace. Browse B2B SaaS guides, tutorials, and Webflow delivery articles.',
    type: 'website',
    url: path,
    siteName: 'LoudFace',
    locale: 'en_US',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'LoudFace Blog' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@loudface',
    title: 'LoudFace Blog | B2B SaaS Organic Growth Insights',
    description: 'Actionable GEO, SEO, AEO, content, and conversion insights from LoudFace. Browse B2B SaaS guides, tutorials, and Webflow delivery articles.',
    images: ['/opengraph-image'],
  },
  };
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const [c, home, { blogPosts: allPosts, categories }, redirected] = await Promise.all([getBlogV11Content(), getHomeV11Content(), fetchBlogIndexData(), getRedirectedPaths()]);
  // A post folded into another article still has a published Sanity document; its URL 301s, so the index does not
  // link it (the sitemap drops the same paths).
  const blogPosts = allPosts.filter((post) => !redirected.has(`/blog/${post.slug}`));

  // Pagination. A page past the last one is a 404, not a copy of the last page under its own canonical.
  const totalPages = Math.max(1, Math.ceil(blogPosts.length / POSTS_PER_PAGE));
  const requested = Math.max(1, parseInt(pageParam || '1', 10) || 1);
  if (requested > totalPages) notFound();
  const safePage = requested;
  const paginatedPosts = blogPosts.slice(
    (safePage - 1) * POSTS_PER_PAGE,
    safePage * POSTS_PER_PAGE,
  );

  // Structured Data — only include current page's posts (verbatim).
  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'LoudFace Blog',
    description: 'Insights on GEO, SEO, AEO, content, conversion, and Webflow delivery that help B2B SaaS companies get discovered and turn visibility into customers.',
    url: 'https://www.loudface.co/blog',
    blogPost: paginatedPosts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.name,
      url: `https://www.loudface.co/blog/${post.slug}`,
      datePublished: post['published-date'],
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.loudface.co' },
      { '@type': 'ListItem', position: 2, name: 'Blog' },
    ],
  };

  const posts = paginatedPosts.map((p) => ({
    href: `/blog/${p.slug}`,
    title: p.name,
    categoryName: p.category ? categories.get(p.category)?.name : undefined,
    thumbnailUrl: p.thumbnail?.url,
    readTime: formatReadTime(p['time-to-read']),
    date: p['published-date'],
  }));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <BlogIndexV11 c={c} home={home} posts={posts} total={blogPosts.length} page={safePage} pages={totalPages} />
    </>
  );
}
