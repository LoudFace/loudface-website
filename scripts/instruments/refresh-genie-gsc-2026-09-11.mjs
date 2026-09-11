/**
 * Refresh the Genie Teacher case study with Google Search Console data to
 * 8 Sep 2026 (the latest day the API reports on 11 Sep 2026).
 *
 * Input: a day-level GSC pull for sc-domain:genieteacher.com, made with the
 * content-engine's gsc-cli (search-analytics --dimensions date), passed as
 * --gsc <path>. Raw counts never leave this script: every published value is
 * indexed to the average day of May 2026 (= 100), the baseline the live chart
 * already uses. Recomputing the shipped points from this formula reproduces
 * them exactly (checked 2026-09-11, six most recent points), so old and new
 * points are one series.
 *
 *   node scripts/instruments/refresh-genie-gsc-2026-09-11.mjs --gsc <file>          # dry run
 *   node scripts/instruments/refresh-genie-gsc-2026-09-11.mjs --gsc <file> --write  # patch the PUBLISHED doc
 *
 * The patch touches, in one transaction on the published _id:
 *   instruments.indexedTrend.points / caption, instruments.gscSource,
 *   charts[0] (the fallback growth curve — kept in step so it can never
 *   contradict the board), result1..3, paragraphSummary, faq[2..3], mainBody.
 * Peec AI figures are left as dated (25 May – 24 Aug 2026); this refresh is
 * the Google curve only.
 *
 * Backup of the pre-refresh document: scripts/backups/genie-casestudy-pre-2026-09-11.json
 */
import { createClient } from '@sanity/client';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const gscPath = args[args.indexOf('--gsc') + 1];
if (!gscPath || args.indexOf('--gsc') < 0) {
  console.error('--gsc <path to gsc-cli --dimensions date --json output> is required');
  process.exit(1);
}

let token = process.env.SANITY_API_TOKEN;
if (!token && existsSync(join(here, '../../.env.local'))) {
  const env = Object.fromEntries(
    readFileSync(join(here, '../../.env.local'), 'utf8')
      .split('\n')
      .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
      .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
  );
  token = env.SANITY_API_TOKEN;
}
if (!token) {
  console.error('SANITY_API_TOKEN missing (run through scripts/with-secrets.sh)');
  process.exit(1);
}

const client = createClient({
  projectId: 'xjjjqhgt',
  dataset: 'production',
  apiVersion: '2025-03-29',
  token,
  useCdn: false,
});

const DOC_ID = 'caseStudy-genie-teacher-organic-growth';
const START = '2026-04-13';
const END = '2026-09-08';
const BASELINE_MONTH = '2026-05';
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

/* ── Index the daily series ─────────────────────────────────────────── */
const raw = JSON.parse(readFileSync(gscPath, 'utf8')).rows
  .map((r) => ({ date: r.keys[0], impressions: r.impressions, clicks: r.clicks, position: r.position }))
  .sort((a, b) => a.date.localeCompare(b.date));
const byDate = new Map(raw.map((r) => [r.date, r]));

const may = raw.filter((r) => r.date.startsWith(BASELINE_MONTH));
if (may.length !== 31) throw new Error(`May 2026 has ${may.length} days in the pull, expected 31`);
const baseImp = may.reduce((s, r) => s + r.impressions, 0) / 31;
const baseClk = may.reduce((s, r) => s + r.clicks, 0) / 31;

const addDays = (iso, n) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

const points = [];
for (let d = START, i = 0; d <= END; d = addDays(d, 1), i++) {
  const r = byDate.get(d);
  if (!r) throw new Error(`no GSC row for ${d}; the series must be consecutive`);
  points.push({
    _key: `d-${i}`,
    date: d,
    month: MONTHS[Number(d.slice(5, 7)) - 1],
    impressions: Math.round((r.impressions / baseImp) * 100),
    clicks: Math.round((r.clicks / baseClk) * 100),
  });
}

/* Multipliers quoted in the copy — derived here so the text and the data
   cannot drift apart. Printed in the plan; never shipped as raw counts. */
const sum = (rows, k) => rows.reduce((s, r) => s + r[k], 0);
const month = (m) => raw.filter((r) => r.date.startsWith(m));
const perDay = (m) => sum(month(m), 'impressions') / month(m).length;
const sep = raw.filter((r) => r.date >= '2026-09-01' && r.date <= END);
const last7 = raw.filter((r) => r.date > addDays(END, -7) && r.date <= END);
const stats = {
  impPerDayMayToAug: perDay('2026-08') / perDay('2026-05'),
  impPerDayMayToSep: sum(sep, 'impressions') / sep.length / perDay('2026-05'),
  impLastDayVsMay: byDate.get(END).impressions / perDay('2026-05'),
  impAugVsApr: sum(month('2026-08'), 'impressions') / sum(month('2026-04'), 'impressions'),
  impSepVsApr: sum(sep, 'impressions') / sum(month('2026-04'), 'impressions'),
  impJulYoY: sum(month('2026-07'), 'impressions') / sum(month('2025-07'), 'impressions'),
  impAugYoY: sum(month('2026-08'), 'impressions') / sum(month('2025-08'), 'impressions'),
  impSepVsWholeSep25: sum(sep, 'impressions') / sum(month('2025-09'), 'impressions'),
  sepImpBeatsAug: sum(sep, 'impressions') > sum(month('2026-08'), 'impressions'),
  sepClkBeatsAug: sum(sep, 'clicks') > sum(month('2026-08'), 'clicks'),
  clicksWeekVsMayAvg: sum(last7, 'clicks') / (sum(month('2026-05'), 'clicks') / 31 * 7),
  posAug: month('2026-08').reduce((s, r) => s + r.position * r.impressions, 0) / sum(month('2026-08'), 'impressions'),
  posSep: sep.reduce((s, r) => s + r.position * r.impressions, 0) / sum(sep, 'impressions'),
};

