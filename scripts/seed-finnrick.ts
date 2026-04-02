/**
 * Seed Finnrick Analytics Case Study
 *
 * Creates the Finnrick case study, client, testimonial, and industry
 * documents in Sanity. Safe to re-run — uses deterministic IDs.
 *
 * Run with: npx tsx scripts/seed-finnrick.ts
 *
 * Prerequisites:
 *   - SANITY_API_TOKEN in .env.local (needs write access)
 *   - NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET in .env
 *
 * After running, upload images via Sanity Studio at /studio:
 *   1. Finnrick client logos (colored, light, dark)
 *   2. Case study hero image / thumbnail
 */

import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });

const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const SANITY_TOKEN = process.env.SANITY_API_TOKEN;

if (!SANITY_PROJECT_ID || !SANITY_DATASET || !SANITY_TOKEN) {
  console.error('Missing Sanity env vars. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_TOKEN');
  process.exit(1);
}

const sanity = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: '2025-03-29',
  useCdn: false,
  token: SANITY_TOKEN,
});

// ── Deterministic IDs ──────────────────────────────────────────

const INDUSTRY_ID = 'industry-health-wellness';
const CLIENT_ID = 'client-finnrick-analytics';
const TESTIMONIAL_ID = 'testimonial-raphael-mazoyer';
const CASE_STUDY_ID = 'case-study-finnrick-analytics';

// ── Industry ───────────────────────────────────────────────────

async function seedIndustry() {
  const existing = await sanity.getDocument(INDUSTRY_ID);
  if (existing) {
    console.log('✓ Industry already exists:', existing._id);
    return;
  }

  await sanity.createOrReplace({
    _id: INDUSTRY_ID,
    _type: 'industry',
    name: 'Health & Wellness',
    slug: { _type: 'slug', current: 'health-wellness' },
  });
  console.log('✓ Created industry: Health & Wellness');
}

// ── Client ─────────────────────────────────────────────────────

async function seedClient() {
  const existing = await sanity.getDocument(CLIENT_ID);
  if (existing) {
    console.log('✓ Client already exists:', existing._id);
    return;
  }

  await sanity.createOrReplace({
    _id: CLIENT_ID,
    _type: 'client',
    name: 'Finnrick Analytics',
    slug: { _type: 'slug', current: 'finnrick-analytics' },
    showcaseLogo: true,
    // Upload logos manually in Sanity Studio after running this script
  });
  console.log('✓ Created client: Finnrick Analytics');
}

// ── Testimonial ────────────────────────────────────────────────

async function seedTestimonial() {
  const existing = await sanity.getDocument(TESTIMONIAL_ID);
  if (existing) {
    console.log('✓ Testimonial already exists:', existing._id);
    return;
  }

  await sanity.createOrReplace({
    _id: TESTIMONIAL_ID,
    _type: 'testimonial',
    name: 'Raphaël Mazoyer',
    slug: { _type: 'slug', current: 'raphael-mazoyer' },
    role: 'CEO, Finnrick Analytics',
    testimonialBody:
      '<p>I want the business to be sustainable. Finnrick sells trust. We build trust infrastructure. If people see that it\'s someone else\'s money you\'re spending to build this, the trust is not there. I think the work you guys are doing — it\'s making the case for why this matters.</p>',
    caseStudy: { _type: 'reference', _ref: CASE_STUDY_ID },
    client: { _type: 'reference', _ref: CLIENT_ID },
  });
  console.log('✓ Created testimonial: Raphaël Mazoyer');
}

// ── Case Study ─────────────────────────────────────────────────

