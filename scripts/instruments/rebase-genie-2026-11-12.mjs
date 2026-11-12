/**
 * Re-base the Genie Teacher case study on the week the work began, 12 Nov 2026.
 *
 * Until now every Google growth figure was measured from May 2026 (cards, daily chart, copy) or April (the monthly
 * table): the first months Search Console covers, chosen on 1 Sep before the study carried a start date. LoudFace
 * began on 5 July 2026, so those baselines credited the program with growth from before it started and read as if
 * the work began in spring (Arnel, 12 Nov 2026).
 *
 * This script moves the baseline and nothing else. Windows, data end dates and every non-Google figure stay.
 *   - Per-day and per-week multiples: against the week the work began (29 Jun – 5 Jul), the baseline the weekly
 *     clicks chart already uses.
 *   - Monthly table and fallback curve: against June, the last full month before the work began.
 *   - The Peec AI readings from the week of 25 May stay, labelled as taken before the work began.
 *
 * Input: --gsc <gsc-cli JSON of sc-domain:genieteacher.com by date>, daily from 13 Apr 2026. Raw counts never leave
 * this script. Every shipped May- and April-based figure must reproduce from the pull, and every replaced sentence
 * must exist exactly once, or nothing is written.
 *
 *   SANITY_API_TOKEN=... node scripts/instruments/rebase-genie-2026-11-12.mjs --gsc <f> [--out <f>] [--write]
 */
