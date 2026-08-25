import { MetadataRoute } from 'next';
import {
  assertCmsData,
  fetchHomepageData,
  fetchSeoPages,
} from '@/lib/cms-data';
import nextConfig from '../../next.config';

// Without this the sitemap is generated ONCE at build time and then frozen: every post
// published between deploys is absent from it, so Google never learns the URL exists.
// Measured 2026-08-25 — Sanity held 103 published posts, the live sitemap listed 83, and
// /blog/ai-cites-you-wrong-fix-stale-facts (published 24 Aug, HTTP 200, self-canonical) was
// simply missing. /llms.txt carried it correctly, because that route already sets this.
//
// The Sanity webhook does call revalidatePath('/sitemap.xml'), but a metadata route is not a
// page route and that purge does not reliably reach it — so this is the load-bearing control,
// not a backstop. One hour matches llms.txt so the two indexes cannot drift far apart.
export const revalidate = 3600;

/**
 * A sitemap <lastmod> is only useful while it is ACCURATE. Google uses it while
 * it stays consistently accurate and ignores it site-wide once it doesn't —
 * including on the pages where it was honest. A build-time `new Date()` is
 * therefore worse than no date at all: it claims every page changed on every
 * deploy, which trained Google to ignore this sitemap's dates (2026-08-21 audit:
 * 65 of 147 URLs shared one date). Emit a date only when a real per-page
 * modification date exists; omit it otherwise. Omitting beats guessing.
 */
function lastMod(candidate?: string | null): { lastModified?: Date } {
  if (!candidate) return {};
  const date = new Date(candidate);
  if (Number.isNaN(date.getTime())) return {};
  // A page cannot have been modified after today.
  if (date.getTime() > Date.now()) return {};
  return { lastModified: date };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.loudface.co';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/case-studies`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/ai-instructions`,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/seo-for`,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    // Contact (net-new v3 page; previously 301'd to /)
    {
      url: `${baseUrl}/contact`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    // Services hub (net-new v3 page; previously 301'd to /services/webflow)
    {
      url: `${baseUrl}/services`,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    // Service pages
    {
      url: `${baseUrl}/services/seo-aeo`,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services/organic-growth`,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services/geo-agency`,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services/webflow`,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services/cro`,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services/ux-ui-design`,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services/copywriting`,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services/growth-autopilot`,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    // Commercial pages
    {
      url: `${baseUrl}/pricing`,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    // Lead-gen / programmatic
    {
      url: `${baseUrl}/ai-audit`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/partners`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookies`,
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
      ...lastMod(study._updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

  // Blog post pages
  const blogPostPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    // A refresh writes `last-updated`; fall back to first publish, never the build.
    ...lastMod(post['last-updated'] ?? post['published-date']),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // SEO industry pages
  const seoPageEntries: MetadataRoute.Sitemap = seoPages.map((page) => ({
    url: `${baseUrl}/seo-for/${page.slug}`,
    ...lastMod(page._updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Team member / author pages — E-E-A-T signals
  const teamMemberPages: MetadataRoute.Sitemap = Array.from(teamMembers.values())
    .filter((member) => member.slug)
    .map((member) => ({
      url: `${baseUrl}/team/${member.slug}`,
      ...lastMod(member._updatedAt),
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
