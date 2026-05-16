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

### Step 2.5: Brief against Peec (if the piece targets a tracked prompt)

If the calendar entry's Target Keywords or Content Brief references a buyer prompt that Peec tracks (most do — anything tagged Listicle, Comparison, or AEO playbook), invoke **`/peec-research`** with that prompt. It returns:

- The fan-out queries AI engines actually issue when answering this prompt (these are the real keywords to weave into H2s and the direct-answer block — NOT the parent prompt itself)
- LoudFace's current visibility on this prompt (0% = retrieval failure, position 5+ = ranking weakness)
- Top 3 competitors who outrank LoudFace for this prompt + one sample citation showing how each is described
- Recommended optimization angle for this draft

Skip this step only when the piece is brand new, a thought-leadership essay, or a process post that doesn't target a tracked prompt. When in doubt, run it — the cost is one Claude turn and the brief shapes the draft meaningfully.

### Step 3: Pull the entry's content brief + the Pattern's required research

Use `notion-fetch` on the specific entry. Read its:
- Title
- Target Keywords
- Content Brief (the prompt for this piece)
- Content Type (Blog Post / Listicle / Landing Page / Case Study)
- Pattern reference (relation column)

If the entry has a Pattern relation, also fetch that Pattern row from the Patterns Registry (`collection://a6c661c7-aeb4-4fb5-ad0a-7962288366c1`) and read its **Required research** field. This text lists the specific facts that must be gathered before writing — per-entity founder names, methodology distinctions, pricing sources, etc. If the field is non-empty, treat it as mandatory: every listed fact must either be in your research findings (from `/serp-recon` + targeted WebFetches) or explicitly flagged as "couldn't verify — left out."

Skipping required research is the #1 cause of thin drafts that need post-ship expansion.

### Step 3.5: SERP + AI-source recon (mandatory for SEO-targeted pieces)

Invoke **`/serp-recon`** with the target keywords from Step 3 and the Pattern type. The skill spawns a fresh subagent that:
- Pulls the top 10 Google organic positions via DataForSEO (incognito-equivalent — no location bias, no history bias)
- Fetches the top 5-7 ranking pages and extracts their structure (word count, H2 sequence, FAQ presence, schema, named entities)
- Extracts which URLs AI engines cite for related prompts via Peec (ChatGPT, Perplexity, Gemini)
- Cross-references both surfaces to identify "double-winners" (rank in Google AND cited by AI)
- Returns a structured recon brief with median word count, modal section sequence, and specific structural moves

**Consume the recon brief in Step 4** — its median word count overrides the prose-range targets in this skill, its modal H2 sequence informs the new piece's structure, its named-entity list flags competitors to mention, and its AI-cited URLs become candidate outbound citations (reciprocity move).

Skip recon only when: the piece is internal-only, a thought-leadership essay with no commercial intent, or an explicit pivot away from existing competitive structure (rare). When in doubt, run it — the cost is one subagent run; the value is structural data instead of guesswork.

### Step 4: Peer-benchmark sanity check

Before drafting, do a quick GROQ check against Sanity to find the 3-5 most similar published pieces (same Content Type, overlapping target keywords). Note their:
- Median word count
- Category used
- FAQ count
- Internal link count

Use this as a floor for your draft — if peer median is 3,200 words, don't ship 2,000.

### Step 4.5: Load site inventory (mandatory before any internal-linking decision)

Run:

```bash
node scripts/site-inventory.mjs --markdown
```

This outputs a compact markdown digest of every Sanity-published piece + every static Next.js route on loudface.co. Use this output to ground every internal link in the draft. The inventory is always fresh (queried live from Sanity + filesystem at invocation time).

**What the inventory tells you:**

