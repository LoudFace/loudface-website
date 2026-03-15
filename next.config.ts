import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets-global.website-files.com",
      },
      {
        protocol: "https",
        hostname: "images.weserv.nl",
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
    ];
  },
};

export default nextConfig;
