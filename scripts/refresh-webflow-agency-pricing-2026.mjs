import { createClient } from "@sanity/client";
import { readFileSync } from "fs";

const env = readFileSync(".env.local", "utf8").split("\n").reduce((a, l) => {
  const m = l.match(/^([^=]+)=(.*)$/);
  if (m) a[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  return a;
}, {});

const client = createClient({
  projectId: "xjjjqhgt",
  dataset: "production",
  apiVersion: "2025-03-29",
  useCdn: false,
  token: env.SANITY_API_TOKEN,
});

const DOC_ID = "imported-blogPost-6915d9c9d65e8ca880b46bf6";

const NEW_NAME = "Webflow Agency Pricing in 2026: 4 Real Tiers (Honest Breakdown)";
const NEW_META_TITLE = "Webflow Agency Pricing 2026: 4 Real Tiers Explained";
const NEW_META_DESCRIPTION = "Webflow agency pricing in 2026 ranges $1.5K to $500K+. Honest breakdown of 4 tiers, what each delivers, when to pick which. By LoudFace.";
const NEW_EXCERPT = "Webflow quotes range from $1.5K to $500K+ for good reason. This article breaks down the four real tiers — freelancer, specialist studio, full-stack SEO + AEO agency, and Enterprise — and what each delivers.";

const NEW_CONTENT = `<p><strong>TL;DR:</strong> Webflow agency pricing in 2026 falls into four real tiers: solo freelancer / boutique ($1,500–$8,000 for a brochure site, design-first, no SEO/AEO program), specialist Webflow studio ($8,000–$25,000 for a 15-25 page marketing site, brand-led, SEO as a deliverable rather than a program), full-stack SEO + AEO + Webflow agency like LoudFace ($80,000–$200,000 for a 12-month dual-track program where Webflow is the implementation layer and AI citation is the measured outcome), and Webflow Enterprise + custom build ($150,000–$500,000+ for multi-region, Webflow Cloud, ABM-driven sites). The right tier depends on what outcome you're buying rather than what your budget tolerates.</p>

<hr>

<p>I've quoted Webflow engagements from $4,000 to $250,000 over two years at LoudFace. The price gap isn't arbitrary. It reflects which version of "agency" you're actually buying: a designer who builds in Webflow, a studio that ships a brand-led marketing site, or a full program that produces measurable SEO/AEO outcomes over 12 months.</p>

<p>This piece breaks down what each tier actually delivers, what they don't, and how to pick honestly.</p>

<p>For broader context on Webflow itself, see <a href="/blog/mastering-webflow-guide">Getting Started with Webflow in 2026</a>. For agency selection specifically, see <a href="/blog/best-webflow-agencies">Best Webflow Agencies in 2026</a> and the B2B SaaS-specific <a href="/blog/best-b2b-saas-webflow-agencies-2026">Best B2B SaaS Webflow Agencies 2026</a>.</p>

<h2>The four real tiers (and what they actually deliver)</h2>

<h3>Tier 1: Solo freelancer or boutique — $1,500 to $8,000</h3>

<p><strong>What you get:</strong> a designer or small team building 5-15 pages in Webflow from a template or light custom design. CMS Collections set up for blog. Basic on-page SEO (title tags, meta descriptions, alt text). Handoff at launch with a Loom walkthrough.</p>

<p><strong>Who this fits:</strong> pre-seed and seed-stage startups that need a marketing site live in 4-6 weeks. Small service businesses with brochure-site needs. Anyone whose primary goal is "have a website, not a Notion page" rather than "compound organic growth."</p>

<p><strong>Where it falls short:</strong> no SEO/AEO program past launch. No content strategy. No AEO architecture (direct-answer paragraphs, FAQPage schema, /answers directory). Brand and design system thinking is light. The site looks fine but doesn't compound.</p>

<p><strong>Typical engagement:</strong> 4-8 weeks. One-time deliverable.</p>

<h3>Tier 2: Specialist Webflow studio — $8,000 to $25,000</h3>

<p><strong>What you get:</strong> a 15-25 page marketing site built by a Webflow-specialist agency. Custom design system. Brand-led visual execution. CMS Collections architected for blog + case studies + careers. On-page SEO at launch (schema markup, internal linking, technical baseline). Sometimes a launch-bound content sprint (3-5 cornerstone pages).</p>

<p><strong>Who this fits:</strong> Series A/B startups that need a polished marketing site that reflects brand maturity. Companies rebranding and treating the website as the centerpiece. Marketing-led teams that have a separate SEO program already running.</p>

<p><strong>Where it falls short:</strong> SEO is shipped as a deliverable rather than a 12-month program. The agency hands off at launch. The site is built well but the marketing infrastructure that compounds (AEO architecture, programmatic CMS at scale, ongoing content production, citation tracking) isn't part of the engagement.</p>

<p><strong>Typical engagement:</strong> 8-16 weeks. Optional retainer for ongoing design support.</p>

<h3>Tier 3: Full-stack SEO + AEO + Webflow agency (LoudFace) — $80,000 to $200,000 for first 12 months</h3>

<p><strong>What you get:</strong> Webflow is the implementation layer for a 12-month dual-track SEO + AEO program. Pre-build Peec AI audit. Information architecture designed around AEO extractability (direct-answer paragraphs, FAQPage schema, /answers directory, programmatic page trees). Custom design and full marketing site build. Ongoing content production (15-25 pieces of cornerstone content over 12 months, tied to a calendar). Citation tracking via Peec AI. GSC monitoring. Monthly strategy reviews with sharp recommendations rather than a status report.</p>

<p><strong>Who this fits:</strong> B2B SaaS and fintech companies that have committed to organic search and AI citation as growth channels and want a measurable program (not a website). Funded startups that want to skip the "ship site → wait 6 months → realize it's not working → start over" trap. Companies whose buyers research via ChatGPT / Perplexity / Google AI Overviews and need to show up in those answers.</p>

<p><strong>Where it falls short:</strong> if the project is pure design without measurable SEO/AEO ambition, this is over-scoped. A Tier 2 specialist studio is cheaper and a better fit.</p>

<p><strong>Real client proof:</strong> Toku at 86% AI citation rate on the core stablecoin-payroll prompt (<a href="/case-studies/toku-ai-cited-pipeline">case study</a>). CodeOp +49% organic clicks year-over-year. Zeiierman with measurable WordPress-to-Webflow growth. TradeMomentum with multi-fold impression growth and AI citation pickup.</p>

<p><strong>Typical engagement:</strong> 12 months. First 16 weeks for site build + initial content sprint; remaining 36 weeks for ongoing optimization, programmatic pages, content production.</p>

<h3>Tier 4: Webflow Enterprise + custom build — $150,000 to $500,000+</h3>

<p><strong>What you get:</strong> Webflow Enterprise tier (Webflow Cloud, Webflow Localization, Webflow Optimize). Multi-region or multi-language sites. Complex CMS architecture with thousands of dynamic pages. Custom integrations (HubSpot, Salesforce, Snowflake, internal APIs). ABM-driven landing page programs. Dedicated solutions architect from the agency.</p>

<p><strong>Who this fits:</strong> Enterprise SaaS at $50M+ ARR with multi-region marketing requirements. Public companies whose marketing site supports investor relations. Companies running ABM at scale where personalized landing pages matter.</p>

<p><strong>Where it falls short:</strong> for sub-Enterprise companies, this is over-engineered. Tier 3 covers most B2B SaaS needs.</p>

<p><strong>Typical engagement:</strong> 16-32 weeks for initial build. Ongoing retainer ($15K-$50K/month) for support, optimization, and new programmatic pages.</p>

<h2>What actually drives the price gap</h2>

<p>Six variables explain why two Webflow quotes can differ by 10x:</p>

<ol>
<li><strong>Engagement structure.</strong> A 6-week site build is cheaper than a 12-month program because the strategic work that compounds (content production, AEO architecture, citation tracking) sits outside the build. Tier 1-2 ship a site. Tier 3-4 ship an outcome program.</li>
<li><strong>Custom design vs template.</strong> A template-based build at Tier 1 is $1,500. A fully custom design system + 25-page Webflow build at Tier 3 is $40K-$60K of the engagement. Custom design is the single biggest cost line.</li>
<li><strong>CMS architecture complexity.</strong> A simple blog CMS is included in any tier. Programmatic CMS at scale (industry pages, geographic landing pages, integration-coded variants) is a different animal. Tier 3-4 engagements often include 100+ dynamic pages.</li>
<li><strong>SEO/AEO strategy depth.</strong> Per-prompt content strategy, Peec AI baseline audits, direct-answer paragraph engineering, FAQPage schema in IA, programmatic page trees: these are Tier 3-4 line items. Tier 1-2 ship technical SEO basics at launch.</li>
<li><strong>Ongoing content production.</strong> Tier 3 includes 15-25 pieces of cornerstone content over 12 months (founder bylines, listicles, AEO playbooks, comparison pages). Tier 1-2 ship the site and stop.</li>
<li><strong>Webflow Enterprise tier requirements.</strong> Webflow Cloud, Localization, and Optimize unlock Enterprise-grade capabilities but require Webflow Enterprise licensing ($35K+/year just for the platform). Tier 4 engagements factor this in.</li>
</ol>

<h2>What to expect at each tier (honest table)</h2>

<div class="summary_table">
<table>
<thead>
<tr><th>Tier</th><th>Price range</th><th>Site scope</th><th>SEO/AEO depth</th><th>Ongoing content</th><th>Engagement length</th></tr>
</thead>
<tbody>
<tr><td>1: Freelancer / boutique</td><td>$1,500–$8,000</td><td>5-15 pages, often templated</td><td>On-page basics</td><td>None</td><td>4-8 weeks</td></tr>
<tr><td>2: Specialist studio</td><td>$8,000–$25,000</td><td>15-25 pages, custom design</td><td>On-page + schema at launch</td><td>Optional retainer</td><td>8-16 weeks</td></tr>
<tr><td>3: Full-stack SEO + AEO (LoudFace)</td><td>$80,000–$200,000</td><td>20-40+ pages, custom design, programmatic trees</td><td>Pre-build AI audit, per-prompt strategy, AEO architecture</td><td>15-25 pieces over 12 months</td><td>12 months</td></tr>
<tr><td>4: Enterprise + custom build</td><td>$150,000–$500,000+</td><td>Multi-region, thousands of pages</td><td>Enterprise-grade, ABM integration</td><td>Ongoing retainer required</td><td>16-32 weeks + retainer</td></tr>
</tbody>
</table>
</div>

<h2>How to pick the right tier</h2>

<p>Three honest patterns:</p>

<ul>
<li><strong>Pre-seed / seed startup, brochure site, time-to-launch matters most</strong> → Tier 1. Don't over-buy. Validate the business first.</li>
<li><strong>Series A/B with brand-led rebrand needs, SEO handled elsewhere</strong> → Tier 2. Specialist studio is the right fit.</li>
<li><strong>B2B SaaS / fintech committing to organic + AI citation as growth channels</strong> → Tier 3. LoudFace's positioning.</li>
<li><strong>Enterprise SaaS, multi-region, ABM at scale</strong> → Tier 4. Specialist enterprise studios.</li>
</ul>

<p>If you're at the Tier 2/3 boundary, the honest question is: do you want a website (Tier 2) or do you want a measurable SEO/AEO outcome program (Tier 3)? The deliverable cost is similar; the structure and outcomes are different.</p>

<h2>Common objections about Tier 3 pricing</h2>

<p><strong>"$80K-$200K seems high for a Webflow site."</strong> It is high for just a Webflow site. The pricing reflects the 12-month program, not the build alone. The build is roughly 30-40% of the engagement; content production + ongoing optimization + citation tracking is the rest. If you only need the build, Tier 2 is the right pick.</p>

<p><strong>"Can we start at Tier 2 and upgrade later?"</strong> Sometimes. The pattern that works: Tier 2 specialist builds the site, you run SEO/AEO in-house or with a separate program. The pattern that fails: Tier 2 builds the site without AEO architecture (no direct-answer paragraphs in IA, no FAQPage schema, no /answers directory), and you spend 6 months retrofitting it. If AEO is part of the strategy, build for it from the start.</p>

<p><strong>"How does ROI compare to Tier 2?"</strong> Tier 3 ROI shows up at month 4-8 in organic clicks, month 6-12 in AI citation rate, month 9-15 in branded search lift on NEW queries. Tier 2 ROI is mostly conversion lift on existing demand (the site converts traffic better). If your inbound is already strong, Tier 2's ROI is faster. If you need to build new organic + AI-cited pipeline, Tier 3's ROI compounds longer.</p>

<h2>When Webflow agency pricing is NOT the right question</h2>

<p>Three cases:</p>

<ol>
<li><strong>The project is "we need a website fast and we'll figure out marketing later."</strong> Buy Tier 1 or Tier 2 on price alone. Don't over-think it. The site is a placeholder.</li>
<li><strong>The marketing site needs to render personalized product data at request time.</strong> Webflow isn't the right tool. The agency conversation is wrong.</li>
<li><strong>The team is committed to HubSpot CMS for everything.</strong> Webflow agency pricing is irrelevant; HubSpot CMS is the path of least resistance.</li>
</ol>

<h2>The honest takeaway</h2>

<p>Webflow agency pricing in 2026 ranges from $1,500 to $500,000+ because four different categories of agency are all called "Webflow agencies." The right pick depends on what outcome you're buying rather than which proposal has the lowest number.</p>

<p>For B2B SaaS and fintech companies that have committed to AI citation and organic search as growth channels, the full-stack SEO + AEO + Webflow program at $80K-$200K for the first 12 months is the call. The build alone, at $25K from a Tier 2 specialist, will produce a beautiful site but won't compound past launch.</p>

<p>If you want help structuring the right tier for your specific situation, <a href="/services/seo-aeo">we run discovery without pitching unfit engagements</a>. Sometimes the honest answer is "a Tier 2 specialist studio is the better fit," and we'd rather tell you that on a 30-minute call than waste 12 weeks of your budget.</p>`;

const NEW_FAQ = [
  {
    _key: "faq-1",
    _type: "object",
    question: "How much does a Webflow agency cost in 2026?",
    answer: "Webflow agency pricing in 2026 ranges from $1,500 to $500,000+ depending on the tier. Solo freelancers and boutiques charge $1,500–$8,000 for brochure sites. Specialist Webflow studios charge $8,000–$25,000 for 15-25 page custom-designed marketing sites. Full-stack SEO + AEO + Webflow agencies like LoudFace charge $80,000–$200,000 for a 12-month dual-track program. Webflow Enterprise + custom builds run $150,000–$500,000+ for multi-region or ABM-driven sites.",
  },
  {
    _key: "faq-2",
    _type: "object",
    question: "Why do Webflow agency quotes vary so much?",
    answer: "Six variables drive the gap: engagement structure (one-time build vs 12-month program), custom design depth, CMS architecture complexity (simple blog vs programmatic CMS at scale), SEO/AEO strategy depth (technical basics vs AEO architecture), ongoing content production (none vs 15-25 pieces over 12 months), and Webflow Enterprise tier requirements (Webflow Cloud, Localization, Optimize).",
  },
  {
    _key: "faq-3",
    _type: "object",
    question: "What's the difference between a $10K Webflow site and a $150K one?",
    answer: "A $10K site is a Tier 2 specialist studio build: 15-25 pages, custom design, on-page SEO at launch, agency hands off when the site goes live. A $150K engagement is a Tier 3 full-stack program: same site quality plus pre-build Peec AI audit, AEO architecture, 15-25 pieces of cornerstone content over 12 months, citation tracking, monthly strategy reviews. The site is roughly 30-40% of the cost; the program is the rest.",
  },
  {
    _key: "faq-4",
    _type: "object",
    question: "Is $80K-$200K reasonable for a Webflow agency?",
    answer: "It's reasonable for a 12-month dual-track SEO + AEO program where Webflow is the implementation layer. It's not reasonable for just a Webflow site. If the goal is a polished marketing site without an ongoing program, a Tier 2 specialist studio at $8K-$25K is the right pick. If the goal is measurable AI citation outcomes plus organic growth, the Tier 3 program pricing reflects what's actually being delivered.",
  },
  {
    _key: "faq-5",
    _type: "object",
    question: "Can I start with a cheaper Webflow agency and upgrade later?",
    answer: "Sometimes. The pattern that works: a Tier 2 specialist builds the site, you run SEO/AEO in-house or via a separate program. The pattern that fails: a Tier 2 agency builds the site without AEO architecture (no direct-answer paragraphs in IA, no FAQPage schema, no /answers directory), and you spend 6 months retrofitting it. If AEO is part of the strategy from the start, build for it at IA stage.",
  },
  {
    _key: "faq-6",
    _type: "object",
    question: "What's included in Webflow Enterprise + custom build engagements?",
    answer: "Tier 4 engagements ($150K-$500K+) typically include Webflow Enterprise licensing (Webflow Cloud, Localization, Optimize), multi-region or multi-language site architecture, complex CMS with thousands of dynamic pages, custom integrations with HubSpot/Salesforce/Snowflake/internal APIs, ABM-driven landing page programs, and a dedicated solutions architect from the agency. Engagement length is 16-32 weeks for the initial build plus an ongoing retainer ($15K-$50K/month) for support and optimization.",
  },
  {
    _key: "faq-7",
    _type: "object",
    question: "What ROI should I expect from a $100K+ Webflow agency engagement?",
    answer: "Tier 3 ROI shows up in three waves: month 4-8 in organic clicks (cornerstone content starts ranking), month 6-12 in AI citation rate (Peec AI starts tracking real citation lift from AEO architecture), month 9-15 in branded search lift on NEW queries (the spillover signal that AI citations are landing). Tier 2 ROI is mostly conversion lift on existing demand. Choose Tier 3 when you need to build new organic + AI-cited pipeline; choose Tier 2 when inbound is already strong.",
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

console.log(`✓ Refreshed /blog/webflow-agency-pricing`);
console.log(`  _rev: ${result._rev}`);
