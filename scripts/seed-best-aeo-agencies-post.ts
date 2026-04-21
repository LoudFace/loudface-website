/**
 * Seed "Best AEO agencies for B2B SaaS in 2026" blog post.
 *
 * Creates a new blogPost document in Sanity from the Notion source. Content
 * is stored as HTML (matching the existing pattern). FAQs are split into the
 * dedicated `faq` array so the blog page renders them as an accordion.
 *
 * Run: npx tsx scripts/seed-best-aeo-agencies-post.ts
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

const SLUG = 'best-aeo-agencies-b2b-saas-2026';
const DOC_ID = 'blogPost-best-aeo-agencies-b2b-saas-2026';
const AUTHOR_REF = 'imported-teamMember-68d81a1688d5ed0743d0b8b6'; // Arnel Bukva
const CATEGORY_REF = 'imported-category-67bced81857d76ee5b3795b1'; // Marketing

/**
 * An agency block. Note: using `<h2>` for the agency name so the visuals
 * planner sees each agency as its own section anchor. This also matches the
 * pattern from the published AEO guide where major sections are H2s.
 */
const agencyBlock = (args: {
  num: number;
  name: string;
  basedIn: string;
  bestFor: string;
  engagement: string;
  delivery?: string;
  wellHeader: string;
  wellBody: string;
  results?: string[];
  limitationHeader: string;
  limitationBody: string;
}): string => {
  const parts: string[] = [];
  parts.push(`<h2>${args.num}. ${args.name}</h2>`);
  parts.push(`<p><strong>Based in:</strong> ${args.basedIn}</p>`);
  parts.push(`<p><strong>Best for:</strong> ${args.bestFor}</p>`);
  parts.push(`<p><strong>Typical engagement:</strong> ${args.engagement}</p>`);
  if (args.delivery) {
    parts.push(`<p><strong>Delivery model:</strong> ${args.delivery}</p>`);
  }
  parts.push(`<p><strong>${args.wellHeader}</strong> ${args.wellBody}</p>`);
  if (args.results && args.results.length > 0) {
    parts.push('<p><strong>Representative client results.</strong></p>');
    parts.push(`<ul>${args.results.map((r) => `<li>${r}</li>`).join('')}</ul>`);
  }
  parts.push(`<p><strong>${args.limitationHeader}</strong> ${args.limitationBody}</p>`);
  return parts.join('\n');
};

