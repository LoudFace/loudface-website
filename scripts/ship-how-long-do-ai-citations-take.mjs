/**
 * Ship: "How Long Do AI Citations Take? The Three Speeds You Need to Know"
 *
 * Notion entry id: 361b6339-4d10-81e6-a7d2-fbd707a8208c
 * Pattern: Founder-byline thought leadership (validated)
 * Slug: how-long-do-ai-citations-take
 *
 * Critique applied before ship:
 *   - Anti-slop scan: clean (no banned words, em-dash budget 6/2203 within limit,
 *     X-not-Y construction count = 1 within limit, year-stamped, FAQ has 7
 *     question-shaped H3s, real first-party Toku data throughout).
 *   - Broken internal link FIXED in conversion below: the draft pointed at
 *     https://www.notion.so/case-studies/toku-ai-cited-pipeline (wrong
 *     domain); corrected to https://www.loudface.co/case-studies/toku-ai-cited-pipeline.
 *
 * Refs:
 *   - Author: imported-teamMember-68d81a1688d5ed0743d0b8b6 (Arnel Bukva)
 *   - Category: imported-category-67bced3103339308260cf6a1 (Business; same as
 *     share-of-answer + aeo-strategies-that-work pieces in the same lane).
 */

import { createClient } from "@sanity/client";
import { createReadStream, readFileSync } from "fs";

