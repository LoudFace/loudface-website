# /partners Page Rewrite — Brief for Arnel

**Repo:** `LoudFace/loudface-website`
**Branch suggestion:** `chandana/partners-page-rewrite-may-2026`
**Live URL after publish:** https://www.loudface.co/partners
**Spec reference:** `01-partners-page-rewrite.md` (also in this folder — please commit it to `docs/partners-page-rewrite-may-2026.md`)

## What's changing

A full rewrite of `/partners` — copy, structure, application form, social proof, FAQ, OG image. Decisions made *before* writing (these override anything in the spec):

1. **Commission structure stays LIFETIME** (10% for as long as the client stays active). No 12-month cap.
2. **No third-party affiliate tool.** Tracking is UTM links + manual partner emails to `arnel@loudface.co`. Wording updated in the FAQ and "How it works" step 2.
3. **No partner one-pager PDF for v1.** All "one-pager / PDF / partner kit attachment" references removed from copy.
4. **Application destination = Notion DB + Slack DM to Chandana, in parallel.** Replaces the Notion form CTA. See "Form destination + env vars" below.
5. **Form fields are aligned 1:1 with the existing Notion "LoudFace Partner Applications" DB schema** (database_id `c597d4c9-817a-458a-b5b0-92dc4c9db147`). Chandana already runs this DB — we're just adding a second submission entry point.

## Files in this folder

