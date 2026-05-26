#!/usr/bin/env node
/**
 * Patch the "Best LLM SEO + AEO Agencies for B2B SaaS in 2026" article.
 *
 * Two structural additions per the post-publish review:
 *   1. Convert the "What to look for in an LLM SEO agency" 4-paragraph
 *      section into a 3-col criteria table (Criterion | Why it matters
 *      | Red flag). Rename H2 to "How to evaluate an LLM SEO agency"
 *      so it matches the criteria-table audit regex.
 *   2. Insert a "How long until LLM SEO actually works" timeline section
 *      with the 3-tier table (same-day-1-week / 2-8-weeks / 2-6-months)
 *      before the FAQ H2. Uses Toku + TradeMomentum as named examples.
 *
 * Idempotent: re-runs detect the criteria-table H2 + timeline H2 and skip.
 */

import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@sanity/client';

const ROOT = '/Users/arnel/Code Projects/LoudFace Agency/loudface-website';

const env = Object.fromEntries(
  fs.readFileSync(path.join(ROOT, '.env.local'), 'utf8').split('\n')
    .map((l) => l.trim().match(/^([A-Z_]+)=(.*)$/)).filter(Boolean)
    .map((m) => [m[1], m[2]])
);

const sanity = createClient({
  projectId: 'xjjjqhgt', dataset: 'production', apiVersion: '2025-03-29',
  useCdn: false, token: env.SANITY_API_TOKEN,
});

const NOW = new Date().toISOString();
const SLUG = 'best-llm-seo-aeo-agencies-b2b-saas-2026';

// --- Section A: criteria table (replaces the "What to look for" section) ---

const OLD_CRITERIA_SECTION = `<h2>What to look for in an LLM SEO agency</h2>

<p>Four things separate real methodology from marketing copy.</p>

<p><strong>Citation monitoring software.</strong> Agencies that genuinely do LLM SEO track when and how AI engines cite their clients' content. Peec AI and <a href="https://profound.ai">Profound.ai</a> are the tools used by agencies on this list. If an agency cannot tell you a client's current citation count on a tracked prompt set, they are not doing LLM SEO.</p>

<p><strong>Specific content formats for extraction.</strong> Direct-answer blocks of 40-60 words, question-shaped H2s and H3s, FAQPage schema, entity-rich prose. Generic long-form content is not AEO-optimized content.</p>

<p><strong>Prompt-level targeting.</strong> Keyword research and prompt research are different. LLM SEO starts by identifying which prompts a brand's buyers use in AI tools, then maps existing content against those prompts. Agencies that structure all work around keyword lists are not doing LLM SEO.</p>

<p><strong>Pipeline measurement.</strong> Traffic is a vanity metric for B2B SaaS. Agencies worth engaging measure demo requests, free trial signups, and pipeline value attributed to organic.</p>`;

const NEW_CRITERIA_SECTION = `<h2>How to evaluate an LLM SEO agency</h2>

<p>Four criteria separate real LLM SEO methodology from rebranded traditional SEO. Each maps to a concrete signal in how the agency operates and sells.</p>

<table>
<thead><tr><th>Criterion</th><th>Why it matters</th><th>Red flag</th></tr></thead>
<tbody>
<tr><td>Citation monitoring software</td><td>An agency that cannot tell you a client's current citation count on a tracked prompt set in ChatGPT, Perplexity, and Gemini is not measuring LLM SEO. They are guessing. Peec AI and <a href="https://profound.ai">Profound.ai</a> are the standard tools used by the agencies on this list.</td><td>"We track branded mentions and direct traffic" is not citation measurement. That is SEO 101 instrumentation with new vocabulary.</td></tr>
<tr><td>Content formats for AI extraction</td><td>Direct-answer blocks of 40 to 60 words, question-shaped H2s and H3s, FAQPage and Article schema, entity-rich prose. AI models pull from structured surfaces, not narrative paragraphs.</td><td>Long-form thought-leadership pieces with no structural extraction signal. AI cannot lift a citation cleanly from a wall of text.</td></tr>
<tr><td>Prompt-level targeting</td><td>Buyers ask AI tools different questions than they type into Google. LLM SEO starts from the prompt graph, not the keyword list. Mapping existing content against those prompts is the first piece of real work.</td><td>Keyword research deliverables only. If the agency cannot show you 30 to 50 specific prompts your buyers use in ChatGPT or Perplexity, they are doing keyword SEO.</td></tr>
<tr><td>Pipeline measurement</td><td>Traffic is a vanity metric for B2B SaaS. The agency should measure demo requests, free trial signups, and pipeline value attributed to organic, including AI-referral traffic.</td><td>Reports that lead with sessions and impressions. If the monthly review never connects work to revenue, the work is not aimed at revenue.</td></tr>
</tbody>
</table>`;

