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

const DOC_ID = "imported-blogPost-69b6e05ed0e8070d168b785c";

const NEW_NAME = "E-E-A-T in the Age of AI in 2026: Preserving Expertise When Machines Draft";
const NEW_META_TITLE = "E-E-A-T in the Age of AI 2026";
const NEW_META_DESCRIPTION = "E-E-A-T matters more in 2026 because AI engines need trust signals to cite sources. How brands preserve expertise markers while using AI in production.";
const NEW_EXCERPT = "E-E-A-T matters more in 2026, not less. AI engines need trust signals to pick citations and Google's algorithm penalizes content lacking expertise markers. Here's how brands preserve expertise while using AI in production.";

if (NEW_META_TITLE.length > 48) {
  console.error(`ERROR: metaTitle too long (${NEW_META_TITLE.length} chars). Must be <= 48.`);
  process.exit(1);
}

const NEW_CONTENT = `<p><strong>TL;DR:</strong> E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) is more important in 2026 than it was when Google introduced the framework, not less. The reason: AI engines extracting citations need trust signals to decide which sources to cite, and Google's algorithm uses E-E-A-T as one of those signals. The tension is real: marketing teams are using AI to draft content faster than ever, which dilutes the very expertise markers E-E-A-T depends on. Brands that win in 2026 use AI as a drafting tool but preserve the human expertise layer (named bylines from genuine practitioners, first-party data from real engagements, opinions that contradict consensus, specific client examples). Brands that ship AI-generated content unedited dilute E-E-A-T and lose both Google rankings and AI citations.</p>

<hr>

<p>I've reviewed AEO-focused Webflow client content where the brand insists on shipping AI-generated drafts unedited. Every single time, two things happen: organic rankings stall, and AI engines cite competitors instead. The root cause is the same — the content has no expertise markers. The author byline is generic. The opinions are consensus. The examples are invented. Both Google's algorithm and AI engines downrank content like this for the same reason: it lacks demonstrable Experience, Expertise, Authoritativeness, and Trustworthiness.</p>

<p>This piece walks through what E-E-A-T means in 2026, why AI changed the stakes, and how brands actually preserve expertise markers while still using AI in production.</p>

<p>For broader AEO context, see <a href="/blog/answer-engine-optimization-guide-2026">Answer Engine Optimization Guide for 2026</a>. For Share of Answer measurement, see <a href="/blog/share-of-answer">Share of Answer: The New Ranking Metric</a>.</p>

<h2>What E-E-A-T actually means in 2026</h2>

<p>Google's framework, in plain terms:</p>

<ul>
<li><strong>Experience.</strong> The author has personally done the thing they're writing about. They've shipped the product, run the agency, served the clients. Not just researched the topic from secondary sources.</li>
<li><strong>Expertise.</strong> The author has demonstrable depth in the domain. Credentials matter for medical or financial topics; lived practice matters for most others.</li>
<li><strong>Authoritativeness.</strong> The author and brand are recognized as legitimate voices in the category. Cited by peers. Linked from authoritative sources.</li>
<li><strong>Trustworthiness.</strong> The content makes accurate claims, cites real data, transparent about who wrote it, sources verifiable.</li>
</ul>

<p>Google updated the framework from E-A-T to E-E-A-T in late 2022 specifically because AI-generated content lacking lived Experience was flooding the web. The "first E" was Google's attempt to push back against undifferentiated AI slop.</p>

<h2>Why E-E-A-T matters more for AI citations than for SEO</h2>

<p>Three structural reasons:</p>

<ol>
<li><strong>AI engines need trust signals to pick citations.</strong> When ChatGPT decides which 3-5 brands to cite in response to "what's the best Webflow agency for B2B SaaS?", it weights extractable content quality and source authority. Sources without E-E-A-T signals (named authors with real expertise, first-party data, recognized brands) get filtered out.</li>
<li><strong>Google's algorithm increasingly factors E-E-A-T into ranking.</strong> Google's Helpful Content Update and subsequent core algorithm updates have penalized content lacking expertise markers. SEO programs that produced AI-generated content unedited saw 20-50% traffic drops during 2024-2025.</li>
<li><strong>Buyer skepticism of AI content is high.</strong> Even when AI-generated content ranks, buyers increasingly read past it. The conversion impact of expertise-signaling content (founder byline, real client names, specific results) is measurable.</li>
</ol>

<h2>The AI drafting tension</h2>

<p>Marketing teams have a real productivity benefit from using AI in content production. The drafting time reduction is 30-60% on structured content. The temptation: ship AI drafts unedited because the throughput is so much higher.</p>

<p>The trap: AI drafts have predictable failure modes that destroy E-E-A-T:</p>

<ol>
<li><strong>Generic author bylines.</strong> AI-drafted pieces under bylines like "The Marketing Team" or "John Smith, Content Marketing Manager" lack Experience signals. Strong E-E-A-T requires the actual practitioner who did the work to be the byline.</li>
<li><strong>Consensus opinions.</strong> AI models trained on the open web produce consensus framing. "Many experts believe..." "It's widely accepted that..." Consensus is the opposite of expertise.</li>
<li><strong>Invented examples.</strong> AI hallucinates client names, statistics, and case studies. When fact-checked, these collapse and destroy Trustworthiness.</li>
<li><strong>Surface-level reasoning.</strong> AI drafts identify the obvious 2-3 reasons something is true. Real expertise sees the 7th, 8th, and 9th reasons that aren't obvious. The depth differential is the expertise differential.</li>
</ol>

<h2>How brands actually preserve E-E-A-T while using AI</h2>

<p>Five operating principles:</p>

<h3>1. Use AI for structure, not for thinking</h3>

<p>AI drafts the outline and the structural scaffolding. The actual thinking — the opinions, the contrarian takes, the specific client examples, the lessons learned — comes from the practitioner. The AI assists; the practitioner directs.</p>

<h3>2. Named bylines from genuine practitioners</h3>

<p>The byline on every cornerstone piece is a real person who has done the work being written about. The founder of the agency. The senior engineer who led the migration. The marketing lead who ran the campaign. Generic bylines ("Editorial Team") destroy Experience signals.</p>

<h3>3. First-party data over secondary research</h3>

<p>Every cornerstone piece cites first-party data from real engagements rather than secondary research from competitor blogs. "We helped CodeOp grow organic clicks +49% YoY" beats "industry benchmarks suggest content marketing can deliver 50% organic growth." Specific beats general.</p>

<h3>4. Real client names where consent permits</h3>

<p>Named clients (Toku, CodeOp, Zeiierman, TradeMomentum) with consented case studies are E-E-A-T gold. Anonymous "a B2B SaaS client" beats no example but doesn't compete with named, named clients. Where clients can't be named, use specific industry + situation context.</p>

<h3>5. Opinions that contradict consensus</h3>

<p>The clearest expertise signal: stating an opinion that contradicts what an AI model would generate by default. Consensus opinions are easy to produce; contrarian opinions require actual depth. The 40-60 word direct-answer block is a place to put the contrarian take.</p>

<h2>What E-E-A-T destruction looks like in production</h2>

<p>Six patterns I see repeatedly in audits:</p>

<ol>
<li><strong>Bylines under "Marketing Team" or "Content Editor."</strong> No real person attached.</li>
<li><strong>Repeated phrases like "industry experts," "leading practitioners," "studies show."</strong> AI consensus-framing tells without specific attribution.</li>
<li><strong>Statistics without source links.</strong> "73% of B2B SaaS marketers report..." — from where? Real data is linkable; invented data isn't.</li>
<li><strong>Generic case studies.</strong> "Company X grew Y% by doing Z." Anonymous, unverifiable. AI engines downrank.</li>
<li><strong>No first-party photos, screenshots, or videos.</strong> Stock imagery only. Real practitioners have real artifacts.</li>
<li><strong>About pages that don't name the actual people running the company.</strong> Team pages with stock photos of generic professionals. Trust destruction at the foundation.</li>
</ol>

<h2>How to audit your site for E-E-A-T</h2>

<p>Five checks:</p>

<ol>
<li><strong>Every cornerstone piece has a named byline of a real practitioner.</strong> If not, fix.</li>
<li><strong>Every cornerstone piece cites first-party data or specific client outcomes.</strong> If not, fix.</li>
<li><strong>The About page lists real team members with real bios and real photos.</strong> If not, fix.</li>
<li><strong>Statistics throughout content have source links.</strong> If not, either source them or remove them.</li>
<li><strong>The site's contrarian opinions are clearly stated.</strong> If your content sounds interchangeable with five competitor blogs, the expertise differential is invisible.</li>
</ol>

<h2>The honest takeaway</h2>

<p>E-E-A-T matters more in 2026 than it did when Google introduced the framework, specifically because AI engines need trust signals to pick citations and Google's algorithm increasingly penalizes content lacking expertise markers. The brands succeeding in the AI search era use AI as a drafting tool but preserve the human expertise layer through named bylines from genuine practitioners, first-party data, real client examples, and contrarian opinions. The brands that ship AI-generated content unedited lose both Google rankings and AI citations.</p>

<p>If your team is producing content faster with AI but ranking and citation outcomes are flat or declining, the diagnosis is almost always E-E-A-T dilution. Slowing down the publication cadence to preserve expertise markers produces measurably better outcomes than shipping faster with weaker signals.</p>

<p>For the broader AEO architecture, see <a href="/blog/answer-engine-optimization-guide-2026">Answer Engine Optimization Guide for 2026</a>. For help structuring AI-augmented content workflows that preserve E-E-A-T signals, <a href="/services/seo-aeo">we run 12-month dual-track SEO + AEO engagements</a>.</p>`;