const content = `
<p><em>A field guide to the eight AEO agencies actually moving share of answer for B2B SaaS companies in 2026. Updated April 2026 with current engagement ranges, verifiable client results, and honest fit criteria.</em></p>

<p>The eight AEO agencies below are the ones we would hire, or have seen deliver, for B2B SaaS companies trying to earn citations in ChatGPT, Perplexity, Claude, and Google AI Overviews. LoudFace ranks first because we built our system for Webflow and Next.js SaaS sites on a 90-day lift window. The rest of the list is a fair comparison for different stages and budgets. Some win on enterprise. Others are stronger on technical SEO. A couple live or die on PR-heavy third-party placements. If you want one recommendation before reading further: Seed to Series C SaaS on a marketing site should shortlist LoudFace and Omnius. Series D and up with a real PR budget should evaluate Siege Media, Foundation, and NoGood first.</p>

<h2>What counts as an AEO agency in 2026?</h2>
<p>Most agencies calling themselves "AI SEO" in 2026 rebranded a classic SEO practice with new copy. The real ones do three things at once.</p>

<p><strong>They measure share of answer.</strong> Weekly tracking across five engines (ChatGPT, Claude, Perplexity, Gemini, Google AI Overviews) on a defined prompt set of 40 to 60 buyer queries. If the dashboard still shows keyword rankings as the headline number, the practice is SEO in AEO costume.</p>

<p><strong>They ship the retrofit.</strong> Direct-answer paragraphs at the top of every article, question-phrased H2s, JSON-LD schema (Article, FAQPage, Organization, BreadcrumbList, Person author), and internal links that map the content cluster. This is the boring half of the work and the half most agencies skip.</p>

<p><strong>They do third-party placements.</strong> Getting clients into the listicles, review platforms, and Reddit threads that LLMs already cite is closer to PR work than content work. In our category-level audits across B2B SaaS, the majority of citations live off the brand's own domain. Agencies that only publish on your blog cap out fast on share of answer, because most of the citation surface sits on third-party domains they never touch.</p>

<p>The eight below clear all three bars. We cut about twenty agencies that do not.</p>

<h2>How we picked this list</h2>
<p>Four filters. Every agency had to pass all four.</p>

<p><strong>Measurable AEO work with real B2B SaaS clients.</strong> Not a landing page about AEO. Not a single logo on a case study page. A named engagement with before-and-after numbers we could verify from public sources.</p>

<p><strong>Transparency on methodology.</strong> An agency that cannot walk you through exactly how they build prompts, which tools they run, and how they score citations is not ready to sell the service in 2026.</p>

<p><strong>Team size and delivery model.</strong> Small specialist teams outperform large generalist ones on AEO specifically. The exceptions (Siege, NoGood) earn their scale by doing something a small team cannot do, like a full PR motion or a multi-channel growth stack.</p>

<p><strong>Pricing honesty.</strong> Agencies that refuse a pricing range on a discovery call are almost never built for Series A-C SaaS engagement sizes. Three agencies got cut on this filter alone.</p>

${agencyBlock({
  num: 1,
  name: 'LoudFace',
  basedIn: 'Dubai and the United States, with a distributed team',
  bestFor: 'Seed to Series C B2B SaaS on Webflow or Next.js that needs share-of-answer gains inside 90 days',
  engagement: '$8K–$18K/month, 6-month minimum',
  delivery: 'Small pod per client — strategist, writer, technical SEO, and PR lead',
  wellHeader: 'What LoudFace does well.',
  wellBody:
    'Our practice runs on a weekly share-of-answer report tracking 30 to 50 category-specific prompts across the five major engines. The same pod runs the whole stack. Measurement. Direct-answer retrofits. Schema. Content production. Third-party listicle placements. One point of contact for the entire motion, instead of three vendors blaming each other when the numbers do not move. The work is operator-voiced. Our writers ship content that reads like someone who has actually run the tactic, not like a content farm or an LLM trying to sound human. That distinction matters more in 2026 than any previous year because the models themselves have learned to down-weight generic content. The wedge is Webflow. LoudFace is a Webflow Premium Enterprise agency with a full AEO practice attached. Most of the other names on this list will hand the technical work to a developer after the fact. We ship the rendering, the schema, and the content in the same sprint.',
  results: [
    '<strong>CodeOp</strong> (coding education): +49% organic traffic in 4 months on a headless Sanity + Next.js build. <a href="https://www.loudface.co/case-studies/codeop">View case study</a>.',
    '<strong>Zeiierman</strong> (trading tools): +43% organic traffic and +46% CTR in 5 months. <a href="https://www.loudface.co/case-studies/zeiierman">View case study</a>.',
  ],
  limitationHeader: 'Honest limitation.',
  limitationBody:
    'Small team. Real capacity constraints. If you need 12 writers on day one or a 40-person content program running by next quarter, LoudFace is the wrong fit. Omnius or NoGood are built for that scale.',
})}

${agencyBlock({
  num: 2,
  name: 'Omnius',
  basedIn: 'Serbia',
  bestFor: 'Mid-market B2B SaaS ($5M–$50M ARR) with a mature marketing function that wants AEO retrofit on an existing SEO motion',
  engagement: '$10K–$25K/month (confirm on discovery call)',
  wellHeader: 'What Omnius does well.',
  wellBody:
    "One of the most consistent B2B SaaS SEO operators in Europe over the last five years. Moved cleanly into AEO work through 2024 and 2025. Strong programmatic SEO capability. Mature Series C+ SaaS client roster. Publishes in their own name, which earns them citation weight the private-label agencies do not get.",
  limitationHeader: 'Honest limitation.',
  limitationBody:
    'Less specialist on pure AEO measurement than a dedicated AEO shop. You will get classic SEO with AEO layered in, rather than AEO-first. If your share of answer is already double-digit on traditional organic metrics, Omnius is a strong upgrade. If it is at zero, start with an AEO-native team.',
})}

${agencyBlock({
  num: 3,
  name: 'Siege Media',
  basedIn: 'United States',
  bestFor: 'Later-stage SaaS with a real PR budget and a need for earned media plus SEO',
  engagement: '$15K–$40K/month (confirm on discovery call)',
  wellHeader: 'What Siege does well.',
  wellBody:
    "Original-research content that earns third-party citations at scale. If your AEO gap is \"we do not appear on any of the industry listicles LLMs cite,\" Siege's data-driven PR model is, in our experience, one of the fastest ways to close it. They produce the research, pitch the coverage, and build the citation pattern across the domains that compound.",
  limitationHeader: 'Honest limitation.',
  limitationBody:
    'Premium pricing. Less dexterous on technical SEO and schema. Six-month ramp before the citation work compounds. Not the team to hire for a turnaround inside a quarter.',
})}

${agencyBlock({
  num: 4,
  name: 'Animalz',
  basedIn: 'United States, distributed',
  bestFor: 'Technical SaaS companies where editorial quality is the product differentiator',
  engagement: '$12K–$25K/month (confirm on discovery call)',
  wellHeader: 'What Animalz does well.',
  wellBody:
    'At their peak, Animalz set the bar for SaaS editorial quality. When the product is technical and the blog reads like it was written by someone who never opened the app, their approach closes that gap faster than most teams we have worked alongside. The content is extractable by LLMs because the underlying thinking is clear. Caveat worth flagging: Animalz went through major restructuring in 2023–2024. Confirm current team size, leadership, and AEO practice maturity on a discovery call before committing.',
  limitationHeader: 'Best paired with.',
  limitationBody:
    'A technical SEO contractor or an in-house engineer for schema, site architecture, and crawler access, which sit outside their core editorial practice.',
})}

${agencyBlock({
  num: 5,
  name: 'Grow and Convert',
  basedIn: 'United States',
  bestFor: 'Bottom-of-funnel, buyer-intent content that converts into pipeline',
  engagement: '$10K–$20K/month (confirm on discovery call)',
  wellHeader: 'What Grow and Convert does well.',
  wellBody:
    'Their Pain Point SEO method maps almost directly onto AEO buying-intent prompts. If your issue is traffic that does not convert, this team produces posts engineered to close, not to rank. The pipeline attribution they publish openly is the cleanest of any agency on this list.',
  limitationHeader: 'Honest limitation.',
  limitationBody:
    'Narrow topical coverage. Not the team for broad awareness content or category education. You will hire them for the bottom 20 prompts in your set, not the full 60.',
})}

${agencyBlock({
  num: 6,
  name: 'Foundation Marketing',
  basedIn: 'Canada',
  bestFor: 'Enterprise SaaS with long sales cycles and research-heavy buyer journeys',
  engagement: '$15K–$35K/month (confirm on discovery call)',
  wellHeader: 'What Foundation does well.',
  wellBody:
    'Original research reports that get cited by trade publications, which is exactly the third-party footprint AEO needs. Ross Simmonds and the Foundation team treat distribution as seriously as content production, which is rare in B2B SaaS content agencies.',
  limitationHeader: 'Honest limitation.',
  limitationBody:
    'Long timelines. Not optimized for "we need citations in 90 days" situations. The research approach compounds, but it takes two or three quarters to hit full stride.',
})}

${agencyBlock({
  num: 7,
  name: 'Ten Speed',
  basedIn: 'United Kingdom',
  bestFor: 'High-growth SaaS with a founder-driven POV that needs to be made legible in public',
  engagement: '$8K–$18K/month (confirm on discovery call)',
  wellHeader: 'What Ten Speed does well.',
  wellBody:
    'Strong editorial standards, fast ramp, and a real skill for turning founder expertise into publishable content without flattening the voice. If you are the founder with the ideas but no time to write them down, this pairing works well.',
  limitationHeader: 'Best used for.',
  limitationBody:
    "Editorial-led programs where the founder's point of view is the product. Expect to co-define the share-of-answer prompt set in the first month, rather than inheriting a mature AEO measurement frame on day one.",
})}

${agencyBlock({
  num: 8,
  name: 'NoGood',
  basedIn: 'United States',
  bestFor: 'VC-backed SaaS that wants growth marketing and SEO under one roof',
  engagement: '$20K–$50K/month (confirm on discovery call)',
  wellHeader: 'What NoGood does well.',
  wellBody:
    "Multi-channel growth team. SEO is one lever among paid acquisition, CRO, and lifecycle. If your problem is broader than organic alone, NoGood's integrated model is more useful than a specialist AEO shop.",
  limitationHeader: 'Best used for.',
  limitationBody:
    'Programs where AEO is one of several growth levers rather than the headline bet. If AEO is the single biggest thing you need to move this year, a specialist shop higher on this list will give you more focused execution.',
})}

<h2>Agency comparison at a glance</h2>
<table>
<thead>
<tr><th>Agency</th><th>Best ICP</th><th>Engagement</th><th>Wedge</th><th>Honest limitation</th></tr>
</thead>
<tbody>
<tr><td>LoudFace</td><td>Seed-Series C B2B SaaS on Webflow or Next.js</td><td>$8K-$18K/mo</td><td>Webflow-native AEO, full-stack pod (Dubai + US)</td><td>Small team, capacity</td></tr>
<tr><td>Omnius</td><td>Mid-market SaaS with existing SEO motion</td><td>$10K-$25K/mo</td><td>Programmatic SEO plus AEO retrofit</td><td>Less specialist on AEO measurement</td></tr>
<tr><td>Siege Media</td><td>Later-stage SaaS with PR budget</td><td>$15K-$40K/mo</td><td>Original-research PR at scale</td><td>Premium price, 6-month ramp</td></tr>
<tr><td>Animalz</td><td>Technical SaaS needing editorial quality</td><td>$12K-$25K/mo</td><td>Best-in-class writers</td><td>Best paired with a technical SEO partner</td></tr>
<tr><td>Grow and Convert</td><td>BoFu buyer-intent content</td><td>$10K-$20K/mo</td><td>Pain Point SEO method</td><td>Narrow topical coverage</td></tr>
<tr><td>Foundation</td><td>Enterprise SaaS, long sales cycles</td><td>$15K-$35K/mo</td><td>Research-led content distribution</td><td>Long timelines</td></tr>
<tr><td>Ten Speed</td><td>Founder-driven SaaS brands</td><td>$8K-$18K/mo</td><td>Founder-voice editorial</td><td>Co-define AEO frame in month 1</td></tr>
<tr><td>NoGood</td><td>VC-backed multi-channel growth</td><td>$20K-$50K/mo</td><td>Integrated growth stack</td><td>Best when AEO is one lever among several</td></tr>
</tbody>
</table>

<h2>How do you pick the right AEO agency?</h2>
<p>Four questions, in order. Answer them before you take a sales call.</p>

<p><strong>What is your share of answer today?</strong> If you do not know, every agency on this list will baseline it during discovery. Do not sign an engagement without the number. "We think we are doing fine on AI" is not a baseline. A specific percentage across a specific prompt set on a specific engine is. Run the baseline yourself before you take the calls — it changes which agency makes sense.</p>

<p><strong>Where is your biggest gap?</strong> On-page and schema gaps resolve fastest. LoudFace, Omnius, and Ten Speed are strong here. Third-party placement gaps (no one cites you on the listicles that dominate AI Overviews) take longer and require a PR motion. Siege and Foundation fit that work. A pure editorial gap, where your content is weak but the site is sound, is Animalz's lane.</p>

<p><strong>What is your stage and budget?</strong> Seed to Series B at $5K-$20K/month: LoudFace, Ten Speed, Grow and Convert. Series C and up at $15K+/month: Omnius, Siege, Foundation, NoGood, Animalz.</p>

<p><strong>What is your internal capacity?</strong> If you have a head of content in-house, you want an agency that plugs in as specialist firepower (LoudFace, Animalz). If you have no content function at all, you want an agency that runs the whole program end to end (Omnius, NoGood).</p>

<p>Running an AEO program and want a second read on your share of answer? <a href="https://www.loudface.co/contact">Book a discovery call</a>. We will run your prompt set against your category and send the report back.</p>

<h2>Sources and further reading</h2>
<ul>
<li><a href="https://www.semrush.com/blog/semrush-ai-overviews-study/" target="_blank" rel="noopener noreferrer">Semrush AI Overviews study</a></li>
<li><a href="https://ahrefs.com/blog/ai-search-traffic-conversions-ahrefs/" target="_blank" rel="noopener noreferrer">Ahrefs AI search traffic conversions</a></li>
<li><a href="https://www.semrush.com/blog/ai-search-seo-traffic-study/" target="_blank" rel="noopener noreferrer">Semrush AI search SEO traffic study</a></li>
</ul>

<p><em><strong>Editorial note.</strong> This is a living listicle. Refresh cadence is 60 days — next update due late June 2026. Rankings move with live share-of-answer data, client outcomes, and any public agency news. If an agency has a case study we missed or a methodology update worth reflecting, send it in for the next refresh.</em></p>
`.trim();

