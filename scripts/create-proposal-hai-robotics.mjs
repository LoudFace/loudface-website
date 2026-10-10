#!/usr/bin/env node
/**
 * Seed the Hai Robotics call deck into the PRIVATE `proposals` Sanity dataset.
 * A pitch page shown on the call with Juliet Zhang, not a priced proposal: no
 * price line, no pricing section. Same layout as the Bamboo Health deck.
 *
 * The live document keeps its first token and code. To rewrite it in place:
 *   node scripts/create-proposal-hai-robotics.mjs --status=sent \
 *     --token=<the existing token> --code=<the existing code>
 *
 * Usage:
 *   node scripts/create-proposal-hai-robotics.mjs --dry-run
 *   node scripts/create-proposal-hai-robotics.mjs
 *   node scripts/create-proposal-hai-robotics.mjs --status=sent --valid-until=2026-10-28
 *
 * Env:
 *   SANITY_PROPOSALS_WRITE_TOKEN   write token for the proposals dataset
 *                                  (falls back to SANITY_API_TOKEN)
 *   SANITY_PROPOSALS_DATASET       defaults to `proposals`
 *   NEXT_PUBLIC_SANITY_PROJECT_ID  defaults to the LoudFace project
 *
 * It prints the link and the access code at the end. Nothing else prints them
 * again, so keep that output.
 */

import { randomBytes, randomUUID } from 'node:crypto';
import { createClient } from '@sanity/client';

/* ── args ─────────────────────────────────────────────────────────────── */

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};
const has = (name) => args.includes(`--${name}`);

const DRY_RUN = has('dry-run');
const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'xjjjqhgt';
const DATASET = flag('dataset', process.env.SANITY_PROPOSALS_DATASET || 'proposals');
const TOKEN = process.env.SANITY_PROPOSALS_WRITE_TOKEN || process.env.SANITY_API_TOKEN;
const STATUS = flag('status', 'draft');
const VALID_UNTIL = flag('valid-until', '2026-11-10');

/* ── token + code ─────────────────────────────────────────────────────── */
/* Kept in step with src/lib/proposal-token.ts — same alphabets, same lengths. */

const TOKEN_ALPHABET = 'abcdefghijkmnpqrstuvwxyz23456789';
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const pick = (alphabet, length) =>
  Array.from(randomBytes(length), (byte) => alphabet[byte & 31]).join('');

const accessToken = flag('token', pick(TOKEN_ALPHABET, 26));
const accessCode = flag('code', `${pick(CODE_ALPHABET, 4)}-${pick(CODE_ALPHABET, 4)}`);

/* ── helpers ──────────────────────────────────────────────────────────── */

const key = () => randomUUID().slice(0, 12);

const para = (content, style = 'normal') => ({
  _type: 'block',
  _key: key(),
  style,
  markDefs: [],
  children: (typeof content === 'string' ? [{ text: content }] : content).map((run) => ({
    _type: 'span',
    _key: key(),
    text: run.text,
    marks: run.bold ? ['strong'] : [],
  })),
});

const bullet = (lead, text) => ({ _type: 'bulletItem', _key: key(), ...(lead ? { lead } : {}), text });
const tier = (name, price, cadence, description, recommended = false) => ({
  _type: 'pricingTier',
  _key: key(),
  name,
  price,
  cadence,
  description,
  ...(recommended ? { recommended } : {}),
});
const section = (type, fields) => ({ _type: type, _key: key(), ...fields });
const withKeys = (items) => items.map((item) => ({ _key: key(), ...item }));

const vendor = (name, share) => ({ _type: 'askAiVendor', _key: key(), name, share });
const question = (q, short, vendors) => ({
  _type: 'askAiQuestion',
  _key: key(),
  question: q,
  short,
  vendors: vendors.map(([name, share]) => vendor(name, share)),
});
const stat = (value, label, lead = false) => ({ _type: 'standingStat', _key: key(), value, label, lead });
const trackItem = (count, text) => ({ _type: 'trackItem', _key: key(), ...(count ? { count } : {}), text });
const track = (label, items) => ({ _type: 'track', _key: key(), label, items });
const month = (label, title, items, proves) => ({ _type: 'monthPlan', _key: key(), label, title, items, proves });

/* ── proof (shared with every proposal; the clips and reviews are LoudFace's own) ── */