import { createClient } from '@sanity/client';
import { readFileSync, writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const argVal = (name) => {
  if (!args.includes(name)) return undefined;
  const v = args[args.indexOf(name) + 1];
  if (!v || v.startsWith('--')) throw new Error(`${name} needs a value`);
  return v;
};
const gscPath = argVal('--gsc');
if (!gscPath) throw new Error('--gsc <file> is required');
const outPath = argVal('--out');
const token = process.env.SANITY_API_TOKEN;
if (!token) throw new Error('SANITY_API_TOKEN missing');
const client = createClient({ projectId: 'xjjjqhgt', dataset: 'production', apiVersion: '2025-03-29', token, useCdn: false });

const DOC_ID = 'caseStudy-genie-teacher-organic-growth';
const DATA_END = '2026-11-09'; // the shipped copy reads Search Console to this day
const WIN_END = '2026-11-07'; // the shipped trailing windows end here
const START_WEEK = ['2026-06-29', '2026-07-05']; // the ISO week of engagementStart
const BASE_WORDS = 'the week the work began';
const BASE_DATES = '29 Jun–5 Jul 2026';

/* ── Search Console (gsc-cli shape → [date, clicks, impressions]) ── */
const plus = (d, n) => new Date(Date.parse(`${d}T00:00:00Z`) + n * 864e5).toISOString().slice(0, 10);
const all = JSON.parse(readFileSync(gscPath, 'utf8')).rows
  .map((r) => [r.keys[0], r.clicks, r.impressions])
  .sort((a, b) => (a[0] < b[0] ? -1 : 1))
  .filter(([d]) => d <= DATA_END);
if (all[0][0] !== '2026-04-13' || all.at(-1)[0] !== DATA_END) throw new Error(`pull covers ${all[0][0]} to ${all.at(-1)[0]}`);
for (let i = 1; i < all.length; i++) if (all[i][0] !== plus(all[i - 1][0], 1)) throw new Error(`gap in the pull after ${all[i - 1][0]}`);

const CLICKS = 1;
const IMPRESSIONS = 2;
const range = (a, b) => all.filter(([d]) => d >= a && d <= b);
const month = (m) => all.filter(([d]) => d.startsWith(m));
const sum = (rows, col) => rows.reduce((t, r) => t + r[col], 0);
const perDay = (rows, col) => sum(rows, col) / rows.length;
const r1 = (v) => Math.round(v * 10) / 10;
const trail = (end) => range(plus(end, -6), end);

const [apr, may, jun, jul, aug, sep, oct] = ['04', '05', '06', '07', '08', '09', '10'].map((m) => month(`2026-${m}`));
const startWeek = range(...START_WEEK);
const win = trail(WIN_END);
if (startWeek.length !== 7 || win.length !== 7) throw new Error('a seven-day window is incomplete');
const bestDay = range('2026-10-01', DATA_END).reduce((a, b) => (b[IMPRESSIONS] > a[IMPRESSIONS] ? b : a));

// The shipped figures, on their old baselines, must reproduce from this pull before anything is re-based.
const mayImp = perDay(may, IMPRESSIONS);
const mayClk = perDay(may, CLICKS);
const shipped = {
  imp: Math.round(perDay(win, IMPRESSIONS) / mayImp),
  clk: Math.round(sum(win, CLICKS) / (mayClk * 7)),
  augPerDay: Math.round(perDay(aug, IMPRESSIONS) / mayImp),
  sepPerDay: Math.round(perDay(sep, IMPRESSIONS) / mayImp),
  octVsApr: Math.round(sum(oct, IMPRESSIONS) / sum(apr, IMPRESSIONS)),
  bestDay: bestDay[0],
  bestDayX: Math.round(bestDay[IMPRESSIONS] / mayImp),
};
const expectShipped = { imp: 660, clk: 82, augPerDay: 28, sepPerDay: 170, octVsApr: 998, bestDay: '2026-11-09', bestDayX: 810 };
for (const [k, e] of Object.entries(expectShipped)) if (shipped[k] !== e) throw new Error(`shipped ${k} = ${e}, data says ${shipped[k]}`);

const baseImp = perDay(startWeek, IMPRESSIONS);
const baseClkDay = perDay(startWeek, CLICKS);
const junImp = sum(jun, IMPRESSIONS);
const vsJune = (rows) => sum(rows, IMPRESSIONS) / junImp;
const f = {
  imp: Math.round(perDay(win, IMPRESSIONS) / baseImp),
  clk: Math.round(sum(win, CLICKS) / sum(startWeek, CLICKS)),
  augPerDay: r1(perDay(aug, IMPRESSIONS) / baseImp),
  sepPerDay: Math.round(perDay(sep, IMPRESSIONS) / baseImp),
  bestDayX: Math.round(bestDay[IMPRESSIONS] / baseImp),
  junVsMay: r1(junImp / sum(may, IMPRESSIONS)),
  jul: r1(vsJune(jul)), aug: Math.round(vsJune(aug)), sep: Math.round(vsJune(sep)), oct: Math.round(vsJune(oct)),
};
const IMP = `${f.imp}×`;
const CLK = `${f.clk}×`;

/* ── Document ───────────────────────────────────────────────────────── */
const doc = await client.getDocument(DOC_ID);
if (!doc) throw new Error(`no document ${DOC_ID}`);
if (await client.getDocument(`drafts.${DOC_ID}`)) throw new Error('a draft exists for this document; refusing to patch under a pending human edit');
if (doc.result1Number !== '660×' || doc.result2Number !== '82×' || doc.instruments.engagementStart !== START_WEEK[1]
  || doc.instruments.gscSource !== 'Google Search Console · indexed to May 2026 = 100 · to 9 Nov 2026') throw new Error('the study changed since 11 Nov');

const swap = (text, pairs, field) => {
  let out = text;
  for (const [from, to] of pairs) {
    const n = out.split(from).length - 1;
    if (n !== 1) throw new Error(`${field}: expected 1 match, found ${n}: "${from.slice(0, 90)}…"`);
    out = out.replace(from, to);
  }
  return out;
};

const tableStart = doc.mainBody.indexOf('<table>');
const tableEnd = doc.mainBody.indexOf('</table>') + '</table>'.length;
const oldTable = doc.mainBody.slice(tableStart, tableEnd);
if (tableStart < 0 || !oldTable.includes('Impressions vs the April baseline') || !oldTable.includes('998×')) throw new Error('monthly table not found as shipped');
const row = (label, value, strong) => `<tr><td>${strong ? `<strong>${label}</strong>` : label}</td><td>${strong ? `<strong>${value}</strong>` : value}</td></tr>`;
const newTable = [
  '<table>', '<thead><tr><th>Month (2026)</th><th>Impressions vs June</th></tr>', '</thead>', '<tbody>',
  row('June (the last full month before the work began)', 'baseline'),
  row('July', `${f.jul}×`), row('August', `${f.aug}×`), row('September', `${f.sep}×`), row('October', `${f.oct}×`, true),
  '</tbody>', '</table>',
].join('\n');

const mainBody = swap(doc.mainBody.replace(oldTable, newTable), [
  [
    "Genie Teacher's Google impressions per day rose 28× from May to August 2026, 170× across September, and 660× in the seven days to 7 November (Google Search Console, to 9 Nov 2026). Clicks followed: the seven days to 7 November brought 82× the clicks of an average May week,",
    `LoudFace began work with Genie Teacher on 5 July 2026. Measured against ${BASE_WORDS} (29 June to 5 July), Google impressions per day ran ${f.augPerDay}× in August, ${f.sepPerDay}× across September, and ${IMP} in the seven days to 7 November (Google Search Console, to 9 Nov 2026). Clicks followed: the seven days to 7 November brought ${CLK} the clicks of that first week,`,
  ],
  [
    'visibility grew from 5.26% in the week of 25 May to 14.87%',
    'visibility grew from 5.26% in the week of 25 May, a reading taken before the work began, to 14.87%',
  ],
  ['<h3>The curve: a spring of doubling, then vertical</h3>', '<h3>The curve: vertical from August</h3>'],
  [
    'Monthly Google impressions since the spring (Google Search Console, root domain, to 31 October 2026):',
    'Monthly Google impressions against June, the last full month before the work began on 5 July (Google Search Console, root domain, to 31 October 2026):',
  ],
  [
    'Through the spring each month roughly doubled the one before. In August the curve broke upward: the month closed at 62× the April baseline, and September closed at 362×; October closed at 998×. Measured per day, impressions rose 28× from May to August and 170× across September; the seven days to 7 November ran at 660× an average May day, and the best day so far, 9 November, at 810×.',
    `Before the work began the site was small and growing slowly: Search Console coverage starts on 13 April, and June brought ${f.junVsMay}× the impressions of May. July, the first month of the program, brought ${f.jul}× June. In August the curve broke upward: the month closed at ${f.aug}× June, September at ${f.sep}× and October at ${f.oct}×. Measured per day against ${BASE_WORDS}, impressions ran ${f.augPerDay}× in August and ${f.sepPerDay}× across September; the seven days to 7 November ran at ${IMP}, and the best day so far, 9 November, at ${f.bestDayX}×.`,
  ],
  [
    'The seven days to 7 November brought 82× the clicks of an average May week, September brought 7.0× the clicks of August,',
    `The seven days to 7 November brought ${CLK} the clicks of ${BASE_WORDS}, September brought 7.0× the clicks of August,`,
  ],
  [
    'rising from <strong>5.26%</strong> in the week of 25 May 2026 to a peak',
    'rising from <strong>5.26%</strong> in the week of 25 May 2026, a reading taken before the work began, to a peak',
  ],
  [
    '<strong>2.26%</strong> in the week of 25 May 2026 to',
    '<strong>2.26%</strong> in the week of 25 May 2026, before the work began, to',
  ],
  ['the current 90 prompts were built between 29 May and 24 August, so', 'the current 90 prompts were in place by 24 August, so'],
  ['On the branded prompts, tracked from May to August,', 'On the branded prompts, tracked until August,'],
  [
    'Updated 11 November 2026 with Search Console data to 9 November',
    'Updated 12 November 2026: every Google growth figure is now measured from the week the work began (29 June to 5 July 2026) or from June, the last full month before it, instead of May or April, the first months Search Console covers; the data and its windows are unchanged. Previously updated 11 November 2026 with Search Console data to 9 November',
  ],
], 'mainBody');

const paragraphSummary = swap(doc.paragraphSummary, [
  [
    "Genie Teacher's Google impressions per day rose 28× from May to August 2026 and 660× in the seven days to 7 November, clicks per week climbed 82× on the May average in the seven days to 7 November,",
    `Measured against ${BASE_WORDS} (29 June to 5 July 2026), Genie Teacher's Google impressions per day ran ${f.augPerDay}× in August and ${IMP} in the seven days to 7 November, clicks per week climbed ${CLK} in the seven days to 7 November,`,
  ],
  [
    'between the weeks of 25 May and 26 October 2026,',
    'between the week of 25 May, a reading taken before the work began, and the week of 26 October 2026,',
  ],
], 'paragraphSummary');

const faqSwaps = {
  'faq-2': [[
    'Impressions roughly doubled every month through the spring of 2026, then went vertical:',
    `The work began on 5 July 2026. July brought ${f.jul}× the impressions of June, then the curve went vertical:`,
  ]],
  'faq-3': [[
    'clicks per week reached 82× the May 2026 average in the seven days to 7 November,',
    `clicks in the seven days to 7 November reached ${CLK} those of ${BASE_WORDS},`,
  ]],
};
for (const key of Object.keys(faqSwaps)) if (!doc.faq.some((q) => q._key === key)) throw new Error(`${key} missing`);
const faq = doc.faq.map((q) => (faqSwaps[q._key] ? { ...q, answer: swap(q.answer, faqSwaps[q._key], q._key) } : q));

/* Daily chart: every shipped point must reproduce on the May index, then the same days are indexed to the start week */
const it = doc.instruments.indexedTrend;
const byDate = new Map(all.map((r) => [r[0], r]));
const index = (r, clkBase, impBase) => ({ clicks: Math.round((r[CLICKS] / clkBase) * 100), impressions: Math.round((r[IMPRESSIONS] / impBase) * 100) });
const points = it.points.map((p) => {
  const r = byDate.get(p.date);
  if (!r) throw new Error(`chart point ${p.date} has no row`);
  const old = index(r, mayClk, mayImp);
  if (old.clicks !== p.clicks || old.impressions !== p.impressions) throw new Error(`chart point ${p.date} does not reproduce`);
  return { ...p, ...index(r, baseClkDay, baseImp) };
});
const indexedTrend = {
  ...it,
  points,
  title: `Impressions and clicks · indexed, ${BASE_WORDS} = 100`,
  baselineLabel: BASE_WORDS,
  caption: `Indexed to ${BASE_WORDS} (${BASE_DATES}). Impressions per day ran ${f.augPerDay}× that week in August and ${f.sepPerDay}× across September; the seven days to 7 November ran at ${IMP}, the high so far (daily to 7 Nov). Search Console reports nothing before 13 April 2026, so the series starts there.`,
};

/* Fallback monthly curve, kept in step with the table: June = baseline */
const curve = doc.charts?.[0];
if (!curve || curve.data[0].displayValue !== 'baseline' || !curve.legendPrimary.includes('indexed to May')) throw new Error('fallback curve not as shipped');
const curveMonths = [['Jun', jun], ['Jul', jul], ['Aug', aug], ['Sep', sep], ['Oct', oct]];
const curveMax = sum(oct, IMPRESSIONS);
const charts = [{
  ...curve,
  data: curveMonths.map(([label, rows], i) => ({
    ...curve.data[0],
    _key: `gc-${label.toLowerCase()}`,
    label,
    value: Math.max(1, Math.round((sum(rows, IMPRESSIONS) / curveMax) * 100)),
    displayValue: i === 0 ? 'baseline' : `+${Math.round((vsJune(rows) - 1) * 100).toLocaleString('en-US')}%`,
  })),
  legendPrimary: 'June to October 2026, indexed to June, the last full month before the work began. Source: Google Search Console.',
}, ...doc.charts.slice(1)];

const pr = doc.instruments.publishedResult;
const publishedResult = {
  ...pr,
  rows: pr.rows.map((r) => (r._key === 'r-0' ? { ...r, unit: swap(r.unit, [['week of 25 May →', 'week of 25 May (before the work began) →']], 'publishedResult r-0') } : r)),
};
const topicClimb = {
  ...doc.instruments.topicClimb,
  caption: swap(doc.instruments.topicClimb.caption, [['2.26% to 21.9%, 25 May to 1 Nov.', '2.26% to 21.9%, 25 May to 1 Nov; the 25 May reading was taken before the work began.']], 'topicClimb.caption'),
};

const growthWindow = `${BASE_WORDS} (${BASE_DATES}) → 7 days to 7 Nov 2026`;
const patch = {
  name: `Genie Teacher: ${IMP} Search Visibility`,
  result1Number: IMP,
  result1Title: `Google impressions per day, ${growthWindow}`,
  result2Number: CLK,
  result2Title: `Google clicks per week, ${growthWindow}`,
  paragraphSummary,
  mainBody,
  faq,
  charts,
  'mainProjectImageThumbnail.alt': swap(doc.mainProjectImageThumbnail.alt, [['660×', IMP]], 'thumbnail alt'),
  'instruments.indexedTrend': indexedTrend,
  'instruments.gscSource': 'Google Search Console · indexed to the week of 29 Jun 2026 = 100 · to 9 Nov 2026',
  'instruments.publishedResult': publishedResult,
  'instruments.topicClimb': topicClimb,
};

const OLD_BASELINE = /660×|82×|998×|362×|810×|April baseline|May average|average May|May 2026 average|indexed to May/;
const left = JSON.stringify(patch).match(OLD_BASELINE);
if (left) throw new Error(`an old-baseline figure is still in the copy: ${left[0]}`);

console.log(JSON.stringify({ shipped, rebased: f }, null, 1));
if (outPath) {
  const before = Object.fromEntries(Object.keys(patch).map((k) => [k, k.split('.').reduce((o, s) => o?.[s], doc)]));
  writeFileSync(outPath, JSON.stringify({ _id: DOC_ID, _rev: doc._rev, before, set: patch }, null, 1));
  console.log(`before and after written to ${outPath}`);
}
if (!WRITE) {
  console.log(`\ndry run against _rev ${doc._rev}: nothing written to Sanity (add --write). Fields: ${Object.keys(patch).join(', ')}`);
  process.exit(0);
}
const res = await client.patch(DOC_ID).ifRevisionId(doc._rev).set(patch).commit();
console.log(`patched ${res._id} rev ${res._rev}`);
