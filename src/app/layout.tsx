import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";

/**
 * Root Layout — intentionally minimal.
 *
 * Holds only: <html>, <body>, fonts, structured data, metadata, and
 * a dev-only debug tool.
 *
 * IMPORTANT: globals.css (Tailwind + preflight + design tokens) is NOT
 * imported here. It would otherwise apply to /studio and conflict with
 * Sanity's styled-components (preflight resets buttons, svg, lists, etc.).
 * globals.css is imported only in (site)/layout.tsx and (audit)/layout.tsx,
 * so Sanity Studio renders against a clean slate. The /studio route gets
 * exactly the styling Sanity ships — no Tailwind preflight bleed.
 *
 * All site chrome (Header, Footer, PostHog, GTM, Cal, Leadsy, Webflow badge)
 * also lives in (site)/layout.tsx so that /studio and (audit) bypass them.
 */

/* ─── Fonts via next/font/local ───────────────────────────────────────
   Benefits over manual @font-face:
   - Hashed filenames → Cache-Control: immutable (permanent browser cache)
   - Automatic size-adjust fallback → reduces CLS from font swap
   - Managed preloading → Next.js preloads only what's needed
   ──────────────────────────────────────────────────────────────────── */
const satoshi = localFont({
  src: [
    { path: "../../public/fonts/Satoshi-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/Satoshi-Medium.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/Satoshi-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-satoshi",
  display: "swap",
  preload: true,
});

const neueMontreal = localFont({
  src: [
    { path: "../../public/fonts/NeueMontreal-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/NeueMontreal-Medium.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/NeueMontreal-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-neue-montreal",
  display: "swap",
  preload: true,
});

const geistMono = localFont({
  src: [
    { path: "../../public/fonts/GeistMono-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/GeistMono-Medium.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-geist-mono",
  display: "swap",
  preload: false, // Mono font rarely visible — don't preload
});

export const metadata: Metadata = {
  title: {
    default: "Webflow Development, SEO/AEO & Design Agency | LoudFace",
    template: "%s | LoudFace",
  },
  description:
    "Transform your website into a growth engine. Industry-leading Webflow development, SEO/AEO & design delivering measurable ROI and sustainable business growth.",
  metadataBase: new URL("https://www.loudface.co"),
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.loudface.co",
    siteName: "LoudFace",
    title: "Webflow Development, SEO/AEO & Design Agency | LoudFace",
    description:
      "Transform your website into a growth engine. Industry-leading Webflow development, SEO/AEO & design delivering measurable ROI and sustainable business growth.",
    images: [
      {
        url: "https://www.loudface.co/opengraph-image",
        width: 1200,
        height: 630,
        alt: "LoudFace - B2B SaaS Websites That Convert",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@loudface",
    title: "Webflow Development, SEO/AEO & Design Agency | LoudFace",
    description:
      "Transform your website into a growth engine. Industry-leading Webflow development, SEO/AEO & design delivering measurable ROI and sustainable business growth.",
    images: ["https://www.loudface.co/opengraph-image"],
  },
  icons: {
    icon: [
      { url: "/images/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/images/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/lf-logo.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/images/webclip.png", sizes: "256x256" },
    ],
  },
  manifest: "/site.webmanifest",
  other: {
    "theme-color": "#0a0a0a", // surface-950 — meta tags require literal values
  },
};

// Structured data for WebSite (with SearchAction for sitelinks search box)
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "LoudFace",
  url: "https://www.loudface.co",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://www.loudface.co/blog?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

// Structured data for Organization
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "LoudFace",
  url: "https://www.loudface.co",
  logo: "https://www.loudface.co/images/loudface.svg",
  description:
    "LoudFace is a B2B SaaS web design, SEO, AEO, and growth agency based in Dubai. Webflow Enterprise Partners with 200+ projects delivered.",
  disambiguatingDescription:
    "LoudFace is a Dubai-based B2B SaaS web design and growth agency, not to be confused with other entities sharing a similar name.",
  foundingDate: "2019",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Dubai",
    addressCountry: "AE",
  },
  sameAs: [
    "https://www.instagram.com/loudface.co",
    "https://www.linkedin.com/company/loudface",
    "https://dribbble.com/loudface",
    "https://webflow.com/@loudface",
    "https://clutch.co/profile/loudface",
    "https://www.designrush.com/agency/profile/loudface",
  ],
  knowsAbout: [
    "Webflow Development",
    "Web Design",
    "SEO",
    "Answer Engine Optimization",
    "Conversion Rate Optimization",
    "B2B SaaS Marketing",
    "UX/UI Design",
    "Copywriting",
  ],
  founder: {
    "@type": "Person",
    name: "Arnel Bukva",
    url: "https://www.linkedin.com/in/arnelbukva/",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "LoudFace Services",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Webflow Development" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "SEO & AEO" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "UX/UI Design" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Copywriting" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Conversion Rate Optimization" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Growth Autopilot" } },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${satoshi.variable} ${neueMontreal.variable} ${geistMono.variable}`}>
      <head>
        {/* Preconnect hints for performance */}
        <link rel="preconnect" href="https://cdn.sanity.io" crossOrigin="" />
        <link rel="dns-prefetch" href="https://app.cal.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

        {/* React Grab - dev-only context selector for coding agents */}
        {process.env.NODE_ENV === "development" && (
          <Script
            src="//unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