const clipStrip = {
  heading: 'In their own words',
  clips: withKeys([
    {
      _type: 'railClip',
      name: 'Maksim',
      label: 'on the $1M landing page',
      duration: '1:35',
      orientation: 'landscape',
      posterUrl: 'https://cdn.sanity.io/images/xjjjqhgt/proposals/0ee26615f36fdce6a882a7399531da39d112e082-1280x720.jpg',
      videoUrl: 'https://cdn.sanity.io/files/xjjjqhgt/proposals/b06b514be51d437bb81031a9f96cc6e5796767e6.mp4',
    },
    {
      _type: 'railClip',
      name: 'Dimer Health',
      label: 'on the 288% lift',
      duration: '0:29',
      orientation: 'landscape',
      posterUrl: 'https://cdn.sanity.io/images/xjjjqhgt/proposals/37b5fefb3cc5f173eeda1ecf2c46f4c1ac897dec-1280x720.jpg',
      videoUrl: 'https://cdn.sanity.io/files/xjjjqhgt/proposals/cbba2c1526479ce38d8dab811802738ae3a1659b.mp4',
    },
    {
      _type: 'railClip',
      name: 'Daan · Brandfirm',
      label: 'on why they chose us',
      duration: '1:02',
      orientation: 'landscape',
      posterUrl: 'https://cdn.sanity.io/images/xjjjqhgt/proposals/77afe46408ad550baae0f60eeba5a26f0bd7ea9b-1280x720.jpg',
      videoUrl: 'https://cdn.sanity.io/files/xjjjqhgt/proposals/57697fa16e0d045b8ba0bc804bf9223cc6cb8788.mp4',
    },
    {
      _type: 'railClip',
      name: 'Kasimir · Onne',
      label: 'on working together',
      duration: '0:27',
      orientation: 'portrait',
      posterUrl: 'https://cdn.sanity.io/images/xjjjqhgt/proposals/0ec5d86bc48b2dbef3ecb64e634868c38ef0dc8e-720x1280.jpg',
      videoUrl: 'https://cdn.sanity.io/files/xjjjqhgt/proposals/f32240d1f970aead07a1da44be99062efeebd83c.mp4',
    },
    {
      _type: 'railClip',
      name: 'Elizabete · Reiterate',
      label: 'on the work',
      duration: '1:53',
      orientation: 'landscape',
      posterUrl: 'https://cdn.sanity.io/images/xjjjqhgt/proposals/de273c76a554c38b859f28b548117f29b28d6022-1280x720.jpg',
      videoUrl: 'https://cdn.sanity.io/files/xjjjqhgt/proposals/77f7444f1da7ed7a221c1637d897a0f4ec3e87aa.mp4',
    },
  ]),
};

const proofRail = {
  heading: 'Reviewed on',
  platforms: withKeys([
    { _type: 'reviewPlatform', platform: 'clutch', rating: 4.8, reviewCount: 2, note: 'both verified', url: 'https://clutch.co/profile/loudface' },
    { _type: 'reviewPlatform', platform: 'google', rating: 5, reviewCount: 4, url: 'https://share.google/YNQOFTomnSaSIlSgb' },
    { _type: 'reviewPlatform', platform: 'trustpilot', rating: 4.3, reviewCount: 9, note: 'every one 5 stars', url: 'https://www.trustpilot.com/review/loudface.co' },
  ]),
  quotesHeading: 'What they said',
  quotes: withKeys([
    { _type: 'railQuote', author: 'Maksim Polupanov', platform: 'trustpilot', text: 'One of the landing pages they designed has generated over $1M in sales so far.' },
    { _type: 'railQuote', author: 'Christian Mailind', platform: 'trustpilot', text: 'We really felt that they cared for our project as if it were their own.' },
    { _type: 'railQuote', author: 'Daan Smit', platform: 'trustpilot', text: 'We began receiving leads immediately after the launch of our campaign.' },
    { _type: 'railQuote', author: 'Kevin Wong', company: 'Genie', platform: 'clutch', text: 'Working with LoudFace has been refreshing; we were surprised by their passion.' },
    { _type: 'railQuote', author: 'Sarig Reichert', company: 'Dimer Health', platform: 'trustpilot', text: 'From start to finish, the team exceeded expectations.' },
    { _type: 'railQuote', author: 'Shin Kim', platform: 'trustpilot', text: 'I have not had a feature request that they were not able to deliver on.' },
    { _type: 'railQuote', author: 'Kristian Krogh Bang', platform: 'trustpilot', text: 'LoudFace is nothing short of phenomenal.' },
    { _type: 'railQuote', author: 'Paul Butler Simpson', company: 'Transalis', platform: 'clutch', text: 'LoudFace met every deadline or before every deadline and was super responsive.' },
    { _type: 'railQuote', author: 'Christian', platform: 'trustpilot', text: 'Professional, very helpful, communicated well, and met deadlines on time.' },
  ]),
};

