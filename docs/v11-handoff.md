# v11 — development handoff

The design phase ended on 2026-09-26, and the same day every live route was switched to its v11 component (Arnel:
"Go ahead with development and start building all of these pages on our website"). The switch is built, checked and
deployed as a Vercel preview; it reaches production when Arnel gives the green light after reviewing the preview. Until
then it lives in the working tree only (nothing committed). The Paper file "LoudFace Website · v11"
(`01M3ETYS4QMXF7CYH0VHZWF7J3`) holds the boards the pages were built from.

## Where things are

| What | Where |
|---|---|
| How the site looks, and the gate a page passes | `DESIGN.md` |
| Every part, with file and props | `COMPONENTS.md`; drawn on the Paper page "Design system · v11" (from `/dev-preview/home-v11-kit`) |
| Desktop boards (1440) | Paper page "Desktop · v11": homepage and the nine services on the top row, every other page on the row below |
| Phone boards (390) | Paper page "Phone · v11", one per page type, in the same order |
| Superseded boards, "The look" board, Arnel's comments | The earlier file "LoudFace Website" (`01M2K2HVAENQ1BS0B1917WV73N`); it reached Paper's size limit on 2026-09-26, so nothing more goes into it |
| Copy | `src/data/content/*.json` (one file per page, registered in `src/lib/content-utils.ts`) |
| Mobbin references | `design-lab/harvest/<date>/<topic>/contact-sheets.pdf`; each section names its tile in a code comment |
| Refresh a board after a code change | `node scripts/design/paper-v11-import.mjs <jobs.json> <results.jsonl> 01M3ETYS4QMXF7CYH0VHZWF7J3` with the dev server on port 3005 and Paper open; each job names the route, the board's position and the old board to replace (the script's header shows the shape). Positions: desktop boards 1440 wide, homepage and services at y=0 and every other page at y=13000, 1660 apart on x; phone boards 390 wide at y=0, 470 apart; the kit alone on its page |

## Route map

Every row below was switched on 2026-09-26: its `page.tsx` renders the v11 component, with the route's
`generateMetadata`, JSON-LD, redirects and `revalidate` kept; only the body changed. The previews still exist for Paper
imports (`scripts/design/paper-v11-import.mjs`).

