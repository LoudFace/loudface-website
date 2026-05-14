---
name: ship-content
description: Publish an approved draft from a Notion calendar entry to Sanity, move the entry status to Published, and let the existing Sanity webhook chain (revalidate + IndexNow + sitemap update) handle the rest. The final step in LoudFace's content loop. Use after /draft-content and /critique-content have produced an approved draft. Trigger when the user says "ship X", "publish the [entry]", "push to Sanity", or invokes /ship-content with a calendar entry.
---

# /ship-content — Notion draft → Sanity → live site

The final stage of LoudFace's content loop. Takes a finalized draft from a Notion Website Content database entry, creates or updates the corresponding Sanity document, sets it to published, updates the Notion entry status, and lets the existing infrastructure (Sanity webhook → `/api/revalidate` → IndexNow → sitemap) propagate the change to the live site within seconds.

## What to do when invoked

The user will name a calendar entry (Notion ID, URL, or title). The entry must already have a final draft in its body — typically after `/draft-content` + one or more rounds of `/critique-content`.

### Step 1: Verify the entry is ready

Fetch the Notion entry. Check:
- **Status** = `Review` or `Draft` (not `Idea` / `Outline` — those aren't ready)
- **Body** has actual content (not just the brief)
- **Content Type** is set (`Blog Post` / `Listicle` / `Landing Page` / `Case Study`)
- **Title** is the final headline (not a working title)

If anything is missing, ask the user before proceeding. **Don't ship half-baked content.**

### Step 2: Confirm with the user before publishing

Show them:
- Title + word count
- Content Type → which Sanity schema (`blogPost` or `caseStudy`)
- Target slug (from title, kebab-cased)
- A preview of the first 200 words

Ask: "Ship this now, or hold for another pass?" Wait for explicit go-ahead. **Publishing affects shared state — never ship without confirmation.**

### Step 3: Convert the Notion body to Sanity HTML

The Sanity `blogPost` schema stores `content` as raw HTML (per the project's CLAUDE.md). Convert the Notion-flavored markdown to HTML:
- Headings: `## ` → `<h2>`, `### ` → `<h3>`
- Lists: `- ` → `<ul><li>`, `1. ` → `<ol><li>`
- Paragraphs: blank-line separated → wrap in `<p>`
- Bold: `**text**` → `<strong>text</strong>`
- Italic: `*text*` → `<em>text</em>`
- Links: `[text](url)` → `<a href="url">text</a>`
- Tables: Notion-flavored → HTML table with the existing `summary_table` style block (match the pattern in `/blog/best-b2b-saas-seo-agencies`)
- Callouts: convert to styled `<div>` or strong-tagged paragraphs

### Step 4: Build the Sanity payload

For `blogPost`:
- `_type`: `blogPost`
- `_id`: derive from slug (e.g. `blogPost-{slug}`)
- `slug.current`: kebab-cased title
- `name`: H1 / final title
- `metaTitle`: SEO title (60 chars max, leads with primary keyword)
- `metaDescription`: 150-160 chars
- `excerpt`: 1-2 sentence summary
- `content`: the HTML body
- `faq`: array of `{question, answer}` objects extracted from the FAQ section in the draft
- `category`: reference to existing category (ask user if unclear)
- `author`: reference to LoudFace team member (typically Arnel)
- `publishedDate`: today's date in ISO
- `lastUpdated`: today's date in ISO
- `thumbnail`: prompt the user to supply the hero image asset (or skip and have them add via Studio)
- `featured`: false (unless asked)
- `timeToRead`: estimate from word count (200 words per minute)

For `caseStudy`: similar shape but match the case-study schema (different field names — check an existing case study doc first).

### Step 5: Create / update the Sanity document

Use the same approach we used for the cusp-of-top-10 fixes: a one-shot Node script that imports the Sanity write client with the existing `SANITY_API_TOKEN`.

Pattern:
```js
import { createClient } from '@sanity/client';
const client = createClient({
  projectId: 'xjjjqhgt',
  dataset: 'production',
  apiVersion: '2025-03-29',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

await client.createOrReplace({ _id: '...', _type: 'blogPost', ... });
```

Save the script to `scripts/ship-{slug}.mjs` so there's a record of what shipped. Run from project root: `cd "<project>" && node scripts/ship-{slug}.mjs`.

**Do not use the Sanity MCP `patch_document_from_json` for this** — the schema validation issue (workspace name mismatch) we hit before isn't worth re-debugging. The Node + write-client path works reliably.

### Step 6: Verify the page is live

After the patch, the chain fires automatically:
- Sanity content edit → webhook fires
- `/api/revalidate` revalidates `/blog/{slug}` (or `/case-studies/{slug}`)
- Same route POSTs the URL to IndexNow → Bing/Yandex/ChatGPT-search re-crawl

Wait 5-10 seconds, then curl the live URL:
```bash
curl -sS "https://www.loudface.co/blog/{slug}?cb=$(date +%s%N)" | grep -E '<title>|<meta name="description"'
```

Confirm:
- Title matches the new `metaTitle`
- Description matches the new `metaDescription`
- Body content is the new draft

If Cloudflare still serves cached HTML, purge the URL via the Cloudflare MCP.

### Step 7: Update the Notion calendar entry

Use `notion-update-page` with `update_properties`:
- `Status` → `Published`
- `date:Publish Date:start` → today (ISO)
- `userDefined:URL` → the live `https://www.loudface.co/blog/{slug}` URL
- `Word Count` → final count

The entry is now closed in the calendar.

### Step 8: Return a tight summary

Under 100 words:
- Title + live URL
- Sanity doc ID (so we can find it in Studio if needed)
- Word count
- Confirmed live: yes/no (from the curl check)
- IndexNow status: pinged via revalidate (automatic)
- Next: anything queued for follow-up? (e.g., "consider adding a chart in week 2 via `/blog-visuals`")

## Operating rules

- **Confirm before publishing.** Always. The page goes live — this is shared state.
- **Don't bypass `/critique-content`.** If the user wants to ship a draft that hasn't been critiqued, push back once: "Run `/critique-content` first?" If they decline, ship — but note that the anti-slop pass was skipped.
- **Don't create new categories or authors.** Reference existing ones. If a needed reference doesn't exist, surface it as a blocker.
- **Don't ship to a slug that's already published unless updating.** Check for collisions first. If colliding, ask whether to update the existing post or use a different slug.
- **Always update the Notion entry status afterwards.** A shipped piece that says `Draft` in the calendar creates a misleading dashboard.

## When to use

- A draft in Notion has been approved by Arnel after one or more `/critique-content` rounds
- The user explicitly says "ship X" or "publish the {entry}"
- The piece is part of the Website Content database calendar

## When NOT to use

- The draft is still in `Idea` or `Outline` status — go through `/draft-content` first
- The piece is for an external platform (LinkedIn, X, Twitter) — those don't go through Sanity
- Visual assets are needed first — run `/blog-visuals` to generate illustrations, then ship
- Schema fields you can't fill (e.g., no category reference) — block + ask

## The full loop

```
Calendar entry (Idea) 
     ↓
/draft-content    →  draft into Notion entry, status Idea → Draft
     ↓                (uses /seo-brain + /arnels-assistant under the hood)
/critique-content →  anti-slop + voice pass, iterate
     ↓                (uses /arnels-assistant under the hood)
/ship-content     →  THIS: push to Sanity, status → Published
     ↓
Sanity webhook    →  /api/revalidate → IndexNow → live site
     ↓
GSC + Peec        →  measurement loops back into the brain
```

The voice improvements happen by editing `/arnels-assistant` itself — every downstream command picks up the new rules automatically the next time it's invoked.
