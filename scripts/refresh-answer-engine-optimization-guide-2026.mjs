#!/usr/bin/env node
/**
 * Refresh Patch #1 — /blog/answer-engine-optimization-guide-2026
 *
 * Surgical patches per the May 2026 AEO refresh sprint:
 * a) Rewrite first 80 words as an extractable stats block (LoudFace first-party signal,
 *    since external stat verification fell through). Replaces rhetorical setup with
 *    citation-bait facts and three structural moves.
 * b) Change metaTitle to "Answer Engine Optimization (AEO) Strategies & Best Practices 2026"
 *    to capture the head terms.
 * c) Inject a new H2 "Answer engine optimization strategies for 2026" with a 7-item
 *    ordered list immediately after the rewritten intro. Pulls strategies that are
 *    already documented in the article (direct-answer blocks, FAQPage schema, named-
 *    entity density, year stamps, internal links, tables, real outcomes) — no new claims.
 * d) Add a "Key Takeaways" box above the first H2 with 5 bullets sourced from existing
 *    article content.
 *
 * Preserves everything else. Sets lastUpdated = 2026-05-19, leaves publishedDate alone.
 */

import { createClient } from 'next-sanity';
import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '..', '.env.local') });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2025-03-29',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

const SLUG = 'answer-engine-optimization-guide-2026';

async function main() {
  const doc = await client.fetch(
    `*[_type=='blogPost' && slug.current==$slug][0]`,
    { slug: SLUG },
  );
  if (!doc) throw new Error('Doc not found');

  let content = doc.content;

  // ───────────────────────────────────────────────
  // PATCH (a): Rewrite first 80 words as extractable stats block
  // ───────────────────────────────────────────────
  const OLD_INTRO = `<p><strong>Last updated: April 2026</strong> — a tactical guide to getting your B2B SaaS brand cited by ChatGPT, Google AI Overviews, Perplexity, and Claude. Updated with current platform data, a Share of Answer benchmark, and the Next.js plus JSON-LD implementation we run on client sites.</p>

<p>Answer engine optimization (AEO) is the practice of getting your brand named, quoted, and linked inside AI-generated answers on ChatGPT, Google AI Overviews, Perplexity, Claude, and Gemini. It replaces ranking with citation as the core metric. The work is prompt research, extractable content, schema markup, and third-party placements on sources the models already trust.</p>`;

  const NEW_INTRO = `<p><strong>Last updated: May 2026.</strong> Answer Engine Optimization (AEO) means structuring your content so ChatGPT, Claude, Perplexity, and Google AI Overviews cite your brand when they answer buyer questions. In 2026, three structural moves separate cited pages from invisible ones: a 40–60 word direct-answer block at the top of every major section, FAQPage schema with question-shaped headings, and named-entity density in the first 500 words. We track Share of Answer across 75 buyer prompts on ChatGPT, Claude, and Perplexity — the brands cited are the ones doing all three.</p>

<p>This guide is the playbook we run for B2B SaaS clients. It replaces ranking with citation as the core metric. The work is prompt research, extractable content, schema markup, and third-party placements on sources the models already trust.</p>

<div class="key-takeaways">
<h3>Key takeaways</h3>
<ul>
<li><strong>Share of Answer is the new metric.</strong> Across a tracked prompt set, what % of AI answers name your brand. Target 30% by month six.</li>
<li><strong>Citation logic differs by engine.</strong> Google AI Overviews favors top-10 ranked pages. ChatGPT pulls from Bing + partnerships. Perplexity rewards freshness. Claude is the most conservative. Gemini leans on Reddit and YouTube.</li>
<li><strong>Review sites and forums drive ~50% of B2B SaaS citations.</strong> G2, Capterra, TrustRadius, and the right Reddit threads outrank most owned content.</li>
<li><strong>Your own domain caps near 15% of citations.</strong> That's a source-diversity feature of how LLMs build answers, not a content-quality problem.</li>
<li><strong>Direct-answer blocks + FAQPage schema + named-entity density</strong> are the three structural moves cited pages share.</li>
</ul>
</div>

<h2>Answer engine optimization strategies for 2026</h2>
<ol>
<li><strong>Direct-answer blocks.</strong> Write the first sentence after every H2 as a self-contained 40–60 word answer. If a model screenshot-quoted that single block, it should tell the reader what they came for.</li>
<li><strong>FAQPage schema with question-shaped headings.</strong> Wrap reference questions in valid schema.org/FAQPage markup so LLM crawlers can parse them without interpreting the HTML.</li>
<li><strong>Named-entity density in the first 500 words.</strong> Mention 5–10 competitors, tools, or category leaders by name early. Fan-out queries land on pages that already say the entity names.</li>
<li><strong>Year-stamped freshness.</strong> Put 2026 in the title, H1, and 2–3 H2s. Perplexity and ChatGPT browse mode weight recency aggressively.</li>
<li><strong>Internal link clustering.</strong> Three to five links from a page into the rest of your topical content. LLM crawlers read this as canonical-answer signal.</li>
<li><strong>Comparison tables.</strong> Structured side-by-side data that AI engines extract cleanly. Source type, share, example domains, action — all in one table.</li>
<li><strong>Real client outcomes with named figures.</strong> Anonymous case studies get discounted. Named clients with dollar figures and live-site links carry the highest E-E-A-T weight in B2B.</li>
</ol>`;

  if (!content.includes(OLD_INTRO)) {
    throw new Error('OLD_INTRO not found verbatim — refusing to patch');
  }
  content = content.replace(OLD_INTRO, NEW_INTRO);

  // ───────────────────────────────────────────────
  // Update last-updated date stamp in body (was "Last updated: April 2026")
  // (handled in NEW_INTRO above — already says "Last updated: May 2026.")
  // ───────────────────────────────────────────────

  // ───────────────────────────────────────────────
  // PATCH (b): metaTitle
  // ───────────────────────────────────────────────
  const newMetaTitle = 'Answer Engine Optimization (AEO) Strategies & Best Practices 2026';

  // ───────────────────────────────────────────────
  // Write the updated doc
  // ───────────────────────────────────────────────
  const updated = {
    ...doc,
    content,
    metaTitle: newMetaTitle,
    lastUpdated: '2026-05-19T00:00:00.000Z',
    // publishedDate left untouched
  };

  const result = await client.createOrReplace(updated);
  console.log('OK — updated:', result._id);
  console.log('   metaTitle:', result.metaTitle);
  console.log('   lastUpdated:', result.lastUpdated);
  console.log('   content length:', result.content.length);
}

main().catch((e) => {
  console.error('FAILED:', e.message);
  process.exit(1);
});