function buildMainBody(): string {
  return `
<h2>The client</h2>
<p>Finnrick Analytics runs the largest independent peptide testing platform in the world. Founded by Raphaël Mazoyer, Finnrick has tested over 6,000 samples from 182 vendors across 15 popular peptides. Every test result is public, every methodology is transparent, and Raphaël discloses every revenue stream.</p>
<p>Gray-market peptides are flooding biohacking and longevity communities. People inject these products into their bodies, often with no independent test data to go on. Finnrick is the only entity doing crowd-sourced, independent safety testing at scale.</p>
<p>When LoudFace started working with them in January 2026, organic search was not a meaningful channel for the business.</p>

<h2>The problem</h2>
<p>Finnrick had a data-rich product and a growing reputation within niche Reddit and X communities. What they didn't have:</p>
<ul>
<li>Organic search traffic that matched the product's authority. The site was getting some baseline visits but had no strategy driving it.</li>
<li>Content infrastructure. No blog, no editorial strategy, no structured content targeting the questions their audience was searching.</li>
<li>AI visibility. A clean ChatGPT install did not recommend Finnrick for product safety concerns. Raphaël called that "a core problem we want to solve."</li>
<li>A way to turn raw testing data into stories that journalists and AI systems would pick up and cite.</li>
</ul>
<p>The site was technically solid (custom Next.js/Vercel stack) but invisible to the search ecosystem that mattered.</p>

<h2>The strategy</h2>
<p>LoudFace designed a dual-track SEO/AEO program built around one principle: <strong>every piece of content must earn trust, not just traffic.</strong></p>
<p>Raphaël was clear from the start: Finnrick sells trust infrastructure. If the content reads like marketing, it undermines the product. Volume was never the play. Precision was.</p>
<p>LoudFace's copywriter Andrea Van Wyk worked directly with Raphaël on every article. Each piece went through multiple rounds where Raphaël personally vetted every claim, every data point, every word. If he couldn't put his name behind it, it didn't go up.</p>
<p>Andrej Vidovic led the search strategy. He chose which keywords to target, mapped the content gaps, and structured each piece so it worked for both human readers and AI crawlers.</p>

<h2>The results</h2>
<h3>Q1 2026: January 1 – March 31</h3>
<p>What LoudFace added to Finnrick's organic channel in 90 days:</p>

<h3>Overall growth (Jan → Mar 2026)</h3>
<table>
<thead><tr><th>Metric</th><th>January</th><th>March</th><th>Change</th></tr></thead>
<tbody>
<tr><td>Monthly Clicks</td><td>34,148</td><td>53,243</td><td><strong>+55.9%</strong></td></tr>
<tr><td>Monthly Impressions</td><td>603,808</td><td>968,437</td><td><strong>+60.4%</strong></td></tr>
<tr><td>Avg Daily Clicks</td><td>~1,101</td><td>~1,717</td><td><strong>+56% (+616/day)</strong></td></tr>
<tr><td>Average CTR</td><td>5.66%</td><td>5.45%</td><td><strong>Stable through growth</strong></td></tr>
<tr><td>Average Position</td><td>7.3</td><td>6.6</td><td><strong>+0.7 improvement</strong></td></tr>
</tbody>
</table>

<h3>Page-by-page growth (Jan → Mar)</h3>
<p>The gains compounded across every key page on the site:</p>
<table>
<thead><tr><th>Page</th><th>Jan Clicks</th><th>Mar Clicks</th><th>Growth</th></tr></thead>
<tbody>
<tr><td>Homepage</td><td>15,870</td><td>24,677</td><td><strong>+55.5%</strong></td></tr>
<tr><td>Vendors page</td><td>2,380</td><td>4,636</td><td><strong>+94.8%</strong></td></tr>
<tr><td>Retatrutide product page</td><td>1,711</td><td>2,315</td><td><strong>+35.3%</strong></td></tr>
<tr><td>Products listing</td><td>1,289</td><td>1,813</td><td><strong>+40.7%</strong></td></tr>
</tbody>
</table>

<h3>Brand awareness we drove</h3>
<p>Branded searches for "finnrick" grew +72.4% in a single month (5,968 → 10,291 clicks, Feb → Mar). That's +4,323 new branded clicks per month.</p>
<p>This is where the SEO and AEO tracks connect. When someone asks ChatGPT about peptide testing and Finnrick comes up in the answer, they don't click a link inside the AI response. They open Google and type "finnrick." That branded search spike in GSC is partly an AI search effect showing up in traditional search data. The user journey goes: AI engine mentions Finnrick → user searches the brand on Google → GSC logs it as a branded click. Strip out the AI visibility work we did and a meaningful share of that +72% branded growth doesn't happen.</p>
<p>The press coverage follows the same pattern. Someone reads about Finnrick in MIT Technology Review, then searches the name on Google. Both channels feed branded search, and both channels are direct results of the content program we built.</p>

<h3>Category rankings we built</h3>
<p>Before our engagement, Finnrick didn't rank for category search terms. We built these positions from scratch:</p>
<table>
<thead><tr><th>Query</th><th>Clicks</th><th>CTR</th><th>Position</th></tr></thead>
<tbody>
<tr><td>peptide testing</td><td>894</td><td>20.1%</td><td>6.1</td></tr>
<tr><td>peptide testing labs</td><td>779</td><td>22.1%</td><td>4.0</td></tr>
<tr><td>free peptide testing</td><td>533</td><td>50.1%</td><td>2.1</td></tr>
<tr><td>peptide testing companies</td><td>82</td><td>19.2%</td><td>3.0</td></tr>
<tr><td>3rd party peptide testing</td><td>80</td><td>14.0%</td><td>5.0</td></tr>
</tbody>
</table>

<h3>Competitor capture — an entirely new channel</h3>
<p>We created a vendor page strategy that didn't exist before. Finnrick now ranks for 10+ competitor brand names, pulling in 5,000+ new clicks per quarter from people who were searching for competitors and found Finnrick instead:</p>
<table>
<thead><tr><th>Vendor Query</th><th>Clicks</th><th>Position</th></tr></thead>
<tbody>
<tr><td>atomik labz</td><td>1,162</td><td>3.5</td></tr>
<tr><td>wwb peptides</td><td>945</td><td>4.7</td></tr>
<tr><td>aavant research</td><td>570</td><td>3.5</td></tr>
<tr><td>peptide partners</td><td>530</td><td>3.7</td></tr>
<tr><td>nexaph</td><td>472</td><td>3.9</td></tr>
<tr><td>eternal peptides</td><td>447</td><td>4.8</td></tr>
</tbody>
</table>

<h3>Press coverage we earned</h3>
<p>MIT Technology Review's February 2026 peptides piece cited Finnrick's Endotoxins testing data directly. BBC and The Guardian picked it up too. None of these citations existed before our engagement. No outreach to journalists, no paid placements. The content was good enough that reporters found it on their own.</p>

<h3>AI visibility we built</h3>
<p>Try asking ChatGPT "where can I get peptides tested independently?" Finnrick comes up. Same on Perplexity, Gemini, and Claude. Before our engagement, none of them mentioned Finnrick.</p>
<p>We track 30 AI search prompts via Peec AI. Finnrick is the #1 cited result on 17 of them (57%). These aren't obscure queries. They're the exact questions Finnrick's customers are asking AI engines:</p>
<table>
<thead><tr><th>AI Prompt</th><th>Position</th></tr></thead>
<tbody>
<tr><td>Where can researchers find publicly available peptide vendor scorecards?</td><td>#1</td></tr>
<tr><td>Which BPC-157 vendors have passed independent lab testing?</td><td>#1</td></tr>
<tr><td>Are there any independent safety platforms for the peptide market?</td><td>#1</td></tr>
<tr><td>Where can I find independent third-party testing data on peptide suppliers?</td><td>#1</td></tr>
<tr><td>Are there any databases that rank peptide vendors by quality?</td><td>#1</td></tr>
<tr><td>What are the most reliable sources for peptide vendor reviews?</td><td>#1</td></tr>
</tbody>
</table>
<p>The remaining 13 prompts don't yet surface Finnrick. That's the Q2 roadmap.</p>
<p>We built this visibility through entity-first content architecture, structured data, and an LLMs.txt file that tells crawlers exactly what Finnrick is and does.</p>

<h2>What made this different</h2>
<p>Most SEO case studies are about ranking for keywords. This one is about something harder: building trust in a market where people are injecting gray-market products into their bodies and relying on strangers on Reddit for safety information.</p>
<p>We didn't write SEO content that happens to be about peptide testing. We wrote peptide safety content that happens to rank. The distinction matters. MIT Technology Review didn't cite Finnrick because of our meta descriptions. They cited it because the Endotoxins article contained original test data that no one else had published.</p>
<p>Raphaël made this possible by being difficult to work with (in the best way). He vetted every claim, killed anything that felt like marketing, and pushed our writers to match his standard. Most clients approve drafts quickly. Raphaël sent them back with corrections.</p>
<p>And the AEO track is worth calling out specifically. Most agencies bolt AI search onto an existing SEO program as an upsell. We built the content architecture from day one so AI engines could parse, understand, and cite it. Entity-first writing, structured answers, LLMs.txt. That's why Finnrick shows up in ChatGPT and Perplexity, not just Google.</p>

<blockquote><p>"The first one you did on Endotoxins got us covered in the MIT Tech Review and the BBC and the Guardian."</p><p>— Raphaël Mazoyer, CEO, Finnrick Analytics</p></blockquote>

<p><em>Engagement: Ongoing since January 2026 · SEO/AEO Growth Partnership · <a href="https://finnrick.com" target="_blank" rel="noopener noreferrer">finnrick.com</a></em></p>
`.trim();
}

