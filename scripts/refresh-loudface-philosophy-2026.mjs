#!/usr/bin/env node
import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";
import path from "node:path";

if (!process.env.SANITY_API_TOKEN) {
	try {
		const env = readFileSync(path.resolve(process.cwd(), ".env.local"), "utf8");
		const m = env.match(/^SANITY_API_TOKEN=(.+)$/m);
		if (m) process.env.SANITY_API_TOKEN = m[1].trim();
	} catch {}
}

const client = createClient({
	projectId: "xjjjqhgt",
	dataset: "production",
	apiVersion: "2025-03-29",
	useCdn: false,
	token: process.env.SANITY_API_TOKEN,
});

const DOC_ID = "imported-blogPost-697d05ec8280e3c981ccfc21";

const NEW_NAME = "Why LoudFace Builds Systems, Not Websites: The 2026 Webflow Philosophy";
const NEW_META_TITLE = "Why LoudFace Builds Systems, Not Websites (2026)";
const NEW_META_DESCRIPTION =
	"Most B2B SaaS marketing sites are brochures. LoudFace builds systems: programmatic content architectures with direct-answer paragraphs, /answers directories, and schema density that produce AI citation arrival, not just conversion.";
const NEW_EXCERPT =
	"Website thinking produces brochures. System thinking produces citation infrastructures. Here's the architectural distinction that separates B2B SaaS Webflow sites that compound from sites that plateau at month four.";