// --- Section B: timeline section (inserted before the FAQ H2) ---

const OLD_FAQ_ANCHOR = `<h2>Frequently Asked Questions</h2>`;

const NEW_TIMELINE_THEN_FAQ = `<h2>How long until LLM SEO actually works</h2>

<p>The honest answer is different for different parts of the program. Three timeframes apply, and the agency that quotes a single number for all three is hiding which one matters for your category.</p>

<table>
<thead><tr><th>Timeframe</th><th>What is possible</th><th>When it applies</th><th>Real example</th></tr></thead>
<tbody>
<tr><td>Same-day to 1 week</td><td>First AI citation appears in ChatGPT, Perplexity, or Gemini</td><td>Page is Bing-indexed, FAQPage and Article schema are in place, direct-answer paragraph sits in the first 60 words, the target prompt has low competitive density</td><td>Internal LoudFace pattern: niche prompts where no incumbent owns the answer.</td></tr>
<tr><td>2 to 8 weeks</td><td>Consistent citations across 2 to 3 AI platforms for the tracked prompt set</td><td>Net-new prompts where the prompt graph is still maturing, mid-density competition, structural retrofit work completed across the target pages</td><td>TradeMomentum: consistent citations across ChatGPT and Perplexity within roughly 4 weeks of the AEO restructure on their trading-bootcamp content.</td></tr>
<tr><td>2 to 6 months</td><td>Primary recommendation status for category-defining prompts</td><td>Displacing an established incumbent, high competitive density, prompt graph is fragmented across many adjacent intents</td><td>Toku on the "stablecoin payroll" prompt: months of work to land 86% share of answer, in parallel with the prompt itself maturing as a category in AI training data.</td></tr>
</tbody>
</table>

<p>The compression points are structural. Pages cited in the first week share five things: Bing crawl already covering the URL, FAQPage and Article schema in place, a direct-answer paragraph in the first 60 words, an extractable comparison or list pattern AI surfaces as bullets, and a buyer-level title that matches the actual prompt language. Agencies that quote a fixed 90-day "ramp" without explaining which of these three timeframes they target are usually buying time, not shipping the structural work.</p>

<h2>Frequently Asked Questions</h2>`;

// --- Run ---

async function main() {
  const post = await sanity.fetch(
    `*[_type=="blogPost" && slug.current==$slug][0]{_id, content}`,
    { slug: SLUG }
  );
  if (!post) {
    console.error(`Post not found: ${SLUG}`);
    process.exit(1);
  }

  let content = post.content || '';
  const initialLen = content.length;
  const actions = [];

  // Section A
  if (content.includes('How to evaluate an LLM SEO agency')) {
    console.log('SKIP criteria table — already present');
  } else if (content.includes(OLD_CRITERIA_SECTION)) {
    content = content.replace(OLD_CRITERIA_SECTION, NEW_CRITERIA_SECTION);
    actions.push('criteria-table');
  } else {
    console.warn('Could not find the "What to look for" section anchor. Section A skipped.');
  }

  // Section B
  if (content.includes('How long until LLM SEO actually works')) {
    console.log('SKIP timeline section — already present');
  } else if (content.includes(OLD_FAQ_ANCHOR)) {
    content = content.replace(OLD_FAQ_ANCHOR, NEW_TIMELINE_THEN_FAQ);
    actions.push('timeline');
  } else {
    console.warn('Could not find the FAQ H2 anchor. Section B skipped.');
  }

  if (actions.length === 0) {
    console.log('Nothing to patch.');
    return;
  }

  console.log(`Patching ${SLUG}:`);
  console.log(`  actions: ${actions.join(', ')}`);
  console.log(`  size delta: ${content.length - initialLen} chars`);

  console.log(`Pre-patch content length: ${initialLen}, post-patch will be: ${content.length}`);
  console.log(`Patching doc _id: ${post._id}`);

  const res = await sanity.patch(post._id)
    .set({ content, lastUpdated: NOW })
    .commit({ visibility: 'sync' });

  console.log(`Patched (rev: ${res._rev}, returned _updatedAt: ${res._updatedAt})`);

  // Verify by re-fetching
  const verify = await sanity.fetch(
    `*[_type=="blogPost" && _id==$id][0]{"cLen":length(content),lastUpdated,"hasEval":content match "How to evaluate an LLM SEO"}`,
    { id: post._id }
  );
  console.log(`Verify: ${JSON.stringify(verify)}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
