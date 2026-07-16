import "../globals.css";
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Script from 'next/script';
import { PostHogProvider } from '@/components/PostHogProvider';
import { CalHandler } from '@/components/CalHandler';
import { countryRequiresConsent } from '@/lib/consent';

/**
 * (audit) Layout
 * The audit tool is a focused, fullscreen workspace. Because this route group
 * sits at app root (sibling to (site)/), site chrome is *not* inherited —
 * no Header/Footer/Webflow-badge/Leadsy. Only the dark body bg is set here.
 *
 * Cal.com IS mounted (unlike the rest of the chrome): the results deck's
 * CTASlide has a "Book a Free Strategy Call" button using the same
 * data-cal-trigger contract as the rest of the site, so the same lazy embed
 * script + CalHandler pairing from (site)/layout.tsx is replicated here.
 * It stays deferred until first interaction, so the fullscreen-workspace
 * performance intent still holds.
 *
 * PostHogProvider IS mounted (unlike the rest of the chrome): without it,
 * posthog-js never initializes on /audit and /audit/[id], so form submits and
 * pageviews on this route group are invisible. It renders no UI and lazy-loads
 * on first interaction, so the fullscreen-workspace performance intent holds.
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
  // banner in this fullscreen workspace: opt-in-region visitors simply go
  // untracked here, which is the safe direction. display:contents keeps the
  // wrapper out of layout.
  const requestHeaders = await headers();
  const country = requestHeaders.get('cf-ipcountry') ?? requestHeaders.get('x-vercel-ip-country');
  const consentRequired = countryRequiresConsent(country);

  return (
    <PostHogProvider>
      <style>{`
        body { background-color: var(--color-surface-950); color: var(--color-surface-300); overflow: hidden; }
      `}</style>
      <div data-lf-cr={consentRequired ? '1' : '0'} style={{ display: 'contents' }}>
        {children}
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
