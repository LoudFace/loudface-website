import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Old Webflow → New Next.js URL mapping
      // Case studies (base + wildcard for any deep links)
      {
        source: '/work',
        destination: '/case-studies',
        permanent: true,
      },
      {
        source: '/work/:slug*',
        destination: '/case-studies/:slug*',
        permanent: true,
      },
      // Policy pages (old Webflow nested structure → flat)
      {
        source: '/policy-pages/terms-of-service',
        destination: '/terms',
        permanent: true,
      },
      {
        source: '/policy-pages/privacy-policy',
        destination: '/privacy',
        permanent: true,
      },
      {
        source: '/policy-pages/cookie-policy',
        destination: '/cookies',
        permanent: true,
      },
      {
        source: '/policy-pages/:slug*',
        destination: '/privacy',
        permanent: true,
      },
      // Renamed/removed pages
      {
        source: '/about-us',
        destination: '/about',
        permanent: true,
      },
      {
        source: '/contact',
        destination: '/',
        permanent: true,
      },
      {
        source: '/services',
        destination: '/services/webflow',
        permanent: true,
      },
      {
        source: '/why-webflow',
        destination: '/services/webflow',
        permanent: true,
      },
      {
        source: '/careers',
        destination: '/about',
        permanent: true,
      },
      // Old Webflow service pages with random suffixes → current service pages
      {
        source: '/services/webflow-development-pnkr2',
        destination: '/services/webflow',
        permanent: true,
      },
      {
        source: '/services/design-pia5o',
        destination: '/services/ux-ui-design',
        permanent: true,
      },
      {
        source: '/services/copywriting-5n9z9',
        destination: '/services/copywriting',
        permanent: true,
      },
      {
        source: '/services/cms-migration-x841v',
        destination: '/services/webflow',
        permanent: true,
      },
      {
        source: '/services/branding-jvbsh',
        destination: '/services/ux-ui-design',
        permanent: true,
      },
      {
        source: '/services/seo-62e9c',
        destination: '/services/seo-aeo',
        permanent: true,
      },
      // Broken blog slugs → closest matching live posts
      {
        source: '/blog/webflow-vs-framer',
        destination: '/blog/webflow-vs-popular-alternatives',
        permanent: true,
      },
      {
        source: '/blog/the-future-of-webflow',
        destination: '/blog/how-to-future-proof-your-webflow-website-for-search-and-ai-agents',
        permanent: true,
      },
      {
        source: '/blog/is-webflow-good-for-small-businesses',
        destination: '/blog/why-saas-companies-are-moving-to-webflow-in-2026-and-what-they-gain',
        permanent: true,
      },
      {
        source: '/blog/seo-vs-aeo-what-actually-changes-for-your-webflow-site-in-2026',
        destination: '/blog/seo-vs-aeo-for-webflow',
        permanent: true,
      },
      {
        source: '/blog/seo-vs-aeo-webflow',
        destination: '/blog/seo-vs-aeo-for-webflow',
        permanent: true,
      },
      // Broken case study slugs → correct case study pages
      {
        source: '/case-studies/toku-icypeas',
        destination: '/case-studies/toku-design-messaging-upgrade',
        permanent: true,
      },
      {
        source: '/case-studies/icypeas',
        destination: '/case-studies/b2b-saas-brand-and-website-redesign-case-study',
        permanent: true,
      },
      {
        source: '/case-studies/toku',
        destination: '/case-studies/toku-design-messaging-upgrade',
        permanent: true,
      },
      // Draft case study linked from blog content
      {
        source: '/case-studies/ciela',
        destination: '/case-studies',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
