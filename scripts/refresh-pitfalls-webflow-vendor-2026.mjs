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

const DOC_ID = "imported-blogPost-67be8cab6abd92ebf2a4ea0f";

const NEW_NAME = "8 Red Flags to Walk Away From in Webflow Agency Sales Calls (2026)";
const NEW_META_TITLE = "Webflow Agency Red Flags 2026: 8 Walk-Away Signals";
const NEW_META_DESCRIPTION = "8 red flags in Webflow agency sales calls that mean walk away in 2026. Negative-framing companion to the best-of list. By LoudFace.";
const NEW_EXCERPT = "Most Webflow vendor selection failures share the same 8 structural red flags. If you spot 3+ in the first sales call, walk away. The negative-framing companion to the best-of list.";

const NEW_CONTENT = `<p><strong>TL;DR:</strong> Most Webflow vendor selection failures share the same 8 red flags: the proposal ends at launch, no AEO architecture is in the IA, no first-party client data is shared, the engagement is structured as a one-time deliverable, references are anonymized, the team can't articulate their content strategy past month 3, pricing is locked at a "design hours" rate rather than tied to outcomes, and the pitch leads with portfolio screenshots rather than measurable client results. If you spot 3+ of these, walk away. The agency will produce a beautiful site that plateaus at month four.</p>

<hr>

<p>I've competed against and reviewed proposals from most of the Webflow agencies on the market over two years at LoudFace. The pattern that separates the engagements that work from the ones that don't isn't the size of the agency, the portfolio polish, or the proposal length. It's a small set of structural red flags that show up in the first sales call.</p>

<p>This piece is the negative-framing companion to <a href="/blog/best-webflow-agencies">Best Webflow Agencies in 2026</a> — the positive-framing canonical. That one tells you who to hire. This one tells you what to avoid.</p>

<h2>The 8 red flags that mean walk away</h2>

<h3>1. The proposal ends at launch</h3>

<p>If the SOW has a "launch" milestone and no concrete deliverables for months 4-12, the agency is selling you a website rather than a program. Sites built without a 12-month post-launch structure produce real outcomes for 12-16 weeks and then plateau. The strategic work that compounds (content production, AEO architecture, citation tracking, programmatic page expansion) sits past the launch milestone.</p>

<p><strong>What to ask instead:</strong> "Walk me through what you'd deliver in months 4-12 of the engagement." If the answer is "ongoing support retainer" or "we can talk about that after launch," the post-launch structure doesn't exist yet.</p>

<h3>2. No AEO architecture in the information architecture</h3>

<p>The information architecture proposal at week 2 should show direct-answer paragraph slots, an /answers directory, FAQPage schema commitments, and programmatic page tree planning. If those concepts are absent from the IA stage and only appear as a "launch checklist" item at week 14, the agency is treating AEO as cosmetic rather than structural. Cosmetic AEO doesn't produce AI citations.</p>

<p><strong>What to ask instead:</strong> "Show me where direct-answer paragraphs and FAQPage schema appear in the IA you'd ship in week 2." Strong agencies have a templated answer.</p>

<h3>3. No first-party client data shared</h3>

<p>The case study deck is full of beautiful screenshots, before/after design comparisons, and "20% increase in conversion" claims with no attribution model. There's no GSC data, no Peec AI citation rate, no branded search lift on NEW queries, no first-touch attribution. The agency hasn't measured outcomes because they haven't structured the engagement to produce them.</p>

<p><strong>What to ask instead:</strong> "Show me a client case study with branded search lift on NEW queries, AI citation rate data, or first-touch attribution from organic search." Strong agencies have receipts.</p>

<h3>4. The engagement is structured as a one-time deliverable</h3>

<p>The pricing model is "$X for the build, then $Y/month if you want ongoing support." This structure incentivizes the agency to optimize for shipping the site, not for producing outcomes over 12 months. The agency that does best on this model is the one that ships fastest and walks away cleanest. That's not the agency that compounds.</p>

<p><strong>What to ask instead:</strong> "What's your engagement structure for a 12-month dual-track SEO + AEO program where Webflow is the implementation layer?" The answer separates Tier 2 (specialist studios) from Tier 3 (full-stack program agencies).</p>

<h3>5. References are anonymized</h3>

<p>The agency name-drops Fortune 500 logos on the website but every client conversation reference is "a B2B SaaS client we worked with" without a name. Logos on a website don't mean active engagements; they often mean a single project from three years ago. If the agency can't connect you with a named, currently-engaged client, the relationships aren't deep.</p>

<p><strong>What to ask instead:</strong> "Can I talk to two clients who are currently in an active 6+ month engagement with you?" Strong agencies arrange the calls within 48 hours.</p>

<h3>6. The team can't articulate their content strategy past month 3</h3>

<p>In the sales call, ask: "What's your content production cadence for a B2B SaaS client in month 4? Month 8? Month 12?" Weak agencies pivot to "we work with the client to develop a custom strategy." Strong agencies have a repeated pattern: 2-3 pieces of cornerstone content per month, year-stamped listicles in months 1-2, AEO playbooks in months 3-4, X-vs-Y comparison pages in months 4-6, industry pages and founder bylines layered in by month 8.</p>

<p><strong>What to ask instead:</strong> "Walk me through what you'd ship in month 8 for a B2B SaaS client." Specificity is the signal.</p>

<h3>7. Pricing is locked at a "design hours" rate</h3>

<p>The proposal prices the engagement at $X per design hour, $Y per dev hour, $Z per content hour. The agency makes more money the longer the work takes. There's no alignment with outcomes. Hours-based pricing rewards complexity rather than throughput.</p>

<p><strong>What to ask instead:</strong> "How does your pricing tie to client outcomes — citation rate lift, organic clicks, branded search lift, or pipeline attribution?" Outcomes-based pricing exists (project-based with milestones tied to KPIs); hours-based pricing is the default but it's the weaker model.</p>

<h3>8. The pitch leads with portfolio screenshots</h3>

<p>The first 20 minutes of the sales call are spent showing you beautiful sites the agency built. The screenshots are gorgeous. You spend zero minutes hearing about the agency's perspective on SEO/AEO architecture, content strategy, or measurable client outcomes. The agency is selling design, not a program.</p>

<p><strong>What to ask instead:</strong> "Skip the portfolio. Tell me what you believe about SEO/AEO strategy in 2026 and walk me through your last engagement's measurable outcomes." Strong agencies have a sharp perspective; weak agencies pivot back to portfolio screenshots.</p>

<h2>Bonus red flags worth checking</h2>

<p>A few patterns that aren't dealbreakers on their own but compound if they show up:</p>

<ul>
<li><strong>The agency won't share their own GSC, Peec, or Ahrefs data for their own marketing site.</strong> If they can't show their own organic growth, they aren't running the playbook they're selling you.</li>
<li><strong>The team only has Webflow specialists, no strategists or content producers.</strong> Pure Webflow studios ship beautiful sites; they don't run SEO/AEO programs.</li>
<li><strong>The agency name-drops AEO and AI search in the pitch but can't explain what Peec AI is, what citation rate means, or how AI engines extract answers.</strong> The vocabulary is borrowed; the depth isn't there.</li>
<li><strong>The case studies all share the same "20% increase in conversion rate" framing.</strong> Conversion rate optimization is real but it's not the metric that compounds for SEO/AEO. Beware of agencies whose only measurable outcome is CRO.</li>
</ul>

<h2>How to use this list</h2>

<p>In a 60-minute sales call, you'll pick up 4-5 of these signals. If you spot <strong>3 or fewer red flags</strong>, the agency is worth a second call. If you spot <strong>4-6 red flags</strong>, the agency is the wrong fit even if the price is right. If you spot <strong>7-8 red flags</strong>, walk away in the first call and save 12 weeks of your budget.</p>

<p>The honest part: every agency, including LoudFace, has at least one of these red flags in some engagements. The question is whether the structural red flags (engagement structure, no AEO architecture, no first-party data, hours-based pricing) are absent. Those four are non-negotiable for outcomes-driven Webflow programs.</p>

<h2>When agencies actually deserve a second chance</h2>

<p>Three patterns where the red flags are misleading:</p>

<ol>
<li><strong>The agency just rebuilt their own marketing site.</strong> Their own GSC + Peec data might be too fresh to show meaningful outcomes (less than 6 months). Ask for client data instead.</li>
<li><strong>The agency is a specialist studio (Tier 2) and you're testing them on Tier 3 questions.</strong> A Tier 2 specialist studio shouldn't have a 12-month dual-track SEO + AEO playbook. They're not selling that. If your project is a Tier 2 brand-led marketing site, the red flags above are the wrong filter. See <a href="/blog/webflow-agency-pricing">Webflow Agency Pricing in 2026</a> for the tier framework.</li>
<li><strong>The agency is young (less than 2 years old).</strong> They may not have 12-month case studies yet. Ask for early-stage attribution data (month 6 GSC, month 4 Peec) rather than year-end outcomes.</li>
</ol>

<h2>The honest takeaway</h2>

<p>Most Webflow vendor selection failures aren't about the agency being technically incompetent. The sites they ship are usually fine. The failure mode is structural: the engagement was sold as a build, the strategic work past launch was vague, and the outcomes that compound (AI citations, branded search lift, organic pipeline) never materialized because the structure didn't include them.</p>

<p>The 8 red flags above are the structural tells. Use them as a filter in the first sales call. If you want to see what a Tier 3 program structure looks like (engagement timeline, content calendar, AEO architecture, monthly strategy cadence), <a href="/services/seo-aeo">we run discovery without pitching unfit engagements</a>. Sometimes the honest answer is "another agency on the <a href="/blog/best-webflow-agencies">Best Webflow Agencies list</a> is the better fit," and we'd rather tell you that in a 30-minute call.</p>`;

