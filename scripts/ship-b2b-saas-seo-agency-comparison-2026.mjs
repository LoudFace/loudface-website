#!/usr/bin/env node
/**
 * Ship: "B2B SaaS SEO Agency Comparison 2026: LoudFace vs Skale vs Omniscient vs First Page Sage"
 *
 * Pattern: X vs Y comparison (4-way head-to-head)
 * Source: Notion entry 361b6339-4d10-8142-9ce8-ff7544e3b667 (Status: Review)
 * After: status flips Draft -> Published, Sanity webhook triggers /api/revalidate -> IndexNow.
 *
 * Run from project root:
 *   node scripts/ship-b2b-saas-seo-agency-comparison-2026.mjs
 *
 * Env: SANITY_API_TOKEN must be set in shell or .env.local
 */

import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";
import path from "node:path";

// Load SANITY_API_TOKEN from .env.local if not already set
if (!process.env.SANITY_API_TOKEN) {
	try {
		const envPath = path.resolve(process.cwd(), ".env.local");
		const env = readFileSync(envPath, "utf8");
		const match = env.match(/^SANITY_API_TOKEN=(.+)$/m);
		if (match) process.env.SANITY_API_TOKEN = match[1].trim();
	} catch {}
}
if (!process.env.SANITY_API_TOKEN) {
	console.error("SANITY_API_TOKEN missing from env. Source it from .env.local or shell.");
	process.exit(1);
}

const client = createClient({
	projectId: "xjjjqhgt",
	dataset: "production",
	apiVersion: "2025-03-29",
	useCdn: false,
	token: process.env.SANITY_API_TOKEN,
});

const SLUG = "b2b-saas-seo-agency-comparison-2026";
const TITLE = "B2B SaaS SEO Agency Comparison 2026: LoudFace vs Skale vs Omniscient vs First Page Sage";
const NAME = "B2B SaaS SEO Agency Comparison 2026: LoudFace vs Skale vs Omniscient vs First Page Sage";
const META_TITLE = "B2B SaaS SEO Agency Comparison 2026"; // layout appends " | LoudFace" → 46 chars
const META_DESCRIPTION =
	"Honest 2026 comparison of B2B SaaS SEO agencies — LoudFace vs Skale vs Omniscient vs First Page Sage. Pricing, services, client outcomes, where each one fits.";
const EXCERPT =
	"Four B2B SaaS SEO agencies head-to-head in 2026: LoudFace, Skale, Omniscient, and First Page Sage. Pricing, services, named clients, where each fits and where each doesn't.";
const CATEGORY_REF = "imported-category-67bced5daeebf78a3fe1db38"; // Tech Comparison
const AUTHOR_REF = "imported-teamMember-68d81a1688d5ed0743d0b8b6"; // Arnel Bukva
const NOW_ISO = new Date().toISOString();

const TABLE_STYLE_BLOCK = `<style>.summary_table {overflow:auto;width:100%;} .summary_table table {border:1px solid #dededf;width:100%;border-collapse:collapse;border-spacing:1px;text-align:left;} .summary_table th {border:1px solid #dededf;background-color:#eceff1;color:#000000;padding:8px;font-weight:600;} .summary_table td {border:1px solid #dededf;background-color:#ffffff;color:#000000;padding:8px;vertical-align:top;}</style>`;

