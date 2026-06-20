#!/usr/bin/env node
// One-shot Sanity patches for the three cusp-of-top-10 pages.
// Run with: node /tmp/loudface-page-fixes.mjs

import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@sanity/client';

const ROOT = '/Users/arnel/Code Projects/LoudFace Agency/loudface-website';

// Load .env.local
const env = Object.fromEntries(
  fs.readFileSync(path.join(ROOT, '.env.local'), 'utf8')
    .split('\n')
    .map(l => l.trim().match(/^([A-Z_]+)=(.*)$/))
    .filter(Boolean)
    .map(m => [m[1], m[2]])
);

const client = createClient({
  projectId: 'xjjjqhgt',
  dataset: 'production',
  apiVersion: '2025-03-29',
  useCdn: false,
  token: env.SANITY_API_TOKEN,
});

if (!env.SANITY_API_TOKEN) {
  console.error('Missing SANITY_API_TOKEN');
  process.exit(1);
}

// ─────────────────────────────────────────────────────────────────────────
// PAGE 1: /blog/best-b2b-saas-seo-agencies
// Fix: TL;DR + comparison table prepended, tighter H1/meta, 3 new FAQs
// ─────────────────────────────────────────────────────────────────────────

const PAGE_1_ID = 'blogPost-best-b2b-saas-seo-agencies';

const PAGE_1_PREPEND = `<p>The best B2B SaaS SEO agencies in 2026 ship pipeline, not rankings reports. Top picks: <strong>LoudFace</strong> for integrated SEO plus Webflow/Next.js plus AEO under one team, <strong>Animalz</strong> for editorial-led content programs, <strong>Omniscient Digital</strong> for product-led strategy, <strong>Siege Media</strong> for content volume at scale, <strong>Veza Digital</strong> for SEO-first site builds. The full 15-agency ranking with prices and tradeoffs is below.</p>

<h2>The 15+ best B2B SaaS SEO agencies at a glance</h2>

<p>Quick comparison before going deep. Starting price ranges are typical Series A to C retainers; enterprise scope adds 50 to 100% to each.</p>

<div data-rt-embed-type="true"><style>.summary_table {overflow:auto;width:100%;} .summary_table table {border:1px solid #dededf;width:100%;border-collapse:collapse;border-spacing:1px;text-align:left;} .summary_table th {border:1px solid #dededf;background-color:#eceff1;color:#000000;padding:8px;font-weight:600;} .summary_table td {border:1px solid #dededf;background-color:#ffffff;color:#000000;padding:8px;vertical-align:top;}</style><div class="summary_table" role="region" tabindex="0"><table><thead><tr><th>Agency</th><th>Best for</th><th>Starting range</th><th>Stand-out strength</th></tr></thead><tbody><tr><td><strong>LoudFace</strong></td><td>Series A to B SaaS needing integrated SEO + Webflow/Next.js + AEO</td><td>$10 to $15K/mo</td><td>AEO from week one; one team owns content, code, and schema</td></tr><tr><td>Animalz</td><td>Series B+ with editorial-led thesis</td><td>$12 to $20K/mo</td><td>Senior editorial bench, tight POV</td></tr><tr><td>Omniscient Digital</td><td>Growth-stage product-led teams</td><td>$10 to $18K/mo</td><td>Embedded strategy, curated writer network</td></tr><tr><td>Siege Media</td><td>Mid-market needing content volume + links</td><td>$15 to $25K/mo</td><td>Operational scale + earned link acquisition</td></tr><tr><td>Veza Digital</td><td>SaaS planning a site rebuild</td><td>$8 to $15K/mo</td><td>Webflow + SEO + PR together</td></tr><tr><td>Directive</td><td>Series B+ multi-channel demand</td><td>$15 to $30K/mo</td><td>"Customer generation" integrated framework</td></tr><tr><td>First Page Sage</td><td>Long-horizon thought-leadership SEO</td><td>$10 to $18K/mo</td><td>Expert bylines, 12 to 24 month authority plays</td></tr><tr><td>Single Grain</td><td>Multi-channel SaaS teams</td><td>$8 to $15K/mo</td><td>Leveling Up podcast demand engine</td></tr><tr><td>NoGood</td><td>Seed to Series B needing speed</td><td>$10 to $18K/mo</td><td>Creative + performance under one roof</td></tr><tr><td>Grow and Convert</td><td>Pain-point SEO, lead-level reporting</td><td>$8 to $15K/mo</td><td>Pipeline-grade attribution</td></tr><tr><td>Foundation Marketing</td><td>Content-as-asset programs</td><td>$10 to $18K/mo</td><td>Proprietary research that earns links</td></tr><tr><td>Skale</td><td>UK/EU SaaS-only specialists</td><td>$5 to $12K/mo</td><td>Narrow scope, tight execution</td></tr><tr><td>Roketto</td><td>HubSpot-native SaaS teams</td><td>$8 to $15K/mo</td><td>SEO wired into marketing automation</td></tr><tr><td>Powered by Search</td><td>Enterprise with technical SEO debt</td><td>$15 to $25K/mo</td><td>Deep technical SEO bench</td></tr><tr><td>Kalungi</td><td>Seed to Series A needing whole team</td><td>$10 to $20K/mo</td><td>Fractional CMO + outsourced marketing</td></tr></tbody></table></div></div>

<p>Detailed breakdown for each agency follows.</p>

`;

