#!/usr/bin/env node
/**
 * Patch the published B2B SaaS SEO Agency Comparison piece with the expanded body.
 *
 * What changes vs ship-b2b-saas-seo-agency-comparison-2026.mjs:
 * - Adds "What's changing about B2B SaaS SEO in 2026" section
 * - Adds "How B2B SaaS SEO agencies typically bill in 2026" section
 * - Expands each per-agency entry with founder/leadership, methodology, and rep-content link
 * - Updates timeToRead to "15 min read" (~3,346 words content body)
 *
 * Run from project root:
 *   node scripts/patch-b2b-saas-seo-comparison-expansion.mjs
 */

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

const TABLE_STYLE_BLOCK = `<style>.summary_table {overflow:auto;width:100%;} .summary_table table {border:1px solid #dededf;width:100%;border-collapse:collapse;border-spacing:1px;text-align:left;} .summary_table th {border:1px solid #dededf;background-color:#eceff1;color:#000000;padding:8px;font-weight:600;} .summary_table td {border:1px solid #dededf;background-color:#ffffff;color:#000000;padding:8px;vertical-align:top;}</style>`;

const CONTENT_HTML = `<p><strong>TL;DR:</strong> Four B2B SaaS SEO agencies, honestly compared. <strong>LoudFace</strong> for SaaS founders who want SEO + AEO + Webflow in one team and public pricing. <strong>Skale</strong> for SaaS-only growth shops that lean hard on AI-search outreach. <strong>Omniscient Digital</strong> for mid-market SaaS with $10k+/month budget and a full-service stack. <strong>First Page Sage</strong> for enterprise brands that need a generalist with broad attribution. I run LoudFace, so put us where you think we belong. This page tells you where each agency actually fits and where they don't.</p>

<p>I'm including us in this comparison because we operate in this category, our work shows up alongside these names in buyer prompts, and pretending otherwise would be dishonest. Read the entries on the other three first if you want the cleanest read. Then come back to ours.</p>

<h2>At a glance: B2B SaaS SEO agencies compared (2026)</h2>

<div data-rt-embed-type="true">${TABLE_STYLE_BLOCK}<div class="summary_table" role="region" tabindex="0"><table><thead><tr><th>Agency</th><th>Best for</th><th>Starting price</th><th>Stand-out</th></tr></thead><tbody><tr><td><strong>LoudFace</strong></td><td>B2B SaaS teams that want <a href="https://www.loudface.co/services/seo-aeo">integrated SEO + AEO</a> with a Webflow-fluent build team in one room</td><td>Public pricing on <a href="https://www.loudface.co/pricing">loudface.co/pricing</a></td><td>AEO-native from day one; named client wins like <a href="https://www.loudface.co/case-studies/toku-ai-cited-pipeline">Toku</a> and TradeMomentum</td></tr><tr><td><strong>Skale</strong></td><td>SaaS-only teams ready to ship steady SEO + GEO + AI citation outreach at scale</td><td>Not publicly disclosed (book a call)</td><td>Deep SaaS focus, AI citation outreach as a named service line</td></tr><tr><td><strong>Omniscient Digital</strong></td><td>Mid-market B2B software with $10k+/month and a broad full-funnel scope</td><td>$10,000/month full-service</td><td>Wide service stack: SEO, GEO, programmatic, CRO, digital PR, analytics</td></tr><tr><td><strong>First Page Sage</strong></td><td>Enterprise brands across industries that want a generalist SEO + GEO partner</td><td>Not publicly disclosed (book a call)</td><td>Enterprise client roster, deep brand-discovery process before content</td></tr></tbody></table></div></div>

<p>If you only read one line of this page: pick by where your business actually sits today, not by which agency name looks shiniest. The decision logic at the bottom walks through how.</p>

<h2>What's changing about B2B SaaS SEO in 2026</h2>

<p>Three shifts are reshaping how SaaS SEO actually works this year, and they're the reason most "best SEO agency" lists from 2023 are now half-irrelevant.</p>

<p>First: <strong>AI overviews and ChatGPT now intercept the search journey before Google ever shows ten blue links.</strong> For commercial-intent B2B SaaS queries, the share of clicks going to the top organic position has compressed; the share of decisions made inside an AI answer has expanded. An agency that still pitches you on "ranking #1" is selling a metric that decides less than it used to. Omniscient's recent <a href="https://beomniscient.com/blog/why-your-chatgpt-traffic-just-fell-off-a-cliff/">breakdown of the new math of AI traffic</a> lays this out bluntly.</p>

<p>Second: <strong>programmatic content has hit a saturation cliff.</strong> B2B SaaS categories with high commercial intent (CRM, project management, AI tooling) are flooded with thin, AI-spun listicles. Google's algorithm changes through late 2025 and Q1 2026 have started filtering on demonstrable expertise and first-party data. The agencies that win in 2026 are the ones with verifiable outcomes attached to named clients. Scaled content programs run against template prompts no longer compete in this market.</p>

<p>Third: <strong>the buyer journey now runs across multiple engines.</strong> Google is one of many. A serious B2B SaaS buyer asks ChatGPT, opens Perplexity for citations, double-checks on Reddit, and only then types the brand into Google. Agencies that don't measure share of answer across at least 3-4 AI engines are flying with one eye closed.</p>

<h2>What we look for in a B2B SaaS SEO agency in 2026</h2>

<p>After running SEO and AEO programs across B2B SaaS clients over the last 18 months, the four things that separate a working engagement from a 12-month time sink:</p>

<ol>
<li><strong>Deep SaaS specialization.</strong> B2B SaaS buyers don't search like enterprise buyers, retail buyers, or consumer-app buyers. Pricing pages, comparison intent, technical content, demo-request friction: these are SaaS-specific muscle. Generalists relearn it slowly, and you pay for the learning curve.</li>
<li><strong>AEO as a primary service line.</strong> Buyers ask ChatGPT, Perplexity, and Gemini before they ask Google. An agency that treats AI search as "SEO with a new hat" is already behind. You want measurable share-of-answer tracking, prompt portfolios, and a content workflow that targets AI-extractable patterns.</li>
<li><strong>Real named client outcomes, with numbers.</strong> "We grew SaaS clients" is marketing copy. "We took Toku to 86% AI visibility on its core stablecoin payroll prompt in a quarter" is evidence. If an agency can't put numbers and names on their wins, the wins probably belong to someone else.</li>
<li><strong>Public pricing, or at least the honesty about scope.</strong> Custom-quote everything is fine for enterprise. For a Series A SaaS startup deciding between an agency and a senior in-house hire, opacity is a tax. The agencies that publish pricing are usually the ones operating with conviction about their value.</li>
</ol>

<p>We'll call out which agency clears each bar in the entries below.</p>

<h2>How B2B SaaS SEO agencies typically bill in 2026</h2>

<p>Four pricing models cover most engagements you'll see. Each has its place.</p>

<p><strong>Monthly retainer.</strong> The default. The agency commits to a defined scope (strategy, content production, technical work, reporting) and you pay a fixed monthly rate. Boutiques run $5–10k/month; mid-market $10–25k; enterprise $25k+. Most LoudFace, Skale, and Omniscient engagements are retainer-shaped. The advantage: predictable spend, deep team integration over time. The trap: scope creep dressed up as "this month's priorities." Make sure the SOW is specific.</p>

<p><strong>Project-based.</strong> Less common for ongoing SEO, more common for one-off work: a content audit, a migration, a technical fix sprint, a category-launch program. Typical range $20–100k for a defined deliverable. Useful when you have an in-house team that needs surge capacity for a specific project rather than an ongoing partner.</p>

<p><strong>Performance-based.</strong> Pricing tied to outcomes: usually a base retainer plus a bonus on traffic, leads, or revenue thresholds. Rare in this category because attribution is messy and the lag between SEO work and pipeline contribution is long (3–6 months minimum). When you see "performance-based SEO" advertised, read the fine print: most are flat retainers with a small variable layer.</p>

<p><strong>Hybrid retainer + equity / pipeline share.</strong> Some agencies (more often boutiques) take a smaller cash retainer plus a small share of attributable pipeline or equity in early-stage clients. Read this carefully if offered. It can align incentives well but creates conflicts if the agency also serves competitors.</p>

<p>The buyer move: figure out which model fits your stage (Series A retainers, mid-market retainers with project surges, enterprise often hybrid) before you start the discovery-call rounds. It saves everyone time.</p>

<h2>The four agencies, head-to-head</h2>

<h3>1. LoudFace</h3>

<p><strong>Run by:</strong> Arnel Bukva (founder).</p>

<p><strong>What we do:</strong> integrated SEO + AEO + Webflow programs for B2B SaaS. Strategy, content, technical SEO, AI citation tracking via <a href="https://www.loudface.co/blog/share-of-answer">share-of-answer</a> measurement, conversion-first builds, and the Webflow front-end in the same team. Our pitch in one line: we build conversion-first websites that grow through SEO and AEO, and we open-source the playbooks so wins repeat.</p>

<p><strong>Methodology distinction:</strong> the work compounds because every piece feeds the next. The Notion strategy brain holds the patterns registry, the cusp-page register, and the content calendar; the AEO playbook gets applied to every shipped piece; the Webflow front-end + Sanity backend let us ship content directly without engineering bottlenecks. The skill registry inside Claude Code automates the draft → critique → verify → ship loop so output quality stays consistent across the team.</p>

<p><strong>How we use AEO at LoudFace:</strong> 75 tracked prompts, 9 tags spanning funnel stage / service area / vertical, daily competitor scans, weekly review of which prompts moved. We monitor the same Peec dashboard our clients see. Our <a href="https://www.loudface.co/blog/answer-engine-optimization-guide-2026">AEO playbook</a>, the <a href="https://www.loudface.co/blog/share-of-answer-audit-90-minutes">share-of-answer audit guide</a>, and the <a href="https://www.loudface.co/blog/new-search-funnel-rankings-to-recommendations">new search funnel framework</a> are public — same playbook we run internally.</p>

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

<p><strong>Run by:</strong> Italo Viale and Jake Stainer (co-founders). Roughly a 30-person team based on their public roster.</p>

<p><strong>What they do:</strong> SaaS-focused organic growth. SEO strategy, Generative Engine Optimization, AI citation outreach as a named service line, content production, link building, technical SEO, website migrations. Their public positioning is "AI search-first organic growth agency."</p>

<p><strong>Methodology distinction:</strong> Skale positions explicitly around "SQLs, pipeline, and revenue over traffic and rankings" — a deliberate shift from vanity metrics to bottom-of-funnel attribution. Their representative public POV piece is <a href="https://skale.so/saas-seo/guide/">SaaS SEO in 2026: How to Build a Strategy That Wins Customers (Not Just Clicks)</a>, which doubles as their methodology overview.</p>

<p><strong>Client roster (public):</strong> Rezi, Slite, Attest, Maze, G2, Wealthsimple, Holded, Flodesk, Piktochart, Bonsai. Wide SaaS exposure across note-taking apps, design tools, fintech, productivity. Heavy on growth-stage B2B SaaS.</p>

<p><strong>Best for:</strong> B2B SaaS teams who want a focused SEO + AI-search agency that doesn't also try to be a brand studio. If you already have design and product, and you want one team handling organic strategy + execution end-to-end, Skale is in the strongest part of their lane.</p>

<p><strong>Where they're not the best fit:</strong> they don't publish pricing, which is a friction tax if you're early-stage and budget-comparing. They're also pure organic — if you want SEO and Webflow in one room (or any front-end work), that's a different vendor stack to manage.</p>

<h3>3. Omniscient Digital</h3>

<p><strong>Run by:</strong> David Ly Khim (Co-founder, CEO), Alex Birkett (Co-founder, CRO), Allie Konchar (Co-founder, CCO). About 29 people across Growth Strategy &amp; SEO, Editorial, Outreach &amp; PR, Client Success, and Client Ops.</p>

<p><strong>What they do:</strong> organic growth for B2B software companies. SEO, GEO, content production, programmatic SEO, technical SEO, link building, digital PR, CRO, marketing analytics. Their stack is the broadest of the four agencies in this comparison.</p>

<p><strong>Methodology distinction:</strong> Omniscient explicitly positions itself against "task factory or assembly line" agency models. They embed as an extension of the client team and operate as "a sparring partner and strategic voice" — closer to an in-house growth team than a vendor. Their representative public POV piece on the AI shift is <a href="https://beomniscient.com/blog/why-your-chatgpt-traffic-just-fell-off-a-cliff/">this breakdown of why ChatGPT traffic just fell off a cliff</a>, which captures their current strategic frame.</p>

<p><strong>Pricing (public):</strong> full-service engagements start at $10,000/month. They publish this on their site, which is honest and useful for budget-fit conversations.</p>

<p><strong>Client roster (public):</strong> Jasper, Drift, Privy, Vendr, Smartling, Order.co, TikTok Shop, RightCapital. Mid-market B2B software, mostly Series B+. Heavy on tools with broad horizontal reach.</p>

<p><strong>Best for:</strong> B2B software companies with a $10k+/month budget who want a wide stack from one agency. If you need SEO + digital PR + CRO + analytics in the same engagement and don't want to coordinate three vendors, Omniscient covers that surface.</p>

<p><strong>Where they're not the best fit:</strong> the $10k starting tier puts them above what a Series A SaaS startup typically allocates for an agency. If you're earlier-stage and want a partner who'll move fast on a narrower scope, that's a different agency profile. They also don't do Webflow builds, so if your CMS migration or front-end work is part of the same conversation, expect to pair them with a development shop.</p>

<h3>4. First Page Sage</h3>

<p><strong>Run by:</strong> Evan Bailyn (founder, CEO). Bailyn is a published author and recurring industry speaker on SEO and AI-powered search — his public thought-leadership presence is part of what the agency leans on.</p>

<p><strong>What they do:</strong> SEO + GEO + content + thought leadership + conversion optimization + attribution reporting. Their positioning: "Get Qualified Leads Through SEO &amp; AI." Strong on the brand-discovery process. They invest time in understanding your audience before writing.</p>

<p><strong>Methodology distinction:</strong> First Page Sage explicitly combines "generative AI for persona research, machine learning for marketing insights, and highly-trained writers" — a hybrid AI-assisted model that's heavier on writer craft than typical AI-content shops. Their dominant content output is the <a href="https://firstpagesage.com/seo-blog/the-top-senior-living-seo-agencies/">Top X SEO Agencies of [vertical]</a> listicle pattern, repeated across enterprise verticals (senior living, healthcare, financial services, manufacturing) — a programmatic vertical-listicle play.</p>

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

const result = await client
	.patch("blogPost-b2b-saas-seo-agency-comparison-2026")
	.set({
		content: CONTENT_HTML,
		timeToRead: "15 min read",
		lastUpdated: new Date().toISOString(),
	})
	.commit();

console.log(`✓ Sanity patch succeeded.`);
console.log(`  _id: ${result._id}`);
console.log(`  _rev: ${result._rev}`);
console.log(`  content length: ${CONTENT_HTML.length} chars`);
console.log(`\nVerify:`);
console.log(`  curl -sS "https://www.loudface.co/blog/b2b-saas-seo-agency-comparison-2026?cb=$(date +%s)" | grep -E '<title>|How B2B SaaS SEO agencies typically bill|Italo Viale'`);
