/**
 * Update "The 15+ Best B2B SaaS SEO Agencies in 2026" with humanized v3 content.
 * Breaking B2B removed; numbering closed; counts adjusted.
 *
 * Run: npx tsx scripts/update-saas-seo-post-humanized.ts
 */

import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2025-03-29',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

const DOC_ID = 'blogPost-best-b2b-saas-seo-agencies';

const content = `
<p><strong>Last updated: April 2026</strong> — refreshed quarterly as AEO, SEO, and AI citation patterns keep shifting.</p>

<p>A CMO I spoke to last month told me she'd stopped checking her Google rankings. She checks ChatGPT now. Type her category, see which three vendors get named, and that's her daily dashboard. She is not alone, and that one habit change is why most of the 2022 SaaS SEO playbook is quietly dying on the vine.</p>

<p>Organic still drives more qualified pipeline than any other channel for B2B SaaS. The mechanics underneath it have changed. AI Overviews eat the click on a meaningful slice of commercial queries. ChatGPT, Claude, and Perplexity now sit between your buyer and Google at the research stage. Long definitional blog posts still get crawled, but they rarely get cited, and cited is the new ranked.</p>

<p>I run LoudFace. We are #1 on this list. You should assume bias and read the rest of the ranking with that in mind. I have tried to write the other 15 entries the way I would describe them to a founder over dinner, including the parts that annoy me. Where an agency is better than us for a specific use case, I say so.</p>

<h2>Why B2B SaaS companies hire SEO agencies in 2026</h2>
<p>SaaS SEO is a different sport from general SEO. The buyers take 3–9 months to close. The money pages are bottom-of-funnel, not top. The metric that matters is pipeline-sourced ARR, not sessions. A few reasons the in-house-only route breaks down around Series A.</p>

<h3>In-house vs agency</h3>
<p>An in-house SEO lead costs $140K–$200K fully loaded and takes 90 days to ramp. Add a writer, an editor, a technical SEO, and a designer, and you're past $350K a year before anything ships. A focused three-person agency pod at $10K–$15K/month produces the same weekly output with faster pattern recognition, because the team has seen your exact problem dozens of times before.</p>

<h3>Compounding vs paid burn</h3>
<p>Paid stops the minute the card stops. A page shipped in month three of an SEO program is still generating demos in month thirty. For SaaS businesses carrying six-figure CAC and multi-quarter sales cycles, that durability is what keeps CAC/LTV sane as you move upmarket.</p>

<h3>AEO is now a separate workstream</h3>
<p>A query like "best CRM for B2B SaaS" used to route to a listicle. Now it routes to an LLM that picks three to five vendors and names them. If your agency optimizes only for Google's ten blue links, you are missing the layer where a growing share of your buyers actually form a shortlist. The AEO work — structured data, entity disambiguation, schema, first-party data that models can't hallucinate — is different enough from classic SEO that most agencies are still figuring it out.</p>

<h3>BoFu beats brand</h3>
<p>SaaS buyers don't convert from "what is a SaaS" blog posts. They convert from alternatives pages, versus pages, integration hubs, and use-case pages. Any agency pitch that leads with topic clusters and pillar content without mentioning competitor alternatives is a brand-marketing pitch, not a revenue pitch.</p>

<h3>Revenue reporting, not activity reporting</h3>
<p>The good agencies tie rankings to closed revenue. That takes UTM discipline at the CMS level, multi-touch attribution, and a reporting pipeline connecting HubSpot or Salesforce to GA4. "Keyword positions improved 12%" tells you nothing. "SEO sourced $420K in pipeline this quarter, 60% from 8 alternatives pages" tells you whether the retainer is worth renewing.</p>

<h2>What separates a great SaaS SEO agency from a decent one</h2>
<p>Every agency claims SaaS specialism. Most don't have it. A few things to actually screen on.</p>

<p><strong>Real SaaS portfolio depth.</strong> Ten-plus SaaS case studies across seed to Series C, with pipeline outcomes attached. One logo on the homepage means they are still learning on you.</p>

<p><strong>BoFu-first roadmap.</strong> Ask what the first 90 days of content looks like. A 20/80 BoFu-to-ToFu split signals a traffic agency. A 50/50 or heavier-on-BoFu split signals a revenue one.</p>

<p><strong>Technical chops on your actual stack.</strong> Ask them to walk through a past audit of a Next.js, Webflow, or headless build. If they can't talk specifics about rendering and schema on a site like yours, rankings won't move no matter how crisp the content is.</p>

<p><strong>AEO that actually works.</strong> Ask how they'd grow your citations in Claude, ChatGPT, and Perplexity over the next two quarters. If the answer is generic LLM-speak, you're two years ahead of your agency.</p>

<p><strong>First-party data.</strong> The agencies that win build proprietary datasets their clients become the source for. Rewriting the HubSpot blog produces content Google already has three versions of.</p>

<h2>The 15+ best B2B SaaS SEO agencies in 2026</h2>

<h3>1. LoudFace — integrated SEO, Webflow/Next.js, and AEO under one team</h3>
<p>We are on this list because we fix the handoff problem. Most SaaS SEO programs stall for weeks when content gets thrown over a wall to an internal dev team. Content, code, schema, AEO, and CRO all ship from the same team here, which is why our case studies land in quarters instead of years.</p>

<p><strong>What we actually do:</strong></p>
<ul>
<li>Full-funnel SaaS SEO: strategy, BoFu page production, content, technical, CRO</li>
<li>AEO programs: LLM citation work, entity disambiguation, structured data, monthly AI visibility reporting</li>
<li>Webflow and Next.js builds for marketing sites, shipped alongside the content roadmap</li>
<li>Fractional CMO engagements for seed to Series B teams</li>
</ul>

<p><strong>Case studies you can read end to end:</strong></p>
<ul>
<li><strong>CodeOp</strong> — +49% organic traffic in 4 months, +53% impressions, +26% average keyword position. <a href="https://www.loudface.co/case-studies/codeop">Read it</a>.</li>
<li><strong>Zeiierman</strong> — +43% organic, +46% CTR. <a href="https://www.loudface.co/case-studies/zeiierman">Read it</a>.</li>
<li><strong>Outbound Specialist</strong> — $200K in launch-month revenue from the marketing site. <a href="https://www.loudface.co/case-studies/outbound-specialist">Read it</a>.</li>
</ul>

<p><strong>Who we're the right call for:</strong> seed to Series B B2B SaaS whose content program is blocked by dev handoff, CMOs who want AEO treated as a core program rather than a bolt-on, and technical founders who want one team shipping both the Next.js code and the BoFu pages.</p>

<p><strong>Where we're not the best fit:</strong> enterprise SaaS with a 12-month procurement cycle and a 30-person in-house content team. Directive or Siege will serve you better.</p>

<hr />

<p>After LoudFace, these 14 are the ones I'd actually send a founder to, depending on stage and situation.</p>

<h3>2. Animalz</h3>
<p>Animalz essentially invented the modern SaaS content agency. They built their reputation writing for Amplitude, Intercom, and Mixpanel, and the editorial bench is still deeper than most. Senior writers, tight editing, a real point of view.</p>
<p>The tradeoff: you are paying for that bench. If you are pre-Series B and need BoFu page velocity, you will feel the per-piece cost.</p>
<p><strong>Best for:</strong> Series B+ teams with a brand-led content thesis and the budget for premium editorial.</p>

<h3>3. Omniscient Digital</h3>
<p>Alex Birkett and David Ly Khim built Omniscient around product-led content and serious measurement. It feels more like an embedded fractional team than a traditional agency. Strategists co-own the roadmap with your in-house marketing lead, and the writer network is curated rather than scaled.</p>
<p><strong>Best for:</strong> growth-stage SaaS that wants a strategic partner rather than a content factory.</p>

<h3>4. Siege Media</h3>
<p>Ross Hudgens has been running Siege since 2012, and they are the largest agency on this list by headcount. The playbook is operational rigor plus link-worthy content at volume. Asana, Shopify, and Zendesk have all been clients.</p>
<p>If you need 15 pieces a month with earned links attached, Siege is the answer. If you need a senior strategist who will get on the phone at 10pm when your launch breaks, you'll want someone smaller.</p>
<p><strong>Best for:</strong> mid-market and enterprise SaaS that need volume plus active link acquisition.</p>

<h3>5. Veza Digital</h3>
<p>Veza combines Webflow builds with SEO and PR. Closest in shape to what LoudFace does, and I mean that as a compliment. They work mostly with Series A–D SaaS and treat the marketing site as a growth asset rather than a static brochure.</p>
<p><strong>Best for:</strong> growth-stage SaaS planning a site rebuild who want SEO baked in from day one.</p>

<h3>6. Directive</h3>
<p>Garrett Mehrguth's "customer generation" framework bundles SEO, paid search, and paid social into a single pipeline engine. Strong analytics infrastructure, strong reporting. Mid-market to enterprise focus.</p>
<p>The tradeoff is familiar with any integrated agency: you get blended reporting and shared accountability, but no channel is best-in-class.</p>
<p><strong>Best for:</strong> Series B+ teams that want one vendor running demand across channels.</p>

<h3>7. First Page Sage</h3>
<p>Evan Bailyn has been running First Page Sage since 2009, which is rare in an industry where most shops rebrand every three years. Their thing is thought-leadership SEO under real expert bylines. Twelve to twenty-four month horizons, not quick wins.</p>
<p><strong>Best for:</strong> B2B SaaS companies with a long investment horizon who want defensible authority in a competitive niche.</p>

<h3>8. Single Grain</h3>
<p>Eric Siu's agency. Broader than pure SaaS but with a sizable SaaS practice. SEO sits inside a full-service offering that includes paid and CRO. The Leveling Up podcast is the demand engine.</p>
<p><strong>Best for:</strong> SaaS teams that want one agency handling several channels instead of stitching three partners together.</p>

<h3>9. NoGood</h3>
<p>NYC-based growth team with a strong startup practice. Creative and performance marketing sit under one roof here, which matters for SaaS because the ad unit and the landing page have to speak the same language.</p>
<p><strong>Best for:</strong> seed to Series B SaaS that needs multi-channel growth velocity fast.</p>

<h3>10. Grow and Convert</h3>
<p>Devesh Khanal and Benji Hyam coined "pain point SEO," which is essentially what the rest of the industry now calls BoFu content. They still do it better than most, and their reporting goes down to the lead level, which is rare.</p>
<p><strong>Best for:</strong> B2B SaaS companies that want to measure SEO in pipeline, not traffic.</p>

<h3>11. Foundation Marketing</h3>
<p>Ross Simmonds's argument: content is an asset you re-promote, not a one-time publish. Foundation runs proprietary research programs that often earn authority placements most agencies can't.</p>
<p><strong>Best for:</strong> SaaS teams that want content with a lifespan beyond the first publish.</p>

<h3>12. Skale</h3>
<p>UK-based, SaaS-only, commercially focused. Narrower than most shops on this list, which is usually a feature. European timezone coverage helps if you're UK or EU.</p>
<p><strong>Best for:</strong> SaaS teams wanting a specialist with a tight scope.</p>

<h3>13. Roketto</h3>
<p>Canadian inbound agency built around HubSpot. SEO, HubSpot CMS, and content production run as one program, with lead scoring and nurture integrated.</p>
<p><strong>Best for:</strong> HubSpot-native SaaS teams who want SEO wired into marketing automation from day one.</p>

<h3>14. Powered by Search</h3>
<p>Dev Basu's shop. Canadian, enterprise-leaning, with a deep technical SEO bench. If you have rendering problems, schema debt, or indexation issues on a complex site, this is where I'd send you.</p>
<p><strong>Best for:</strong> mid-market and enterprise SaaS carrying real technical SEO debt.</p>

<h3>15. Kalungi</h3>
<p>Fractional CMO plus a full outsourced marketing team. SEO is one channel inside a broader operation. Playbook-driven, which is either great or frustrating depending on how unique you think your situation is.</p>
<p><strong>Best for:</strong> seed to Series A SaaS that needs a whole marketing team, not a single channel partner.</p>

<h2>How to actually pick one</h2>
<p>The gap between agencies four through ten is mostly vibes and fit. A few hard checks before you sign.</p>

<p><strong>Write your six-month outcome in dollars.</strong> "More traffic" is not an outcome. "$500K in SEO-sourced pipeline by month six" is. Evaluate every pitch against that number.</p>

<p><strong>Ask for three SaaS case studies at your stage.</strong> Not e-commerce. Not consumer. SaaS. Ask for the month-by-month traffic and pipeline, not the summary chart.</p>

<p><strong>Match the delivery model to what you need.</strong> Senior-strategist-led (Omniscient, Animalz). Scale-production (Siege). Fractional CMO (Kalungi). Integrated SEO-plus-build (LoudFace, Veza). These are fundamentally different shapes. Pick the one that fits your gap, not the one that sounds most impressive.</p>

<p><strong>Stress-test their AEO answer.</strong> If you ask how they'd grow your citations in Claude and ChatGPT, and the reply is hand-waving about "optimizing for AI," pass.</p>

<p><strong>Read a sample monthly report.</strong> If it doesn't include revenue attribution and doesn't have a CFO-readable summary, the agency is selling activity.</p>

<h2>Where SaaS SEO is actually going in 2026</h2>
<p>Four shifts worth calling out.</p>

<p><strong>Citations are the new backlinks.</strong> Ranking #1 matters less when the AI answer replaces the click. Getting cited by ChatGPT, Claude, Perplexity, and AI Overviews is now more valuable than a position-one listing for a growing number of queries. Agencies that haven't repositioned around citation growth are losing ground quietly.</p>

<p><strong>BoFu is most of the ROI.</strong> Alternatives, comparisons, integration hubs. That is where the pipeline comes from. Front-load these in the first 90 days. Treat ToFu as authority-building, not revenue-generating.</p>

<p><strong>Programmatic SEO is back, cautiously.</strong> AI lets small teams ship hundreds of pages that used to take an agency a quarter. Google's core and spam updates through 2024 and 2025 also mean unedited AI content gets demoted fast. The winning shape is AI for scale, humans on the quality gate.</p>

<p><strong>Entity SEO decides whether AI can tell you apart from competitors.</strong> Wikidata, G2, Capterra, consistent structured data across the web. If the models can't disambiguate your brand from three lookalikes, you don't get cited at all.</p>

<h2>Why LoudFace might be the right call</h2>
<p>Each agency on this list has a real specialization. Ours is integration. SEO, content, Webflow and Next.js builds, CRO, and AEO shipped by one team on one roadmap, which is why the handoff stalls that kill most SaaS SEO programs don't happen here.</p>

<p>Most agencies outsource development, or throw strategy over a wall to your internal dev team, which is where most SaaS SEO programs die. CodeOp, Zeiierman, and Outbound Specialist shipped on schedule because the same team owned content, code, schema, and conversion end to end.</p>

<p>Our monthly reports show SEO-sourced ARR and BoFu page conversion rates. If your CFO has been asking what SEO actually returns, that's the report we built.</p>

<p><strong>AEO from week one.</strong> We don't bolt citation work onto a program six months in. Clients show up in ChatGPT, Claude, and Perplexity results because we build for citations from the first sprint.</p>

<h3>What clients say</h3>
<p><em>"The LoudFace team and Arnel built and maintain our Webflow website. Quick turnaround, good communication, professional. I have not had a feature request they couldn't deliver. Our team can focus on building the product because LoudFace handles the marketing site."</em></p>
<p>— Shin Kim, CEO, Eraser</p>

<p><em>"LoudFace stood out with their approach and their let's-get-this-done attitude. We felt like a partner rather than a client."</em></p>
<p>— Elizabete, Product Marketer, Reiterate</p>

<h2>Pick an agency that ships revenue, not reports</h2>
<p>The B2B SaaS SEO market is split. Half the agencies are still selling keyword positions. The other half ship BoFu pages, optimize for AI citations, and report in pipeline dollars. All 15 agencies above sit on the right side of that split.</p>

<p>If your SEO program is stuck because of dev handoff, if you want AEO baked in from day one, or if you want one team running content, site, and CRO together, <a href="https://www.loudface.co/contact">that's when LoudFace is the right call</a>.</p>
`.trim();

