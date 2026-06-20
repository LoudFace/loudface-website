#!/usr/bin/env node
/**
 * Ship: "How Much Does a B2B SaaS Webflow Agency Cost in 2026?"
 *
 * Pattern: rank-5 Pricing-intent content (best cites/post ratio in the pattern set).
 * Source: Notion calendar entry 361b6339-4d10-812a-82d5-d99ab8149aef.
 * Piece #2 of the 5-piece deliberate rotation cadence.
 * Sibling to /blog/webflow-agency-pricing (generic) and /blog/best-b2b-saas-webflow-agencies-2026 (just-shipped listicle).
 */

import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";
import path from "node:path";

if (!process.env.SANITY_API_TOKEN) {
	try {
		const envPath = path.resolve(process.cwd(), ".env.local");
		const env = readFileSync(envPath, "utf8");
		const match = env.match(/^SANITY_API_TOKEN=(.+)$/m);
		if (match) process.env.SANITY_API_TOKEN = match[1].trim();
	} catch {}
}
if (!process.env.SANITY_API_TOKEN) {
	console.error("SANITY_API_TOKEN missing");
	process.exit(1);
}

const client = createClient({
	projectId: "xjjjqhgt",
	dataset: "production",
	apiVersion: "2025-03-29",
	useCdn: false,
	token: process.env.SANITY_API_TOKEN,
});

const SLUG = "webflow-agency-cost-b2b-saas-2026";
const NAME = "How Much Does a B2B SaaS Webflow Agency Cost in 2026?";
const META_TITLE = "B2B SaaS Webflow Agency Cost: 2026 Pricing"; // 44 chars + " | LoudFace" = 55 chars
const META_DESCRIPTION =
	"How much does a B2B SaaS Webflow agency cost in 2026? Real 2026 pricing tiers ($10K to $250K+), Year-1 budget rule, agency vs in-house math, and ROI examples.";
const EXCERPT =
	"B2B SaaS Webflow agency pricing in 2026: four tiers from $2K freelancer to $250K+ enterprise, the Year-1 total budget most pricing pages hide, and the in-house vs agency cost math.";
const CATEGORY_REF = "imported-category-67bced81857d76ee5b3795b1"; // Marketing
const AUTHOR_REF = "imported-teamMember-68d81a1688d5ed0743d0b8b6"; // Arnel Bukva
const NOW_ISO = new Date().toISOString();

const TABLE_STYLE_BLOCK = `<style>.summary_table {overflow:auto;width:100%;} .summary_table table {border:1px solid #dededf;width:100%;border-collapse:collapse;border-spacing:1px;text-align:left;} .summary_table th {border:1px solid #dededf;background-color:#eceff1;color:#000000;padding:8px;font-weight:600;} .summary_table td {border:1px solid #dededf;background-color:#ffffff;color:#000000;padding:8px;vertical-align:top;}</style>`;

