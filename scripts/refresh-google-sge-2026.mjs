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

const DOC_ID = "imported-blogPost-69737effd2b2f2439d311697";

const NEW_NAME = "Google AI Overviews (Formerly SGE) and What It Means for Webflow Sites in 2026";
const NEW_META_TITLE = "Google AI Overviews + Webflow Sites: 2026 Guide";
const NEW_META_DESCRIPTION =
	"What Google AI Overviews (formerly SGE) means for Webflow sites in 2026: how citations work, why it's the dominant search surface for B2B SaaS, and the four structural moves that win citations.";
const NEW_EXCERPT =
	"SGE is dead, long live Google AI Overviews. Here's what the rebrand means for Webflow sites in 2026 and the four structural moves that determine whether your site gets cited in the AI summary above the blue links.";

const NEW_CONTENT = `
<p><strong>TL;DR:</strong> SGE no longer exists as a product name in 2026. Google rebranded the technology as Google AI Overviews and Search Generative Experience has been folded into the standard Google search experience. The underlying technology (generative AI summaries appearing above the blue links) is now the dominant search surface for 30-50% of B2B SaaS queries. For Webflow sites, this means: getting cited inside Google AI Overviews is the #1 SEO outcome in 2026, and the architecture that wins citations (direct-answer paragraphs, FAQPage schema, question-phrased H2s, entity-clear positioning) is what separates Webflow sites that compound from Webflow sites that plateau.</p>

<p>I have run AEO programs on B2B SaaS Webflow sites since Google AI Overviews shipped. The terminology has shifted (SGE → AI Overviews → just part of Google search now), but the underlying mechanics are the same: Google generates an AI summary above the blue links for many queries, the summary cites 3-5 sources, and getting cited in that summary is the biggest SEO opportunity a Webflow site has in 2026.</p>

<p>This is the explainer half of the cluster. For the full AEO playbook, see <a href="/blog/answer-engine-optimization-guide-2026">The Complete Guide to Answer Engine Optimization (AEO)</a>. For the broader Webflow context, see <a href="/blog/mastering-webflow-guide">Getting Started with Webflow in 2026</a>.</p>

<h2>What Google AI Overviews actually is in 2026</h2>

<p>When a user runs a Google search in 2026, Google often generates an AI summary above the standard blue-link results. The summary directly answers the user's query in 1-3 paragraphs and cites 3-5 sources at the bottom (clickable links to the source pages, similar to citations in a research paper).</p>

<p>Three things to know:</p>

<ol>
<li><strong>The summary is generated, not retrieved.</strong> Google's AI synthesizes content from multiple sources rather than copying one page verbatim. The cited sources are the ones Google judged most relevant; the wording is Google's.</li>
<li><strong>The citation list is the prize.</strong> Pages cited inside Google AI Overviews get extraordinary brand visibility: the user reads your name in the summary, sees your URL as a cited source, and often clicks through to learn more. This is the surface that matters most for B2B SaaS in 2026.</li>
<li><strong>The blue links still exist underneath.</strong> Standard organic rankings continue. Pages cited in AI Overviews often also rank well in blue links because the same signals (content depth, entity authority, schema markup) drive both. The two surfaces compound rather than compete.</li>
</ol>

<h2>Why this matters for Webflow sites</h2>

<p>For B2B SaaS sites where the buyer journey starts with research queries (comparison searches, problem framing, vendor evaluation), Google AI Overviews has changed the math. The buyer might never click through to your blue-link result if the AI Overview already answered their question. But if your site gets cited inside the AI Overview, you get the brand impression and often the click anyway.</p>

<p>Toku's data illustrates this. Across tracked prompts, Google AI Overviews accounts for 35% of Toku's AI visibility (more than any single AI engine) and contributes 57% of Toku's total AI mentions across all surfaces. The site that ignored AI Overviews while focusing on ChatGPT optimization would miss the dominant surface.</p>

<h2>What separates Webflow sites that get cited from those that don't</h2>

<p>Four structural moves. These are the patterns we ship on every LoudFace client engagement now.</p>

<h3>1. Direct-answer paragraph in the first 60 words</h3>

<p>Every page that targets a query needs to answer that query in a self-contained paragraph at the top of the page. Not buried under a hero banner. Not hidden behind a brand statement. The first thing on the page should be the answer to the question the buyer searched.</p>

<p>This is what AI engines extract. A 60-word block that directly answers the query gets pulled into the AI Overview almost verbatim, with your site cited as the source.</p>

<h3>2. Question-phrased H2s matching buyer prompts</h3>

<p>H2s on the page should literally be the questions buyers ask. Not "Our Approach" but "How long does AEO take?" Not "What We Do" but "What is dual-track SEO and AEO?"</p>

<p>The pattern matters because AI engines pattern-match buyer queries to page sections. A question H2 followed by a tight answer is the structure they extract.</p>

<h3>3. FAQPage schema on every page with question-shaped content</h3>

<p>Webflow supports FAQPage schema via JSON-LD in the Custom Code section. Every page that has a Q&A structure should ship the schema. This is what tells Google "this content is structured questions and answers" and accelerates citation pickup.</p>

<h3>4. Entity-clear positioning</h3>

<p>The page should make it unambiguous what entity you are (company, product, service) and what category you operate in. Schema markup (Organization, Article, sameAs) reinforces this. Plain text positioning matters too: "LoudFace is a B2B SaaS Webflow agency" is clearer to AI engines than "We help businesses grow."</p>

<h2>What does NOT matter (despite what marketing copy says)</h2>

<p>Three patterns that get over-hyped:</p>

<ol>
<li><strong>"Optimizing for ChatGPT" as the main play.</strong> ChatGPT is one AI surface and not the dominant one for B2B SaaS query traffic in 2026. Google AI Overviews is. Optimize for both. If forced to pick one, Google AI Overviews wins on raw traffic.</li>
<li><strong>AI chatbots embedded on your Webflow site.</strong> A chatbot widget does not help you get cited by external AI engines. It is an unrelated feature. Skip it unless you have a specific use case.</li>
<li><strong>"AI-generated content."</strong> Content quality still matters. AI-generated boilerplate gets cited less often than human-written content with real opinion, real data, and real specificity. The pattern that wastes the most time: teams ship 100 AI-generated pages hoping for AEO uplift, then watch AI engines ignore the lot.</li>
</ol>

<h2>What changed from 2024 to 2026</h2>

<p>The product name. SGE (Search Generative Experience) was Google's pre-launch label for the technology in 2023-2024. By mid-2024 it had rebranded as Google AI Overviews and rolled out broadly. By 2026 the feature is no longer labeled separately. It is just part of how Google search works.</p>

<p>The mechanics underneath are the same: AI summary above blue links, 3-5 cited sources, generation rather than retrieval. The terminology shift means older content referencing "SGE" feels dated, but the playbook for getting cited has been consistent throughout.</p>

<h2>The honest takeaway</h2>

<p>For B2B SaaS Webflow sites in 2026, getting cited inside Google AI Overviews is the highest-impact SEO outcome available. The architecture that wins citations is the same architecture that helps with all AI engines (ChatGPT, Perplexity, Claude, Gemini): direct-answer paragraphs, question-phrased H2s, FAQPage schema, entity-clear positioning.</p>

<p>Webflow makes this architecture cheap to ship (the CMS handles repeated patterns; the Designer handles per-page structure; the Custom Code section handles per-page schema). The strategic work — picking the right prompts, writing the answers, choosing the entity model — is on you.</p>

<p>If you want help structuring a Webflow site to get cited by Google AI Overviews and the AI search engines that matter for B2B SaaS, <a href="/services/seo-aeo">we run dual-track SEO + AEO programs as part of every Webflow engagement</a>.</p>
`.trim();

