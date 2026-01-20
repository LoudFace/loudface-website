import type { APIRoute } from 'astro';
import { COLLECTION_IDS } from '../lib/constants';

const SITE_URL = 'https://www.loudface.co';

export const GET: APIRoute = async ({ locals }) => {
  // Support both Webflow Cloud runtime and local .env
  const accessToken = (locals as any).runtime?.env?.WEBFLOW_SITE_API_TOKEN
    || import.meta.env.WEBFLOW_SITE_API_TOKEN;

  // Static pages
  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'weekly' },
    { url: '/work', priority: '0.9', changefreq: 'weekly' },
    { url: '/blog', priority: '0.9', changefreq: 'weekly' },
  ];

  // Dynamic pages from CMS
  const dynamicPages: { url: string; priority: string; changefreq: string; lastmod?: string }[] = [];

  if (accessToken) {
    try {
      // Fetch case studies
      const caseStudiesResponse = await fetch(
        `https://api.webflow.com/v2/collections/${COLLECTION_IDS['case-studies']}/items`,
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
      );

      if (caseStudiesResponse.ok) {
        const caseStudiesData = await caseStudiesResponse.json();
        caseStudiesData.items?.forEach((item: any) => {
          if (item.fieldData?.slug) {
            dynamicPages.push({
              url: `/work/${item.fieldData.slug}`,
              priority: '0.8',
              changefreq: 'monthly',
              lastmod: item.lastUpdated || item.createdOn,
            });
          }
        });
      }

      // Fetch blog posts
      const blogResponse = await fetch(
        `https://api.webflow.com/v2/collections/${COLLECTION_IDS['blog']}/items`,
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
      );

      if (blogResponse.ok) {
        const blogData = await blogResponse.json();
        blogData.items?.forEach((item: any) => {
          if (item.fieldData?.slug) {
            dynamicPages.push({
              url: `/blog/${item.fieldData.slug}`,
              priority: '0.7',
              changefreq: 'monthly',
              lastmod: item.lastUpdated || item.createdOn,
            });
          }
        });
      }
    } catch (error) {
      console.error('Error fetching CMS data for sitemap:', error);
    }
  }

  const allPages = [...staticPages, ...dynamicPages];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>${page.lastmod ? `
    <lastmod>${new Date(page.lastmod).toISOString().split('T')[0]}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  });
};
