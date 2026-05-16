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

const DOC_ID = "imported-blogPost-69ac442264c111bc17b6e9ce";

const NEW_NAME = "The Problem with Traditional Webflow Agencies in 2026 (and What to Demand Instead)";
const NEW_META_TITLE = "Problem with Traditional Webflow Agencies (2026)";
const NEW_META_DESCRIPTION =
	"Most Webflow agencies in 2026 are design shops with SEO bolted on. The honest engagement shape is dual-track SEO + AEO with Webflow as implementation, structured for 12 months. Here's the critique and what to demand instead.";
const NEW_EXCERPT =
	"The traditional Webflow agency engagement produces polished sites that plateau at month four. Here's why most agencies optimize for the proposal over the outcome, and what the dual-track SEO + AEO program shape should look like instead.";

const NEW_CONTENT = `
<p><strong>TL;DR:</strong> The traditional Webflow agency pitch in 2026 is broken. Most agencies sell a website rebuild with a vague AEO add-on, charge $15K-$50K for it, and produce sites that look great in the Designer review but plateau at month four because the strategy under them is generic. The actual problem: most Webflow agencies are design shops with SEO bolted on, beyond what a dual-track SEO + AEO program with Webflow as the implementation layer would deliver. The output is the wrong shape for the buyer journey of 2026, where AI engines mediate the early funnel and design polish without citation strategy converts nothing. LoudFace's program is the inverse: strategy first, Webflow second.</p>

<p>I have watched B2B SaaS clients arrive after disappointing engagements with three or four other Webflow agencies before us. Same pattern every time: the previous agency built a polished site, the design review went well, the launch was successful, and then nothing moved. Six months in, the marketing team is back to where they started, except now the site is on Webflow.</p>

<p>The problem is not Webflow. The problem is how most agencies structure the engagement.</p>

<p>For broader Webflow context, see <a href="/blog/mastering-webflow-guide">Getting Started with Webflow in 2026</a>. For why LoudFace was built on Webflow specifically, see <a href="/blog/webflow-success-story">Why LoudFace Was Built on Webflow</a>.</p>

<h2>What most Webflow agencies actually sell</h2>

<p>The typical Webflow agency engagement, regardless of which agency you pick:</p>

<ol>
<li><strong>Discovery and brand audit</strong> (weeks 1-2). Workshops, persona research, competitive analysis, brand guidelines document.</li>
<li><strong>Information architecture</strong> (weeks 3-4). Sitemap, wireframes, content outline.</li>
<li><strong>Design</strong> (weeks 5-8). High-fidelity Figma comps, design system, prototypes.</li>
<li><strong>Build</strong> (weeks 9-14). Webflow Designer implementation, CMS setup, basic SEO meta configuration.</li>
<li><strong>Launch</strong> (week 15-16). QA, redirect mapping, go-live, post-launch monitoring.</li>
</ol>

<p>Total cost: $15K-$50K for a mid-tier engagement, $50K-$150K+ for enterprise. Everything looks good in the proposal. The design review at week 8 is exciting. The launch ceremony is satisfying.</p>

<p>Then the marketing team is left to run the site. The agency moves on. Six months later, GSC clicks are flat and the AI engines don't mention the brand in category searches. The marketing team blames the platform; the agency blames "content strategy"; the founder blames everyone.</p>

<h2>Why this engagement shape produces stale sites</h2>

<p>Three structural problems baked into the typical agency offering:</p>

<h3>1. Design polish without citation strategy converts nothing in 2026</h3>

<p>The site looks good. The hero is striking. The case study cards render beautifully. None of this matters if the buyer never reaches the site because Google AI Overviews didn't cite the brand, ChatGPT didn't recommend it, and Perplexity surfaced a competitor instead.</p>

<p>The 2022 playbook (great design + good SEO basics) doesn't reach the 2026 buyer. The buyer's first encounter with the category is increasingly through AI engines. Sites without AEO architecture (direct-answer paragraphs in the first 60 words, FAQPage schema, question-phrased H2s, structured /answers directories, entity-clear positioning) get skipped at the citation stage. The polished website never gets the chance to convert.</p>

<h3>2. SEO bolted on as an afterthought</h3>

<p>Most Webflow agency engagements treat SEO as a checklist at the end: meta titles, alt text, sitemap submission, maybe schema if the team remembers. None of this is wrong. None of it is enough.</p>

<p>A real SEO program requires keyword research before the IA decisions, content depth on every page that targets intent, internal linking strategy mapped to topic clusters, schema density on entities the site mentions, and ongoing GSC and Peec AI tracking. None of this fits inside a 16-week build engagement. It's a 6-12 month program that runs after launch.</p>

<p>Agencies that don't structure for the program offer a "post-launch support" retainer at month 4 when the client realizes the work isn't done. That retainer is usually generic content marketing without the strategic depth that makes a difference.</p>

<h3>3. The agency optimizes for the proposal over the outcome</h3>

<p>Webflow agency proposals are designed to close. They emphasize the design portfolio (most clients are visually persuaded), the timeline (most clients want speed), and the price (most clients want a fixed number). They underweight the strategy work because strategy is hard to put in a deck and harder to charge for upfront.</p>

<p>The result: agencies sell what's easy to sell, build what they know how to build, and leave the part that actually drives outcomes (strategy + ongoing optimization) for someone else.</p>

<h2>What the engagement should actually look like</h2>

<p>The dual-track SEO + AEO program built on Webflow:</p>

<ol>
<li><strong>Phase 1: Audit + strategy</strong> (weeks 1-3). GSC analysis, AI engine visibility audit via Peec, competitor citation analysis, prompt research, keyword research, IA mapped to buyer intent. Output: strategy doc with prioritized targets.</li>
<li><strong>Phase 2: Foundation rebuild</strong> (weeks 4-10). Webflow site rebuild with AEO architecture baked in from the start: direct-answer paragraphs on every targeting page, FAQPage schema on every Q&A block, structured /answers directory as a Collection, programmatic page trees where the data supports it.</li>
<li><strong>Phase 3: Citation work</strong> (months 4-9). Per-prompt content strategy, weekly publishing cadence, ongoing schema audit, internal-linking strategy execution, Peec + GSC monitoring.</li>
<li><strong>Phase 4: Compounding</strong> (months 10+). Branded search lift kicks in. AI engines start citing the brand more reliably. First-touch attribution shifts from paid to organic. Pipeline composition shows AEO impact.</li>
</ol>

<p>Total program: 12 months. Total cost varies by scope but typically lands $80K-$200K for the first 12 months on a B2B SaaS engagement. Higher than the typical agency engagement, because the work is more.</p>

<p>The math that justifies the cost: at month 12, sites running this program produce real AI citation rates (Toku at 86% on its core prompt), branded search lift on NEW queries (see <a href="/case-studies/toku-ai-cited-pipeline">the Toku case study</a> for the NEW-query breakdown), and majority-organic B2B pipeline. The traditional agency engagement at month 12 produces a Webflow site that looks great and doesn't rank.</p>

<h2>What changes when an agency runs the dual-track program</h2>

<p>Five things buyers should see in any proposal worth taking seriously:</p>

<ol>
<li><strong>Pre-build audit using Peec AI or equivalent.</strong> Before any design work, the agency should pull baseline AI visibility data on the client's tracked prompts. Without baseline data, there's no way to measure whether the program produced citation lift.</li>
<li><strong>AEO architecture baked into the IA from the start.</strong> Direct-answer paragraphs, FAQPage schema, /answers directory should appear in the wireframes at week 2 rather than as a post-launch retrofit at month 4.</li>
<li><strong>Content strategy that maps pages to specific buyer prompts.</strong> Generic "blog post about industry trends" is not strategy. "Page targeting the prompt 'best stablecoin payroll for crypto companies' with direct-answer block at top" is.</li>
<li><strong>Ongoing measurement plan.</strong> Peec AI for share-of-voice tracking, GSC for branded search and per-page performance, PostHog (or equivalent) for first-touch attribution. The program is real only if these three datasets move together.</li>
<li><strong>A 12-month engagement structure.</strong> Not a "6-week rebuild + post-launch support retainer." The work is the work; structuring it honestly upfront is what produces outcomes.</li>
</ol>

<h2>Where LoudFace differs</h2>

<p>Five specific things we do that most agencies don't:</p>

<ol>
<li><strong>Dual-track program by default.</strong> Every engagement is SEO + AEO from the start rather than a website rebuild with an SEO add-on.</li>
<li><strong>Pre-build Peec audit on every engagement.</strong> We pull baseline AI visibility data before any design work. The strategy doc cites the baseline.</li>
<li><strong>AEO architecture in the wireframes.</strong> Direct-answer blocks, /answers Collection, FAQPage schema templates all designed before any visual work.</li>
<li><strong>Real client case studies with NEW-query branded search lift.</strong> <a href="/case-studies/toku-ai-cited-pipeline">Toku</a> is the proof point: 86% citation on the core prompt, NEW branded queries appearing from zero, majority-organic pipeline.</li>
<li><strong>12-month engagements priced for the program, not the proposal.</strong> We charge what the work actually costs, not what the proposal sells for.</li>
</ol>

<h2>The honest takeaway</h2>

<p>The traditional Webflow agency engagement is broken because it sells design polish, charges for a website rebuild, and leaves the part that drives outcomes (strategy + ongoing AEO citation work) for someone else. The result is a site that looks great and plateaus at month four.</p>

<p>The fix is not "better Webflow design." The fix is restructuring the engagement around strategy first and Webflow second. Dual-track SEO + AEO program. Pre-build audit. AEO architecture in the wireframes. 12-month engagement structure. Real measurement plan with Peec + GSC + first-touch attribution moving together.</p>

<p>That's the program we run at LoudFace. If you've been burned by a Webflow agency engagement that produced a beautiful site and flat numbers, <a href="/services/seo-aeo">we run the dual-track program as the default engagement shape</a>. It costs more upfront. It actually produces the outcomes the previous engagement promised.</p>
`.trim();

