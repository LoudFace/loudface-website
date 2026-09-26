import "../globals.css";
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Script from 'next/script';
import { PostHogProvider } from '@/components/PostHogProvider';
import { CalHandler } from '@/components/CalHandler';
import { countryRequiresConsent } from '@/lib/consent';
import { SiteHeader } from '@/components/SiteChrome';
import { getNavContent } from '@/lib/content-utils';
import { getNavV11Data } from '../home-v11/nav-data';

/**
 * (audit) Layout
 * The audit tool: the start page (/audit), the progress screen and the report (/audit/<id>), and the demo report.
 * Since the v11 switch (2026-09-26) these are light pages under the v11 site header (the same SiteHeader the (site)
 * layout draws, with the v11 menus), with no site footer: the report closes on its own booking stage. The route
 * group still sits apart from (site), so the audit keeps its own trackers setup: no consent banner and no GTM/RB2B
 * here, as before.
 *
 * Cal.com IS mounted: the header CTA and the report's booking stage use the same data-cal-trigger contract as the
 * rest of the site, so the same lazy embed script + CalHandler pairing from (site)/layout.tsx is replicated here. It
 * stays deferred until first interaction.
 *
 * PostHogProvider IS mounted: without it, posthog-js never initializes on /audit and /audit/[id], so form submits and
 * pageviews on this route group are invisible. It renders no UI and lazy-loads on first interaction.
 *
 * Imports globals.css explicitly because it's no longer in the root layout.
 */

export const metadata: Metadata = {
  title: {
    default: 'AI Visibility Audit | LoudFace',
    template: '%s | LoudFace',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AuditLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Consent region flag (data-lf-cr) — read by posthog-client's consent gate.
  // Without it the gate assumes opt-in and PostHog would stay off for every
  // /audit visitor, including the US ones. There's deliberately no consent
  // banner in the audit tool: opt-in-region visitors simply go untracked
  // here, which is the safe direction. The wrapper carries the same type
  // classes as the (site) layout's, so the header renders the same.
  const requestHeaders = await headers();
  const country = requestHeaders.get('cf-ipcountry') ?? requestHeaders.get('x-vercel-ip-country');
  const consentRequired = countryRequiresConsent(country);

  // The v11 menus, built as in (site)/layout (home-v11/nav-data.ts).
  const [navContent, navV11] = await Promise.all([getNavContent(), getNavV11Data()]);

  return (
    <PostHogProvider>
      <div className="font-sans antialiased overflow-x-clip" data-lf-cr={consentRequired ? '1' : '0'}>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <SiteHeader navContent={navContent} navV11={navV11} />
        <main id="main-content">{children}</main>
      </div>

      {/* Cal.com embed — deferred until user interaction (only needed for booking clicks) */}
      <Script id="cal-embed" strategy="lazyOnload">
        {`(function(){var loaded=false;function loadCal(){if(loaded)return;loaded=true;
(function(C,A,L){let p=function(a,ar){a.q.push(ar);};let d=C.document;C.Cal=C.Cal||function(){let cal=C.Cal;let ar=arguments;if(!cal.loaded){cal.ns={};cal.q=cal.q||[];d.head.appendChild(d.createElement("script")).src=A;cal.loaded=true;}if(ar[0]===L){const api=function(){p(api,arguments);};const namespace=ar[1];api.q=api.q||[];if(typeof namespace==="string"){cal.ns[namespace]=cal.ns[namespace]||api;p(cal.ns[namespace],ar);p(cal,["initNamespace",namespace]);}else p(cal,ar);return;}p(cal,ar);};})(window,"https://app.cal.com/embed/embed.js","init");
Cal("init",{origin:"https://app.cal.com"});}
['scroll','touchstart','mousemove','keydown'].forEach(function(e){
window.addEventListener(e,loadCal,{once:true,passive:true});});})();`}
      </Script>

      {/* Cal.com booking modal handler — listens for [data-cal-trigger] clicks (CTASlide) */}
      <CalHandler />
    </PostHogProvider>
  );
}
