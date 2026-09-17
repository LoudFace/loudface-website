/**
 * Refresh the Genie Teacher case study with every source to mid-September 2026:
 * Google Search Console to 15 Sep, Peec AI weekly to the week of 7 Sep (plus the
 * 30 days to 17 Sep for the per-engine and per-topic copy), PostHog leads and
 * bookings to the complete week of 6 Sep.
 *
 * Inputs (all raw pulls made through content-engine CLIs, saved beside the
 * research brief at content-engine/.claude/research/loudface/genie-teacher-organic-growth/):
 *   --gsc <daily gsc-cli --dimensions date --json output>
 *   --peec-weeks <folder of weekly brand-report JSONs named YYYY-MM-DD.json>
 *
 * Raw counts never leave this script: every published Google value is indexed
 * to the average May 2026 day (= 100), every lead value to the pre-September
 * weekly mean (= 100). Recomputing the already-shipped points reproduces them
 * (guarded below), so old and new points are one series.
 *
 *   node scripts/instruments/refresh-genie-2026-09-18.mjs --gsc <f> --peec-weeks <dir>          # dry run
 *   node scripts/instruments/refresh-genie-2026-09-18.mjs --gsc <f> --peec-weeks <dir> --write  # patch the PUBLISHED doc
 *
 * Backup of the pre-refresh document: scripts/backups/genie-casestudy-pre-2026-09-18.json
 * Lead and booking weekly counts are transcribed from PostHog (project 494016)
 * as read on 18 Sep 2026; the queries are in the research brief (F9, F10).
 */