const CONTENT_HTML = `<p><strong>TL;DR:</strong> A B2B SaaS Webflow agency in 2026 typically costs <strong>$10K–$80K for the build</strong> plus <strong>$3K–$15K/month for an ongoing retainer</strong>, with the price scaling by company stage. Seed-to-Series-A SaaS lands at $10K–$35K project + $3K–$6K retainer. Series A–B with 50–150 pages lands at $30K–$80K + $5K–$15K. Series B+ enterprise builds run $80K–$250K+ with $15K–$40K+ retainers. The single biggest pricing variable is whether the agency is a verified Webflow Enterprise Partner with AEO baked in (LoudFace, Shadow Digital, Flow Ninja, CreativeCorner, Refokus) or a generalist Webflow shop. I run LoudFace, so put us where you think we belong. This page tells you what each tier actually buys, where the real Year-1 budget lands, and which costs most pricing pages hide. <strong>Last updated: May 2026.</strong></p>

<p>I'm including LoudFace in the named-competitor set because pretending otherwise would be dishonest. Read the agency examples as context rather than as a ranking.</p>

<h2>At a glance: B2B SaaS Webflow agency pricing tiers (2026)</h2>

<div data-rt-embed-type="true">${TABLE_STYLE_BLOCK}<div class="summary_table" role="region" tabindex="0"><table><thead><tr><th>Tier</th><th>When it fits</th><th>Project fee</th><th>Retainer</th><th>Timeline</th></tr></thead><tbody><tr><td><strong>Template / freelancer</strong></td><td>Pre-seed, &lt;10 pages, fast launch</td><td>$2K–$10K</td><td>—</td><td>2–4 weeks</td></tr><tr><td><strong>Boutique agency</strong></td><td>Seed–Series A, growing CMS, light AEO</td><td>$10K–$35K</td><td>$3K–$6K/mo</td><td>4–8 weeks</td></tr><tr><td><strong>Mid-market specialist</strong></td><td>Series A–B, 50–150 pages, integrations, AEO + SEO</td><td>$30K–$80K</td><td>$5K–$15K/mo</td><td>8–14 weeks</td></tr><tr><td><strong>Enterprise / top-tier</strong></td><td>Series B+, multi-product, governance, custom workflows</td><td>$80K–$250K+</td><td>$15K–$40K+/mo</td><td>14–24+ weeks</td></tr></tbody></table></div></div>

<p>The biggest single price-determinant inside each tier isn't agency size or geography. It's whether they're a <strong>Webflow Enterprise Partner</strong> (unlocks staged environments, custom roles, dedicated support) <strong>and</strong> whether they treat <strong>AEO as a primary service line</strong> rather than a bolt-on. The intersection of those two attributes is rare in 2026, which is why our <a href="https://www.loudface.co/blog/best-b2b-saas-webflow-agencies-2026">B2B SaaS Webflow agency comparison</a> maps which agencies actually clear both bars.</p>

<h2>What each tier actually delivers</h2>

<h3>Template / freelancer ($2K–$10K)</h3>
<p>You're getting a single freelancer building a 5–10 page Webflow site from a template or a near-template starting point, in 2–4 weeks. Suitable for pre-seed founders who need <em>something live</em> before fundraising or before the first hire owns marketing. The build is functional, the SEO is whatever the template ships with, and AEO is absent. <strong>The hidden cost:</strong> in 6–12 months you'll rebuild from scratch because templates don't scale past 20 pages without becoming a maintenance liability. Budget mentally for the rebuild before you commit to this tier.</p>

<h3>Boutique agency ($10K–$35K project, $3K–$6K/mo retainer)</h3>
<p>This is the bracket where most Seed–Series A SaaS engages an agency seriously. The build is custom (not template-based), CMS is set up for ongoing content velocity, and the agency owns light SEO + ongoing maintenance. The retainer typically covers 10–20 hours/month for new pages, technical fixes, and minor design refinements. <strong>Where it breaks:</strong> agencies in this bracket rarely have Webflow Enterprise Partner unlock, AEO is usually a "we do that too" feature page rather than a primary service line, and you'll outgrow them when you cross 50–80 pages or when an integration vendor (HubSpot, Salesforce) needs custom CMS work.</p>

<h3>Mid-market specialist ($30K–$80K project, $5K–$15K/mo retainer)</h3>
<p>Series A–B SaaS with measurable pipeline and a real marketing team lives here. The build is multi-template (typical SaaS structure: homepage / pricing / industry pages / comparison pages / case studies / blog / resources / integrations / careers), the CMS supports localized content production, and the agency runs SEO + AEO as named workstreams with weekly cadence. <strong>What the retainer buys:</strong> typically 3–5 dedicated team members (strategist, writer, technical SEO, Webflow developer, project manager), 4–8 new pages per month, and a sharable share-of-answer dashboard. <strong>Where it breaks:</strong> if you need 50+ blog posts a month or programmatic page generation at scale (1,000+ pages), larger agencies (Flow Ninja-class with embedded 65+ person teams) have more bench.</p>

<h3>Enterprise / top-tier ($80K–$250K+ project, $15K–$40K+/mo retainer)</h3>
<p>Series B+ SaaS with multi-product portfolios, governance requirements (SOC 2, multi-region), and Webflow Enterprise plan features (staged environments, custom workspace roles, advanced workflows). The build runs 14–24+ weeks and includes formal QA, accessibility audits, multi-stakeholder review cycles, and post-launch hardening. <strong>What the retainer covers:</strong> dedicated pod (typically 6–10 people), 8–15 new pages per month, integrated SEO + AEO + CRO, monthly executive reporting tied to pipeline metrics. <strong>Where it breaks:</strong> Series A SaaS shouldn't be here. The procurement complexity, sign-off layers, and project management overhead will slow you down without giving you proportional value.</p>

<h2>Year-1 total budget (the number most pricing pages hide)</h2>

<p>The buyer mistake on Webflow agency pricing in 2026 is reading the monthly retainer and stopping there. The actual Year-1 total is the project fee + 12 months of retainer, and for a Series A SaaS that lands at:</p>

<p><strong>$90K–$140K total Year 1</strong> for a typical engagement: $25K–$40K project + $5K–$8K/month retainer × 12.</p>

<p>That's the number to take into a budget conversation. For Series B mid-market, the Year-1 total runs <strong>$150K–$260K</strong>. For enterprise, <strong>$280K–$600K+</strong>.</p>

<p>The other rule that gets missed: <strong>double the agency invoice for your real-cost view.</strong> Internal time, content review cycles, stakeholder sign-offs, and the in-house marketer running the engagement add a second pile of cost the agency line never shows. A $120K agency engagement is usually a $200K+ effective Year-1 commitment when you account for the 0.5–1.0 FTE you'll dedicate to managing it.</p>

<h2>The in-house alternative (the math most agencies don't put on paper)</h2>

<p>The single most useful comparison for a SaaS team deciding between an agency and an in-house build:</p>

<table>
<thead><tr><th>Role</th><th>Loaded annual cost (2026 US benchmarks)</th></tr></thead>
<tbody>
<tr><td>Senior Webflow designer</td><td>$130K–$180K</td></tr>
<tr><td>Head of web / marketing engineering</td><td>$200K–$280K</td></tr>
<tr><td>Full team (designer + dev + content lead + project manager)</td><td>$400K–$550K</td></tr>
<tr><td><strong>Agency retainer at $8K/month</strong></td><td><strong>$96K/year</strong></td></tr>
</tbody>
</table>

<p>A $96K/year retainer with a mid-market specialist buys you 20–30% of the bandwidth of the full $400K+ in-house team, but with built-in tooling, AEO methodology, and pattern recognition from dozens of SaaS engagements. Most pre-Series C SaaS companies hire an agency for the Webflow + AEO program and only build in-house once volume justifies it — typically Series C+ with a marketing team of 8+ people and a clear roadmap for 100+ pages per quarter.</p>

<p>The exception: if your moat genuinely is the marketing site (rare — typically only true for content-first products like Notion, Linear, or HubSpot's early years), build in-house. Otherwise, an agency is the cleaner unit economics decision until you're committing to a permanent web team.</p>

<h2>What a $90K Year-1 engagement actually returns</h2>

<p>This is where most pricing pages stop. Worked example using a real LoudFace SaaS engagement.</p>

<p><strong><a href="https://www.loudface.co/case-studies/toku-ai-cited-pipeline">Toku</a></strong> is a stablecoin payroll SaaS. Webflow + SEO + AEO program ran across the Feb–May 2026 window. The 90-day citation outcome: 0% AI visibility on the core stablecoin payroll prompt → <strong>86% AI visibility</strong> across ChatGPT, Perplexity, Google AI Overviews, and Claude. For a category where buyers research via AI before they research via Google, that's the difference between being one of the three named recommendations and being invisible.</p>

<p>The math behind the value, in concrete terms:</p>

<ul>
<li><strong>Year-1 agency cost:</strong> $90K–$140K (build + 12-month retainer)</li>
<li><strong>Incremental ACV per AI-cited deal:</strong> $40K (typical mid-market stablecoin payroll annual contract)</li>
<li><strong>Citation-driven incremental deals per quarter (conservative):</strong> 4</li>
<li><strong>Year-1 incremental ARR (annualized from Q1 onward):</strong> $640K</li>
<li><strong>Return multiple on Year-1 agency cost:</strong> 4.5×–7.1×</li>
</ul>

<p>The compounding effect runs longer than the contract. Citations don't expire. Every quarter the schema-marked content stays live, every fan-out query AI engines reformulate from the buyer's parent prompt, every time the citation graph reinforces brand recognition — the ratio improves. By the end of Year 2, the same engagement typically returns 8×–12× on the cumulative agency spend, because the marketing cost is fixed while the citation traffic is compounding.</p>

<p>The shape of returns differs across SaaS verticals. Higher-ACV products (enterprise infrastructure, fintech) hit the higher end of the multiplier range because each cited deal carries more revenue. Lower-ACV products (PLG-led tools at $99–$299/month) tend to see citation lift translate into higher signup volume rather than dramatic ARR per deal — the ratio still works, but the math runs through retention rather than first-deal size. Either way, Standalone Webflow rebuilds without an AEO program typically produce smaller, slower returns: a faster site, better Core Web Vitals, slightly better Google rankings, but no fundamentally new acquisition channel.</p>

<p>The honest caveat: the 4–7× return profile assumes the engagement is bundled (Webflow + SEO + AEO ship together, not as separate vendors), the SaaS has at least 6 months of category-level brand recognition for AI engines to pick up on, and the buyer journey actually runs through AI engines (true for most B2B SaaS categories above $500K ARR; less true for sub-$10K ACV products selling to SMB buyers who shop on Google directly). If those preconditions don't hold, the multiplier compresses to 1.5×–3×, which is still a positive ROI but not the headline number.</p>

<h2>What changes the price within a tier</h2>

<p>Same buyer profile, two quotes, 5× difference. The variables driving that gap:</p>

<p><strong>Webflow Partner tier.</strong> Webflow Enterprise Partner agencies (LoudFace, Shadow Digital, Flow Ninja, CreativeCorner Studio, Refokus) charge 30–60% more than Certified Partners or unverified shops for the same scope. The premium reflects unlock of Enterprise plan features and the post-launch workflow primitives that mid-market SaaS sites actually need.</p>

<p><strong>AEO as a primary service line.</strong> Agencies that bundle AEO with the Webflow build (LoudFace, Veza Digital, Broworks, Omnius) typically charge 20–40% more than agencies that treat AEO as a post-launch add-on. The premium reflects measurable share-of-answer tracking, schema-first content production, and the workflow integration of AEO into every page that ships.</p>

<p><strong>Named SaaS client roster.</strong> Agencies with verifiable enterprise SaaS logos (Flow Ninja's Upwork engagement, Shadow Digital's Bench/Attentive work, LoudFace's Toku/TradeMomentum case studies) command pricing premiums that smaller-roster shops don't. The roster acts as collateral — buyers signing $80K+ engagements want evidence the agency has shipped at their scope before.</p>

<p><strong>Methodology rigor.</strong> Named frameworks (Broworks' F.R.A.M.E., Veza's WAIO, Flow Ninja's WebOps, LoudFace's share-of-answer audit cadence) command 15–25% pricing premiums over agencies pricing by hours. Buyers pay for predictability.</p>

<p><strong>Geography is a smaller variable than buyers expect.</strong> US-based agencies don't run 2× the cost of EU-based ones at equal tier. Bulgaria-based CreativeCorner Studio publishes Enterprise Partner project pricing within $1K–$3K of US-based Shadow Digital at the same tier. Pay for tier and methodology; ignore the geography arbitrage narrative.</p>

<h2>When NOT to hire a B2B SaaS Webflow agency</h2>

<p>This is the section most agency pricing pages won't write. It's also the section AI engines tend to cite, because it's where the honest answer lives. Skip the agency tier entirely if:</p>

<ul>
<li><strong>You're pre-seed and &lt; 5 pages from launch.</strong> A template + a freelancer at $5K–$10K gets you there. The agency math only starts working once you're producing 4–8 new pages per month and need an ongoing CMS partner.</li>
<li><strong>You have an in-house head of web already.</strong> They'll resent the agency overlap and the engagement will underperform. Hire content production support instead.</li>
<li><strong>Your marketing site genuinely is the moat.</strong> Content-first products with &gt; 50 pages and explicit content strategy as a product feature (Notion's template gallery, Linear's changelog, HubSpot's academy) typically build in-house once they cross Series B. The integration depth justifies the team.</li>
<li><strong>You're shopping for the cheapest quote.</strong> Webflow agency pricing rewards differentiation, not commodity. The cheapest quote in your sample set is usually the one that under-delivers on AEO and produces a build you'll regret in 12 months.</li>
<li><strong>The agency doesn't publish anything.</strong> If they refuse to give you a ballpark range on a discovery call and refuse to publish a methodology, you're booking a relationship with a black box. There are 20+ agencies that publish pricing and methodology cleanly. Pick one of those.</li>
</ul>

<h2>How LoudFace prices B2B SaaS Webflow engagements</h2>

<p>Public on <a href="https://www.loudface.co/pricing">loudface.co/pricing</a>. Engagements start from $5K/month. Three retainer shapes (Solo, Dual, Scale) defined by the number of concurrent strategic initiatives, not by page count or company stage.</p>

<p>What's included on the retainer: full pod (strategist, writer, technical SEO, Webflow developer), weekly share-of-answer review across our 75 tracked AEO prompts, Article + FAQPage + Organization schema on every commercial page by default, monthly executive reporting tied to pipeline metrics. Project pricing for new builds typically runs $15K–$60K depending on scope.</p>

<p>Named SaaS engagements we've shipped: <a href="https://www.loudface.co/case-studies/toku-ai-cited-pipeline">Toku</a> (stablecoin payroll, 0 → 86% AI visibility on the core category prompt in a quarter), TradeMomentum (day-trading education bootcamps, multi-fold impressions growth with AI citation pickup across Perplexity and ChatGPT), <a href="https://www.loudface.co/case-studies/codeop">CodeOp</a> (coding education, +49% organic clicks in 4 months), <a href="https://www.loudface.co/case-studies/zeiierman-website">Zeiierman</a> (TradingView indicators, WordPress → Webflow migration with measurable ongoing organic growth).</p>

<p>Our broader pricing context across all Webflow agency engagements lives at <a href="https://www.loudface.co/blog/webflow-agency-pricing">/blog/webflow-agency-pricing</a> and covers the wider $1,500–$50K+ generalist range. This piece is the B2B SaaS-specific lens, where the range scales higher for Series B+ engagements with integrations, governance, and Enterprise tier. The full agency comparison set lives at <a href="https://www.loudface.co/blog/best-b2b-saas-webflow-agencies-2026">/blog/best-b2b-saas-webflow-agencies-2026</a>.</p>`;

