---
name: critique-content
description: Run an anti-AI-slop + voice pass on a draft. Loads /arnels-assistant rules and returns specific line-level edits (with rationale) plus an optional revised version. Use after /draft-content or on any existing draft before shipping. Trigger when the user says "critique the draft", "anti-slop pass on X", "edit pass", "make this sharper", or invokes /critique-content on a Notion entry.
---

# /critique-content — Anti-slop + voice pass

The editing checkpoint in the LoudFace content loop. Catches:
- AI-slop tells (banned words, em dash overuse, rule-of-three loops, throat-clearing intros)
- Voice violations (hedging, missing opinions, generic-sounding paragraphs)
- Structural issues (missing FAQ, no direct-answer block, weak headers)
- Strategic drift (forgetting the year stamp, missing first-party data, off-pattern)

## What to do when invoked

The user will name a draft. Sources:
- Notion calendar entry (most common after `/draft-content`)
- A Sanity blogPost document
- Pasted text in the conversation
- A URL to an existing live page

### Step 1: Load arnels-assistant rules

Invoke **`/arnels-assistant`** to load:
- Tone + anti-slop rules
- Banned-word list
- Pre-delivery checklist (read it aloud, scan banned words, count em dashes, break rule-of-three patterns, etc.)
- Humanizer patterns

This is the source of truth for voice. **Never invent voice rules in this command — only reference what `/arnels-assistant` defines.**

### Step 2: Fetch the draft

- Notion entry: `notion-fetch` with the entry ID, read the body content
- Sanity doc: query the `content` field (HTML body)
- Pasted text: use what the user provided
- URL: fetch via WebFetch or curl

### Step 2.5: Run the mechanical anti-slop linter (REQUIRED — do not skip)

The qualitative critique is unreliable on its own (the model can drift on em-dash counts, miss a "Not X, Y" construction, rationalize a banned word). A deterministic linter at `scripts/lint-anti-slop.mjs` counts every rule mechanically:

```bash
# Save the draft body to a tmp file, then:
node scripts/lint-anti-slop.mjs /tmp/draft.html
# or via stdin:
echo "$DRAFT_BODY" | node scripts/lint-anti-slop.mjs
```

The linter outputs a markdown report with severity-tagged findings (🚨 blocker / ⚠️ should-fix / 💡 suggestion) and exits non-zero when blockers are present. Always run it BEFORE the qualitative passes — the numbers anchor the rest of the critique.

**How to use the linter output:**

- **Every `🚨 blocker` becomes a blocker in the critique output.** Quote the rule (e.g. "em-dash budget: 12 vs 4") and the offending samples.
- **Every `⚠️ should-fix`** rolls into the should-fix section of the critique.
- **Every `💡 suggestion`** is a "consider" line at the bottom.
- The qualitative passes (Steps 3 below) layer on TOP of the linter output — they catch voice / strategic issues the regex linter can't. They don't replace it.

When the linter exits 0 with no findings, the piece is mechanically clean. The qualitative passes still run, but the bar for "blocker" jumps higher (only structural / voice failures count).

### Step 3: Run the critique passes

Five passes, in order. Each generates findings — quote the offending text, explain why, propose the fix.

**Pass 1 — Banned vocabulary scan**
Search for: "delve", "leverage", "pivotal", "transformative", "in today's fast-paced", "navigate the landscape", "harness", "robust", "seamlessly", "cutting-edge", "game-changer", "synergy", "best-in-class", "world-class", "unparalleled", "robust" used as filler, "moreover", "furthermore", "additionally" as paragraph openers. Flag each, propose specific replacements.

**Pass 2 — Structural slop**
- Count em dashes. Over 1 per 300 words = flag with specific cuts.
- Rule-of-three patterns ("X, Y, and Z" repeated 3+ times in close proximity).
- Throat-clearing intros ("In this post, we'll explore...", "Let's dive in...", "It's important to note...").
- "In conclusion" or restatement endings.
- "Not X, it's Y" constructions — max 1 per piece.
- Signposting ("Here's the key takeaway", "The most important thing is").

**Pass 3 — Voice violations**
- Hedging language ("might", "could potentially", "in some cases") where a sharp position would land harder.
- Missing first-person where it fits ("I genuinely don't know" > "It's unclear").
- Neutral analysis where there should be an opinion.
- Generic phrasing that could've been written by an AI that's never worked at LoudFace.

**Pass 4 — Strategic drift**
- Missing year stamp (2026) where the piece is supposed to be year-stamped.
- No first-party LoudFace data (CodeOp, Zeiierman, Toku, Outbound Specialist, real client names + numbers).
- Missing direct-answer block at the top for AEO-extractable pieces.
- FAQ section: how many question-shaped H3s? Targets are listed in `/draft-content`.
- Internal links to LoudFace pages: enough? (3-5 minimum for blog posts.)
- Pattern alignment: does the piece structure match its calendar Pattern tag?

**Pass 5 — Read-aloud check**
For 3-5 sample paragraphs, predict the next sentence before reading it. If it's predictable, the writing is too smooth. Flag for rewrite.

