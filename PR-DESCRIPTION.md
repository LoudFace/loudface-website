<!--
Paste everything below the line into the PR description field on GitHub.
Title: Rewrite /partners page: native form to Notion + Slack, social proof, FAQ
Mark as Draft.
-->

---

## Summary

Full rewrite of `/partners`. Replaces the Notion application link with a native form that writes to the existing Notion "LoudFace Partner Applications" DB and DMs Chandana on Slack. Adds an earnings table, FAQ, partners-specific OG image, and swaps the misleading "Companies our partners have referred" logo strip for the shared homepage social-proof block.

**Three decisions baked in:**
- Commission stays LIFETIME (10% for as long as the client stays). No 12-month cap.
- No third-party affiliate tool. Tracking is UTM links + manual emails to `arnel@loudface.co`.
- No partner one-pager PDF for v1. All PDF references removed from copy.

Spec lives at `docs/partners-page-rewrite-may-2026.md` (added in this PR for reference).

## Files changed

| Status | Path |
|---|---|
| Modified | `src/app/(site)/partners/page.tsx` |
| New | `src/app/(site)/partners/_components/PartnerApplicationForm.tsx` |
| New | `src/app/(site)/partners/_components/MobileStickyCTA.tsx` |
| New | `src/app/(site)/partners/opengraph-image.tsx` |
| New | `src/app/api/partner-apply/route.ts` |
| New | `docs/partners-page-rewrite-may-2026.md` |

## ⚠️ Needed before / right after merge — env vars

The new `/api/partner-apply` route reads three env vars. The route is **defensive**: if any are missing it logs a warning and skips that destination but still returns success. So this PR can land before the vars are set — submissions just won't surface anywhere until they are.

```bash
NOTION_API_KEY=secret_…           # Notion internal integration secret
NOTION_PARTNER_DB_ID=c597d4c9-817a-458a-b5b0-92dc4c9db147
SLACK_PARTNER_WEBHOOK_URL=https://hooks.slack.com/services/…
```

**Notion setup:**
1. Create an internal integration at https://www.notion.so/profile/integrations
2. Add it as a Connection on the [Partner Applications DB](https://www.notion.so/loudface/c597d4c9817a458ab5b092dc4c9db147)
3. Drop the secret into Vercel env

**Slack setup:** Easiest path is an Incoming Webhook to a private channel only Chandana is in. ~5 min.

## Form field → Notion property mapping

The form fields are aligned 1:1 with the existing Notion DB schema. If you change one, the corresponding Notion property must change too.

| Form field | Notion property | Type | Required |
|---|---|---|---|
| Full Name | `Full Name` | title | ★ |
| Email | `Email` | email | ★ |
| LinkedIn Profile URL | `LinkedIn Profile` | url | ★ |
| Website or Portfolio | `Website / Portfolio` | url | — |
| Industry | `Industry` | multi-select (`B2B SaaS` / `B2B Product` / `D2C`) | ★ |
| Avg ACV of Clients | `Avg ACV of Clients` | select (5 buckets, `$100-$1K` through `$50K+`) | ★ |
| Social Media Promotion? | `Open to Social Media Promotion?` | select (`Yes` / `No` / `Maybe`) | — |
| Speaking at Webinars? | `Open to Speaking at Webinars?` | select | — |
| (auto) | `Application Status` | default `Pending Review` | — |
| (auto) | `Submitted At` | created_time | — |

## Section-by-section diff vs. live page

| Section | Before | After |
|---|---|---|
| 1 — Hero | Two-line headline + misleading logo strip | Earnings-led headline ("Refer one B2B SaaS client…"). Logo strip removed from hero. |
| 2 — Social proof | — | Shared `<Partners>` block reused from homepage. |
| 3 — Earnings example | — | Responsive table on desktop; stacks on `<768px`. |
| 4 — How it works | 4 steps | Same 4 steps, rewritten copy (UTM, no Rewardful, no PDF). |
| 5 — What you earn | Single callout | Two-column "What you earn / Who qualifies". $10K minimum promoted. |
| 6 — Why partner | Generic bullets | "Your reputation goes out with every recommendation." + 6 concrete bullets. |
| 7 — Testimonials | Single Brandfirm quote | Shared `<TestimonialGrid>` (3 cards from CMS). |
| 8 — Criteria | Right-fit / not-right-fit | +2 bullets each. |
| 9 — FAQ | — | Shared `<FAQ>`, 10 partner-specific Qs with `FAQPage` JSON-LD. |
| 10 — Apply | Notion link | **Native form → `POST /api/partner-apply` → Notion DB row + Slack DM**. |
| 11 — Final CTA | Notion link | Shared `<CTA>` dark variant, anchors to `#apply`. |
| Floating | — | `MobileStickyCTA` (`<768px`). |

## Decisions for the reviewer (Arnel)

1. **`scroll-behavior: smooth`** — the `#apply` anchor assumes this is in `globals.css`.

2. **OG image** — code-rendered via `next/og`. If we want a designer PNG, swap `opengraph-image.tsx` for `opengraph-image.png`.

3. **Old Notion public form view is being retired** by Chandana (manual Notion-side step, can't be done via API). After deletion, /partners page form is the single entry point to the Partner Applications DB.

## PostHog instrumentation

Form fires `partner_application_submitted` on success with: `email_domain`, `industries` (array), `acv_bucket`, `has_website`, `open_to_social_promo`, `open_to_webinars`. Same lazy-import pattern as `audit_form_submitted`. After merge, I'll set up the funnel insight in PostHog project 237873.

## Out of scope (explicit)

- Autoresponder email
- Interactive earnings calculator (separate page later)
- Founding Partners tier badge
- "Now accepting partners — Q2 2026" badge from the spec
- Cutting the logo strip to 8

## QA after deploy

- [ ] Hero reads "Refer one B2B SaaS client. Earn 10% of their retainer for as long as they stay with us."
- [ ] Shared `<Partners>` block renders correctly between hero and earnings table
- [ ] Earnings table: table on desktop, stacked cards on `<768px`
- [ ] Step 2: "unique UTM-tagged link (or warm-intro template)" — no Rewardful, no PDF
- [ ] "What you earn / Who qualifies": "$10K/month minimum" is its own headline
- [ ] FAQ Q2: "Two ways…" + `arnel@loudface.co`; Q10: no PDF link
- [ ] Form fields match the Notion DB schema (see mapping table above)
- [ ] Submit test application with a throwaway email →
   - [ ] New row in Notion DB with Application Status = Pending Review
   - [ ] Slack DM lands with all fields formatted
- [ ] PostHog Live Events shows `partner_application_submitted`
- [ ] Mobile sticky "Apply →" button visible `<768px`
- [ ] LinkedIn Post Inspector shows the new OG card after cache flush
- [ ] No `loudface.notion.site/337b…` link anywhere

🤖 Generated with [Claude Code](https://claude.com/claude-code)
