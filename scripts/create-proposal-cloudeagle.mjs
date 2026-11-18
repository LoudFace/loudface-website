#!/usr/bin/env node
/**
 * Seed the CloudEagle proposal into the PRIVATE `proposals` Sanity dataset.
 *
 * Built after the intro call with Şirin Komban on 17 September 2026. Every
 * number below is a live reading from the same day: the Pisano Peec project
 * (40 buyer questions, ChatGPT + Google AI Overview + Gemini, ~30 answers each),
 * the Pisano audit at loudface.co/a/t28sive7enk2suyyutx77q4n3f, and DataForSEO
 * Google Ads CPCs. The audit carries the evidence; this page carries the offer.
 *
 * Usage:
 *   node scripts/create-proposal-pisano.mjs --dry-run
 *   node scripts/create-proposal-pisano.mjs
 *   node scripts/create-proposal-pisano.mjs --status=sent --valid-until=2026-10-17
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
const VALID_UNTIL = flag('valid-until', '2026-12-18');

/* ── token + code ─────────────────────────────────────────────────────── */
/* Kept in step with src/lib/proposal-token.ts — same alphabets, same lengths. */

const TOKEN_ALPHABET = 'abcdefghijkmnpqrstuvwxyz23456789'; // gitleaks:allow - character alphabet for random tokens, not a secret
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
    { _type: 'railQuote', author: 'Jordan Hayes', company: 'Hayes Media', text: 'People who find us through search come to the call warmer than anyone we get from paid ads.' },
  ]),
};

/* ── the document ─────────────────────────────────────────────────────── */
/* Written before the intro call with Joel Platini and Krishna (CloudEagle),
 * 18 Nov 2026. Their numbers come from their booking note: stable traffic and
 * Book a Demo visits, completed demos down from 21–34 a month to 14 in October.
 * Site facts read live from cloudeagle.ai the same day. Re-read every line
 * after the call: the reader changes. */

