/**
 * Blog Index Page
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { fetchHomepageData, getAccessToken, getEmptyHomepageData } from '@/lib/cms-data';
import { thumbnailImage } from '@/lib/image-utils';
import { asset } from '@/lib/assets';
import { SectionContainer } from '@/components/ui/SectionContainer';
import { SectionHeader } from '@/components/ui/SectionHeader';
import type { Category, TeamMember } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Blog | Insights & Resources',
  description: 'Insights on Webflow development, SEO, AEO, and design best practices from the LoudFace team.',
  alternates: {
    canonical: '/blog',
  },
};

export default async function BlogPage() {
  const accessToken = getAccessToken();
  const cmsData = accessToken
    ? await fetchHomepageData(accessToken)
    : getEmptyHomepageData();

  const { blogPosts, categories, teamMembers } = cmsData;

  // Helper functions
  function getCategory(id: string | undefined): Category | undefined {
    if (!id) return undefined;
    return categories.get(id);
  }

  function getAuthor(id: string | undefined): TeamMember | undefined {
    if (!id) return undefined;
    return teamMembers.get(id);
  }

  // Structured Data
  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'LoudFace Blog',
    description: 'Insights on Webflow development, SEO, AEO, and design best practices.',
    url: 'https://www.loudface.co/blog',
    blogPost: blogPosts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.name,
      url: `https://www.loudface.co/blog/${post.slug}`,
      datePublished: post['published-date'],
    })),
  };

  return (
    <>
      <Script
        id="blog-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />

      {/* Hero Section */}
      <section className="pt-4">
        <div className="px-4 md:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="relative border border-surface-200 bg-surface-50 rounded-2xl overflow-hidden">
              <div className="p-8 md:p-12 lg:p-16 text-center">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-hero font-medium text-surface-900">
                  Our <span className="text-primary-600">Blog</span>
                </h1>
                <p className="mt-4 text-lg text-surface-600 max-w-2xl mx-auto">
                  Insights on Webflow development, SEO, AEO, and design best practices from our team.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <SectionContainer padding="lg">
        <SectionHeader
          title="Latest Articles"
          highlightWord="Articles"
          subtitle="Stay updated with our latest insights and resources."
        />

        {blogPosts.length === 0 ? (
          <div className="mt-12 text-center py-16">
            <p className="text-surface-600">No blog posts found. Check back soon!</p>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post, index) => {
              const category = getCategory(post.category);
              const author = getAuthor(post.author);

              return (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group block bg-white rounded-xl border border-surface-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-4"
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={thumbnailImage(post.thumbnail?.url) || asset('/images/placeholder.webp')}
                      alt={post.thumbnail?.alt || post.name}
                      loading={index < 6 ? 'eager' : 'lazy'}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      {category && (
                        <span className="px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
                          {category.name}
                        </span>
                      )}
                      <span className="text-xs text-surface-500">5 min read</span>
                    </div>

                    <h2 className="font-medium text-lg text-surface-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
                      {post.name}
                    </h2>

                    {post.excerpt && (
                      <p className="mt-2 text-sm text-surface-600 line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}

                    <div className="mt-4 pt-4 border-t border-surface-100 flex items-center justify-between">
                      <span className="text-xs text-surface-500">
                        By {author?.name || 'LoudFace'}
                      </span>
                      <span className="flex items-center gap-1.5 text-sm font-medium text-surface-500 group-hover:text-primary-600 transition-colors">
                        Read more
                        <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" viewBox="0 0 16 16" fill="none">
                          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </SectionContainer>
    </>
  );
}
