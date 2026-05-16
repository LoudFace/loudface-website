import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      'embla-carousel',
      'embla-carousel-react',
      'embla-carousel-autoplay',
      'embla-carousel-wheel-gestures',
      'posthog-js',
    ],
  },
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
      // Long-lived cache for static assets served from public/
      // (next/font assets in _next/static/ already get immutable from Vercel)
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, stale-while-revalidate=86400' },
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
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
      // AEO topical-authority cleanup — redirect cannibalizing thin posts
      // into the canonical AEO guide so Google can attribute one URL.
      {
        source: '/blog/aeo-strategies-that-work',
        destination: '/blog/answer-engine-optimization-guide-2026',
        permanent: true,
      },
      {
        source: '/blog/aeo-for-webflow-how-to-make-your-site-discoverable-by-ai-search-engines',
        destination: '/blog/answer-engine-optimization-guide-2026',
        permanent: true,
      },
      // Webflow-agency decision cluster — four overlapping posts splitting
      // authority. Consolidate into /blog/best-webflow-agencies as the general
      // canonical (the /blog/best-b2b-saas-webflow-agencies-2026 sibling
      // remains its own thing for that specific intent).
      {
        source: '/blog/top-webflow-agency',
        destination: '/blog/best-webflow-agencies',
        permanent: true,
      },
      {
        source: '/blog/how-to-choose-the-right-webflow-agency-for-your-brand',
        destination: '/blog/best-webflow-agencies',
        permanent: true,
      },
      {
        source: '/blog/why-choose-loudface-webflow-agency',
        destination: '/about',
        permanent: true,
      },
      // Webflow pricing cluster — duplicate intent. The agency-pricing post is
      // the canonical (with the B2B SaaS variant as its sibling); the older
      // "understanding-webflow-pricing" piece merges into it.
      {
        source: '/blog/understanding-webflow-pricing',
        destination: '/blog/webflow-agency-pricing',
        permanent: true,
      },
      // Cluster D agency-philosophy overlap — these long-URL pieces from the
      // 2026-01 batch cover the same intent as their newer canonical siblings.
      // The dev-costs piece duplicates /blog/webflow-agency-cost-b2b-saas-2026
      // intent; the future-of-AI piece duplicates /blog/webflow-ai-revolution.
      {
        source: '/blog/how-ai-webflow-systems-reduce-development-costs-for-scaling-teams',
        destination: '/blog/webflow-agency-cost-b2b-saas-2026',
        permanent: true,
      },
      {
        source: '/blog/the-future-of-webflow-ai-assisted-design-development-and-optimization',
        destination: '/blog/webflow-ai-revolution',
        permanent: true,
      },
      // Webflow-for-ecommerce duplicate — /blog/is-webflow-good-for-ecommerce-...
      // covered the same intent as /blog/webflow-for-ecommerce but with a
      // much longer URL. Merge the long-URL version into the canonical.
      {
        source: '/blog/is-webflow-good-for-ecommerce-the-honest-2026-review-features-costs-alternatives',
        destination: '/blog/webflow-for-ecommerce',
        permanent: true,
      },
      // Webflow brand overhaul news piece (2024-10) — topical, thin (3K chars),
      // covered by the broader /blog/webflow-ai-revolution canonical now.
      {
        source: '/blog/webflows-new-brand-overhaul-and-platform-updates',
        destination: '/blog/webflow-ai-revolution',
        permanent: true,
      },
      // "Stop Optimizing for Google" / AI-first content architecture — broad
      // AEO framing duplicates the canonical AEO guide. The sub-topical pieces
      // (40-60 word rule, share-of-answer, citation authority) already cover
      // the specifics. Merge into the canonical.
      {
        source: '/blog/ai-first-content-architecture',
        destination: '/blog/answer-engine-optimization-guide-2026',
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
