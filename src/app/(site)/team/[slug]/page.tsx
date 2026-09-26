/**
 * Team member / author page — v11 (switched 2026-09-26).
 *
 * Composed from src/app/team-v11 inside the (site) group: the portrait, bio and skills, the member's articles as
 * cards, the colleagues, and the published results. Copy in team-v11.json. SEO purpose is unchanged: this page
 * carries the E-E-A-T signal for every blog author (Person + ProfilePage + BreadcrumbList + Speakable JSON-LD, the
 * full list of posts by this author, the link back from each post). generateStaticParams and the schemas are
 * unchanged, except that the job title in the metadata and the Person schema is now the one the page shows
 * (teamTitle: the leads' titles from team-v11.json, else the CMS job title).
 */
export const revalidate = 60;

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import '../../../home-v11/home-v11.css';
import '../../../service-v11/service-v11.css';
import '../../../service-v11/svc.css';
import '../../../blog-v11/blog.css';
import '../../../team-v11/team.css';
import { fetchCollection, fetchHomepageData } from '@/lib/cms-data';
import { formatReadTime } from '@/lib/blog-utils';
import { buildPageMetadata, truncateSeoDescription, truncateSeoTitle } from '@/lib/seo-utils';
import { buildSpeakableSchema } from '@/lib/schema-utils';
import { getHomeV11Content, getTeamV11Content } from '@/lib/content-utils';
import { teamTitle } from '@/lib/team-titles';
import { getHomeV11Data } from '../../../home-v11/data';
import { TeamProfileV11 } from '../../../team-v11/TeamProfileV11';
import { getRedirectedPaths } from '@/lib/redirected-paths';

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

  const jobTitle = teamTitle(member.slug, member['job-title']);
  const rawTitle = `${member.name}${jobTitle ? ` — ${jobTitle}` : ''}`;
  const title = truncateSeoTitle(rawTitle);
  // The bio can run to several hundred characters; the description is cut to the SERP length (120-160).
  const fallback = `${member.name} is a member of the LoudFace agency team. Explore their published articles, areas of expertise, and contributions to client work.`;
  const description = truncateSeoDescription(member['bio-summary']) || fallback;

  return buildPageMetadata({
    title,
    description,
    canonicalPath: `/team/${slug}`,
    type: 'website',
  });
}

export default async function TeamMemberPage({ params }: PageProps) {
  const { slug } = await params;
  const [cmsData, home, c, data, redirected] = await Promise.all([fetchHomepageData(), getHomeV11Content(), getTeamV11Content(), getHomeV11Data(), getRedirectedPaths()]);
  const { teamMembers, blogPosts, categories } = cmsData;

  const members = Array.from(teamMembers.values());
  const member = members.find((m) => m.slug === slug);
  if (!member) notFound();
  const jobTitle = teamTitle(member.slug, member['job-title']);

  const posts = blogPosts
    // a folded post 301s elsewhere; the site never links a redirect (same rule as the blog index and the sitemap)
    .filter((post) => post.author === member.id && !redirected.has(`/blog/${post.slug}`))
    .sort((a, b) => (b['published-date'] || '').localeCompare(a['published-date'] || ''))
    .map((post) => ({
      href: `/blog/${post.slug}`,
      title: post.name,
      categoryName: post.category ? categories.get(post.category)?.name : undefined,
      thumbnailUrl: post.thumbnail?.url,
      readTime: formatReadTime(post['time-to-read']),
      date: post['published-date'],
    }));

  const view = {
    slug: member.slug,
    name: member.name,
    jobTitle: member['job-title'],
    bio: member['bio-summary'],
    linkedinUrl: member['linkedin-url'],
    twitterUrl: member['twitter-url'],
    skills: member.skills ?? [],
    posts,
    others: members.filter((x) => x.slug !== slug).map((x) => ({ slug: x.slug, name: x.name, jobTitle: x['job-title'] })),
  };

  /* ── structured data (unchanged from the pre-v3 page, job title as the page shows it) ── */

  const canonicalUrl = `https://www.loudface.co/team/${slug}`;

  const sameAs: string[] = [];
  if (member['linkedin-url']) sameAs.push(member['linkedin-url']);
  if (member['twitter-url']) sameAs.push(member['twitter-url']);

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: member.name,
    url: canonicalUrl,
    ...(jobTitle && { jobTitle }),
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
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <TeamProfileV11 v={view} c={c} home={home} data={data} />
    </>
  );
}
