#!/usr/bin/env node
/**
 * Seed the Loopwell proposal (Sean Looney: Loopwell, Loop Studios, Looney
 * Content) into the PRIVATE `proposals` Sanity dataset.
 *
 * Written from the 28 Sep 2026 intro call with Sean Looney, in the card layout
 * (design: cards). Numbers are live readings from the same day: Ahrefs domain
 * rating and organic keywords for loopwithus.com, loopstudiosinc.com,
 * looneycontent.com and looney-advertising.com; the loopwithus.com sitemap
 * (85 blog articles, tag pages excluded); DataForSEO Google Ads CPC for
 * "team building nj".
 *
 * The live document keeps its first token and code. To rewrite it in place:
 *   node scripts/create-proposal-loopwell.mjs --status=sent \
 *     --token=<the existing token> --code=<the existing code>
 *
 * Usage:
 *   node scripts/create-proposal-loopwell.mjs --dry-run
 *   node scripts/create-proposal-loopwell.mjs
 *   node scripts/create-proposal-loopwell.mjs --status=sent --valid-until=2026-10-28
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
const VALID_UNTIL = flag('valid-until', '2026-10-28');

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
/* Card layout (design: 'cards'), the one picked on 23 Sep 2026. The cards hero
 * shows the title, the price line split at its first ", " into amount and
 * label, and two promises; it does not show heroSummary or heroQuote. */

