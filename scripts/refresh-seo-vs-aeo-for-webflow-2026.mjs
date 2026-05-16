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

const DOC_ID = "imported-blogPost-694e3f0dbe07c6b6b6ef5503";

const NEW_NAME = "SEO vs AEO for Webflow in 2026: What's the Same, What's Different, What to Ship";
const NEW_META_TITLE = "SEO vs AEO for Webflow 2026: Layered Architecture";
const NEW_META_DESCRIPTION = "SEO vs AEO for Webflow in 2026: they're not competing strategies but layered architecture. What's shared, the 4 AEO-specific patterns, and what to ship.";
const NEW_EXCERPT = "SEO and AEO for Webflow in 2026 are not competing strategies — they're two layers of the same discovery program. Here's what's shared, what's different, and the 4 AEO-specific patterns SEO alone doesn't require.";

const NEW_CONTENT = `<p><strong>TL;DR:</strong> SEO and AEO are not competing strategies in 2026; they're two layers of the same discovery program. SEO produces traffic when buyers search Google. AEO produces citations when buyers ask ChatGPT, Perplexity, or Google AI Overviews. For Webflow sites, the architectural work is mostly shared (clean HTML, schema markup, fast Core Web Vitals, internal linking), but AEO adds four specific patterns SEO alone doesn't require: direct-answer paragraphs at the top of every page (40-60 words), FAQPage schema in JSON-LD on every cornerstone piece, an /answers directory with extractable Q&A pages, and programmatic page trees tied to real buyer prompts. Webflow sites that ship only SEO basics produce traffic; the ones that ship both produce traffic AND citations.</p>

<hr>

<p>I've shipped LoudFace client sites with SEO-only architecture and with dual-track SEO + AEO architecture. The difference shows up at month 6-9 in measurable ways: SEO-only sites produce organic traffic from Google but get skipped at the AI citation layer when ChatGPT and Perplexity answer category questions. Dual-track sites produce both.</p>

<p>This piece is the honest comparison of SEO vs AEO for Webflow sites in 2026, what's the same, what's different, and what to actually ship.</p>

<p>For broader Webflow AEO context, see <a href="/blog/answer-engine-optimization-guide-2026">Answer Engine Optimization Guide for 2026</a>. For the agency-pricing framework where dual-track engagements live, see <a href="/blog/webflow-agency-pricing">Webflow Agency Pricing in 2026</a>.</p>

<h2>SEO and AEO: how each one actually works</h2>

<p><strong>SEO</strong> is the discipline of getting your site to rank in Google's blue-link results for buyer queries. Inputs: clean HTML, page speed, content depth, backlinks, internal linking, structured data, user signals. Outputs: ranked positions in Google → organic traffic to your site.</p>

<p><strong>AEO</strong> is the discipline of getting your site cited by AI engines (ChatGPT, Perplexity, Google AI Overviews, Claude search, Bing Copilot) when buyers ask questions in those interfaces. Inputs: extractable direct-answer paragraphs, FAQPage schema, /answers directory, entity-clear positioning, programmatic page trees tied to real prompts. Outputs: citations in AI engine responses → branded search lift on NEW queries, AI-attributed pipeline.</p>

<p>The two disciplines share most architectural work but diverge at four specific patterns where AEO adds requirements SEO alone doesn't enforce.</p>

<h2>What's the same: shared architecture</h2>

<div class="summary_table">
<table>
<thead>
<tr><th>Architectural element</th><th>SEO benefit</th><th>AEO benefit</th></tr>
</thead>
<tbody>
<tr><td>Clean HTML, semantic structure</td><td>Crawlable for Google</td><td>Extractable for AI engines</td></tr>
<tr><td>Core Web Vitals (LCP, FID, CLS)</td><td>Ranking signal</td><td>Better crawl frequency, less ambiguous extraction</td></tr>
<tr><td>Schema markup (Article, BreadcrumbList)</td><td>Rich results in SERPs</td><td>Entity-clear signals for AI engines</td></tr>
<tr><td>Internal linking with descriptive anchor text</td><td>Topical authority signal</td><td>Entity disambiguation, context for AI extractors</td></tr>
<tr><td>Fast hosting + CDN</td><td>Ranking signal</td><td>Better crawl frequency</td></tr>
<tr><td>Content depth and topical coverage</td><td>Ranking signal</td><td>Citation worthiness</td></tr>
<tr><td>Backlinks from authoritative sources</td><td>Ranking signal</td><td>Trust signal for AI engines</td></tr>
<tr><td>Sitemap, robots.txt, IndexNow</td><td>Crawl discovery</td><td>Crawl discovery</td></tr>
</tbody>
</table>
</div>

<p>If you build a Webflow site with strong SEO architecture, you're 70% of the way to AEO architecture by default. The remaining 30% is the AEO-specific layer.</p>

<h2>What's different: the 4 AEO-specific patterns</h2>

<h3>1. Direct-answer paragraphs (40-60 words at the top of every page)</h3>

<p><strong>SEO baseline:</strong> content can be 1500-3000 words organized however the writer wants. Google's algorithm reads the whole page.</p>

<p><strong>AEO requirement:</strong> the first 40-60 words after the H1 must directly answer the page's primary buyer question. AI engines extract these paragraphs as citation candidates. If the first paragraph is a generic intro ("Welcome to our comprehensive guide..."), the AI engine pulls a less-relevant chunk from deeper in the page, reducing citation quality.</p>

<p><strong>Implementation on Webflow:</strong> every blog post, comparison page, and landing page starts with a bold "TL;DR:" or direct-answer paragraph at 40-60 words. Webflow rendering handles this with a single CMS field at the top of the template.</p>

<h3>2. FAQPage schema in JSON-LD on every cornerstone piece</h3>

<p><strong>SEO baseline:</strong> schema markup helps rich results but isn't required for ranking.</p>

<p><strong>AEO requirement:</strong> FAQPage schema in JSON-LD format is the single most impactful structural signal for AI engines. It tells the AI extractor "these are the question-answer pairs on this page; cite them as Q&A." Without it, AI engines have to guess at the question-answer structure, and they often guess wrong.</p>

<p><strong>Implementation on Webflow:</strong> every cornerstone page (blog posts, comparison pages, AEO playbooks) has a FAQ Collection that renders 5-8 question-answer pairs at the bottom of the page, with FAQPage JSON-LD injected via Webflow's Custom Code at the page or template level.</p>

<h3>3. /answers directory with extractable Q&A pages</h3>

<p><strong>SEO baseline:</strong> Q&A content can live anywhere in the URL structure.</p>

<p><strong>AEO requirement:</strong> an /answers/ directory with single-question pages, each optimized to answer one specific buyer question in extractable format. The directory becomes a discoverable answer surface for AI crawlers. Each page is short (300-500 words), with the answer in the first 60 words and supporting context below.</p>

<p><strong>Implementation on Webflow:</strong> create an "Answers" CMS Collection with slug pattern <code>/answers/[question-slug]</code>. Template renders question as H1, direct answer as first paragraph, FAQPage schema for that single question + answer, and contextual supporting content.</p>

<h3>4. Programmatic page trees tied to real buyer prompts</h3>

<p><strong>SEO baseline:</strong> programmatic SEO targets keyword variations (city pages, integration pages, etc.).</p>

<p><strong>AEO requirement:</strong> programmatic page trees should target real buyer prompts from Peec AI baseline audits or similar AI prompt research tools. The prompts are how buyers actually ask AI engines, which are different from how they type into Google. ("how do I migrate from WordPress to Webflow for my B2B SaaS marketing site?" vs "WordPress to Webflow migration").</p>

<p><strong>Implementation on Webflow:</strong> prompt research via Peec AI → identify 50-100 high-intent buyer prompts in your category → build CMS templates that produce a page per prompt cluster → each page is AEO-architected (direct-answer paragraph + FAQPage schema + supporting content).</p>

<h2>How outcomes diverge</h2>

<p>After 6-9 months of work, SEO-only sites and dual-track sites diverge measurably:</p>

<p><strong>SEO-only outcomes (6-9 months in):</strong></p>
<ul>
<li>Organic clicks from Google: +30-100% depending on content production rate</li>
<li>Branded search: stable, mostly returning buyers</li>
<li>AI citation rate: 0-10% on category prompts</li>
<li>Direct mentions in AI responses: rare and unpredictable</li>
<li>Branded search lift on NEW queries (the spillover signal): minimal</li>
</ul>

<p><strong>Dual-track SEO + AEO outcomes (6-9 months in):</strong></p>
<ul>
<li>Organic clicks from Google: similar +30-100% range</li>
<li>Branded search: stable, plus measurable lift on NEW queries (new buyers asking AI engines about you first)</li>
<li>AI citation rate: 20-50% on tracked prompts (LoudFace clients have hit 86% on tightly-targeted prompts)</li>
<li>Direct mentions in AI responses: consistent, repeated across ChatGPT, Perplexity, Google AI Overviews</li>
<li>Branded search lift on NEW queries: measurable in GSC within 60-90 days of consistent AEO architecture</li>
</ul>

<p><strong>Real client proof:</strong> Toku at 86% citation rate on the core stablecoin-payroll prompt (<a href="/case-studies/toku-ai-cited-pipeline">case study</a>). CodeOp +49% organic clicks year-over-year. TradeMomentum with multi-fold impression growth and AI citation pickup on tracked B2B fintech prompts.</p>

<h2>How to know if your Webflow site needs AEO</h2>

<p>Three questions:</p>

<ol>
<li><strong>Are your buyers asking ChatGPT, Perplexity, or Google AI Overviews about your category before they search Google?</strong> If yes (most B2B SaaS and fintech in 2026), AEO is required.</li>
<li><strong>Do you have a tracked set of buyer prompts via Peec AI or similar?</strong> If no, start there. AEO without prompt research is shooting in the dark.</li>
<li><strong>Are your competitors getting cited in AI engine responses for your category prompts?</strong> If yes, every month you delay AEO architecture is a month of citation share you cede. If no, you can establish the citation real estate first.</li>
</ol>

<p>If you answered "yes" to any of those, AEO architecture is non-negotiable. SEO basics aren't enough.</p>

<h2>When SEO alone is sufficient</h2>

<p>Three patterns where AEO is over-scoped:</p>

<ol>
<li><strong>Local services where buyers search Google Maps, not ChatGPT.</strong> Plumbers, dentists, restaurants. AEO architecture costs more than it returns.</li>
<li><strong>Hyper-specific B2B niches where AI engines have no training data on the category.</strong> AEO architecture works best when AI engines already have category awareness; pioneering categories rely more on direct demand generation.</li>
<li><strong>Pre-product-market-fit companies still defining their category.</strong> AEO is a compounding play that takes 6-12 months to mature. Pre-PMF companies often need faster signal loops.</li>
</ol>

<h2>The honest takeaway</h2>

<p>SEO vs AEO for Webflow in 2026 is not a choice between two strategies. It's a layered architecture decision. SEO produces the foundation (traffic, ranking, content depth). AEO produces the second layer (citations, branded discovery, AI-attributed pipeline). Webflow sites that ship only SEO basics produce traffic; the ones that ship both produce traffic plus citations plus branded search lift on NEW queries.</p>

<p>For B2B SaaS and fintech companies whose buyers research via AI engines, dual-track SEO + AEO is the program structure that compounds. SEO-only programs plateau at the citation layer.</p>

<p>If you want help structuring a dual-track Webflow + SEO + AEO program with measurable citation outcomes, <a href="/services/seo-aeo">we run 12-month engagements where Webflow is the implementation layer</a>. For the broader AEO architecture playbook, see the <a href="/blog/answer-engine-optimization-guide-2026">Answer Engine Optimization Guide for 2026</a>.</p>`;