const CONTENT_HTML = `<p><strong>TL;DR:</strong> Four B2B SaaS SEO agencies, honestly compared. <strong>LoudFace</strong> for SaaS founders who want SEO + AEO + Webflow in one team and public pricing. <strong>Skale</strong> for SaaS-only growth shops that lean hard on AI-search outreach. <strong>Omniscient Digital</strong> for mid-market SaaS with $10k+/month budget and a full-service stack. <strong>First Page Sage</strong> for enterprise brands that need a generalist with broad attribution. I run LoudFace, so put us where you think we belong. This page tells you where each agency actually fits and where they don't.</p>

<p>I'm including us in this comparison because we operate in this category, our work shows up alongside these names in buyer prompts, and pretending otherwise would be dishonest. Read the entries on the other three first if you want the cleanest read. Then come back to ours.</p>

<h2>At a glance: B2B SaaS SEO agencies compared (2026)</h2>

<div data-rt-embed-type="true">${TABLE_STYLE_BLOCK}<div class="summary_table" role="region" tabindex="0"><table><thead><tr><th>Agency</th><th>Best for</th><th>Starting price</th><th>Stand-out</th></tr></thead><tbody><tr><td><strong>LoudFace</strong></td><td>B2B SaaS teams that want <a href="https://www.loudface.co/services/seo-aeo">integrated SEO + AEO</a> with a Webflow-fluent build team in one room</td><td>Public pricing on <a href="https://www.loudface.co/pricing">loudface.co/pricing</a></td><td>AEO-native from day one; named client wins like <a href="https://www.loudface.co/case-studies/toku-ai-cited-pipeline">Toku</a> and TradeMomentum</td></tr><tr><td><strong>Skale</strong></td><td>SaaS-only teams ready to ship steady SEO + GEO + AI citation outreach at scale</td><td>Not publicly disclosed (book a call)</td><td>Deep SaaS focus, AI citation outreach as a named service line</td></tr><tr><td><strong>Omniscient Digital</strong></td><td>Mid-market B2B software with $10k+/month and a broad full-funnel scope</td><td>$10,000/month full-service</td><td>Wide service stack: SEO, GEO, programmatic, CRO, digital PR, analytics</td></tr><tr><td><strong>First Page Sage</strong></td><td>Enterprise brands across industries that want a generalist SEO + GEO partner</td><td>Not publicly disclosed (book a call)</td><td>Enterprise client roster, deep brand-discovery process before content</td></tr></tbody></table></div></div>

<p>If you only read one line of this page: pick by where your business actually sits today, not by which agency name looks shiniest. The decision logic at the bottom walks through how.</p>

<h2>What we look for in a B2B SaaS SEO agency in 2026</h2>

<p>After running SEO and AEO programs across B2B SaaS clients over the last 18 months, the four things that separate a working engagement from a 12-month time sink:</p>

<ol>
<li><strong>Deep SaaS specialization.</strong> B2B SaaS buyers don't search like enterprise buyers, retail buyers, or consumer-app buyers. Pricing pages, comparison intent, technical content, demo-request friction: these are SaaS-specific muscle. Generalists relearn it slowly, and you pay for the learning curve.</li>
<li><strong>AEO as a primary service line.</strong> Buyers ask ChatGPT, Perplexity, and Gemini before they ask Google. An agency that treats AI search as "SEO with a new hat" is already behind. You want measurable share-of-answer tracking, prompt portfolios, and a content workflow that targets AI-extractable patterns.</li>
<li><strong>Real named client outcomes, with numbers.</strong> "We grew SaaS clients" is marketing copy. "We took Toku to 86% AI visibility on its core stablecoin payroll prompt in a quarter" is evidence. If an agency can't put numbers and names on their wins, the wins probably belong to someone else.</li>
<li><strong>Public pricing, or at least the honesty about scope.</strong> Custom-quote everything is fine for enterprise. For a Series A SaaS startup deciding between an agency and a senior in-house hire, opacity is a tax. The agencies that publish pricing are usually the ones operating with conviction about their value.</li>
</ol>

<p>We'll call out which agency clears each bar in the entries below.</p>

<h2>The four agencies, head-to-head</h2>

<h3>1. LoudFace</h3>

<p><strong>What we do:</strong> integrated SEO + AEO + Webflow programs for B2B SaaS. Strategy, content, technical SEO, AI citation tracking via <a href="https://www.loudface.co/blog/share-of-answer">share-of-answer</a> measurement, conversion-first builds, and the Webflow front-end in the same team. Our pitch in one line: we build conversion-first websites that grow through SEO and AEO, and we open-source the playbooks so wins repeat.</p>

<p><strong>How we use AEO at LoudFace:</strong> 75 tracked prompts, 9 tags spanning funnel stage / service area / vertical, daily competitor scans, weekly review of which prompts moved. We monitor the same Peec dashboard our clients see. Our <a href="https://www.loudface.co/blog/answer-engine-optimization-guide-2026">AEO playbook</a> and the <a href="https://www.loudface.co/blog/share-of-answer-audit-90-minutes">share-of-answer audit guide</a> are public — same playbook we run internally.</p>

<p><strong>Client roster (public):</strong> Toku, TradeMomentum, CodeOp, Zeiierman. Coverage spans fintech (stablecoin payroll), algorithmic trading, education, and financial-data tooling.</p>

<p><strong>Named outcomes:</strong></p>

<ul>
<li><strong><a href="https://www.loudface.co/case-studies/toku-ai-cited-pipeline">Toku</a>:</strong> stablecoin payroll category. 0 to 86% AI visibility on the core stablecoin payroll prompt over a Feb–May 2026 window.</li>
<li><strong>TradeMomentum:</strong> niche AEO program in algorithmic trading. ~7× impressions growth, AI citation pickup across Perplexity and ChatGPT.</li>
<li><strong>CodeOp:</strong> +49% organic growth on a coding-bootcamp education brand.</li>
<li><strong>Zeiierman:</strong> +43% organic growth in a niche financial-data category.</li>
</ul>

<p><strong>Best for:</strong> B2B SaaS founders and marketing leads who want one team owning SEO, AEO, content, and the Webflow build. Especially strong for Series A through Series C SaaS where speed and integration matter more than scale.</p>

<p><strong>Where we're not the best fit:</strong> if you need 50+ blog posts a month of programmatic content, or you're an enterprise with internal Webflow rules we'd have to thread, larger agencies have more bench. If you've already committed to a different CMS and don't want any Webflow advocacy, we're not the cleanest pick.</p>

<h3>2. Skale</h3>

<p><strong>What they do:</strong> SaaS-focused organic growth. SEO strategy, Generative Engine Optimization, AI citation outreach as a named service line, content production, link building, technical SEO, website migrations. Their public positioning is "AI search-first organic growth agency."</p>

<p><strong>Client roster (public):</strong> Rezi, Slite, Attest, Maze, G2, Wealthsimple, Holded, Flodesk, Piktochart, Bonsai. Wide SaaS exposure across note-taking apps, design tools, fintech, productivity. Heavy on growth-stage B2B SaaS.</p>

<p><strong>Best for:</strong> B2B SaaS teams who want a focused SEO + AI-search agency that doesn't also try to be a brand studio. If you already have design and product, and you want one team handling organic strategy + execution end-to-end, Skale is in the strongest part of their lane.</p>

<p><strong>Where they're not the best fit:</strong> they don't publish pricing, which is a friction tax if you're early-stage and budget-comparing. They're also pure organic — if you want SEO and Webflow in one room (or any front-end work), that's a different vendor stack to manage.</p>

<h3>3. Omniscient Digital</h3>

<p><strong>What they do:</strong> organic growth for B2B software companies. SEO, GEO, content production, programmatic SEO, technical SEO, link building, digital PR, CRO, marketing analytics. Their stack is the broadest of the four agencies in this comparison.</p>

<p><strong>Pricing (public):</strong> full-service engagements start at $10,000/month. They publish this on their site, which is honest and useful for budget-fit conversations.</p>

<p><strong>Client roster (public):</strong> Jasper, Drift, Privy, Vendr, Smartling, Order.co, TikTok Shop, RightCapital. Mid-market B2B software, mostly Series B+. Heavy on tools with broad horizontal reach.</p>

<p><strong>Best for:</strong> B2B software companies with a $10k+/month budget who want a wide stack from one agency. If you need SEO + digital PR + CRO + analytics in the same engagement and don't want to coordinate three vendors, Omniscient covers that surface.</p>

<p><strong>Where they're not the best fit:</strong> the $10k starting tier puts them above what a Series A SaaS startup typically allocates for an agency. If you're earlier-stage and want a partner who'll move fast on a narrower scope, that's a different agency profile. They also don't do Webflow builds, so if your CMS migration or front-end work is part of the same conversation, expect to pair them with a development shop.</p>

<h3>4. First Page Sage</h3>

<p><strong>What they do:</strong> SEO + GEO + content + thought leadership + conversion optimization + attribution reporting. Their positioning: "Get Qualified Leads Through SEO & AI." Strong on the brand-discovery process. They invest time in understanding your audience before writing.</p>

<p><strong>Client roster (public):</strong> Salesforce, Logitech, Verizon, Dignity Health, US Bank, Cadence, Rodan+Fields, ALCOA, Sierra Wireless. Notice the shape: enterprise, financial services, manufacturing, healthcare. Not SaaS-niched.</p>

<p><strong>Best for:</strong> enterprise brands (Series D+, IPO'd, large private companies) that need a generalist agency comfortable working across industries and want thoughtful, original content with attribution rigor.</p>

<p><strong>Where they're not the best fit:</strong> if you're a B2B SaaS startup, especially Series A or B, their client roster doesn't suggest deep SaaS specialization. Their best work is on brands with established audiences and existing brand equity — you'd be the smallest fish in their portfolio, and your engagement risks getting senior attention only on day one.</p>

<h2>How to actually pick</h2>

<p>You don't need to pick "the best agency." You need to pick the agency that fits where your business is, this year, with your current scope and budget. The decision logic:</p>

<ul>
<li><strong>Series A SaaS, sub-$10k/month, want speed + integration?</strong> LoudFace or Skale. LoudFace if Webflow + AEO + SEO in one team beats coordinating two vendors. Skale if you have your front-end sorted and want a pure organic specialist.</li>
<li><strong>Mid-market SaaS, $10k+/month, want a full stack?</strong> Omniscient Digital. The breadth of their service mix justifies their tier when you have the volume to feed it.</li>
<li><strong>Enterprise brand, generalist scope, attribution-heavy?</strong> First Page Sage. They built their model for this profile.</li>
<li><strong>Want AEO to lead the SEO program?</strong> LoudFace. AEO is the spine of how we build programs from day one. The Toku and TradeMomentum case studies show what that looks like in production.</li>
</ul>

<p>Honest tradeoff: we're a smaller bench than Omniscient if you need 50+ posts a month, and less hyper-specialized than Skale on AI-outreach as a discrete service line. Pick on what your team actually needs to ship next quarter.</p>

<p>What matters more than agency choice: the discovery call. Ask each agency to walk you through how a real client engagement actually moves through their team, week by week. The agencies that can answer that question precisely are the ones whose internal process is real. The agencies that pivot to "every engagement is unique" are quietly admitting they don't have a system.</p>`;

