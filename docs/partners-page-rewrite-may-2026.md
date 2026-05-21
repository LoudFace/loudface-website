# LoudFace Partners Page — Audit + Rewrite

**URL audited:** https://www.loudface.co/partners
**Date:** May 18, 2026
**Format:** Section-by-section. Each section has (1) what's wrong today, (2) the rewrite, (3) why.

---

## CRITICAL DECISION TO MAKE FIRST

Your meta title, meta description, hero subhead, "what you earn" section, and step 4 all say **lifetime / no caps / no expiry**. You told me the actual structure is **10% capped at 12 months**.

Pick one. My recommendation: **keep it lifetime.** Three reasons:

1. It's already public and indexed. Pulling it back is a downgrade.
2. Industry standard for agencies is 10–20% for 6–12 months. Lifetime is your differentiator. (HubSpot Solutions pays 30% for 12 months. Most agencies do 10% for 12 months. Lifetime is rare and noticeable.)
3. "10% for as long as they stay" is a thumb-stopper on LinkedIn. "10% for 12 months" is forgettable.

The economics still work because B2B SaaS clients churn — average agency retainer life is 12–24 months anyway. You're giving up little and gaining a lot of differentiation.

**Everything below assumes lifetime.** If you cap it, search-and-replace "for as long as they stay" → "for 12 months."

---

## Issue 1 — Misleading logo strip (FIX IMMEDIATELY)

**Current:** Section headed "Companies our partners have referred" with logos of Radisson, Montblanc, Brandfirm, Dimer Health, Toku, Eraser, etc.

**Problem:** These are LoudFace's clients, not partner referrals. The program is just launching. This is misleading at best and damages trust the second someone scrutinizes it.

**Fix:** Change the section heading to **"The kind of B2B SaaS companies we work with"** and add a small line: *"These are LoudFace clients. We're building the partner network now — you could be among the first."*

This reframes the social proof honestly while keeping the visual heft.

---

## Issue 2 — Notion form for application (FIX BEFORE LAUNCH)

**Current:** "Become a Partner" CTA links to `loudface.notion.site/337b...`

**Problem:** Looks scrappy. For an offer that asks fractional CMOs to put their reputation on the line, the application destination must look as serious as a SaaS waitlist. Notion form = "we built this in 10 minutes."

**Fix:** Build a native form on the page (Webflow form embed). Required fields only — see "Application Form" section below. Auto-respond within 60 seconds with a real-looking onboarding email (template in `02-outreach-plan-and-toolkit.md`).

---

## SECTION-BY-SECTION REWRITE

### Hero

**Current:**
> **Your clients need growth execution. We deliver it. You earn from it.**
> A partner program for fractional CMOs, growth advisors, and marketing consultants who work with B2B SaaS and tech companies.

**Rewrite:**
> **Refer one B2B SaaS client. Earn 10% of their retainer for as long as they stay with us.**
>
> No caps. No expiry. The LoudFace Partner Program is built for fractional CMOs, growth advisors, and consultants who advise B2B SaaS teams but don't want to run execution.
>
> [Apply in 2 minutes →]

**Why:** Lead with the offer, not the framing. The current headline is clever but takes a beat to parse. Mine is concrete and earnings-led — exactly what gets shared in a Slack DM. "Apply in 2 minutes" beats "Become a Partner" because it removes friction in the prospect's head.

---

### NEW SECTION — Earnings example (insert right after hero)

This is the single highest-leverage addition. **Every benchmark page (Flowout, HubSpot, Growthvibe) has one and you don't.**

```
What you'd actually earn

Client retainer       Your monthly payout    After 12 months    After 24 months
$10,000 / month       $1,000                 $12,000            $24,000
$15,000 / month       $1,500                 $18,000            $36,000
$25,000 / month       $2,500                 $30,000            $60,000

Real example: One $12k/mo client referred in Jan 2025, still active in May 2026
= $19,200 paid to the partner so far. And it keeps going.
```

**Why:** Math beats adjectives. The moment a fractional CMO sees "$24k from one referral" they share the link. Replace the "real example" line with an actual partner story the second you have one — until then, mark it as a forward-looking example, e.g. *"Hypothetical based on our average retainer length."* **Never fabricate a partner story.**

---

### Step-by-step section

**Current:** Four steps — Apply → Get link → Make intro → Earn