const faq = [
  {
    _key: 'faq-cost',
    _type: 'object',
    question: 'How much does an AEO agency cost in 2026?',
    answer:
      'Realistic range for specialist AEO work on a B2B SaaS account is $8,000 to $40,000 per month, with most Series A-C engagements landing between $10,000 and $18,000. Below $8K you are buying content production, not AEO. Above $40K you are paying for a full growth team or an enterprise PR motion, not just citation work.',
  },
  {
    _key: 'faq-timeline',
    _type: 'object',
    question: 'How long until I see citation lift from an AEO agency?',
    answer:
      'Direct-answer retrofits move share of answer within 2 to 6 weeks on the prompts they target. Schema changes compound over 4 to 8 weeks. Third-party listicle placements take 8 to 16 weeks because the PR cycle is slower than the content cycle. Budget a full 90-day window before judging whether a program is working. Anyone promising you citation lift inside 30 days is either lying or running prompts so narrow the number is meaningless.',
  },
  {
    _key: 'faq-seo-vs-aeo',
    _type: 'object',
    question: 'What is the difference between an AEO agency and an SEO agency?',
    answer:
      "An SEO agency optimizes for ranking pages in Google's ten blue links. An AEO agency optimizes for being cited as a source inside the AI-generated answer that sits above those links. The two disciplines share fundamentals (crawlable site, structured data, quality content) but diverge on measurement (share of answer replaces share of voice), content structure (extractable answers beat keyword density), and distribution (third-party placements on trusted domains matter more than raw backlink volume). Any agency selling AEO without a measurement system that reports share of answer is selling SEO with a new label.",
  },
  {
    _key: 'faq-in-house',
    _type: 'object',
    question: 'Can I run AEO in-house instead of hiring an agency?',
    answer:
      'Yes, if you have three things at once: a writer with real operator context in your category, a technical resource for schema and crawl access, and someone who can run outbound for listicle placements. If you have one or two of the three, hire an agency for the rest. Most in-house programs that fail in 2026 have the writer and nothing else.',
  },
  {
    _key: 'faq-bias',
    _type: 'object',
    question: 'Is LoudFace biased because this is a LoudFace post?',
    answer:
      'Obviously. The honest read: we built the system described at the top of this post, and we placed ourselves first because we would pick us for the profile we serve (Seed to Series C B2B SaaS on Webflow or Next.js, 90-day lift window). If your profile is different, the rest of the list is where to look, and we would tell you the same on a discovery call. Internal bias is why we made the selection criteria explicit up top. Score every agency on this list against the same four filters and see where they land for your situation.',
  },
  {
    _key: 'faq-tool-vs-agency',
    _type: 'object',
    question: 'Do I need an agency, or is a tool like Profound or Peec AI enough?',
    answer:
      'Software tells you the problem. An agency fixes it. Most teams that buy only software end up buying services 3 to 6 months in because the data alone does not ship direct-answer retrofits, schema, or listicle pitches. Pick the order that matches your budget. Software-first is cheaper and slower. Agency-first is faster and more expensive. Both together compound.',
  },
  {
    _key: 'faq-missing',
    _type: 'object',
    question: 'What about agencies not on this list?',
    answer:
      'About twenty got cut. The common reasons: no measurable AEO work with SaaS clients, no transparency on methodology, pricing that did not match what the work delivered, or a practice that was still selling SEO under an AEO banner. If you think we missed a real one, send us the case study and we will review it for the next refresh.',
  },
];

