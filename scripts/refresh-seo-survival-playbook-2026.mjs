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

const DOC_ID = "imported-blogPost-69b6dedc39da412664c91299";

const NEW_NAME = "The SEO Survival Playbook for 2026: 5 Moves When Traffic Drops 25%";
const NEW_META_TITLE = "SEO Survival Playbook 2026: 5 Survival Moves";
const NEW_META_DESCRIPTION = "Gartner's 25% search drop prediction is reality in 2026. 5 survival moves: commercial-intent SEO, AEO architecture, branded discovery, CRO, cornerstone pieces.";
const NEW_EXCERPT = "Gartner's 25% search drop prediction is reality. The 5 moves that hold pipeline flat (or grow it) when traditional SEO traffic falls: commercial-intent prioritization, AEO architecture, branded discovery, CRO discipline, cornerstone content production.";

if (NEW_META_TITLE.length > 48) {
  console.error(`ERROR: metaTitle too long (${NEW_META_TITLE.length} chars). Must be <= 48.`);
  process.exit(1);
}

const NEW_CONTENT = `<p><strong>TL;DR:</strong> The SEO survival playbook for 2026 starts with accepting Gartner's prediction is reality: search engine volume has dropped 25% from its 2023 peak, and BrightEdge data shows 60% of Google searches now end without a click. Companies that built acquisition strategies around traditional SEO traffic are watching organic visits decline month over month even when their content quality didn't change. The survival path has five moves: prioritize commercial-intent queries that still produce clicks, build AEO architecture so AI engines cite you instead of skipping you, treat branded discovery as the new hedge, double down on conversion rate where traffic is shrinking, and re-architect content production toward fewer but stronger cornerstone pieces. The playbook is real and proven; the companies dismissing it as alarmism are the ones losing the most traffic.</p>

<hr>

<p>In 2023, Gartner predicted search engine volume would drop 25% by 2026 as users shifted to AI chatbots and virtual agents. Most marketing teams dismissed it as speculative. In 2026, the prediction is reality, and the marketing teams that dismissed it three years ago are the ones watching their organic acquisition decline the fastest.</p>

<p>This piece is the playbook for marketing teams that still have to ship pipeline this quarter while the SEO ground shifts under them. Not a doom essay. A survival framework.</p>

<p>For the broader AEO context, see <a href="/blog/answer-engine-optimization-guide-2026">Answer Engine Optimization Guide for 2026</a>. For the zero-click revenue mechanics, see <a href="/blog/zero-click-content-that-drives-revenue">Zero-Click Content That Still Drives Revenue</a>.</p>

<h2>The actual data, honestly</h2>

<p>Three numbers worth knowing:</p>

<ul>
<li><strong>Gartner 2024 prediction:</strong> search engine volume drops 25% by 2026 due to AI chatbot adoption. (<a href="https://www.gartner.com/en/newsroom/press-releases/2024-02-19-gartner-predicts-search-engine-volume-will-drop-25-percent-by-2026-due-to-ai-chatbots-and-other-virtual-agents">Source</a>)</li>
<li><strong>BrightEdge 2025 data:</strong> 60% of Google searches now end without a click. Buyers get answers in AI Overviews, featured snippets, or the SERP itself.</li>
<li><strong>Anecdotal from LoudFace clients:</strong> B2B SaaS sites with strong SEO architecture (built 2020-2023) are seeing 20-50% drops in organic clicks on informational queries between 2024 and 2026.</li>
</ul>

<p>The traffic decline isn't uniform. Informational queries lose the most ("what is...", "how to..."). Commercial queries hold up better ("best [category] tool", "[brand] vs [brand]"). Transactional queries are mostly stable.</p>

<h2>The 5 survival moves</h2>

<h3>1. Prioritize commercial-intent queries that still produce clicks</h3>

<p>Three query types in 2026, ranked by remaining click value:</p>

<ul>
<li><strong>Transactional</strong> ("buy [product]", "pricing for [brand]"): nearly 100% click retention. AI engines don't try to answer these; they route the buyer.</li>
<li><strong>Commercial</strong> ("best [category]", "[brand] vs [brand]", "[category] for [use case]"): 50-80% click retention, depending on the AI engine's behavior. AI engines often summarize but include 3-5 brand citations with click options.</li>
<li><strong>Informational</strong> ("what is...", "how to..."): 20-40% click retention. AI engines synthesize complete answers; buyers rarely click through.</li>
</ul>

<p>Survival move: shift content production budget from informational SEO toward commercial-intent SEO. The clicks that remain are also higher-intent. A 30% drop in informational clicks combined with a 15% drop in commercial clicks but a 40% increase in commercial-intent conversion rate often produces a net pipeline INCREASE.</p>

<h3>2. Build AEO architecture so AI engines cite you instead of skipping you</h3>

<p>The buyers using AI engines for category research still exist. They're just not clicking. If your content gets cited in the AI answer, you build brand recall at the moment of buyer intent. If your content gets skipped, you're invisible.</p>

<p>The four core AEO patterns from the canonical <a href="/blog/answer-engine-optimization-guide-2026">Answer Engine Optimization Guide for 2026</a>:</p>

<ul>
<li>40-60 word direct-answer paragraphs at the top of every page</li>
<li>FAQPage schema in JSON-LD on every cornerstone piece</li>
<li>/answers directory with single-question pages</li>
<li>Programmatic page trees tied to real buyer prompts (Peec AI baseline audit)</li>
</ul>

<p>Without AEO architecture, the SEO traffic loss is permanent. With AEO architecture, the loss converts to AI citation gain (different surface, similar pipeline impact).</p>

<h3>3. Treat branded discovery as the new hedge</h3>

<p>Branded search (buyers typing your brand name into Google) is the most resilient organic channel in 2026. It bypasses AI synthesis (the AI engine isn't trying to answer "who is LoudFace") and goes directly to your site.</p>

<p>Survival move: build branded search lift on NEW queries as a primary KPI. The mechanic:</p>

<ol>
<li>AI engines cite your brand → buyers see brand exposure</li>
<li>Buyers later search your brand name in Google → branded search session</li>
<li>Branded search converts at 3-5x non-branded organic</li>
<li>Pipeline grows even as informational organic shrinks</li>
</ol>

<p>GSC's "Queries" tab shows branded search trend. New branded queries appearing month-over-month are the leading indicator that AEO is converting to brand discovery. See <a href="/blog/zero-click-content-that-drives-revenue">Zero-Click Content That Still Drives Revenue</a> for the full mechanics.</p>

<h3>4. Double down on conversion rate where traffic is shrinking</h3>

<p>When traffic drops, conversion rate matters more per visit. Marketing teams that hit a traffic cliff and let conversion rate stay flat see pipeline drop linearly. Teams that focus on CRO during the cliff often hold pipeline flat or grow it despite lower traffic.</p>

<p>Three specific CRO moves for the 2026 traffic profile:</p>

<ul>
<li><strong>Higher-intent visitors deserve higher-intent landing pages.</strong> The buyers who reach your site after AI engine exposure are 3-5x more valuable than 2020 organic. Treat the hero, the CTA, and the first 3 sections as commercial — not awareness content.</li>
<li><strong>Forms shorter, friction lower.</strong> Buyers researched upstream; the form should ask only what's strictly required. Pre-fill via UTM where possible.</li>
<li><strong>Pricing transparency reduces drop-off.</strong> Hidden pricing was tolerated in 2020 demand-gen; high-intent 2026 buyers tend to bounce. If your pricing is custom, show ranges + tier descriptions.</li>
</ul>

<h3>5. Re-architect content production toward fewer but stronger cornerstone pieces</h3>

<p>The 2020 SEO playbook was high-volume. Publish 4-8 SEO blog posts per month, hit long-tail queries, rank for thousands of low-intent keywords. That worked when informational SEO converted to traffic.</p>

<p>The 2026 SEO playbook is high-quality. Publish 1-3 cornerstone pieces per month with full AEO architecture, target commercial-intent queries, build Citation Authority over 6-12 months.</p>

<p>The shift in practice for LoudFace clients:</p>

<ul>
<li><strong>Pre-2024:</strong> 30+ blog posts per quarter, 60% informational, 30% commercial, 10% commercial transactional.</li>
<li><strong>2026:</strong> 6-10 cornerstone pieces per quarter, 80% commercial, 20% transactional. Each piece is 1500-3000 words with full AEO architecture and named practitioner byline.</li>
</ul>

<p>Net effect: fewer pieces but each one produces measurable AI citations + branded search lift over 6-12 months. The unit economics are better despite the throughput dropping.</p>

<h2>The two diagnostic numbers that tell you where you are</h2>

<p>If your team is anxious about SEO right now, two questions narrow the diagnosis:</p>

<ol>
<li><strong>What's your year-over-year informational-query click trend?</strong> If down 20-50%, you're in the normal range. If down >50%, the SEO architecture probably wasn't strong to begin with. If flat or up, you're either very niche or measuring wrong.</li>
<li><strong>What's your year-over-year branded-search-on-NEW-queries trend?</strong> If up 30%+, AEO is working and the SEO loss is being absorbed by branded discovery. If flat, AEO architecture is missing OR isn't being implemented effectively. If down, the brand has visibility problems that go beyond SEO.</li>
</ol>

<p>The combination tells you whether the survival playbook is working. Healthy: informational down, branded NEW queries up. Unhealthy: informational down, branded NEW queries flat.</p>

<h2>When the survival playbook doesn't apply</h2>

<p>Two patterns:</p>

<ol>
<li><strong>Transactional / e-commerce sites.</strong> Your traffic is mostly transactional intent. Click retention is high. The playbook's first three moves are over-scoped; focus on CRO and branded discovery moves only.</li>
<li><strong>Brand-new categories AI engines have no training data on.</strong> AEO architecture pays off when AI engines understand the category. Pioneering categories rely on direct demand generation, not on hedging against AI-mediated SEO loss.</li>
</ol>

<p>For most B2B SaaS, fintech, professional services, and content-heavy publishers, the playbook is the right framework. Apply it.</p>

<h2>The honest takeaway</h2>

<p>SEO survival in 2026 isn't about defending against an attack. It's about accepting a structural shift in how buyers research and rebuilding the program for the new reality. The companies that ship 30 SEO blogs per month hoping volume will save them are losing the fastest. The companies shipping 6 strong cornerstone pieces with full AEO architecture, branded discovery campaigns, and conversion rate discipline are holding flat or growing pipeline despite the traffic decline.</p>

<p>Pick your survival moves based on your category. Implement the AEO architecture. Build branded search as the hedge. Stop measuring success in informational click volume; start measuring it in pipeline from organic + AI-cited sources.</p>

<p>For the canonical AEO playbook, see <a href="/blog/answer-engine-optimization-guide-2026">Answer Engine Optimization Guide for 2026</a>. For the zero-click revenue mechanics, see <a href="/blog/zero-click-content-that-drives-revenue">Zero-Click Content That Still Drives Revenue</a>. For help structuring an SEO survival program, <a href="/services/seo-aeo">we run 12-month dual-track engagements</a>.</p>`;

