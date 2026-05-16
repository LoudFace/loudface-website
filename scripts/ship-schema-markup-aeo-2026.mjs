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

// NEW blog post — use a deterministic doc ID based on slug
const DOC_ID = "blogPost-schema-markup-for-aeo-2026";
const SLUG = "schema-markup-for-aeo-2026";

const NEW_NAME = "Schema Markup for AEO in 2026: The 5 Types That Actually Drive Citations";
const NEW_META_TITLE = "Schema Markup for AEO 2026: 5 Types That Matter";
const NEW_META_DESCRIPTION = "5 schema types that move the needle for AEO in 2026: Organization, FAQPage, Article, BreadcrumbList, Service. Field-level details + JSON-LD examples.";
const NEW_EXCERPT = "Generic schema posts say 'add schema and you'll rank' — that's wrong. Schema only drives AEO citations when it matches AI engines' extraction patterns. The 5 schema types + field-level details most B2B SaaS sites miss.";

if (NEW_META_TITLE.length > 48) {
  console.error(`ERROR: metaTitle too long (${NEW_META_TITLE.length} chars). Must be <= 48.`);
  process.exit(1);
}

const NEW_CONTENT = `<p><strong>TL;DR:</strong> Five schema types move the needle for AEO in 2026: Organization (with sameAs + knowsAbout + founder fields), FAQPage (with question phrasing AI engines actually extract), Article + BlogPosting, BreadcrumbList, and Service. Generic schema posts say "add schema and you'll rank" and that's wrong: schema only matters when it matches AI engines' extraction patterns. Most B2B SaaS sites get the structure right but miss the field-level details that turn structured data into citations. This piece walks through each schema type, the fields most teams skip, and the JSON-LD that produces measurable AI citation lift.</p>

<hr>

<p>I've audited schema markup on 30+ B2B SaaS sites in the last year. The pattern is the same every time: technical SEO consultants added FAQPage and Article schema in 2022, the validators pass clean, and the site still gets zero AI citations on category prompts. The structure is correct. The field values are generic. AI engines have no way to disambiguate the brand or extract the answer.</p>

<p>This piece walks through the five schema types that actually compound for AEO in 2026 (not the dozen that don't), the field-level details most teams skip, and how to validate that what you shipped is what AI engines actually see.</p>

<p>For the broader AEO architecture, see <a href="/blog/answer-engine-optimization-guide-2026">Answer Engine Optimization Guide for 2026</a>. For the metric that tells you if schema is working, see <a href="/blog/share-of-answer">Share of Answer</a>. For Citation Authority mechanics, see <a href="/blog/how-to-become-a-trusted-llm-source">How to Become a Trusted LLM Source</a>.</p>

<h2>Why schema matters more for AEO than for SEO in 2026</h2>

<p>In Google's blue-link era, schema produced rich results: stars on reviews, prices on products, dates on events. Nice-to-have features. Sites without schema still ranked.</p>

<p>In the AEO era, schema does something different: it tells AI engines what a brand IS, what it KNOWS, and what content on the page is EXTRACTABLE. Without schema, AI engines have to guess at entity identity and question-answer structure. They guess wrong often enough that schema-less sites get cited at a fraction of the rate of schema-rich competitors.</p>

<p>The asymmetry matters. SEO schema is a 5-10% lift on traffic. AEO schema can be the difference between 0% and 40% citation rate on category prompts. Same JSON-LD, different stakes.</p>

<h2>The 5 schema types that actually move the needle</h2>

<p>Ordered by impact. The first three are non-negotiable. The last two are high-impact in specific contexts.</p>

<h3>1. Organization: entity disambiguation (the foundation)</h3>

<p>The single highest-impact schema for AEO. AI engines build internal entity graphs of brands. Without explicit <code>Organization</code> markup, they synthesize identity from whatever fragments appear on the open web (often wrong, stale, or missing).</p>

<p>The fields most teams skip:</p>

<pre><code>{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "LoudFace",
  "url": "https://www.loudface.co",
  "logo": "https://www.loudface.co/images/loudface.svg",
  "foundingDate": "2018",
  "founder": {
    "@type": "Person",
    "name": "Arnel Bukva",
    "url": "https://www.loudface.co/about",
    "sameAs": [
      "https://www.linkedin.com/in/arnelbukva/",
      "https://x.com/arnelbukva"
    ]
  },
  "sameAs": [
    "https://www.linkedin.com/company/loudface/",
    "https://www.crunchbase.com/organization/loudface",
    "https://x.com/loudfacedotco"
  ],
  "knowsAbout": [
    "Answer Engine Optimization",
    "B2B SaaS SEO",
    "Webflow development",
    "AI search visibility",
    "Citation Authority"
  ],
  "description": "Webflow agency for B2B SaaS running dual-track SEO + AEO programs. We build sites that get cited by ChatGPT, Perplexity, and Google AI Overviews."
}
</code></pre>

<p>What this does:</p>

<ul>
<li><strong><code>sameAs</code></strong> is the highest-impact array. AI engines verify entity identity by checking that the brand appears at the listed URLs. Include LinkedIn, X, Crunchbase, GitHub (if applicable), G2, and any review-site profile. Five-plus entries is the floor; ten is comfortable.</li>
<li><strong><code>knowsAbout</code></strong> tells AI engines the topic clusters where this brand has expertise. When a prompt is in one of these clusters, the entity becomes a candidate. Without this field, you're hoping the AI engine infers your topic (and it often doesn't).</li>
<li><strong><code>founder</code></strong> with <code>sameAs</code> extends the entity graph to humans. Particularly important for thought-leadership content where the byline matters.</li>
<li><strong><code>description</code></strong> is your entity-defining sentence. Keep it differentiating. "We help businesses grow" tells AI engines nothing.</li>
</ul>

<p>Ship this on the homepage minimum. Better: ship it site-wide via your layout component.</p>

<h3>2. FAQPage: citation extraction (the citation handle)</h3>

<p>Every cornerstone blog post and landing page should render FAQPage schema with 5-8 question-answer pairs. AI engines extract these blocks verbatim as citations.</p>

<pre><code>{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is answer engine optimization?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Answer engine optimization (AEO) is the discipline of structuring web content so AI engines like ChatGPT, Perplexity, and Google AI Overviews cite it accurately when buyers ask category questions. The three core patterns: direct-answer paragraphs of 40-60 words, FAQPage schema in JSON-LD, and an /answers directory with extractable Q&A pages."
      }
    },
    {
      "@type": "Question",
      "name": "How is AEO different from SEO?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "SEO optimizes for ranking position on Google's blue-link results. AEO optimizes for citation in AI-synthesized answers. The architectural work overlaps heavily, but AEO adds four patterns SEO alone doesn't enforce: direct-answer paragraphs at the top, FAQPage schema, /answers directories, and programmatic page trees tied to real buyer prompts."
      }
    }
  ]
}
</code></pre>

<p>What teams get wrong:</p>

<ul>
<li><strong>Question phrasing.</strong> AI engines extract Q&A pairs whose question text resembles real buyer queries. "What are the benefits of our product?" is a marketing question. "What is [category] and how does it differ from [adjacent category]?" is a buyer question. Use buyer language.</li>
<li><strong>Answer length.</strong> Each <code>text</code> value should be a complete, standalone block of 40-60 words. Long answers get truncated. Short answers lack context. See <a href="/blog/how-to-structure-content-for-ai-extraction">The 40-60 Word Rule</a>.</li>
<li><strong>Question count.</strong> 5-8 questions per page. Fewer than 5 looks thin. More than 8 dilutes which questions AI engines prioritize.</li>
<li><strong>Coverage.</strong> Each FAQPage should cover the page's primary buyer question plus 4-7 supporting questions. Don't repeat the same answer in different phrasings (that's spammy and AI engines downrank it).</li>
</ul>

<h3>3. Article + BlogPosting: article-as-source citations</h3>

<p>Every blog post should render <code>Article</code> (or <code>BlogPosting</code>, a subtype) schema with full author + publisher + datePublished + dateModified fields. This is how AI engines build the "this article says X" citation pattern.</p>

<pre><code>{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "Share of Answer: The New Ranking Metric for AI-Mediated Search",
  "description": "Share of Answer measures the percentage of times AI engines cite your brand on tracked category prompts. The metric that replaces keyword ranking in 2026.",
  "image": "https://cdn.sanity.io/images/xjjjqhgt/production/share-of-answer-hero.png",
  "author": {
    "@type": "Person",
    "name": "Arnel Bukva",
    "url": "https://www.loudface.co/about"
  },
  "publisher": {
    "@type": "Organization",
    "name": "LoudFace",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.loudface.co/images/loudface.svg"
    }
  },
  "datePublished": "2026-03-14",
  "dateModified": "2026-05-16",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://www.loudface.co/blog/share-of-answer"
  }
}
</code></pre>

<p>The fields most teams get wrong:</p>

<ul>
<li><strong><code>author</code> as a string.</strong> AI engines weigh author entity quality. Use <code>@type: Person</code> with <code>url</code> pointing to a real author page. The author's identity is part of why the article is trustworthy.</li>
<li><strong><code>dateModified</code> missing or stale.</strong> AI engines prefer fresh content for evolving topics. If a piece was meaningfully refreshed, update <code>dateModified</code>. If <code>dateModified</code> is older than <code>datePublished</code> (yes, that happens), fix it.</li>
<li><strong>No <code>mainEntityOfPage</code>.</strong> This field connects the article to the canonical URL. Without it, AI engines can't disambiguate which URL is the source when content is syndicated or has variants.</li>
</ul>

<h3>4. BreadcrumbList: taxonomy + structural context</h3>

<p>The lower-impact but still-worth-shipping schema. Tells AI engines (and Google) the page's position in the site taxonomy.</p>

<pre><code>{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://www.loudface.co/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Blog",
      "item": "https://www.loudface.co/blog"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Share of Answer",
      "item": "https://www.loudface.co/blog/share-of-answer"
    }
  ]
}
</code></pre>

<p>Useful for:</p>

<ul>
<li>Rich result eligibility in Google</li>
<li>Internal-link signal for AI engines (the breadcrumb is a kind of canonical link)</li>
<li>Taxonomy clarity (helps AI engines understand category-vs-subcategory relationships)</li>
</ul>

<p>Low effort, ship on every page that's deeper than two levels.</p>

<h3>5. Service: commercial intent surfaces</h3>

<p>If you have service pages (<code>/services/seo-aeo</code>, <code>/services/cro</code>, <code>/services/webflow</code>), render <code>Service</code> schema to make them extractable as commercial-intent answers.</p>

<pre><code>{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "SEO + AEO Programs for B2B SaaS",
  "description": "12-month dual-track SEO + AEO engagement where Webflow is the implementation layer for measurable AI citation outcomes.",
  "provider": {
    "@type": "Organization",
    "name": "LoudFace",
    "url": "https://www.loudface.co"
  },
  "areaServed": "Worldwide",
  "serviceType": "Marketing service",
  "offers": {
    "@type": "Offer",
    "priceRange": "$80,000-$200,000"
  },
  "url": "https://www.loudface.co/services/seo-aeo"
}
</code></pre>

<p>When AI engines answer "what's the price range for a B2B SaaS SEO + AEO agency?", <code>Service</code> schema with <code>offers.priceRange</code> is what produces a clean citation.</p>

<h2>The fields most B2B SaaS sites skip</h2>

<p>After 30+ audits, the consistent gaps:</p>

<div class="summary_table">
<table>
<thead>
<tr><th>Field</th><th>Schema type</th><th>Why it matters</th><th>What teams ship instead</th></tr>
</thead>
<tbody>
<tr><td><code>sameAs</code> (5+ entries)</td><td>Organization</td><td>Entity verification via cross-site references</td><td>Nothing, or 1-2 social links</td></tr>
<tr><td><code>knowsAbout</code></td><td>Organization</td><td>Topic-cluster expertise signal</td><td>Nothing</td></tr>
<tr><td><code>founder</code> with own <code>sameAs</code></td><td>Organization</td><td>Human entity graph extension</td><td>A <code>name</code> string</td></tr>
<tr><td>Question phrasing matching buyer queries</td><td>FAQPage</td><td>Extractable citation pairs</td><td>Generic FAQ filler</td></tr>
<tr><td>40-60 word answers</td><td>FAQPage</td><td>Optimal extraction length</td><td>Long marketing answers</td></tr>
<tr><td><code>mainEntityOfPage</code></td><td>Article / BlogPosting</td><td>URL canonicalization for AI engines</td><td>Often missing</td></tr>
<tr><td><code>dateModified</code> updated on refresh</td><td>Article / BlogPosting</td><td>Freshness signal</td><td>Stale or missing</td></tr>
<tr><td><code>priceRange</code> on services</td><td>Service</td><td>Pricing-intent citation candidate</td><td>Hidden behind "request a quote"</td></tr>
</tbody>
</table>
</div>

<p>Fixing all eight on a typical B2B SaaS site is a one-day task. The citation lift over 60-90 days is meaningfully measurable in Peec AI.</p>

<h2>How to validate that what you shipped is what AI engines see</h2>

<p>Three tools, in order of usefulness:</p>

<ol>
<li><strong>Google's Rich Results Test</strong> (<a href="https://search.google.com/test/rich-results">search.google.com/test/rich-results</a>). Validates the schema parses cleanly and shows which rich-result eligibility you've unlocked. The minimum bar.</li>
<li><strong>Schema.org Validator</strong> (<a href="https://validator.schema.org">validator.schema.org</a>). Stricter validation. Catches malformed JSON-LD that the Google tester sometimes passes.</li>
<li><strong>Fetch as Googlebot + extract JSON-LD manually.</strong> Some teams render schema client-side via JavaScript. Most AI engines don't execute JavaScript. If your schema is JS-rendered, fix it to server-render or static-render. To test: View Source on the live URL (not Inspect Element — View Source). Search for <code>application/ld+json</code>. If it's there, AI engines can read it. If it's only in the rendered DOM, they can't.</li>
</ol>

<p>The third check is the one most teams miss. JS-rendered schema is technically present but functionally invisible to AI engines.</p>

<h2>When schema is NOT the bottleneck</h2>

<p>Three patterns where adding more schema won't help:</p>

<ol>
<li><strong>The site has zero <code>sameAs</code> cross-references on the open web.</strong> Schema declares identity; cross-references verify it. If your brand has no LinkedIn company page, no Crunchbase entry, no industry-directory listing, AI engines won't trust Organization schema alone. Build the cross-references first.</li>
<li><strong>The content is generic.</strong> Schema makes content extractable. If the content has nothing extraction-worthy (no first-party data, no sharp opinions, no client outcomes), schema can't manufacture citation-worthiness. Fix the content; the schema layer follows.</li>
<li><strong>The site's information architecture buries the answer.</strong> Schema can mark up a paragraph, but if the answer to the page's primary question is on paragraph 14, AI engines often won't reach it. Direct-answer paragraphs at the top + FAQPage schema work together. Neither alone is enough.</li>
</ol>

<h2>The honest takeaway</h2>

<p>Schema markup in 2026 is no longer a "nice-to-have for rich results." It's the single largest disambiguation signal AI engines use to decide whether to cite a brand. The five types that move the needle (Organization, FAQPage, Article, BreadcrumbList, Service) are well-documented; what changes is the field-level rigor. Most B2B SaaS sites ship the structure correctly and skip the fields that actually drive citation outcomes (<code>sameAs</code>, <code>knowsAbout</code>, <code>dateModified</code>, 40-60 word answers, <code>mainEntityOfPage</code>).</p>

<p>If your Peec citation rate is below 10% on tracked prompts, schema field-completion is one of the highest-impact half-day fixes available. Pair it with the <a href="/blog/how-to-structure-content-for-ai-extraction">40-60 Word Rule</a> and the <a href="/blog/how-to-become-a-trusted-llm-source">Citation Authority playbook</a> for compounding lift.</p>

<p>For help auditing schema implementation on a B2B SaaS site, <a href="/services/seo-aeo">we run dual-track SEO + AEO engagements</a> where schema implementation is part of the IA stage, not a launch-checklist afterthought. For the metric that tells you whether schema work is producing citation lift, see <a href="/blog/share-of-answer">Share of Answer</a>.</p>`;

