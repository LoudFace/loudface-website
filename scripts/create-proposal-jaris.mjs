#!/usr/bin/env node
/**
 * Seed the Jaris proposal into the PRIVATE `proposals` Sanity dataset.
 *
 * Ported from the Notion page it replaces:
 *   https://app.notion.com/p/3d0b63394d108105a055cb581c402977
 *
 * The Notion page also carries four case-study videos and a review-links line.
 * There is no video block in the `proposal` schema, so those are deliberately
 * not ported — send them the way you always have, or add a block type first.
 *
 * Usage:
 *   node scripts/create-proposal-jaris.mjs --dry-run
 *   node scripts/create-proposal-jaris.mjs
 *   node scripts/create-proposal-jaris.mjs --status=sent --valid-until=2026-10-03
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
const VALID_UNTIL = flag('valid-until', '2026-10-03');

/* ── token + code ─────────────────────────────────────────────────────── */
/* Kept in step with src/lib/proposal-token.ts — same alphabets, same lengths.
   Duplicated rather than imported because this script runs on plain node. */

const TOKEN_ALPHABET = 'abcdefghijkmnpqrstuvwxyz23456789';
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const pick = (alphabet, length) =>
  Array.from(randomBytes(length), (byte) => alphabet[byte & 31]).join('');

const accessToken = flag('token', pick(TOKEN_ALPHABET, 26));
const accessCode = flag('code', `${pick(CODE_ALPHABET, 4)}-${pick(CODE_ALPHABET, 4)}`);

/* ── portable text helpers ────────────────────────────────────────────── */

const key = () => randomUUID().slice(0, 12);

/** A paragraph. Pass a string, or [{text, bold}] runs for inline emphasis. */
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
const row = (...cells) => ({ _type: 'tableRow', _key: key(), cells });
const step = (label, body) => ({ _type: 'timelineItem', _key: key(), label, body });
const tier = (name, price, cadence, description, recommended = false) => ({
  _type: 'pricingTier',
  _key: key(),
  name,
  price,
  cadence,
  description,
  recommended,
});
const section = (type, fields) => ({ _type: type, _key: key(), ...fields });

/* ── the document ─────────────────────────────────────────────────────── */