async function seedCaseStudy() {
  const existing = await sanity.getDocument(CASE_STUDY_ID);
  if (existing) {
    console.log('✓ Case study already exists:', existing._id);
    console.log('  To overwrite, delete it first in Sanity Studio or pass --force');
    if (!process.argv.includes('--force')) return;
    console.log('  --force flag detected, overwriting...');
  }

  await sanity.createOrReplace({
    _id: CASE_STUDY_ID,
    _type: 'caseStudy',

    // ── Identity ──
    name: 'Finnrick Analytics',
    slug: { _type: 'slug', current: 'finnrick-analytics' },
    projectTitle: 'How Finnrick became the #1 AI-cited peptide testing platform in 90 days',

    // ── Summary ──
    paragraphSummary:
      'LoudFace built a dual-track SEO/AEO growth program that turned Finnrick Analytics into the most visible peptide testing brand on both Google and AI search engines. In 90 days: +56% monthly organic clicks, #1 AI citation on 57% of tracked prompts, and press coverage from MIT Technology Review, the BBC, and The Guardian.',

    // ── Content ──
    mainBody: buildMainBody(),

    // ── Branding ──
    clientColor: '#0F766E',
    secondaryClientColor: '#134E4A',

    // ── Metadata ──
    companySize: '1-10',
    country: 'United States',
    websiteLink: 'https://finnrick.com',
    visitTheWebsite: 'https://finnrick.com',

    // ── Results ──
    result1Number: '+56%',
    result1Title: 'Monthly organic clicks in 90 days (34K → 53K)',
    result2Number: '#1 on 57%',
    result2Title: 'of AI search prompts across ChatGPT, Perplexity, Gemini & Claude',
    result3Number: '3 Tier-1 Pubs',
    result3Title: 'MIT Technology Review, BBC, The Guardian',

    // ── Featured ──
    featured: true,

    // ── References (testimonial added via patch after testimonial doc exists) ──
    client: { _type: 'reference', _ref: CLIENT_ID },
    industry: { _type: 'reference', _ref: INDUSTRY_ID },
    industries: [{ _type: 'reference', _ref: INDUSTRY_ID, _key: 'ind-0' }],

    // ── Charts ──
    charts: [
      {
        _key: 'chart-page-growth',
        title: 'Page Growth: January vs March 2026',
        chartType: 'barComparison',
        legendPrimary: 'January',
        legendSecondary: 'March',
        data: [
          { _key: 'c1-d0', label: 'Homepage', value: 15870, secondaryValue: 24677, displayValue: '15.9K', secondaryDisplayValue: '24.7K' },
          { _key: 'c1-d1', label: 'Vendors', value: 2380, secondaryValue: 4636, displayValue: '2.4K', secondaryDisplayValue: '4.6K' },
          { _key: 'c1-d2', label: 'Retatrutide', value: 1711, secondaryValue: 2315, displayValue: '1.7K', secondaryDisplayValue: '2.3K' },
          { _key: 'c1-d3', label: 'Products', value: 1289, secondaryValue: 1813, displayValue: '1.3K', secondaryDisplayValue: '1.8K' },
        ],
      },
      {
        _key: 'chart-competitor',
        title: 'Competitor Capture: Q1 Clicks by Vendor',
        chartType: 'horizontalBar',
        data: [
          { _key: 'c2-d0', label: 'Atomik Labz', value: 1162 },
          { _key: 'c2-d1', label: 'WWB Peptides', value: 945 },
          { _key: 'c2-d2', label: 'Aavant Research', value: 570 },
          { _key: 'c2-d3', label: 'Peptide Partners', value: 530 },
          { _key: 'c2-d4', label: 'Nexaph', value: 472 },
          { _key: 'c2-d5', label: 'Eternal Peptides', value: 447 },
        ],
      },
    ],

    // ── FAQ ──
    faq: [
      {
        _key: 'faq-0',
        question: 'What is Finnrick Analytics?',
        answer:
          'Finnrick Analytics runs the largest independent peptide testing platform in the world. They have tested over 6,000 samples from 182 vendors across 15 popular peptides, with every test result published publicly and every methodology transparent.',
      },
      {
        _key: 'faq-1',
        question: 'How did LoudFace help Finnrick grow organic traffic?',
        answer:
          'LoudFace designed a dual-track SEO/AEO program that combined traditional search optimization with AI search visibility. In 90 days, monthly organic clicks grew from 34,148 to 53,243 — a 56% increase driven by content clusters, structured data, and entity-first content architecture.',
      },
      {
        _key: 'faq-2',
        question: 'What is a dual-track SEO/AEO strategy?',
        answer:
          'A dual-track SEO/AEO strategy optimizes content for both traditional search engines like Google (SEO) and AI answer engines like ChatGPT, Perplexity, Gemini, and Claude (AEO — Answer Engine Optimization). This involves entity-first content architecture, structured data, and LLMs.txt files alongside conventional keyword targeting and content optimization.',
      },
      {
        _key: 'faq-3',
        question: 'How does AI search visibility affect branded search volume?',
        answer:
          'When AI engines cite a brand in their answers, users often open Google and search the brand name directly rather than clicking links inside the AI response. This creates a measurable branded search spike in Google Search Console. For Finnrick, branded searches grew 72.4% month-over-month, partly driven by increased AI visibility across ChatGPT, Perplexity, Gemini, and Claude.',
      },
      {
        _key: 'faq-4',
        question: 'What results did LoudFace achieve for Finnrick Analytics?',
        answer:
          'Key results include: +56% monthly organic clicks in 90 days (34K to 53K), +94.8% vendor page growth, #1 AI citation on 57% of tracked prompts, press coverage from MIT Technology Review, BBC, and The Guardian, new top-5 rankings for category terms like "peptide testing" and "peptide testing labs", and 5,000+ clicks from competitor brand capture pages.',
      },
    ],
  });

  console.log('✓ Created case study: Finnrick Analytics');
}

// ── Main ───────────────────────────────────────────────────────

async function main() {
  console.log('Seeding Finnrick Analytics case study...\n');

  await seedIndustry();
  await seedClient();
  await seedCaseStudy();
  await seedTestimonial();

  // Patch case study to add testimonial reference (breaks circular dep)
  await sanity.patch(CASE_STUDY_ID).set({
    testimonial: { _type: 'reference', _ref: TESTIMONIAL_ID },
  }).commit();
  console.log('✓ Linked testimonial to case study');

  console.log('\n✅ Done! Next steps:');
  console.log('   1. Open /studio and upload images for:');
  console.log('      - Finnrick Analytics client logos (colored, light, dark)');
  console.log('      - Case study hero image / thumbnail');
  console.log('   2. Link service categories (SEO, Content Strategy, etc.) in Studio');
  console.log('   3. Link technologies (Next.js, Vercel, etc.) in Studio');
  console.log('   4. Run `npm run build` to verify the page renders');
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
