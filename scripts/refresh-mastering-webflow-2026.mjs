#!/usr/bin/env node
/**
 * Refresh /blog/mastering-webflow-guide for 2026.
 * From the 2024-10-10 mass AI-gen drop. Same _id, same slug.
 * New angle: practitioner's getting-started guide in LoudFace voice.
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

const DOC_ID = "imported-blogPost-67be8cab8309d9c295fa5519";

const NEW_NAME = "Getting Started with Webflow in 2026: A Practitioner's Guide";
const NEW_META_TITLE = "Getting Started with Webflow 2026: Practitioner Guide";
const NEW_META_DESCRIPTION =
	"What Webflow actually is in 2026: Designer, CMS, E-commerce, Hosting. When it's the right pick for B2B SaaS marketing sites and when a simpler tool wins. Practitioner perspective from a Webflow Premium Enterprise Partner.";
const NEW_EXCERPT =
	"Webflow in 2026 is a visual web development platform that ships real HTML, CSS, and JavaScript. Here's what each part does, where Webflow shines, where it doesn't, and how to know if it fits your project.";

const NEW_CONTENT = `
<p><strong>TL;DR:</strong> Webflow in 2026 is a visual web development platform with four parts: the Designer (where you build), the CMS (where your content lives), Webflow E-commerce (a Stripe-backed checkout layer), and managed hosting on AWS + Fastly. It is the right pick for marketing teams that want full design control without engineering bottlenecks. It is the wrong pick for content sites with 50,000+ pages, anything that needs server-side custom logic, or pure landing-page tools where a simpler builder is faster. Webflow Optimize (A/B testing) and Webflow AI personalization launched at the 2024 Conference and are part of the Enterprise tier now.</p>

<p>I have shipped Webflow sites for B2B SaaS and fintech clients for two years. Every founder I talk to asks the same first question: "what is Webflow actually for?" The answer is more specific than the marketing copy on webflow.com.</p>

<p>This guide is the practitioner's version. What Webflow is, what each part does, where it shines, where it does not, and how to know if it is the right platform for your project before you sign up.</p>

<h2>What Webflow is</h2>

<p>Webflow is a visual web development tool that produces clean HTML, CSS, and JavaScript without you writing code. You drag elements onto a canvas, style them with a visual representation of CSS classes, and Webflow generates the underlying code that ships to production. The output is real HTML. Searchable by Google, parseable by AI engines, deployable to any host (though Webflow's own hosting is the default and usually the right call).</p>

<p>That last point is what separates Webflow from page builders like Squarespace or Wix. Those platforms ship a black-box runtime that imposes constraints. Webflow ships HTML/CSS/JS you could theoretically host elsewhere if you wanted to. The platform sells the convenience of not having to.</p>

<h2>The four parts of Webflow</h2>

<h3>1. The Designer</h3>

<p>The Webflow Designer is the canvas. You build pages here. The interface is closer to Figma than to WordPress: you select an element, see its style properties in a right-side panel, and modify visual properties (colors, padding, layout) that translate directly to CSS.</p>

<p>The learning curve is real. People who already think in HTML/CSS terms get productive in days. People coming from drag-and-drop builders take weeks because Webflow's abstraction is the actual web platform (the box model, flexbox, CSS classes, breakpoints) rather than a simplified layer on top.</p>

<p>The Designer ships variants of every element class through the Style Manager. Change the class once, every instance updates. This is what makes Webflow scale to real production sites.</p>

<h3>2. The CMS</h3>

<p>Webflow's CMS lets you define Collections (think: blog posts, products, team members, case studies) and then template the rendering. You build the template once, the CMS populates each item.</p>

<p>The strengths: typed fields (rich text, references, images, multi-reference), nested references, dynamic filtering and sorting on Collection lists. You can build entire programmatic page trees. Toku uses this for /rates/{role}-{country} pages without writing custom code.</p>

<p>The limits: 10,000 items per Collection on standard plans (higher on Enterprise), no draft/preview state on standard plans, no full-text search built in. Sites that need 50,000+ pages or rich editorial workflows usually outgrow Webflow's CMS eventually.</p>

<h3>3. E-commerce</h3>

<p>Webflow E-commerce adds a checkout layer on top of the CMS. Products are a Collection. Cart, checkout, and order management are built-in pages you can style fully. Payments integrate with Stripe, Apple Pay, PayPal, and Google Pay out of the box.</p>

<p>The right fit: brand-led ecommerce stores where the design matters more than the catalog depth. Premium furniture, jewelry, niche DTC brands.</p>

<p>The wrong fit: large-catalog stores (5,000+ SKUs with variants), B2B procurement, subscription billing with complex logic, multi-currency international ops. Shopify or BigCommerce remains the right pick at scale.</p>

<h3>4. Hosting</h3>

<p>Webflow Hosting runs on AWS with Fastly as the CDN. Sub-100ms global response times. Automatic SSL. Edge-cached HTML so even a marketing site can load in under a second. This is the part most teams underrate when comparing Webflow to self-hosted alternatives.</p>

<p>What you give up by using Webflow Hosting: server-side custom logic. You can use Webflow's Logic feature (released 2023) for form workflows, but anything that needs to query a database, hit an external API on render, or do server-side personalization needs to live outside Webflow (typically Vercel/Netlify with Webflow's API as the data source. Webflow Cloud, released 2025, makes this pattern much cleaner).</p>

<h2>When Webflow is the right choice</h2>

<p>Three patterns where Webflow consistently delivers:</p>

<ol>
<li><strong>B2B SaaS marketing sites.</strong> Design control matters, but the page count is moderate (50-500 pages), the conversion path is form/booking driven, and the marketing team wants to ship landing pages without a JIRA ticket. This is the LoudFace bread-and-butter use case.</li>
<li><strong>Brand-led ecommerce up to ~1,000 SKUs.</strong> When the design is the differentiator (premium furniture, designer jewelry, DTC), Webflow E-commerce gives you full control over the buyer experience that Shopify themes do not.</li>
<li><strong>Programmatic content sites with structured data.</strong> A /rates/{role}-{country} tree. A /integrations/{platform} directory. A /answers/{question} structure. The CMS makes these trivial to build and the AEO upside is significant.</li>
</ol>

<h2>When Webflow is not the right choice</h2>

<p>Three patterns where Webflow forces compromises:</p>

<ol>
<li><strong>Massive content sites.</strong> 10,000+ pages per Collection, full-text search, complex editorial workflows, or content moderation at scale. Sanity + Next.js or a headless WordPress setup wins here.</li>
<li><strong>Server-rendered application logic.</strong> If the page output depends on database queries or third-party API responses at render time, Webflow's static rendering does not fit. Use Webflow Cloud or a separate framework.</li>
<li><strong>Simple landing-page-only needs.</strong> If you are building a single landing page for an ad campaign, Webflow is overkill. Carrd, Framer, or even a Stripe Payment Link in a Notion page is faster and cheaper.</li>
</ol>

<h2>Building your first Webflow site</h2>

<p>The honest minimum to launch a real B2B site:</p>

<ol>
<li><strong>Create a project</strong> in your Webflow Workspace. Pick the Workspace tier that matches your needs (most B2B teams need Workspace Pro for staging + CMS limits).</li>
<li><strong>Build the global components first.</strong> Navbar, footer, button styles, typography scale. These define the design system every other page inherits.</li>
<li><strong>Set up the Style Manager classes</strong> so a single change cascades. This is what separates a maintainable Webflow site from a CSS sprawl that requires fixing 50 pages every time the brand color changes.</li>
<li><strong>Build one page end-to-end</strong> before templating. The home page is usually the right starting point because it forces decisions about layout, hero pattern, section spacing, and CTA placement.</li>
<li><strong>Set up the CMS Collections</strong> the site needs (blog, case studies, team, etc.). Define fields first, then build the templates.</li>
<li><strong>Connect a custom domain</strong> and publish. Webflow handles SSL automatically.</li>
</ol>

<p>The mistake most teams make: starting with a blank page and figuring out the design system as they go. The fix: design system first, pages second. Costs an extra week upfront, saves three months of refactoring later.</p>

<h2>Going from "started" to production-ready</h2>

<p>A site that exists is not a site that works. What gets a Webflow site from "live" to "actually performing":</p>

<ul>
<li><strong>Schema markup on every page.</strong> Article, FAQPage, BreadcrumbList, Organization. AI engines use schema to resolve entity authority; missing schema is the #1 reason Webflow sites do not get cited in <a href="/blog/answer-engine-optimization-guide-2026">AI search results</a>.</li>
<li><strong>Direct-answer paragraphs near the top of every page.</strong> A 60-word block that answers the page's core question, formatted for <a href="/blog/how-to-structure-content-for-ai-extraction">AI extraction</a>.</li>
<li><strong>Real Core Web Vitals discipline.</strong> Webflow's hosting handles a lot for you, but heavy interactions, oversized images, and third-party scripts can still tank LCP. Run PageSpeed Insights monthly.</li>
<li><strong>A search-intent strategy that maps pages to queries.</strong> Webflow makes it trivial to ship pages. Without an intent map, you end up with 50 pages that target nothing specific. See our <a href="/blog/best-webflow-split-testing-tools-compared">Best Webflow A/B Testing Tools (2026)</a> piece for the experimentation half.</li>
<li><strong>An analytics stack that closes the loop.</strong> PostHog (or your CRM with first-touch attribution) for pipeline attribution. GA4 for traffic patterns. GSC for search performance.</li>
</ul>

<p>A Webflow site without those five layers is a brochure. With them, it is a growth surface.</p>

<h2>The honest takeaway</h2>

<p>Webflow is a visual platform that produces real HTML/CSS/JS, hosted on a fast managed runtime. It is the right pick for B2B SaaS marketing sites, design-led ecommerce, and programmatic content. It is the wrong pick for very large content sites, server-side application logic, or single-landing-page projects where simpler tools are faster.</p>

<p>The platform has matured significantly in 2024-2025. Webflow Optimize, Webflow AI, Webflow Cloud, and Webflow Logic all closed gaps the platform used to have. Most teams comparing Webflow to alternatives are still using a mental model that is two years out of date.</p>

<p>If you are evaluating Webflow for a B2B SaaS site and want a practitioner's read on whether it fits, <a href="/services/seo-aeo">we run Webflow engagements as part of our SEO + AEO program</a>.</p>
`.trim();

const NEW_FAQ = [
	{
		_key: "faq1",
		_type: "faqItem",
		question: "What makes Webflow different from other website builders in 2026?",
		answer:
			'<p>Webflow produces real HTML, CSS, and JavaScript that you could host anywhere. Most other "no-code" builders ship a proprietary runtime that locks you in. The Designer abstracts the visual building work but exposes the underlying CSS class system, so it scales to production sites with hundreds of pages without the design system collapsing. Combined with the native CMS, E-commerce, Optimize (A/B testing), and AI personalization added in 2024-2025, Webflow has become a full platform rather than a builder.</p>',
	},
	{
		_key: "faq2",
		_type: "faqItem",
		question: "How do you build your first homepage in Webflow?",
		answer:
			'<p>Start with the global components (navbar, footer, button styles) before any single page. Build out the Style Manager class system so brand updates propagate site-wide. Then build the home page section by section: hero, social proof, value props, conversion path, footer. Use the CMS for anything you\'ll repeat (team members, case studies, logos). Connect a custom domain when the design system feels stable, not when the home page is "done."</p>',
	},
	{
		_key: "faq3",
		_type: "faqItem",
		question: "How do you make a Webflow website responsive in 2026?",
		answer:
			"<p>Webflow's responsive system uses breakpoints (desktop, tablet, mobile landscape, mobile portrait by default). Style each element at the largest breakpoint first, then adjust as you step down. Use relative units (rem, vw, %) over pixels for typography and spacing. Test on real devices, not just the Designer preview. Particularly Safari on iOS, which still has quirks the browser preview hides. For more complex needs (custom mobile interactions, tablet-specific layouts), add custom breakpoints in the Style Manager.</p>",
	},
	{
		_key: "faq4",
		_type: "faqItem",
		question: "What is Webflow Optimize?",
		answer:
			'<p>Webflow Optimize is Webflow\'s native A/B testing and personalization tool, launched at the 2024 Webflow Conference. It runs tests directly inside the Designer (no external scripts), supports audience segmentation, and includes AI-powered personalization. Pricing starts at $299/month and the tool is available on Webflow Enterprise. For details on whether it is the right A/B testing tool for your team, see our <a href="/blog/best-webflow-split-testing-tools-compared">comparison piece</a>.</p>',
	},
	{
		_key: "faq5",
		_type: "faqItem",
		question: "When should I NOT use Webflow?",
		answer:
			"<p>Three scenarios. (1) Massive content sites with 10,000+ pages per Collection, full-text search, or complex editorial workflows. Headless WordPress or Sanity + Next.js is better. (2) Anything requiring server-side custom logic at render time. Webflow's static rendering does not fit; use Webflow Cloud or a separate framework. (3) Single landing pages for ad campaigns. Carrd, Framer, or a simpler tool is faster. Webflow's strength is mid-volume marketing sites and design-led ecommerce, not extremes on either end.</p>",
	},
	{
		_key: "faq6",
		_type: "faqItem",
		question: "What does Webflow Enterprise add beyond standard pricing tiers?",
		answer:
			"<p>Webflow Enterprise unlocks higher CMS item limits (typically 50,000+ per Collection), staging environments, custom workspace roles, dedicated Webflow support, SLA-backed uptime, Webflow Optimize, and access to Webflow Cloud for server-rendered logic. Pricing is custom and typically lands in the $1,500-$5,000/month range depending on scale. Worth it when the marketing site is the primary growth surface and downtime or limits would block the team.</p>",
	},
	{
		_key: "faq7",
		_type: "faqItem",
		question: "Is Webflow good for SEO and AEO in 2026?",
		answer:
			'<p>Yes, with the caveat that the platform handles the infrastructure (clean HTML, fast CDN, automatic SSL, robots.txt, sitemaps) but the strategy is on you. Direct-answer paragraphs, schema markup, internal linking, and a coherent content architecture matter more than the platform choice. We run dedicated SEO + AEO programs for B2B SaaS Webflow sites. See <a href="/blog/answer-engine-optimization-guide-2026">The Complete Guide to Answer Engine Optimization (AEO)</a> for the playbook.</p>',
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

console.log(`✓ Refreshed /blog/mastering-webflow-guide`);
console.log(`  _id: ${result._id}`);
console.log(`  _rev: ${result._rev}`);
console.log(`  content: ${result.content.length} chars · faq: ${result.faq.length}`);