const NEW_FAQ = [
  {
    _key: "faq-1",
    _type: "object",
    question: "What is E-E-A-T and why does it matter in 2026?",
    answer: "E-E-A-T stands for Experience, Expertise, Authoritativeness, and Trustworthiness — Google's framework for evaluating content quality. It matters more in 2026 than when Google introduced the framework because AI engines (ChatGPT, Perplexity, Google AI Overviews) need trust signals to pick which sources to cite, and Google's algorithm increasingly factors E-E-A-T into ranking. Content lacking expertise markers loses both Google rankings and AI citations.",
  },
  {
    _key: "faq-2",
    _type: "object",
    question: "Why did Google add the second 'E' to E-A-T?",
    answer: "Google updated the framework from E-A-T to E-E-A-T in late 2022 specifically because AI-generated content lacking lived Experience was flooding the web. The first 'E' (Experience) requires the author to have personally done the thing they're writing about — shipped the product, run the agency, served the clients — rather than just researching the topic from secondary sources. Google's response to AI slop.",
  },
  {
    _key: "faq-3",
    _type: "object",
    question: "Can I use AI for content production and still maintain E-E-A-T?",
    answer: "Yes, with discipline. Five operating principles: (1) use AI for structure and outlines, not for thinking, (2) named bylines from genuine practitioners on every cornerstone piece, (3) first-party data and specific client outcomes rather than secondary research, (4) real client names where consent permits, (5) opinions that contradict consensus. The brands succeeding use AI as a drafting tool but preserve the human expertise layer through these markers.",
  },
  {
    _key: "faq-4",
    _type: "object",
    question: "What are the signs my content is destroying E-E-A-T?",
    answer: "Six patterns to audit for: bylines under 'Marketing Team' or 'Content Editor' instead of named practitioners, repeated AI consensus-framing tells ('industry experts,' 'leading practitioners,' 'studies show'), statistics without source links, generic anonymous case studies, no first-party photos or screenshots, and About pages that don't name the actual people running the company. Any of these in production indicates active E-E-A-T dilution.",
  },
  {
    _key: "faq-5",
    _type: "object",
    question: "Why does E-E-A-T matter for AI citations specifically?",
    answer: "When AI engines decide which 3-5 brands to cite in synthesized answers, they weight extractable content quality AND source authority. Sources without E-E-A-T signals (named authors with real expertise, first-party data, recognized brands) get filtered out at the citation layer. The same is true for Google's ranking algorithm. E-E-A-T signals are the trust layer that distinguishes citation-worthy sources from AI-generated content noise.",
  },
  {
    _key: "faq-6",
    _type: "object",
    question: "How do I audit my site for E-E-A-T signals?",
    answer: "Five checks: (1) every cornerstone piece has a named byline of a real practitioner, (2) every cornerstone piece cites first-party data or specific client outcomes, (3) the About page lists real team members with real bios and real photos, (4) statistics throughout content have source links, (5) the site's contrarian opinions are clearly stated rather than sounding interchangeable with five competitor blogs. Failing any of these indicates fixable E-E-A-T weakness.",
  },
  {
    _key: "faq-7",
    _type: "object",
    question: "What's the production trade-off between AI speed and E-E-A-T?",
    answer: "AI drafting speeds content production 30-60% on structured content. The trap: shipping unedited drafts destroys E-E-A-T through generic bylines, consensus opinions, invented examples, and surface-level reasoning. The right trade-off is slowing publication cadence to preserve expertise markers — named bylines, first-party data, real client names, contrarian opinions. The brands shipping fewer pieces with strong E-E-A-T outperform the brands shipping more pieces with weak signals.",
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

console.log(`✓ Refreshed /blog/eeat-in-the-age-of-ai`);
console.log(`  _rev: ${result._rev}`);
console.log(`  metaTitle: "${NEW_META_TITLE}" (${NEW_META_TITLE.length} chars)`);
