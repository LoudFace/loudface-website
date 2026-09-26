import type { Metadata } from 'next';
import '../../../home-v11/home-v11.css';
import '../../../service-v11/service-v11.css';
import '../../../service-v11/svc.css';
import '../../../blog-v11/blog.css';
import { fetchBlogIndexData } from '@/lib/cms-data';
import { formatReadTime } from '@/lib/blog-utils';
import { getBlogV11Content, getHomeV11Content } from '@/lib/content-utils';
import { BlogIndexV11 } from '../../../blog-v11/BlogIndexV11';

export const metadata: Metadata = { title: 'Blog index v11 preview', robots: { index: false, follow: false } };
export const revalidate = 3600;

const PER_PAGE = 12;

/** Preview of the v11 blog index before /blog switches over. */
export default async function BlogIndexV11Preview({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: raw } = await searchParams;
  const [c, home, { blogPosts, categories }] = await Promise.all([getBlogV11Content(), getHomeV11Content(), fetchBlogIndexData()]);
  const pages = Math.max(1, Math.ceil(blogPosts.length / PER_PAGE));
  const page = Math.min(Math.max(1, parseInt(raw || '1', 10) || 1), pages);
  const posts = blogPosts.slice((page - 1) * PER_PAGE, page * PER_PAGE).map((p) => ({
    href: `/blog/${p.slug}`,
    title: p.name,
    categoryName: p.category ? categories.get(p.category)?.name : undefined,
    thumbnailUrl: p.thumbnail?.url,
    readTime: formatReadTime(p['time-to-read']),
    date: p['published-date'],
  }));
  return <BlogIndexV11 c={c} home={home} posts={posts} total={blogPosts.length} page={page} pages={pages} />;
}
