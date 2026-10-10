#!/usr/bin/env node
/**
 * Seed the Hai Robotics PROPOSAL into the PRIVATE `proposals` Sanity dataset.
 * Written from the 11 Oct 2026 call with Juliet Zhang. The call deck is
 * create-proposal-hai-robotics.mjs; this is the priced offer.
 *
 * The live document keeps its first token and code. To rewrite it in place:
 *   node scripts/create-proposal-hai-robotics-offer.mjs --status=sent \
 *     --token=<the existing token> --code=<the existing code>
 *
 * Usage:
 *   node scripts/create-proposal-hai-robotics-offer.mjs --dry-run
 *   node scripts/create-proposal-hai-robotics-offer.mjs
 *   node scripts/create-proposal-hai-robotics-offer.mjs --status=sent --valid-until=2026-10-28
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
const VALID_UNTIL = flag('valid-until', '2026-11-11');

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
const tier = (name, price, cadence, description, recommended = false, wasPrice) => ({
  _type: 'pricingTier',
  _key: key(),
  name,
  price,
  ...(wasPrice ? { wasPrice } : {}),
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
/* Pricing (Arnel, 11 Oct 2026): the $7,500 package at $5,000 a month for the
 * 3-month pilot, then $7,500 a month if both sides continue. Scope from the
 * 11 Oct call with Juliet Zhang: content and off-site only (Hai's team owns
 * the Drupal code and design and reviews every piece), US first, English
 * only, measured in brand impressions, not leads. Numbers: Peec AI, 25
 * questions x ~30 answers each across ChatGPT, Gemini and Google AI
 * Overviews, 10-11 Oct; Ahrefs US, 10 Oct. The call deck carries the rest. */

const row = (cells) => ({ _type: 'tableRow', _key: key(), cells });

