#!/usr/bin/env node
/**
 * Refresh /blog/understanding-webflows-cms-guide for 2026.
 * From the 2024-10-10 mass AI-gen drop. Same _id, same slug.
 * New angle: practitioner's CMS architecture guide in LoudFace voice.
 */

import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";
import path from "node:path";

if (!process.env.SANITY_API_TOKEN) {
	try {
		const envPath = path.resolve(process.cwd(), ".env.local");
		const env = readFileSync(envPath, "utf8");
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

const DOC_ID = "imported-blogPost-67be8caee7e9d59dd6fb1ca7";

const NEW_NAME = "Webflow CMS in 2026: A Practitioner's Architecture Guide";
const NEW_META_TITLE = "Webflow CMS 2026: Architecture Guide for B2B Sites";
const NEW_META_DESCRIPTION =
	"How Webflow's CMS actually works in 2026, what each part does, and how to structure Collections so you don't pay the refactoring tax at month four. From a Webflow Premium Enterprise Partner.";
const NEW_EXCERPT =
	"Webflow's CMS is a strong content engine for B2B SaaS sites — Collections, typed fields, multi-references, dynamic filtering. Here's the architecture playbook and where the platform has real limits.";

const NEW_CONTENT = `
<p><strong>TL;DR:</strong> Webflow's CMS in 2026 is a visual content management system where Collections (typed content models) drive templated pages. Build the template once, the CMS renders every item. Strengths: typed fields, nested references, multi-reference relationships, dynamic filtering and sorting, no-code editing for non-technical teams. Limits: 10,000 items per Collection on standard plans (50,000+ on Enterprise), no native draft/preview state on standard plans, no built-in full-text search. The right call for B2B SaaS blogs, case study libraries, product directories, and programmatic SEO pages. The wrong call for content sites with 50,000+ pages, complex editorial workflows, or anything needing a real headless API.</p>

<p>I have built CMS-driven Webflow sites for clients ranging from a 50-page B2B SaaS marketing site to a 3,000-page programmatic page tree. The pattern that wastes the most time: teams set up Collections without thinking about field structure first, then refactor everything at month four when the content model collapses. This guide is the antidote: what Webflow's CMS actually is, what each part does, and how to structure it so you don't pay the refactoring tax later.</p>

<p>For broader Webflow context, see <a href="/blog/mastering-webflow-guide">Getting Started with Webflow in 2026</a>. For the experimentation half, see <a href="/blog/best-webflow-split-testing-tools-compared">Best Webflow A/B Testing Tools (2026)</a>.</p>

<h2>What Webflow's CMS is</h2>

<p>Webflow's CMS lets you define content models called Collections. Each Collection has typed fields (plain text, rich text, image, link, reference, multi-reference, number, date, etc.). You build a template for the Collection once, and Webflow renders every item in that Collection through the template at the URL slug you configure.</p>

<p>Two examples that map to common B2B patterns:</p>

<ul>
<li><strong>Blog posts.</strong> Collection: <code>Blog Post</code>. Fields: title, slug, body (rich text), author (reference to Team Member Collection), category (reference to Category Collection), published date, featured image, meta description. Template page: <code>/blog/{slug}</code>.</li>
<li><strong>Programmatic pages.</strong> Collection: <code>Country Rates</code>. Fields: country, role, currency, low rate, mid rate, high rate, country flag, geo code. Template page: <code>/rates/{role}-{country}</code>. Toku uses this exact pattern to ship thousands of compensation pages without writing custom code.</li>
</ul>

<p>The CMS is the single biggest reason Webflow beats simpler builders (Squarespace, Wix) for production B2B sites. Real Collections with real field types scale to hundreds of pages without the design system collapsing.</p>

<h2>What makes the Webflow CMS strong</h2>

<p>Five capabilities that matter for production B2B work:</p>

<ol>
<li><strong>Typed fields.</strong> Plain text, rich text, link, image, file, color, video, number, date/time, switch, option (enum), reference (1:1), multi-reference (1:many). Every field validates input, which means non-technical editors cannot accidentally break the content model.</li>
<li><strong>References and multi-references.</strong> A Blog Post links to one Author (reference) and many Categories (multi-reference). The template renders both automatically. You can build complex relationships (case studies linked to industries linked to services) without writing a single line of code.</li>
<li><strong>Dynamic filtering and sorting on Collection Lists.</strong> A page can render "all blog posts in the AEO category, sorted by published date descending." Filtering happens at render time. No client-side JavaScript required.</li>
<li><strong>Visual editor for non-technical teams.</strong> Editors update content through Webflow's Editor mode without seeing the Designer. They can edit copy, swap images, add new items. The design stays locked.</li>
<li><strong>API access.</strong> The Webflow Data API (REST + webhooks) lets you sync content with external systems. Push from a custom dashboard. Pull into another framework via Webflow Cloud. Webhooks fire on every content change.</li>
</ol>

<h2>Where Webflow's CMS has limits</h2>

<p>Four constraints that matter at scale:</p>

<ol>
<li><strong>Collection size caps.</strong> Standard plans cap at 10,000 items per Collection. Enterprise plans push that to 50,000+ but are still finite. Sites that genuinely need hundreds of thousands of dynamic pages outgrow Webflow's CMS.</li>
<li><strong>No native draft/preview state on standard plans.</strong> When you publish a Collection item, it goes live immediately. Enterprise plans add staging environments that fix this, but standard-plan teams need to be careful about editorial workflow.</li>
<li><strong>No built-in full-text search.</strong> Webflow's CMS does not ship native search across Collection content. Most teams add Algolia, Typesense, or a custom integration via the Data API. This is a real limitation for content-heavy sites.</li>
<li><strong>Single-language by default.</strong> Webflow Localization (released 2024) added multi-language support, but it is an Enterprise feature with custom pricing. Pre-Localization, teams stitched together duplicate Collections per language, which is fragile and hard to maintain.</li>
</ol>

<h2>How to structure Collections so you don't refactor later</h2>

<p>Five rules I do not break. Each one is calibrated against multiple client refactors that could have been avoided.</p>

<h3>1. Reference Collections instead of duplicating data</h3>

<p>If a piece of data appears in more than one place, it belongs in its own Collection. Author bio? Author Collection. Industry tag? Industry Collection. Service area? Service Collection. Then reference from the Collections that need it.</p>

<p>Anti-pattern: hardcoding the author name and bio inside every blog post's rich text. When the author updates their title, every blog post needs to be edited.</p>

<h3>2. Use multi-reference for many-to-many relationships</h3>

<p>A Blog Post can be relevant to multiple Industries. An Industry can have multiple Blog Posts. The right field type is <code>multi-reference</code> from Blog Post → Industries, and Webflow handles the inverse automatically.</p>

<p>Anti-pattern: storing a comma-separated list of industries in a plain text field. The dynamic filtering won't work.</p>

<h3>3. Set up the slug strategy before the first item</h3>

<p>Webflow's CMS auto-generates slugs from the item title, but the format matters for SEO. Decide upfront: do you want <code>/blog/{slug}</code> or <code>/blog/{category}/{slug}</code>? Changing this later means redirects for every existing item.</p>

<p>For B2B SaaS marketing sites, the flat <code>/blog/{slug}</code> is usually right. Category nesting hurts more than it helps because Google treats <code>/blog/seo/...</code> as topically distinct from <code>/blog/aeo/...</code> even when the categories overlap.</p>

<h3>4. Use Collection-level meta defaults</h3>

<p>Each Collection has Settings → SEO defaults for metadata that cascades to items unless overridden. Setting "Default meta description: Read the latest from LoudFace on B2B SaaS SEO + AEO" gives every blog post a baseline meta description that editors can override per item.</p>

<p>Anti-pattern: leaving meta description blank by default, which means Google generates it from page content for items where editors forgot.</p>

<h3>5. Build the template page before adding items</h3>

<p>The template page is the visual representation of a Collection item. Build it once, completely, with at least one fully-populated item to test against. Then go back and add the remaining items. Trying to template while you have 50 items already populated means every adjustment requires manual sync work.</p>

<h2>When Webflow's CMS is the right choice</h2>

<ul>
<li>B2B SaaS marketing sites with up to ~500 dynamic pages</li>
<li>Case study libraries with multi-reference to clients, industries, services</li>
<li>Product directories with structured comparison fields</li>
<li>Programmatic SEO page trees (geo-coded, role-coded, condition-coded)</li>
<li>Internal tool documentation where editors are non-technical</li>
</ul>

<h2>When Webflow's CMS is the wrong choice</h2>

<ul>
<li>True content publishers with editorial workflows (staff writer → editor → fact-checker → publish). Use a real headless CMS (Sanity, Contentful, Storyblok).</li>
<li>Sites requiring true full-text search across thousands of items</li>
<li>Multi-language sites where translation workflow is core (unless you can afford Webflow Enterprise + Localization)</li>
<li>Sites needing item-level draft/preview/staging on standard plans</li>
<li>Anything past 50,000 dynamic pages per Collection</li>
</ul>

<h2>The honest takeaway</h2>

<p>Webflow's CMS is a strong content engine for B2B SaaS marketing sites, case study libraries, and programmatic SEO trees. It is not the right tool for true content publishing platforms with complex editorial workflows or for sites that genuinely need 100,000+ dynamic pages.</p>

<p>The most common mistake is treating Webflow's CMS as a website builder feature rather than as a content model. Spend a day on field design upfront. Structure Collections by reference relationships rather than by duplicating data. Set slug strategy before you add the first item. The refactoring cost of getting this wrong at month 4 is much higher than the design cost at week 1.</p>

<p>If you are evaluating Webflow's CMS for a B2B SaaS project and want a practitioner's read on whether it fits, <a href="/services/seo-aeo">we run Webflow CMS architecture as part of our SEO + AEO engagements</a>.</p>
`.trim();

const NEW_FAQ = [
	{
		_key: "faq1",
		_type: "faqItem",
		question: "What is Webflow's CMS used for?",
		answer:
			"<p>Webflow's CMS is used to manage structured content that powers templated pages: blog posts, case studies, team members, products, programmatic SEO pages, and any other repeating page type. You define a Collection with typed fields once, build the template page, and the CMS renders every item through the template at the URL slug you configure. It's the right call for B2B SaaS marketing sites, case study libraries, and programmatic page trees up to about 50,000 pages per Collection.</p>",
	},
	{
		_key: "faq2",
		_type: "faqItem",
		question: "What are Webflow Collections?",
		answer:
			"<p>Collections are Webflow's content models. Each Collection has typed fields (plain text, rich text, image, link, reference, multi-reference, number, date, switch, option). Items in the Collection inherit the field structure. The fields validate input so non-technical editors cannot accidentally break the content model. Collections can reference other Collections (1:1 or 1:many), which lets you build complex relationships like case studies linked to industries linked to services without writing custom code.</p>",
	},
	{
		_key: "faq3",
		_type: "faqItem",
		question: "What is the limit on Webflow CMS items?",
		answer:
			"<p>Standard Webflow plans cap at 10,000 items per Collection. Enterprise plans push that to 50,000+. Sites that genuinely need hundreds of thousands of dynamic pages outgrow Webflow's CMS and need a different architecture (headless CMS + Next.js, or Sanity + a separate frontend framework).</p>",
	},
	{
		_key: "faq4",
		_type: "faqItem",
		question: "Does Webflow's CMS support draft and preview states?",
		answer:
			"<p>Not on standard plans. When you publish a Collection item on a standard plan, it goes live immediately. Webflow Enterprise adds staging environments that fix this with full draft/preview/staging workflows. For standard-plan teams that need editorial workflow, the common workaround is using a 'status' option field to mark items as Draft/Review/Published and filtering Collection Lists to only show Published items in production templates.</p>",
	},
	{
		_key: "faq5",
		_type: "faqItem",
		question: "Can Webflow's CMS handle search across content?",
		answer:
			"<p>Not natively. Webflow does not ship built-in full-text search across Collection content. Most teams add Algolia, Typesense, or a custom integration via the Webflow Data API. This is a real limitation for content-heavy sites. For sites under ~500 pages where search is nice-to-have rather than core, the dynamic filtering on Collection Lists usually covers the use case.</p>",
	},
	{
		_key: "faq6",
		_type: "faqItem",
		question: "Should I use Webflow's CMS or a headless CMS?",
		answer:
			"<p>Use Webflow's CMS when the content is tightly coupled to the marketing site, the editors are the marketing team, and the page count is under ~50,000. Use a headless CMS (Sanity, Contentful, Storyblok) when the content needs to power multiple frontends, the editorial workflow requires staging/preview/multi-step approval, or you need true full-text search. The hybrid pattern (Webflow Cloud + Sanity) is gaining traction in 2026 for teams that want Webflow's design + a headless backend.</p>",
	},
	{
		_key: "faq7",
		_type: "faqItem",
		question: "Is Webflow's CMS good for SEO?",
		answer:
			"<p>Yes, when configured correctly. Webflow generates clean HTML, fast page loads, automatic SSL, automatic sitemap.xml, and per-item SEO controls (title, description, OG image, schema). The CMS supports per-Collection meta defaults that cascade to items. For programmatic SEO patterns (geo-coded, role-coded pages), the Collection + template pattern is one of the strongest options on any platform. The bottleneck is content strategy, not the CMS.</p>",
	},
];

const TODAY = new Date().toISOString();

const result = await client
	.patch(DOC_ID)
	.set({
		name: NEW_NAME,
		metaTitle: NEW_META_TITLE,
		metaDescription: NEW_META_DESCRIPTION,
		excerpt: NEW_EXCERPT,
		content: NEW_CONTENT,
		faq: NEW_FAQ,
		lastUpdated: TODAY,
	})
	.commit();

console.log(`✓ Refreshed /blog/understanding-webflows-cms-guide`);
console.log(`  _rev: ${result._rev}`);
console.log(`  content: ${result.content.length} chars · faq: ${result.faq.length}`);
