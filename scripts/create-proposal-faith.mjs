#!/usr/bin/env node
/**
 * Seed the Faith Auto Glass proposal into the PRIVATE `proposals` Sanity dataset.
 *
 * Written from the 22 Sep 2026 call with Frank Yakou and the email thread
 * that preceded it (Aug 7 – Sep 18). No audit report exists for Faith, so
 * "Where you are" carries no numbers; the offer carries the page.
 *
 * Usage:
 *   node scripts/create-proposal-faith.mjs --dry-run
 *   node scripts/create-proposal-faith.mjs
 *   node scripts/create-proposal-faith.mjs --status=sent --valid-until=2026-10-13
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
const VALID_UNTIL = flag('valid-until', '2026-10-13');

/* ── token + code ─────────────────────────────────────────────────────── */

const TOKEN_ALPHABET = 'abcdefghijkmnpqrstuvwxyz23456789';
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const pick = (alphabet, length) =>
  Array.from(randomBytes(length), (byte) => alphabet[byte & 31]).join('');

const accessToken = flag('token', pick(TOKEN_ALPHABET, 26));
const accessCode = flag('code', `${pick(CODE_ALPHABET, 4)}-${pick(CODE_ALPHABET, 4)}`);

/* ── portable text helpers ────────────────────────────────────────────── */

const key = () => randomUUID().slice(0, 12);

/** A paragraph. Runs: {text, bold?, href?}. */
const para = (content, style = 'normal') => {
  const runs = typeof content === 'string' ? [{ text: content }] : content;
  const markDefs = [];
  const children = runs.map((run) => {
    const marks = [];
    if (run.bold) marks.push('strong');
    if (run.href) {
      const k = key();
      markDefs.push({ _type: 'link', _key: k, href: run.href });
      marks.push(k);
    }
    return { _type: 'span', _key: key(), text: run.text, marks };
  });
  return { _type: 'block', _key: key(), style, markDefs, children };
};

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
const trackItem = (count, text) => ({ _type: 'trackItem', _key: key(), ...(count ? { count } : {}), text });
const track = (label, items) => ({ _type: 'track', _key: key(), label, items });
const month = (label, title, items, proves) => ({ _type: 'monthPlan', _key: key(), label, title, items, proves });

