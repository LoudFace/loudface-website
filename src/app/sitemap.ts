import { MetadataRoute } from 'next';
import {
  assertCmsData,
  fetchHomepageData,
  fetchSeoPages,
  getAccessToken,
} from '@/lib/cms-data';

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
      url: `${baseUrl}/seo-for`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    // Service pages
    {
      url: `${baseUrl}/services/seo-aeo`,
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
    // Legal pages
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

  const accessToken = getAccessToken();
  if (!accessToken) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'Sitemap generation requires WEBFLOW_SITE_API_TOKEN in production.'
      );
    }

    return staticPages;
  }

  const [cmsData, seoPages] = await Promise.all([
    fetchHomepageData(accessToken),
    fetchSeoPages(accessToken),
  ]);

  if (process.env.NODE_ENV === 'production') {
    assertCmsData(cmsData);
  }

  const { caseStudies, blogPosts } = cmsData;

  // Case study pages — only include studies with a paragraph summary
  // (matches the gallery filter so we don't create sitemap-only orphan pages)
  const caseStudyPages: MetadataRoute.Sitemap = caseStudies
    .filter((study) => study['paragraph-summary'])
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

  return [...staticPages, ...caseStudyPages, ...blogPostPages, ...seoPageEntries];
}
