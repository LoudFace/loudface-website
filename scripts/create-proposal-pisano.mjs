#!/usr/bin/env node
/**
 * Seed the Pisano proposal into the PRIVATE `proposals` Sanity dataset.
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
const VALID_UNTIL = flag('valid-until', '2026-10-17');

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

const doc = {
  _type: 'proposal',
  _id: `proposal.pisano.${accessToken.slice(0, 10)}`,
  title: 'Pisano x LoudFace: AI visibility at the consideration stage',
  clientName: 'Pisano',
  preparedFor: ['Şirin Komban'],
  token: accessToken,
  accessCode,
  validUntil: VALID_UNTIL,
  status: STATUS,
  contactEmail: 'arnel@loudface.co',
  priceLine: '$5,000/mo flat. 3-month minimum, then month to month.',
  heroQuote:
    'Being in the first three, with the giants, when people search. That will be the perfect call for me.',
  heroQuoteBy: 'Şirin Komban, on our call, 17 September 2026',
  heroSummary: [
    para(
      'We make Pisano one of the first three names an AI assistant returns when an enterprise CX team asks which platform to shortlist. Consideration questions only. Branded questions are already won and stay out of the target.'
    ),
  ],
  clipStrip,
  proofRail,
  sections: [
    /* 1 · the buyer's questions, live from the tracker Şirin saw on the call */
    section('askAiSection', {
      heading: 'What your buyers ask, and who gets named',
      intro:
        'Each question asked about 30 times across ChatGPT, Google AI Overview and Gemini on 17 September 2026. The full set of 40 is in the tracker.',
      questions: [
        question(
          'What are the best customer experience management platforms for large enterprises?',
          'Enterprise CX',
          [['Qualtrics', 100], ['Medallia', 100], ['Sprinklr', 80], ['InMoment', 60], ['Verint', 50], ['Pisano', 0]]
        ),
        question(
          'What are the best Qualtrics alternatives for enterprise CX programmes?',
          'Qualtrics alternatives',
          [['Qualtrics', 100], ['Medallia', 100], ['InMoment', 90], ['Press Ganey Forsta', 57], ['QuestionPro', 37], ['Pisano', 0]]
        ),
        question(
          'Which experience management platforms support Turkish and Arabic surveys?',
          'Turkish and Arabic',
          [['Qualtrics', 100], ['QuestionPro', 93], ['Medallia', 93], ['SurveyMonkey', 66], ['InMoment', 34], ['Pisano', 0]]
        ),
        question(
          'Voice of the Customer platforms for enterprises in the Middle East',
          'Middle East',
          [['Qualtrics', 100], ['Medallia', 100], ['Sprinklr', 97], ['Verint', 77], ['Press Ganey Forsta', 50], ['Pisano', 40]]
        ),
        question(
          "Which Voice of the Customer vendors are rated Customers' Choice on Gartner Peer Insights?",
          'Gartner Peer Insights',
          [['Pisano', 93], ['Qualtrics', 69], ['Medallia', 66], ['Sprinklr', 62], ['Press Ganey Forsta', 38], ['InMoment', 17]]
        ),
      ],
    }),

    /* 2 · where Pisano stands */
    section('standingSection', {
      heading: 'Where Pisano stands, and why',
      stats: [
        stat('9.1%', 'of non-branded answers name Pisano. Qualtrics: 76.7%, Medallia: 70.1%', true),
        stat('12th of 20', 'in the tracked vendor set, across the 36 consideration questions'),
        stat('0 / 12', 'core commercial Google terms where Pisano is in the top 100', true),
      ],
      closing:
        "The product is not the problem. When the question mentions Gartner, Pisano is named in 93% of answers, ahead of Qualtrics. Take the Gartner word out and the number is zero. The models know Pisano; they only reach for it when the question hands them a reason. The causes are in the audit.",
    }),

    /* 3 · what each month returns */
    section('forecastSection', {
      heading: 'What each month returns',
      assumptions: {
        aiQuestionsPerMonth: 3000,
        aiClickRate: 10,
        googleCtr: 2.5,
        ramp: [0.1, 0.35, 0.7, 1, 1, 1],
      },
      shareOfVoice: { min: 2, max: 30, value: 15, note: 'now 9.1%' },
      impressions: { min: 0, max: 60000, step: 2000, value: 20000, note: 'now 919 organic visits' },
      conversion: { min: 0.5, max: 5, step: 0.1, value: 1 },
      todayLine: 'Today the AI channel is close to zero.',
    }),

    /* 4 · what you get */
    section('tracksSection', {
      heading: 'What you get',
      intro:
        'Three tracks in parallel from week one. Everything included. Your team keeps the Academy, the webinars and the events.',
      tracks: [
        track('On your site', [
          trackItem('Week 1', 'Entity fix: organisation and product schema, one canonical tree per language, a decision on the surname article'),
          trackItem('Days', 'The 2026 Magic Quadrant page, built from the comparison artwork already in your file library'),
          trackItem('12+', 'Consideration pages: Qualtrics and Medallia alternatives, banking, retail, insurance and telecom, Turkey, the Gulf and EMEA'),
          trackItem('1–2 a day', 'Articles written to be quoted by an answer engine, from your customer results and Academy material'),
        ]),
        track('Off your site', [
          trackItem('2–3 a week', 'Placements on the pages these answers are built from. The 13 domains in the audit first'),
          trackItem(null, 'G2, Capterra and Gartner Peer Insights kept current, the Customers’ Choice pushed into every shortlist'),
          trackItem(null, 'Sentiment: how the models describe Pisano next to Qualtrics and Medallia'),
        ]),
        track('Your website', [
          trackItem('Day 1', 'We work inside HubSpot. Your landing pages keep shipping. Ask us for one and it is live the same day'),
          trackItem('Week 1', 'hreflang x-default, FAQ schema on the 716 knowledge pages, llms.txt, homepage mobile load from 5.7s to under 2.5s'),
          trackItem('Month 2', 'A design and stack proposal for the site. Your decision, no extra fee if you take it'),
        ]),
      ],
    }),

    /* 5 · how we work: the gate, the loop, the cadence */
    section('timelineSection', {
      heading: 'How we work',
      variant: 'engagementLoop',
      gateLabel: 'Review gate',
      gate: {
        body:
          'Anything that names Qualtrics, Medallia or another vendor, quotes Gartner, or states a customer result comes to Şirin before it publishes. Permanently.',
        items: [
          'The first five pieces are written and reviewed with you, to lock voice and claims.',
          'Everything else publishes independently, so volume never lands on a three-person team.',
        ],
      },
      items: [],
      showWeek: true,
    }),

    /* 6 · what we need from you, asked for on the call */
    section('bulletListSection', {
      heading: 'What we need from you',
      intro: 'All of it fits in the first week. Nothing on it stops what your team does today.',
      items: [
        bullet('HubSpot', 'CMS and file library access, marketing contributor level.'),
        bullet('Read access', 'to Google Search Console, GA4 and the HubSpot AEO dashboard export.'),
        bullet('Review platforms', 'logins for G2, Capterra and Gartner Peer Insights, plus the Gartner reprint licence for the 2026 report.'),
        bullet('30 minutes', 'with Şirin every second week, and one Slack channel for the rest.'),
      ],
    }),

    /* 7 · the first 90 days */
    section('monthsSection', {
      heading: 'The first 90 days',
      intro: 'Contractual minimums. We ship above them.',
      months: [
        month('Month 1', 'Foundations', ['Entity fix live', '2026 Magic Quadrant page', 'Technical fixes', '5 calibration pieces', 'Weekly tracker report'], 'Pisano read as a company'),
        month('Month 2', 'The commercial layer', ['Knowledge base collapsed to one', 'Alternatives and industry pages', '20+ articles', '8–12 placements'], 'Named in consideration answers'),
        month('Month 3', 'Distribution', ['Turkey, Gulf and EMEA pages', '20+ articles', '8–12 placements', 'Review platforms current'], 'Share of answer moves per engine'),
      ],
      note: 'You asked for a project first and a partnership after. The 3-month minimum is the project. After it, month to month.',
    }),

    /* 8 · proof */
    section('caseProofSection', {
      heading: 'The same work, at four other companies',
      chartsPerCase: 1,
      slugs: [
        'delshad-legal-content-engine',
        'genie-teacher-organic-growth',
        'toku-ai-cited-pipeline',
        'trademomentum-niche-aeo-organic-growth',
      ],
    }),

    /* 9 · investment */
    section('pricingTiersSection', {
      heading: 'Investment',
      band: 'dark',
      anchor:
        '“Qualtrics alternatives” costs $132 a click on Google. “Customer experience management platform” costs $47. $5,000 buys about 107 clicks of the second. The same money here buys the pages, the placements and the site work.',
      tiers: [
        tier('Accelerate', '$15,000', 'per month', 'Triple velocity and dedicated outreach.'),
        tier('Scale', '$10,000', 'per month', 'Double the content and outreach velocity.'),
        tier('Growth', '$5,000', 'per month', '1–2 articles a day, 2–3 placements a week, site work included, full reporting.', true),
      ],
      note:
        'For $5,000 you get the whole team. It is the budget you gave us; anything beyond it at your stage is redundant. 3-month minimum, then month to month. No setup fee.',
    }),

    /* 10 · terms */
    section('bulletListSection', {
      heading: 'Terms and next step',
      band: 'dark',
      items: [
        bullet('You own everything.', 'Every page, every article, every listing and the tracker. If we stop after three months you keep all of it.'),
        bullet('MSA plus a short order form', 'covering scope and the agreed target: Pisano in the top three on the tracked consideration questions.'),
        bullet('Kickoff within 48 hours', 'of signature. Technical fixes and the first content start in week one.'),
        bullet('Next step:', 'a 30-minute call with your team to agree the target, then sign, and we start that week.'),
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