| Live route | Rendered before the switch | v11 component | Preview | Copy and data |
|---|---|---|---|---|
| `/` | `HomeV3Body` | `src/app/home-v11/*` (composed in the preview page) | `/dev-preview/home-v11` | `home-v11.json`, `home-v11/data.ts` (charts) |
| `/services` | `services-v3` | `ServicesHubV11` | `/dev-preview/home-v11-services` | `services.json`, CMS images |
| `/services/<slug>` (9) | `ServicePageV3` | `ServicePageV11` + `service-v11/pages/*` | `/dev-preview/home-v11-service/<slug>` | `services-*.json`, `service-v11` configs |
| `/pricing` | `pricing-v3` | `PricingV11` | `/dev-preview/home-v11-pricing` | `pricing.json`, `pricing-v11.json` |
| `/about` | `about-v3` | `AboutV11` | `/dev-preview/home-v11-about` | `about-v11.json`, CMS team |
| `/case-studies` | `work-v3` | `WorkIndexV11` | `/dev-preview/home-v11-work` | `work-v11.json`, CMS |
| `/case-studies/<slug>` | `case-detail-v3` | `CaseStudyV11` | `/dev-preview/home-v11-case/<slug>` | CMS; charts `case-v11/series.ts` |
| `/blog` | `blog-v3` | `BlogIndexV11` | `/dev-preview/home-v11-blog` | `blog-v11.json`, CMS |
| `/blog/<slug>` | `blog-v3` | `BlogPostV11` | `/dev-preview/home-v11-blog/<slug>` | CMS; `blog-v11/view.ts` keeps the live page's data logic |
| `/methodology` | `methodology-v3` Concept B | `MethodologyV11` | `/dev-preview/home-v11-methodology` | `methodology-v3/data.tsx` (approved, hash-verified copy), `methodology-v11.json` (labels, chart figures) |
| `/contact` | `contact-v3` | `ContactV11` + `NextSteps` | `/dev-preview/home-v11-contact` | `contact.json`, `pricing-v11.json` `steps` |
| `/careers` | `CareersPageV3` | `CareersV11` | `/dev-preview/home-v11-careers` | `careers-v11.json`, openings data |
| `/careers/apply` | live form page | `ApplyV11` (wraps the live `CareersApplicationForm`) | `/dev-preview/home-v11-apply` | `careers-v11.json` `apply` |
| `/seo-for` | hub | `IndustryHubV11` | `/dev-preview/home-v11-industries` | `seo-for-hub.json`, `industry-v11.json` |
| `/seo-for/saas`, `/b2b`, `/<cms slug>` | `SeoForPageV3` | `IndustryPageV11` | `/dev-preview/home-v11-industry/<slug>` | `seo-for-saas.json`, `seo-for-b2b.json`, Sanity `seoPage` |
| `/seo-for/hr-tech`, `/ai-startups`, `/edtech` | bespoke v3 pages | `IndustryArticleV11` | `/dev-preview/home-v11-industry/<slug>` | `seo-for-hr-tech.json`, `seo-for-ai-startups.json`, `seo-for-edtech.json` |
| `/team/<slug>` | `TeamMemberPageV3` | `TeamProfileV11` | `/dev-preview/home-v11-team/<slug>` | `team-v11.json`, CMS |
| `/ai-audit` | live landing | `AuditPageV11` (wraps the live `AuditLandingForm`) | `/dev-preview/home-v11-audit` | `ai-audit.json` |
| `/webinar/ai-search-visibility` | live page | `WebinarV11` (after `hero.startsAt` it points to the recording) | `/dev-preview/home-v11-webinar` | `webinar-ai-search.json` |
| `/partners` | live page | `PartnersV11` | `/dev-preview/home-v11-partners` | `partners-v11.json` (`partners.json` stays for the legacy strip) |
| `/thank-you` | live page | `ThankYouV11` | `/dev-preview/home-v11-thanks` | `thank-you.json` |
| `/privacy`, `/terms`, `/cookies` | `LegalPageV3` (texts already from `legal-v11/*.tsx`) | `LegalPageV11` | `/dev-preview/home-v11-legal/<slug>` | `legal-v11.json`, `legal-v11/*.tsx` |
| `/ai-instructions` | live page | `AiInstructionsV11` | `/dev-preview/home-v11-ai-instructions` | `ai-instructions-v11.json` |
| `/audit` (start) | `(audit)` page | `AuditStartV11` | `/dev-preview/home-v11-audit-flow?screen=start` | `audit-report-v11.json` `start` |
| `/audit/<id>` running | `AuditProgress` | `AuditProgressV11` (view only; polling stays in `AuditProgress`) | `…audit-flow?screen=running\|failed\|slow` | `audit-report-v11.json` `progress` |
| `/audit/<id>` report | `AuditDeck` | `AuditReportV11` | `/dev-preview/home-v11-audit-report` | `audit-report-v11.json`, the audit record |
| 404 and errors | `not-found.tsx`, `error.tsx` | `LostPageV11` (`kind="notFound"\|"error"`) | `/dev-preview/home-v11-lost` | `lost-v11.json` (read directly: `error.tsx` is a client component) |
| Share images | `opengraph-image.tsx`, `partners/opengraph-image.tsx` | `og-v11/share.tsx` (`homeShare`, `partnersShare`) | — | renders in Node; fails under `next dev` on Arnel's Mac (both old and new) |

`/a/<token>` and `/p/<token>` belong to the proposal system and are out of scope.

## Site chrome (switched)

