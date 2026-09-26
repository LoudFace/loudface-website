export const revalidate = 60;

import "../globals.css";
import Script from "next/script";
import { cookies, draftMode, headers } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { primeInlineEditing } from "@/lib/inline-edit/server";
import { currentEditor } from "@/lib/inline-edit/session";
import { PAUSED_COOKIE, editorIsUp, resumeHref, showResumeChip } from "@/lib/inline-edit/guard";
import { InlineEditor } from "@/components/inline-editor/InlineEditor";
import { EditChip } from "@/components/inline-editor/EditChip";
import { CalHandler } from "@/components/CalHandler";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { Footer } from "@/components/Footer";
import { fetchFooterData } from "@/lib/cms-data";
import { PostHogProvider } from "@/components/PostHogProvider";
import { ConsentManager } from "@/components/ConsentManager";
import { countryRequiresConsent, POSTHOG_DISTINCT_ID_COOKIE } from "@/lib/consent";
import { SanityLive } from "@/lib/sanity.live";
import { getConsentContent, getNavContent } from "@/lib/content-utils";
import { isV11Route, isV3PreviewRoute } from "@/lib/v11-routes";
import { getNavV11Data } from "../home-v11/nav-data";

/**
 * (site) Layout
 * Holds the public website chrome: Header, Footer, Cal.com
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
  // Cookie-consent region: EEA/UK/CH visitors must opt in before any tracker
  // loads. Cloudflare fronts the site so cf-ipcountry is authoritative;
  // x-vercel-ip-country covers direct-to-Vercel traffic. Missing header
  // (local dev) → opt-in, the safe default. data-lf-cr exposes the verdict
  // to client code (see src/lib/consent.ts). data-lf-did carries the proxy's
  // first-party ID so posthog-js uses the same visitor as server experiments.
  const [requestHeaders, requestCookies] = await Promise.all([headers(), cookies()]);
  const pathname = requestHeaders.get("x-pathname") ?? "/";
  const country = requestHeaders.get("cf-ipcountry") ?? requestHeaders.get("x-vercel-ip-country");
  const consentRequired = countryRequiresConsent(country);
  const postHogDistinctId = requestCookies.get(POSTHOG_DISTINCT_ID_COOKIE)?.value;

  // Every v11 page renders FooterV11 itself, so the shared footer (and its CMS fetch) is only for the old review
  // routes that carry no footer of their own. Same rule as deriveRouteChrome() in SiteChrome.tsx.
  const suppressSharedFooter = isV11Route(pathname) || isV3PreviewRoute(pathname);
  const footerData = suppressSharedFooter ? null : await fetchFooterData();
  const [navContent, consentContent] = await Promise.all([getNavContent(), getConsentContent()]);
  // The v11 menus (every route since the v11 switch, see src/lib/v11-routes.ts): nav.json's v11 block, the homepage's
  // AI-answers tile for the Services card and each industry page's buyer question (home-v11/nav-data.ts).
  const navV11 = await getNavV11Data();
  const isDraftMode = (await draftMode()).isEnabled;
  // Marks this request's content so the editor can find it. One line.
  await primeInlineEditing();

  // Draft Mode's cookie dies with the browser window; the session cookie lasts
  // eight hours. A client coming back after lunch therefore had a valid session
  // and no bar. The session cookie is httpOnly, so only this server can see it:
  // that visitor gets a chip back into editing, and nobody else gets a byte.
  // "View site" leaves this mark and turns Draft Mode off. EditChip offers the
  // way back from the browser in that case, so the server-rendered chip below
  // stands down and the client never sees two chips at once.
  const paused = requestCookies.get(PAUSED_COOKIE)?.value === "1";
  const editor = await currentEditor();
  const resumeChip = showResumeChip(editor, isDraftMode, paused);
  // The editor needs both: Draft Mode on AND a session that is still good.
  // Draft Mode's cookie lasts as long as the browser window, the session eight
  // hours, so an editor who left a tab open overnight came back to a bar whose
  // every button answered "sign in" (2026-09-21: "View site" landed on /edit).
  // Draft Mode alone is also what Sanity's Presentation tool turns on, and that
  // preview must not grow an editing bar it cannot use.
  const editing = editorIsUp(editor, isDraftMode);

  // Route-dependent chrome (Header hero-theme, hreflang, shared-Footer
  // suppression) is resolved client-side in SiteChrome via usePathname(). The
  // request pathname is used here only to skip footer data on routes that carry
  // their own footer.
  const site = (
    <>
      {/* Skip link for keyboard accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <SiteHeader navContent={navContent} navV11={navV11} />

      <main id="main-content">{children}</main>

      {/* Every v11 page ships FooterV11 itself; the shared footer is left for the old review routes only. */}
      <SiteFooter>
        <Footer caseStudies={footerData?.caseStudies} blogPosts={footerData?.blogPosts} />
      </SiteFooter>
    </>
  );

  return (
    <div
      className="font-sans antialiased overflow-x-clip"
      data-lf-cr={consentRequired ? "1" : "0"}
      data-lf-did={postHogDistinctId}
    >
      <PostHogProvider>
        {/* The site itself. In Draft Mode it is handed to the editor shell,
            which frames it in a canvas of its own; that canvas is the element
            that scrolls, so the sticky header sticks under the editor bar
            instead of over it. Outside Draft Mode nothing here changes. */}
        {editing ? <InlineEditor>{site}</InlineEditor> : site}

        {/* The way back after "View site". It renders null on the server and on
            the first client render, then reads the lf-paused cookie in the
            browser — so it costs an anonymous visitor no request, no header and
            not one byte of HTML. */}
        {!editing && <EditChip />}

        {/* Draft Mode is on but nobody is signed in to edit: a session that ran
            out under an open tab, or a Sanity preview. The page is showing
            drafts, so say so, and give the one click that switches it off. */}
        {isDraftMode && !editor && (
          <a
            data-lf-chrome=""
            href={`/api/draft-mode/disable?redirect=${encodeURIComponent(pathname)}`}
            style={{
              position: "fixed",
              left: 16,
              bottom: 16,
              zIndex: 2147482000,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              height: 36,
              padding: "0 14px",
              borderRadius: 999,
              background: "#14212b",
              color: "#fff",
              font: "500 13px/1 Inter, ui-sans-serif, system-ui, -apple-system, sans-serif",
              textDecoration: "none",
              boxShadow: "0 8px 24px rgba(20,33,43,.22)",
            }}
          >
            Preview is on · View the live site
          </a>
        )}

        {/* Only ever rendered for a signed-in editor. An anonymous request has
            no session cookie, so this is nothing at all and the HTML a visitor
            gets is the same as on a site without the editor. */}
        {resumeChip && (
          <a
            data-lf-chrome=""
            href={resumeHref(pathname)}
            style={{
              position: "fixed",
              left: 16,
              bottom: 16,
              zIndex: 2147482000,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              height: 36,
              padding: "0 14px",
              borderRadius: 999,
              background: "#14212b",
              color: "#fff",
              font: "500 13px/1 Inter, ui-sans-serif, system-ui, -apple-system, sans-serif",
              textDecoration: "none",
              boxShadow: "0 8px 24px rgba(20,33,43,.22)",
            }}
          >
            <span
              aria-hidden="true"
              style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", flexShrink: 0 }}
            />
            You are signed in · Resume editing
          </a>
        )}

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
        <ConsentManager requiresConsent={consentRequired} v11Content={consentContent} />
      </PostHogProvider>
    </div>
  );
}