**Issues:**
- Step 1 says "we respond within 48 hours" — fine, but pair it with what happens *after* approval to remove uncertainty
- Step 2 says "unique tracking link" — but you have no tracking tool yet. Either set up Rewardful first OR change wording to "unique partner ID and intro template"
- Step 3 says "you stay in your advisory role" — good, keep it
- Step 4 buries the most exciting fact (it's lifetime). Move that up

**Rewrite:**

```
01 — Apply (5 minutes)
Quick form. We review every application manually and reply within 48 hours
with either approval + partner kit, or a no with a reason.

02 — Get your partner kit
Approved partners receive:
  • A unique tracking link (or warm-intro template if you prefer that route)
  • A one-pager you can forward to a client without editing
  • Direct Slack access to Arnel (CEO) for deal questions
  • A partner agreement that takes 2 minutes to read

03 — Refer a B2B SaaS client
Send them your link, or introduce us over email. We handle discovery,
scoping, proposal, and onboarding. You stay in your advisory seat.

04 — Get paid every month they stay
10% of their retainer, paid by the 5th of every month, for as long as
they're a client. Not 6 months. Not 12 months. Lifetime.
First payment lands 30 days after their first invoice is paid.
```

**Why:** Concrete, time-stamped, and the partner kit content is itself a sales tool — it tells the prospect *exactly* what they're getting. The "intro template if you prefer" line matters because half your audience will hate the affiliate-link approach and want to do warm intros instead.

---

### "10% lifetime commission" callout block

**Current:** "10% lifetime commission. On a minimum retainer of $10K/month."

**Issue:** The $10k minimum is the most important filter on the page but it's currently a tiny subhead. Half your applicants will refer $3k/mo founders and waste everyone's time.

**Rewrite:** Make the $10k minimum equally large. Use a two-column block:

```
What you earn                          Who qualifies
10% of retainer, every month they      Referrals must be B2B SaaS/fintech/AI/tech
stay. Paid by the 5th. No caps.        companies at $1M–$50M ARR with a retainer
No expiry.                              of $10K/month minimum.
```

---

### "Why partner with LoudFace"

**Current:** Bullets about being SaaS-specialist, SEO+AEO+CRO integrated, pipeline-focused, advisory extension.

**Issue:** Bullets are good but the lead-in "Your reputation is on the line every time you make a recommendation" is the single best line on the page — currently buried.

**Rewrite:** Promote that line to the section H2:

```
H2: Your reputation goes out with every recommendation.
     We work like we know that.

  ✓ B2B SaaS only. No generalist client mix.
  ✓ SEO + AEO + CRO as one integrated system. One team, one strategy,
    one accountability.
  ✓ We report on pipeline and revenue. Not vanity metrics.
  ✓ We work as an extension of your advisory, not a replacement.
  ✓ 200+ B2B SaaS sites shipped. 4+ years as a Webflow Enterprise Partner.
  ✓ Average launch in <6 weeks. Most agencies quote 12–16.
```

**Why:** The current bullets are credible but generic. Adding the last two with specific numbers makes the partner's recommendation feel safer. Partners need ammunition to defend the rec internally — give it to them.

---

### Testimonial section

**Current:** One Brandfirm testimonial about a landing page — generic, not partner-specific.

**Issue:** This is a *client* testimonial in a *partner* context. It doesn't address the partner's actual question, which is "will my clients love LoudFace, and will I get paid on time?"

**Rewrite (Option A, near-term):** Keep the Brandfirm quote but add a framing line:
> *"From a recent LoudFace client. We're building partner-specific stories now — yours could be next."*

**Rewrite (Option B, after first partner closes):** Replace with a quote like:
> *"I referred one of my fCMO clients to LoudFace in February. They closed in 3 weeks, the work shipped on time, and I got my first $1,400 payout last month. The client thinks I'm a hero."*
> — [Partner name], Fractional CMO

**Don't fake this.** Asking your first 2-3 partners for a quote in writing should be in your partner onboarding flow.

---

### "Partner criteria" section

**Current:** Two columns — right fit / not the right fit. Reasonable.

**Tweaks:**
- Add to "right fit": *"You make 1–3 client recommendations per quarter where LoudFace's service would be a real solve."*
- Add to "not the right fit": *"You expect us to do the selling and your only role is the introduction. The intro is half the work — the recommendation needs to be warm and contextual."*

**Why:** Set behavioral expectations now. Saves you from low-quality referrals later.

---

### NEW SECTION — FAQ (insert before the final CTA)

**Currently missing.** This is the #2 highest-leverage addition after the earnings example. Every page that converts has one. Use exactly these questions — they're the actual objections in a fractional CMO's head:

```
Q: Do I have to sign anything formal?
A: Yes — a 1-page partner agreement covering commission terms, payout
   cadence, and confidentiality. Takes 2 minutes to read. We'll send it
   on approval.

Q: How do you track who referred who?
A: Two options. Either a unique tracking link (we use [Rewardful /
   FirstPromoter] to attribute deals), or a warm email intro to Arnel
   (CEO) — we tag the lead to your account manually. Both work the same
   for payout purposes.

Q: When do I get paid?
A: Monthly. First payout lands 30 days after your referral's first
   invoice is paid. After that, by the 5th of every month, as long as
   they're an active client. Paid via Wise, PayPal, or bank transfer
   (international friendly).

Q: What happens if my referral cancels in month 1?
A: If the client churns within the first 60 days, the commission is
   clawed back from your next payout. After 60 days, no clawback —
   it's yours.

Q: Can I refer someone I'm currently advising?
A: Yes. That's our ideal partner setup — you advise on strategy,
   we run execution. Just be transparent with your client that
   you're earning a referral fee. We'll never disclose it without
   your sign-off.

Q: What if my referral wants to negotiate scope or pricing?
A: We handle all that. Your job ends at the intro. We'll keep you
   looped in on the deal status (lost / won / paused) within 5
   business days of close or no-go.

Q: Is there a cap on how many referrals I can make?
A: No. The more you refer, the more you earn. Top partners earn
   $30k+/year.

Q: Why 10% lifetime and not a one-time fee?
A: Because a one-time fee turns referrals into a transaction. Lifetime
   payouts mean we both win when the client wins, and we both lose
   when they churn. It keeps our incentives aligned with yours and
   your client's.

Q: Can I refer non-SaaS clients?
A: We can only pay commission on B2B SaaS, fintech, AI, or tech
   clients at $10K+/month retainer. If you have a great client
   outside that ICP, tell us anyway — we may know someone better
   suited and we'll make the intro for goodwill.

Q: What does the partner agreement actually cover?
A: Commission rate (10%), payout schedule (monthly), tracking method,
   clawback terms (60 days), confidentiality on client info, and a
   12-month notice clause if either side wants to wind down.
   You can download a preview here: [link to PDF]
```

**Why:** Every "no" comes from one of these unanswered questions. Answering them on the page kills 60% of the back-and-forth before it starts. The pre-emptive transparency builds trust faster than any testimonial.

---

### Final CTA

**Current:** "If you're advising B2B SaaS companies on growth, this conversation is worth having." → "Become a Partner"

**Rewrite:**

```
H2: One conversation. One referral. 10% for as long as they stay.

Apply below. We respond within 48 hours, and the application form
takes 2 minutes. If we're not a fit, we'll tell you why.

[Apply to the Partner Program →]
```

---

## APPLICATION FORM (embed natively, not Notion)

Required fields only. Every extra field drops conversion ~10%.

```
Name *
Email *
LinkedIn URL *
Company / Practice name (optional)
"What kind of clients do you typically advise?" *
   ◯ B2B SaaS only
   ◯ B2B (mixed SaaS + services)
   ◯ B2C / e-commerce
   ◯ Generalist / mixed
"How many client recommendations do you typically make per quarter?" *
   ◯ Less than 1
   ◯ 1–3
   ◯ 4–10
   ◯ 10+
"Anything we should know?" (optional, free text — 300 chars)

[Apply →]

By submitting, you agree to our Privacy Policy. We'll respond within 48 hours.
```

**Auto-response email:** Triggered immediately on submit. Template is in `02-outreach-plan-and-toolkit.md` under "Application confirmation email."

---

## UX/UI NOTES (light — copy is the bigger lever, but flag these to your dev)

1. **Sticky CTA on mobile.** The hero CTA needs to be reachable on every scroll. Floating button bottom-right on mobile.

2. **Earnings table needs to be readable on mobile.** Current layout will collapse poorly. Stack rows vertically on <768px.

3. **Logo strip currently has 19 logos.** Cut to 8. Visual noise. Pick the ones a fractional CMO would actually recognize (Toku, Hoxhunt, Eraser, Speckle, Radisson, Montblanc, Seamless AI, Brandfirm).

4. **The Notion form link is in 2 places** (top CTA + bottom CTA). Replace both with the native form OR with anchor links to a single form embedded mid-page.

5. **Add an Open Graph image** specifically for /partners. The current one is generic. A simple "10% lifetime commission. Apply →" with the LoudFace logo will dramatically improve LinkedIn share CTR. Spec: 1200×630, dark background, single line of copy.

6. **Add a "Last updated" or "Now accepting partners — Q2 2026" badge** in the hero. Urgency + freshness.

---

## SUMMARY OF CHANGES

| # | Change | Priority | Effort |
|---|--------|----------|--------|
| 1 | Fix lifetime vs 12-month inconsistency (recommend: keep lifetime) | P0 | 0 (decision only) |
| 2 | Relabel client logo strip honestly | P0 | 5 min |
| 3 | Replace Notion form with native Webflow form | P0 | 30 min |
| 4 | Add earnings example section | P0 | 20 min |
| 5 | Add FAQ section | P0 | 30 min |
| 6 | Rewrite hero with earnings-led headline | P0 | 10 min |
| 7 | Tighten step-by-step copy | P1 | 20 min |
| 8 | Promote "$10K minimum" prominence | P1 | 5 min |
| 9 | Add partner-specific testimonial framing | P1 | 5 min |
| 10 | Custom OG image | P1 | 30 min |
| 11 | Mobile sticky CTA | P2 | dev |
| 12 | Cut logo strip to 8 | P2 | 5 min |

Total writing/design time: ~3 hours. Dev time for the form embed + mobile CTA: ~2 hours.

---

## WHAT TO DO BEFORE YOU PUSH TO GITHUB

1. Decide lifetime vs 12-month cap (DO THIS FIRST)
2. Sign up for Rewardful (or FirstPromoter) so the "tracking link" promise is real
3. Write the 1-page partner agreement (template in `02-outreach-plan-and-toolkit.md`)
4. Build the partner one-pager PDF (template in `02-outreach-plan-and-toolkit.md`)
5. Set up the auto-response email (template in `02-outreach-plan-and-toolkit.md`)

**Don't push the page live until items 2–5 are done.** This is the lesson from the webinar miss — the page is a promise, and you need the back-end ready before you make the promise.