- **Menus and phone menu:** `Header` draws `NavV11` when it gets `v11` data; `SiteChrome` passes it wherever
  `isV11Route()` (`src/lib/v11-routes.ts`) is true: every public route except the old review routes (`/preview/hero`
  and the pre-v11 `/dev-preview` pages). Copy: `nav.json` (the live dropdown items plus the `v11` block with the
  groups and industries); each industry's buyer question comes from its page's own content through
  `getNavV11Data()` (`home-v11/nav-data.ts`), which every layout and preview uses. Icons: the Isocons isometric set
  in `public/images/home-v11/menu-icons/iso` (CC BY 4.0; the credit line sits in the footer's small print, copy in
  `home-v11.json` `footer.iconCredit`).
- **Cookie notice:** `ConsentManager` renders `ConsentCardV11` on the same routes; behaviour is unchanged. Copy:
  `consent.json`.
- **Footer:** every v11 page renders `FooterV11` itself; `SiteChrome` and `(site)/layout.tsx` suppress the shared footer
  on the same routes (one rule, `isV11Route()` or `isV3PreviewRoute()`).
- **Header over the hero:** light heroes set `data-hero="light"`; the header keeps ink text until it scrolls.
- **Audit tool:** the `(audit)` layout draws the same site header on a light page (no footer, no consent banner, as
  before).
- **Errors:** an unmatched URL gets the root 404 (`src/app/not-found.tsx`, `LostPageV11`), served as full HTML with
  its links to `sitemap.xml` and `llms.txt`, without the site header. A catch-all route that put it inside the site
  layout was removed before launch (2026-09-26 review): the server then sent an empty shell and drew the page only
  in the browser, so a crawler saw 5 words instead of 45. A `notFound()` inside a site route (a deleted post) is still
  drawn in the browser, as on the v3 site. `(site)/error.tsx`, `error.tsx` and `global-error.tsx` render `LostPageV11`.

Follow-up (not needed for launch): delete the legacy branches in `Header` and `ConsentManager` and the v3 dropdown
styles once the old review routes are gone.

## Go-live (status 2026-09-26)

1. [x] Every row above points at its v11 component; metadata, JSON-LD, redirects, revalidate and generateStaticParams
   kept. A before/after snapshot of all 186 sitemap routes showed no structured-data type lost or gained.
2. [x] `npm run build`, `npm run typecheck`, `npm run test:editor` (591/591), `npm run check:editor` (0 FAIL), and
   `scripts/inline-edit-coverage.mjs` over one route of every template (no marker stripped by v11 code; the values it
   cannot reach are v3-only files, states a page is not in, metadata-only keys and unused keys).
3. [x] Vercel preview deployed from exactly the launch files (behind Vercel login): all 185 sitemap routes 200, unknown
   URLs 404, zero editor markers in anonymous HTML. The Launch Gate (qa-loop, seo-aeo-geo-audit, the deterministic
   checker, a fresh-agent review) ran against it; every P0/P1 candidate was reproduced or refuted (receipt:
   `.claude/launch-receipts/2026-09-26-v11-relaunch.md`). Lighthouse, phone profile, preview against the live site on
   the same day: home 84 / 82, CRO 84 / 83, case study 98 / 97, About 98 / 81, blog post 95 / 75.
4. [ ] Arnel reviews the preview and gives the green light; then commit the launch files by name and push `main`
   (Vercel deploys production). Pull first: the inline editor may have committed copy edits to `main` meanwhile.
5. [ ] After launch: check www.loudface.co serves the new deployment (poll two or three times: the first request after
   a deploy can return the old HTML); resubmit the sitemap in Search Console and read its `lastDownloaded`; stop the
   PostHog experiment `homepage-hero-argument` (the v11 homepage has one hero); delete the `*-v3` folders and the
   `dev-preview` routes that no longer have a job.

## Decided during the switch (Arnel: "I rely on you to make the right decision")

