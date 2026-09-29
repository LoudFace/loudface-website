#!/usr/bin/env node
/**
 * Seed the Bamboo Health call deck into the PRIVATE `proposals` Sanity dataset.
 * A pitch page shown on the intro call, not a priced proposal: no price line,
 * no pricing section.
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
/* Numbers read on 29 Sep 2026: Ahrefs (US, subdomains) for bamboohealth.com,
 * kyruushealth.com, uniteus.com, findhelp.com; ChatGPT answers via the
 * DataForSEO ChatGPT scraper, web search on, one run per question; a passive
 * crawl of bamboohealth.com and one Lighthouse mobile lab run. */

const row = (cells) => ({ _type: 'tableRow', _key: key(), cells });

const doc = {
  _type: 'proposal',
  _id: `proposal.bamboo-health.${accessToken.slice(0, 10)}`,
  title: 'Bamboo Health, the name AI gives when your buyers ask',
  clientName: 'Bamboo Health',
  preparedFor: ['Lisa Blubaugh'],
  token: accessToken,
  accessCode,
  validUntil: VALID_UNTIL,
  status: STATUS,
  contactEmail: 'arnel@loudface.co',
  design: 'cards',
  promises: ['Navigation and homepage first, full site after', 'Measured in demo requests, not traffic'],
  clipStrip,
  proofRail,
  sections: [
    section('richTextSection', {
      heading: 'Where you are',
      body: [
        para('Bamboo Health runs the PDMP in more than 40 states and reaches 100% of the top 10 hospitals. The website does not say so to a first-time visitor, and AI answers only half-know it.'),
        para([
          { text: 'Your domain has the same authority as Kyruus and Unite Us (Ahrefs DR 70). ' },
          { text: 'It brings in about a quarter of their search traffic.', bold: true },
          { text: ' ChatGPT names you for PDMP vendors and bed registries, but not for opioid risk or nursing-facility alerts: the jobs NarxCare and Pings exist to do.' },
        ]),
      ],
    }),

    section('standingSection', {
      heading: 'Your standing today',
      stats: [
        stat('~1,000', 'US organic visits a month to bamboohealth.com (Ahrefs estimate). Kyruus gets ~4,000.', true),
        stat('5 of 7', 'ChatGPT answers to buyer questions that name Bamboo Health'),
        stat('61', 'Mobile performance score. The homepage loads 2.2 MB and 98 images'),
      ],
      closing: 'The authority is already there. What is missing is pages that say plainly what each product does, for each buyer, in words AI can quote.',
    }),

    section('tableSection', {
      heading: 'What ChatGPT says when your buyers ask',
      note: 'Asked live on 29 September, web search on. One run per question. From today we track 20 of these daily across ChatGPT, Gemini and Google AI Overviews.',
      columns: ['Buyer question', 'Bamboo named?', 'Who else, or what it cites'],
      rows: [
        row(['Best PDMP software vendors for state governments', 'Yes', '—']),
        row(['Best real-time ADT notification platforms for ACOs and health plans', 'Yes', 'PointClickCare, CRISP']),
        row(['Platforms to find open behavioral health beds in real time', 'Yes', 'Behavioral Health Link']),
        row(['Best behavioral health referral software for hospitals and crisis centers', 'Yes', 'Epic, Unite Us, Findhelp']),
        row(['Health IT companies helping states fight the opioid epidemic', 'Yes', '—']),
        row(["Tools to assess a patient's opioid overdose risk before prescribing", 'No', 'CDC only. Says "PDMP" generically. NarxCare is not named']),
        row(['How nursing facilities get notified when a patient is hospitalized', 'No', 'HealthIT.gov and CMS only. No vendor named. Pings is not named']),
      ],
    }),

    section('bulletListSection', {
      heading: 'What we found on the site',
      items: [
        bullet('Two menus fight for the visitor.', 'Product menus (Behavioral Health, Care Coordination, PDMP) sit beside audience menus (Providers, Health Plans, Governments). That is 19 product links, and Bamboo Bridge appears twice.'),
        bullet('Pages name the brand, not the job.', 'The homepage title is "Bamboo Health". Product headings are "NarxCare®" and "Pings™". A state buyer or an AI has to already know the product to understand the page.'),
        bullet('Nothing tells AI what the products are.', 'No Organization, software or FAQ markup, no llms.txt. NarxCare, the flagship, has the thinnest page at 411 words.'),
        bullet('Slow on phones.', 'Mobile score 61 and 4.5 seconds to the main content, driven by marketing tags and 98 homepage images.'),
        bullet('The foundations are good.', 'AI crawlers are allowed, the blog is fresh, and WP Engine, a firewall and a current WordPress are in place. This is a rebuild for clarity and speed, not a rescue.'),
      ],
    }),

    section('tracksSection', {
      heading: 'What we would do',
      intro: 'Your four asks, as one plan. The navigation and homepage go first.',
      tracks: [
        track('Navigation and homepage', [
          trackItem('Weeks 1-6', 'Navigation led by the buyer: states, health systems, health plans. Products sit underneath each'),
          trackItem(null, 'A homepage that says what Bamboo does in its title and first line, with the proof numbers up front'),
          trackItem(null, 'Half the page weight: fewer tags on first load, compressed images'),
        ]),
        track('Full site', [
          trackItem('After launch', 'Every product page rebuilt around the job it does, with FAQs, schema and a clear next step'),
          trackItem(null, 'One design system across products, audiences, news and resources'),
          trackItem(null, 'Marketo, ZoomInfo and your forms carried over and tested'),
        ]),
        track('SEO and AI search', [
          trackItem('Every week', 'Pages that answer the questions buyers ask ChatGPT, starting with opioid risk and nursing-facility alerts'),
          trackItem(null, 'Mentions on the sites AI cites: HealthIT.gov-style guides, HIE and state resources, trade press'),
          trackItem(null, '20 buyer questions tracked daily across ChatGPT, Gemini and Google AI'),
        ]),
        track('Care and security', [
          trackItem('Monthly', 'WordPress, plugin and theme updates, tested before they go live'),
          trackItem(null, 'Security headers, xmlrpc and REST exposure closed'),
          trackItem(null, 'Uptime and speed monitored, with a monthly report'),
        ]),
      ],
    }),

    section('monthsSection', {
      heading: 'The first 90 days',
      intro: 'What you would see, month by month.',
      months: [
        month('Month 1', 'Foundations', ['New navigation and homepage designed', 'Titles, headings and schema fixed site-wide', 'llms.txt and AI baseline', 'First answer pages for NarxCare and Pings'], 'Every page says what it does'),
        month('Month 2', 'Launch', ['Navigation and homepage live', 'Security hardening done', 'Product pages rebuilt one by one', 'Mentions on cited sites'], 'Buyers find the right product in one click'),
        month('Month 3', 'Proof', ['Full-site rebuild under way', 'AI answers re-checked on all 20 questions', 'Demo requests reviewed against the baseline'], 'AI names NarxCare and Pings for their own questions'),
      ],
      note: 'Every report starts with demo requests and AI mentions, then rankings.',
    }),

    section('caseProofSection', {
      heading: 'The same work, for us and for our clients',
      intro: "Ask and we'll put you in touch with one of these clients directly.",
      chartsPerCase: 1,
      slugs: [
        'loudface-aeo-case-study',
        'toku-ai-cited-pipeline',
        'delshad-legal-content-engine',
        'genie-teacher-organic-growth',
        'trademomentum-niche-aeo-organic-growth',
      ],
    }),

    section('bulletListSection', {
      heading: 'Next step',
      band: 'dark',
      items: [
        bullet('Pick the first phase.', 'Navigation and homepage alone, or the full site with SEO, AI search and care from day one.'),
        bullet('We send a proposal.', 'Scope, timeline and pricing for the phase you pick, within a few days of this call.'),
        bullet('Next step', 'Tell us who else should see this, and we will walk them through it.'),
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