/* ── Copy ───────────────────────────────────────────────────────────── */
const mainBody = readFileSync(join(here, 'genie-mainBody-2026-09-11.html'), 'utf8').trim();

const patch = {
  'instruments.gscSource': 'Google Search Console · indexed to May 2026 = 100 · to 8 Sep 2026',
  'instruments.indexedTrend.points': points,
  'instruments.indexedTrend.caption':
    'Impressions per day rose 28× from May to August and 113× over the first eight days of September (to 8 Sep, the latest day Search Console reports). No data for Jan–Mar, so the series starts in April.',
  'charts[0].data': [
    { _key: 'gc-may', _type: 'object', label: 'May', value: 3, displayValue: 'baseline' },
    { _key: 'gc-jun', _type: 'object', label: 'Jun', value: 8, displayValue: '+132%' },
    { _key: 'gc-jul', _type: 'object', label: 'Jul', value: 20, displayValue: '+487%' },
    { _key: 'gc-aug', _type: 'object', label: 'Aug', value: 97, displayValue: '+2,728%' },
    { _key: 'gc-sep', _type: 'object', label: 'Sep', value: 100, displayValue: '+2,825% in 8 days' },
  ],
  'charts[0].legendPrimary':
    'May to September 2026, indexed to May; the September bucket is its first 8 days only. Source: Google Search Console.',
  result1Number: '113×',
  result1Title: 'Google impressions per day, May 2026 average → 1–8 Sep 2026',
  result2Number: '16×',
  result2Title: 'Google clicks per week, May 2026 average → week ending 8 Sep 2026',
  result3Number: '2.26% → 12.94%',
  result3Title: 'AI share of voice, 25 May → 24 Aug 2026 (Peec AI)',
  paragraphSummary:
    "Genie Teacher's Google impressions per day rose 28× from May to August 2026 and 113× by the first week of September, clicks per week climbed 16× on the May average, and the average position moved from 11.5 to 7.4. In AI search its share of voice grew from 2.26% to 12.94% between 25 May and 24 August 2026, at an average mention rank of 1.0 to 1.4.",
  'faq[2].answer':
    'Impressions roughly doubled every month through the spring of 2026, then went vertical: August 2026 ran 24× above August 2025, and the first eight days of September 2026 out-earned the whole of August on both impressions and clicks.',
  'faq[3].answer':
    'Because the brand is early-stage and visibility grows first. The click curve has now formed behind it: clicks per week are 16× the May 2026 average and the average position has moved from 11.5 in August to 7.4 in September. We publish the numbers as they are and update this page as they move.',
  mainBody,
};

/* ── Plan / write ───────────────────────────────────────────────────── */
console.log(`Baseline: average May 2026 day = 100 (impressions ${baseImp.toFixed(2)}/day, clicks ${baseClk.toFixed(3)}/day — not shipped)`);
console.log(`Points: ${points.length} daily, ${points[0].date} → ${points.at(-1).date}; last = imp ${points.at(-1).impressions}, clk ${points.at(-1).clicks}`);
console.log('Multipliers behind the copy:');
for (const [k, v] of Object.entries(stats)) console.log(`  ${k}: ${typeof v === 'number' ? v.toFixed(2) : v}`);

const doc = await client.getDocument(DOC_ID);
if (!doc) throw new Error('published doc not found');
const draft = await client.getDocument(`drafts.${DOC_ID}`);
if (draft) {
  console.error('A draft exists for this document — refusing to patch under a pending human edit.');
  process.exit(1);
}
console.log(`Current _rev ${doc._rev}, updated ${doc._updatedAt}; last shipped point ${doc.instruments.indexedTrend.points.at(-1).date}`);

// Guard: every already-shipped point must reproduce from the new pull.
const old = new Map(doc.instruments.indexedTrend.points.map((p) => [p.date, p]));
let drift = 0;
for (const p of points) {
  const o = old.get(p.date);
  if (o && (Math.abs(o.impressions - p.impressions) > 1 || Math.abs(o.clicks - p.clicks) > 1)) drift++;
}
console.log(`Drift against shipped points: ${drift} (tolerance ±1 from rounding)`);
if (drift > 0) {
  console.error('Shipped points do not reproduce — investigate before writing.');
  process.exit(1);
}

if (!WRITE) {
  console.log('\nDry run. Fields to set:', Object.keys(patch).join(', '));
  process.exit(0);
}

const res = await client.patch(DOC_ID).set(patch).commit();
console.log(`✓ patched ${res._id} → _rev ${res._rev}`);
