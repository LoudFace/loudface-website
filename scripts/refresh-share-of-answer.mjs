#!/usr/bin/env node
/**
 * Refresh Patch #4 — /blog/share-of-answer
 *
 * a) Add "How to calculate Share of Answer" formula block immediately after
 *    the existing definition (under the first H2).
 *
 * b) Add explicit synonym callout. Verified via web search: Sarah Evans
 *    (communications strategist) did coin "answer share" — keeping the
 *    attribution.
 *
 * c) Add new H2 "Share of Answer vs Share of Voice" with 150-200 word
 *    comparison. The article already has a one-bullet mention; we're
 *    promoting it to a dedicated section.
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

const SLUG = 'share-of-answer';

async function main() {
  const doc = await client.fetch(
    `*[_type=='blogPost' && slug.current==$slug][0]`,
    { slug: SLUG },
  );
  if (!doc) throw new Error('Doc not found');

  let content = doc.content;

  // ───────────────────────────────────────────────
  // PATCH (a) + (b): Inject formula block + synonym callout
  // Insert AFTER the existing definition paragraph under "What Share of Answer is (and isn't)"
  // ───────────────────────────────────────────────
  const ANCHOR = `<p>Tracked via tools like Peec AI, which run scheduled queries against ChatGPT, Perplexity, Claude, Google AI Overviews, and similar engines, then measure whether and how often your brand is cited in the responses.</p>`;

  const FORMULA_BLOCK = `${ANCHOR}

<h3>How to calculate Share of Answer</h3>
<p>The formula:</p>
<p><strong>Share of Answer (%) = (Prompts citing your brand ÷ Total tracked prompts) × 100</strong></p>
<p>Example: if you track 50 buyer prompts and your brand is cited in 12, your Share of Answer is 24%. Most B2B SaaS categories have 30–100 buyer prompts worth tracking. Run them weekly across ChatGPT, Claude, Perplexity, and Google AI Overviews to filter platform-specific noise.</p>

<p>The same concept is sometimes called <strong>"answer share"</strong> (the term coined by communications strategist Sarah Evans in 2025) or <strong>"AI share of voice."</strong> All three describe the same thing: how often your brand is named in AI-generated answers across the prompts buyers actually ask. Pick one and stick with it across your reporting — the cross-tool inconsistency is the real headache, not the underlying metric.</p>`;

  if (!content.includes(ANCHOR)) {
    throw new Error('ANCHOR not found — refusing to patch');
  }
  content = content.replace(ANCHOR, FORMULA_BLOCK);

  // ───────────────────────────────────────────────
  // PATCH (c): Add "Share of Answer vs Share of Voice" H2
  // Insert BEFORE "Why keyword rankings miss the AI-search era" so the SoA/SoV
  // demarcation lands right after the definition.
  // ───────────────────────────────────────────────
  const NEXT_H2 = `<h2>Why keyword rankings miss the AI-search era</h2>`;

  const SOA_VS_SOV = `<h2>Share of Answer vs Share of Voice</h2>
<p><strong>Share of Voice (SoV)</strong> is the legacy marketing metric — the percentage of category conversation a brand owns across earned media, social posts, and press mentions over a defined time window. PR teams have tracked it for two decades. It answers: "how loud are we in the conversation?"</p>
<p><strong>Share of Answer (SoA)</strong> is the AI-search-specific version. It answers a sharper question: "when buyers ask an AI engine for category recommendations, how often does our brand get named?" The unit is not a mention in a feed — it's a citation inside a synthesized answer that a buyer reads instead of clicking through to source pages.</p>
<p>The two metrics correlate but do not substitute. A brand can dominate SoV (high press volume, social mentions, conference visibility) and have a 5% SoA because no one structured the content for AI extraction. A brand can hit 40% SoA with thin SoV by publishing extractable reference content that LLM crawlers index heavily. For B2B SaaS in 2026, SoA is the conversion-relevant metric — buyers research inside ChatGPT and Perplexity before they ever see a press release.</p>

${NEXT_H2}`;

  if (!content.includes(NEXT_H2)) {
    throw new Error('NEXT_H2 anchor not found — refusing to patch');
  }
  content = content.replace(NEXT_H2, SOA_VS_SOV);

  // ───────────────────────────────────────────────
  // Write the updated doc
  // ───────────────────────────────────────────────
  const updated = {
    ...doc,
    content,
    lastUpdated: '2026-05-19T00:00:00.000Z',
  };

  const result = await client.createOrReplace(updated);
  console.log('OK — updated:', result._id);
  console.log('   lastUpdated:', result.lastUpdated);
  console.log('   content length:', result.content.length);
}

main().catch((e) => {
  console.error('FAILED:', e.message);
  process.exit(1);
});
