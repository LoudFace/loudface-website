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

const DOC_ID = "imported-blogPost-67be8ca97ac167e93ab3f7fa";

const NEW_NAME = "How to Add HTML Tables in Webflow (2026): Three Approaches Compared";
const NEW_META_TITLE = "HTML Tables in Webflow 2026: 3 Approaches Compared";
const NEW_META_DESCRIPTION =
	"Three honest ways to ship tables on a Webflow site in 2026: native flex/grid, HTML Embed with raw table markup, or third-party embed. When each is right, with the AEO trade-offs.";
const NEW_EXCERPT =
	"Webflow's rich text element does not support tables natively. Here are the three honest approaches — native grid, raw HTML, third-party embed — and how to pick by where the data lives.";

const NEW_CONTENT = `
<p><strong>TL;DR:</strong> Webflow's rich text element does not natively support HTML tables. Three ways to ship tables on a Webflow site in 2026: (1) build them as native Webflow elements using Div Blocks + flex/grid layouts (right call for marketing tables, comparison tables, pricing tables), (2) embed an HTML Embed element with raw <code>&lt;table&gt;</code> markup for CMS-driven tables (right call when the table content lives in a CMS rich text field), or (3) use a third-party embed (Notion, Airtable, Google Sheets) when the table data needs to update without redeploying. Pick by where the data lives rather than what looks easiest.</p>

<p>I have shipped tables on dozens of Webflow client sites. The pattern that wastes the most time: teams reach for HTML Embed by default, then realize they cannot style the table to match the rest of the site and end up rebuilding it as native Webflow elements anyway. There are three honest approaches in 2026. This guide walks through which one fits which use case.</p>

<p>For broader Webflow context, see <a href="/blog/mastering-webflow-guide">Getting Started with Webflow in 2026</a>. For CMS architecture, see <a href="/blog/understanding-webflows-cms-guide">Webflow CMS in 2026</a>.</p>

<h2>Why Webflow does not have a native table element</h2>

<p>Tables in HTML are semantically narrow (rows + columns of related data). Most "tables" on modern marketing sites are not actually tables in the HTML sense. They are styled grids: pricing comparisons, feature matrices, side-by-side product grids. These should be built as flex/grid layouts, not as <code>&lt;table&gt;</code> elements.</p>

<p>Webflow's design philosophy reflects that. The native element library favors Div Blocks + flex/grid because those compose into anything (cards, comparison rows, pricing tables, kanban boards). True <code>&lt;table&gt;</code> markup is reserved for the cases where it is semantically correct: tabular data inside a long-form article, structured comparison data inside a CMS rich text field, financial reports with clear row/column relationships.</p>

<h2>Approach 1: Native Webflow flex/grid tables</h2>

<p>The right call for visible marketing tables on a static Webflow page: pricing comparisons, feature matrices, plan comparison grids.</p>

<h3>When this approach wins</h3>

<ul>
<li>The table is part of the page design (not embedded inside a rich text field)</li>
<li>You want full Style Manager control (hover states, responsive collapse, custom typography)</li>
<li>The table data does not change often (or never)</li>
<li>Accessibility matters (proper ARIA roles, keyboard navigation)</li>
</ul>

<h3>How to build it</h3>

<p>Build a parent <code>Grid</code> element with rows and columns matching your table dimensions. Each cell is a Div Block. Style the cells with the Style Manager (border, padding, alignment, hover states). Replace the visual <code>&lt;table&gt;</code> semantics with <code>&lt;div role="table"&gt;</code>, <code>&lt;div role="row"&gt;</code>, <code>&lt;div role="cell"&gt;</code> if accessibility audits matter.</p>

<p>For responsive collapse on mobile, switch the Grid to flex-column at the mobile breakpoint, render each "row" as a stacked card. This is the standard B2B SaaS pattern for pricing tables.</p>

<h3>When this approach is wrong</h3>

<p>When the table is inside a CMS rich text field (editors writing blog posts who need to drop in a small data table). You cannot embed a Grid element inside a rich text body in Webflow's CMS. Use Approach 2 instead.</p>

<h2>Approach 2: HTML Embed with raw <code>&lt;table&gt;</code> markup</h2>

<p>The right call for tables inside CMS rich text content (blog posts, case studies, documentation pages where editors need inline tables).</p>

<h3>When this approach wins</h3>

<ul>
<li>The table sits inside a CMS rich text field</li>
<li>The table is editorial content (data inside an article rather than a standalone page section)</li>
<li>You need true <code>&lt;table&gt;</code> semantics for AEO extraction (AI engines extract <code>&lt;table&gt;</code> markup more reliably than <code>&lt;div role="table"&gt;</code> markup)</li>
<li>Editors can write the table HTML themselves (or paste from a converter)</li>
</ul>

<h3>How to build it</h3>

<p>In the Webflow CMS rich text field, place an HTML Embed element wherever the table should appear. Paste raw HTML inside:</p>

<pre><code>&lt;table class="content-table"&gt;
  &lt;thead&gt;
    &lt;tr&gt;&lt;th&gt;Tier&lt;/th&gt;&lt;th&gt;Price&lt;/th&gt;&lt;th&gt;Includes&lt;/th&gt;&lt;/tr&gt;
  &lt;/thead&gt;
  &lt;tbody&gt;
    &lt;tr&gt;&lt;td&gt;Starter&lt;/td&gt;&lt;td&gt;$19/mo&lt;/td&gt;&lt;td&gt;1 site, basic features&lt;/td&gt;&lt;/tr&gt;
    &lt;tr&gt;&lt;td&gt;Pro&lt;/td&gt;&lt;td&gt;$49/mo&lt;/td&gt;&lt;td&gt;5 sites, all features&lt;/td&gt;&lt;/tr&gt;
  &lt;/tbody&gt;
&lt;/table&gt;</code></pre>

<p>Add a small <code>&lt;style&gt;</code> block (or define the styles globally in Webflow's Project Settings → Custom Code) to control table appearance. Style the <code>.content-table</code> class with the same typography, spacing, and color tokens as the rest of the design system.</p>

<h3>When this approach is wrong</h3>

<p>When editors are not technical enough to write HTML, or when the table needs to be styled differently per CMS item. Centralize the styling globally so each Embed only contains data, not styling, and editors only ever paste the inner <code>&lt;tr&gt;&lt;td&gt;</code> rows.</p>

<h2>Approach 3: Third-party embed (Notion, Airtable, Google Sheets)</h2>

<p>The right call for tables that need to update without redeploying the Webflow site.</p>

<h3>When this approach wins</h3>

<ul>
<li>The table data changes frequently (e.g., a public pricing comparison that the marketing team updates weekly)</li>
<li>Multiple teams own different rows (e.g., engineering owns feature data, sales owns customer logo data)</li>
<li>The table is also used in other places (Notion doc, sales deck, customer-facing dashboard)</li>
<li>You don't want to deploy the Webflow site every time a row changes</li>
</ul>

<h3>How to build it</h3>

<p>For Notion: create a Notion database, publish it to the web, embed via an iframe inside an HTML Embed element in Webflow. For Airtable: similar — share the table view via a public link and embed via iframe. For Google Sheets: publish the sheet to web (File → Share → Publish to web) and embed the rendered URL.</p>

<h3>When this approach is wrong</h3>

<p>When SEO/AEO matters. Third-party embedded tables are rendered inside iframes, which means Google and AI engines do not see the content as part of your page. The content is hosted on notion.so or airtable.com, not on your domain. For any table you want Google or AI engines to extract as part of your page, use Approach 1 or 2 instead.</p>

<h2>How to decide</h2>

<p>A 30-second decision tree:</p>

<ol>
<li><strong>Is the table inside a CMS rich text field?</strong> → Approach 2 (HTML Embed with <code>&lt;table&gt;</code>).</li>
<li><strong>Does the data change weekly+ without warranting a redeploy?</strong> → Approach 3 (third-party embed). Accept the AEO trade-off.</li>
<li><strong>Is the table part of the page design and stable?</strong> → Approach 1 (native flex/grid). Best for design control and AEO.</li>
</ol>

<h2>Common mistakes</h2>

<p>Three patterns I have seen on client engagements:</p>

<ol>
<li><strong>Defaulting to HTML Embed for marketing tables.</strong> Then realizing the styling needs to match the design system and rebuilding as native Webflow elements anyway. Pick the right approach upfront.</li>
<li><strong>Using third-party embeds for content that matters for SEO.</strong> Pricing tables, comparison tables, and feature matrices belong on your domain in your own HTML. AI engines extract <code>&lt;table&gt;</code> markup; they cannot see content inside cross-origin iframes.</li>
<li><strong>Forgetting to style the embedded <code>&lt;table&gt;</code> to match the design system.</strong> A raw browser-default <code>&lt;table&gt;</code> looks like a 2003 web page. Add the global CSS for <code>.content-table</code> once and reuse.</li>
</ol>

<h2>The honest takeaway</h2>

<p>Webflow does not have a native table element by design, and that is the right call for most marketing-site tables (which should be flex/grid layouts anyway). For CMS rich text tables, raw <code>&lt;table&gt;</code> markup inside an HTML Embed is the cleanest path. For frequently-updated tables, third-party embeds work but cost you SEO and AEO visibility on the content.</p>

<p>Pick by where the data lives and how it changes. What feels easiest in the moment is rarely the right call.</p>

<p>If you want help structuring data presentation on a B2B SaaS Webflow site, <a href="/services/seo-aeo">we run Webflow engagements that include design system patterns for tables and comparison content</a>.</p>
`.trim();