const doc = {
  _type: 'proposal',
  _id: `proposal.jaris.${accessToken.slice(0, 10)}`,
  title: 'Jaris x LoudFace: AI visibility and organic growth',
  clientName: 'Jaris',
  preparedFor: ['Matt Thomas', 'Jenna Cheng'],
  token: accessToken,
  accessCode,
  validUntil: VALID_UNTIL,
  status: STATUS,
  contactEmail: 'arnel@loudface.co',
  priceLine: '$5,000/mo flat. 3-month minimum, then month to month.',
  heroSummary: [
    para([{ text: '3-month engagement · everything included · no setup fee', bold: true }]),
    para(
      'We make Jaris one of the names an AI assistant returns when a payment processor, ISO or vertical SaaS platform asks who to use for embedded lending.'
    ),
  ],
  sections: [
    section('richTextSection', {
      heading: 'Where you are',
      body: [
        para(
          'The full picture is in the report we sent. The short version: Jaris is named in 2% of AI answers to buyer questions, against 27% for Parafin, and in none of the 356 answers about embedded capital for vertical SaaS platforms.'
        ),
        para(
          'The cause is not the product. When an assistant does name Jaris it puts it at position 2.9, ahead of Kanmon, Liberis and YouLend. There is just very little published for a model to find. Ten marketing pages, no product pages, and no presence on the third-party lists these answers are built from.'
        ),
      ],
    }),
    section('richTextSection', {
      heading: 'What we do',
      body: [
        para([
          { text: 'On your site. ', bold: true },
          {
            text: 'A page for each of the five products, solution pages for ISOs, payment service providers and vertical SaaS, and one to two articles a day written from your own material. Your underwriting approach, your settlement mechanics, the bank programme. Generic content does not get cited.',
          },
        ]),
        para([
          { text: 'Off your site. ', bold: true },
          {
            text: 'Two to three high-authority placements a week, aimed at the pages that already decide these answers. Category listicles first, then directories and comparison pages.',
          },
        ]),
        para([
          { text: 'Your website. ', bold: true },
          {
            text: 'We rebuild it on a modern stack with the pages the strategy needs, and hand you the keys. Design concepts are attached separately.',
          },
        ]),
      ],
    }),
    section('bulletListSection', {
      heading: 'How content review works',
      intro: 'You are a lender, so content cannot go out unchecked.',
      items: [
        bullet(null, 'The first five articles are written and reviewed with you, to lock voice and claims.'),
        bullet(
          null,
          'Anything touching rates, loan terms, the bank relationship, FDIC or NMLS language comes to you before it publishes. Permanently, not just during calibration.'
        ),
        bullet(null, 'Everything else publishes independently, so volume does not sit on your calendar.'),
        bullet(null, 'Anything published stays editable and we change it the same day you ask.'),
      ],
    }),
    section('timelineSection', {
      heading: 'The first 90 days',
      intro: 'Contractual minimums. We consistently ship above these.',
      items: [
        step(
          'Month 1',
          'Technical fixes in week one: canonical tags, the duplicate domain, sitemap, H1s and schema. New website live. Five calibration articles. Five product pages. Baseline tracking live.'
        ),
        step(
          'Month 2',
          '20+ articles. Three solution pages: ISO, PSP, vertical SaaS. 8-12 off-site placements. First movement in AI visibility.'
        ),
        step(
          'Month 3',
          '20+ articles. Comparison and alternatives pages. 8-12 further placements. First inbound leads attributed.'
        ),
      ],
    }),
    section('richTextSection', {
      body: [
        para(
          'All content, design, development, imagery, technical work and reporting are included. No separate fees.'
        ),
      ],
    }),
    section('bulletListSection', {
      heading: 'How we measure',
      intro: 'Pipeline first.',
      items: [
        bullet('Leads booked', 'through the site, tracked and attributed. The primary number.'),
        bullet(
          'AI visibility and share of voice',
          'across ChatGPT, Google AI Overview, Gemini and Perplexity, against the same competitors as the report.'
        ),
        bullet('Sentiment', '— how the models describe Jaris, not just whether they mention it.'),
        bullet(null, 'Google impressions, clicks and positions.'),
      ],
    }),
    section('richTextSection', {
      body: [
        para(
          'A live dashboard that refreshes every morning, a written report every Friday, Slack through the week, and a call every second week.'
        ),
      ],
    }),
    section('pricingTiersSection', {
      heading: 'Investment',
      tiers: [
        tier(
          'Growth',
          '$5,000',
          'per month',
          '1-2 articles a day, 2-3 placements a week, website build included, full reporting.',
          true
        ),
        tier('Scale', '$10,000', 'per month', 'Double the content and outreach velocity.'),
        tier('Accelerate', '$15,000', 'per month', 'Triple velocity and dedicated outreach.'),
      ],
      note: 'For $5,000 you get our entire team: strategists, writers, designers, developers and outreach. One contract, no setup or build fee. We recommend this package — anything beyond it at your current stage is redundant.',
    }),
    section('tableSection', {
      heading: 'What the number covers',
      columns: ['Included', 'Detail'],
      rows: [
        row('On-site content', '1-2 articles a day, product pages, solution pages, comparison pages.'),
        row('Off-site', '2-3 high-authority placements a week, listicles first, then directories.'),
        row('Website', 'Full rebuild on a modern stack, design and development included, keys handed over.'),
        row('Reporting', 'Live dashboard, written report every Friday, call every second week.'),
      ],
      note: 'No setup fee, no build fee, no separate design or development invoice.',
    }),
    section('bulletListSection', {
      heading: 'Terms and next step',
      items: [
        bullet(
          '3-month minimum',
          ', billed monthly in USD, then month to month. The minimum is there so the work gets a fair shot at proving itself.'
        ),
        bullet(
          'Master Services Agreement',
          'plus a short order form covering scope and the agreed lead target.'
        ),
        bullet(
          'Kickoff within 48 hours',
          'of signature. Technical fixes and the first content start in week one.'
        ),
        bullet(
          'You own everything.',
          'Website, content, CMS, tracking. If we stop after three months you keep all of it and we train your team on it.'
        ),
      ],
    }),
    section('richTextSection', {
      body: [para('Next step: agree the lead target, sign the MSA, and we start that week.')],
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
  console.error(
    'Missing SANITY_PROPOSALS_WRITE_TOKEN (or SANITY_API_TOKEN). See docs/PROPOSALS.md.'
  );
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