- Team titles: Tamara, Andrea and Abhay are "Lead SEO, AEO & GEO Specialist" everywhere, per the 25 Sep rule: the
  homepage team cards (with the About page's approved lines), and the profile pages' metadata and Person schema
  (`src/lib/team-titles.ts`; the CMS job titles are unchanged).
- Unsourced figures removed: SaaS "3x" and "40%", B2B "3x", hub "147% avg. organic traffic lift". The hub's "6 industry
  programs" now reads 11 (the pages that exist).
- Audit report: "all 4 phases" now "all three phases"; the summary says "named in 88% of AI answers" (it is a share of
  answers, not of platforms); the generated action plan no longer sells schema markup as an AI lever (the methodology
  page says it is not one).
- Footer: Methodology and Cookie Policy links restored (the v3 footer carried them on every page).
- The blog index links only live posts (19 folded posts 301 elsewhere); a page past the last one is a 404.
- Speed (the switched homepage first weighed 6.7 MB against the live 0.7 MB): photos re-encoded and served at the
  width they show; avatars and logos resized; images below the first screen and inside the menus load lazily; the
  handwriting font is no longer preloaded; the inline booker mounts near the closing section.
- CMS images go through Vercel's image cache (`cachedCmsImage` in `src/lib/image-utils.ts`), as on the v3 site. The v11
  components had drawn them straight from cdn.sanity.io, the pattern that exceeded Sanity's bandwidth quota in July.
  The homepage chart read is cached with the case study tag like every other CMS read.
- Blog FAQ answers render their links again (106 answers carry HTML); the v3 anchors `#book` and `#tracks` work again;
  the speakable summaries are marked again; the 404 for an unknown URL is full HTML again (the catch-all route that put
  it inside the site layout sent crawlers an empty shell); "try again" on the error pages refetches (`retry`).
- Editing mode: engine icons, lane tags, speaker photos and the audit status colour no longer break while an editor is
  signed in, and attribute text no longer carries editor marks.
- Menus (Arnel's pick, not mine): he picked menu A with the Isocons isometric icons on 2026-09-27 (Paper file "LoudFace
  Website · v11", page "Menus · pick one"; boards drawn by `/dev-preview/menu-concepts` and `/dev-preview/menu-icons`).
  The live menus and the phone menu carry it; the Phosphor app-tile set lost and was deleted.

## Still open (copy and facts, not blocking)

- Contact email: /contact and the pricing FAQ show arnel@loudface.co (as on the approved boards); the footer, the
  ContactPage schema and the v3 contact page use hello@loudface.co.
- The three testimonial videos (2 to 12 MB) stream from Sanity when a visitor presses play. Moving them to Vercel
  would take them off Sanity's bandwidth meter.
- Inline editor gaps carried over from v3: a headline written as plain text beside its highlighted part cannot be
  edited (about 45 headings; the highlight can); the service pages' copy, the case study labels and a few audit report
  sentences live in code. `check:editor` does not detect either.
- Methodology on a phone has no stage rail (the page reads straight down).
- Article-body images in the CMS load straight from Sanity at full size, as on the live site.
- Toku: 86% (webinar, fintech CMS doc) or 97.8% (case study, AI instructions); both were true at their dates.
- "200+ brands" in the fintech Sanity doc, against the "50+ teams" rule (a CMS edit; not made without Arnel).
- AI instructions facts: "200+ sites", "founded 2019", "Dubai headquarters" appear three times (consistent with About).
- Cookie policy company name: "LOUDFACE - FZCO" or "LoudFace LLC" (legal copy; unchanged).
- Audit report: one measure goes by four names (Discovery visibility, Category discovery, General solution discovery,
  Category visibility).
- Audit landing: the "Run the AI visibility audit to see" list repeats the hero's "What you get" list (both live).
- Menus: the service names and one-liners are the live dropdown's (`nav.json`); they differ from the footer's five
  service names, and several one-liners read alike.
- CMS content (content-engine): three dead external links in blog bodies (position.digital, two ahrefs.com posts), no
  meta description on `/blog/best-geo-agencies-b2b-saas-2026`, `/blog/google-ai-overviews-optimization` and
  `/services/ai-overviews` share one title.