const NEW_FAQ = [
	{
		_key: "faq1",
		_type: "faqItem",
		question: "Does Webflow support HTML tables natively?",
		answer:
			"<p>Webflow's rich text element does not include a native <code>&lt;table&gt;</code> insert button, and the Designer does not have a native Table element. The platform's design philosophy favors Div Blocks + flex/grid layouts for visual tables (pricing comparisons, feature matrices) because those compose into anything. True <code>&lt;table&gt;</code> markup is supported but has to be added via HTML Embed elements or custom code, which is the right approach for tabular data inside CMS rich text content.</p>",
	},
	{
		_key: "faq2",
		_type: "faqItem",
		question: "How do I add a pricing table to a Webflow page?",
		answer:
			"<p>For visible pricing tables on marketing pages, build them as native Webflow flex/grid elements rather than HTML tables. Use a parent Grid element with rows for tiers and columns for features. Each cell is a Div Block styled through the Style Manager. This gives you full design control, hover states, and clean responsive collapse on mobile. Skip HTML Embed for marketing tables — you'll lose styling control and end up rebuilding anyway.</p>",
	},
	{
		_key: "faq3",
		_type: "faqItem",
		question: "How do I put a table inside a Webflow CMS blog post?",
		answer:
			"<p>Use an HTML Embed element inside the rich text body field. Paste raw <code>&lt;table&gt;</code> markup with <code>&lt;thead&gt;</code>, <code>&lt;tbody&gt;</code>, <code>&lt;tr&gt;</code>, <code>&lt;th&gt;</code>, and <code>&lt;td&gt;</code> elements. Style the table globally via Webflow's Project Settings → Custom Code (define a <code>.content-table</code> class with typography, borders, and spacing that match the design system). This gives you true <code>&lt;table&gt;</code> semantics, which AI engines extract more reliably than div-based table substitutes.</p>",
	},
	{
		_key: "faq4",
		_type: "faqItem",
		question: "Should I use Notion or Airtable to embed tables in Webflow?",
		answer:
			"<p>Only if the table data needs to update without redeploying the Webflow site, and you accept that the embedded content won't help SEO or AEO. Third-party embeds render inside iframes, which Google and AI engines do not parse as part of your page. The content lives on notion.so or airtable.com, not on your domain. For any table you want indexed and citable, use native Webflow elements or HTML Embed with raw <code>&lt;table&gt;</code> markup instead.</p>",
	},
	{
		_key: "faq5",
		_type: "faqItem",
		question: "Are HTML tables good for SEO and AEO?",
		answer:
			"<p>Yes, when used correctly. Google indexes <code>&lt;table&gt;</code> markup as structured data, and AI engines (ChatGPT, Perplexity, Google AI Overviews) extract table content reliably when the table has proper <code>&lt;thead&gt;</code>/<code>&lt;tbody&gt;</code>/<code>&lt;th&gt;</code>/<code>&lt;td&gt;</code> structure. For comparison content (pricing tiers, feature matrices, product specs), true <code>&lt;table&gt;</code> markup is more AEO-friendly than div-based table substitutes. The mistake is using <code>&lt;table&gt;</code> for non-tabular layout, which Google penalizes as a semantic mismatch.</p>",
	},
	{
		_key: "faq6",
		_type: "faqItem",
		question: "Can I style HTML tables to match my Webflow design system?",
		answer:
			"<p>Yes, with global custom CSS. Define a class (e.g., <code>.content-table</code>) in Webflow's Project Settings → Custom Code with the typography, color, border, and spacing tokens that match the rest of the design system. Apply that class to every <code>&lt;table&gt;</code> element you embed in CMS content. Editors only paste the data; the global CSS handles consistent styling across every table on the site.</p>",
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

console.log(`✓ Refreshed /blog/add-html-tables-in-webflow-cms`);
console.log(`  _rev: ${result._rev}`);