const NEW_CONTENT = `
<p><strong>TL;DR:</strong> Most B2B SaaS marketing sites in 2026 are brochures: collections of pages designed to look good and convert the buyer who already arrived. LoudFace builds systems instead: content architectures that produce buyer arrival, not just buyer conversion. The distinction matters because the buyer journey of 2026 starts with AI engines, not Google blue links, and a brochure-shaped site is invisible to the citation surfaces that mediate the early funnel. The system thinking is: programmatic page trees that compound, /answers directories engineered for LLM extraction, schema density across the entity graph, direct-answer paragraphs that AI Overviews can pull verbatim. A site that produces 0 to 86% AI citation rate on a category prompt (Toku's actual number) is not a website. It's a citation infrastructure.</p>

<p>I had a conversation with a founder last month who said something that landed hard. "I paid $80K for a beautiful Webflow site and it produces nothing. The agency told me it would 'support' our marketing. It supports nothing. It just sits there." That's the exact failure mode that "website thinking" produces in 2026. The site exists. It looks good. Nothing happens.</p>

<p>The fix is structural. Stop thinking about the Webflow site as a website. Start thinking about it as a system.</p>

<p>For broader Webflow context, see <a href="/blog/mastering-webflow-guide">Getting Started with Webflow in 2026</a>. For the critique of how traditional agencies fail at this, see <a href="/blog/the-problem-with-traditional-webflow-agencies">The Problem with Traditional Webflow Agencies</a>.</p>

<h2>Website thinking vs system thinking</h2>

<p>The difference shows up in five concrete places:</p>

<table class="summary_table"><thead><tr><th>Dimension</th><th>Website thinking</th><th>System thinking</th></tr></thead>
<tbody>
<tr><td><strong>Page model</strong></td><td>Each page is a destination. The hero is the headline. The CTA closes the visit.</td><td>Each page is a node in a graph. Direct-answer paragraphs feed AI engines. Internal links compound topical authority.</td></tr>
<tr><td><strong>Content scale</strong></td><td>Hand-built per-page. 50-100 pages total. Editorial bottleneck.</td><td>Programmatic where the data supports it. Hundreds of dynamic pages. Marketing-team owned.</td></tr>
<tr><td><strong>SEO/AEO</strong></td><td>Bolted-on at launch. Meta titles, alt text, sitemap submission.</td><td>Baked into the architecture. Schema density. /answers directory. Direct-answer paragraphs. Question-phrased H2s.</td></tr>
<tr><td><strong>Measurement</strong></td><td>"We launched the site, traffic is up."</td><td>Peec AI for AI citation tracking. GSC for branded search lift. PostHog for first-touch attribution. Three datasets move together or the program isn't real.</td></tr>
<tr><td><strong>Time horizon</strong></td><td>The build is the deliverable. End-of-engagement is launch.</td><td>The build is the foundation. Months 4-12 of citation work are where outcomes compound.</td></tr>
</tbody></table>

<p>Every Webflow site sits somewhere on this spectrum. Most B2B SaaS sites we audit on prospect calls are firmly on the left side. The shift to the right is what we run.</p>

<h2>What "AI-enhanced, SEO/AEO-driven" actually means</h2>

<p>Three concrete architectural patterns we ship on every LoudFace engagement:</p>

<h3>1. Direct-answer architecture in the first 60 words of every targeting page</h3>

<p>Not a hero banner with a brand statement. Not a vague value proposition. A 60-word block that directly answers the question the buyer searched. The block is built to be extractable: standalone, declarative, parseable by an LLM without surrounding context.</p>

<p>This is what AI engines pull into responses. Google AI Overviews, Perplexity, ChatGPT all sample these blocks first. A page without a direct-answer block in the first 60 words rarely gets cited regardless of how good the rest of the page is.</p>

<h3>2. /answers directory engineered for LLM extraction</h3>

<p>A dedicated Webflow CMS Collection where each item is a single buyer question with a structured answer. Question as the H1 (matching the prompt buyers ask AI engines verbatim). 60-word answer in the first paragraph. Expanded context below. FAQPage schema on the template.</p>

<p>The directory compounds. Each new item adds to topical authority, contributes to AEO citation pickup, generates internal-link targets. After 20-40 items, the /answers directory becomes the primary AI citation surface for the site. Toku ships its /answers directory as one of the four content surfaces that produce the 86% citation rate on the core stablecoin-payroll prompt.</p>

<h3>3. Schema density across the entity graph</h3>

<p>Article schema on blog posts. FAQPage schema on Q&A blocks. Organization schema in the global footer. BreadcrumbList schema on nested pages. Product schema on product pages. Person schema with sameAs links on author bylines. MedicalOrganization, MedicalCondition, MedicalSpecialty for healthcare. FinancialService for fintech.</p>

<p>The schema is how AI engines resolve "what is this site, what entity does it represent, what category does it operate in." Without schema density, the site is a collection of HTML pages. With schema density, it's a structured entity that AI engines can categorize, cite, and recommend.</p>

<h2>Why the system shape matters for the 2026 buyer</h2>

<p>The buyer journey for B2B SaaS in 2026 looks like this:</p>

<ol>
<li>Buyer asks an AI engine (ChatGPT, Perplexity, Google AI Overviews) about their category. "Best stablecoin payroll providers." "B2B SaaS Webflow agencies." "Fintech KYC vendors."</li>
<li>AI engine generates a response with 3-5 cited sources.</li>
<li>Buyer clicks the cited sources or starts Googling the brand names mentioned.</li>
<li>Buyer arrives at the site for evaluation.</li>
<li>Site converts on demo signup, contact form, or pricing inquiry.</li>
</ol>

<p>Steps 1-4 happen before the buyer ever reaches the site. A brochure-shaped site has no influence on steps 1-3 because it isn't structured to be cited. A system-shaped site has direct-answer paragraphs, /answers directory, schema density, programmatic page trees: all the architecture AI engines parse to decide which sites to cite.</p>

<p>The polished website that everyone admires at the launch ceremony is invisible at steps 1-3. The system-shaped site produces arrival at step 4, which is the part traditional agencies skip.</p>

<h2>How LoudFace structures the build to produce systems</h2>

<p>The honest sequence on a LoudFace engagement:</p>

<ol>
<li><strong>Audit + strategy (weeks 1-3).</strong> Pull baseline AI visibility from Peec AI on the client's tracked prompts. Map buyer intent to content surfaces. Identify the programmatic page-tree candidates. Output: strategy doc with prioritized targets.</li>
<li><strong>Foundation rebuild (weeks 4-10).</strong> Webflow Designer work. The IA includes /answers directory from week 4. Direct-answer paragraph patterns in every page template. Schema templates per Collection. Programmatic page tree wireframes.</li>
<li><strong>Citation work (months 4-9).</strong> Per-prompt content strategy. Weekly publishing cadence. Schema audit. Internal-linking strategy execution. Peec + GSC + PostHog monitoring.</li>
<li><strong>Compounding (months 10+).</strong> Branded search lift on NEW queries appears. AI citation rates climb. First-touch attribution shifts toward organic. Pipeline composition shows AEO impact.</li>
</ol>

<p>This is what produces 86% AI citation rates (<a href="/case-studies/toku-ai-cited-pipeline">Toku case study</a>), +49% organic clicks year-over-year (CodeOp), and multi-fold impression growth with AI citation pickup (TradeMomentum). Not because the design is better than competitors. Because the architecture is structurally different.</p>

<h2>What buyers should ask any Webflow agency they're evaluating</h2>

<p>Five questions that separate brochure builders from system builders:</p>

<ol>
<li><strong>What's the baseline AI visibility on our tracked prompts before we start?</strong> If the agency doesn't pull Peec or equivalent data pre-build, they don't have a way to measure citation lift after launch.</li>
<li><strong>Where in the IA do direct-answer paragraphs, /answers directory, and schema templates appear?</strong> If those show up at week 14 as a launch checklist, the engagement is brochure-shaped.</li>
<li><strong>What's the publishing cadence post-launch and who owns it?</strong> If the answer is "we'll figure that out after launch" or "you'll handle it," the program will plateau at month four.</li>
<li><strong>How do you measure success at months 6 and 12?</strong> Acceptable answer: "Peec share-of-voice on these prompts, GSC clicks on these pages, first-touch attribution on these segments." Unacceptable answer: "vanity metrics that look good in a report."</li>
<li><strong>What's the engagement structure for months 4-12?</strong> If the proposal ends at launch, the strategic work that produces outcomes will be skipped.</li>
</ol>

<h2>The honest takeaway</h2>

<p>LoudFace builds AI-enhanced, SEO/AEO-driven Webflow systems because the 2026 B2B SaaS buyer journey runs through AI engines before it reaches the marketing site. A brochure-shaped Webflow site has no influence on the citation stage that decides whether the buyer ever arrives. A system-shaped site produces arrival because the architecture (direct-answer paragraphs, /answers directory, schema density, programmatic page trees) is what AI engines parse to decide which sites to cite.</p>

<p>The trade-off is real. Building a system costs more than building a brochure: more strategy work upfront, more architecture work in the build phase, more ongoing work in months 4-12. The companies that have made the trade-off (Toku, CodeOp, Zeiierman, TradeMomentum) get cited by AI engines at rates that beautiful-brochure sites never reach.</p>

<p>If you want help structuring a Webflow engagement around the system thinking, <a href="/services/seo-aeo">we run dual-track SEO + AEO programs as our default engagement shape</a>.</p>
`.trim();

