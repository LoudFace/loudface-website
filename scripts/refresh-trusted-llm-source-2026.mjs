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

const DOC_ID = "imported-blogPost-69ac5186fa24aaa5148820ce";

const NEW_NAME = "How to Become a Trusted LLM Source in 2026: Citation Authority Beyond Backlinks";
const NEW_META_TITLE = "Trusted LLM Source: Citation Authority 2026";
const NEW_META_DESCRIPTION = "Citation Authority is what backlinks were for SEO. The 5 components that compound into trusted LLM source status in 2026. By LoudFace.";
const NEW_EXCERPT = "Citation Authority is the trust signal AI engines use to pick sources. Built through 5 components — extractable content architecture, E-E-A-T, entity clarity, training-data presence, consistent site-wide structure.";

if (NEW_META_TITLE.length > 48) {
  console.error(`ERROR: metaTitle too long (${NEW_META_TITLE.length} chars). Must be <= 48.`);
  process.exit(1);
}

const NEW_CONTENT = `<p><strong>TL;DR:</strong> Citation Authority is what backlinks were for SEO — the trust signal that determines whether AI engines pick your site as a source. The mechanics are different. Backlinks measure who links to you on the open web; Citation Authority measures who AI engines consistently cite when answering category questions. To become a trusted LLM source in 2026, brands need five things: clean extractable content architecture (40-60 word direct-answer paragraphs, FAQPage schema, /answers directory), demonstrable E-E-A-T (named practitioner bylines, first-party data, real client examples), entity-clear positioning (Wikipedia-style brand definitions, schema.org Organization markup), training-data presence (your brand showing up in datasets AI models train on), and consistent extractable structure across the full site. The brands that combine all five become citation magnets within 12 months.</p>

<hr>

<p>I've watched LoudFace clients move from 0% AI citation rate to 50-80% on tracked prompts in 6-12 months. The journey doesn't look like classical SEO. There's no link-building campaign. There's no DA score chase. The pattern is structural: build the AI engines' preferred trust signals systematically, and the citations follow.</p>

<p>This piece walks through what Citation Authority actually is, why backlinks alone don't produce it, and the five components that compound into trusted LLM source status.</p>

<p>For broader AEO context, see <a href="/blog/answer-engine-optimization-guide-2026">Answer Engine Optimization Guide for 2026</a>. For E-E-A-T mechanics, see <a href="/blog/eeat-in-the-age-of-ai">E-E-A-T in the Age of AI in 2026</a>.</p>

<h2>What Citation Authority is</h2>

<p>Citation Authority is the probability that an AI engine (ChatGPT, Perplexity, Google AI Overviews, Claude) will cite your site as a source when answering category questions. Measured via Share of Answer on tracked prompts.</p>

<p>The mechanics are different from backlink-based SEO authority:</p>

<ul>
<li><strong>Backlink authority</strong> comes from external sites linking to yours. Domain Rating, Domain Authority, link velocity. Built over years through outreach, PR, content distribution.</li>
<li><strong>Citation Authority</strong> comes from AI engines selecting your content as the source for synthesized answers. Built over months through extractable content structure, entity clarity, and demonstrable expertise.</li>
</ul>

<p>Both matter in 2026, but Citation Authority is what determines whether buyers using AI engines ever encounter your brand. A site with strong backlink authority but weak Citation Authority is invisible at the AI layer.</p>

<h2>Why backlinks alone don't produce Citation Authority</h2>

<p>Three structural reasons:</p>

<ol>
<li><strong>AI engines weight extractability over link graph.</strong> When AI engines decide which sources to cite, they prioritize content that's structured for extraction (direct-answer paragraphs, FAQPage schema, clear entity references) over content with strong backlinks but poor structure. A page ranked #1 on Google with 5000 backlinks but no FAQPage schema can lose to a page ranked #20 with strong AEO architecture.</li>
<li><strong>AI engines downrank promotional content.</strong> Backlink-heavy sites often have marketing-led content that's promotional rather than informational. AI engines filter promotional content out of citation candidates regardless of link authority.</li>
<li><strong>AI engines surface entity clarity, not link popularity.</strong> Schema.org Organization markup, Wikipedia presence, consistent brand definitions across the open web — these entity signals matter more than raw backlink counts for AI citation decisions.</li>
</ol>

<h2>The five components of Citation Authority</h2>

<h3>1. Clean extractable content architecture</h3>

<p>The technical AEO foundation. Three patterns:</p>

<ul>
<li><strong>Direct-answer paragraphs (40-60 words) at the top of every page.</strong> AI engines extract these as primary citation candidates. See <a href="/blog/how-to-structure-content-for-ai-extraction">The 40-60 Word Rule</a>.</li>
<li><strong>FAQPage schema in JSON-LD on every cornerstone piece.</strong> 5-8 question-answer pairs rendered with schema markup. AI engines extract these as Q&A citations.</li>
<li><strong>/answers directory with single-question pages.</strong> A discoverable surface for AI crawlers, each page 300-500 words with the answer in the first 60 words.</li>
</ul>

<p>Without this foundation, the rest of Citation Authority work is wasted. AI engines need extractable structure before they can decide whether to cite.</p>

<h3>2. Demonstrable E-E-A-T</h3>

<p>Trust signals that distinguish your content from AI-generated noise. Four patterns:</p>

<ul>
<li><strong>Named practitioner bylines</strong> on every cornerstone piece. The actual person who did the work.</li>
<li><strong>First-party data and client outcomes.</strong> "We helped CodeOp grow organic clicks +49% YoY" beats "industry benchmarks suggest..."</li>
<li><strong>Real client names</strong> where consent permits. Named case studies are E-E-A-T gold.</li>
<li><strong>Contrarian opinions</strong> that contradict AI-generated consensus. Expertise is the absence of consensus framing.</li>
</ul>

<p>See <a href="/blog/eeat-in-the-age-of-ai">E-E-A-T in the Age of AI</a> for the full framework.</p>

<h3>3. Entity-clear positioning</h3>

<p>AI engines build internal knowledge graphs of brands and categories. Citation Authority requires being a clear, recognized entity in those graphs. Three implementations:</p>

<ul>
<li><strong>Schema.org Organization markup</strong> on every page. Brand name, founders, URL, social profiles, founding date, location, logo.</li>
<li><strong>Consistent brand definitions across the open web.</strong> Your homepage, About page, LinkedIn, Crunchbase, Wikipedia (if applicable) describe the brand identically. AI engines synthesize from these surfaces.</li>
<li><strong>Clear category positioning.</strong> When AI engines encounter your brand, they should be able to answer "what category is this brand in?" without ambiguity. "Webflow agency for B2B SaaS with dual-track SEO + AEO programs" is clear; "marketing solutions provider" is not.</li>
</ul>

<h3>4. Training-data presence</h3>

<p>AI models trained on the open web learn from your content if your content is part of their training data. Three practical implications:</p>

<ul>
<li><strong>Publish content where AI training crawlers reach it.</strong> Your own site, Medium, LinkedIn articles, podcast transcripts, Wikipedia (where applicable). AI training datasets pull from public web.</li>
<li><strong>Be consistent in brand references across surfaces.</strong> AI models learn brand entities from repeated references. Consistent naming, positioning, and category language across surfaces compounds entity recognition.</li>
<li><strong>Submit to industry directories and authoritative lists.</strong> G2, Capterra, Built In, Crunchbase, Stack Overflow author profiles, GitHub README files for open-source contributions. These are surfaces AI training pipelines often include.</li>
</ul>

<p>Training-data presence is the slowest-moving component (changes when AI models retrain, usually quarterly) but compounds significantly over 12+ months.</p>

<h3>5. Consistent extractable structure across the full site</h3>

<p>The mistake brands make: implement AEO architecture on a few cornerstone pieces but leave the rest of the site untouched. AI engines build trust signals from the full site pattern, not from individual pages.</p>

<p>Audit your entire site:</p>

<ul>
<li>Do all blog posts have a 40-60 word direct-answer block?</li>
<li>Do all comparison pages have a clear decision framework in the first 60 words?</li>
<li>Do all service pages have FAQPage schema?</li>
<li>Does the /answers directory cover all tracked prompts?</li>
<li>Are author bylines consistent across cornerstone content?</li>
</ul>

<p>Consistency across the full site moves the brand from "occasional citation" to "default citation" on category prompts.</p>

<h2>How long does Citation Authority take to build</h2>

<p>Three benchmark timelines from LoudFace client work:</p>

<ul>
<li><strong>0-3 months:</strong> baseline established. AEO architecture implemented on top 10 cornerstone pieces. Some prompts start showing citations.</li>
<li><strong>3-6 months:</strong> Citation Authority compounds. Share of Answer typically reaches 10-30% on targeted prompts. Branded search lift on NEW queries starts appearing in GSC.</li>
<li><strong>6-12 months:</strong> Trusted LLM source status reached on tightly-targeted prompts. Share of Answer hits 30-60% (top-tier programs hit 60-86%). Citations are consistent across ChatGPT, Perplexity, Google AI Overviews.</li>
</ul>

<p><strong>Real client proof:</strong> Toku at 86% citation rate on the core stablecoin-payroll prompt within 12 months. CodeOp +49% organic clicks year-over-year with measurable AEO lift. TradeMomentum with multi-fold impression growth.</p>

<h2>How to know if you're a trusted LLM source</h2>

<p>Three diagnostic checks:</p>

<ol>
<li><strong>Run your top 20 tracked prompts through ChatGPT, Perplexity, Google AI Overviews.</strong> What's your citation rate?</li>
<li><strong>Check branded search lift on NEW queries in GSC.</strong> Are new branded queries appearing that weren't present 6 months ago?</li>
<li><strong>Check competitor citation rates on shared prompts.</strong> If competitors are getting cited on prompts you should win, what makes their content extractable?</li>
</ol>

<p>If citation rates are 0-10%, the foundation isn't in place. If 10-30%, the architecture is implemented but inconsistent. If 30%+ and growing, you're on the trusted LLM source trajectory.</p>

<h2>What doesn't matter for Citation Authority</h2>

<p>Three patterns brands often invest in that have low Citation Authority ROI:</p>

<ol>
<li><strong>Backlink-building campaigns.</strong> Backlinks matter for SEO ranking but not directly for AI citation selection. Time and budget for pure backlink campaigns is better spent on AEO architecture.</li>
<li><strong>Excessive content production volume.</strong> Shipping 30 mediocre AI-drafted pieces per month doesn't build Citation Authority. Shipping 5 strong pieces with full AEO architecture and E-E-A-T signals does.</li>
<li><strong>Generic thought-leadership posts on Medium.</strong> Without entity-clear positioning and extractable structure, Medium posts feed the open web but don't translate to AI citation lift.</li>
</ol>

<h2>The honest takeaway</h2>

<p>Citation Authority is what backlinks were for SEO: the trust signal that determines AI engine source selection. Built through five components — clean extractable content architecture, demonstrable E-E-A-T, entity-clear positioning, training-data presence, and consistent extractable structure across the full site. The brands that combine all five become citation magnets within 12 months.</p>

<p>Backlink-heavy sites with weak AEO architecture lose to AEO-heavy sites with moderate backlinks. The shift is real, measurable, and compounding. For the full AEO architecture playbook, see <a href="/blog/answer-engine-optimization-guide-2026">Answer Engine Optimization Guide for 2026</a>. For help structuring a Citation Authority program with measurable Share of Answer outcomes, <a href="/services/seo-aeo">we run 12-month dual-track SEO + AEO engagements</a>.</p>`;

