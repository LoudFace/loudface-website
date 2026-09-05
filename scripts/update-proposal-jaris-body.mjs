#!/usr/bin/env node
/**
 * Replace the Jaris proposal BODY with the client-first sections (2026-09-05).
 *
 * The old body was seven sections, four of them about LoudFace. The new one
 * opens every block with Jaris's own numbers from the 2 September standing
 * report, and closes with the price anchored high to low.
 *
 * It backs the current document up to scripts/backups/ before writing, so the
 * old body can be restored with --restore=<file>.
 *
 * Usage:
 *   node -r dotenv/config scripts/update-proposal-jaris-body.mjs --dry-run
 *   node -r dotenv/config scripts/update-proposal-jaris-body.mjs
 *
 * Env: SANITY_PROPOSALS_WRITE_TOKEN, else SANITY_API_TOKEN.
 */

import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { createClient } from '@sanity/client';

const args = process.argv.slice(2);
const has = (n) => args.includes(`--${n}`);
const flag = (n) => {
  const hit = args.find((a) => a.startsWith(`--${n}=`));
  return hit ? hit.slice(n.length + 3) : undefined;
};

const DOC_ID = 'proposal.jaris.jf4b9vvdjf';
const token = process.env.SANITY_PROPOSALS_WRITE_TOKEN || process.env.SANITY_API_TOKEN;
if (!token) {
  console.error('No write token. Set SANITY_PROPOSALS_WRITE_TOKEN or SANITY_API_TOKEN.');
  process.exit(1);
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'xjjjqhgt',
  dataset: process.env.SANITY_PROPOSALS_DATASET || 'proposals',
  apiVersion: '2025-03-29',
  token,
  useCdn: false,
});

const HERO_QUOTE =
  'If they are looking for embedded finance themselves, they are gonna start doing that research. And if we are not even popping up as an option, then obviously we are missing opportunities there.';

