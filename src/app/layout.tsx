import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import { CalHandler } from "@/components/CalHandler";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { asset } from "@/lib/assets";
import { fetchFooterData } from "@/lib/cms-data";
import { PostHogProvider } from "@/components/PostHogProvider";

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
    icon: "/lf-logo.svg",
    apple: "/images/webclip.png",
  },
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
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const footerData = await fetchFooterData();
  const caseStudies = footerData.caseStudies;
  const blogPosts = footerData.blogPosts;

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
      <body className="font-sans antialiased overflow-x-hidden">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-T53LKJXQ"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>

        <PostHogProvider>
          {/* Skip link for keyboard accessibility */}
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>

          <Header />

          <main id="main-content">{children}</main>

          <Footer caseStudies={caseStudies} blogPosts={blogPosts} />

          {/* Webflow Enterprise Partner Badge — site-wide */}
          <a
            href="https://webflow.com/@loudface"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 transition-opacity hover:opacity-80"
            aria-label="Webflow Enterprise Partner"
          >
            <img
              loading="lazy"
              src={asset('/images/Enterprise-Blue-Badge.webp')}
              alt="Webflow Enterprise Partner Badge"
              width="660"
              height="85"
              className="w-[11.4rem] h-auto drop-shadow-lg"
            />
          </a>

          {/* Google Tag Manager — both containers deferred until user interaction.
              This keeps TBT near zero — GTM scripts are ~170KB + ~120KB and create
              long tasks that block the main thread if loaded during page lifecycle. */}
          <Script id="gtm-deferred" strategy="lazyOnload">
            {`(function(){var loaded=false;function loadGTM(){if(loaded)return;loaded=true;
var w=window,d=document,s='script',l='dataLayer';
w[l]=w[l]||[];
['GTM-T53LKJXQ','GTM-PDCXVZX'].forEach(function(i){
w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;
j.src='https://www.googletagmanager.com/gtm.js?id='+i;f.parentNode.insertBefore(j,f);
});}
['scroll','touchstart','mousemove','keydown'].forEach(function(e){
window.addEventListener(e,loadGTM,{once:true,passive:true});});})();`}
          </Script>

          {/* Cal.com embed — deferred until user interaction (only needed for booking clicks) */}
          <Script id="cal-embed" strategy="lazyOnload">
            {`(function(){var loaded=false;function loadCal(){if(loaded)return;loaded=true;
(function(C,A,L){let p=function(a,ar){a.q.push(ar);};let d=C.document;C.Cal=C.Cal||function(){let cal=C.Cal;let ar=arguments;if(!cal.loaded){cal.ns={};cal.q=cal.q||[];d.head.appendChild(d.createElement("script")).src=A;cal.loaded=true;}if(ar[0]===L){const api=function(){p(api,arguments);};const namespace=ar[1];api.q=api.q||[];if(typeof namespace==="string"){cal.ns[namespace]=cal.ns[namespace]||api;p(cal.ns[namespace],ar);p(cal,["initNamespace",namespace]);}else p(cal,ar);return;}p(cal,ar);};})(window,"https://app.cal.com/embed/embed.js","init");
Cal("init",{origin:"https://app.cal.com"});}
['scroll','touchstart','mousemove','keydown'].forEach(function(e){
window.addEventListener(e,loadCal,{once:true,passive:true});});})();`}
          </Script>

          {/* Cal.com booking modal handler */}
          <CalHandler />
        </PostHogProvider>
      </body>
    </html>
  );
}