const NEW_FAQ = [
	{
		_key: "faq1",
		_type: "faqItem",
		question: "What's wrong with most Webflow agencies in 2026?",
		answer:
			"<p>Three structural problems. (1) They sell design polish without citation strategy, which doesn't reach the 2026 buyer who increasingly researches through AI engines. (2) They treat SEO as a launch checklist (meta titles, alt text, sitemap) rather than as a 6-12 month program with keyword research, content depth, internal linking strategy, and ongoing measurement. (3) They optimize the proposal (visual portfolio, fixed timeline, fixed price) over the outcome (strategy work that's hard to put in a deck). The result: polished sites that plateau at month four.</p>",
	},
	{
		_key: "faq2",
		_type: "faqItem",
		question: "How should a Webflow agency engagement actually be structured?",
		answer:
			"<p>As a 12-month dual-track SEO + AEO program with Webflow as implementation. Phase 1 (weeks 1-3): GSC + Peec audit, competitor citation analysis, IA mapped to buyer intent. Phase 2 (weeks 4-10): Webflow rebuild with AEO architecture baked in from the start. Phase 3 (months 4-9): per-prompt content strategy, weekly publishing, ongoing measurement. Phase 4 (months 10+): branded search lift, AI citation compounding, first-touch attribution shift. Total cost typically $80K-$200K for the first 12 months on B2B SaaS engagements.</p>",
	},
	{
		_key: "faq3",
		_type: "faqItem",
		question: "Why do most Webflow agency engagements plateau at month four?",
		answer:
			"<p>Because the engagement structure ends at launch. The agency builds the site, hands it off, moves on. The marketing team is then expected to run the SEO + AEO program independently without the infrastructure to do so (no Peec audit, no per-prompt content strategy, no schema review cadence). Six months in, the polished site has the same GSC numbers as the day it launched. The fix is structuring the engagement so the strategic + ongoing-citation work happens inside the agency relationship, not after it ends.</p>",
	},
	{
		_key: "faq4",
		_type: "faqItem",
		question: "What should I look for in a Webflow agency proposal in 2026?",
		answer:
			"<p>Five specific items. (1) Pre-build Peec AI (or equivalent) audit of baseline AI visibility on tracked prompts. (2) AEO architecture in the wireframes at week 2, not as a post-launch retrofit. (3) Content strategy mapped to specific buyer prompts, not generic 'industry trends' topics. (4) Ongoing measurement plan tracking Peec + GSC + first-touch attribution. (5) 12-month engagement structure, not a 6-week rebuild + vague post-launch support. If any of these are missing, the engagement will probably plateau at month four.</p>",
	},
	{
		_key: "faq5",
		_type: "faqItem",
		question: "Why is a 12-month engagement structure better than a typical Webflow rebuild?",
		answer:
			"<p>Because the work that produces outcomes (strategy, content depth, AEO architecture, ongoing citation work, measurement) requires months 4-12 of an engagement to actually compound. A 16-week rebuild ends right at the point where the real program would have been getting started. The 12-month structure lets the agency stay engaged through the period where branded search lift kicks in, AI citation rates compound, and pipeline composition shifts toward majority-organic. Toku's 86% AI citation rate on the core stablecoin-payroll prompt is what month 12 of this engagement structure looks like.</p>",
	},
	{
		_key: "faq6",
		_type: "faqItem",
		question: "How much does a real Webflow + SEO/AEO engagement cost?",
		answer:
			'<p>Typically $80K-$200K for the first 12 months on a B2B SaaS engagement, depending on scope. Higher than the typical $15K-$50K Webflow rebuild because the work is more — pre-build audit, AEO architecture in the wireframes, per-prompt content strategy, 9 months of ongoing citation work, real measurement infrastructure. The math that justifies the cost: at month 12, sites running this program produce real AI citation rates and majority-organic B2B pipeline. See our <a href="/blog/webflow-agency-cost-b2b-saas-2026">B2B SaaS Webflow Agency Cost guide</a> for the full pricing breakdown.</p>',
	},
	{
		_key: "faq7",
		_type: "faqItem",
		question: "What makes LoudFace different from other Webflow agencies?",
		answer:
			'<p>Five specific differences. (1) Dual-track SEO + AEO program by default, not a website rebuild with an SEO add-on. (2) Pre-build Peec audit on every engagement. (3) AEO architecture baked into the wireframes before any design work. (4) Real client case studies showing NEW-query branded search lift and AI citation compounding (<a href="/case-studies/toku-ai-cited-pipeline">Toku at 86%</a>). (5) 12-month engagement structure priced for the actual program, not for what the proposal sells for. The trade-off is real: more expensive upfront, produces the outcomes previous agencies promised but didn\'t deliver.</p>',
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

console.log(`✓ Refreshed /blog/the-problem-with-traditional-webflow-agencies`);
console.log(`  _rev: ${result._rev}`);