const sections = [
  {
    _key: 'ask-2026-09',
    _type: 'askAiSection',
    heading: 'What your buyers ask, and who gets named',
    intro: 'Each question asked 30 times across ChatGPT, Google AI Overview and Gemini.',
    questions: [
      { _key: 'aq1', question: 'Best embedded lending platforms for payment processors', short: 'Payment processors', vendors: [
        { _key: 'v1', name: 'Parafin', share: 90 }, { _key: 'v2', name: 'Kanmon', share: 67 }, { _key: 'v3', name: 'YouLend', share: 43 }, { _key: 'v4', name: 'Liberis', share: 37 }, { _key: 'v5', name: 'Lendflow', share: 23 }, { _key: 'v6', name: 'Jaris', share: 0 } ] },
      { _key: 'aq2', question: 'Top embedded working capital providers for US payment facilitators', short: 'Payment facilitators', vendors: [
        { _key: 'v1', name: 'Parafin', share: 100 }, { _key: 'v2', name: 'Kanmon', share: 73 }, { _key: 'v3', name: 'Liberis', share: 70 }, { _key: 'v4', name: 'YouLend', share: 60 }, { _key: 'v5', name: 'Jaris', share: 0 } ] },
      { _key: 'aq3', question: 'Best embedded capital providers for vertical SaaS platforms', short: 'Vertical SaaS', vendors: [
        { _key: 'v1', name: 'Parafin', share: 100 }, { _key: 'v2', name: 'Kanmon', share: 77 }, { _key: 'v3', name: 'Liberis', share: 57 }, { _key: 'v4', name: 'YouLend', share: 57 }, { _key: 'v5', name: 'Jaris', share: 0 } ] },
      { _key: 'aq4', question: 'Leading embedded finance companies for small business platforms', short: 'SMB platforms', vendors: [
        { _key: 'v1', name: 'Parafin', share: 62 }, { _key: 'v2', name: 'Kanmon', share: 38 }, { _key: 'v3', name: 'Liberis', share: 21 }, { _key: 'v4', name: 'YouLend', share: 14 }, { _key: 'v5', name: 'Jaris', share: 0 } ] },
      { _key: 'aq5', question: 'Which companies help ISOs offer working capital to merchants?', short: 'ISOs', vendors: [
        { _key: 'v1', name: 'Liberis', share: 17 }, { _key: 'v2', name: 'Fundbox', share: 7 }, { _key: 'v3', name: 'Lendio', share: 7 }, { _key: 'v4', name: 'YouLend', share: 7 }, { _key: 'v5', name: 'Parafin', share: 3 }, { _key: 'v6', name: 'Jaris', share: 0 } ] },
    ],
  },
  {
    _key: 'standing-2026-09',
    _type: 'standingSection',
    heading: 'Where Jaris stands, and why',
    stats: [
      { _key: 's1', value: '2.0%', label: 'of AI answers name Jaris. Parafin: 26.7%', lead: true },
      { _key: 's2', value: '64 / 75', label: 'buyer questions with no Jaris' },
      { _key: 's3', value: '2.9', label: 'average position when Jaris is named', lead: true },
    ],
    closing:
      'The product is not the problem: when an assistant names Jaris it names it before Kanmon, Liberis and YouLend. Product pages are the most cited page type in this category, 1,060 times, and Jaris has one overview page covering five products.',
  },
  {
    _key: 'forecast-2026-09',
    _type: 'forecastSection',
    heading: 'What each month returns',
    todayLine: 'Today it is zero.',
    shareOfVoice: { min: 2, max: 20, value: 12, note: 'now 2.5%' },
    impressions: { min: 0, max: 30000, step: 1000, value: 15000, note: 'now ~500' },
    conversion: { min: 0.5, max: 5, step: 0.1, value: 2 },
    assumptions: { aiQuestionsPerMonth: 2000, aiClickRate: 10, googleCtr: 2.5, ramp: [0.1, 0.35, 0.7, 1, 1, 1] },
  },
  {
    _key: 'tracks-2026-09',
    _type: 'tracksSection',
    heading: 'What you get',
    intro: 'Three tracks in parallel from week one. Content, design, development and reporting included.',
    tracks: [
      { _key: 't1', label: 'On your site', items: [
        { _key: 'i1', count: '5', text: 'Product pages, one for each product' },
        { _key: 'i2', count: '3', text: 'Solution pages: ISOs, payment service providers, vertical SaaS' },
        { _key: 'i3', count: '1–2 a day', text: 'Articles from your own material: underwriting, settlement mechanics, the bank programme' },
        { _key: 'i4', count: 'Month 3', text: 'Comparison and alternatives pages' } ] },
      { _key: 't2', label: 'Off your site', items: [
        { _key: 'i1', count: '2–3 a week', text: 'Placements on the pages these answers are built from' },
        { _key: 'i2', text: 'Category listicles first, then directories and comparison pages' } ] },
      { _key: 't3', label: 'Your website', items: [
        { _key: 'i1', count: 'Month 1', text: 'Rebuilt on a modern stack with the pages above, keys handed to you' },
        { _key: 'i2', count: 'Week 1', text: 'Canonical tags, the duplicate domain, sitemap, H1s and schema' } ] },
    ],
  },
  {
    _key: 'engagement-2026-09',
    _type: 'timelineSection',
    variant: 'engagementLoop',
    heading: 'How we work',
    gateLabel: 'Compliance gate',
    gate: {
      body: 'Anything touching rates, loan terms, the bank relationship, FDIC or NMLS language comes to Jaris before it publishes. Permanently.',
      items: [
        'The first five articles are written and reviewed with you, to lock voice and claims.',
        'Everything else publishes independently, so volume does not sit on your calendar.',
      ],
    },
    showWeek: true,
    items: [],
  },
  {
    _key: 'months-2026-09',
    _type: 'monthsSection',
    heading: 'The first 90 days',
    intro: 'Contractual minimums. We ship above them.',
    months: [
      { _key: 'm1', label: 'Month 1', items: ['Technical fixes', 'New website live', '5 product pages', '5 calibration articles'], proves: 'One domain, pages cited' },
      { _key: 'm2', label: 'Month 2', items: ['20+ articles', '3 solution pages', '8–12 placements'], proves: 'AI share of voice moves' },
      { _key: 'm3', label: 'Month 3', items: ['20+ articles', 'Comparison pages', '8–12 placements'], proves: 'First leads attributed' },
    ],
  },
  {
    _key: 'cases-2026-09',
    _type: 'caseProofSection',
    heading: 'The same work, at four other companies',
    slugs: [
      'delshad-legal-content-engine',
      'genie-teacher-organic-growth',
      'toku-ai-cited-pipeline',
      'trademomentum-niche-aeo-organic-growth',
    ],
    chartsPerCase: 1,
  },
  {
    _key: 'price-2026-09',
    _type: 'pricingTiersSection',
    band: 'dark',
    heading: 'Investment',
    anchor:
      '“Embedded lending platform” costs $56.28 a click on Google. $5,000 buys 89 clicks. The same money here buys the pages, the placements and the site.',
    tiers: [
      { _key: 'tier-accelerate', name: 'Accelerate', price: '$15,000', cadence: 'per month', description: 'Triple velocity and dedicated outreach.' },
      { _key: 'tier-scale', name: 'Scale', price: '$10,000', cadence: 'per month', description: 'Double the content and outreach velocity.' },
      { _key: 'tier-growth', name: 'Growth', price: '$5,000', cadence: 'per month', description: '1–2 articles a day, 2–3 placements a week, website build included, full reporting.', recommended: true },
    ],
    note: 'For $5,000 you get the whole team. Anything beyond this at your stage is redundant. 3-month minimum, then month to month. No setup fee.',
  },
  {
    _key: 'terms-2026-09',
    _type: 'bulletListSection',
    band: 'dark',
    heading: 'Terms and next step',
    items: [
      { _key: 'tm1', lead: 'You own everything.', text: 'Website, content, CMS, tracking. If we stop after three months you keep all of it and we train your team on it.' },
      { _key: 'tm2', lead: 'MSA plus a short order form', text: 'covering scope and the agreed monthly lead target.' },
      { _key: 'tm3', lead: 'Kickoff within 48 hours', text: 'of signature. Technical fixes and the first content start in week one.' },
      { _key: 'tm4', lead: 'Next step:', text: 'agree the lead target, sign, and we start that week.' },
    ],
  },
];