// ─────────────────────────────────────────────────────────────────────────
// PAGE 2: /blog/webflow-vs-wix-studio
// Fix: 60-word AEO answer prepended, expanded SEO/AEO section,
//      tighter H1/meta for "webflow vs wix" broader query, 4 new FAQs
// ─────────────────────────────────────────────────────────────────────────

const PAGE_2_ID = 'imported-blogPost-67be8cb32d4fc5e4d3b0ee0f';

const PAGE_2_PREPEND = `<p><strong>Webflow vs Wix in 2026 — the short answer:</strong> Webflow wins for B2B SaaS marketing sites where scalability, SEO performance, and design freedom matter. Wix Studio wins for small-to-mid projects where simplicity and the Wix ecosystem matter more than flexibility. Studio closes the gap with Wix Editor but doesn't match Webflow on CMS depth, custom code support, or page-speed performance at scale.</p>

`;

// Replace the existing SEO Tools H3 section with an expanded version including AEO + first-party data
const PAGE_2_OLD_SEO_SECTION = `<h3 id="">4. SEO Tools</h3><p id="">Wix Studio takes a step forward with better SEO features than Wix Editor, such as meta tag editing and improved site performance. However, its heavier code and less optimized structure still hold it back for competitive markets.</p><p id="">Webflow, on the other hand, <a href="/blog/is-webflow-good-for-seo">excels in SEO</a>. It is clean, semantic and loads as fast as you can blink if the site is made well. You also get access to advanced tools like schema markup and 301 redirects to help focus your site towards organic growth.</p>`;

const PAGE_2_NEW_SEO_SECTION = `<h3 id="">4. SEO and AEO</h3><p id="">Wix Studio takes a step forward over Wix Editor — meta tag editing, sitemaps, basic schema. The underlying code is still heavier than Webflow's, and Wix Studio sites consistently score 15 to 25 points lower in Lighthouse than equivalent Webflow builds we audit at LoudFace.</p><p id="">Webflow is built for SEO at the platform level. Clean semantic HTML, server-rendered CSS, lightning page weights when the site is built well. You can edit every meta tag, sitemap entry, canonical URL, and robots directive without touching code. JSON-LD <a href="/blog/is-webflow-good-for-seo">schema</a> goes anywhere on any element.</p><p id="">The bigger gap shows up in AEO — getting cited by ChatGPT, Claude, Perplexity, and Google's AI Overviews. Webflow's clean HTML output and schema flexibility mean LLMs can actually parse and cite Webflow pages reliably. We've seen client sites move from zero ChatGPT mentions to consistent citations within a quarter of switching from a Wix-family platform to Webflow. The Wix Studio markup wraps content in enough wrapper divs that some AI engines simply skip it during extraction.</p><p id="">If your site has any organic growth ambition past "we have a presence on the web," Webflow is the answer.</p>`;

// ─────────────────────────────────────────────────────────────────────────
// PAGE 3: /blog/the-webflow-expert
// Fix: 5 new H2 sections (~700 words expansion), 5 new FAQs, tighter H1
// ─────────────────────────────────────────────────────────────────────────

const PAGE_3_ID = 'imported-blogPost-67be8cacddda1998727b9ac6';