const NEW_FAQ = [
  {
    _key: "faq-1",
    _type: "object",
    question: "Is SEO dead in 2026?",
    answer: "No. SEO is shifting, not dying. Gartner's 2024 prediction that search engine volume would drop 25% by 2026 is reality, and BrightEdge data shows 60% of Google searches now end without a click. But informational queries are the hardest hit; commercial-intent queries hold up better; transactional queries are mostly stable. The survival path is to shift content production toward commercial-intent SEO, build AEO architecture for AI engine citations, and treat branded discovery as the new hedge.",
  },
  {
    _key: "faq-2",
    _type: "object",
    question: "How much SEO traffic should I expect to lose by 2026?",
    answer: "Depends on query mix. Informational queries ('what is...', 'how to...') typically see 20-50% click drops. Commercial queries ('best [category]', '[brand] vs [brand]') see 20-40% drops with higher click retention. Transactional queries are mostly stable. For B2B SaaS with strong SEO architecture from 2020-2023, overall organic click drops of 20-30% are common, with most of the loss concentrated in informational query categories.",
  },
  {
    _key: "faq-3",
    _type: "object",
    question: "What are the 5 SEO survival moves for 2026?",
    answer: "(1) Prioritize commercial-intent queries that still produce clicks (shift content budget from informational toward commercial). (2) Build AEO architecture so AI engines cite you instead of skipping you (40-60 word direct-answer paragraphs, FAQPage schema, /answers directory, programmatic page trees). (3) Treat branded discovery as the new hedge (track NEW branded queries in GSC as a primary KPI). (4) Double down on conversion rate where traffic is shrinking (higher-intent visitors deserve higher-intent landing pages). (5) Re-architect content production toward fewer but stronger cornerstone pieces (1-3 per month with full AEO architecture instead of 4-8 SEO blogs).",
  },
  {
    _key: "faq-4",
    _type: "object",
    question: "Should I still produce informational SEO content?",
    answer: "Less of it. Pre-2024 strategy was 60% informational SEO posts targeting long-tail queries. In 2026, AI engines synthesize answers to informational queries without sending the click. Shift the budget toward commercial-intent queries (50-80% click retention) and cornerstone pieces with AEO architecture that get cited by AI engines. Informational SEO still has a role but it's narrower than it was.",
  },
  {
    _key: "faq-5",
    _type: "object",
    question: "How do I know if my SEO survival playbook is working?",
    answer: "Two diagnostic numbers at 90-day intervals: (1) year-over-year informational-query click trend (down 20-50% is the normal range), (2) year-over-year branded-search-on-NEW-queries trend (up 30%+ means AEO is converting to brand discovery). Healthy pattern: informational down, branded NEW queries up. Unhealthy pattern: both down, or branded NEW queries flat. If branded NEW queries are flat despite implementing AEO, the architecture isn't being implemented effectively.",
  },
  {
    _key: "faq-6",
    _type: "object",
    question: "What is the conversion rate angle of the SEO survival playbook?",
    answer: "When traffic drops, conversion rate matters more per visit. Three CRO moves for the 2026 traffic profile: (1) treat higher-intent visitors as deserving higher-intent landing pages (commercial hero, clear CTA, case studies vs awareness content), (2) shorten forms and reduce friction since buyers researched upstream, (3) increase pricing transparency to reduce drop-off (high-intent buyers tend to bounce on hidden pricing). Teams that focus on CRO during the SEO traffic cliff often hold pipeline flat or grow it despite lower traffic.",
  },
  {
    _key: "faq-7",
    _type: "object",
    question: "When does the SEO survival playbook NOT apply?",
    answer: "Two patterns: (1) transactional / e-commerce sites where traffic is mostly transactional intent and click retention is high — focus on CRO and branded discovery moves only. (2) Brand-new categories where AI engines have no training data — AEO architecture pays off when AI engines already understand the category; pioneering categories rely on direct demand generation. For most B2B SaaS, fintech, professional services, and content-heavy publishers, the playbook is the right framework.",
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

console.log(`✓ Refreshed /blog/seo-survival-playbook`);
console.log(`  _rev: ${result._rev}`);
console.log(`  metaTitle: "${NEW_META_TITLE}" (${NEW_META_TITLE.length} chars)`);
