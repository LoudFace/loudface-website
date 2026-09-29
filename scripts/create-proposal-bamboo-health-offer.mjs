#!/usr/bin/env node
/**
 * Seed the Bamboo Health PROPOSAL into the PRIVATE `proposals` Sanity dataset.
 * Written from the 29 Sep 2026 intro call with Lisa Blubaugh (Senior Manager,
 * Content Marketing) and Grace Beard (Brand Manager). The call deck is
 * create-proposal-bamboo-health.mjs; this is the priced offer.
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
/* Pricing: Scale work at $7,500 (Arnel, 29 Sep 2026: "the scale at a
 * discounted rate"). The rebuild sits inside the retainer and stays on
 * WordPress (Arnel, same day). The call deck carries the data; this carries
 * the offer. */

const FIGMA_URL =
  'https://www.figma.com/design/F9eiT6aTU3ntbWc51Jkhu5/LoudFace--Design-Samples?node-id=0-1&t=cFnr6sMy2HCOiYGT-1';

const doc = {
  _type: 'proposal',
  _id: `proposal.bamboo-health-offer.${accessToken.slice(0, 10)}`,
  title: 'A clearer Bamboo Health site that brings in demo requests',
  clientName: 'Bamboo Health',
  preparedFor: ['Lisa Blubaugh', 'Grace Beard'],
  token: accessToken,
  accessCode,
  validUntil: VALID_UNTIL,
  status: STATUS,
  contactEmail: 'arnel@loudface.co',
  design: 'cards',
  promises: ['Works inside your WordPress site', 'Measured in demo requests, not traffic'],
  clipStrip,
  proofRail,
  sections: [
    /* Copy pass 29 Sep 2026: plain words, one idea a sentence, facts re-checked
     * against the 29 Sep ChatGPT run (3 of the 6 Bamboo answers are PDMP;
     * behavioral health answers mostly name no company). */
    section('richTextSection', {
      heading: 'Where you are',
      body: [
        para("The site lists your solutions, but it doesn't tell one Bamboo story yet. A buyer sees products before they know which part is for them. There isn't a clear path to a demo either."),
        para([
          { text: 'Four in five visits from Google come from people who searched for Bamboo or one of its products. In ChatGPT, Bamboo comes up in ' },
          { text: '6 of 20 everyday buyer questions.', bold: true },
          { text: ' Care coordination questions mostly name Innovaccer, Lightbeam and Epic.' },
        ]),
      ],
    }),

    section('tracksSection', {
      heading: 'What we do',
      intro: 'The first two tracks start in week one. The rebuild starts when your leadership signs off on One Bamboo.',
      tracks: [
        track('Your site, now', [
          trackItem('Week 1', 'Your forms and tracking fixed'),
          trackItem(null, 'Navigation that starts with who the visitor is'),
          trackItem(null, 'New WordPress blocks with no limit on cards and full text formatting'),
          trackItem(null, 'Landing pages that look like the rest of the site'),
        ]),
        track('Found on Google and AI', [
          trackItem('Every week', 'Content planned with your team and written for each audience'),
          trackItem(null, 'Mentions of Bamboo on sites Google and AI trust, like health IT press and review platforms'),
          trackItem(null, '20 buyer questions tracked every day in ChatGPT, Gemini and Google AI Overviews'),
        ]),
        track("The rebuild, when you're ready", [
          trackItem('After sign-off', 'Andrea, our copywriter, writes the new pages from your One Bamboo messaging'),
          trackItem(null, 'A full redesign on WordPress, with one design system for every page'),
          trackItem(null, 'Included in the retainer'),
        ]),
      ],
    }),

    section('bulletListSection', {
      heading: 'What you asked on the call',
      items: [
        bullet(
          'What can we do before a full redesign?',
          'A lot. We can fix the forms and tracking, the navigation, the homepage and the page blocks in your current WordPress. SEO and AI search work starts in week one too.'
        ),
        bullet(
          'Can you slow down for our approvals?',
          'Yes. We work fast on our side, so you get more time to review. First designs are ready within three days. Our project manager plans review rounds around your leadership team, Jeff included, and you set the pace.'
        ),
        bullet(
          'How do we get the website to drive pipeline?',
          'First we fix the forms and tracking you mentioned, so we know where each demo request comes from. Then each audience gets its own clear path to a demo.'
        ),
        bullet(
          'Can you help with the One Bamboo messaging?',
          'Yes. Andrea, our copywriter, has done this for clients with many products and audiences under one brand. She works with your team and leadership, and the messaging stays yours.'
        ),
      ],
    }),

    section('monthsSection', {
      heading: 'The first 90 days',
      intro: 'These are the minimums in the contract. We usually do more.',
      months: [
        month('Month 1', 'Foundations', ['Forms and tracking fixed', 'New navigation and homepage designed', 'Titles, headings and schema fixed', 'Starting numbers for Google and AI', '8 pieces of content'], 'Every demo request counted'),
        month('Month 2', 'Live', ['Navigation and homepage live', 'New WordPress blocks live', '8 pieces of content', '6 mentions on trusted sites'], 'A buyer finds their page in one click'),
        month('Month 3', 'Proof', ['Product pages reworked for each audience', '8 pieces of content', '6 mentions on trusted sites', 'Rebuild plan ready'], 'More demo requests than before we started'),
      ],
      note: 'If your leadership signs off on One Bamboo sooner, the rebuild starts sooner.',
    }),

    section('bulletListSection', {
      heading: 'How we measure',
      intro: 'Demo requests first.',
      items: [
        bullet('Demo requests', 'by audience and product, tracked from week one. Every report starts with this number.'),
        bullet('AI answers', 'how often ChatGPT, Gemini and Google AI Overviews name Bamboo when your buyers ask.'),
        bullet('Google', "rankings, impressions and clicks from people who don't know the Bamboo name yet."),
        bullet(null, "You get daily updates in a shared channel and a written report every Friday. There's also a weekly call and a monthly review with next month's plan."),
      ],
    }),

    section('designSliderSection', {
      heading: "Sites we've designed",
      intro: 'Dimer Health is a telehealth company. After its new site went live, conversions rose 288%.',
      slugs: [
        'dimer-health',
        'institute-of-medical-physics',
        'toku-design-messaging-upgrade',
        'hoxhunt',
        'ceipal-wp-to-wf-migration',
        'radisson-hotels-group',
        'viaduct',
        'montblanc',
      ],
      figmaUrl: FIGMA_URL,
    }),

    section('caseProofSection', {
      heading: 'Results for our clients',
      intro: "Ask and we'll put you in touch with any of these clients.",
      chartsPerCase: 1,
      slugs: ['genie-teacher-organic-growth', 'toku-ai-cited-pipeline', 'delshad-legal-content-engine', 'loudface-aeo-case-study'],
    }),

    section('pricingTiersSection', {
      heading: 'Investment',
      band: 'dark',
      anchor: "We've priced Scale at $7,500 a month for Bamboo because we're planning for a long partnership.",
      tiers: [
        tier('Scale', '$7,500', 'per month', 'Everything on this page, including the rebuild and content for all three product lines.', true, '$10,000'),
        tier('Growth', '$5,000', 'per month', 'The same work at a slower pace, with fewer pieces of content and mentions each month.'),
        tier('Accelerate', '$15,000', 'per month', 'Twice the Scale pace, for when the rebuild and a large content plan run at the same time.'),
      ],
      note: 'There are no setup or build fees.',
    }),

    section('bulletListSection', {
      heading: 'Terms and next step',
      band: 'dark',
      items: [
        bullet('A 3-month minimum, billed monthly in USD.', "The minimum gives the work a fair shot at proving itself. After that, it's month to month."),
        bullet('You own everything.', 'Every page, block, article and listing stays yours if we stop working together.'),
        bullet('Who works with you', 'A strategist works on your account every day. Andrea writes the copy, and a project manager runs your review rounds.'),
        bullet('Next step', "Reply to my email with any questions, or pick a time for a follow-up call. When you're ready, we'll send the agreement. The forms and tracking work starts the same week."),
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