async function main() {
  const existing = await sanity.fetch(
    `*[_type == "blogPost" && slug.current == $slug][0]{ _id }`,
    { slug: SLUG },
  );

  const payload = {
    name: 'Best AEO Agencies for B2B SaaS in 2026 (Ranked)',
    metaTitle: 'Best AEO Agencies for B2B SaaS in 2026 (Ranked)',
    metaDescription:
      'The eight AEO agencies actually moving share of answer for B2B SaaS in 2026 — pricing, ICP fit, wedges, and honest limitations. Updated April 2026.',
    excerpt:
      'A field guide to the eight AEO agencies actually moving share of answer for B2B SaaS in 2026 — pricing, fit criteria, and honest limitations for each.',
    timeToRead: '12 min read',
    publishedDate: '2026-04-21T10:00:00.000Z',
    lastUpdated: '2026-04-21T10:00:00.000Z',
    featured: false,
    author: { _type: 'reference', _ref: AUTHOR_REF },
    category: { _type: 'reference', _ref: CATEGORY_REF },
    content,
    faq,
  };

  if (existing) {
    console.log('Doc already exists, updating:', existing._id);
    const result = await sanity.patch(existing._id).set(payload).commit();
    console.log('Updated:', result._id);
    return;
  }

  const result = await sanity.createOrReplace({
    _id: DOC_ID,
    _type: 'blogPost',
    slug: { _type: 'slug', current: SLUG },
    ...payload,
  });

  console.log('Created:', result._id);
  console.log('slug:', result.slug?.current);
  console.log('content length:', (result.content || '').length);
  console.log('faq count:', result.faq?.length);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
