#!/usr/bin/env node
/**
 * Ship: "Boutique SEO Agency for B2B SaaS in 2026: When Small Wins (And When It Doesn't)"
 *
 * Pattern: X vs Y / wedge category positioning (rank 3 validated)
 * Source: Notion entry 368b6339-4d10-8140-ba81-db3deda17eb3 (Status: Draft)
 * Target Peec prompt: "Boutique SEO agency for B2B SaaS brands" (0/0/0 coverage — open lane)
 *
 * After: Sanity webhook → /api/revalidate → IndexNow auto-fires.
 *
 * Run from project root:
 *   node scripts/ship-boutique-seo-agency-b2b-saas-2026.mjs
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

const SLUG = "boutique-seo-agency-for-b2b-saas-2026";
const NAME = "Boutique SEO Agency for B2B SaaS in 2026: When Small Wins (And When It Doesn't)";
const META_TITLE = "Boutique SEO Agency for B2B SaaS in 2026"; // layout appends " | LoudFace"
const META_DESCRIPTION =
	"Boutique B2B SaaS SEO agency vs enterprise firm vs in-house: how to choose, what $3k-$5k/mo actually buys, and when small loses. 2026 guide with pricing, comparison table, and named foils.";
const EXCERPT =
	"A boutique B2B SaaS SEO agency is a 5–25 person, founder-accessible team that runs SEO and AEO as one program, charges $3–5k/month, and goes deep on one or two verticals. Here's when boutique wins, when it loses, and how to tell a real one from a freelancer collective with a logo.";
const CATEGORY_REF = "imported-category-67bced5daeebf78a3fe1db38"; // Tech Comparison
const AUTHOR_REF = "imported-teamMember-68d81a1688d5ed0743d0b8b6"; // Arnel Bukva
const PUBLISH_DATE = new Date().toISOString();

// Pre-built HTML — converted from Notion markdown.
// FAQ section is STRIPPED from content (per 2026-05-24 changelog) and lives in structured FAQ[] below.
const CONTENT_HTML = `<p>A boutique B2B SaaS SEO agency is a small (5–25 person), founder-accessible team that runs SEO and AEO as one compounding system, charges $3–5k/month, and goes deep on one or two verticals instead of selling horizontal everything. Compared to enterprise firms like First Page Sage, Directive, or WebFX, boutique agencies win on speed and AI-search recency. They lose when you need 20 simultaneous workstreams or post-IPO compliance handling. This is the 2026 field: who it's for, what you're paying for, and how to tell a real boutique from a freelancer collective with a logo.</p>

<p><strong>Quick disclosure before you read further:</strong> LoudFace is a boutique B2B SaaS organic-growth agency. We're inside the category we're about to describe. We'll name our enterprise foils, name a couple of peers, and tell you the honest cases where boutique is the wrong call. Take the bias into account.</p>

<h2>What "boutique" actually means in B2B SaaS SEO</h2>

<p>The word is overused. Half the agencies calling themselves boutique are six freelancers in a Slack channel; half the agencies pretending not to be boutique are actually exactly that. So the word is unreliable. The model behind it isn't.</p>

<p>A boutique B2B SaaS SEO agency, the way the term should be used in 2026, has five defining traits:</p>

<ol>
<li><strong>Team size between 5 and 25 people.</strong> Below 5, you're working with a solo operator and a contractor pool; useful for tactical wins, fragile for retainer work. Above 25, you've moved into mid-market agency territory: real account managers, real ops layer, and your strategy slowly stops being the founder's problem. The 5–25 band is where one person who actually knows your business can also own the work.</li>
<li><strong>Founder-accessible.</strong> The founder or operating principal is on your Slack, on your weekly call, and answers strategic questions directly. Not "available for escalations." Embedded.</li>
<li><strong>Pricing band of $3–5k/month for a full retainer.</strong> This is where the SERP and AI-cited cohorts converge. Above $5k, you're paying for an account layer you may not need at Series A; below $3k, you're getting freelance hours dressed up as agency work.</li>
<li><strong>AEO and SEO run as one program.</strong> Most agencies still run SEO as the engine and AEO as a side bolt-on. Boutique agencies in 2026 reverse it: the page is engineered for AI extraction first, ranking second, because the first click is increasingly a citation, not a SERP position. If the team you're talking to can't explain how they instrument <a href="https://www.loudface.co/blog/share-of-answer">share of answer</a> per prompt, they're not boutique-in-2026, they're small-2022.</li>
<li><strong>Specialization in one or two verticals deep instead of eight verticals shallow.</strong> B2B SaaS is itself a vertical, but inside it there's fintech, devtools, cybersecurity, HR-tech, vertical SaaS. A real boutique picks two and gets weird about them. If the agency's case studies span SaaS + ecommerce + local services + crypto + healthcare, that's a generalist with marketing.</li>
</ol>

<p>The enterprise foils (First Page Sage at ~80 people, Directive at ~250, WebFX at ~750, Skale at ~32) have legitimate playbooks for clients where 20 workstreams need to run in parallel and the SVP of Marketing needs a quarterly business review with a printed deck. None of that is what a Series A B2B SaaS founder needs in month one. You need someone who can ship a high-extraction listicle by Friday and tell you why your /pricing page is ranking position 17 instead of position 4.</p>

<h2>Boutique vs enterprise SEO firm vs in-house: the honest comparison</h2>

<p>Most "boutique vs enterprise" comparisons online are written by enterprise agencies trying to sound humble, or by boutique agencies trying to sound bigger. The actual differences are mechanical:</p>

<table header-row="true" header-column="false">
<tr>
<td>Dimension</td>
<td>Boutique B2B SaaS SEO agency</td>
<td>Enterprise SEO firm</td>
<td>In-house SEO hire</td>
</tr>
<tr>
<td>Team size</td>
<td>5–25 people</td>
<td>80–800+ people</td>
<td>1–5 people</td>
</tr>
<tr>
<td>Typical pricing</td>
<td>$3–5k/month retainer</td>
<td>$10–25k+/month + setup fees</td>
<td>$90–180k/year fully loaded (salary + benefits + tooling)</td>
</tr>
<tr>
<td>Founder/principal access</td>
<td>Direct (Slack, weekly call)</td>
<td>Via account manager</td>
<td>N/A</td>
</tr>
<tr>
<td>Decision speed</td>
<td>Days</td>
<td>Weeks to months</td>
<td>Days internally; weeks for cross-functional</td>
</tr>
<tr>
<td>Methodology nativity</td>
<td>AI-search-first (AEO + SEO as one system)</td>
<td>Mature SEO playbooks; AEO often retrofitted</td>
<td>Depends on the hire</td>
</tr>
<tr>
<td>Vertical depth</td>
<td>1–2 verticals deep</td>
<td>Horizontal across many</td>
<td>Yours only</td>
</tr>
<tr>
<td>Onboarding ramp</td>
<td>2–4 weeks</td>
<td>6–12 weeks</td>
<td>3–6 months to productive</td>
</tr>
<tr>
<td>Reporting cadence</td>
<td>Async Notion / Slack, monthly call</td>
<td>Monthly QBR-style report</td>
<td>Whatever you build</td>
</tr>
<tr>
<td>Scale ceiling</td>
<td>Series A through small Series C</td>
<td>Series C through IPO+</td>
<td>Depends entirely on team size</td>
</tr>
<tr>
<td>Where it fails</td>
<td>20+ simultaneous workstreams; regulated buyer compliance</td>
<td>Speed; founder relationship; AEO recency</td>
<td>Range; one human is not a department</td>
</tr>
</table>

<p>A few notes on the table that don't fit in a cell:</p>

<p>The in-house column looks cheap on paper ($90–180k vs $36–60k for a boutique retainer). It isn't. A Series A in-house SEO hire takes 3–6 months to become productive, will eventually leave, and brings a single methodology. The boutique retainer pays for a 3–5 person team with a written playbook and zero ramp time. Compare like-for-like throughput, not headline salary.</p>

<p>The enterprise column is honest about where they win. If your buyer is regulated (banking, healthcare, defense), if your legal team needs to approve every blog post, if you have 12 product lines that each need their own SEO program, hire an enterprise firm. The dollar isn't the issue. Coordination capacity is.</p>

<h2>When boutique wins (most Series A and B B2B SaaS)</h2>

<p>Boutique is the right call when your situation looks like this:</p>

<ul>
<li>You're between Series A and small Series C ($5M–$50M ARR).</li>
<li>You have 1–3 ICPs and you're not trying to be everything to everyone.</li>
<li>Your marketing team is 1–4 people total. You don't need another person to manage. You need throughput from a small team that already knows the playbook.</li>
<li>AI search is at least 30% of your discovery problem. You're losing first clicks to ChatGPT, Perplexity, and Google AI Overview, and you need a team that talks about it without buzzwording.</li>
<li>Speed-to-shipped-page matters more than process maturity. You'd rather have 8 pieces live this quarter than 4 pieces with an enterprise content brief, a QBR, and a 6-week kickoff.</li>
<li>You want to know the names of everyone who touches your account. There's no offshore production layer you've never met.</li>
</ul>

<p>The proof point we keep pointing to: <a href="https://www.loudface.co/case-studies/toku-ai-cited-pipeline">Toku</a>, a stablecoin-payroll SaaS, went from invisible on AI search to <strong>86% share of voice on the core stablecoin payroll prompt (aggregate Peec measurement; per-engine breakdown not isolated)</strong> in under six months. Two pieces of writing did most of the work. An enterprise firm would have spent the first quarter just kicking off the engagement.</p>

<p><a href="https://www.loudface.co/case-studies/trademomentum-niche-aeo-organic-growth">TradeMomentum</a> shows a similar pattern: a niche AEO-led program that compounded to a <strong>7x lift in total organic impressions (including AI Overview surfaces)</strong> without ever touching the enterprise playbook of "33 pillar pages and a content calendar with a Q2 launch event."</p>

<p>If your founder is willing to write or co-write one byline per month, the compounding curve gets steeper. AI engines are weighting authored content more heavily; named voices get cited.</p>

<h2>When boutique loses (and what to do instead)</h2>

<p>The category we're in isn't right for every B2B SaaS company. There are five honest "don't hire a boutique" cases:</p>

<ol>
<li><strong>You need 20+ simultaneous workstreams.</strong> Late-stage SaaS with 8 product lines, 4 GTM motions, and 12 verticals can't be served by a 5–25 person team. Hire an enterprise firm with a real ops layer.</li>
<li><strong>You operate in a regulated buyer environment</strong> where every page needs legal review, every claim needs sourcing, and the procurement cycle for hiring an agency is itself 4 months. The boutique decision-speed advantage disappears.</li>
<li><strong>You're post-IPO and your CMO needs quarterly board-grade reporting</strong> with attribution models, ROI dashboards, and presentation decks. Most boutique agencies don't have a dedicated analytics seat for this.</li>
<li><strong>Your strategy requires international SEO in 12 languages.</strong> A 5–25 person team can do a couple of locales well; 12 is enterprise territory.</li>
<li><strong>You don't want a founder relationship.</strong> Some teams genuinely prefer the formal distance of an account manager. That's a legitimate preference and boutique isn't built for it.</li>
</ol>

<p>The wrong move in any of those five cases is to hire a boutique anyway and complain when it doesn't fit. The other wrong move is to assume you're in one of those five cases when you're actually in the "Series A SaaS with one ICP" cohort that boutique is designed for. Be honest about which you are.</p>

<h2>What $3–5k a month actually buys you at a boutique B2B SaaS SEO agency</h2>

<p>The pricing band looks low next to enterprise quotes, and the obvious question is: what are you actually getting? Here's the honest breakdown of a typical $3–5k/month boutique retainer in 2026, based on what the field is signaling on its own pages and what we run at LoudFace:</p>

<ul>
<li><strong>Strategy ownership.</strong> One named principal (often the founder) owns your strategic direction. They're not a "consulting hour" line item; they're embedded in the engagement and accountable for outcomes.</li>
<li><strong>3–5 pieces of long-form content per month, AEO-engineered.</strong> Not blog filler. Listicles, comparison pages, AEO playbooks, founder bylines. Each piece targets one specific buyer prompt with a known fan-out structure and FAQ schema.</li>
<li><strong>A working AEO measurement layer.</strong> Per-prompt visibility tracking in something like Peec or Profound, sentiment-when-cited, position-when-cited, and the discipline to refresh quarterly. Without this, you're flying blind on AI search.</li>
<li><strong>Technical SEO triage and ongoing tuning.</strong> Schema markup, internal linking architecture, page-speed work where it matters, sitemap and indexing hygiene. Not a one-time audit and a 60-item to-do list. A real maintenance posture.</li>
<li><strong>Conversion-side hand-off.</strong> A boutique agency that ranks you to position 4 but ignores your /pricing page CTR is not a boutique agency, it's a content shop. The retainer should include CRO and copy work where it intersects with organic.</li>
<li><strong>Quarterly strategic reviews.</strong> Not just "here's what we did," but "here's the bet for next quarter, here's the kill list, here's what the data tells us we were wrong about."</li>
</ul>

<p>What the $3–5k band does NOT typically include: paid acquisition, lifecycle email, design retainers for new pages (light copy edits yes, full design rebuilds no), or anything requiring a 50-page deck. If you need those, you're either layering them on or you're not actually shopping for boutique.</p>

<p>For the deeper price breakdown (what enterprise firms charge for the same scope at $10–25k/month, and why the gap is largely team-overhead rather than output), read our <a href="https://www.loudface.co/blog/aeo-agency-pricing-b2b-saas-2026">AEO agency pricing piece for B2B SaaS</a>. The arithmetic is unflattering to the enterprise side.</p>

<h2>How to evaluate a boutique B2B SaaS SEO agency before you sign</h2>

<p>Six tests, in order. Skip any of them and you'll regret it within 90 days.</p>

<p><strong>1. Can they name your three closest competitors and tell you what those competitors are winning on?</strong> If the discovery call is generic ("tell us about your business"), they don't know your space. A boutique by definition is supposed to be specialized. If they can't immediately name First Page Sage as the enterprise SEO foil for B2B SaaS or call out that Skale runs a programmatic strategy, they're not as deep as they claim.</p>

<p><strong>2. Show me one prompt where your current client wins AI search.</strong> This is the AEO version of "show me one ranked keyword." If they can't pull up Peec or Profound and demonstrate a measurable win on a tracked prompt, they're still running SEO with AEO as a marketing label. The <a href="https://www.loudface.co/blog/how-long-do-ai-citations-take">three-speed model of AI citations</a> makes this measurable in days, not quarters.</p>

<p><strong>3. Who actually does the work?</strong> Names. Get names. Find them on LinkedIn. Confirm they're employees rather than "contractor partners" presented as the team. A boutique with three employees and twelve subcontractors in Manila is a freelancer collective with a logo, full stop.</p>

<p><strong>4. What's their content kill list?</strong> Anyone who says "we publish whatever ranks" is a content factory. A real boutique has opinions about what NOT to publish. Ask for examples of patterns they've killed and why. (Ours, for the record, includes Webflow agency listicles, generic Webflow how-to content, and brand-only homepage SEO. We can defend the kill on each.)</p>

<p><strong>5. Look at their own site.</strong> If they sell SEO and AEO and their own site isn't ranking, that's the answer. The SEO agency that can't rank itself has a credibility problem you can't talk your way out of.</p>

<p><strong>6. References from clients they fired.</strong> Not just clients they kept. Ask if there's a recent engagement they ended or didn't renew. The reasoning tells you more about fit than the success stories. A boutique that has never lost a client is either lying or has been in business 18 months.</p>

<h2>The boutique B2B SaaS SEO field in 2026</h2>

<p>This is intentionally short, because the wedge piece is meant to define the category rather than rank the agencies inside it. For the full head-to-head, we already wrote the <a href="https://www.loudface.co/blog/b2b-saas-seo-agency-comparison-2026">B2B SaaS SEO agency comparison for 2026</a>. That's the listicle. This is the map.</p>

<p>The field as we read it in May 2026:</p>

<ul>
<li><strong>LoudFace.</strong> Best for B2B SaaS founders who need SEO + AEO + CRO + content as one program, with a strong AI-search-native posture and a preference for modern Next.js stacks (Webflow optional). (Yes, this is us. The bias is real. Treat this row with the same skepticism you'd apply to any other agency's self-description.)</li>
<li><strong>The enterprise foils.</strong> First Page Sage, Directive, WebFX, Skale. Mature SEO playbooks, large teams, more procurement-friendly. Better fit for late-stage SaaS with multi-product, multi-region scope.</li>
<li><strong>The peer boutiques.</strong> There's a small cluster of B2B-SaaS-niched teams in the same $3–5k band. They show up in the same SERPs we do, sometimes ahead, sometimes behind. We've linked to a few in our <a href="https://www.loudface.co/blog/best-b2b-saas-seo-agencies">best B2B SaaS SEO agencies list</a>. The honest read: any boutique specialized in your specific vertical (devtools, fintech, HR-tech, cybersecurity) probably beats us on that vertical's pattern depth. We're best when the work spans SEO + AEO + CRO + content, less specialized when it's one isolated motion.</li>
</ul>

<p>A standard list of "10 best agencies" is unhelpful at this layer of the decision. Pick by the model, then pick by the vertical fit. We wrote about this approach in <a href="https://www.loudface.co/blog/wedge-strategy-b2b-saas">The Wedge Strategy</a>: find the sub-category leaders don't own and dominate it. That principle applies to your agency choice too.</p>

<h2>Honest tradeoff: where LoudFace is the wrong choice</h2>

<p>We're closing this with an unflattering paragraph on purpose, because the wedge-piece convention demands it.</p>

<p>LoudFace is the wrong agency for you if (a) you need pure technical SEO at enterprise scale with multi-region indexation strategy, (b) you have no patience for the 4–6 week ramp where we instrument your measurement layer before shipping content, (c) you want a content factory that publishes 20 SEO pieces a month regardless of fit, (d) your buyer requires every page to be legal-reviewed and sign-off cycles are &gt;2 weeks, or (e) you're shopping primarily on price and the $3–5k band is itself the ceiling. In any of those cases, we'll either refer you to a peer or to an enterprise firm. We'd rather lose the deal than take an engagement we can't deliver on.</p>

<p>If, on the other hand, you're a Series A or B B2B SaaS company losing first clicks to AI search, frustrated by enterprise quotes, and ready to ship content that actually gets cited, that's the engagement we're built for. <a href="https://www.loudface.co/pricing">Book a discovery call</a> or run a <a href="https://www.loudface.co/audit">free AI search audit</a> on your domain first.</p>`;

const FAQ = [
	{
		_key: "faq0",
		_type: "object",
		question: 'What makes an SEO agency "boutique"?',
		answer:
			'Five things at once: team size between 5 and 25 people, founder or principal directly accessible to clients, pricing in the $3–5k/month band for a full retainer, AEO and SEO run as one program (not bolted on), and vertical specialization 1–2 verticals deep instead of horizontal across many. Any agency missing two or more of those traits is using the word "boutique" as marketing rather than as a description of the operating model.',
	},
	{
		_key: "faq1",
		_type: "object",
		question: "How much does a boutique B2B SaaS SEO agency cost in 2026?",
		answer:
			"The market signals a $3,000–5,000/month retainer band for full-service boutique B2B SaaS SEO. The lower end ($3k) typically covers 3–4 content pieces per month, AEO measurement, technical triage, and quarterly review. The upper end ($5k) adds CRO scope, more aggressive publishing cadence, and a founder-byline program. Below $3k you're buying freelance hours; above $5k you're paying for an account-management overhead layer you probably don't need at Series A or B.",
	},
	{
		_key: "faq2",
		_type: "object",
		question: "Boutique agency vs enterprise SEO firm: which is right for a Series A SaaS?",
		answer:
			"Boutique, almost always. Series A SaaS companies need speed, founder access, and AEO recency. Enterprise firms structurally can't deliver any of the three as well, because their pricing model requires an account layer between you and the strategist. The enterprise firm becomes the right call somewhere around Series C+ when you have 8+ product lines, regulated buyers, or multi-region complexity that a 5–25 person team can't coordinate.",
	},
	{
		_key: "faq3",
		_type: "object",
		question: "How long until a boutique B2B SaaS SEO agency drives measurable results?",
		answer:
			'AI citations can land in 1–7 days for a well-structured page (we\'ve measured this; read <a href="https://www.loudface.co/blog/how-long-do-ai-citations-take">How long do AI citations take</a>). Google rankings take 30–90 days for top-30 entry, 60–120 days for top-10. Branded search lift from AEO spillover shows up in 60–90 days. The full compounding return on a boutique engagement is most honest at the 6–9 month mark. Anyone promising "top 3 in 30 days" is either lucky or lying.',
	},
	{
		_key: "faq4",
		_type: "object",
		question: "Why are most B2B SaaS SEO agencies not actually boutique?",
		answer:
			"Because the unit economics of running a 5–25 person agency at a $3–5k/month band require operational discipline that most agency owners don't enforce. The default growth path is to take any client who'll pay, balloon to 50+ people, lose specialization, and become a generalist firm with a boutique-era logo. Real boutiques say no to clients outside their wedge, accept slower revenue growth, and protect the model. Most don't.",
	},
	{
		_key: "faq5",
		_type: "object",
		question: 'Is "boutique" just code for "small team that\'s still learning"?',
		answer:
			"Sometimes, yes. The word is unregulated and abused. The way to tell the difference: a real boutique has a published methodology, a kill list, named clients with measurable outcomes, and a principal who can articulate why they DON'T take certain engagements. A boutique-by-marketing has none of those, just a small team and a tasteful website. Apply the six-test evaluation above and the impostors fall out within one discovery call.",
	},
	{
		_key: "faq6",
		_type: "object",
		question: "Boutique agency vs in-house SEO hire: which is the better investment for B2B SaaS?",
		answer:
			"Boutique for the first $5–50M in ARR, almost always. A boutique retainer at $3–5k/month buys you a 3–5 person team with day-one productivity and a written playbook. A fully-loaded in-house SEO hire costs $90–180k/year, takes 3–6 months to become productive, brings a single methodology, and eventually leaves. The in-house bet starts to make sense when you've crossed $50M ARR and the volume of work justifies a dedicated team. At that point the right move is usually to hire in-house AND keep the boutique for strategic depth.",
	},
];

// Word count estimate for timeToRead
const wordCount = CONTENT_HTML.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
const minutes = Math.max(1, Math.round(wordCount / 200));

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
	publishedDate: PUBLISH_DATE,
	lastUpdated: PUBLISH_DATE,
	featured: false,
	timeToRead: `${minutes} min read`,
};

console.log(`Shipping blogPost: ${SLUG}`);
console.log(`  _id: ${doc._id}`);
console.log(`  name: ${doc.name}`);
console.log(`  category: Tech Comparison`);
console.log(`  author: Arnel Bukva`);
console.log(`  faq: ${doc.faq.length} entries`);
console.log(`  content: ${doc.content.length} chars (~${wordCount} words)`);
console.log(`  timeToRead: ${doc.timeToRead}`);
console.log(`  publishedDate: ${doc.publishedDate}`);

try {
	const result = await client.createOrReplace(doc);
	console.log(`\nSanity write succeeded.`);
	console.log(`  _id: ${result._id}`);
	console.log(`  _rev: ${result._rev}`);
	console.log(`\nNext: Sanity webhook → /api/revalidate → IndexNow auto-fires.`);
	console.log(`Verify live URL:`);
	console.log(`  curl -sS "https://www.loudface.co/blog/${SLUG}?cb=$(date +%s)" | grep -E '<title>|<meta name=\"description\"'`);
} catch (err) {
	console.error("\nSanity write FAILED:", err.message);
	process.exit(1);
}