const doc = {
  _type: 'proposal',
  _id: `proposal.hai-robotics-offer.${accessToken.slice(0, 10)}`,
  title: 'Hai Robotics, named for warehouse automation, not only climbing robots',
  clientName: 'Hai Robotics',
  preparedFor: ['Juliet Zhang'],
  token: accessToken,
  accessCode,
  validUntil: VALID_UNTIL,
  status: STATUS,
  contactEmail: 'arnel@loudface.co',
  design: 'cards',
  promises: ['A 3-month pilot, then you decide', 'Measured in AI and Google impressions'],
  clipStrip,
  proofRail,
  sections: [
    section('richTextSection', {
      heading: 'Where you are',
      body: [
        para("On climbing robots you already lead. Hai is named in almost every AI answer about climbing robots and ACR systems, and usually first. There's little to gain from more work there."),
        para([
          { text: 'The gap is the wider category. ' },
          { text: 'On general warehouse automation questions, AI names Hai in 29% of answers.', bold: true },
          { text: ' AutoStore is at 55%, Geek+ at 45% and Dematic at 44%. On Google, Hai is not in the top 100 for "warehouse automation", which gets 4,200 US searches a month.' },
        ]),
      ],
    }),

    section('tableSection', {
      heading: 'Where we would focus',
      note: 'Peec AI, about 30 answers per question across ChatGPT, Gemini and Google AI Overviews, US, 10-11 October. Google figures are Ahrefs, US.',
      columns: ['Buyer question or search', 'Hai today'],
      rows: [
        row(['Warehouse automation for small and mid-sized warehouses', 'Named in 0 of 30 AI answers']),
        row(['How to automate a warehouse without replacing existing racking', 'Named in 1 of 30. This is HaiPick\'s own pitch']),
        row(['What does warehouse automation cost, and what is the ROI?', 'Named in 1 of 30']),
        row(['Which vendors have the most deployments worldwide?', 'Named in 3 of 30']),
        row(['Best warehouse automation companies in 2026', 'Named in 4 of 30']),
        row(['Best AS/RS vendors', 'Named in 6 of 30']),
        row(['"warehouse automation" on Google (4,200 searches a month)', 'Not in the top 100']),
        row(['"automated storage and retrieval system" on Google (1,200 a month)', 'Not in the top 100. Exotec ranks first']),
      ],
    }),

    section('tracksSection', {
      heading: 'What we do',
      intro: 'One plan for Google and AI, because AI answers lean on the pages that rank on Google. Your team keeps the code and design. We write, you review, you publish.',
      tracks: [
        track('Content on your site', [
          trackItem('8 a month', 'Pages and articles for the warehouse automation and AS/RS questions above, written to rank on Google and to be quoted by AI'),
          trackItem(null, 'A results page with deployments, named customers, throughput and uptime, so AI has numbers to quote'),
          trackItem(null, 'Updates to the pages you have, starting with the homepage and HaiPick Climb copy'),
        ]),
        track('Mentions on other sites', [
          trackItem('6 a month', 'Digital PR: Hai placed in industry articles, vendor lists and guides that Google and AI already cite'),
          trackItem(null, 'Profiles on review and directory sites kept current, with the same numbers everywhere'),
          trackItem(null, 'Corrections where AI repeats old facts, like the 30,000-tote figure'),
        ]),
        track('Technical SEO, as requests to your team', [
          trackItem('Week 1', 'A short list of code changes, written so your developers can ship them: the public dev site, schema, headings and titles'),
          trackItem(null, 'We check each change after it goes live'),
        ]),
        track('Tracking', [
          trackItem('Daily', 'About 100 buyer questions in ChatGPT, Gemini and Google AI Overviews, up from 38 today'),
          trackItem(null, 'Google rankings and impressions for the warehouse automation and AS/RS terms'),
          trackItem(null, 'US first, then the UK, Canada and Australia'),
        ]),
      ],
    }),

    section('bulletListSection', {
      heading: 'What you asked on the call',
      items: [
        bullet('How much content is in the package?', '8 pieces a month, so 24 over the pilot. These are minimums. Each one goes to your team for review before it is published.'),
        bullet('How much digital PR?', '6 placements on other sites a month, so 18 over the pilot. Also minimums.'),
        bullet('Is the price based on the number of countries?', 'No. One price covers every market. We start with the US and add the UK, Canada and Australia in English, as you asked.'),
        bullet('Can you work without access to our code?', 'Yes. We work in your Drupal editor for content only. Anything that needs code goes to your team as a clear request, and we check it once it is live.'),
      ],
    }),

    section('monthsSection', {
      heading: 'The 3-month pilot',
      intro: 'These are the minimums in the contract. We usually do more.',
      months: [
        month('Month 1', 'Set up', ['About 100 questions tracked, starting numbers agreed with you', 'Technical requests sent to your team', '8 pieces of content', '6 placements on other sites'], 'Targets set together'),
        month('Month 2', 'Build', ['8 pieces of content', '6 placements on other sites', 'Results page live', 'First check of AI answers against the start'], 'Hai named in more warehouse automation answers'),
        month('Month 3', 'Review', ['8 pieces of content', '6 placements on other sites', 'Full pilot report: AI visibility, share of voice and Google impressions'], 'A clear answer on the 1-year partnership'),
      ],
      note: 'Every report starts with brand impressions: how often AI names Hai, and how often Hai shows up on Google.',
    }),

    section('bulletListSection', {
      heading: 'How we work with you',
      items: [
        bullet('Daily updates', 'by email or in a shared channel, whichever your team uses.'),
        bullet('A written report every Friday', 'with what we did that week and what moved.'),
        bullet('A monthly review', "with next month's plan, so you always see the next 30 days."),
        bullet('A call every two weeks', '30 minutes with your team.'),
        bullet('You own everything.', 'Every page, article and placement stays yours if we stop working together.'),
      ],
    }),

    section('caseProofSection', {
      heading: 'Results for our clients',
      intro: "Ask and we'll put you in touch with any of these clients.",
      chartsPerCase: 1,
      slugs: ['loudface-aeo-case-study', 'genie-teacher-organic-growth', 'delshad-legal-content-engine', 'trademomentum-niche-aeo-organic-growth', 'toku-ai-cited-pipeline'],
    }),

    section('pricingTiersSection', {
      heading: 'Investment',
      band: 'dark',
      anchor: 'Our $7,500 package at $5,000 a month for the pilot, because we want this to become a long partnership.',
      tiers: [
        tier('3-month pilot', '$5,000', 'per month for 3 months', 'Everything on this page: 24 pieces of content, 18 placements on other sites, technical requests and daily tracking.', true, '$7,500'),
        tier('After the pilot', '$7,500', 'per month', 'The same work at the regular price, if we both decide to continue. The 1-year terms are agreed together after the pilot.'),
      ],
      note: 'Pilot total: $15,000. There are no setup fees.',
    }),

    section('bulletListSection', {
      heading: 'Terms and next step',
      band: 'dark',
      items: [
        bullet('3 months, billed monthly in USD.', 'The pilot ends after 3 months. If it works, we agree the 1-year partnership together. If it does not, the pilot simply ends.'),
        bullet('Who works with you', 'A strategist works on your account every day, with our writers and outreach team behind them.'),
        bullet('Next step', "Reply to my email with any questions. When you're ready, we'll send the agreement and start the same week."),
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
