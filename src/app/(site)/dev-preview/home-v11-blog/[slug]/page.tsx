import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import '../../../../home-v11/home-v11.css';
import '../../../../service-v11/service-v11.css';
import '../../../../service-v11/svc.css';
import '../../../../case-v11/case.css';
import '../../../../blog-v11/blog.css';
import { getBlogV11Content, getHomeV11Content } from '@/lib/content-utils';
import { BUYER_INTENT_SLUGS } from '../../../../blog-v3/buyer-intent-slugs';
import { BlogPostV11 } from '../../../../blog-v11/BlogPostV11';
import { getBlogPostView } from '../../../../blog-v11/view';

export const metadata: Metadata = { title: 'Blog post v11 preview', robots: { index: false, follow: false } };
export const revalidate = 3600;

/** Preview of the v11 blog post template on any /blog/<slug>, before the live route switches over. */
export default async function BlogPostV11Preview({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [c, home, v] = await Promise.all([getBlogV11Content(), getHomeV11Content(), getBlogPostView(slug)]);
  if (!v) notFound();
  return <BlogPostV11 c={c} home={home} v={v} nextStep={BUYER_INTENT_SLUGS.has(slug)} />;
}
