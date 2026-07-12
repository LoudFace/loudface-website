import { MetadataRoute } from 'next';
import {
  assertCmsData,
  fetchHomepageData,
  fetchSeoPages,
} from '@/lib/cms-data';
import nextConfig from '../../next.config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.loudface.co';
  const lastModified = new Date();
  // Use current build time for static pages — avoids stale hardcoded dates
  const staticLastModified = lastModified;

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/case-studies`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: staticLastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/ai-instructions`,
      lastModified: staticLastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/seo-for`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    // Services hub (net-new v3 page; previously 301'd to /services/webflow)
    {
      url: `${baseUrl}/services`,
      lastModified: staticLastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    // Service pages
    {
      url: `${baseUrl}/services/seo-aeo`,
      lastModified: staticLastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services/geo-agency`,
      lastModified: staticLastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services/webflow`,
      lastModified: staticLastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services/cro`,
      lastModified: staticLastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services/ux-ui-design`,
      lastModified: staticLastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services/copywriting`,
      lastModified: staticLastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services/growth-autopilot`,
      lastModified: staticLastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    // Commercial pages
    {
      url: `${baseUrl}/pricing`,
      lastModified: staticLastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    // Lead-gen / programmatic
    {
      url: `${baseUrl}/ai-audit`,
      lastModified: staticLastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/partners`,
      lastModified: staticLastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: staticLastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: staticLastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: staticLastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  const [cmsData, seoPages] = await Promise.all([
    fetchHomepageData(),
    fetchSeoPages(),
  ]);

  if (process.env.NODE_ENV === 'production') {
    assertCmsData(cmsData);
  }

  const { caseStudies, blogPosts, teamMembers } = cmsData;

  // Case study pages — include all case studies that have a slug
  // (even if they lack a paragraph-summary, they're still indexable pages)
  const caseStudyPages: MetadataRoute.Sitemap = caseStudies
    .filter((study) => study.slug)
    .map((study) => ({
      url: `${baseUrl}/case-studies/${study.slug}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

  // Blog post pages
  const blogPostPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post['published-date'] ? new Date(post['published-date']) : lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // SEO industry pages
  const seoPageEntries: MetadataRoute.Sitemap = seoPages.map((page) => ({
    url: `${baseUrl}/seo-for/${page.slug}`,
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Team member / author pages — E-E-A-T signals
  const teamMemberPages: MetadataRoute.Sitemap = Array.from(teamMembers.values())
    .filter((member) => member.slug)
    .map((member) => ({
      url: `${baseUrl}/team/${member.slug}`,
      lastModified: staticLastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }));

  const allPages = [...staticPages, ...caseStudyPages, ...blogPostPages, ...seoPageEntries, ...teamMemberPages];

  // Folded/301'd URLs must never surface in the sitemap even while their
  // Sanity doc is still published — next.config.ts redirects is the single
  // source of truth for "this URL no longer canonically exists" (incident:
  // best-generative-engine-optimization-agencies-2026 stayed published after
  // its fold and lingered in the sitemap, 2026-07-12).
  const redirectRules = (await nextConfig.redirects?.()) ?? [];
  const redirectedPaths = new Set(redirectRules.map((rule) => rule.source));

  return allPages.filter((page) => !redirectedPaths.has(page.url.replace(baseUrl, '')));
}
