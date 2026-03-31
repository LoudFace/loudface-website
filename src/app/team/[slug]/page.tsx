/**
 * Team Member / Author Page
 *
 * SEO purpose: Establishes E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)
 * by giving each author a dedicated page with:
 * - Person schema (JSON-LD) — tells Google/AI who wrote the content
 * - ProfilePage schema — structured data for author profiles
 * - All blog posts by this author — demonstrates expertise
 * - Link back from blog posts → here → builds topical authority
 */
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { fetchCollection, fetchHomepageData } from '@/lib/cms-data';
import { avatarImage, thumbnailImage } from '@/lib/image-utils';
import { asset } from '@/lib/assets';
import { Badge, SectionContainer } from '@/components/ui';
import { CTA } from '@/components/sections';
import { buildPageMetadata, truncateSeoTitle } from '@/lib/seo-utils';
import { buildSpeakableSchema } from '@/lib/schema-utils';
import type { BlogPost, Category, TeamMember } from '@/lib/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const items = await fetchCollection<Record<string, unknown>>('team-members');
  return items
    .filter((item) => item.slug)
    .map((item) => ({
      slug: item.slug as string,
    }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cmsData = await fetchHomepageData();
  const member = Array.from(cmsData.teamMembers.values()).find(m => m.slug === slug);

  if (!member) {
    return { title: 'Team Member', robots: { index: false } };
  }

  const rawTitle = `${member.name}${member['job-title'] ? ` — ${member['job-title']}` : ''}`;
  const title = truncateSeoTitle(rawTitle);
  const description = member['bio-summary']
    || `${member.name} is a member of the LoudFace agency team. Explore their published articles, areas of expertise, and contributions to client work.`;

  return buildPageMetadata({
    title,
    description,
    canonicalPath: `/team/${slug}`,
    type: 'website',
  });
}

export default async function TeamMemberPage({ params }: PageProps) {
  const { slug } = await params;
  const cmsData = await fetchHomepageData();
  const { teamMembers, blogPosts, categories } = cmsData;

  // Find team member by slug
  const member = Array.from(teamMembers.values()).find(m => m.slug === slug);
  if (!member) {
    notFound();
  }

  // Find all blog posts authored by this team member
  const authorPosts = blogPosts
    .filter(post => post.author === member.id)
    .sort((a, b) => {
      const dateA = a['published-date'] || '';
      const dateB = b['published-date'] || '';
      return dateB.localeCompare(dateA); // newest first
    });

  const canonicalUrl = `https://www.loudface.co/team/${slug}`;

  // Build sameAs array from social profiles
  const sameAs: string[] = [];
  if (member['linkedin-url']) sameAs.push(member['linkedin-url']);
  if (member['twitter-url']) sameAs.push(member['twitter-url']);

  // Person schema — E-E-A-T signal for Google and AI systems
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: member.name,
    url: canonicalUrl,
    ...(member['job-title'] && { jobTitle: member['job-title'] }),
    ...(member['profile-picture']?.url && { image: member['profile-picture'].url }),
    ...(member['bio-summary'] && { description: member['bio-summary'] }),
    ...(sameAs.length > 0 && { sameAs }),
    worksFor: {
      '@type': 'Organization',
      name: 'LoudFace',
      url: 'https://www.loudface.co',
    },
    knowsAbout: member.skills?.length
      ? member.skills
      : ['Web Design', 'Webflow Development', 'SEO', 'B2B SaaS'],
  };

  // ProfilePage schema
  const profilePageSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@id': canonicalUrl,
      '@type': 'Person',
      name: member.name,
    },
    // dateCreated omitted — no accurate date available; absent is better than inaccurate
  };

  // Breadcrumb schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.loudface.co' },
      { '@type': 'ListItem', position: 2, name: 'About', item: 'https://www.loudface.co/about' },
      { '@type': 'ListItem', position: 3, name: member.name },
    ],
  };

  const speakableSchema = buildSpeakableSchema(member.name, canonicalUrl);

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profilePageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableSchema) }}
      />

      {/* Hero */}
      <section className="pt-24 pb-12 bg-white">
        <div className="px-4 md:px-8 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <nav className="mb-6" aria-label="Breadcrumb">
              <ol className="flex items-center gap-2 text-sm text-surface-500">
                <li><Link href="/about" className="hover:text-primary-600">About</Link></li>
                <li><span className="mx-1">/</span></li>
                <li className="text-surface-900">{member.name}</li>
              </ol>
            </nav>

            <div className="flex flex-col sm:flex-row items-start gap-6">
              {member['profile-picture']?.url ? (
                <img
                  src={avatarImage(member['profile-picture'].url)}
                  alt={member.name}
                  width="120"
                  height="120"
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-surface-100"
                  loading="eager"
                  fetchPriority="high"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-surface-200 flex items-center justify-center ring-4 ring-surface-100">
                  <span className="text-3xl font-medium text-surface-500">
                    {member.name.charAt(0)}
                  </span>
                </div>
              )}

              <div>
                <h1 className="text-3xl md:text-4xl font-medium text-surface-900" data-speakable>
                  {member.name}
                </h1>
                {member['job-title'] && (
                  <p className="mt-1 text-lg text-primary-600 font-medium">
                    {member['job-title']}
                  </p>
                )}
                {member['bio-summary'] && (
                  <p className="mt-3 text-surface-600 max-w-xl leading-relaxed">
                    {member['bio-summary']}
                  </p>
                )}

                {/* Social links */}
                {sameAs.length > 0 && (
                  <div className="mt-4 flex items-center gap-3">
                    {member['linkedin-url'] && (
                      <a
                        href={member['linkedin-url']}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-primary-600 transition-colors"
                        aria-label={`${member.name} on LinkedIn`}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        LinkedIn
                      </a>
                    )}
                    {member['twitter-url'] && (
                      <a
                        href={member['twitter-url']}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-primary-600 transition-colors"
                        aria-label={`${member.name} on X`}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        X
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Published Articles */}
      {authorPosts.length > 0 && (
        <SectionContainer>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-medium text-surface-900 mb-8">
              Articles by {member.name}
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {authorPosts.map((post) => {
                const postCategory = post.category ? categories.get(post.category) : undefined;

                return (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="group block bg-white rounded-xl border border-surface-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                  >
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={thumbnailImage(post.thumbnail?.url) || asset('/images/placeholder.webp')}
                        alt={post.name}
                        width="800"
                        height="450"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-4">
                      {postCategory && (
                        <Badge className="mb-2 border-primary-100 bg-primary-50 text-primary-700">
                          {postCategory.name}
                        </Badge>
                      )}
                      <h3 className="font-medium text-surface-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
                        {post.name}
                      </h3>
                      {post['published-date'] && (
                        <time
                          dateTime={post['published-date']}
                          className="block mt-2 text-sm text-surface-500"
                        >
                          {new Date(post['published-date']).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </time>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </SectionContainer>
      )}

      {/* Empty state */}
      {authorPosts.length === 0 && (
        <SectionContainer>
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-surface-500 text-lg">
              No published articles yet. Check back soon!
            </p>
          </div>
        </SectionContainer>
      )}

      {/* CTA */}
      <CTA
        variant="dark"
        title="Want to work with our team?"
        subtitle="Let's discuss how we can help you achieve your goals."
        ctaText="Book a call"
      />
    </>
  );
}