const env = readFileSync(".env.local", "utf8").split("\n").reduce((a, l) => {
  const m = l.match(/^([^=]+)=(.*)$/);
  if (m) a[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  return a;
}, {});

const client = createClient({
  projectId: "xjjjqhgt",
  dataset: "production",
  apiVersion: "2025-03-29",
  useCdn: false,
  token: env.SANITY_API_TOKEN,
});

const DOC_ID = "blogPost-how-long-do-ai-citations-take";
const SLUG = "how-long-do-ai-citations-take";

// ─── Step 1: Upload hero thumbnail ─────────────────────────────────────────
console.log("Uploading hero thumbnail...");
const asset = await client.assets.upload("image", createReadStream("/tmp/three-speeds-thumb.png"), {
  filename: `${SLUG}-hero.png`,
  contentType: "image/png",
});
console.log(`✓ Asset uploaded: ${asset._id}`);

// ─── Step 2: Body content (Notion markdown → HTML) ─────────────────────────
//
// The draft body lives inline here so the ship script is the canonical
// record of what shipped (no implicit dependency on Notion state, which
// drifts after publish). Conversion is hand-tuned to preserve the table
// and the link rewrite.

const content = `<p><strong>TL;DR:</strong> AI citations move at three different speeds. <strong>Hours to a day</strong> for first pickup on a well-structured page from a brand with modest authority. <strong>Weeks</strong> for a consistent slot in the cited-source set on a prompt that matters. <strong>Months</strong> for dominant share of voice on competitive prompt clusters and pipeline conversion. Most agencies sell the fast speed but bill for the slow speed. Knowing which one you actually want is the whole game.</p>

<hr>

<p>A founder asked me last week how long AI citations take. I gave him "1 to 12 months."</p>

<p>He laughed and said: "That's not an answer."</p>

<p>He was right. So here is the answer, broken into the three speeds it actually runs at.</p>

<p>I've been running dual-track SEO and AEO programs for B2B SaaS and fintech for two years. Every client gets cited at speed 1. Most get cited at speed 2. Few get to speed 3. The number you should ask for depends on the outcome you actually want.</p>

<h2>Speed 1: Hours to a day. First citation pickup.</h2>

<p>This is real, and the industry undersells it.</p>

<p>A well-structured page, published today, on a brand with even modest existing authority, can be cited inside Google AI Overviews within hours and inside Perplexity within a day. The reason the industry insists "AI citations take 6 months" is because that number sounds like agency work to sell. Same-day pickup sounds like a content marketing optimization, not a retainer.</p>

<p>What "well-structured" means in practice:</p>

<ul>
  <li><strong>A direct-answer paragraph in the first 60 words of the page.</strong> The LLM scans for an extractable answer near the top. If your hero is a vague brand tagline, you lose the slot to the page that put the answer where the model could grab it.</li>
  <li><strong>A question-shaped H2</strong> matching the prompt the buyer is asking. Not "Our Approach" but "How long do AI citations take?"</li>
  <li><strong>Schema markup that names the entity.</strong> Article, FAQPage, Organization. The LLM uses schema to resolve who is the source of the claim.</li>
  <li><strong>An internal link from a page that already has authority</strong> so the crawl reaches the new page within hours.</li>
</ul>

<p>This is what "if done right" actually means. None of it is hard. It is just precise.</p>

<p>What this speed does not do: get you cited on the prompt the category leader already owns. Same-day pickup happens on prompts with room. Long-tail queries. Time-sensitive topics. Narrow wedges. Trying to win "best CRM for startups" same-day is a different sport.</p>

<h2>Speed 2: Weeks. Earning a consistent slot.</h2>

<p>First citation is easy. Staying cited is harder.</p>

<p>LLMs re-evaluate cited sources continuously. The page that won the slot on Monday isn't guaranteed the slot on Friday. Whether you stay in the cited-source set depends on:</p>

<ul>
  <li><strong>Whether the page survives multi-sample variance.</strong> AI engines sample the citation set differently each time the prompt is asked. Strong pages are cited 80%+ of the time. Weak pages drift in and out at 20-40%.</li>
  <li><strong>Whether the page links into a real entity graph.</strong> A standalone post with no internal linking and no schema is treated as ephemeral. The same content embedded in an architecture (related pages, schema, branded mentions) survives re-evaluation.</li>
  <li><strong>Whether competitors are pushing better answers.</strong> This is the part nobody talks about. Citation slots are zero-sum on any given prompt. If a competitor publishes a sharper direct-answer next week, your slot can vanish without you doing anything wrong.</li>
</ul>

<p>Operating at speed 2 means producing one strong piece a week. That is the rhythm where a brand goes from "occasionally cited" to "reliably in the top 3 cited sources" on a working prompt cluster.</p>

<h2>Speed 3: Months. Dominant share of voice and pipeline.</h2>

<p>This is the metric the <a href="https://www.loudface.co/case-studies/toku-ai-cited-pipeline">Toku case study</a> actually measures.</p>

<p>Toku at 86% citation on "best stablecoin payroll solutions" is not a "first citation in 3 months" number. Toku has been getting first-citation pickup since the 2024 redesign, almost two years ago. The 86% number is a 30-day share-of-voice measurement: across Peec AI's repeated sampling of the same prompt, Toku appears in the cited-source set 86% of the time, at average position 2.4. That is a different metric on a different time scale.</p>

<p>What it takes to get there:</p>

<ul>
  <li><strong>A wedge the category leaders don't own.</strong> Toku's 86% is in the crypto-payroll cluster: USDC, stablecoin, Web3, token compensation. Toku's number on "best EOR for startups" is 0%. By design. We pointed the content architecture at the wedge instead of fighting Deel and Remote on their own ground.</li>
  <li><strong>A content architecture engineered for the wedge.</strong> A long-form resources hub. A structured /answers directory. A programmatic /rates/{role}-{country} tree. An integrations directory. Four content surfaces, each built so an LLM can pull a clean quote.</li>
  <li><strong>Branded search lift compounding underneath.</strong> AI citation → buyer Googles brand → branded search trains Google's entity graph → next AI citation arrives faster. The cleanest signal is brand-modifier queries that didn't exist before the engagement window. Three appeared NEW from zero between February and April: <code>toku web3</code>, <code>toku token</code>, <code>toku app</code>. Net-new branded searches only exist because someone learned about Toku from a new surface, which is the flywheel.</li>
  <li><strong>First-touch attribution on pipeline.</strong> 60%+ of tracked B2B meetings first-touched by Google organic search. 25% from direct or branded. That is the receipt that closes the loop.</li>
</ul>

<p>Months 1 through 6 of an engagement build the foundation that produces speed 3. The foundation work is the part agencies skip when they pitch "fast AEO." It is invisible to the client until month 6 because nothing in the AI surface moves until enough of the foundation is in place. That is where the "AI citations take 12 months" framing comes from. It is not wrong. It is just the wrong question.</p>

<h2>Which speed do you actually want?</h2>

<p>The honest answer to "how long do AI citations take" is: which one of these three are you asking about?</p>

<ul>
  <li><strong>A citation on a topical question, fast</strong> — that is speed 1. One sharp page, structured correctly, on a brand with any authority. Possible same-day.</li>
  <li><strong>Reliable citations in your category's prompt cluster</strong> — that is speed 2. Several months of weekly publishing strong pages with schema density and internal linking.</li>
  <li><strong>Being the answer when a buyer asks an AI for a recommendation in your category</strong> — that is speed 3. 6-12 months of foundation plus citation work plus branded search compounding.</li>
</ul>

<p>The agencies promising "30 days to AEO" are selling speed 1 and calling it speed 3. That is why the work feels real for the first month and then plateaus. The agencies pitching "AEO takes 12 months minimum" are selling speed 3 to clients who only need speed 1.</p>

<p>Both are misreading buyer intent. Pick the speed that matches the outcome.</p>

<h2>What to track at each speed</h2>

<div class="blog-table-wrap">
<table>
<thead>
  <tr>
    <th>Speed</th>
    <th>Right metric</th>
    <th>Wrong metric</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td>1 — Hours to a day</td>
    <td>Citation appearance on the specific prompts you published for</td>
    <td>"Mentions in ChatGPT" as a brand-level number</td>
  </tr>
  <tr>
    <td>2 — Weeks</td>
    <td>Share of voice across 10-20 prompts that match your wedge, sampled weekly</td>
    <td>Total citations across hundreds of prompts</td>
  </tr>
  <tr>
    <td>3 — Months</td>
    <td>Branded search lift in GSC plus first-touch attribution on booked meetings</td>
    <td>Average AI position across all tracked queries</td>
  </tr>
</tbody>
</table>
</div>

<p>Tools that produce these honestly:</p>

<ul>
  <li><strong>Peec AI</strong> for cross-engine share-of-voice sampling across ChatGPT, Perplexity, Google AI Overviews, Claude, Gemini, and Grok</li>
  <li><strong>Google Search Console</strong> for branded search lift and per-page Google performance</li>
  <li><strong>PostHog</strong> (or your CRM with first-touch attribution properly set up) for pipeline lookback</li>
</ul>

<p>If those three datasets do not move together over the time horizon you committed to, the work is not real.</p>

<h2>Which AI engine cites you first?</h2>

<p>The order matters because it tells you what to track first:</p>

<ol>
  <li><strong>Google AI Overviews cites you first.</strong> It is the surface that updates fastest because it sits on top of Google's existing index. Toku at the current snapshot: 35% visibility on Google AI Overviews, with 57% of Toku's total AI mentions coming from this one surface. If you ignore Google AI Overviews because you think AEO means ChatGPT, you are optimizing for the wrong panel.</li>
  <li><strong>Perplexity follows.</strong> Perplexity rebuilds its index on a daily-to-weekly cycle. New pages get cited faster than on ChatGPT.</li>
  <li><strong>ChatGPT lags.</strong> ChatGPT updates its retrieval index, but its base training is fixed at a cutoff date and refreshes only on major model releases. New content pages from the last 60 days are routinely missing from ChatGPT answers even when they sit at position 1 on Google.</li>
</ol>

<p>Most agencies optimize for ChatGPT first because that is the surface they personally use. They are optimizing for the slowest panel.</p>

<h2>The takeaway</h2>

<p>Stop asking how long AI citations take. Start asking what you actually want.</p>

<p>Speed 1 is hours. Speed 2 is weeks. Speed 3 is months.</p>

<p>The fast speed is real if you have the foundation and a sharp prompt. The slow speed is real if you are starting from generic. Both are honest. The dishonest move is conflating them, and that is most of the category.</p>

<p>If you want help picking the right speed and building the program that gets you there, <a href="https://www.loudface.co/services/seo-aeo">that is what the dual-track SEO/AEO program I run at LoudFace does</a>. Same playbook that took Toku from 0 to 86% on the stablecoin prompt cluster.</p>`;

// ─── Step 3: FAQ (hand-extracted from the draft's ### H3 list) ─────────────
const faq = [
  {
    _key: "faq-01",
    question: "How long do AI citations take for a B2B SaaS company in 2026?",
    answer: `There are three honest answers depending on what you mean by "citation." First citation pickup on a well-structured page from a brand with modest authority can happen within hours to a day. A consistent slot in the cited-source set for a prompt that matters takes weeks of repeated publishing. Dominant share of voice on competitive prompt clusters (the Toku-style 86% number) takes 3 to 6 months on top of an existing content foundation, or 6 to 12 months if you are building from scratch.`,
  },
  {
    _key: "faq-02",
    question: "Can I get cited by ChatGPT in 1 day?",
    answer: `Possible, but harder than Google AI Overviews or Perplexity. ChatGPT's base training is fixed at a cutoff date and only refreshes on major model releases. Same-day pickup in ChatGPT depends on its web retrieval surfacing your page, which favors high-authority sites and time-sensitive queries. For a brand-new domain on a competitive evergreen prompt, same-day ChatGPT citation is unlikely. Google AI Overviews is the fastest path to same-day pickup for most B2B SaaS pages.`,
  },
  {
    _key: "faq-03",
    question: "Why do agencies say AI citations take 6-12 months?",
    answer: `Because they are selling speed 3 (dominant share of voice on competitive prompts) as if it were the only speed. Speed 1 (same-day first-citation pickup) is real, but it does not justify a 12-month retainer. Most agency timeline framing is calibrated to the contract length they want to sell, not to how AI engines actually update their citation graphs.`,
  },
  {
    _key: "faq-04",
    question: "Why do other agencies say AI citations take 30 days?",
    answer: `The opposite framing problem. They are selling speed 1 (same-day pickup) as if it were speed 3. Same-day citation on a topical question is real. Same-day dominant share of voice on the most valuable buyer-intent prompts in your category is not. The 30-day promise lands a contract. The lack of speed-3 progress at month 4 is when the client churns.`,
  },
  {
    _key: "faq-05",
    question: "What is the difference between SEO and AEO timelines?",
    answer: `SEO and AEO ride the same underlying signals: schema, content quality, entity authority, internal linking, branded search. AEO is a layer on top of SEO that requires additional formatting choices (direct-answer paragraphs, FAQPage schema, parseable /answers directories). The fast speed (hours-to-a-day) is unique to AEO. Google traditional SEO does not get a new page to position 1 the same day it is published. The slow speed (months to dominant authority) is identical for both.`,
  },
  {
    _key: "faq-06",
    question: "What is the fastest path to first AI citation?",
    answer: `Publish a single sharp page that answers a specific question in the first 60 words, mark it up with Article and FAQPage schema, link to it from a page that already gets crawled, and pick a prompt that does not have a single-source winner already. Most B2B SaaS pages get this wrong by burying the answer beneath a hero banner and three paragraphs of brand context. The fast path runs on precision rather than volume.`,
  },
  {
    _key: "faq-07",
    question: "What if I am starting from a brand new website with no authority?",
    answer: `Speed 1 (same-day citation) will be harder for you. Speed 2 (consistent slot in cited sources) requires building the foundation in parallel with the citation work. Plan for 6 months before any of the three speeds start producing reliably. The mistake is launching a generic site and then hiring an AEO consultant afterward to "optimize for AI." Build the schema density, direct-answer paragraphs, structured FAQ, and entity-clear positioning into the site at launch. The first 6 months of AI citation work then happen during the site build rather than as a retrofit.`,
  },
];

// ─── Step 4: Direct answer (AEO-extractable summary; matches the TL;DR) ────
const directAnswer =
  `AI citations move at three different speeds. Hours to a day for first pickup on a well-structured page from a brand with modest authority. Weeks for a consistent slot in the cited-source set on a prompt that matters. Months for dominant share of voice on competitive prompt clusters and pipeline conversion. Most agencies sell the fast speed but bill for the slow speed.`;

// ─── Step 5: Build + commit the document ──────────────────────────────────
const now = new Date().toISOString();

const doc = {
  _id: DOC_ID,
  _type: "blogPost",
  slug: { _type: "slug", current: SLUG },
  name: "How Long Do AI Citations Take? The Three Speeds You Need to Know",
  metaTitle: "How Long Do AI Citations Take? (2026)",
  metaDescription:
    "AI citations move at three speeds: hours-to-a-day for first pickup, weeks for a consistent slot, months for dominant share of voice. Real Toku numbers inside.",
  excerpt:
    "AI citations move at three different speeds — and most agencies sell you the fast one while billing for the slow one. Real numbers from the Toku case study.",
  directAnswer,
  content,
  faq,
  thumbnail: {
    _type: "image",
    asset: { _type: "reference", _ref: asset._id },
    alt: "Three-speeds editorial illustration: Hours · 1 day (first citation pickup), Weeks (consistent slot in cited sources), Months (dominant share of voice). Receipt: Toku at 86% citation on stablecoin payroll prompt, position 2.4 average, over 6 months.",
  },
  author: { _type: "reference", _ref: "imported-teamMember-68d81a1688d5ed0743d0b8b6" },
  category: { _type: "reference", _ref: "imported-category-67bced3103339308260cf6a1" },
  publishedDate: now,
  lastUpdated: now,
  timeToRead: "9 min",
  featured: false,
};

console.log("Creating Sanity document...");
const result = await client.createOrReplace(doc);
console.log(`✓ ${result._id} (rev ${result._rev})`);
console.log(`  Live URL: https://www.loudface.co/blog/${SLUG}`);
console.log(`  Studio:   https://www.loudface.co/studio/structure/blogPost;${DOC_ID}`);
