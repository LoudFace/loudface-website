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
      // ─── X-Robots-Tag: noindex on non-page assets ────────────────────
      // Googlebot MUST be able to fetch /_next/static/* to render our
      // pages (JS chunks, CSS, etc.). But every Vercel deploy generates
      // new chunk hashes, and Google was bucketing each one as a
      // separate "Crawled - currently not indexed" entry — 742 of them
      // accumulated between Feb and May 2026, drowning the GSC coverage
      // report. The fix is `X-Robots-Tag: noindex`: Google keeps fetching
      // for rendering, but stops treating these URLs as indexable pages.
      // Standard Next.js best practice; doesn't change SEO at all,
      // cleans up the dashboard.
      //
      // Same pattern applied to: fonts, favicon, manifest, OG image
      // generators — all are crawled-as-part-of-rendering but aren't
      // pages.
      {
        source: '/_next/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex' }],
      },
      {
        source: '/fonts/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          { key: 'X-Robots-Tag', value: 'noindex' },
        ],
      },
      {
        source: '/favicon.ico',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex' }],
      },
      {
        source: '/site.webmanifest',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex' }],
      },
      {
        source: '/opengraph-image',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex' }],
      },
      // Per-page OG image generators (Next.js auto-generates these from
      // src/app/.../opengraph-image.tsx files). Path shape:
      //   /blog/[slug]/opengraph-image-:hash
      //   /case-studies/[slug]/opengraph-image-:hash
      //   /team/[slug]/opengraph-image-:hash
      {
        source: '/blog/:slug/opengraph-image-:hash',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex' }],
      },
      {
        source: '/case-studies/:slug/opengraph-image-:hash',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex' }],
      },
      {
        source: '/team/:slug/opengraph-image-:hash',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex' }],
      },
      // ─── Long-lived cache for static assets served from public/ ──────
      // (next/font assets in _next/static/ already get immutable from Vercel)
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, stale-while-revalidate=86400' },
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
      // AI-bot 404 hygiene (surfaced via Cloudflare AI Crawl Control 2026-05-24).
      // Bots and models occasionally pattern-match `/post/<slug>` (a Webflow-era
      // URL prefix) instead of our current `/blog/<slug>`. Catch-all 301.
      {
        source: '/post/:slug*',
        destination: '/blog/:slug*',
        permanent: true,
      },
      // AI Crawler extrapolated a 2026-year-stamped CMS-for-marketers URL that
      // doesn't exist. Closest topical match is the existing piece (which is
      // already 2026-relevant in content + title).
      {
        source: '/blog/cms-for-marketers-2026',
        destination: '/blog/webflow-best-cms-for-marketers',
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
      // ─── GSC drilldown cleanup (2026-05-17) ──────────────────────────
      // 4 thin Webflow-era posts that Google has been flagging as
      // "Crawled — currently not indexed" for 1-4 months. Last crawls
      // ranged Jan 28 to Apr 11. Each merges into the closest canonical
      // sibling so Google can consolidate authority and stop bucketing
      // them as low-quality.
      {
        // "The Problem With Traditional Webflow Agencies" — opinion
        // piece, low traffic. Merges into the canonical agency listicle.
        source: '/blog/the-problem-with-traditional-webflow-agencies',
        destination: '/blog/best-webflow-agencies',
        permanent: true,
      },
      {
        // "Why Are Startups Switching to Webflow" — generic, 0 impressions.
        // The 2026 SaaS-moving-to-Webflow piece covers the same intent
        // with current evidence.
        source: '/blog/why-are-startups-switching-to-webflow',
        destination: '/blog/why-saas-companies-are-moving-to-webflow-in-2026-and-what-they-gain',
        permanent: true,
      },
      {
        // "How to Future-Proof Your Webflow Website for Search and AI
        // Agents" — duplicates the canonical AEO guide.
        source: '/blog/how-to-future-proof-your-webflow-website-for-search-and-ai-agents',
        destination: '/blog/answer-engine-optimization-guide-2026',
        permanent: true,
      },
      {
        // "Webflow Zapier Integration" — thin integration post.
        // The broader tools+integrations listicle covers this.
        source: '/blog/webflow-zapier-integration',
        destination: '/blog/best-webflow-tools-and-integrations',
        permanent: true,
      },
      {
        // "Webflow Website Design" — generic, last crawled Jan 28.
        // Funnel to the service page rather than redirecting between
        // blog posts.
        source: '/blog/webflow-website-design',
        destination: '/services/webflow',
        permanent: true,
      },
      // ─── AI-crawl 404 hygiene (Peec agent analytics 2026-05-25) ──────────
      // Surfaced via Cloudflare AI agent traffic logs (May 13–25).
      // AI models are pattern-matching these slugs from training data or
      // hallucinating plausible URL structures. All returning 404 to real
      // AI-driven users. 7+ lost visits in 12 days for TradeMomentum alone.
      //
      // TradeMomentum — 7 distinct wrong-slug guesses across 6 bots.
      {
        source: '/case-studies/trademomentum',
        destination: '/case-studies/trademomentum-niche-aeo-organic-growth',
        permanent: true,
      },
      {
        source: '/case-studies/trade-momentum',
        destination: '/case-studies/trademomentum-niche-aeo-organic-growth',
        permanent: true,
      },
      {
        source: '/case-studies/tradeMomentum',
        destination: '/case-studies/trademomentum-niche-aeo-organic-growth',
        permanent: true,
      },
      {
        source: '/case-studies/trademomentum-aeo',
        destination: '/case-studies/trademomentum-niche-aeo-organic-growth',
        permanent: true,
      },
      {
        source: '/case-studies/trademomentum-ai-bootcamp-aeo',
        destination: '/case-studies/trademomentum-niche-aeo-organic-growth',
        permanent: true,
      },
      {
        source: '/case-studies/how-trademomentum-became-the-ais-pick-for-60-day-trading-bootcamps',
        destination: '/case-studies/trademomentum-niche-aeo-organic-growth',
        permanent: true,
      },
      {
        source: '/case-studies/how-trademomentum-became-the-ai-pick-for-60-day-trading-bootcamps',
        destination: '/case-studies/trademomentum-niche-aeo-organic-growth',
        permanent: true,
      },
      // Outbound Specialist — AI guessing longer descriptive slug
      {
        source: '/case-studies/outbound-specialist-high-converting-landing-page',
        destination: '/case-studies/outbound-specialist',
        permanent: true,
      },
      // Arnel team page — AI routing to /about/ prefix instead of /team/
      {
        source: '/about/arnel-bukva',
        destination: '/team/arnel-bukva',
        permanent: true,
      },
      // AEO pricing post — AI citing a slightly different slug variant
      {
        source: '/blog/aeo-agency-pricing-for-b2b-saas-2026',
        destination: '/blog/aeo-agency-pricing-b2b-saas-2026',
        permanent: true,
      },
      // ─── Webflow-era kill list (2026-05-26 structural audit) ─────────
      // Two old Webflow posts from the structural audit. Both fail the
      // KEEP threshold (<100 imps/mo for vs-alternatives, ~108 imps but
      // tiny addressable volume for preview-cms). Consolidate into the
      // canonical destinations that already cover the same intent.
      {
        source: '/blog/webflow-vs-popular-alternatives',
        destination: '/blog/webflow-vendors-compared',
        permanent: true,
      },
      {
        source: '/blog/preview-cms-pages-blog-posts',
        destination: '/blog/understanding-webflows-cms-guide',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
