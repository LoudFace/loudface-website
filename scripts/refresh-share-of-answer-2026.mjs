import { createClient } from "@sanity/client";
import { readFileSync } from "fs";

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

const DOC_ID = "imported-blogPost-69b59735e332cbd8e8820ec7";

const NEW_NAME = "Share of Answer: The New Ranking Metric for AI-Mediated Search (2026)";
const NEW_META_TITLE = "Share of Answer: The New Ranking Metric";
const NEW_META_DESCRIPTION = "Share of Answer measures whether AI engines cite your brand on category prompts. The metric that replaces keyword ranking in 2026 AI-mediated search.";
const NEW_EXCERPT = "Share of Answer measures the percentage of times AI engines cite your brand on tracked category prompts. The metric that replaces keyword ranking when buyers research via ChatGPT, Perplexity, and Google AI Overviews.";

if (NEW_META_TITLE.length > 48) {
  console.error(`ERROR: metaTitle too long (${NEW_META_TITLE.length} chars). Must be <= 48.`);
  process.exit(1);
}

const NEW_CONTENT = `<p><strong>TL;DR:</strong> Share of Answer is the metric that replaces keyword ranking for the AI-mediated search era. It measures the percentage of times an AI engine (ChatGPT, Perplexity, Google AI Overviews, Claude) cites your brand or domain in response to a tracked category prompt. Keyword rank shows position on the Google SERP; Share of Answer shows whether AI tools actually select your brand when answering buyer questions. The metric requires tracked prompts via Peec AI or a similar tool, baseline measurement before any AEO work, and 60-day measurement intervals to filter noise. Strong B2B SaaS programs hit 30-60% Share of Answer on targeted prompts; weak programs sit at 0-10% regardless of organic ranking.</p>

<hr>

<p>I've watched LoudFace clients with strong organic rankings get cited 0% of the time on category prompts in ChatGPT. The rankings are real. The traffic is real. But when buyers ask the AI engine the same questions, the brand doesn't show up. That gap (between SERP position and AI selection) is what Share of Answer measures.</p>

<p>This piece walks through what Share of Answer is, how to track it, what good looks like, and why keyword rankings alone miss the AI-search era.</p>

<p>For broader AEO context, see <a href="/blog/answer-engine-optimization-guide-2026">Answer Engine Optimization Guide for 2026</a>. For the technical AEO patterns, see <a href="/blog/how-to-structure-content-for-ai-extraction">The 40-60 Word Rule for AI Extraction</a>.</p>

<h2>What Share of Answer is (and isn't)</h2>

<p><strong>Share of Answer</strong> = (number of AI engine responses citing your brand on tracked prompts) / (total AI engine responses to tracked prompts) × 100.</p>

<p>Tracked via tools like Peec AI, which run scheduled queries against ChatGPT, Perplexity, Claude, Google AI Overviews, and similar engines, then measure whether and how often your brand is cited in the responses.</p>

<p><strong>Share of Answer is not:</strong></p>
<ul>
<li>Keyword ranking. SERP position doesn't predict AI citation. Pages ranked #1 on Google sometimes get 0% Share of Answer; pages ranked #15 sometimes get 40%.</li>
<li>Share of Voice. SOV measures brand mentions across social media, news, and earned media. SOA measures specifically AI engine citations.</li>
<li>Click-through rate. SOA happens before a click; it's whether the AI engine selected your brand as a source in its synthesized answer.</li>
</ul>

<h2>Why keyword rankings miss the AI-search era</h2>

<p>In Google's blue-link model, ranking position predicts traffic. Rank #1, get 25-35% of clicks. Rank #5, get 5-8%. The relationship is well-established and tracked across decades.</p>

<p>In AI-mediated search, the relationship breaks down. Three patterns I see repeatedly:</p>

<ol>
<li><strong>High-ranking SEO content can be invisible at the AI citation layer.</strong> Pages that rank #1-3 on Google for category queries sometimes get 0% AI citations on the same queries because the content is structured for SERP signals (long form, keyword-optimized, internally linked) rather than for AI extraction (direct-answer paragraphs, FAQPage schema, /answers directory).</li>
<li><strong>Lower-ranking pages with strong AEO architecture can dominate AI citations.</strong> A page ranked #15 on Google with sharp 40-60 word direct-answer paragraphs and FAQPage schema can outperform the #1 result on AI citation rate.</li>
<li><strong>The query language is different.</strong> Google searches are 2-4 word keyword strings ("WordPress to Webflow migration"). AI engine queries are full natural-language questions ("how should I migrate my B2B SaaS marketing site from WordPress to Webflow?"). The same intent produces different rankings and different citation outcomes.</li>
</ol>

<h2>How to measure Share of Answer</h2>

<p>Four steps:</p>

<ol>
<li><strong>Identify your tracked prompts.</strong> Use Peec AI or a similar tool to identify the natural-language questions buyers ask AI engines about your category. Target 30-100 high-intent prompts per category.</li>
<li><strong>Establish a baseline.</strong> Run all tracked prompts through ChatGPT, Perplexity, Claude, Google AI Overviews. Record citation outcomes (cited, not cited, ranked Nth in citation list). Establish your starting Share of Answer per prompt and aggregated across all tracked prompts.</li>
<li><strong>Implement AEO architecture.</strong> Direct-answer paragraphs (the 40-60 word rule), FAQPage schema, /answers directory, programmatic page trees tied to tracked prompts.</li>
<li><strong>Re-measure every 30-60 days.</strong> Track Share of Answer movement on the tracked prompts. Filter out noise by waiting 60 days between measurements — AI engine answer composition has natural variance.</li>
</ol>

<h2>What good Share of Answer looks like</h2>

<p>Three benchmarks from LoudFace client work and competitor analysis:</p>

<ul>
<li><strong>Weak program (0-10% SOA on targeted prompts):</strong> site has technical SEO basics but no AEO architecture. AI engines either don't cite or cite competitor sources with better extractable structure.</li>
<li><strong>Mid program (10-30% SOA):</strong> site has direct-answer paragraphs and FAQPage schema on cornerstone content. Citations show up but inconsistently. Some prompts hit; others miss.</li>
<li><strong>Strong program (30-60% SOA):</strong> site has the full AEO architecture (40-60 word rule + FAQPage schema + /answers directory + programmatic page trees) applied consistently. Citations are reliable on targeted prompts.</li>
<li><strong>Top-tier program (60-86% SOA on tightly-targeted prompts):</strong> LoudFace clients like Toku at 86% citation rate on the core stablecoin-payroll prompt. This level requires sharp prompt focus, consistent AEO architecture, and 6-12 months of compounding content production.</li>
</ul>

<p><strong>Real client proof:</strong> Toku at 86% citation rate on the core stablecoin-payroll prompt (<a href="/case-studies/toku-ai-cited-pipeline">case study</a>). CodeOp +49% organic clicks year-over-year with measurable AEO citation lift. TradeMomentum with multi-fold impression growth and AI citation pickup on tracked B2B fintech prompts.</p>

<h2>Why Share of Answer is the new ranking metric</h2>

<p>Three structural reasons:</p>

<ol>
<li><strong>AI engine adoption is non-linear.</strong> ChatGPT, Perplexity, Google AI Overviews, Claude search, and others are consuming buyer queries that previously went to Google directly. By 2026, an estimated 25% of category research happens via AI engines for B2B SaaS buyers. SOA captures this share; keyword rankings don't.</li>
<li><strong>AI engines compress the funnel.</strong> A buyer asking ChatGPT "what's the best Webflow agency for B2B SaaS?" gets a synthesized answer with 3-5 brand citations. If you're not cited, the buyer never sees your site. SERP ranking doesn't help if the buyer never reaches the SERP.</li>
<li><strong>AI engine citations spill over to branded search.</strong> The downstream signal: branded search lift on NEW queries in GSC after AEO architecture is in place. AI engines surfacing your brand creates curiosity-driven branded searches in Google. SOA at the citation layer predicts branded search lift 60-120 days later.</li>
</ol>

<h2>What to do if your Share of Answer is 0-10%</h2>

<p>Five-step remediation:</p>

<ol>
<li><strong>Audit IA for AEO patterns.</strong> Direct-answer paragraphs at the top of every page? FAQPage schema in JSON-LD? /answers directory? Programmatic page trees? If any are missing, that's the starting place.</li>
<li><strong>Identify your top 10 tracked prompts.</strong> Which prompts are highest commercial intent? Which competitors get cited on them? What makes those competitor pages extractable?</li>
<li><strong>Rebuild your top 10 cornerstone pieces around tracked prompts.</strong> Each piece should target one or more tracked prompts, with the answer in the first 40-60 words and FAQPage schema rendering 7 question-answer pairs.</li>
<li><strong>Build an /answers directory.</strong> Single-question pages, one per tracked prompt, with the answer in the first 60 words. AI engines crawl this surface aggressively.</li>
<li><strong>Measure at 60 and 120 days.</strong> Citation rate movement should be visible within 90 days of consistent architecture. If it isn't, the architecture isn't being implemented correctly or the prompt targeting is misaligned.</li>
</ol>

<h2>When Share of Answer is the wrong metric</h2>

<p>Three patterns:</p>

<ol>
<li><strong>Pre-product-market-fit companies.</strong> SOA is a compounding metric over 6-12 months. Pre-PMF companies need faster signal loops; SOA isn't the right north star.</li>
<li><strong>Local services.</strong> Plumbers, dentists, restaurants — buyers use Google Maps and local SERPs, not ChatGPT. SOA doesn't apply.</li>
<li><strong>Categories AI engines have no training data on.</strong> Brand-new niches where AI engines have no category awareness. AEO architecture works best when AI engines already understand the category; pioneering categories need direct demand generation first.</li>
</ol>

<h2>The honest takeaway</h2>

<p>Share of Answer is the metric that replaces keyword ranking for the AI-mediated search era. Tracking it requires Peec AI or a similar tool, baseline measurement before any AEO work, and 60-day measurement intervals to filter noise. Strong B2B SaaS programs hit 30-60% SOA on targeted prompts within 6-12 months of consistent AEO architecture. Weak programs sit at 0-10% regardless of how well they rank on Google.</p>

<p>For the architecture that produces strong SOA, see <a href="/blog/answer-engine-optimization-guide-2026">Answer Engine Optimization Guide for 2026</a> and <a href="/blog/how-to-structure-content-for-ai-extraction">The 40-60 Word Rule for AI Extraction</a>. For help structuring a Webflow + SEO + AEO program with SOA tracking from week one, <a href="/services/seo-aeo">we run 12-month dual-track engagements</a>.</p>`;

