import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { CalHandler } from "@/components/CalHandler";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { asset } from "@/lib/assets";
import { fetchHomepageData } from "@/lib/cms-data";
import { PostHogProvider } from "@/components/PostHogProvider";

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
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "LoudFace - Webflow Development Agency",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@loudface",
    title: "Webflow Development, SEO/AEO & Design Agency | LoudFace",
    description:
      "Transform your website into a growth engine. Industry-leading Webflow development, SEO/AEO & design delivering measurable ROI and sustainable business growth.",
    images: ["/images/og-image.jpg"],
  },
  icons: {
    icon: "/images/favicon.png",
    apple: "/images/webclip.png",
  },
  other: {
    "theme-color": "#0a0a0a", // surface-950 — meta tags require literal values
  },
};

// Structured data for WebSite
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "LoudFace",
  url: "https://www.loudface.co/",
};

// Structured data for Organization
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "LoudFace",
  url: "https://www.loudface.co",
  logo: "https://www.loudface.co/images/loudface.svg",
  description:
    "Industry-leading Webflow development, SEO/AEO & design agency delivering measurable ROI and sustainable business growth.",
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
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch CMS data for Footer
  const accessToken = process.env.WEBFLOW_SITE_API_TOKEN || '';
  let caseStudies: Awaited<ReturnType<typeof fetchHomepageData>>['caseStudies'] = [];
  let blogPosts: Awaited<ReturnType<typeof fetchHomepageData>>['blogPosts'] = [];

  try {
    const data = await fetchHomepageData(accessToken);
    caseStudies = data.caseStudies;
    blogPosts = data.blogPosts;
  } catch (error) {
    console.error('Failed to fetch CMS data for footer:', error);
  }

  return (
    <html lang="en">
      <head>
        {/* Preconnect hints for performance */}
        <link rel="preconnect" href="https://images.weserv.nl" crossOrigin="" />
        <link
          rel="preconnect"
          href="https://assets-global.website-files.com"
          crossOrigin=""
        />
        <link
          rel="preconnect"
          href="https://uploads-ssl.webflow.com"
          crossOrigin=""
        />
        <link rel="dns-prefetch" href="https://app.cal.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

        {/* Preload critical fonts — only hero-essential weights.
            Fewer preloads = less bandwidth contention on slow mobile. */}
        <link
          rel="preload"
          href="/fonts/Satoshi-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin=""
        />
        <link
          rel="preload"
          href="/fonts/NeueMontreal-Medium.woff2"
          as="font"
          type="font/woff2"
          crossOrigin=""
        />

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

          {/* Google Tag Manager — GTM-T53LKJXQ */}
          <Script id="gtm-main" strategy="lazyOnload">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-T53LKJXQ');`}
          </Script>

          {/* Google Tag Manager — GTM-PDCXVZX (deferred until user interaction) */}
          <Script id="gtm-deferred" strategy="lazyOnload">
            {`(function(){var loaded=false;function loadGTM(){if(loaded)return;loaded=true;
var w=window,d=document,s='script',l='dataLayer',i='GTM-PDCXVZX';
w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;
j.src='https://www.googletagmanager.com/gtm.js?id='+i;f.parentNode.insertBefore(j,f);}
['scroll','touchstart','mousemove'].forEach(function(e){
window.addEventListener(e,loadGTM,{once:true,passive:true});});})();`}
          </Script>

          {/* Cal.com embed script */}
          <Script id="cal-embed" strategy="lazyOnload">
            {`
              (function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if(typeof namespace === "string"){cal.ns[namespace] = cal.ns[namespace] || api;p(cal.ns[namespace], ar);p(cal, ["initNamespace", namespace]);} else p(cal, ar); return;} p(cal, ar); }; })(window, "https://app.cal.com/embed/embed.js", "init");
              Cal("init", {origin:"https://app.cal.com"});
            `}
          </Script>

          {/* Cal.com booking modal handler */}
          <CalHandler />
        </PostHogProvider>
      </body>
    </html>
  );
}