const FIGMA_URL =
  'https://www.figma.com/design/F9eiT6aTU3ntbWc51Jkhu5/LoudFace--Design-Samples?node-id=0-1&t=cFnr6sMy2HCOiYGT-1';

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
  _id: `proposal.faith.${accessToken.slice(0, 10)}`,
  title: 'Faith Auto Glass x LoudFace: one site for every location, found on Google and ChatGPT',
  clientName: 'Faith Auto Glass',
  preparedFor: ['Frank Yakou'],
  token: accessToken,
  accessCode,
  validUntil: VALID_UNTIL,
  status: STATUS,
  contactEmail: 'arnel@loudface.co',
  priceLine: '$5,000/mo. Capped at 3 months. Then we decide together what comes next.',
  heroQuote: "I don't have anything tangible to see what the 5k is going to exactly get me.",
  heroQuoteBy: 'Frank Yakou, on our call, 22 September 2026',
  heroSummary: [
    para(
      'Fair point, so this page is the tangible part. What we build, what we ship each month, and what you can check yourself. A new website for Faith within a week of kickoff, an employee portal, and three months of making Faith the name Google and ChatGPT give when someone in the Temecula area needs auto glass.'
    ),
  ],
  clipStrip,
  proofRail,
  sections: [
    /* 1 · where you are */
    section('richTextSection', {
      heading: 'Where you are',
      body: [
        para(
          'Faith has the reputation. Hundreds of five-star reviews, a shop people drive past on Old Town Front Street, and a second location on the way. The website does not carry any of that yet. It shows one location, it does not sell the second, and the quote and booking tools you already pay for are not on it.'
        ),
        para(
          'The bigger gap is where people look now. Someone with a cracked windshield asks Google, and more and more of them ask ChatGPT. Both answer from what is published about a business online. Right now there is very little published about Faith, so the answer is a competitor.'
        ),
      ],
    }),

    /* 2 · the design work, first because that is what Frank asked to see */
    section('richTextSection', {
      heading: 'Our design work',
      body: [
        para([
          { text: 'You asked to see what our sites look like. Every design we have shipped for clients, plus a few more projects, is in one Figma file: ' },
          { text: 'LoudFace design samples', href: FIGMA_URL },
          { text: '. Open it on a laptop, it is big.' },
        ]),
        para(
          'Most of these are software companies, as I said on the call. The style carries over. For Faith you asked for something in the middle: modern, but subtle enough for the average customer, nothing too futuristic. That is the brief we will design to, starting from the four sketches we sent you in August.'
        ),
        para(
          'The site is included in the retainer. We do not charge separately for design or development because it is the part we are best at.'
        ),
      ],
    }),

    /* 3 · what you get */
    section('tracksSection', {
      heading: 'What you get',
      intro: 'Three tracks, all included, all starting in week one.',
      tracks: [
        track('Your website', [
          trackItem('Week 1', 'New site live: one website for every location, each with its own page, hours and directions'),
          trackItem('Day 1', 'Your quote software, CRM and booking calendar plugged in through their APIs, so a visitor gets a price and a slot without calling'),
          trackItem('Same day', 'Landing pages for any social campaign or promotion, on request, usually live the day you ask'),
          trackItem(null, 'Ongoing updates and maintenance for as long as we work together'),
        ]),
        track('Employee portal', [
          trackItem('Month 1', 'Private login, one ID per technician, nothing visible to the public'),
          trackItem(null, 'Your training videos and step-by-step guides, filed by vehicle type: sedan, EV, semi truck'),
          trackItem(null, 'A company bulletin board for known issues on specific models, so what you know reaches every tech'),
          trackItem(null, 'Built so it can grow into an exploded-view parts guide later, if you want it to'),
        ]),
        track('Google and AI search', [
          trackItem('5 a week', 'Articles and service pages, Monday to Friday, on the exact searches your customers type: windshield replacement, ADAS calibration, tinting, by city'),
          trackItem('2–3 a week', 'Mentions of Faith on other sites: local directories, partner pages, industry lists. These are what ChatGPT and Google read when they pick who to recommend'),
          trackItem(null, 'Google Business Profile for every location kept current, reviews pushed into the listing'),
          trackItem(null, 'Technical work: speed, schema, local pages, everything that helps Google rank the site'),
        ]),
      ],
    }),

    /* 4 · what Frank raised on the call */
    section('bulletListSection', {
      heading: 'What you asked on the call',
      items: [
        bullet(
          'Why $5,000 a month for maintenance?',
          'It is not for maintenance. Maintenance is a free add-on. The $5,000 is for the team writing five pieces a week, earning placements off your site, and running the technical side. That is what moves Faith up in Google and into AI answers.'
        ),
        bullet(
          'Can it drop to something like $1,000 a month later?',
          "Yes, that is on the table. We cap this at three months. At the end we look at the numbers together and pick one of two paths: a lower maintenance package, or continue at $5,000 because the leads justify it. You are not locked into anything past month three."
        ),
        bullet(
          'Nothing tangible?',
          'Every week you get a written report with what shipped, what ranked, and what the AI models say when asked about auto glass in your area. Every article and every placement is a link you can click.'
        ),
        bullet(
          'One site or two?',
          'One. Every location lives on the same website with its own page. That is how Google prefers it and it is far easier for you to run.'
        ),
      ],
    }),

    /* 5 · the first 90 days */
    section('monthsSection', {
      heading: 'The first 90 days',
      intro: 'Contractual minimums. We ship above them.',
      months: [
        month('Month 1', 'Launch', ['New website live in week one', 'Quote, CRM and booking integrations', 'Employee portal v1', 'Location pages for both shops', '20 articles and service pages'], 'The new site and the second location are live'),
        month('Month 2', 'Build visibility', ['20+ articles', '8–12 off-site placements', 'Google Business Profiles current', 'First landing pages on request'], 'Faith ranking for local auto glass searches'),
        month('Month 3', 'Prove it', ['20+ articles', '8–12 further placements', 'Review of leads, calls and quote requests', 'The maintenance-or-continue decision, together'], 'ChatGPT names Faith when asked about auto glass in the area'),
      ],
      note: 'After month three: a lower maintenance package or the full service. Your call, with the numbers in front of us.',
    }),

    /* 6 · how we measure */
    section('bulletListSection', {
      heading: 'How we measure',
      intro: 'Leads first.',
      items: [
        bullet('Quote requests, bookings and calls', 'from the website, tracked per location. The number that matters.'),
        bullet('AI recommendations', 'how often ChatGPT, Google AI and Gemini name Faith when asked about auto glass and tinting in your area, and what they say about you.'),
        bullet('Google', 'local rankings, Maps visibility, impressions and clicks per location.'),
        bullet(null, 'A written report every Friday, a shared channel through the week, and a call every second week.'),
      ],
    }),

    /* 7 · proof */
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

    /* 8 · investment */
    section('pricingTiersSection', {
      heading: 'Investment',
      band: 'dark',
      anchor:
        'A one-off build of a site like this is a $15,000 invoice on its own. Here it is included. The $5,000 a month buys the team that makes Faith the answer, and the site comes with it.',
      tiers: [
        tier('Accelerate', '$15,000', 'per month', 'Triple the content and outreach velocity.'),
        tier('Scale', '$10,000', 'per month', 'Double the content and outreach velocity.'),
        tier('Growth', '$5,000', 'per month', 'Website, employee portal, 5 pieces a week, 2–3 placements a week, full reporting.', true),
      ],
      note:
        'Growth is the right package for Faith. Capped at three months, $15,000 total, then a maintenance package or month to month. No setup fee, no build fee, no separate design invoice.',
    }),

    /* 9 · terms */
    section('bulletListSection', {
      heading: 'Terms and next step',
      band: 'dark',
      items: [
        bullet('Three months, billed monthly in USD.', 'The minimum exists so the work gets a fair shot at proving itself. After it, nothing is automatic.'),
        bullet('You own everything.', 'The website, the portal, every article, every listing. If we stop after three months you keep all of it.'),
        bullet('Kickoff within 48 hours', 'of signature. Design starts the same day, the site is live within a week.'),
        bullet('Next step:', 'reply to my email with a yes, we send the agreement, and the site is in design that week.'),
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