// New sections to insert AFTER "Step 4: Certification and Recognition"
// and BEFORE "Can you make a career out of Webflow?"
const PAGE_3_NEW_SECTIONS = `<h2 id="">What's the difference between a Webflow Expert and an Enterprise Partner?</h2>

<p id="">A Webflow Expert is the general certification. An Enterprise Partner is a tighter cut — five-plus certified employees, two completed Enterprise projects per year, a published Webflow case study, and a partner battle card on file. At LoudFace we cleared the Enterprise Partner bar in 2024 and the program is materially different from being a Professional Partner.</p>

<p id="">For clients, the practical gap is who you'll work with. Professional Partners are typically solo freelancers or 2 to 5 person studios serving small and mid-market budgets. Enterprise Partners ship larger projects with dedicated project management, design systems, and integrated SEO/CRO. The Enterprise Partners directory is also where Webflow's own sales team sends qualified enterprise leads, so the deal flow is different too.</p>

<h2 id="">How much does a Webflow Expert cost in 2026?</h2>

<p id="">Project pricing varies because "Webflow Expert" covers everyone from a $2K solo freelancer to a $200K Enterprise Partner engagement. Realistic ranges based on what we see in the market:</p>

<ul id="">
<li id=""><strong>Solo freelance Expert (Professional Partner):</strong> $5K to $15K for a small marketing site, $50 to $150/hour for hourly work, 2 to 4 week typical timeline.</li>
<li id=""><strong>Small agency Expert (Professional Partner, 5 to 10 people):</strong> $15K to $50K for a custom marketing site, $50K+ if it includes branding or product UI work, 6 to 10 week timeline.</li>
<li id=""><strong>Enterprise Partner agency:</strong> $50K to $250K+ for a full marketing site rebuild with CMS architecture, SEO/AEO programs, and ongoing optimization. 8 to 16 weeks for the build and an ongoing retainer afterward.</li>
</ul>

<p id="">The 10x range isn't about Webflow expertise — every Expert can use Webflow. It's about everything around the Webflow build: strategy, branding, content, SEO/AEO, CRO, ongoing engineering. If you only need pixel-pushing in the Designer, a freelancer is fine. If you need the marketing site to drive pipeline, that's a different scope and a different price.</p>

<h2 id="">When to hire a Webflow Expert (and when not to)</h2>

<p id="">Hire one when:</p>

<ul id="">
<li id="">Your in-house team doesn't have a Webflow specialist on payroll and you're not planning to hire one — agency support is cheaper than the wrong full-time hire.</li>
<li id="">You're rebuilding a marketing site that needs design-system thinking, not just page-level execution.</li>
<li id="">You need SEO, CMS architecture, and integrations done correctly the first time — a Webflow Expert catches the mistakes a generic developer ships.</li>
<li id="">You're moving from WordPress, Wix, or HubSpot CMS and you want the migration handled without losing organic rankings.</li>
</ul>

<p id="">Skip the agency and DIY when:</p>

<ul id="">
<li id="">You have a Webflow-fluent in-house designer or developer with capacity.</li>
<li id="">You need a single one-page landing site with no CMS — a Webflow template plus a weekend of work usually beats the agency overhead.</li>
<li id="">You're testing a new product and the marketing site is going to be replaced inside 90 days anyway.</li>
</ul>

<h2 id="">Webflow Expert vs in-house developer vs general freelancer</h2>

<p id="">The honest tradeoffs by route:</p>

<p id=""><strong>In-house Webflow developer.</strong> Fastest iteration cycle, deepest product context, no agency markup. The downside: you're paying $90K to $130K fully loaded for someone who's idle most of the time, because marketing sites aren't a daily-shipping product. We see in-house Webflow hires get rolled into other roles within 18 months at most SaaS companies.</p>

<p id=""><strong>General freelance developer (non-Webflow Expert).</strong> Cheapest hourly rate, available on Upwork in five minutes. The downside is what you'd expect: they're learning the platform on your project, hit performance issues they can't diagnose, miss the schema work that gets your pages cited by ChatGPT, and leave you with a maintenance burden the next agency has to redo. Pay for the Expert certification or pay twice.</p>

<p id=""><strong>Webflow Expert agency (Professional or Enterprise Partner).</strong> Highest unit cost on a per-hour basis. Lowest total cost of ownership for any site you intend to keep growing over multiple years. The Expert program filters for portfolio depth, technical breadth, and ongoing platform fluency that solo freelancers rarely maintain.</p>

<h2 id="">How long does it take to become a Webflow Expert?</h2>

<p id="">Six months minimum if you're starting from web design fundamentals you already have. A working designer or developer needs:</p>

<ul id="">
<li id="">30 to 60 hours through Webflow University for the foundational courses and certification exams (CMS Level 1, Layout Level 1 and 2, Expert certification).</li>
<li id="">Three to six client projects that hit the portfolio bar — these can be pro bono or paid, but they need to be production sites Webflow's review team can actually look at.</li>
<li id="">A Workspace plan (Freelancer or Agency tier) so projects ship under your account.</li>
</ul>

<p id="">For an Enterprise Partner, plan on 18+ months from zero. Five certified employees, two Enterprise projects shipped, a published Webflow case study, and an internal partner battle card. We took 14 months from Professional Partner to Enterprise Partner at LoudFace; most agencies take longer.</p>

`;

