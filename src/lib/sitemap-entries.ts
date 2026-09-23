import type { MetadataRoute } from 'next';
import { fetchSitemapData } from '@/lib/cms-data';
import nextConfig from '../../next.config';
import { TEAM_HIDDEN } from '@/app/about-v3/data';

// The URL list behind /sitemap.xml (src/app/sitemap.xml/route.ts).
//
// History: this was app/sitemap.ts, a metadata route. A metadata route cannot be made
// reliably fresh on Vercel. With `revalidate = 3600` and an hourly tagged CMS cache it
// still omitted posts for hours after they were published (2026-08-25: 83 of 103 posts;
// 2026-09-23: /blog/ai-visibility-audit and /blog/directive-consulting-alternatives
// missing while /llms.txt listed both). The route handler now reads Sanity with no cache
// and serves Cache-Control: no-store, so every request sees every published document.

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

export async function buildSitemapEntries(): Promise<MetadataRoute.Sitemap> {
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
    {
      url: `${baseUrl}/seo-for/hr-tech`,
      lastModified: new Date('2026-09-05'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/seo-for/edtech`,
      lastModified: new Date('2026-09-06'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/seo-for/ai-startups`,
      lastModified: new Date('2026-09-10'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    // Contact (net-new v3 page; previously 301'd to /)
    {
      url: `${baseUrl}/contact`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    // Careers index. ONLY /careers goes in the sitemap — /careers/apply is
    // deliberately noindex and is reached from job postings we place, so it
    // must never be listed here.
    {
      url: `${baseUrl}/careers`,
      changeFrequency: 'monthly',
      priority: 0.5,
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
      url: `${baseUrl}/services/ai-overviews`,
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
      url: `${baseUrl}/methodology`,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
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

  const { caseStudies, blogPosts, seoPages, teamMembers } = await fetchSitemapData();

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
  const seoPageEntries: MetadataRoute.Sitemap = seoPages
    .filter(
      (page) =>
        page.slug !== 'hr-tech' &&
        page.slug !== 'edtech' &&
        page.slug !== 'ai-startups'
    )
    .map((page) => ({
      url: `${baseUrl}/seo-for/${page.slug}`,
      ...lastMod(page._updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

  // Team member / author pages — E-E-A-T signals
  // TEAM_HIDDEN drives both the listing and this sitemap. If they diverge, a
  // hidden member survives here as an indexed page nothing links to.
  const teamMemberPages: MetadataRoute.Sitemap = Array.from(teamMembers.values())
    .filter((member) => member.slug && !TEAM_HIDDEN.has(member.slug))
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

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

/** Same element order and date format Next.js used for the metadata route. */
export function renderSitemapXml(entries: MetadataRoute.Sitemap): string {
  const urls = entries.map((entry) => {
    const lines = [`<loc>${escapeXml(entry.url)}</loc>`];
    if (entry.lastModified) {
      const date = entry.lastModified instanceof Date ? entry.lastModified : new Date(entry.lastModified);
      lines.push(`<lastmod>${date.toISOString()}</lastmod>`);
    }
    if (entry.changeFrequency) lines.push(`<changefreq>${entry.changeFrequency}</changefreq>`);
    if (entry.priority !== undefined) lines.push(`<priority>${entry.priority}</priority>`);
    return `<url>\n${lines.join('\n')}\n</url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}