const NEW_FAQ = [
  {
    _key: "faq-1",
    _type: "object",
    question: "What are the biggest red flags when choosing a Webflow agency?",
    answer: "Eight structural red flags: (1) proposal ends at launch with no months 4-12 deliverables, (2) no AEO architecture in the IA, (3) no first-party client data shared (no GSC, no Peec citation rate, no branded search lift), (4) engagement structured as one-time deliverable, (5) references are anonymized, (6) team can't articulate content strategy past month 3, (7) pricing locked at hourly rates rather than outcomes, (8) pitch leads with portfolio screenshots rather than measurable results.",
  },
  {
    _key: "faq-2",
    _type: "object",
    question: "How many red flags should make me walk away from a Webflow agency?",
    answer: "If you spot 3 or fewer red flags in the first 60-minute sales call, the agency is worth a second call. If you spot 4-6 red flags, the agency is the wrong fit even if the price is right. If you spot 7-8 red flags, walk away in the first call and save 12 weeks of your budget. The structural red flags (engagement structure, no AEO architecture, no first-party data, hours-based pricing) are non-negotiable.",
  },
  {
    _key: "faq-3",
    _type: "object",
    question: "What questions should I ask a Webflow agency in the sales call?",
    answer: "Five high-signal questions: (1) Walk me through what you'd deliver in months 4-12 of the engagement. (2) Show me where direct-answer paragraphs and FAQPage schema appear in the IA you'd ship in week 2. (3) Show me a client case study with branded search lift on NEW queries, AI citation rate, or first-touch attribution. (4) Can I talk to two clients in active 6+ month engagements with you? (5) Skip the portfolio — tell me what you believe about SEO/AEO strategy in 2026.",
  },
  {
    _key: "faq-4",
    _type: "object",
    question: "Why is engagement structure more important than agency portfolio?",
    answer: "Sites built without a 12-month post-launch structure produce real outcomes for 12-16 weeks and then plateau. The strategic work that compounds (content production, AEO architecture, citation tracking, programmatic page expansion) sits past the launch milestone. A beautiful portfolio without engagement structure produces beautiful sites that don't compound. The structural decision is upstream of the design decision.",
  },
  {
    _key: "faq-5",
    _type: "object",
    question: "Are all Webflow agencies that show portfolio screenshots bad?",
    answer: "No. The red flag isn't showing portfolio screenshots; it's leading with them. Strong agencies have portfolios too, but they lead with their perspective on SEO/AEO strategy, their engagement structure, and their measurable client outcomes. Portfolio is the proof of execution; perspective + structure is the proof of program thinking. Weak agencies only have execution proof.",
  },
  {
    _key: "faq-6",
    _type: "object",
    question: "What's the difference between a Tier 2 Webflow studio and a Tier 3 agency?",
    answer: "Tier 2 specialist Webflow studios ($8K-$25K) ship 15-25 page custom-designed marketing sites with SEO at launch. They're optimized for brand-led design execution and hand off when the site goes live. Tier 3 full-stack SEO + AEO + Webflow agencies ($80K-$200K for first 12 months) run dual-track programs where Webflow is the implementation layer for a 12-month outcome program. The red flags above are calibrated for Tier 3 program agencies; for Tier 2 specialist studios, different criteria apply. See the pricing tier framework for details.",
  },
  {
    _key: "faq-7",
    _type: "object",
    question: "What if an agency has only one red flag — is it still safe?",
    answer: "One red flag isn't a dealbreaker. Every agency, including LoudFace, has structural quirks in some engagements. The question is which red flag and whether it's structural or stylistic. A pitch that leads with portfolio (red flag 8) is stylistic and can be coached around. An engagement structured as a one-time deliverable (red flag 4) is structural and can't be fixed without rewriting the SOW. Filter for structural red flags first; stylistic ones are negotiable.",
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

console.log(`✓ Refreshed /blog/pitfalls-of-choosing-wrong-webflow-vendor`);
console.log(`  _rev: ${result._rev}`);