const doc = {
  _type: 'proposal',
  _id: `proposal.loopwell.${accessToken.slice(0, 10)}`,
  title: 'Offsites and events at Loopwell, found on Google and ChatGPT',
  clientName: 'Loopwell',
  preparedFor: ['Sean Looney'],
  token: accessToken,
  accessCode,
  validUntil: VALID_UNTIL,
  status: STATUS,
  contactEmail: 'arnel@loudface.co',
  design: 'cards',
  /* The label after ", " must fit one line at phone width, like Faith's. */
  priceLine: '$5,000/mo, per company. 3-month minimum.',
  /* Sean has in-house designers, so the house line "No designer or developer to hire" does not fit him. */
  promises: ['Works inside your Squarespace site', 'Measured in enquiries, not traffic'],
  clipStrip,
  proofRail,
  sections: [
    /* 1 · where you are: the Today card, beside the three monthly outcomes */
    section('richTextSection', {
      heading: 'Where you are',
      body: [
        para(
          "When the building isn't booked, it sits empty. Google and ChatGPT rarely show Loopwell or Loop Studios to a company planning an offsite near New York."
        ),
        para(
          'Loopwell has 85 blog articles, and Ahrefs finds one venue search they rank for: "meditation event", at 10 searches a month. Peerspace, PartySlate and Eventective take the rest.'
        ),
      ],
    }),

    /* 2 · what we do. The first item of each track is its headline cadence (the pill). */
    section('tracksSection', {
      heading: 'What we do',
      intro: 'Three tracks for Loopwell, all starting in week one.',
      tracks: [
        track('On your site', [
          trackItem('5 a week', "Articles from your team's own knowledge: corporate programmes, the author series, the 750 experiences"),
          trackItem('Week 1', 'Pages for offsites, retreats, private events and wellness days, with rooms, capacity and packages'),
          trackItem('Month 2', 'The 85 blog articles reviewed. The weak ones get merged into pages that work'),
        ]),
        track('Off your site', [
          trackItem('2-3 a week', 'Mentions on the venue sites Google and AI answers trust: PartySlate, Eventective, Peerspace, Tagvenue'),
          trackItem(null, 'A review ask after every corporate event'),
          trackItem(null, 'How ChatGPT, Perplexity, Claude and Google AI describe Loopwell, checked every week'),
        ]),
        track('Your website', [
          trackItem('Day 1', 'We work inside Squarespace. Your designers keep the site'),
          trackItem('Week 1', 'Venue schema, an llms.txt, and one owner per search between Loopwell and Loop Studios'),
          trackItem('Same day', 'A landing page when you need one'),
        ]),
      ],
    }),

    /* 3 · what Sean raised on the call. Every lead ends in "?", so the cards layout draws it as a chat. */
    section('bulletListSection', {
      heading: 'What you asked on the call',
      items: [
        bullet(
          "Isn't this what Adaptify does?",
          "Adaptify writes articles, and articles are a small part of this work. Most of it happens off your site: getting Loopwell named on the directories, event roundups and review sites that Google and ChatGPT trust, and keeping every source consistent about who you are. On your site, we make sure AI crawlers can read everything and build the pages that book the building. A strategist runs all of it every day. Loopwell has 85 Adaptify articles, and they don't bring in offsite or event searches. If a tool hasn't moved results in three months, it isn't worth keeping."
        ),
        /* Checked 28 Sep: studios that outrank Loop Studios include Media City and Film Factory (DR 0) and Butter Tree (DR 7), so the other agency was partly right. */
        bullet(
          'Another agency called Loop Studios a simple fix. Is it?',
          'Partly. Authority isn\'t Loop Studios\' problem, since some studios that outrank it score lower. It\'s missing pages for the searches people type. The truly simple fix is on the Looney side: when looney-advertising.com retires, redirect every page, or its #5 for "advertising agency nj" goes with it.'
        ),
        bullet(
          'Why would I help a competitor?',
          "You won't. We don't trade with the venue down the street. We go after sites that already rank above you: venue directories, NJ and NYC event roundups, caterers, planners and HR blogs. Every trade has to help Loopwell more than the other side, and you see the list before anything goes out."
        ),
        bullet(
          'What if we only do the setup?',
          "The gains fade. Competitors keep publishing and earning links, and Google moves them up. That's why it runs month to month after the first three."
        ),
        bullet(
          'Why a company and not one person?',
          "Because the work doesn't rest on one person. Our system measures every piece against results across all our clients, so what wins for one is used for all of them, and it learns from new data every day. The team meets daily to share what's working. One hire, however good with AI tools, starts from zero and works alone."
        ),
        bullet(
          "You don't need a website. Does the price drop?",
          "No. The $5,000 pays for the content, the outreach and the reporting. The site work is there when you need a page. When you don't, that time goes into content and outreach."
        ),
      ],
    }),

    /* 4 · the first 90 days. Each month's `proves` also fills the "Where we take it" card. */
    section('monthsSection', {
      heading: 'The first 90 days',
      intro: 'Contractual minimums. We ship above them.',
      months: [
        month('Month 1', 'Foundations', ['Offsite, retreat and event pages live', 'One owner per search: Loopwell or Loop Studios', 'Schema and llms.txt', '20 articles', 'AI and Google baseline'], 'Loopwell read as a venue, not only a club'),
        month('Month 2', 'Backing it up', ['20+ articles', '8-12 placements', 'Directory listings current and consistent', 'Blog cleaned up'], 'Loopwell ranking for offsite and event searches'),
        month('Month 3', 'The decision', ['20+ articles', '8-12 placements', 'Enquiries and bookings reviewed', 'Go or no-go on Loop Studios'], 'AI answers name Loopwell for NJ offsites'),
      ],
      note: 'Most clients see the curve turn by the end of month two. If nothing moves in three months, something is wrong and we tell you.',
    }),

    /* 5 · how we measure */
    section('bulletListSection', {
      heading: 'How we measure',
      intro: 'Enquiries first.',
      items: [
        bullet('Offsite and event enquiries', 'from the booking and contact forms, tracked from week one. Every report starts with this number.'),
        bullet('AI recommendations', 'how often ChatGPT, Perplexity, Claude and Google AI name Loopwell when a company asks for an offsite or event space near New York.'),
        bullet('Google', 'rankings, impressions and clicks on the searches that book the building.'),
        bullet(null, 'A written report every Friday, a monthly review with the next 30-day plan, and a weekly call.'),
      ],
    }),

    /* 6 · proof */
    section('caseProofSection', {
      heading: 'The same work, for us and for four clients',
      intro: "Ask and we'll put you in touch with one of these clients directly.",
      chartsPerCase: 1,
      /* Our own study first: it is the climb Arnel showed Sean on the call. The two anonymous
       * studies stay out: their charts end on 30 Jun and 24 Aug 2026. */
      slugs: [
        'loudface-aeo-case-study',
        'delshad-legal-content-engine',
        'genie-teacher-organic-growth',
        'toku-ai-cited-pipeline',
        'trademomentum-niche-aeo-organic-growth',
      ],
    }),

    /* 7 · investment. The recommended tier comes first; a price in words sorts last. */
    section('pricingTiersSection', {
      heading: 'Investment',
      band: 'dark',
      anchor:
        '"Team building nj" costs $20 a click on Google Ads. $5,000 buys 250 of those clicks for one month, and they stop the day the budget does. The pages and mentions we build stay.',
      tiers: [
        tier('One company', '$5,000', 'per month', 'Loopwell. 5 articles a week, 2-3 placements a week, site work in Squarespace, full reporting.', true),
        tier('Two companies', '$10,000', 'per month', 'Loopwell and Loop Studios. One building, two sites, one plan.'),
        tier('All three', "Let's talk", undefined, 'Loopwell, Loop Studios and Looney Content on one plan. We price it together.'),
      ],
      note: 'Start with one. Add Loop Studios when Loopwell has earned it. 3-month minimum per company, then month to month. No setup fee.',
    }),

    /* 8 · terms: four cards, the "Next step" one in white */
    section('bulletListSection', {
      heading: 'Terms and next step',
      band: 'dark',
      items: [
        bullet('Three months, billed monthly in USD.', 'The minimum gives the work a fair shot at proving itself. After it, month to month.'),
        bullet('You own everything.', 'Every page, article and listing stays yours if we stop.'),
        bullet('Later, for your clients.', "Once you've seen it work on your own companies, we can talk about Looney Content offering it to your clients."),
        bullet('Next step', "Reply to my email with the company you want to start with, and we'll send the agreement. With Squarespace access and a short form from your team, the first pieces go live that Friday."),
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