const NEW_FAQ = [
	{
		_key: "faq1",
		_type: "faqItem",
		question: "What's the difference between a Webflow website and a Webflow system?",
		answer:
			"<p>A website is a collection of pages designed to look good and convert visitors who already arrived. A system is a content architecture that produces buyer arrival in the first place. The distinction shows up in five places: page model (destinations vs nodes in a graph), content scale (hand-built vs programmatic), SEO/AEO (bolted-on vs baked-in), measurement (vanity metrics vs Peec/GSC/PostHog moving together), and time horizon (build is the deliverable vs build is the foundation).</p>",
	},
	{
		_key: "faq2",
		_type: "faqItem",
		question: "What does 'AI-enhanced, SEO/AEO-driven' Webflow actually mean?",
		answer:
			'<p>Three concrete architectural patterns. (1) Direct-answer paragraphs in the first 60 words of every targeting page — what AI engines extract into responses. (2) A structured /answers directory built as a Webflow CMS Collection with FAQPage schema, engineered for LLM extraction. (3) Schema density across the entity graph (Article, FAQPage, Organization, BreadcrumbList, Product, Person with sameAs, industry-specific types). These three patterns are what AI engines parse to decide which sites to cite.</p>',
	},
	{
		_key: "faq3",
		_type: "faqItem",
		question: "Why does the 2026 buyer journey require system thinking instead of website thinking?",
		answer:
			"<p>Because the buyer journey now starts with AI engines, not Google blue links. The buyer asks ChatGPT or Perplexity about their category, gets back a response citing 3-5 sources, and either clicks the cited sources or Googles the brand names mentioned. Steps 1-3 of the buyer journey happen before the buyer reaches your site. A brochure-shaped site has no influence on those steps because it isn't structured to be cited. A system-shaped site has the architecture AI engines parse to decide which sites to cite.</p>",
	},
	{
		_key: "faq4",
		_type: "faqItem",
		question: "How does LoudFace structure a Webflow engagement to produce a system?",
		answer:
			"<p>Four phases over 12 months. (1) Audit + strategy (weeks 1-3): pull baseline Peec AI visibility, map buyer intent to content surfaces, identify programmatic page-tree candidates. (2) Foundation rebuild (weeks 4-10): Webflow Designer work with /answers directory, direct-answer paragraph patterns, schema templates, programmatic page tree wireframes baked into the IA from the start. (3) Citation work (months 4-9): per-prompt content strategy, weekly publishing, schema audit, internal-linking execution. (4) Compounding (months 10+): branded search lift, AI citation rate climb, organic pipeline composition.</p>",
	},
	{
		_key: "faq5",
		_type: "faqItem",
		question: "What questions should I ask a Webflow agency to know if they build systems?",
		answer:
			'<p>Five questions. (1) What\'s the baseline AI visibility on our tracked prompts before we start? (2) Where in the IA do direct-answer paragraphs, /answers directory, and schema templates appear? (3) What\'s the publishing cadence post-launch and who owns it? (4) How do you measure success at months 6 and 12? (5) What\'s the engagement structure for months 4-12? If the agency can\'t answer these specifically, the engagement is brochure-shaped and will plateau at month four. See our <a href="/blog/the-problem-with-traditional-webflow-agencies">critique of traditional agencies</a> for the deeper breakdown.</p>',
	},
	{
		_key: "faq6",
		_type: "faqItem",
		question: "What's the proof that system-shaped Webflow sites produce better outcomes?",
		answer:
			'<p>Real LoudFace client data. <a href="/case-studies/toku-ai-cited-pipeline">Toku</a>: 86% citation rate on the core stablecoin-payroll prompt across all AI engines, 35% visibility on Google AI Overviews, NEW branded search queries appearing from zero, majority-organic B2B pipeline. CodeOp: +49% organic clicks year-over-year. Zeiierman: WordPress to Webflow migration with ongoing organic growth. TradeMomentum: niche AEO with multi-fold impression growth. Each one runs on Webflow with the system-shaped architecture; each one ships outcomes that brochure-shaped Webflow sites don\'t reach.</p>',
	},
	{
		_key: "faq7",
		_type: "faqItem",
		question: "How much more does a system-shaped Webflow engagement cost than a brochure rebuild?",
		answer:
			'<p>Typically 2-3x. A standard Webflow rebuild lands $15K-$50K. A dual-track SEO + AEO program with Webflow as the implementation layer typically lands $80K-$200K for the first 12 months on B2B SaaS engagements. Higher upfront cost because the work is more: pre-build audit, AEO architecture in the wireframes, per-prompt content strategy, 9 months of ongoing citation work, real measurement infrastructure. The trade-off pays off when the system produces real AI citation rates and majority-organic pipeline at month 12. See our <a href="/blog/webflow-agency-cost-b2b-saas-2026">B2B SaaS Webflow Agency Cost guide</a> for the full pricing math.</p>',
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

console.log(`✓ Refreshed /blog/why-loudface-builds-ai-enhanced-seo-aeo-driven-webflow-systems-not-just-websites`);
console.log(`  _rev: ${result._rev}`);
