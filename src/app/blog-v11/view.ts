import { ImageSizes, optimizeImage } from '@/lib/image-utils';
import { fetchBlogPostData, fetchItemBySlug } from '@/lib/cms-data';
import { formatReadTime } from '@/lib/blog-utils';
import { rewriteLegacyUrls } from '@/lib/seo-utils';
import { extractFAQFromHTML } from '@/lib/schema-utils';
import { autoLinkServiceMentions, buildHeadingWithId } from '@/lib/html-utils';
import type { BlogPost, BlogVisual } from '@/lib/types';

/**
 * The data a v11 blog post renders, prepared exactly as the live /blog/[slug] page prepares it (same body
 * normalisation, contents extraction, service auto-links, FAQ fallback and two-tier related selection), so the
 * template swap changes presentation only. Source: src/app/(site)/blog/[slug]/page.tsx.
 */

export interface PostCardData {
  href: string;
  title: string;
  categoryName?: string;
  thumbnailUrl?: string;
  readTime: string;
  date?: string;
}

export interface BlogPostView {
  slug: string;
  title: string;
  excerpt?: string;
  directAnswer?: string;
  categoryName?: string;
  thumbnailUrl?: string;
  publishedDate?: string;
  lastUpdated?: string;
  readTime: string;
  author: { name: string; slug?: string; jobTitle?: string; avatarUrl?: string; bio?: string; linkedinUrl?: string } | null;
  toc: { id: string; text: string }[];
  html: string;
  visuals?: BlogVisual[];
  faq: { question: string; answer: string }[];
  related: PostCardData[];
  url: string;
}

function extractTocAndAddIds(html: string | undefined): { toc: { id: string; text: string }[]; html: string } {
  if (!html) return { toc: [], html: '' };
  let normalized = html.replace(/<h1([^>]*)>(.*?)<\/h1>/gi, '<h2$1>$2</h2>');
  normalized = normalized.replace(/http:\/\/loudface\.co/g, 'https://www.loudface.co');
  normalized = rewriteLegacyUrls(normalized);
  normalized = normalized.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
  normalized = normalized.replace(/<script\b/gi, '&lt;script').replace(/<\/script>/gi, '&lt;/script&gt;');
  normalized = normalized.replace(/src="<(https?:\/\/[^">]+)>"/g, 'src="$1"').replace(/href="<(https?:\/\/[^">]+)>"/g, 'href="$1"');
  normalized = normalized.replace(/<img([^>]*?)alt="(__wf_reserved_inherit)?"([^>]*?)>/gi, '<img$1alt="Blog post image"$3>');
  normalized = normalized.replace(/<img(?![^>]*alt=)([^>]*?)>/gi, '<img alt="Blog post image"$1>');
  normalized = normalized.replace(/<table\b[\s\S]*?<\/table>/gi, (m) => `<div class="blog-table-wrap">${m}</div>`);
  const toc: { id: string; text: string }[] = [];
  let index = 0;
  const out = normalized.replace(/<h2([^>]*)>(.*?)<\/h2>/gi, (_m, attrs, content) => {
    const text = content.replace(/<[^>]*>/g, '').trim();
    const id = `section-${index++}-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
    toc.push({ id, text });
    return buildHeadingWithId('h2', attrs, id, content);
  });
  return { toc, html: out };
}

export async function getBlogPostView(slug: string): Promise<BlogPostView | null> {
  const [cms, post] = await Promise.all([fetchBlogPostData(), fetchItemBySlug<BlogPost>('blog', slug)]);
  if (!post) return null;
  const { blogPosts, categories, teamMembers } = cms;
  const author = post.author ? teamMembers.get(post.author) ?? null : null;
  const sameCategory = blogPosts.filter((p) => p.slug !== slug && p.category === post.category).slice(0, 3);
  let related = sameCategory;
  if (sameCategory.length < 3) {
    const words = slug.split('-').filter((w) => w.length > 3);
    related = [
      ...sameCategory,
      ...blogPosts
        .filter((p) => p.slug !== slug && !sameCategory.some((m) => m.slug === p.slug))
        .map((p) => ({ ...p, affinity: words.filter((w) => p.slug.includes(w)).length }))
        .sort((a, b) => b.affinity - a.affinity)
        .slice(0, 3 - sameCategory.length),
    ];
  }
  const { toc, html } = extractTocAndAddIds(post.content);
  const faq = post.faq?.length ? post.faq : extractFAQFromHTML(post.content);
  const url = `https://www.loudface.co/blog/${slug}`;
  return {
    slug,
    title: post.name,
    excerpt: post.excerpt,
    directAnswer: post['direct-answer'],
    categoryName: post.category ? categories.get(post.category)?.name : undefined,
    thumbnailUrl: post.thumbnail?.url,
    publishedDate: post['published-date'],
    lastUpdated: post['last-updated'],
    readTime: formatReadTime(post['time-to-read']),
    author: author
      ? { name: author.name, slug: author.slug, jobTitle: author['job-title'], avatarUrl: optimizeImage(author['profile-picture']?.url, ImageSizes.avatarLarge), bio: author['bio-summary'], linkedinUrl: author['linkedin-url'] }
      : null,
    toc: faq.length >= 2 ? [...toc, { id: 'faq', text: 'Frequently Asked Questions' }] : toc,
    html: autoLinkServiceMentions(html),
    visuals: post.visuals,
    faq: faq.length >= 2 ? faq : [],
    related: related.map((p) => ({
      href: `/blog/${p.slug}`,
      title: p.name,
      categoryName: p.category ? categories.get(p.category)?.name : undefined,
      thumbnailUrl: p.thumbnail?.url,
      readTime: formatReadTime(p['time-to-read']),
      date: p['published-date'],
    })),
    url,
  };
}