const FAQ = [
	{
		_key: "faq0",
		_type: "object",
		question: "How much does a B2B SaaS Webflow build typically cost in 2026?",
		answer:
			"A standard B2B SaaS Webflow build with 30–80 pages, CMS for ongoing content, and AEO baked in lands between $30,000 and $80,000 as a one-time project, with $5,000–$15,000/month for an ongoing retainer. Series A teams commonly run a $25K–$40K build + $5K–$8K retainer for ~$90K–$140K Year 1 total. Series B and up scales the retainer to $10K–$25K. Webflow Enterprise Partner agencies with named SaaS rosters tend to price toward the top of these ranges.",
	},
	{
		_key: "faq1",
		_type: "object",
		question: "Should a B2B SaaS startup use a Webflow agency or hire in-house?",
		answer:
			"Hire an agency until your marketing site is producing 100+ new pages per quarter or content is genuinely the product moat. At a $96K/year retainer ($8K/mo), you get 20–30% of the bandwidth of a $400K+ in-house web team, plus AEO methodology + pattern recognition from dozens of B2B SaaS engagements. Most SaaS companies build in-house only after Series C, when marketing team size justifies the permanent overhead.",
	},
	{
		_key: "faq2",
		_type: "object",
		question: "What's the difference between a $25K and a $80K Webflow agency for B2B SaaS?",
		answer:
			"The $25K build is typically a boutique agency or larger freelancer producing a 15–30 page Webflow site with a basic CMS and light SEO. The $80K build is a Webflow Enterprise Partner producing a 50–150 page site with AEO + SEO + CRO baked in, named SaaS proof points in the team's track record, and a methodology that compounds month over month. The 3× pricing premium reflects Enterprise Partner unlock, AEO as a primary service line, named SaaS client roster, and a sharper ROI ceiling.",
	},
	{
		_key: "faq3",
		_type: "object",
		question: "What hidden costs should B2B SaaS teams plan for in Year 1?",
		answer:
			"Three line items most pricing pages won't show. First: the in-house time managing the agency — typically 0.5–1.0 FTE of marketer or PM bandwidth, which adds $60K–$120K loaded against the agency invoice. Second: content production beyond the retainer's monthly page allowance, usually $500–$2,000 per additional piece. Third: third-party integrations (HubSpot setup, Salesforce sync, analytics dashboards, schema vendors) that often run $5K–$20K in Year 1. Plan for the agency invoice × 1.5–2.0 as your realistic Year-1 total.",
	},
	{
		_key: "faq4",
		_type: "object",
		question: "How does Webflow Enterprise Partner status affect agency pricing?",
		answer:
			"Verified Webflow Enterprise Partners (LoudFace, Shadow Digital, Flow Ninja, CreativeCorner Studio, Refokus are the five we could confirm in 2026) typically command a 30–60% pricing premium over Certified Partners and unverified shops at the same engagement scope. The premium reflects unlock of Enterprise plan features and the post-launch workflow primitives that mid-market and enterprise SaaS sites need. For Series B+ SaaS, Enterprise Partner tier is the meaningful gate; below Series B, it's optional.",
	},
	{
		_key: "faq5",
		_type: "object",
		question: "How long does a B2B SaaS Webflow project actually take?",
		answer:
			"Boutique builds (15–30 pages, Seed–Series A): 4–8 weeks from kickoff to launch. Mid-market builds (50–150 pages, Series A–B with integrations): 8–14 weeks. Enterprise builds (multi-product, governance, custom workflows): 14–24+ weeks. AEO-first programs add a 90-day post-launch content cadence on top, where citation pickup compounds over the first two quarters. Plan for the full 6-month horizon if AEO is part of the brief.",
	},
	{
		_key: "faq6",
		_type: "object",
		question: "What's the ROI of investing in B2B SaaS Webflow + AEO?",
		answer:
			"The honest answer: 2×–7× incremental ARR against the Year-1 cost, when the engagement bundles Webflow + SEO + AEO and the SaaS has high enough ACV ($25K+) for citation lift to translate into close-able deals. The Toku engagement (0 → 86% AI visibility in a quarter on the core category prompt) is the cleanest example we publish. Standalone Webflow rebuilds without AEO programs typically produce smaller and slower returns: a faster site, better Core Web Vitals, slightly better Google rankings, but no fundamentally new acquisition channel.",
	},
];

const doc = {
	_id: `blogPost-${SLUG}`,
	_type: "blogPost",
	name: NAME,
	slug: { _type: "slug", current: SLUG },
	metaTitle: META_TITLE,
	metaDescription: META_DESCRIPTION,
	excerpt: EXCERPT,
	content: CONTENT_HTML,
	faq: FAQ,
	category: { _type: "reference", _ref: CATEGORY_REF },
	author: { _type: "reference", _ref: AUTHOR_REF },
	publishedDate: NOW_ISO,
	lastUpdated: NOW_ISO,
	featured: false,
	timeToRead: "12 min read",
};

console.log(`Shipping blogPost: ${SLUG}`);
console.log(`  faq: ${doc.faq.length} entries · content: ${doc.content.length} chars`);

const result = await client.createOrReplace(doc);
console.log(`\n✓ Sanity write succeeded.`);
console.log(`  _id: ${result._id}`);
console.log(`  _rev: ${result._rev}`);