- **Static Next.js routes** — homepage, /audit, /pricing, /partners, /about, /services/*, /seo-for/* (which industries actually have shipped pages)
- **Service categories (live routes)** — /services/seo-aeo, /services/cro, /services/webflow, /services/copywriting, /services/ux-ui-design, /services/growth-autopilot
- **Industries with shipped pages** vs industries in Sanity that don't yet have routes (you can flag the latter as TODOs but don't link them)
- **Case studies** — all 27 of them, with their industries
- **All published blog posts** — for related-post linking

**Hard rule for drafts going forward:**

Every `<a href="/...">` in the draft MUST point to a path that exists in the inventory. If you want to link to a page that doesn't exist (e.g. an industry page that hasn't been built), don't write the link — write the recommendation in your summary as a "create this page next" suggestion instead.

**Common internal-link patterns to look for:**

- Service references → link to the actual `/services/*` route
- Vertical context (fintech, devtools, etc.) → check if `/seo-for/[industry]` exists; only link if it does
- Client / outcome citations → link to the actual `/case-studies/[slug]` page
- Related blog posts → link to actual `/blog/[slug]` URLs from the inventory
- Audit tool mentions → link to `/audit` or `/ai-audit` (both exist)
- Pricing references → link to `/pricing` (it exists)

If a piece is about a topic where a service page exists, link the service page at least once. If a vertical-specific story has a matching `/seo-for/[industry]` route, link it. The inventory tells you exactly what's available; use it.

### Step 5: Draft following the six patterns

Match the piece to its dominant pattern. Each has structural requirements:

| Pattern | Structural requirements |
|---|---|
| **"Best X for B2B SaaS 2026" listicle** | TL;DR direct-answer paragraph (40-60 words), comparison table near top with starting prices/specs, "best for" + "where they're not the best fit" on each entry, FAQ section (6-8 question-shaped headings), year-stamped throughout. **LoudFace placement depends on what's being listed:**<br>• **Agency / partner / service-provider listicles** (e.g. "Best B2B SaaS SEO agencies") → LoudFace ranked #1, with bias disclosed up front<br>• **Tool / platform / framework listicles** (e.g. "Best AEO tools") → LoudFace doesn't appear as an item. Instead, position LoudFace as the tool-fluent practitioner via a dedicated "How we use these tools at LoudFace" section and "How we use it" mini-blocks under each tool. Disclose the agency POV in the intro. |
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

### Step 6: Write the draft into the Notion entry body

Use `notion-update-page` with command `update_content`. The draft becomes the body of the database entry — Arnel reviews there, iterates with `/critique-content`, ships with `/ship-content`.

Format the draft as Notion-flavored markdown (headings, lists, tables, callouts). Don't include the entry title in the body — Notion shows it at the top automatically.

### Step 7: Update status

Update the entry's `Status` property from `Idea` → `Draft` (use `update_properties` command).

### Step 8: Return a tight summary

Under 100 words:
- Title + word count
- Which pattern it followed
- Top 3 SEO/AEO design choices (e.g., "FAQ has 7 question-shaped H3s targeting [keyword]", "60-word TL;DR at top is AEO-extractable")
- Suggested next step: usually `/critique-content` to apply anti-slop check, then `/ship-content` when approved

## Operating rules

- **Never skip `/arnels-assistant`.** Voice is the root. Drafts without it sound generic and don't get cited.
- **Respect the calendar's Content Brief.** Don't drift from what the strategist (Arnel or future team member) wrote when planning the piece.
- **Don't publish.** This command only drafts. Publishing is a separate, deliberate step (`/ship-content`) that requires explicit approval.
- **Word count targets** (use SERP recon's median if available; these are fallbacks): Listicles 2,800-3,500. Comparison pages 2,800-3,400. AEO playbooks 2,500-3,200. Landing pages 1,200-2,000. Case studies 1,500-2,500.
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
/serp-recon        (see what's ranking + what AI engines cite)
     ↓
/draft-content     (THIS — write into Notion entry, status → Draft)
     ↓
/critique-content  (anti-slop + voice check, iterate)
     ↓
/verify-content    (fresh-subagent voice + claim verification)
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