const faq = [
  {
    _key: 'faq0',
    _type: 'object',
    question: 'Why do B2B SaaS companies need SEO agencies in 2026?',
    answer:
      "SaaS buying cycles are long, the pages that convert sit at the bottom of the funnel, and revenue reporting requires multi-touch attribution nobody on a three-person marketing team has time to wire up. A specialist agency team produces the same weekly output as a six-person in-house team with faster pattern recognition. AEO expertise is also hard to hire for in-house right now. The pool of operators who've actually moved citation counts in ChatGPT or Perplexity is small and mostly already inside agencies.",
  },
  {
    _key: 'faq1',
    _type: 'object',
    question: 'What makes SaaS SEO different from other industries?',
    answer:
      "It's about bottom-of-funnel commercial queries, not top-of-funnel education. Alternatives pages, versus pages, integration hubs, use-case content. Buyer journeys run 3–9 months. Pricing is subscription-based. Success is measured in pipeline-sourced ARR, not sessions.",
  },
  {
    _key: 'faq2',
    _type: 'object',
    question: 'How much does a B2B SaaS SEO agency cost in 2026?',
    answer:
      "$5K/month for focused content-only retainers at the low end. $25K+/month for integrated programs covering technical SEO, BoFu content, AEO, and CRO. Technical audits and competitor gap analyses usually run $5K–$15K one-time. Enterprise engagements with dedicated pods can clear $50K/month. Anyone quoting you $1,500/month is not a SaaS SEO agency, they're a freelancer with a logo.",
  },
  {
    _key: 'faq3',
    _type: 'object',
    question: 'How long does SaaS SEO take to work?',
    answer:
      "Technical fixes tend to show impact in 4–8 weeks. For BoFu rankings, plan on 3–6 months before the needle moves, and 6–12 before you see real compounding. If an agency is pitching a three-month contract, they're either doing audit work or selling you something that won't hold.",
  },
  {
    _key: 'faq4',
    _type: 'object',
    question: 'What is AEO, and why does it matter?',
    answer:
      'Answer Engine Optimization. Optimizing to be cited by ChatGPT, Claude, Perplexity, and Google AI Overviews. It matters because your buyers are running their first category search inside an LLM, and the three vendors that get named there tend to be the three on the shortlist. Ranking #1 on Google and getting ignored by ChatGPT is now a real failure mode.',
  },
  {
    _key: 'faq5',
    _type: 'object',
    question: 'How do I know if a SaaS SEO agency is working?',
    answer:
      "Measure pipeline-sourced ARR, MQL volume from organic, BoFu page conversion rates to demo or signup, category share of voice, and citation rate in ChatGPT and Perplexity. Any agency that can't report at least three of those is measuring the wrong things.",
  },
  {
    _key: 'faq6',
    _type: 'object',
    question: 'What should I screen for when hiring?',
    answer:
      "Ten-plus SaaS case studies with pipeline outcomes attached. A documented BoFu-first methodology. Technical chops on your actual stack (Next.js, Webflow, headless). A clear AEO program. Reporting that ties SEO to closed revenue. Pass on anyone who can't articulate all five.",
  },
];

async function main() {
  const result = await sanity
    .patch(DOC_ID)
    .set({
      excerpt:
        'An honest ranking of the B2B SaaS SEO agencies worth hiring in 2026, with the tradeoffs nobody puts on their homepage.',
      content,
      faq,
      publishedDate: '2026-04-17T02:00:00.000Z',
      lastUpdated: '2026-04-17T02:00:00.000Z',
    })
    .commit();

  console.log('Updated:', result._id);
  console.log('content length:', (result.content || '').length);
  console.log('faq count:', result.faq?.length);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