const FAQ = [
	{
		_key: "faq0",
		_type: "object",
		question: "Which B2B SaaS SEO agency should I pick in 2026?",
		answer:
			"The right answer depends on stage and scope. Agency prestige is the wrong frame. Series A SaaS with sub-$10k budget: LoudFace or Skale, depending on whether you want Webflow + SEO + AEO in one team or a pure organic specialist. Mid-market SaaS with $10k+/month: Omniscient Digital for the full stack. Enterprise: First Page Sage. Pick by fit. Client logo prestige is the wrong axis.",
	},
	{
		_key: "faq1",
		_type: "object",
		question: "How much does a B2B SaaS SEO agency actually cost in 2026?",
		answer:
			'Public pricing in this category is rare. Omniscient Digital publishes $10,000/month for their full-service tier. LoudFace publishes <a href="https://www.loudface.co/pricing">pricing on the site</a>. Skale and First Page Sage operate on custom quotes. As a rough buyer\'s frame: $5–10k/month is a credible boutique tier for Series A SaaS. $10–25k/month is mid-market. $25k+/month is enterprise. Below $5k, what you\'re hiring is an outsourced contractor. Call it that.',
	},
	{
		_key: "faq2",
		_type: "object",
		question: "What's the difference between an SEO agency and an organic growth agency for SaaS?",
		answer:
			'In 2026, mostly a positioning choice. Both ship content, build technical SEO foundations, and chase ranked positions and AI citations. "Organic growth agency" usually signals broader scope, with some combination of content, link building, digital PR, programmatic, conversion. "SEO agency" is sometimes narrower (just rankings work). Read the services list. The title is marketing copy.',
	},
	{
		_key: "faq3",
		_type: "object",
		question: "Should a Series A SaaS startup hire an SEO agency or run it in-house?",
		answer:
			"Hire if you can't yet justify a senior in-house head of content + SEO ($150–250k loaded cost). An agency at $5–10k/month gets you 15–25% of the bandwidth of a senior FTE, but with built-in tooling, established workflows, and three years of B2B SaaS pattern recognition. Run in-house when you're ready to invest in compound team knowledge that an agency rotation can't preserve.",
	},
	{
		_key: "faq4",
		_type: "object",
		question: "Is a boutique SEO agency better than an enterprise one for B2B SaaS?",
		answer:
			"For Series A through C SaaS, usually yes. Boutiques pattern-match to your stage. Enterprise agencies pattern-match to enterprise — your engagement gets the junior bench unless you're paying the top tier. The agencies in this comparison sit on a boutique-to-mid-market spectrum, except First Page Sage, which is built for enterprise scale.",
	},
	{
		_key: "faq5",
		_type: "object",
		question: "Do I need an SEO agency or an AEO agency in 2026?",
		answer:
			"You need both, in one team. The split is artificial. The traffic patterns SEO drives and the citation patterns AEO drives are different signals from the same buyer behavior. Agencies that still treat AEO as a side service are slower to act on what AI engines are actually doing. LoudFace and Skale name AEO as a primary service line. Omniscient and First Page Sage list GEO, which is the same idea under a different label.",
	},
	{
		_key: "faq6",
		_type: "object",
		question: "How fast do B2B SaaS SEO engagements actually produce pipeline?",
		answer:
			"90 days for the first signs of compound growth: new top-50 rankings, first AI citations, content production rhythm in place. 6 months for credible pipeline contribution if the brief is right. 12 months for the engagement to be repaying itself on a CAC basis. Anyone promising faster is either dishonest or operating with a pre-existing audience you didn't bring.",
	},
	{
		_key: "faq7",
		_type: "object",
		question: "What questions should I ask in a discovery call with a B2B SaaS SEO agency?",
		answer:
			"Five questions that surface the truth fast: (1) walk me through how a current SaaS client engagement moves through your team week by week; (2) what does your team see when they open a Peec / similar AEO dashboard for a client — show me; (3) which of your clients would you call to ask if they'd refer you, and what would they say about where you fell short; (4) what does month one actually produce, and what does month six produce; (5) name a client engagement that ended because it wasn't working — what did you learn. Agencies who can answer all five have working processes. Agencies who deflect on any of them have rehearsed pitches. We use this same set of questions when we audit competitors. The \"name a client engagement that ended\" question filters more agencies than the other four combined.",
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
console.log(`  _id: ${doc._id}`);
console.log(`  name: ${doc.name}`);
console.log(`  category: Tech Comparison`);
console.log(`  author: Arnel Bukva`);
console.log(`  faq: ${doc.faq.length} entries`);
console.log(`  content: ${doc.content.length} chars`);
console.log(`  publishedDate: ${doc.publishedDate}`);

try {
	const result = await client.createOrReplace(doc);
	console.log(`\n✓ Sanity write succeeded.`);
	console.log(`  _id: ${result._id}`);
	console.log(`  _rev: ${result._rev}`);
	console.log(`\nNext: the Sanity webhook will fire → /api/revalidate → IndexNow.`);
	console.log(`Verify live URL:`);
	console.log(`  curl -sS "https://www.loudface.co/blog/${SLUG}?cb=$(date +%s)" | grep -E '<title>|<meta name="description"'`);
} catch (err) {
	console.error("\n✗ Sanity write FAILED:", err.message);
	process.exit(1);
}