import { createClient } from '@sanity/client';
import { readFileSync, readdirSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const arg = (k) => (args.indexOf(k) >= 0 ? args[args.indexOf(k) + 1] : null);
const gscPath = arg('--gsc');
const peecDir = arg('--peec-weeks');
if (!gscPath || !peecDir) {
  console.error('--gsc <daily gsc json> and --peec-weeks <dir> are required');
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

const client = createClient({ projectId: 'xjjjqhgt', dataset: 'production', apiVersion: '2025-03-29', token, useCdn: false });

const DOC_ID = 'caseStudy-genie-teacher-organic-growth';
const START = '2026-04-13';
const END = '2026-09-15';
const BASELINE_MONTH = '2026-05';
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const r1 = (n) => Math.round(n * 10) / 10;

/* ── Google: index the daily series ─────────────────────────────────── */
const raw = JSON.parse(readFileSync(gscPath, 'utf8')).rows
  .map((r) => ({ date: r.keys[0], impressions: r.impressions, clicks: r.clicks, position: r.position }))
  .sort((a, b) => a.date.localeCompare(b.date));
const byDate = new Map(raw.map((r) => [r.date, r]));
const may = raw.filter((r) => r.date.startsWith(BASELINE_MONTH));
if (may.length !== 31) throw new Error(`May 2026 has ${may.length} days, expected 31`);
const baseImp = may.reduce((s, r) => s + r.impressions, 0) / 31;
const baseClk = may.reduce((s, r) => s + r.clicks, 0) / 31;
const addDays = (iso, n) => { const d = new Date(`${iso}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

const points = [];
for (let d = START, i = 0; d <= END; d = addDays(d, 1), i++) {
  const r = byDate.get(d);
  if (!r) throw new Error(`no GSC row for ${d}; the series must be consecutive`);
  points.push({ _key: `d-${i}`, date: d, month: MONTHS[Number(d.slice(5, 7)) - 1], impressions: Math.round((r.impressions / baseImp) * 100), clicks: Math.round((r.clicks / baseClk) * 100) });
}

const sum = (rows, k) => rows.reduce((s, r) => s + r[k], 0);
const month = (m) => raw.filter((r) => r.date.startsWith(m));
const perDay = (m) => sum(month(m), 'impressions') / month(m).length;
const sep = raw.filter((r) => r.date >= '2026-09-01' && r.date <= END);
const last7 = raw.filter((r) => r.date > addDays(END, -7) && r.date <= END);
const wpos = (rows) => rows.reduce((s, r) => s + r.position * r.impressions, 0) / sum(rows, 'impressions');
const stats = {
  impPerDayMayToAug: perDay('2026-08') / perDay('2026-05'),
  impPerDayMayToSep: sum(sep, 'impressions') / sep.length / perDay('2026-05'),
  impLastDayVsMay: byDate.get(END).impressions / perDay('2026-05'),
  impMayVsApr: sum(month('2026-05'), 'impressions') / sum(month('2026-04'), 'impressions'),
  impJunVsApr: sum(month('2026-06'), 'impressions') / sum(month('2026-04'), 'impressions'),
  impJulVsApr: sum(month('2026-07'), 'impressions') / sum(month('2026-04'), 'impressions'),
  impAugVsApr: sum(month('2026-08'), 'impressions') / sum(month('2026-04'), 'impressions'),
  impSepVsApr: sum(sep, 'impressions') / sum(month('2026-04'), 'impressions'),
  impJulYoY: sum(month('2026-07'), 'impressions') / sum(month('2025-07'), 'impressions'),
  impAugYoY: sum(month('2026-08'), 'impressions') / sum(month('2025-08'), 'impressions'),
  impSepVsWholeSep25: sum(sep, 'impressions') / sum(month('2025-09'), 'impressions'),
  sepImpVsAug: sum(sep, 'impressions') / sum(month('2026-08'), 'impressions'),
  sepClkVsAug: sum(sep, 'clicks') / sum(month('2026-08'), 'clicks'),
  clicksWeekVsMayAvg: sum(last7, 'clicks') / (sum(month('2026-05'), 'clicks') / 31 * 7),
  posAug: wpos(month('2026-08')),
  posSep: wpos(sep),
};
/* The copy's rounded figures; the script refuses to write if the data moved. */
const expect = {
  impPerDayMayToAug: 28, impPerDayMayToSep: 150, impLastDayVsMay: 224, impMayVsApr: 2.2, impJunVsApr: 5.1, impJulVsApr: 12.9,
  impAugVsApr: 62, impSepVsApr: 160, impJulYoY: 5, impAugYoY: 24, impSepVsWholeSep25: 46, sepImpVsAug: 2.6, sepClkVsAug: 2.9,
  clicksWeekVsMayAvg: 28, posAug: 11.5, posSep: 7.2,
};
const roundLike = (v, e) => (Number.isInteger(e) ? Math.round(v) : r1(v));
for (const [k, e] of Object.entries(expect)) {
  const got = roundLike(stats[k], e);
  if (got !== e) throw new Error(`copy says ${k} = ${e}, data says ${got} (${stats[k].toFixed(3)})`);
}

/* Growth-curve chart: monthly impressions, May..Sep, indexed to the largest = 100 */
const monthly = ['2026-05', '2026-06', '2026-07', '2026-08'].map((m) => sum(month(m), 'impressions')).concat([sum(sep, 'impressions')]);
const maxM = Math.max(...monthly);
const pct = (v) => `+${Math.round((v / monthly[0] - 1) * 100).toLocaleString('en-US')}%`;
const growthCurve = [
  { _key: 'gc-may', _type: 'object', label: 'May', value: Math.round((monthly[0] / maxM) * 100), displayValue: 'baseline' },
  { _key: 'gc-jun', _type: 'object', label: 'Jun', value: Math.round((monthly[1] / maxM) * 100), displayValue: pct(monthly[1]) },
  { _key: 'gc-jul', _type: 'object', label: 'Jul', value: Math.round((monthly[2] / maxM) * 100), displayValue: pct(monthly[2]) },
  { _key: 'gc-aug', _type: 'object', label: 'Aug', value: Math.round((monthly[3] / maxM) * 100), displayValue: pct(monthly[3]) },
  { _key: 'gc-sep', _type: 'object', label: 'Sep', value: Math.round((monthly[4] / maxM) * 100), displayValue: `${pct(monthly[4])} in 15 days` },
];

/* ── Peec: weekly share of voice for the topicClimb bars ───────────── */
const weekly = readdirSync(peecDir).filter((f) => f.endsWith('.json')).sort().map((f) => {
  const d = JSON.parse(readFileSync(join(peecDir, f), 'utf8'));
  const g = (d.projectWide?.data || []).find((b) => b.brand.name === 'Genie Teacher');
  return { week: f.replace('.json', ''), sov: g?.share_of_voice ?? null, vis: g?.visibility ?? null, pos: g?.position ?? null };
}).filter((w) => w.sov != null && w.week <= '2026-09-07'); // the 14 Sep week is partial
const topicPoints = weekly.map((w, i) => ({ _key: `pt-${i}`, week: w.week, value: Math.round(w.sov * 10000) / 10000 }));
const wk = (w) => weekly.find((x) => x.week === w);
const peecExpect = [['2026-05-25', 0.0226, 0.0526], ['2026-07-20', 0.386, 0.2839], ['2026-08-24', 0.1294, 0.0917], ['2026-09-07', 0.1361, 0.0988]];
for (const [w, sov, vis] of peecExpect) {
  const x = wk(w);
  if (!x || Math.round(x.sov * 10000) / 10000 !== sov || Math.round(x.vis * 10000) / 10000 !== vis) throw new Error(`Peec week ${w} does not match the copy: ${JSON.stringify(x)}`);
}
const posRange = weekly.filter((w) => w.week >= '2026-07-20').map((w) => w.pos);
if (Math.min(...posRange) < 1.0 || Math.max(...posRange) > 1.6) throw new Error(`mention position since July outside 1.0–1.6: ${posRange}`);

/* ── PostHog: leads and bookings (weekly, Sunday start, complete weeks) ── */
const LEAD_WEEKS = [ // generate_lead on $host = genieteacher.com (brief F9)
  ['2026-07-19', 5], ['2026-07-26', 13], ['2026-08-02', 2], ['2026-08-09', 13], ['2026-08-16', 17], ['2026-08-23', 13], ['2026-08-30', 21], ['2026-09-06', 93],
];
const CUT = '2026-09-01';
const mean = (rows) => rows.reduce((t, [, v]) => t + v, 0) / rows.length;
const leadBase = mean(LEAD_WEEKS.filter(([w]) => w < CUT));
const leadMultiple = mean(LEAD_WEEKS.filter(([w]) => w >= CUT)) / leadBase;
if (r1(leadMultiple) !== 7.8) throw new Error(`lead multiple ${leadMultiple} != 7.8`);
const BOOKING_WEEKS = [0, 2, 0, 7, 0, 1, 1, 3, 2, 2, 1, 2, 4, 2, 1, 2, 1, 0, 0, 7, 4]; // 12 Apr .. 30 Aug (brief F10)
const bookingMultiple = 8 / (BOOKING_WEEKS.reduce((a, b) => a + b, 0) / BOOKING_WEEKS.length);
if (Math.round(bookingMultiple) !== 4) throw new Error(`booking multiple ${bookingMultiple} != 4`);

const leadGrowth = {
  _type: 'object',
  title: 'Lead requests per week, indexed',
  multiple: `${leadMultiple.toFixed(1)}×`,
  multipleLabel: 'more lead requests in the first full week of September, against the seven tracked weeks before it',
  baselineLabel: 'every tracked week before 6 September',
  caption: 'Weekly requests to see a teacher’s availability or contact them, from teacher profiles on genieteacher.com, indexed to the pre-September average. Complete weeks only; the dip in the first week of August is real and left in.',
  source: 'PostHog · 19 Jul – 12 Sep 2026',
  points: LEAD_WEEKS.map(([week, v]) => ({ _key: `lg-${week}`, _type: 'object', week, value: Math.round((v / leadBase) * 100) })),
};

/* ── Copy ───────────────────────────────────────────────────────────── */
const mainBody = readFileSync(join(here, 'genie-mainBody-2026-09-18.html'), 'utf8').trim();
const faq = JSON.parse(readFileSync(join(here, '../../../content-engine/.claude/drafts/loudface/genie-teacher-organic-growth.faq.json'), 'utf8')).faq;
const paragraphSummary = readFileSync(join(here, '../../../content-engine/.claude/drafts/loudface/genie-teacher-organic-growth.lede.txt'), 'utf8').trim();

const patch = {
  'instruments.gscSource': 'Google Search Console · indexed to May 2026 = 100 · to 15 Sep 2026',
  'instruments.aiSource': 'Peec AI · weekly to 13 Sep 2026, 30-day window to 17 Sep 2026',
  'instruments.indexedTrend.points': points,
  'instruments.indexedTrend.caption': 'Impressions per day rose 28× from May to August and 150× over the first fifteen days of September (to 15 Sep, the latest day Search Console reports). Search Console reports nothing before 13 April 2026, so the series starts there.',
  'instruments.topicClimb.points': topicPoints,
  'instruments.topicClimb.caption': '2.26% to 13.6%, 25 May to 13 Sep. Tracking paused 1 Jun – 13 Jul; the line bridges that gap. The prompt set grew from 29 to 90 over the period, so the later readings are the harder ones.',
  'instruments.publishedResult.rows': [
    { _key: 'r-0', value: '5.26% → 9.88%', unit: 'AI visibility, week of 25 May → week of 7 Sep' },
    { _key: 'r-1', value: '2.26% → 13.6%', unit: 'share of voice, same weeks' },
    { _key: 'r-2', value: '1.0–1.6', unit: 'average mention rank since July' },
  ],
  'instruments.publishedResult.caption': 'Source: Peec AI, weekly readings.',
  'instruments.leadGrowth': leadGrowth,
  'charts[0].data': growthCurve,
  'charts[0].legendPrimary': 'May to September 2026, indexed to May; the September bucket is its first 15 days only. Source: Google Search Console.',
  result1Number: '150×',
  result1Title: 'Google impressions per day, May 2026 average → 1–15 Sep 2026',
  result2Number: '28×',
  result2Title: 'Google clicks per week, May 2026 average → week ending 15 Sep 2026',
  result3Number: '7.8×',
  result3Title: 'Lead requests per week, seven tracked weeks to 5 Sep → first full week of Sep 2026 (PostHog)',
  paragraphSummary,
  faq,
  mainBody,
};

/* ── Plan / write ───────────────────────────────────────────────────── */
console.log(`Baseline: average May 2026 day = 100 (not shipped). Points: ${points.length} daily, ${points[0].date} → ${points.at(-1).date}`);
console.log('Google multipliers:'); for (const [k, v] of Object.entries(stats)) console.log(`  ${k}: ${v.toFixed(2)}`);
console.log('Growth curve:', growthCurve.map((g) => `${g.label} ${g.value} ${g.displayValue}`).join(' | '));
console.log('Peec weeks:', weekly.map((w) => `${w.week} sov ${(w.sov * 100).toFixed(2)} vis ${(w.vis * 100).toFixed(2)} pos ${w.pos.toFixed(2)}`).join('\n  '));
console.log(`Leads: baseline ${leadBase.toFixed(2)}/wk, multiple ${leadMultiple.toFixed(2)}; indexed ${leadGrowth.points.map((p) => p.value).join(' ')}`);
console.log(`Bookings: multiple ${bookingMultiple.toFixed(2)}`);

const doc = await client.getDocument(DOC_ID);
if (!doc) throw new Error('published doc not found');
if (await client.getDocument(`drafts.${DOC_ID}`)) { console.error('A draft exists for this document; refusing to patch under a pending human edit.'); process.exit(1); }
console.log(`Current _rev ${doc._rev}, updated ${doc._updatedAt}; last shipped point ${doc.instruments.indexedTrend.points.at(-1).date}`);

const old = new Map(doc.instruments.indexedTrend.points.map((p) => [p.date, p]));
let drift = 0;
for (const p of points) { const o = old.get(p.date); if (o && (Math.abs(o.impressions - p.impressions) > 1 || Math.abs(o.clicks - p.clicks) > 1)) drift++; }
console.log(`Drift against shipped Google points: ${drift} (tolerance ±1)`);
if (drift > 0) { console.error('Shipped points do not reproduce; investigate before writing.'); process.exit(1); }
const oldTopic = new Map(doc.instruments.topicClimb.points.map((p) => [p.week, p.value]));
let tdrift = 0;
for (const p of topicPoints) {
  if (!oldTopic.has(p.week)) continue;
  const delta = Math.abs(oldTopic.get(p.week) - p.value);
  if (delta > 0.0006) { tdrift++; console.log(`  Peec week ${p.week}: shipped ${oldTopic.get(p.week)}, live ${p.value} (delta ${delta.toFixed(4)})`); }
  if (delta > 0.002) { console.error('Shipped Peec points do not reproduce beyond rounding; investigate before writing.'); process.exit(1); }
}
console.log(`Drift against shipped Peec points: ${tdrift} (the 24 Aug bar shipped as 0.1276 on 2 Sep while its copy said 12.94%; the live weekly read is 0.1294 and the bar now matches the copy)`);

if (!WRITE) { console.log('\nDry run. Fields to set:', Object.keys(patch).join(', ')); process.exit(0); }

mkdirSync(join(here, '../backups'), { recursive: true });
writeFileSync(join(here, '../backups/genie-casestudy-pre-2026-09-18.json'), JSON.stringify(doc, null, 2));
const res = await client.patch(DOC_ID).set(patch).commit();
console.log(`✓ patched ${res._id} → _rev ${res._rev}`);