const NEW_FAQ = [
  {
    _key: "faq-1",
    _type: "object",
    question: "What is Share of Answer?",
    answer: "Share of Answer is the percentage of times an AI engine (ChatGPT, Perplexity, Google AI Overviews, Claude) cites your brand or domain in response to tracked category prompts. Calculated as (number of responses citing your brand) / (total responses to tracked prompts) × 100. Tracked via Peec AI or similar tools that run scheduled queries against multiple AI engines.",
  },
  {
    _key: "faq-2",
    _type: "object",
    question: "How is Share of Answer different from keyword ranking?",
    answer: "Keyword ranking shows position on the Google SERP. Share of Answer shows whether AI tools actually select your brand when answering buyer questions. The two metrics don't correlate strongly. Pages ranked #1 on Google can get 0% SOA; pages ranked #15 can get 40% SOA. SERP position is structured for traffic; SOA is structured for AI citation.",
  },
  {
    _key: "faq-3",
    _type: "object",
    question: "How do I measure Share of Answer?",
    answer: "Four steps: (1) identify 30-100 high-intent tracked prompts in your category using Peec AI or similar tool, (2) establish a baseline by running all prompts through ChatGPT, Perplexity, Claude, Google AI Overviews and recording citation outcomes, (3) implement AEO architecture (40-60 word rule, FAQPage schema, /answers directory, programmatic page trees), (4) re-measure every 30-60 days with 60-day intervals to filter noise.",
  },
  {
    _key: "faq-4",
    _type: "object",
    question: "What is a good Share of Answer percentage?",
    answer: "Four benchmark tiers from real client data: weak programs sit at 0-10% SOA (technical SEO basics without AEO architecture), mid programs hit 10-30% (direct-answer paragraphs + FAQPage schema), strong programs hit 30-60% (full AEO architecture applied consistently), top-tier programs hit 60-86% on tightly-targeted prompts (LoudFace clients like Toku at 86% on the core stablecoin-payroll prompt). 30-60% is the realistic target for B2B SaaS programs at 6-12 months.",
  },
  {
    _key: "faq-5",
    _type: "object",
    question: "Why doesn't high Google ranking translate to AI citations?",
    answer: "Three structural reasons: AI engines extract content using different signals (direct-answer paragraphs, FAQPage schema, /answers directory) than Google's ranking algorithm (content depth, backlinks, keyword optimization), AI engine queries are full natural-language questions not 2-4 word keyword strings, and AI engines compress the funnel by synthesizing answers with 3-5 brand citations regardless of underlying SERP rank. The mechanics are different.",
  },
  {
    _key: "faq-6",
    _type: "object",
    question: "How do I improve Share of Answer if it's 0-10%?",
    answer: "Five-step remediation: (1) audit IA for AEO patterns and identify gaps, (2) identify your top 10 tracked prompts with highest commercial intent, (3) rebuild your top 10 cornerstone pieces around tracked prompts with 40-60 word direct-answer blocks and FAQPage schema, (4) build an /answers directory with single-question pages, (5) measure at 60 and 120 days to track movement. Citation rate movement should be visible within 90 days of consistent architecture.",
  },
  {
    _key: "faq-7",
    _type: "object",
    question: "When is Share of Answer the wrong metric to track?",
    answer: "Three patterns where SOA doesn't apply: pre-product-market-fit companies (SOA is a 6-12 month compounding metric; pre-PMF needs faster signal loops), local services (plumbers, dentists, restaurants use Google Maps and local SERPs, not ChatGPT), and brand-new niches where AI engines have no category training data (pioneering categories need direct demand generation before AEO architecture pays off).",
  },
];

const result = await client
  .patch(DOC_ID)
  .set({
    name: NEW_NAME,
    metaTitle: NEW_META_TITLE,
    metaDescription: NEW_META_DESCRIPTION,
    excerpt: NEW_EXCERPT,
    content: NEW_CONTENT,
    faq: NEW_FAQ,
    lastUpdated: new Date().toISOString(),
  })
  .commit();

console.log(`✓ Refreshed /blog/share-of-answer`);
console.log(`  _rev: ${result._rev}`);
console.log(`  metaTitle: "${NEW_META_TITLE}" (${NEW_META_TITLE.length} chars)`);