/* ── the document ─────────────────────────────────────────────────────── */
/* Numbers read on 9-10 Oct 2026: Ahrefs (subdomains, all countries for traffic,
 * US for keywords) for hairobotics.com, exotec.com and geekplus.com; 10 buyer
 * questions asked once each of ChatGPT (gpt-5.5), Perplexity (Sonar Pro) and
 * Gemini (2.5 Flash) through DataForSEO with web search on, US; a passive crawl
 * of hairobotics.com and dev.hairobotics.com. */

const row = (cells) => ({ _type: 'tableRow', _key: key(), cells });
const pt = (label, value, compare) => ({ _type: 'chartPoint', _key: key(), label, value, ...(compare ? { compare } : {}) });
const panel = (kind, fields) => ({ _type: 'chartPanel', _key: key(), kind, ...fields });
const board = (label, source, panels) => ({ _type: 'chartBoard', _key: key(), label, source, panels });

const doc = {
  _type: 'proposal',
  _id: `proposal.hai-robotics.${accessToken.slice(0, 10)}`,
  title: 'Hai Robotics, the first name AI gives for climbing robots',
  clientName: 'Hai Robotics',
  preparedFor: ['Juliet Zhang'],
  token: accessToken,
  accessCode,
  validUntil: VALID_UNTIL,
  status: STATUS,
  contactEmail: 'arnel@loudface.co',
  design: 'cards',
  promises: ['A 90-day sprint with a clear finish line', 'Measured in AI answers, then pipeline'],
  clipStrip,
  proofRail,
  sections: [
    section('richTextSection', {
      heading: 'Where you are',
      body: [
        para('Hai Robotics has more than 10,000 HaiClimber robots contracted in 12 countries. AI assistants already know the name. They mention Hai in 26 of 30 buyer answers.'),
        para([
          { text: 'Knowing the name is not the same as leading. ' },
          { text: 'On the climbing robot questions, AI names Exotec first more than twice as often as Hai.', bold: true },
          { text: ' And when buyers ask who can prove ROI and uptime, Hai drops out of most answers.' },
        ]),
      ],
    }),

    section('chartsSection', {
      heading: 'Where you stand today',
      intro: 'Two places buyers look: Google, and the AI assistants that now answer first. Both measured this week.',
      boards: [
        board('Google search', 'Ahrefs · all countries · 9 Oct 2026', [
          panel('trend', {
            title: 'Organic visits a month',
            headline: '−63%',
            series: ['Hai Robotics', 'Exotec', 'Geek+'],
            points: [
              pt('2024-10', 1596, [13426, 4031]),
              pt('2024-11', 1778, [12864, 3303]),
              pt('2024-12', 1653, [11914, 3377]),
              pt('2025-01', 1641, [15099, 3490]),
              pt('2025-02', 2216, [19181, 4270]),
              pt('2025-03', 2931, [22511, 5987]),
              pt('2025-04', 2843, [18873, 6060]),
              pt('2025-05', 2548, [18376, 5972]),
              pt('2025-06', 2409, [18903, 6465]),
              pt('2025-07', 2284, [19169, 8045]),
              pt('2025-08', 2304, [18726, 7476]),
              pt('2025-09', 3089, [23814, 7232]),
              pt('2025-10', 2207, [22627, 8058]),
              pt('2025-11', 3258, [21153, 7269]),
              pt('2025-12', 2344, [19880, 6639]),
              pt('2026-01', 1938, [21434, 6155]),
              pt('2026-02', 1845, [21781, 6177]),
              pt('2026-03', 1955, [21304, 6483]),
              pt('2026-04', 2050, [20178, 6531]),
              pt('2026-05', 1870, [18640, 6032]),
              pt('2026-06', 1852, [16364, 5117]),
              pt('2026-07', 1664, [17300, 5319]),
              pt('2026-08', 1545, [15674, 5801]),
              pt('2026-09', 1219, [16744, 4696]),
            ],
            caption: 'Down 63% from the November 2025 peak, to the lowest month in two years. Exotec fell 30% from its peak and Geek+ 42%. Exotec gets about 14 times Hai\'s search visits. Ahrefs estimates, same method for all three.',
          }),
          panel('hbars', {
            title: 'Category searches where Exotec ranks and Hai does not',
            headline: '0 of 4',
            seriesLabel: 'US searches a month',
            points: [pt('Automated storage and retrieval system', 800), pt('Automated storage and retrieval systems', 600), pt('AS/RS', 400), pt('Goods to person', 300)],
            caption: 'Exotec ranks first or second for three of these. Hai is not in the top 100 for any of them. Hai does rank first for "warehouse robots" (1,600) and "climbing robot" (30). The climbing term barely exists on Google yet, so it is decided in AI answers.',
          }),
        ]),
        board('AI search', 'ChatGPT, Perplexity and Gemini with web search · 10 buyer questions · 10 Oct 2026', [
          panel('hbars', {
            title: 'Share of answers that name each company',
            headline: '87%',
            unit: '%',
            seriesLabel: 'Answers naming them',
            points: [pt('Hai Robotics', 87), pt('Exotec', 80), pt('AutoStore', 57), pt('Geek+', 43)],
            caption: 'Hai is named in 26 of 30 answers and Exotec in 24. Being named is not the gap.',
          }),
          panel('bars', {
            title: 'Named first on climbing robot questions',
            headline: '20%',
            unit: '%',
            seriesLabel: 'Answers that name them first',
            points: [pt('Exotec', 47), pt('AutoStore', 27), pt('Hai Robotics', 20), pt('Swisslog', 7)],
            caption: 'On the five questions about climbing robots, retrofits and alternatives, Exotec comes first in 7 of 15 answers and Hai in 3. ChatGPT tells a retrofit buyer to "shortlist Exotec Skypod first".',
          }),
        ]),
      ],
      closing: 'The scale is already there. What is missing is one name for the category, one place that proves the results, and the third-party sources AI reads saying the same thing.',
    }),

    section('tableSection', {
      heading: 'What AI says, question by question',
      note: 'Asked once each on 10 October, US, web search on. Answers vary from run to run. From today we track all 10 against 10 competitors.',
      columns: ['Buyer question', 'What the three assistants answered'],
      rows: [
        row(['What are climbing robots in warehouses, and who makes them?', 'All three name Hai. ChatGPT starts with Exotec']),
        row(['Best rack-climbing robot systems in 2026', 'All three name Hai. ChatGPT lists it fifth, Perplexity after Exotec']),
        row(['HaiPick Climb vs Exotec Skypod', 'ChatGPT calls Exotec "mature, proven, very fast" and backs Hai for density only']),
        row(['Which climbing system has the most deployments?', 'Hai, using your 10,000-robot figure. This is what a citable number does']),
        row(['Best goods-to-person system for a high-ceiling retrofit', 'ChatGPT: "shortlist Exotec Skypod first". Perplexity does not name Hai']),
        row(['Leading ACR vendors', 'Hai first in all three. You own this term']),
        row(['Exotec Skypod alternatives', 'ChatGPT calls Hai "less dense and lower-throughput". Perplexity leaves Hai out']),
        row(['Which vendors publish proven ROI and uptime results?', 'Locus, AutoStore and Exotec. Hai is named in 1 of 3 answers']),
      ],
    }),

    section('bulletListSection', {
      heading: 'What we found on the site',
      items: [
        bullet('A staging copy is public, and AI quotes it.', 'dev.hairobotics.com is open to search engines and still says HaiPick Climb holds 30,000 totes. The live site says 45,000. ChatGPT cited the staging copy three times in one answer.'),
        bullet('Climb is described three ways.', 'The homepage says goods-to-person, the Climb page says ASRS, and the robot page says climbing robot. AI then mixes Climb up with the older ACR line, which is why it calls Hai "less dense".'),
        bullet('The Climb page tells AI nothing structured.', 'It has no schema markup, and its first heading is empty. The homepage heading is "Hai Robotics Homepage", and Climb is not in the homepage title or description.'),
        bullet('The proof is there but hard to quote.', '89 case pages, many of them anonymised, and no single page with deployments, throughput, uptime and payback. So the ROI question goes to Locus and AutoStore.'),
        bullet('The foundations are good.', 'AI crawlers are allowed, pages render without JavaScript, there is Organization markup, and your blog guides rank first for "warehouse robots".'),
      ],
    }),

    section('tracksSection', {
      heading: 'What we would do',
      intro: 'One goal: when a buyer asks AI about climbing robots, HaiPick Climb comes first.',
      tracks: [
        track('Fix what AI reads', [
          trackItem('Week 1', 'Close the staging site and point its cited pages to the live ones'),
          trackItem(null, 'Schema, headings and titles on the Climb, HaiClimber and home pages'),
          trackItem(null, 'One category name used everywhere, from the homepage to press releases'),
        ]),
        track('Own the category', [
          trackItem('Weeks 2-6', 'A "What is a climbing robot?" page with your definition, specs and installed base'),
          trackItem(null, 'Honest comparison pages: Climb vs Skypod, Climb vs AutoStore, retrofit vs new build'),
          trackItem(null, 'Answer pages for the questions where Exotec is named first today'),
        ]),
        track('Make the proof citable', [
          trackItem('Weeks 3-8', 'One results page: deployments, named customers, throughput, uptime and payback, each dated'),
          trackItem(null, 'Case studies rewritten around a number in the first line'),
          trackItem(null, 'Up-to-date facts on Wikidata and the profiles AI reads'),
        ]),
        track('Seed the sources AI cites', [
          trackItem('Ongoing', 'Corrections and inclusion on the sites AI already quotes: supply chain guides, robot directories and trade press'),
          trackItem(null, 'Your press releases carry the same numbers and the same category name'),
          trackItem(null, '10 buyer questions tracked in ChatGPT, Perplexity and Gemini'),
        ]),
      ],
    }),

    section('monthsSection', {
      heading: 'The first 90 days',
      intro: 'What you would see, month by month.',
      months: [
        month('Month 1', 'Fix and define', ['Staging site closed', 'Schema and headings fixed', 'Category name agreed and applied', 'AI baseline on all 10 questions'], 'AI reads one version of Climb'),
        month('Month 2', 'Publish the proof', ['Category page live', 'Results page live', 'Comparison and retrofit pages live', 'First third-party corrections'], 'Buyers and AI find the numbers in one place'),
        month('Month 3', 'Spread it', ['Placements on cited sites', 'Case studies reworked', 'AI answers re-checked on all 10 questions'], 'Hai named first on climbing robot questions'),
      ],
      note: 'Every report starts with AI answers: named, named first, and cited. Then search.',
    }),

    section('caseProofSection', {
      heading: 'The same work, for us and for our clients',
      intro: "Ask and we'll put you in touch with one of these clients directly.",
      chartsPerCase: 1,
      slugs: [
        'loudface-aeo-case-study',
        'toku-ai-cited-pipeline',
        'trademomentum-niche-aeo-organic-growth',
        'delshad-legal-content-engine',
        'genie-teacher-organic-growth',
      ],
    }),

    section('bulletListSection', {
      heading: 'Next step',
      band: 'dark',
      items: [
        bullet('Agree the scope.', 'The 90-day sprint as above, or the sprint followed by monthly tracking and seeding.'),
        bullet('We send a proposal.', 'Scope, timeline and pricing, within a few days of this call.'),
        bullet('Who else should see this?', 'Tell us, and we will walk them through it.'),
      ],
    }),
  ],
};

/* ── write ────────────────────────────────────────────────────────────── */

if (DRY_RUN) {
  console.log(JSON.stringify(doc, null, 2));
  console.log(`\n[dry run] would write to dataset "${DATASET}" on project ${PROJECT_ID}`);
  process.exit(0);
}

if (!TOKEN) {
  console.error('Missing SANITY_PROPOSALS_WRITE_TOKEN (or SANITY_API_TOKEN). See docs/PROPOSALS.md.');
  process.exit(1);
}

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: '2025-03-29',
  useCdn: false,
  token: TOKEN,
});

const created = await client.createOrReplace(doc);

const base = process.env.PROPOSAL_BASE_URL || 'https://www.loudface.co';
console.log(`Wrote ${created._id} to dataset "${DATASET}".`);
console.log('');
console.log(`  Link:   ${base}/p/${accessToken}`);
console.log(`  Code:   ${accessCode}`);
console.log(`  Status: ${STATUS}${STATUS === 'draft' ? '  (the link 404s until you set it to Sent)' : ''}`);
console.log('');
console.log('Send the link and the code in separate messages.');