const doc = {
  _type: 'proposal',
  _id: `proposal.cloudeagle.${accessToken.slice(0, 10)}`,
  design: 'cards',
  title: 'CloudEagle x LoudFace: more demos booked and held',
  clientName: 'CloudEagle',
  preparedFor: ['Joel Platini', 'Krishna'],
  token: accessToken,
  accessCode,
  validUntil: VALID_UNTIL,
  status: STATUS,
  contactEmail: 'arnel@loudface.co',
  priceLine: '$5,000/mo, 3-month minimum then month to month',
  clipStrip,
  proofRail,
  sections: [
    /* Today card */
    section('richTextSection', {
      heading: 'Where you are',
      body: [
        para(
          'Traffic and Book a Demo visits are steady. Completed demos are not: 14 in October, against 21 to 34 a month before. So the buyers still arrive. They drop somewhere between the demo page and the meeting.'
        ),
        para(
          'Your demo form asks for one thing, a work email, then sends people to a HubSpot calendar still named "Save on software spend", while the homepage now leads with AI governance. That is three steps where a buyer can leave: the form, the calendar and the meeting itself.'
        ),
      ],
    }),

    /* why traffic sits beside CRO */
    section('richTextSection', {
      heading: 'Why we pair CRO with traffic',
      body: [
        para(
          'At 14 demos a month, a classic A/B test on the demo page takes months to call. So the first gains come from research and clear fixes, and every later test runs faster with more of the right visitors.'
        ),
        para(
          'The right visitors are buyers comparing tools, not readers. Your 1,178 blog posts bring readers. The pages that bring buyers are alternatives, comparisons and AI governance category pages, and the AI answers that name a shortlist before anyone clicks. We work both ends: more of those buyers in, and fewer of them lost on the way to a meeting.'
        ),
      ],
    }),

    /* what you get */
    section('tracksSection', {
      heading: 'What you get',
      intro: 'Three tracks from week one, one team, one flat fee.',
      tracks: [
        track('Your demo path', [
          trackItem('Week 1', 'Where the missing demos went: form, calendar and no-shows, by step and by source, October against your 21–34 months'),
          trackItem('Week 1', 'Recordings and heatmaps live on the demo, pricing and comparison pages'),
          trackItem('Weeks 2–3', 'The booking path fixed: calendar on the same page, routed by buyer (AI governance or SaaS spend), reminders that cut no-shows'),
          trackItem('2+ a month', 'Tests live on the demo path, the homepage and the top pages that send buyers to it'),
        ]),
        track('Traffic that books', [
          trackItem('20+ a month', 'Pages for buyers comparing tools: alternatives, comparisons, AI governance and SaaS management category pages, each with its own demo ask'),
          trackItem('2–3 a week', 'Placements on the pages AI answers are built from, so CloudEagle is named in the shortlist'),
          trackItem(null, 'Your top blog posts get a demo path that matches the topic the reader came for'),
        ]),
        track('Your website', [
          trackItem('Day 1', 'We work inside your Webflow. New landing pages ship as the tests need them'),
          trackItem(null, 'Site work sits inside the fee. You own every page and test result'),
        ]),
      ],
    }),

    /* the first 90 days */
    section('monthsSection', {
      heading: 'The first 90 days',
      intro: 'Contractual minimums. We ship above them.',
      months: [
        month('Month 1', 'The leak found and fixed', ['Demo drop-off mapped by step and source', 'Booking path fixed', 'Recordings live', '20+ buyer pages live'], 'Fewer buyers lost between the form and the meeting'),
        month('Month 2', 'Tests running', ['2+ tests live on the demo path', '40+ buyer pages live', '8–12 placements'], 'More of the right buyers reaching the demo page'),
        month('Month 3', 'Compounding', ['4+ tests run in total', '60+ buyer pages live', '20+ placements', 'Completed demos against October’s 14'], 'Demos booked and held, by source, against where you started'),
      ],
    }),

    /* how we measure */
    section('bulletListSection', {
      heading: 'How we measure',
      items: [
        bullet('Completed demos', 'per month in HubSpot, the number you gave us. October’s 14 is the start.'),
        bullet('Each step', 'demo page to email, email to booked slot, booked to held.'),
        bullet('By source', 'which pages and channels send buyers who show up.'),
        bullet('AI answers and Google', 'how often CloudEagle is named when buyers ask for a shortlist.'),
      ],
    }),

    /* why us */
    section('bulletListSection', {
      heading: 'Why us',
      items: [
        bullet('One team', 'for the demo path, the pages and search, on one flat fee. No hand-off between a CRO shop and an SEO shop.'),
        bullet('Minimums in the contract.', 'Tests, pages and placements, every month.'),
        bullet('We did it for ourselves first.', 'Our own site books our calls.'),
        bullet('Talk to a client.', 'We can put you in touch with one.'),
      ],
    }),

    /* proof */
    section('caseProofSection', {
      heading: 'The same work at other B2B companies',
      chartsPerCase: 1,
      slugs: [
        'toku-ai-cited-pipeline',
        'genie-teacher-organic-growth',
        'delshad-legal-content-engine',
        'trademomentum-niche-aeo-organic-growth',
      ],
    }),

    /* industry + platform */
    section('bulletListSection', {
      heading: 'Your market and your platform',
      items: [
        bullet('Your market.', 'We don’t start out knowing SaaS management and AI governance as well as you do. We learn it from your product team, your sales calls and your G2 reviews, and the first pages are reviewed with you. AI drafts, a person writes and checks every page.'),
        bullet('Webflow stays.', 'We work in your Webflow. Nothing moves, and you keep everything if we stop.'),
      ],
    }),

    /* investment */
    section('pricingTiersSection', {
      heading: 'Investment',
      band: 'dark',
      anchor:
        'Getting back to the low end of your own range is 7 more completed demos a month.',
      tiers: [
        tier('Accelerate', '$15,000', 'per month', 'Triple the pages, placements and test velocity.'),
        tier('Scale', '$10,000', 'per month', 'Double the pages, placements and tests.'),
        tier('Growth', '$5,000', 'per month', 'The demo path work, 2+ tests a month, 20+ buyer pages, 2–3 placements a week, site work included.', true),
      ],
      note:
        'For $5,000 you get the whole team: CRO, content, outreach and Webflow. 3-month minimum, so the work gets a fair test, then month to month. No setup fee.',
    }),

    /* leadership + terms */
    section('bulletListSection', {
      heading: 'For your leadership',
      band: 'dark',
      items: [
        bullet('Why this:', 'buyers still reach the demo page, but completed demos fell from 21–34 a month to 14.'),
        bullet('Why now:', 'every month at 14 is 7 to 20 demos short of your own average.'),
        bullet('What it costs:', '$5,000 a month for CRO, buyer pages and AI visibility from one team, against hiring a CRO lead and an SEO agency separately.'),
      ],
    }),
    section('bulletListSection', {
      heading: 'Terms and next step',
      band: 'dark',
      items: [
        bullet('You own everything.', 'Pages, tests, recordings and data stay yours.'),
        bullet('MSA and a short order form', 'with the monthly minimums above.'),
        bullet('Next step:', 'read access to HubSpot, GA4 and Webflow, and we map where the demos went in week one.'),
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
