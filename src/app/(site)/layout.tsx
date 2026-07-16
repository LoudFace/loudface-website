export const revalidate = 60;

import "../globals.css";
import Script from "next/script";
import { draftMode, headers } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { CalHandler } from "@/components/CalHandler";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { Footer } from "@/components/Footer";
import { asset } from "@/lib/assets";
import { fetchFooterData } from "@/lib/cms-data";
import { PostHogProvider } from "@/components/PostHogProvider";
import { ConsentManager } from "@/components/ConsentManager";
import { countryRequiresConsent } from "@/lib/consent";
import { SanityLive } from "@/lib/sanity.live";

/**
 * (site) Layout
 * Holds the public website chrome: Header, Footer, Webflow badge, Cal.com
 * booking, and the consent-managed trackers (PostHog, GTM, RB2B — all gated
 * behind ConsentManager). Anything that belongs to "the marketing site"
 * lives here.
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
  const isDraftMode = (await draftMode()).isEnabled;

  // Cookie-consent region: EEA/UK/CH visitors must opt in before any tracker
  // loads. Cloudflare fronts the site so cf-ipcountry is authoritative;
  // x-vercel-ip-country covers direct-to-Vercel traffic. Missing header
  // (local dev) → opt-in, the safe default. data-lf-cr exposes the verdict
  // to client code (see src/lib/consent.ts).
  const requestHeaders = await headers();
  const country = requestHeaders.get("cf-ipcountry") ?? requestHeaders.get("x-vercel-ip-country");
  const consentRequired = countryRequiresConsent(country);

  // Route-dependent chrome (Header hero-theme, hreflang, shared-Footer
  // suppression) is resolved client-side in SiteChrome via usePathname(),
  // so this layout no longer reads x-pathname. The shared Footer is passed
  // as a server-rendered child to SiteFooter, which hides it on the v3 routes
  // that carry their own FooterV3.
  return (
    <div className="font-sans antialiased overflow-x-clip" data-lf-cr={consentRequired ? "1" : "0"}>
      <PostHogProvider>
        {/* Skip link for keyboard accessibility */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        <SiteHeader />

        <main id="main-content">{children}</main>

        {/* Homepage + About + Pricing + Services + Contact + Case Studies (gallery + detail) + Blog (index + posts) ship their own v3 footers; every other page uses the shared one. */}
        <SiteFooter>
          <Footer caseStudies={caseStudies} blogPosts={blogPosts} />
        </SiteFooter>

        {/* Webflow Enterprise Partner Badge — site-wide.
            lf-yields-to-consent: decorative chrome, so it steps aside entirely
            while the consent bar owns the bottom band (see the bottom-band
            contract in globals.css) and returns once consent is resolved.
            It yields rather than lifting because lifting it by the bar's height
            lands it straight on the hero CTA on short viewports. */}
        <a
          href="https://webflow.com/@loudface"
          target="_blank"
          rel="noopener noreferrer"
          className="lf-yields-to-consent fixed bottom-6 right-6 z-50 transition-opacity hover:opacity-80"
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

        {/* GTM + RB2B live in ConsentManager below — consent-gated AND still
            deferred to first interaction, so the TBT-near-zero behavior the
            old gtm-deferred snippet provided is preserved. */}

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

        {/* Sanity Live — ALWAYS mounted. Establishes the EventSource to the
            Content Lake so subscribed sanityFetch queries auto-refresh when
            content changes in Studio. Also what powers the initial Presentation
            iframe comlink handshake (before draft mode is even toggled on). */}
        <SanityLive />

        {/* Sanity Visual Editing — only mounted when Next.js draft mode is on.
            Renders the click-to-edit overlay + the "Viewing as draft" toolbar.
            Outside draft mode, no overlay JS loads, page is identical to
            published content. */}
        {isDraftMode && <VisualEditing />}

        {/* Consent banner + consent-gated trackers (GTM ×2, RB2B; PostHog
            reacts to the same consent state via posthog-client). EEA/UK/CH
            visitors see the banner and nothing loads until they accept;
            elsewhere trackers load on first interaction with opt-out via
            /cookies. Replaces the old unconditional gtm-deferred and
            rb2b-pixel script tags. */}
        <ConsentManager requiresConsent={consentRequired} />
      </PostHogProvider>
    </div>
  );
}
