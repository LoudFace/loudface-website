#!/usr/bin/env node
/**
 * Lead-growth instruments — 2026-09-02
 *
 * Adds the `instruments.leadGrowth` cell to the three case studies whose
 * PostHog history supports a published lead multiplier. Source data was read
 * directly from each client's PostHog project on 2026-09-02.
 *
 * ONE METHOD, APPLIED IDENTICALLY TO ALL THREE:
 *   baseline = the mean of every complete tracked week BEFORE August 2026
 *   result   = the mean of August's complete weeks
 *   multiple = result / baseline
 *
 * Why this rule and not a better-looking one: any "first N vs last N" or
 * trough-anchored comparison lets the window be chosen after seeing the data.
 * Anchoring both ends to calendar boundaries fixed in advance removes that
 * choice. It costs us headline size on all three studies and is the only
 * version defensible if a prospect asks how it was computed.
 *
 * Partial weeks are excluded everywhere. The week of 30 Aug held 3-4 days of
 * data when this ran and would read as a collapse on the chart.
 *
 * CONFIDENTIALITY: `points` are INDEXED to each study's own baseline = 100.
 * No absolute enquiry count reaches Sanity, the page, or the DOM.
 *
 * Usage:
 *   node scripts/add-lead-growth-2026-09-02.mjs --dry-run
 *   node scripts/add-lead-growth-2026-09-02.mjs
 *
 * Idempotency: writes the whole leadGrowth object each run, so rerunning
 * overwrites rather than accumulating.
 */

import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@sanity/client';

const ROOT = '/Users/arnel/Code Projects/LoudFace Agency/loudface-website';
const DRY_RUN = process.argv.includes('--dry-run');

const env = Object.fromEntries(
  fs
    .readFileSync(path.join(ROOT, '.env.local'), 'utf8')
    .split('\n')
    .map((l) => l.trim().match(/^([A-Z_]+)=(.*)$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2]]),
);

if (!env.SANITY_API_TOKEN) {
  console.error('Missing SANITY_API_TOKEN in .env.local');
  process.exit(1);
}

const sanity = createClient({
  projectId: 'xjjjqhgt',
  dataset: 'production',
  apiVersion: '2025-03-29',
  useCdn: false,
  token: env.SANITY_API_TOKEN,
});

/* Raw weekly counts, straight from PostHog. Kept here rather than pre-indexed
   so the arithmetic below is auditable against the source. Weeks start Sunday
   (ClickHouse toStartOfWeek). Zero weeks are written explicitly — PostHog omits
   them from a GROUP BY, and dropping them would silently inflate the mean. */
const STUDIES = [
  {
    id: 'caseStudy-delshad-legal-content-engine',
    label: 'Delshad Legal',
    // PostHog project 463077, event `lead_form_submitted` (case-review form).
    weeks: [
      ['2026-06-07', 3], ['2026-06-14', 6], ['2026-06-21', 6], ['2026-06-28', 3],
      ['2026-07-05', 3], ['2026-07-12', 7], ['2026-07-19', 12], ['2026-07-26', 7],
      ['2026-08-02', 17], ['2026-08-09', 10], ['2026-08-16', 17], ['2026-08-23', 9],
    ],
    title: 'Case enquiries per week, indexed',
    multipleLabel: 'more case enquiries a week, against the weeks before August',
    baselineLabel: 'every tracked week before August',
    caption:
      'Weekly enquiries from the case-review form, indexed so the climb is public and the firm’s caseload is not. Tracking began the week the new site went live.',
    source: 'PostHog · 9 Jun – 29 Aug 2026',
  },
  {
    id: 'caseStudy-genie-teacher-organic-growth',
    label: 'Genie Teacher',
    // PostHog project 494016, event `generate_lead` (live from 19 Jul 2026).
    weeks: [
      ['2026-07-19', 6], ['2026-07-26', 13],
      ['2026-08-02', 2], ['2026-08-09', 16], ['2026-08-16', 20], ['2026-08-23', 14],
    ],
    title: 'Lead requests per week, indexed',
    multipleLabel: 'more lead requests a week, against the weeks before August',
    baselineLabel: 'every tracked week before August',
    caption:
      'Weekly lead requests since the new lead flow shipped, indexed to its opening fortnight. The dip in the first week of August is real and left in.',
    source: 'PostHog · 19 Jul – 29 Aug 2026',
  },
  {
    id: 'caseStudy-loudface-aeo-case-study',
    label: 'LoudFace',
    /* PostHog project 237873, `call_booked` (Cal.com webhook, a real booking
       rather than a button click) + `audit_form_submitted`.
       MONTHLY, not weekly, and deliberately: our own weekly series carries a
       launch spike in April and single-booking weeks all summer, so a weekly
       chart argues against its own multiplier. Months are the honest bucket
       for a series this thin. */
    monthly: true,
    weeks: [
      ['2026-04-01', 14], ['2026-05-01', 16], ['2026-06-01', 8], ['2026-07-01', 8],
      ['2026-08-01', 25],
    ],
    title: 'Sales calls booked per month, indexed',
    multipleLabel: 'more sales calls booked, against the months before August',
    baselineLabel: 'every tracked month before August',
    caption:
      'Calls booked through the site, indexed. Counted from the Cal.com booking webhook, so each one is a call actually on the calendar, not a click on a button.',
    source: 'PostHog + Cal.com · Apr – Aug 2026',
  },
];

function build(study) {
  const cut = '2026-08-01';
  const before = study.weeks.filter(([w]) => w < cut);
  const during = study.weeks.filter(([w]) => w >= cut);

  if (!before.length || !during.length) {
    throw new Error(`${study.label}: needs points on both sides of ${cut}`);
  }

  const mean = (rows) => rows.reduce((t, [, v]) => t + v, 0) / rows.length;
  const baseline = mean(before);
  const multiple = mean(during) / baseline;

  return {
    _type: 'object',
    title: study.title,
    multiple: `${multiple.toFixed(1)}×`,
    multipleLabel: study.multipleLabel,
    baselineLabel: study.baselineLabel,
    caption: study.caption,
    source: study.source,
    points: study.weeks.map(([week, value]) => ({
      _key: `lg-${week}`,
      _type: 'object',
      week,
      value: Math.round((value / baseline) * 100),
    })),
  };
}

const run = async () => {
  for (const study of STUDIES) {
    const leadGrowth = build(study);
    console.log(
      `\n${study.label}  ${leadGrowth.multiple}  (${study.monthly ? 'monthly' : 'weekly'}, ${leadGrowth.points.length} points)`,
    );
    console.log(`  indexed: ${leadGrowth.points.map((p) => p.value).join(' ')}`);

    if (DRY_RUN) continue;

    await sanity.patch(study.id).set({ 'instruments.leadGrowth': leadGrowth }).commit();
    console.log('  written');
  }
  console.log(DRY_RUN ? '\nDry run — nothing written.' : '\nDone.');
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