const patch = {
  heroQuote: HERO_QUOTE,
  heroQuoteBy: 'Matt Thomas, on our call, 2 September 2026',
  sections,
};

const restore = flag('restore');
if (restore) {
  const saved = JSON.parse(readFileSync(restore, 'utf8'));
  await client.patch(DOC_ID).set({ sections: saved.sections, heroQuote: saved.heroQuote ?? null, heroQuoteBy: saved.heroQuoteBy ?? null }).commit();
  console.log(`Restored the body from ${restore}.`);
  process.exit(0);
}

const current = await client.getDocument(DOC_ID);
if (!current) {
  console.error(`No document ${DOC_ID} in the proposals dataset.`);
  process.exit(1);
}

mkdirSync('scripts/backups', { recursive: true });
const backup = `scripts/backups/jaris-body-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '')}.json`;
writeFileSync(backup, JSON.stringify(current, null, 2));
console.log(`Backed up the current document to ${backup}`);
console.log(`Old body: ${current.sections?.length ?? 0} sections. New body: ${sections.length} sections.`);

if (has('dry-run')) {
  console.log('Dry run — nothing written.');
  process.exit(0);
}

await client.patch(DOC_ID).set(patch).commit();
console.log('Body replaced. Restore with:');
console.log(`  node -r dotenv/config scripts/update-proposal-jaris-body.mjs --restore=${backup}`);
