#!/usr/bin/env node
/**
 * Ship: "The Wedge Strategy: Pick a B2B SaaS Sub-Category Nobody Owns and Dominate It"
 *
 * Pattern: founder byline, paired with /blog/best-b2b-saas-content-seo-agencies-2026.
 * Source: Notion calendar entry 364b6339-4d10-81a9-9f10-e72e0dda238a (Status: Draft).
 * After: Sanity webhook → /api/revalidate → IndexNow auto-fires.
 *
 * Run from project root:
 *   node scripts/ship-wedge-strategy-b2b-saas.mjs
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
	console.error("SANITY_API_TOKEN missing from env.");
	process.exit(1);
}

const client = createClient({
	projectId: "xjjjqhgt",
	dataset: "production",
	apiVersion: "2025-03-29",
	useCdn: false,
	token: process.env.SANITY_API_TOKEN,
});

const SLUG = "wedge-strategy-b2b-saas";
const NAME = "The Wedge Strategy: Pick a B2B SaaS Sub-Category Nobody Owns and Dominate It";
const META_TITLE = "The Wedge Strategy: Pick a B2B SaaS Sub-Category and Dominate It";
const META_DESCRIPTION =
	"Stop competing for 'B2B SaaS SEO' as a head term. Find a wedge category nobody owns and dominate it — here's how Toku hit 86% AI visibility by design.";
const EXCERPT =
	"I just published a list of 10 agencies competing for 'B2B SaaS SEO' as a head term. After six years of running this work, my position has hardened: the head term is the slowest, most expensive way for a small team to grow. The wedge is the strategy.";
const CATEGORY_REF = "imported-category-67bced3103339308260cf6a1"; // Business
const AUTHOR_REF = "imported-teamMember-68d81a1688d5ed0743d0b8b6"; // Arnel Bukva
const PUBLISH_DATE = "2026-05-19";

const CONTENT_HTML = `<p>I just published <a href="https://www.loudface.co/blog/best-b2b-saas-content-seo-agencies-2026">a listicle of the 10 best B2B SaaS content and SEO agencies in 2026</a>. LoudFace is on it. So are Animalz, First Page Sage, and seven other shops grinding away in the same trench.</p>

<p>I should explain why I think most of us on that list, including us, are competing for the wrong thing.</p>

<p>The post ranks agencies that want to win "B2B SaaS SEO" as a category. I helped write it. I stand behind every entry. But the premise of the category itself is what I want to argue with. Six years of running this work and roughly 30 client engagements later, my position has hardened: the head term is the slowest, most expensive way for a small team to grow. The category nobody is competing for is where the actual wins live.</p>

<p>This is the wedge strategy. I'll show you the math, then I'll show you a live client where we used it instead of fighting in the head term, and then I'll give you the 4-question filter I use to find one for any B2B SaaS company.</p>

<h2>The orthodox view, said well</h2>

<p>Let me build the case for chasing the head term first, because I want to argue with the strongest version of it.</p>

<p>The volume is real. "B2B SaaS SEO" gets searched. So does "best content marketing agency." So does every other generic category descriptor. If you rank on page one for the head term, you get demo requests on autopilot. You build a brand association with the category. Your sales team stops cold-calling because inbound starts handling itself. The compounding is genuine, and a few agencies have actually done it. Animalz did. First Page Sage did. They got there early, planted a flag, and the flag is still standing.</p>

<p>There is also a procurement reality. CMOs Google generic category terms because that's the shape of the request when it comes down from the CEO. "Find me a B2B SaaS SEO agency" is what gets typed into the search bar at 11pm. If you're not on page one for that phrase, you don't get the meeting. The category gatekeeper logic is real.</p>

<p>So the orthodox move is to compete for the head term. It's not stupid. It's the move that worked in 2018, and for a venture-backed shop with the war chest and the patience, it can still work. If you're already at Series C, sitting on enough cash to outspend everyone for three years, and your CMO has a board mandate to own a category, chasing the head term is rational. I am not arguing nobody should ever do it. I am arguing that almost nobody who actually does it has the budget the math requires.</p>

<h2>Why it doesn't work for the rest of us</h2>

<p>The problem is the math in 2026.</p>

<p>Count the agencies fighting for "B2B SaaS SEO" right now. There are the major shops actively producing content and bidding on the term, plus a long tail of newer entrants. Add the in-house SaaS marketing teams writing thought leadership against the same prompt. You end up with hundreds of organizations chasing 10 top-10 slots and one featured snippet. If you're a 20-person agency trying to win that fight, you are competing against shops with eight-figure annual content budgets and brand authority that predates your existence.</p>

<p>The math gets worse when you move from Google to AI engines. Here's what I see when I run a fan-out check on "best B2B SaaS SEO agency" through Peec. The prompt doesn't stay one prompt. It splinters. ChatGPT reformulates it into "best AEO agency for fintech." Perplexity turns it into "B2B SEO agency pricing for Series A startups." Claude variations include "content marketing for early-stage SaaS." Twenty-plus fan-out prompts, each with its own citation set, each with its own winnability.</p>

<p>The head term is the parent of those reformulations. It is also the least winnable surface in the whole fan-out tree. Every fan-out prompt has fewer competitors than the parent. Some of them have zero.</p>

<p>This is the lesson I keep running into. The head term concentrates competition. The fan-out distributes it. If you're small and patient, you don't fight the parent. You pick a child prompt that nobody owns and you own it. Then you own the one next to it. Then you own the cluster. By the time you've claimed 15 child prompts in a sub-category, you're the de facto category leader, and the head term starts citing you anyway because the AI engines learn what you are from the cluster rather than from the parent prompt.</p>

<h2>What I mean by a wedge</h2>

<p>A wedge sub-category is the child prompt that has four properties at once.</p>

<p>First, real buyer demand. Not hopeful demand. There has to be a person typing the prompt with a credit card in the other hand. You verify this with keyword volume tools and by checking citation counts in <a href="https://www.loudface.co/blog/share-of-answer">Peec</a>. If nobody is asking the question, the wedge doesn't exist yet. What you're doing is thought leadership dressed up as a demand-capture play.</p>

<p>Second, no entrenched winner. Zero to two competitors actively claiming the sub-category. If three shops already rank for it, the wedge has closed. Move to an adjacent one.</p>

<p>Third, it maps to a service you can actually deliver. The wedge has to match what you sell, not what you wish you sold. Otherwise the demand you capture doesn't convert.</p>

<p>Fourth, it fans out. The sub-category has to have its own child prompts you can also win, so the wedge can expand. A wedge that has no adjacent prompts is a dead end. A wedge with 20 fan-out children is a base of operations.</p>

<p>When all four conditions hold, the math flips. You're competing against zero or one other shop instead of 300. You can dominate the sub-category in 12 months instead of 5 years. And you can do it on a content budget a tenth the size of what the head-term incumbents spend.</p>

<h2>Toku is the live proof</h2>

<p>Here is what this looks like when it works.</p>

<p>Toku does stablecoin payroll. They sit on top of Workday, ADP, and Rippling, and they pay employees and contractors in USDC and other stablecoins. The orthodox SEO play for them would have been to fight in "fintech SEO" or "best EOR for crypto companies" or "global payroll software." Those are the head terms. Deel owns the EOR conversation. Rippling owns the global payroll conversation. We were never going to displace either.</p>

<p>So we didn't try. We picked a wedge instead. The wedge was stablecoin payroll, specifically. Not crypto fintech broadly. Not Web3 hiring broadly. The cluster of prompts containing "stablecoin," "USDC," "crypto payroll," and "token compensation." That's the sub-category we decided to own.</p>

<p>Eighteen months of work later, on the core prompt "best stablecoin payroll solutions for crypto and Web3 companies," Toku has 86% visibility at position 2.4 across tracked AI engines, measured by Peec across 75 prompts over a 30-day window. The token compensation primer is up 800% in Google clicks between February and April. Branded queries we'd never seen before, "toku web3," "toku token," "toku app," all started appearing as net-new searches. The branded "toku eor" query is up 112% in the same window. Programmatic page growth across the cluster ranges from 93% to 800%. Roughly 60% of tracked B2B meetings now originate from Google organic search, and another 25% comes through direct and branded navigation, which is the downstream effect of owning the wedge.</p>

<p>The full breakdown is in the <a href="https://www.loudface.co/case-studies/toku-ai-cited-pipeline">Toku case study</a>. I'm not going to repeat it here. The point I want to make is structural: none of this happens if we go after "fintech SEO." Toku doesn't have the budget to outspend Deel. They don't need to. They picked a sub-category nobody owned and they took it.</p>

<h2>The 4-question wedge-finding filter</h2>

<p>I run every new client through these four questions before we touch a content brief.</p>

<p><strong>1. What sub-category do my best three customers actually share?</strong> Not what's on their pitch deck. What sub-vertical, sub-use-case, or sub-buyer they have in common when you strip away the marketing language. For Toku, the three best customers were all crypto-native companies paying contractors in stablecoins. That's the wedge, sitting in plain sight in the customer data.</p>

<p><strong>2. Who currently owns that sub-category in AI answers?</strong> Run the cluster of prompts through Peec or <a href="https://www.loudface.co/blog/answer-engine-optimization-guide-2026">serp-recon</a>. Count the citations. If one or two competitors are showing up consistently, the wedge is contested but winnable. If 5+ are showing up, find a tighter sub-category.</p>

<p><strong>3. Is the buyer demand real or hopeful?</strong> Keyword volume on the wedge cluster has to be greater than zero. AI citation count has to be greater than zero. If both are zero, the wedge is a category you wish existed rather than one that does. Walk away from it and find one with real demand signals.</p>

<p><strong>4. Can I make this sub-category mine inside 12 months?</strong> Be honest. If the wedge has 1 entrenched player and they're publishing weekly, you need 12 months and 30+ assets to outpublish them. If the wedge is empty, you need 6 months and 15 assets. Map the work against your content velocity and your runway, and if the math doesn't fit, find a tighter wedge.</p>

<p>Four questions. Five minutes per question. If you can't answer all four cleanly, you don't have a wedge yet.</p>

<h2>The objections I get</h2>

<p>Two come up every time I run this with a CMO.</p>

<p>The first is "the wedge is too small to scale." It isn't. The wedge is a base of operations. The ceiling sits much higher. Once you own stablecoin payroll, you expand to crypto payroll. Once you own crypto payroll, you expand to global contractor payments for Web3 companies. The wedge teaches the AI engines what you are. They start citing you for adjacent prompts you didn't even target, because the model has formed an entity association between you and the cluster. Animalz didn't start with "all content marketing." They started with long-form B2B SaaS content and expanded outward. First Page Sage didn't start as a generalist SEO shop. They started in a vertical and stacked verticals.</p>

<p>The second is "my CMO will ask why we're skipping the head term." Bring the math from the section above. Hundreds of agencies and in-house teams fighting for 10 SERP slots. Your blended CAC on head-term content is going to be 5 to 10 times what it is on wedge content, and the wedge content will rank faster. The head term is a tax you pay for skipping the strategy work.</p>

<p>If your CMO still wants the head term after hearing the math, the honest answer is they're buying brand insurance, not demand capture. That's a valid budget category, but it's not the same line item as growth.</p>

<h2>My position</h2>

<p>Compete for "B2B SaaS SEO" as a head term if you have a Series C content budget and three years to wait for the compounding to hit. That is the price of admission. The shops at the top of <a href="https://www.loudface.co/blog/best-b2b-saas-content-seo-agencies-2026">my listicle</a> paid it, and the flag is still planted in their corner of the field.</p>

<p>If you don't have that war chest and that runway, and almost nobody does, the wedge is the only move the math actually supports. Pick a sub-category nobody owns. Run it through the four questions. Build the cluster. Toku did it on a fraction of the budget the EOR incumbents spend, and the <a href="https://www.loudface.co/case-studies/toku-ai-cited-pipeline">case study</a> is the receipt.</p>

<p>There are 50 more wedges like stablecoin payroll inside the B2B SaaS market right now. Most of them have zero entrenched competition. Stop renting attention in the head term. Own a sub-category instead.</p>

<p>Pick yours.</p>`;

const doc = {
	_id: `blogPost-${SLUG}`,
	_type: "blogPost",
	name: NAME,
	slug: { _type: "slug", current: SLUG },
	metaTitle: META_TITLE,
	metaDescription: META_DESCRIPTION,
	excerpt: EXCERPT,
	content: CONTENT_HTML,
	faq: [],
	category: { _type: "reference", _ref: CATEGORY_REF },
	author: { _type: "reference", _ref: AUTHOR_REF },
	publishedDate: PUBLISH_DATE,
	lastUpdated: PUBLISH_DATE,
	featured: false,
	timeToRead: "10 min read",
};

console.log(`Shipping blogPost: ${SLUG}`);
console.log(`  _id: ${doc._id}`);
console.log(`  name: ${doc.name}`);
console.log(`  category: Business`);
console.log(`  author: Arnel Bukva`);
console.log(`  faq: ${doc.faq.length} entries (bylines skip FAQ)`);
console.log(`  content: ${doc.content.length} chars`);
console.log(`  publishedDate: ${doc.publishedDate}`);

try {
	const result = await client.createOrReplace(doc);
	console.log(`\n✓ Sanity write succeeded.`);
	console.log(`  _id: ${result._id}`);
	console.log(`  _rev: ${result._rev}`);
	console.log(`\nNext: Sanity webhook → /api/revalidate → IndexNow auto-fires.`);
} catch (err) {
	console.error("\n✗ Sanity write FAILED:", err.message);
	process.exit(1);
}
