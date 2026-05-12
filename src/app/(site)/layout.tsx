import Script from "next/script";
import { CalHandler } from "@/components/CalHandler";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { asset } from "@/lib/assets";
import { fetchFooterData } from "@/lib/cms-data";
import { PostHogProvider } from "@/components/PostHogProvider";

/**
 * (site) Layout
 * Holds the public website chrome: Header, Footer, Webflow badge, PostHog,
 * GTM, Cal.com booking, and the Leadsy visitor tracker. Anything that belongs
 * to "the marketing site" lives here.
 *
 * The route group is *not* part of the URL — `(site)/about/page.tsx`
 * still resolves to `/about`. The reason this layout exists is so that
 * the studio (`/studio/...`) and the audit (`(audit)/audit/...`) routes
 * bypass it cleanly, without inheriting any of the scripts or DOM above.
 */
export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const footerData = await fetchFooterData();
  const caseStudies = footerData.caseStudies;
  const blogPosts = footerData.blogPosts;

  return (
    <>
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

        {/* Leadsy.ai visitor identification pixel — afterInteractive so it
            fires on fast-bouncing sessions (lazyOnload missed them). Tag is
            already async so it won't block rendering. */}
        <Script
          id="vtag-ai-js"
          src="https://r2.leadsy.ai/tag.js"
          strategy="afterInteractive"
          data-pid="svBdk8PfDCJmCF4z"
          data-version="062024"
        />
      </PostHogProvider>
    </>
  );
}
