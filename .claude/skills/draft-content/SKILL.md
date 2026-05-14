---
name: draft-content
description: Draft a piece of LoudFace content from a Notion calendar entry. Loads strategic context from /seo-brain, applies Arnel's voice from /arnels-assistant, writes the draft into the entry body, and moves status from Idea → Draft. Use this for any content writing — blog posts, listicles, landing pages, case studies. Trigger when the user says "draft X", "write the [calendar entry]", or names a piece from the Website Content database.
---

# /draft-content — Calendar entry → drafted in Arnel's voice

The root of LoudFace's content creation loop. Every published piece on loudface.co flows through this:
**`/seo-brain` (context) → `/arnels-assistant` (voice) → draft into Notion calendar entry.**

## What to do when invoked

The user will name a piece — either by Notion entry ID, by title, or by description (e.g. "the AEO tools listicle"). If unclear, ask them which calendar entry from the Website Content database (`collection://347b6339-4d10-806a-99b3-000b881621e5`).

### Step 1: Load strategic context

Invoke the **`/seo-brain`** skill silently (or inline-fetch the Notion strategy page if you've already pulled it this session). You need to know:
- The six working patterns (year-stamped listicles, AEO playbooks, X vs Y, industry pages, pricing, founder bylines)
- The kill list (don't write what's not working)
- Current calendar position (what's already shipped vs in the pipeline)
- This piece's specific Pattern tag and Content Brief from the database

### Step 2: Load Arnel's voice

Invoke the **`/arnels-assistant`** skill. **This is non-negotiable.** Every piece of content for LoudFace flows through Arnel's voice. The skill loads:
- Tone (tough love, direct, "you" as audience, no fluff)
- Anti-AI-slop rules (banned words, em dash budget, sentence variety)
- Humanizer patterns (have opinions, acknowledge complexity, use "I")
- Pre-delivery checklist

### Step 3: Pull the entry's content brief

Use `notion-fetch` on the specific entry. Read its:
- Title
- Target Keywords
- Content Brief (the prompt for this piece)
- Content Type (Blog Post / Listicle / Landing Page / Case Study)
- Pattern reference if any

### Step 4: Draft following the six patterns

Match the piece to its dominant pattern. Each has structural requirements:

| Pattern | Structural requirements |
|---|---|
| **"Best X for B2B SaaS 2026" listicle** | TL;DR direct-answer paragraph (40-60 words), 15-row comparison table near top with starting prices, ranked list with LoudFace at #1, "best for" + "where they're not the best fit" on each entry, FAQ section (6-8 question-shaped headings), year-stamped throughout |
| **AEO playbook** | Direct-answer paragraph, question-phrased H2s, real first-party data (LoudFace client examples), 40-60 word extractable answer blocks per section, FAQ section |
| **X vs Y comparison** | 60-word AEO answer at top, feature comparison table, side-by-side strengths/weaknesses, when-to-use-which decision logic, real migration evidence if applicable, FAQ section |
| **Industry landing page** | Industry-specific SEO problem framing, vertical-specific case studies, comparison-driven keyword strategy section, BoFu CTA |
| **Pricing-intent** | Tier table at top, what's-included-per-tier, common-objections FAQ, ROI / case-study proof |
| **Founder-byline thought leadership** | First-person ("I"), real LoudFace data, sharp opinion, no hedging, ends with a position (not a "what do you think?") |

Always include:
- **FAQ section** with 5-8 question-shaped H3s — directly extractable by AI engines
- **First-party data** — real LoudFace client outcomes where relevant (CodeOp +49%, Zeiierman +43%, etc.)
- **Year stamp** (2026)
- **Internal links** to relevant LoudFace pages (services, case studies, related posts)
- **Anti-slop pass** via the arnels-assistant checklist

### Step 5: Write the draft into the Notion entry body

Use `notion-update-page` with command `update_content`. The draft becomes the body of the database entry — Arnel reviews there, iterates with `/critique-content`, ships with `/ship-content`.

Format the draft as Notion-flavored markdown (headings, lists, tables, callouts). Don't include the entry title in the body — Notion shows it at the top automatically.

### Step 6: Update status

Update the entry's `Status` property from `Idea` → `Draft` (use `update_properties` command).

### Step 7: Return a tight summary

Under 100 words:
- Title + word count
- Which pattern it followed
- Top 3 SEO/AEO design choices (e.g., "FAQ has 7 question-shaped H3s targeting [keyword]", "60-word TL;DR at top is AEO-extractable")
- Suggested next step: usually `/critique-content` to apply anti-slop check, then `/ship-content` when approved

## Operating rules

- **Never skip `/arnels-assistant`.** Voice is the root. Drafts without it sound generic and don't get cited.
- **Respect the calendar's Content Brief.** Don't drift from what the strategist (Arnel or future team member) wrote when planning the piece.
- **Don't publish.** This command only drafts. Publishing is a separate, deliberate step (`/ship-content`) that requires explicit approval.
- **Word count targets:** Listicles 2,000-3,500. Comparison pages 1,800-2,500. AEO playbooks 1,500-2,500. Landing pages 1,000-1,800. Case studies 1,200-2,000.
- **If the calendar entry doesn't yet have a clear pattern**, ask the user before drafting. Don't guess.

## When to use

- User names a calendar entry to write ("draft the AEO tools listicle")
- User asks to write a new blog post that's not yet in the calendar (in which case create the entry first via the existing Website Content database, then draft)
- Starting any LoudFace site content work

## When NOT to use

- Social posts (LinkedIn, X) — those use `/arnels-assistant` directly without the SEO loop
- Internal docs — use plain writing
- Code comments, technical documentation — use plain writing
- Email copy — use the dedicated email workflows

## The loop this fits into

```
/seo-brain         (load strategy + trends)
     ↓
/draft-content     (THIS — write into Notion entry, status → Draft)
     ↓
/critique-content  (anti-slop + voice check, iterate)
     ↓
/ship-content      (push to Sanity, status → Published, IndexNow auto-fires)
```

Every shipped piece follows this chain. Voice improvements happen by editing `/arnels-assistant` itself, not by special-casing in downstream commands.

## Logging

After the draft is written and status flipped, append one row to the **Activity Log** database (`collection://586eb325-8bfd-417d-8663-73cda77f8234`):
- Action: `Drafted "[piece title]" — [word count] words`
- Skill: `draft-content`
- Target: the Notion calendar entry URL (the database row, not the strategy page)
- Outcome: `Done` if drafted successfully, `In progress` if blocked partway
- Notes: pattern used (Listicle / Comparison / AEO playbook / etc.) + any notable choices