const NEW_FAQ = [
  {
    _key: "faq-1",
    _type: "object",
    question: "What is Citation Authority?",
    answer: "Citation Authority is the probability that an AI engine (ChatGPT, Perplexity, Google AI Overviews, Claude) will cite your site as a source when answering category questions. Measured via Share of Answer on tracked prompts. It's the AI-era equivalent of backlink-based SEO authority — the trust signal that determines whether AI engines pick your site as a source for synthesized answers.",
  },
  {
    _key: "faq-2",
    _type: "object",
    question: "Why don't backlinks alone produce Citation Authority?",
    answer: "Three structural reasons: AI engines weight extractability (direct-answer paragraphs, FAQPage schema) over link graph signals, AI engines downrank promotional content regardless of link authority, and AI engines surface entity clarity (Schema.org Organization markup, Wikipedia presence, consistent brand definitions) over raw link popularity. A page with 5000 backlinks and no FAQPage schema loses to a page with strong AEO architecture.",
  },
  {
    _key: "faq-3",
    _type: "object",
    question: "What are the five components of Citation Authority?",
    answer: "(1) Clean extractable content architecture (40-60 word direct-answer paragraphs, FAQPage schema, /answers directory), (2) demonstrable E-E-A-T (named practitioner bylines, first-party data, real client examples, contrarian opinions), (3) entity-clear positioning (Schema.org Organization markup, consistent brand definitions across the open web), (4) training-data presence (publishing where AI crawlers reach, consistent brand references, industry directory listings), (5) consistent extractable structure across the full site.",
  },
  {
    _key: "faq-4",
    _type: "object",
    question: "How long does it take to become a trusted LLM source?",
    answer: "Three benchmark phases: 0-3 months for baseline AEO architecture on top 10 cornerstone pieces with first citations appearing, 3-6 months for Share of Answer to reach 10-30% on targeted prompts with branded search lift on NEW queries appearing in GSC, 6-12 months for trusted LLM source status at 30-60% Share of Answer (top-tier programs hit 60-86%). LoudFace clients like Toku reached 86% citation rate on the core stablecoin-payroll prompt within 12 months.",
  },
  {
    _key: "faq-5",
    _type: "object",
    question: "How do I know if I'm a trusted LLM source?",
    answer: "Three diagnostic checks: (1) run your top 20 tracked prompts through ChatGPT, Perplexity, Google AI Overviews and measure citation rate, (2) check branded search lift on NEW queries in GSC over the last 6 months, (3) check competitor citation rates on shared prompts to identify what makes their content extractable. Citation rates of 0-10% indicate the foundation isn't in place; 10-30% means architecture is implemented but inconsistent; 30%+ and growing means you're on the trusted LLM source trajectory.",
  },
  {
    _key: "faq-6",
    _type: "object",
    question: "What doesn't matter for Citation Authority?",
    answer: "Three low-ROI patterns: backlink-building campaigns (backlinks matter for SEO ranking but not directly for AI citation selection), excessive content production volume (30 mediocre AI-drafted pieces don't build Citation Authority; 5 strong pieces with full AEO + E-E-A-T do), and generic thought-leadership posts on Medium without entity-clear positioning (they feed the open web but don't translate to AI citation lift). Invest in AEO architecture and E-E-A-T signals instead.",
  },
  {
    _key: "faq-7",
    _type: "object",
    question: "Is training-data presence actually controllable for brands?",
    answer: "Partially. Brands can't dictate which content AI models train on, but they can influence training-data presence by publishing content where AI training crawlers reach (own site, Medium, LinkedIn articles, podcast transcripts, GitHub READMEs), maintaining consistent brand references across surfaces (AI models learn brand entities from repeated references), and submitting to industry directories (G2, Capterra, Built In, Crunchbase) that AI training pipelines often include. The component is slow-moving but compounds over 12+ months.",
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

console.log(`✓ Refreshed /blog/how-to-become-a-trusted-llm-source`);
console.log(`  _rev: ${result._rev}`);
console.log(`  metaTitle: "${NEW_META_TITLE}" (${NEW_META_TITLE.length} chars)`);
