/**
 * Team Member / Author Page — v3 (componentized).
 *
 * Composes `src/app/team-v3/*` inside a `.svcv3` wrapper (service-v3.css owns
 * the v3 language; team-v3.css adds only the portrait/social/article
 * furniture). Migrated from the pre-v3 white-hero template on 2026-08-01.
 *
 * SEO purpose is unchanged — this page carries the E-E-A-T signal for every
 * blog author: Person + ProfilePage + BreadcrumbList + Speakable JSON-LD, the
 * full list of posts by this author, and the link back from each post.
 * Metadata, generateStaticParams, and all four schemas are preserved verbatim.
 */
export const revalidate = 60;

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import '../../../service-v3/service-v3.css';
import '../../../team-v3/team-v3.css';
import { fetchCollection, fetchHomepageData } from '@/lib/cms-data';
import { buildPageMetadata, truncateSeoTitle } from '@/lib/seo-utils';
import { buildSpeakableSchema } from '@/lib/schema-utils';
import { TeamMemberPageV3 } from '../../../team-v3/TeamMemberPageV3';
import type { ArticleCard, TeamMemberView } from '../../../team-v3/TeamMemberPageV3';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const items = await fetchCollection<Record<string, unknown>>('team-members');
  return items
    .filter((item) => item.slug)
    .map((item) => ({ slug: item.slug as string }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cmsData = await fetchHomepageData();
  const member = Array.from(cmsData.teamMembers.values()).find((m) => m.slug === slug);

  if (!member) {
    return { title: 'Team Member', robots: { index: false } };
  }

  const rawTitle = `${member.name}${member['job-title'] ? ` — ${member['job-title']}` : ''}`;
  const title = truncateSeoTitle(rawTitle);
  const description =
    member['bio-summary'] ||
    `${member.name} is a member of the LoudFace agency team. Explore their published articles, areas of expertise, and contributions to client work.`;

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

  const member = Array.from(teamMembers.values()).find((m) => m.slug === slug);
  if (!member) notFound();

  const authorPosts = blogPosts
    .filter((post) => post.author === member.id)
    .sort((a, b) => (b['published-date'] || '').localeCompare(a['published-date'] || ''));

  const articles: ArticleCard[] = authorPosts.map((post) => ({
    href: `/blog/${post.slug}`,
    title: post.name,
    category: post.category ? categories.get(post.category)?.name : undefined,
    publishedDate: post['published-date'] || undefined,
    imageUrl: post.thumbnail?.url,
  }));

  const view: TeamMemberView = {
    name: member.name,
    jobTitle: member['job-title'],
    bio: member['bio-summary'],
    portraitUrl: member['profile-picture']?.url,
    linkedinUrl: member['linkedin-url'],
    twitterUrl: member['twitter-url'],
    articles,
  };

  /* ── structured data (unchanged from the pre-v3 page) ──────────────── */

  const canonicalUrl = `https://www.loudface.co/team/${slug}`;

  const sameAs: string[] = [];
  if (member['linkedin-url']) sameAs.push(member['linkedin-url']);
  if (member['twitter-url']) sameAs.push(member['twitter-url']);

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
      : ['Generative Engine Optimization', 'SEO', 'Conversion Rate Optimization', 'B2B SaaS'],
  };

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

  const schemas = [personSchema, profilePageSchema, breadcrumbSchema, speakableSchema];

  return (
    <div className="svcv3">
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <TeamMemberPageV3 view={view} />
    </div>
  );
}