**Pass 6 — Internal-link validation (NEW — mandatory)**

Run `node scripts/site-inventory.mjs --markdown` to get the current site map. Then extract every internal link in the draft (any `<a href="/...">` or `[text](/...)`) and verify:

- Each URL points to a path that exists in the inventory (static route, blog slug, case study slug, service category, etc.)
- Any link to a `/seo-for/[industry]` page is verified — many industries exist in Sanity but don't have shipped Next.js routes yet. Only link the ones with actual static routes (today: `/seo-for/b2b`, `/seo-for/saas`, and the index).
- Service links resolve to actual Next.js routes (`/services/seo-aeo`, `/services/cro`, `/services/webflow`, `/services/copywriting`, `/services/ux-ui-design`, `/services/growth-autopilot`) — NOT to the Sanity `serviceCategory` slugs (those have weird suffixes like `branding-jvbsh` and are stale).
- Case study links resolve to real `/case-studies/[slug]` entries
- Blog post links resolve to real `/blog/[slug]` entries (the inventory shows the full list)

For any broken link, the critique should:
1. Flag it as a 🚨 Blocker (broken links ship to production and create 404s or 308 redirects, both of which hurt the piece's authority)
2. Quote the bad anchor + URL
3. Propose either (a) a real URL from the inventory that fits the context, or (b) removing the link entirely if no real page matches

Also flag internal-link opportunities the draft missed:

- If the draft mentions a service we offer (Webflow, SEO/AEO, CRO, etc.) but doesn't link to the service page → 💡 suggestion
- If the draft references a named client outcome (Toku, CodeOp, Zeiierman, etc.) but doesn't link to the case study → 💡 suggestion
- If the draft is vertical-specific (fintech, SaaS, b2b) and a matching `/seo-for/[industry]` page exists → ⚠️ should-fix to add the link

### Step 4: Return the critique

Format:

```
## Anti-slop + voice critique: [title]

**Severity summary:**
- 🚨 Blockers: X issues that must be fixed before shipping
- ⚠️  Should-fix: Y improvements that meaningfully sharpen the piece
- 💡 Suggestions: Z stylistic upgrades

### 🚨 Blockers
[list each with: quote → why → proposed fix]

### ⚠️  Should-fix
[same format]

### 💡 Suggestions
[same format, more lenient]

### Overall verdict
[1-2 sentences: ready to ship / needs another pass / structural rewrite]
```

### Step 5 (optional, only if asked): Apply the fixes

If the user says "apply", "fix it", "ship the edits", or similar, write the revised version back into the source:
- Notion entry: `notion-update-page` with `update_content` (surgical search-and-replace per fix)
- Sanity doc: use the Sanity client (or generate the patch script like we did for the cusp-of-top-10 pages)
- Pasted text: return the revised version in chat

Otherwise, **leave the source unchanged.** The default is read-only critique — fixes are explicit.

## Operating rules

- **Surgical edits, not rewrites.** Default to specific line-level fixes. Full rewrite only when the user asks for "rewrite" or the piece is unsalvageable.
- **Quote the offending text.** Every finding includes the exact quote so it's verifiable.
- **Don't be precious.** Direct feedback over polite hedging. The arnels-assistant tone applies to the critique itself.
- **Respect the strategy.** If the calendar entry's Content Brief specifies a pattern, the critique enforces that pattern.
- **Empty critique is fine.** If the draft is genuinely clean, say so. Don't invent issues to look busy.

## When to use

- After `/draft-content` to polish before shipping
- Before `/ship-content` as the final voice gate
- On any existing live page that needs a refresh (the same checklist applies)
- When the user pastes a draft they wrote and wants the LoudFace anti-slop pass

## When NOT to use

- For content that isn't intended for an audience (internal docs, code comments)
- For social posts (LinkedIn/X) — `/arnels-assistant` handles those end-to-end without needing a separate critique pass
- When the user is asking for structural feedback only (use `/seo-aeo-geo-audit` instead)

## Voice improvements loop

When a critique finds a recurring pattern that should become a permanent rule (e.g., "Arnel keeps catching me using 'streamline' — that should be banned"):

1. Note it explicitly in the critique output ("**Voice-rule candidate:** propose adding 'streamline' to the banned-words list in `/arnels-assistant`")
2. Per the arnels-assistant skill, "When Arnel gives explicit content preferences during a session, propose adding them to the Notes section on the Arnel's Assistant main Notion page"
3. Arnel reviews monthly and updates `arnels-assistant/SKILL.md` + references — improvements compound

This is how the writing voice improves over time: critique surfaces patterns, Arnel updates the skill, downstream commands automatically get sharper.

## Logging

After delivering the critique, append one row to the **Activity Log** database (`collection://586eb325-8bfd-417d-8663-73cda77f8234`):
- Action: `Critiqued "[piece title]" — [X blockers, Y should-fix, Z suggestions]`
- Skill: `critique-content`
- Target: the Notion calendar entry URL (or whatever was reviewed)
- Outcome: `Done`
- Notes: any voice-rule candidates surfaced (so they're discoverable for the monthly `/arnels-assistant` review)
