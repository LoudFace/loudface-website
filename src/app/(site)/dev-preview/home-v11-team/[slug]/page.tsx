import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import '../../../../home-v11/home-v11.css';
import '../../../../service-v11/service-v11.css';
import '../../../../service-v11/svc.css';
import '../../../../blog-v11/blog.css';
import '../../../../team-v11/team.css';
import { fetchHomepageData } from '@/lib/cms-data';
import { formatReadTime } from '@/lib/blog-utils';
import { getHomeV11Content, getTeamV11Content } from '@/lib/content-utils';
import { getHomeV11Data } from '../../../../home-v11/data';
import { TeamProfileV11 } from '../../../../team-v11/TeamProfileV11';

export const metadata: Metadata = { title: 'Team profile v11 preview', robots: { index: false, follow: false } };
export const revalidate = 3600;

/** Preview of the v11 /team/<slug> profile, with the same data the live page reads. */
export default async function TeamV11Preview({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [cms, home, c, data] = await Promise.all([fetchHomepageData(), getHomeV11Content(), getTeamV11Content(), getHomeV11Data()]);
  const members = Array.from(cms.teamMembers.values());
  const m = members.find((x) => x.slug === slug);
  if (!m) notFound();
  const posts = cms.blogPosts
    .filter((p) => p.author === m.id)
    .sort((a, b) => (b['published-date'] || '').localeCompare(a['published-date'] || ''))
    .map((p) => ({
      href: `/blog/${p.slug}`,
      title: p.name,
      categoryName: p.category ? cms.categories.get(p.category)?.name : undefined,
      thumbnailUrl: p.thumbnail?.url,
      readTime: formatReadTime(p['time-to-read']),
      date: p['published-date'],
    }));
  const view = {
    slug: m.slug,
    name: m.name,
    jobTitle: m['job-title'],
    bio: m['bio-summary'],
    linkedinUrl: m['linkedin-url'],
    twitterUrl: m['twitter-url'],
    skills: m.skills ?? [],
    posts,
    others: members.filter((x) => x.slug !== slug).map((x) => ({ slug: x.slug, name: x.name, jobTitle: x['job-title'] })),
  };
  return <TeamProfileV11 v={view} c={c} home={home} data={data} />;
}