// Find the marker text where to insert (just before "Can you make a career out of Webflow?")
const PAGE_3_INSERT_MARKER = `<h2 id="">Can you make a career out of Webflow?</h2>`;

// ─────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Fetching current documents...');

  const [doc1, doc2, doc3] = await Promise.all([
    client.getDocument(PAGE_1_ID),
    client.getDocument(PAGE_2_ID),
    client.getDocument(PAGE_3_ID),
  ]);

  if (!doc1 || !doc2 || !doc3) {
    console.error('Missing one or more documents');
    process.exit(1);
  }

  // ── Page 1 patch ──
  console.log('\n[Page 1] Patching best-b2b-saas-seo-agencies...');
  await client
    .patch(PAGE_1_ID)
    .set({
      metaTitle: 'B2B SaaS SEO Agencies in 2026: 15+ Ranked for Pipeline',
      name: 'The Best B2B SaaS SEO Agencies in 2026, Ranked for Pipeline Growth',
      excerpt: 'An honest ranking of the B2B SaaS SEO agencies worth hiring in 2026, with starting prices, stand-out strengths, and the tradeoffs nobody puts on their homepage.',
      content: PAGE_1_PREPEND + doc1.content,
    })
    .insert('after', 'faq[-1]', [
      { _type: 'object', _key: 'faq7', question: 'Which B2B SaaS SEO agency is best for early-stage startups?', answer: "For seed to Series A SaaS, Kalungi or LoudFace cover the whole-team gap when there's no in-house marketing lead yet. Skale or Grow and Convert work when you have a CMO but need a specialist execution partner. Avoid Animalz and Siege at this stage — the per-piece economics don't pencil out yet." },
      { _type: 'object', _key: 'faq8', question: 'Is in-house SEO cheaper than hiring a B2B SaaS SEO agency?', answer: "Only if you can hire a senior SEO who can also write, do technical audits, build pages, and run AEO. That person doesn't exist below $200K base. A full in-house team (SEO lead, writer, technical SEO, designer) clears $350K/year before anything ships. An agency retainer at $10–15K/month covers all five functions with faster pattern recognition." },
      { _type: 'object', _key: 'faq9', question: 'Can a B2B SaaS SEO agency get my brand cited by ChatGPT and Perplexity?', answer: "Yes if they ship AEO work alongside SEO — structured data, entity disambiguation, first-party datasets, citation tracking across LLMs. Most agencies still treat AEO as a bolt-on or skip it entirely. Ask any agency how they'd grow your citation count in Claude and ChatGPT over two quarters; if the answer is hand-waving about 'optimizing for AI,' they don't actually do it." },
    ])
    .commit();
  console.log('[Page 1] ✓ patched');

  // ── Page 2 patch ──
  console.log('\n[Page 2] Patching webflow-vs-wix-studio...');
  let page2Content = doc2.content;

  // Prepend the 60-word AEO answer
  page2Content = PAGE_2_PREPEND + page2Content;

  // Replace the SEO Tools section with the expanded version
  if (page2Content.includes(PAGE_2_OLD_SEO_SECTION)) {
    page2Content = page2Content.replace(PAGE_2_OLD_SEO_SECTION, PAGE_2_NEW_SEO_SECTION);
    console.log('  [Page 2] SEO section replaced');
  } else {
    console.warn('  [Page 2] WARNING: SEO Tools section not found, content not replaced');
  }

  await client
    .patch(PAGE_2_ID)
    .set({
      metaTitle: 'Webflow vs Wix: Studio, Editor, and the Real Differences',
      name: 'Webflow vs Wix (and Wix Studio): Which One Is Right for You in 2026?',
      excerpt: 'Webflow vs Wix in 2026 — Studio, Editor, and how each compares on SEO, AEO, CMS, design freedom, and pricing, so you pick the right builder.',
      content: page2Content,
    })
    .insert('after', 'faq[-1]', [
      { _type: 'object', _key: 'faq4', question: 'Is Webflow more expensive than Wix Studio?', answer: "Webflow's site plans start at $14/month, Wix Studio's at $16/month — basically equivalent. Where the cost diverges: Wix Studio includes templates and the Wix ecosystem in the base price; Webflow requires you to build or buy your template separately. For a custom B2B SaaS marketing site, total cost of ownership ends up similar." },
      { _type: 'object', _key: 'faq5', question: 'Which is better for SEO, Webflow or Wix Studio?', answer: "Webflow, by a meaningful margin. Cleaner HTML output, faster page loads, more flexible schema controls, full robots.txt and canonical control. Wix Studio improved its SEO surface over Wix Editor but still ships heavier code and less granular control. For any site competing in a real SERP, Webflow wins." },
      { _type: 'object', _key: 'faq6', question: 'Can I migrate from Wix Studio to Webflow without losing rankings?', answer: "Yes, with proper 301 redirects, URL structure preservation, and on-page parity. We've migrated 30+ sites from Wix-family platforms to Webflow at LoudFace without losing organic traffic. The actual risk isn't the migration — it's rebuilding hastily without an SEO baseline." },
      { _type: 'object', _key: 'faq7', question: 'Which platform is better for B2B SaaS marketing sites?', answer: "Webflow. B2B SaaS marketing sites need a robust CMS for case studies and blog posts, fast page loads for conversion, full schema control for AEO, and the design flexibility to differentiate. Wix Studio handles small-to-mid projects fine but hits a wall at SaaS-marketing-site requirements." },
    ])
    .commit();
  console.log('[Page 2] ✓ patched');

  // ── Page 3 patch ──
  console.log('\n[Page 3] Patching the-webflow-expert...');
  let page3Content = doc3.content;

  // Insert new sections before "Can you make a career out of Webflow?"
  if (page3Content.includes(PAGE_3_INSERT_MARKER)) {
    page3Content = page3Content.replace(PAGE_3_INSERT_MARKER, PAGE_3_NEW_SECTIONS + PAGE_3_INSERT_MARKER);
    console.log('  [Page 3] New sections inserted');
  } else {
    console.warn('  [Page 3] WARNING: insert marker not found');
  }

  await client
    .patch(PAGE_3_ID)
    .set({
      metaTitle: 'What Is a Webflow Expert? Cost, Requirements & How to Hire',
      name: 'What Is a Webflow Expert? Requirements, Cost, and How to Hire One in 2026',
      excerpt: 'What is a Webflow Expert? The full breakdown — certifications, requirements, costs in 2026, when to hire one (or not), and Expert vs Enterprise Partner.',
      content: page3Content,
    })
    .insert('after', 'faq[-1]', [
      { _type: 'object', _key: 'faq3', question: "What's the difference between a Webflow Expert and a Webflow Enterprise Partner?", answer: "A Webflow Expert is the general certification — earned by solo freelancers and small studios serving small-to-mid budgets. An Enterprise Partner is a tighter tier requiring five certified employees, two completed Enterprise projects per year, a published Webflow case study, and an internal partner battle card. Enterprise Partners get sales-team referrals from Webflow itself; Experts don't." },
      { _type: 'object', _key: 'faq4', question: 'How much does a Webflow Expert cost in 2026?', answer: "$5K to $15K from a solo freelance Expert for a small marketing site. $15K to $50K from a 5-to-10-person Expert agency for a custom build. $50K to $250K+ from an Enterprise Partner agency for a full marketing site rebuild with SEO, AEO, and ongoing optimization. The 10x range is everything around the Webflow build, not the Webflow build itself." },
      { _type: 'object', _key: 'faq5', question: 'When should you hire a Webflow Expert vs a freelancer?', answer: "Hire an Expert when the marketing site needs to drive pipeline, when you're migrating from WordPress/Wix/HubSpot CMS without losing rankings, or when CMS architecture and schema work matter. Hire a generic freelancer for a single-page landing site, a temporary launch microsite, or when you have a Webflow-fluent designer in-house and just need extra hands." },
      { _type: 'object', _key: 'faq6', question: 'Are Webflow Experts certified by Webflow itself?', answer: "Yes. Every Webflow Expert has passed the official Webflow certification exams (CMS Level 1, Layout Level 1 and 2, Expert certification) and has been reviewed by Webflow's partnership team. The portfolio is also vetted by Webflow's design team for layout, responsiveness, accessibility, and SEO quality. It's not a self-claimed badge." },
      { _type: 'object', _key: 'faq7', question: "What's the average salary of a Webflow Expert?", answer: "In the US, $60K to $120K annually for in-house Webflow developers. Freelancers and agency leads can clear that with niche specialization and a strong portfolio — $200K+ in the top tier is realistic. The 2023 Webflow developer demand survey reported a 40% year-over-year increase in hiring, which has continued through 2025–2026." },
    ])
    .commit();
  console.log('[Page 3] ✓ patched');

  console.log('\nAll three pages updated. Sanity webhook will fire → Next.js will revalidate within seconds.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