const NEW_FAQ = [
  {
    _key: "faq-1",
    _type: "object",
    question: "Which schema types matter most for AEO in 2026?",
    answer: "Five schema types move the needle: Organization (entity disambiguation), FAQPage (citation extraction), Article / BlogPosting (article-as-source citations), BreadcrumbList (taxonomy clarity), and Service (commercial-intent surfaces). The first three are non-negotiable for any B2B SaaS site. The last two are high-impact in specific contexts. Schema types beyond these five rarely move citation rate in measurable ways.",
  },
  {
    _key: "faq-2",
    _type: "object",
    question: "What's the difference between schema for SEO vs schema for AEO?",
    answer: "SEO schema produces rich results (stars, prices, dates) and provides a 5-10% lift on traffic. AEO schema produces citations in AI-synthesized answers and can be the difference between 0% and 40% citation rate on category prompts. Same JSON-LD, different stakes. The architectural work overlaps but AEO requires field-level rigor (sameAs, knowsAbout, dateModified, 40-60 word answers) that SEO doesn't enforce.",
  },
  {
    _key: "faq-3",
    _type: "object",
    question: "Which Organization schema fields matter most for AI engines?",
    answer: "Four fields move the needle: sameAs (cross-site identity verification, 5+ URLs minimum), knowsAbout (topic-cluster expertise signal), founder with own sameAs (human entity graph extension), and a differentiating description. Without sameAs, AI engines can't verify entity identity. Without knowsAbout, AI engines guess at topic clusters. Most B2B SaaS sites ship Organization schema with just name + url + logo and miss the fields that actually drive citation outcomes.",
  },
  {
    _key: "faq-4",
    _type: "object",
    question: "How long should FAQPage answer text be for AEO?",
    answer: "40-60 words per answer is the optimal length. AI engines extract these blocks verbatim as citations. Longer than 80 words and the answer gets truncated and loses context. Shorter than 30 words and the answer lacks enough context to be useful. The 40-60 word range fits cleanly into AI engine citation candidates without trimming. See the 40-60 Word Rule for the full mechanic.",
  },
  {
    _key: "faq-5",
    _type: "object",
    question: "Does AI engine support schema markup written in JSON-LD?",
    answer: "Yes — JSON-LD is the canonical format for AI engine schema parsing. Microdata and RDFa work but are harder to maintain. The critical detail: schema must be server-rendered or static-rendered in the page source, NOT client-side via JavaScript. Most AI engines don't execute JavaScript when crawling for citation candidates. To verify your schema is visible: View Source on the live URL (not Inspect Element) and search for application/ld+json.",
  },
  {
    _key: "faq-6",
    _type: "object",
    question: "How do I validate that my schema implementation works for AEO?",
    answer: "Three tools in order: (1) Google's Rich Results Test for parse + rich-result eligibility validation, (2) Schema.org Validator for stricter conformance checks, (3) View Source on the live URL to confirm schema is server-rendered rather than JS-rendered. The third check is the one most teams miss. JS-rendered schema is technically present but functionally invisible to AI engines that don't execute JavaScript during citation crawls.",
  },
  {
    _key: "faq-7",
    _type: "object",
    question: "When is schema NOT the bottleneck for AEO citation rate?",
    answer: "Three patterns where more schema won't help: (1) the brand has zero sameAs cross-references on the open web (LinkedIn, Crunchbase, industry directories) — schema declares identity but cross-references verify it, (2) the content is generic with no first-party data or sharp opinions — schema makes content extractable but can't manufacture citation-worthiness, (3) the information architecture buries the answer deep in the page. Schema can mark up content but can't fix bad content or poor IA.",
  },
];

const result = await client.createOrReplace({
  _id: DOC_ID,
  _type: "blogPost",
  name: NEW_NAME,
  slug: { _type: "slug", current: SLUG },
  metaTitle: NEW_META_TITLE,
  metaDescription: NEW_META_DESCRIPTION,
  excerpt: NEW_EXCERPT,
  content: NEW_CONTENT,
  faq: NEW_FAQ,
  publishedDate: new Date().toISOString(),
  lastUpdated: new Date().toISOString(),
});

console.log(`✓ Shipped /blog/${SLUG}`);
console.log(`  _id: ${result._id}`);
console.log(`  _rev: ${result._rev}`);
console.log(`  metaTitle: "${NEW_META_TITLE}" (${NEW_META_TITLE.length} chars)`);