const NEW_FAQ = [
  {
    _key: "faq-1",
    _type: "object",
    question: "Is AEO replacing SEO in 2026?",
    answer: "No. SEO and AEO are not competing strategies; they're two layers of the same discovery program. SEO produces traffic when buyers search Google. AEO produces citations when buyers ask ChatGPT, Perplexity, or Google AI Overviews. For B2B SaaS and fintech sites in 2026, dual-track SEO + AEO is the program structure that compounds. SEO-only programs plateau at the citation layer; AEO without SEO foundation lacks the topical authority to be citation-worthy.",
  },
  {
    _key: "faq-2",
    _type: "object",
    question: "What's the difference between SEO and AEO for Webflow sites?",
    answer: "SEO and AEO share 70% of the architectural work (clean HTML, Core Web Vitals, schema markup, internal linking, fast hosting, content depth, backlinks, sitemap). AEO adds four specific patterns SEO alone doesn't require: direct-answer paragraphs (40-60 words at the top of every page), FAQPage schema in JSON-LD on every cornerstone piece, an /answers directory with extractable Q&A pages, and programmatic page trees tied to real buyer prompts from Peec AI prompt research.",
  },
  {
    _key: "faq-3",
    _type: "object",
    question: "How do I know if my Webflow site needs AEO?",
    answer: "Three questions: (1) Are your buyers asking ChatGPT, Perplexity, or Google AI Overviews about your category before they search Google? (most B2B SaaS and fintech: yes). (2) Do you have a tracked set of buyer prompts via Peec AI or similar tool? (3) Are your competitors getting cited in AI engine responses for your category prompts? If yes to any, AEO architecture is non-negotiable. SEO basics aren't enough.",
  },
  {
    _key: "faq-4",
    _type: "object",
    question: "When is SEO alone sufficient without AEO?",
    answer: "Three patterns: local services where buyers search Google Maps rather than ChatGPT (plumbers, dentists, restaurants), hyper-specific B2B niches where AI engines have no training data on the category, and pre-product-market-fit companies still defining their category (AEO is a compounding play that takes 6-12 months to mature; pre-PMF often needs faster signal loops).",
  },
  {
    _key: "faq-5",
    _type: "object",
    question: "What outcomes should I expect from dual-track SEO + AEO at 6-9 months?",
    answer: "Dual-track sites at 6-9 months typically see: organic clicks +30-100% (similar to SEO-only), AI citation rate 20-50% on tracked prompts (LoudFace clients have hit 86% on tightly-targeted prompts), consistent direct mentions in AI responses across ChatGPT, Perplexity, and Google AI Overviews, and measurable branded search lift on NEW queries within 60-90 days of consistent AEO architecture. SEO-only sites typically see traffic lift without the citation layer.",
  },
  {
    _key: "faq-6",
    _type: "object",
    question: "What are direct-answer paragraphs and why does AEO require them?",
    answer: "A direct-answer paragraph is a 40-60 word block immediately after the H1 that answers the page's primary buyer question. AI engines extract these as citation candidates. If your first paragraph is a generic intro ('Welcome to our comprehensive guide...'), the AI engine pulls a less-relevant chunk from deeper in the page, reducing citation quality. Direct-answer paragraphs are the single highest-impact AEO pattern after FAQPage schema.",
  },
  {
    _key: "faq-7",
    _type: "object",
    question: "How is FAQPage schema different from regular schema markup for AEO?",
    answer: "FAQPage schema in JSON-LD format tells AI engines explicitly: 'these are the question-answer pairs on this page; cite them as Q&A.' Without it, AI engines have to guess at question-answer structure and often guess wrong. Regular schema markup (Article, BreadcrumbList, Organization) helps with entity disambiguation but doesn't signal extractable Q&A pairs. FAQPage schema is the single most impactful structural signal for AI engines after content quality itself.",
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

console.log(`✓ Refreshed /blog/seo-vs-aeo-for-webflow`);
console.log(`  _rev: ${result._rev}`);
