import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dev/'],
      },
    ],
    sitemap: 'https://www.loudface.co/sitemap.xml',
  };
}