| File | Destination path | Action |
|---|---|---|
| `page.tsx` | `src/app/(site)/partners/page.tsx` | **Replace** |
| `PartnerApplicationForm.tsx` | `src/app/(site)/partners/_components/PartnerApplicationForm.tsx` | **New** |
| `MobileStickyCTA.tsx` | `src/app/(site)/partners/_components/MobileStickyCTA.tsx` | **New** |
| `route.ts` | `src/app/api/partner-apply/route.ts` | **New** |
| `opengraph-image.tsx` | `src/app/(site)/partners/opengraph-image.tsx` | **New** |
| `partners-page.patch` | (unified diff for all 5 above) | `git apply` |
| `01-partners-page-rewrite.md` | `docs/partners-page-rewrite-may-2026.md` | **New** (reference doc) |
| `partners-preview.html` | — | Local-only preview (don't commit) |
| `DESIGNER-BRIEF-og-image.md` | — | Optional handoff for a designer-rendered OG image |

You can either apply the patch (`git apply partners-page.patch` from repo root) or drop the files in by hand.

## Form destination + env vars (the part that needs you)

Form submissions POST to `/api/partner-apply` which fires **two side-effects in parallel**, both fire-and-log (failures never block the user response):

### 1. Notion DB — LoudFace Partner Applications

- **DB URL:** https://www.notion.so/loudface/c597d4c9817a458ab5b092dc4c9db147
- **database_id:** `c597d4c9-817a-458a-b5b0-92dc4c9db147`
- **Field mapping** (form → Notion property):

| Form field | Notion property | Type | Required |
|---|---|---|---|
| Full Name | `Full Name` | title | ★ |
| Email | `Email` | email | ★ |
| LinkedIn Profile URL | `LinkedIn Profile` | url | ★ |
| Website or Portfolio | `Website / Portfolio` | url | — |
| Industry | `Industry` | multi-select (`B2B SaaS` / `B2B Product` / `D2C`) | ★ |
| Avg ACV of Clients | `Avg ACV of Clients` | select (5 buckets) | ★ |
| Open to Social Media Promotion? | `Open to Social Media Promotion?` | select (`Yes` / `No` / `Maybe`) | — |
| Open to Speaking at Webinars? | `Open to Speaking at Webinars?` | select | — |
| (auto) | `Application Status` | select → defaults to `Pending Review` | — |
| (auto) | `Submitted At` | created_time | — |

### 2. Slack — DM to Chandana

A formatted Block Kit message with all fields, header `🤝 New partner application: [Full Name]`, plus LinkedIn link and a Notion attribution footer.

### Env vars to add in Vercel (project settings → Environment Variables)

```bash
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_PARTNER_DB_ID=c597d4c9-817a-458a-b5b0-92dc4c9db147
SLACK_PARTNER_WEBHOOK_URL=https://hooks.slack.com/services/T.../B.../xxxxx
```

**Notion integration setup:**
1. https://www.notion.so/profile/integrations → New internal integration → "LoudFace Site"
2. Copy the secret → set as `NOTION_API_KEY` in Vercel
3. Open the Partner Applications DB in Notion → top-right "•••" → Connections → add the new integration

**Slack DM-to-Chandana setup (one option):**
1. In LoudFace Slack, create a new private channel `#partner-applications-chandana` with just Chandana in it
2. Add an Incoming Webhook app to that channel: https://api.slack.com/messaging/webhooks
3. Copy the webhook URL → set as `SLACK_PARTNER_WEBHOOK_URL` in Vercel

(If we'd rather DM Chandana directly without a private channel, that requires a Slack App with `chat:write` + her user ID. Webhook to private channel is the lower-effort option.)

The `route.ts` is defensive: if either env var is missing, it logs a warning and skips that destination but still returns success to the user. So you can land the PR even before the env vars are set — applications just won't surface anywhere until they are.

## Structural changes vs. the live page

| Section | Before | After |
|---|---|---|
| 1 — Hero | Clever two-line headline + logo strip "Companies our partners have referred" | Earnings-led headline ("Refer one B2B SaaS client…"). Logo strip removed from hero. |
| 2 — Social proof | — | Shared `<Partners>` block reused from homepage (5-star row + testimonial headshots + tagline + client logos). Pulled from CMS — no data duplicated. |
| 3 — Earnings example | — | Responsive table on desktop ($10k/$15k/$25k × 12mo/24mo). Stacks as cards on `<768px`. |
| 4 — How it works | 4 steps | Same 4 steps, rewritten. Step 2 uses **UTM-tagged link (or warm-intro template)** — not Rewardful — and removed the one-pager bullet. |
| 5 — What you earn | Single dark callout | Two-column "What you earn / Who qualifies". $10K/month minimum promoted to its own headline. |
| 6 — Why partner | Generic bullets | "Your reputation goes out with every recommendation. We work like we know that." + 6 bullets. |
| 7 — Testimonials | Single Brandfirm quote | Shared `<TestimonialGrid>` (3 cards from CMS, same source as homepage). |
| 8 — Criteria | Right-fit / not-right-fit | Same structure, +2 bullets. |
| 9 — FAQ | — | Shared `<FAQ>`, 10 partner-specific Qs. Q2 = "Two ways…" Q10 has no "[link to PDF]". `FAQPage` JSON-LD auto-emitted. |
| 10 — Apply | Notion link | **Native form (`PartnerApplicationForm`) → `POST /api/partner-apply` → Notion DB row + Slack DM.** Schema-aligned with the existing Partner Applications DB. |
| 11 — Final CTA | Notion link | Shared `<CTA>` dark variant, anchors to `#apply`. |
| Floating | — | `MobileStickyCTA` (visible `<768px`), anchors to `#apply`. |

## Decisions / things to flag

1. **The old Notion public form view has been retired (Chandana, manual step).** The DB previously had a "Form builder" view at `view://337b6339-4d10-80d5-adc9-000cdb2694f2` that exposed a public Notion-hosted form titled "Apply to the LoudFace Affiliate Program." Chandana needs to delete this view in the Notion UI (right-click the "Form builder" tab in the DB → Delete view) — the Notion API can't delete views programmatically. Once removed, the /partners page form is the single entry point to the DB.

2. **OG image — code vs. design.** Code-rendered via `next/og` (matches root `opengraph-image.tsx` pattern). Says "10% lifetime commission / Refer one B2B SaaS client. Earn for as long as they stay." If we want a designer-rendered PNG instead, swap for `opengraph-image.png` at the same path. `DESIGNER-BRIEF-og-image.md` has the spec.

3. **`scroll-behavior: smooth`** — the in-page `#apply` anchor assumes this is already in `globals.css`. If not, 2-line follow-up.

4. **PostHog event.** Form fires `partner_application_submitted` on success with non-PII properties (`email_domain`, `industries` [array], `acv_bucket`, `has_website`, `open_to_social_promo`, `open_to_webinars`). Same lazy-import pattern as `audit_form_submitted`.

5. **Logo strip filtering** — kept the shared homepage `<Partners>` component as-is. The spec suggested cutting to 8 logos; that's a `partners.json` change touching the homepage too, so left out of this PR.

## Out of scope for this PR (explicit)

- Autoresponder email setup (separate task)
- Interactive earnings calculator (separate page later)
- Founding Partners tier badge
- "Now accepting partners — Q2 2026" badge from the spec
- Cutting the logo strip to 8

## Suggested commit message

```
Rewrite /partners page: native form to Notion + Slack, social proof, FAQ

- Replace Notion link CTA with native form posting to /api/partner-apply
- Form fields aligned 1:1 with existing Notion Partner Applications DB schema
- /api/partner-apply writes a Notion DB row + DMs Slack webhook (both
  fire-and-log; failures don't block user response)
- Add earnings example table (responsive: table on desktop, stacked on mobile)
- Reuse homepage <Partners> social-proof block (5-star + headshots + logos)
- Reuse <TestimonialGrid> for detailed testimonial cards
- Add partner-specific <FAQ> (10 Qs, schema.org FAQPage JSON-LD)
- Rewrite hero, "How it works", "What you earn / Who qualifies", "Why partner"
- Add MobileStickyCTA (<768px) anchored to #apply
- Add partners-specific OG image via next/og
- Capture partner_application_submitted PostHog event on form submit

Requires three new Vercel env vars: NOTION_API_KEY, NOTION_PARTNER_DB_ID,
SLACK_PARTNER_WEBHOOK_URL. Route degrades gracefully if any are missing.
```

## QA checklist after deploy

- [ ] Hero reads "Refer one B2B SaaS client. Earn 10% of their retainer for as long as they stay with us."
- [ ] Shared `<Partners>` block renders 5-star row + headshots + tagline + logos (same as homepage)
- [ ] Earnings table: 3 rows on desktop; stacked cards on `<768px`
- [ ] Step 2 says "unique UTM-tagged link (or a warm-intro template if you prefer that route)" — no Rewardful, no PDF, no one-pager
- [ ] "What you earn / Who qualifies" two-column block; "$10K/month minimum retainer" is its own headline
- [ ] FAQ shows 10 questions. Q2 = "Two ways…" + arnel@loudface.co. Q10 has no PDF link.
- [ ] Form fields: Full Name / Email / LinkedIn (required), Website (optional URL), Industry (multi-checkbox), Avg ACV (5-radio), Social Media Promotion (Yes/No/Maybe optional), Webinar (Yes/No/Maybe optional)
- [ ] Submit a test application (use a throwaway email). Within 5 seconds:
  - [ ] A new row appears in the Notion DB with Application Status = Pending Review
  - [ ] Chandana gets the Slack DM with all fields rendered
- [ ] PostHog Live Events shows `partner_application_submitted` with industries array + acv_bucket
- [ ] `<768px`: floating "Apply →" button bottom-right
- [ ] LinkedIn Post Inspector shows the new OG card on `/partners` (cache may need a flush)
- [ ] No `loudface.notion.site/337b…` link anywhere on the page