const NEW_FAQ = [
	{
		_key: "faq1",
		_type: "faqItem",
		question: "What is Google AI Overviews (formerly SGE)?",
		answer:
			"<p>Google AI Overviews is the AI-generated summary that appears above the standard blue-link results for many Google searches. The summary answers the query in 1-3 paragraphs and cites 3-5 source pages. It launched in mid-2024 (replacing the SGE / Search Generative Experience pre-launch label) and is now the dominant search surface for 30-50% of B2B SaaS queries. The summary is generated by Google's AI rather than retrieved verbatim from one page — multiple sources contribute, and the cited URLs at the bottom are the prize.</p>",
	},
	{
		_key: "faq2",
		_type: "faqItem",
		question: "Is SGE still a thing in 2026?",
		answer:
			"<p>No. SGE (Search Generative Experience) was Google's pre-launch label for the technology in 2023-2024. By mid-2024 the feature had rebranded as Google AI Overviews and rolled out broadly. By 2026 the feature is no longer labeled separately at all — it's just part of how Google search works. Older content referencing 'SGE' feels dated; the playbook for getting cited has been consistent throughout the terminology shift.</p>",
	},
	{
		_key: "faq3",
		_type: "faqItem",
		question: "How do I get my Webflow site cited in Google AI Overviews?",
		answer:
			"<p>Four structural moves. (1) Direct-answer paragraph in the first 60 words of every page targeting a query — what AI engines extract. (2) Question-phrased H2s matching the actual prompts buyers ask, not internal section labels. (3) FAQPage schema via JSON-LD on every page with Q&A structure. (4) Entity-clear positioning in plain text and schema (Organization, sameAs) so Google's AI can resolve who you are. Webflow makes all four cheap to ship; the strategic decisions (which prompts, what answers, what entity model) are your job.</p>",
	},
	{
		_key: "faq4",
		_type: "faqItem",
		question: "Does Google AI Overviews replace traditional SEO?",
		answer:
			"<p>No, it adds to it. The blue links still exist underneath the AI summary. Pages cited in AI Overviews often also rank well in blue links because the same signals (content depth, entity authority, schema markup) drive both surfaces. The two compound rather than compete. The real shift is in what the buyer sees first: in 2026, for many queries, the buyer reads the AI summary before scrolling to blue links. Getting cited in the summary is the higher-priority outcome.</p>",
	},
	{
		_key: "faq5",
		_type: "faqItem",
		question: "Is Google AI Overviews more important than ChatGPT for B2B SaaS?",
		answer:
			"<p>Yes, for traffic volume. Google AI Overviews is the dominant AI search surface for B2B SaaS query traffic in 2026, contributing roughly 35-57% of total AI visibility on tracked client prompts. ChatGPT is significant (typically 11-23% of total AI visibility) but lower. Most agencies optimize for ChatGPT first because it's the surface they personally use. They're optimizing for the wrong panel. Focus on Google AI Overviews architecture, and the same work tends to pay off in ChatGPT and Perplexity as well.</p>",
	},
	{
		_key: "faq6",
		_type: "faqItem",
		question: "What types of queries trigger Google AI Overviews?",
		answer:
			"<p>Most informational queries and many comparison queries. 'How long does AEO take', 'best Webflow agencies for B2B SaaS', 'what is a CMS for marketers' — these all trigger AI Overviews. Transactional queries (buying intent for a specific product) trigger them less often. The pattern: if a buyer is researching or comparing, expect AI Overviews. If a buyer is converting on a specific product page, expect mostly blue links. For B2B SaaS, the research-stage queries are exactly where AI Overviews compound brand visibility.</p>",
	},
	{
		_key: "faq7",
		_type: "faqItem",
		question: "How long does it take to get cited in Google AI Overviews?",
		answer:
			"<p>It varies. Hours-to-a-day for first citation pickup on a well-structured page from a brand with modest authority (this is the fast lane the industry undersells). Weeks for earning a consistent slot in the cited-source set on a prompt that matters. Months for dominant share of voice on competitive prompt clusters. Most agencies sell you the slowest version and bill for the slow speed. The fast lane is real if you have the foundation and a sharp prompt — see our piece on <a href=\"/blog/answer-engine-optimization-guide-2026\">how AEO citations actually work</a>.</p>",
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

console.log(`✓ Refreshed /blog/what-google-sge-and-ai-search-mean-for-webflow-sites-in-2026`);
console.log(`  _rev: ${result._rev}`);
