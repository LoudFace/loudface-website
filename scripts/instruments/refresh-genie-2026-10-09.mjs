/**
 * Refresh the Genie Teacher case study's Google figures to 4 Oct 2026, the end
 * of the last complete week (Search Console reported to 6 Oct on 9 Oct).
 *
 * Only the Google numbers move. The lead, booking and Peec figures were
 * re-measured on 9 Oct and are lower or flat (leads 5.8× → about 5×), so they
 * keep their dated windows.
 *
 * Input: --gsc <JSON array of [date, clicks, impressions, position]>, a daily
 * pull of sc-domain:genieteacher.com from 13 Apr 2026. Raw counts never leave
 * this script: every published value is indexed to the average May 2026 day.
 *
 * Every shipped figure (164×, 27×, 291×, 28×, 62×, Aug position 11.5, the
 * 25 Sep chart point) is recomputed from the new pull and must reproduce, and
 * every replaced sentence must exist exactly once, or nothing is written.
 *
 *   scripts/with-secrets.sh node scripts/instruments/refresh-genie-2026-10-09.mjs --gsc <f>          # dry run
 *   scripts/with-secrets.sh node scripts/instruments/refresh-genie-2026-10-09.mjs --gsc <f> --write  # patch
 */
import { createClient } from '@sanity/client';
import { readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const gscPath = args[args.indexOf('--gsc') + 1];
if (!gscPath || gscPath.startsWith('--')) throw new Error('--gsc <file> is required');
const token = process.env.SANITY_API_TOKEN;
if (!token) throw new Error('SANITY_API_TOKEN missing (run through scripts/with-secrets.sh)');
const client = createClient({ projectId: 'xjjjqhgt', dataset: 'production', apiVersion: '2025-03-29', token, useCdn: false });

const DOC_ID = 'caseStudy-genie-teacher-organic-growth';
const END = '2026-10-04';
const WEEK_START = '2026-09-28';

/* ── Search Console ─────────────────────────────────────────────────── */
const rows = JSON.parse(readFileSync(gscPath, 'utf8')).filter(([d]) => d <= END);
const range = (a, b) => rows.filter(([d]) => d >= a && d <= b);
const month = (m) => rows.filter(([d]) => d.startsWith(m));
const sum = (rs, i) => rs.reduce((t, r) => t + r[i], 0);
const wpos = (rs) => rs.reduce((t, r) => t + r[2] * r[3], 0) / sum(rs, 2);
const r1 = (v) => Math.round(v * 10) / 10;
if (rows.at(-1)[0] !== END) throw new Error(`pull ends ${rows.at(-1)[0]}, need ${END}`);

const apr = month('2026-04');
const may = month('2026-05');
const mayImp = sum(may, 2) / may.length;
const mayClk = sum(may, 1) / may.length;
const perDay = (rs) => sum(rs, 2) / rs.length / mayImp;
const sep = month('2026-09');
const week = range(WEEK_START, END);
if (week.length !== 7) throw new Error('week is not 7 days');

// shipped figures must reproduce
const shipped = {
  imp1to25: Math.round(perDay(range('2026-09-01', '2026-09-25'))),
  clkWk25: Math.round(sum(range('2026-09-19', '2026-09-25'), 1) / (mayClk * 7)),
  vsApr1to25: Math.round(sum(range('2026-09-01', '2026-09-25'), 2) / sum(apr, 2)),
  mayToAug: Math.round(perDay(month('2026-08'))),
  augVsApr: Math.round(sum(month('2026-08'), 2) / sum(apr, 2)),
  posAug: r1(wpos(month('2026-08'))),
  idx25: Math.round((rows.find(([d]) => d === '2026-09-25')[2] / mayImp) * 100),
};
const expect = { imp1to25: 164, clkWk25: 27, vsApr1to25: 291, mayToAug: 28, augVsApr: 62, posAug: 11.5, idx25: 20618 };
for (const [k, e] of Object.entries(expect)) if (shipped[k] !== e) throw new Error(`shipped ${k} = ${e}, data says ${shipped[k]}`);

const f = {
  impWeek: Math.round(perDay(week)),
  clkWeek: Math.round(sum(week, 1) / (mayClk * 7)),
  impSep: Math.round(perDay(sep)),
  sepVsApr: Math.round(sum(sep, 2) / sum(apr, 2)),
  sepImpVsAug: r1(sum(sep, 2) / sum(month('2026-08'), 2)),
  sepClkVsAug: r1(sum(sep, 1) / sum(month('2026-08'), 1)),
  posSep: r1(wpos(sep)),
  posWeek: r1(wpos(week)),
  bestDay: rows.filter(([d]) => d >= '2026-09-26').reduce((a, b) => (b[2] > a[2] ? b : a)),
};
f.bestDayX = Math.round(f.bestDay[2] / mayImp);
const expectNew = { impWeek: 226, clkWeek: 35, impSep: 170, sepVsApr: 362, sepImpVsAug: 5.8, sepClkVsAug: 7, posSep: 6.9, posWeek: 6.5, bestDayX: 284 };
for (const [k, e] of Object.entries(expectNew)) if (f[k] !== e) throw new Error(`copy says ${k} = ${e}, data says ${f[k]}`);
if (f.bestDay[0] !== '2026-10-01') throw new Error(`best day is ${f.bestDay[0]}`);

/* ── Document ───────────────────────────────────────────────────────── */
const doc = await client.getDocument(DOC_ID);
if (!doc) throw new Error(`no document ${DOC_ID}`);

const swap = (text, pairs, field) => {
  let out = text;
  for (const [from, to] of pairs) {
    const n = out.split(from).length - 1;
    if (n !== 1) throw new Error(`${field}: expected 1 match, found ${n}: "${from.slice(0, 90)}…"`);
    out = out.replace(from, to);
  }
  return out;
};

const mainBody = swap(doc.mainBody, [
  [
    "Genie Teacher's Google impressions per day rose 28× from May to August 2026 and 164× over the first twenty-five days of September (Google Search Console, to 25 Sep 2026). Clicks followed: the week ending 25 September brought 27× the clicks of an average May week, and the average position moved from 11.5 in August to 7.0 in September.",
    "Genie Teacher's Google impressions per day rose 28× from May to August 2026, 170× across September, and 226× in the week of 28 September to 4 October (Google Search Console, to 4 Oct 2026). Clicks followed: that week brought 35× the clicks of an average May week, and the average position moved from 11.5 in August to 6.9 in September and 6.5 in that week.",
  ],
  [
    'and the first twenty-five days of September brought 4.7× the impressions and 5.5× the clicks of the whole of August.',
    'and September brought 5.8× the impressions and 7.0× the clicks of August.',
  ],
  ['(Google Search Console, root domain, to 25 September 2026)', '(Google Search Console, root domain, to 30 September 2026)'],
  ['<tr><td><strong>September, first 25 days</strong></td><td><strong>291×</strong></td></tr>', '<tr><td><strong>September</strong></td><td><strong>362×</strong></td></tr>'],
  [
    'and the first twenty-five days of September reached 291×. Measured per day, impressions rose 28× from May to August and 164× over 1 to 25 September; the latest day Search Console reports, 25 September, sits at 206× an average May day. Against the same month last year, July was up 5× and August 24×, and twenty-five days of September out-earned the whole of September 2025 by 84×.',
    'and September closed at 362×. Measured per day, impressions rose 28× from May to August and 170× across September; the week of 28 September to 4 October ran at 226× an average May day, and its best day, 1 October, at 284×. Against the same month last year, July was up 5× and August 24×, and the first twenty-five days of September alone out-earned the whole of September 2025 by 84×.',
  ],
  [
    "The week ending 25 September brought 27× the clicks of an average May week, September's first twenty-five days brought 5.5× the clicks of all of August, and the average position across the site moved from 11.5 in August to 7.0 in September (Google Search Console).",
    'The week of 28 September to 4 October brought 35× the clicks of an average May week, September brought 7.0× the clicks of August, and the average position across the site moved from 11.5 in August to 6.9 in September (Google Search Console).',
  ],
  [
    'Updated 28 September 2026 with Search Console data to 25 September,',
    'Updated 9 October 2026 with Search Console data to 4 October (the lead, booking and AI figures below were re-checked then and keep their late-September windows); previously updated 28 September with',
  ],
], 'mainBody');

const paragraphSummary = swap(doc.paragraphSummary, [[
  "Genie Teacher's Google impressions per day rose 28× from May to August 2026 and 164× over the first twenty-five days of September, clicks per week climbed 27× on the May average, and the average position moved from 11.5 to 7.0.",
  "Genie Teacher's Google impressions per day rose 28× from May to August 2026 and 226× by the week of 28 September to 4 October, clicks per week climbed 35× on the May average, and the average position moved from 11.5 in August to 6.9 in September.",
]], 'paragraphSummary');

const faq = doc.faq.map((q) => (q._key !== 'faq-3' ? q : { ...q, answer: swap(q.answer, [[
  'clicks per week are 27× the May 2026 average and the average position has moved from 11.5 in August to 7.0 in September.',
  'clicks per week are 35× the May 2026 average and the average position has moved from 11.5 in August to 6.9 in September.',
]], 'faq-3') }));

/* Daily chart: extend from 26 Sep to 4 Oct on the same index */
const it = doc.instruments.indexedTrend;
const last = it.points.at(-1);
if (last.date !== '2026-09-25') throw new Error(`chart ends ${last.date}`);
let n = Number(last._key.slice(2));
const add = rows.filter(([d]) => d > last.date).map(([d, c, i]) => ({
  _key: `d-${++n}`, date: d, month: d.startsWith('2026-10') ? 'Oct' : 'Sep',
  clicks: Math.round((c / mayClk) * 100), impressions: Math.round((i / mayImp) * 100),
}));
const indexedTrend = {
  ...it,
  points: [...it.points, ...add],
  caption: swap(it.caption, [[
    'and 164× over the first twenty-five days of September (to 25 Sep, the latest day Search Console reports).',
    'and 170× across September; the week of 28 September to 4 October ran at 226× (daily to 4 Oct).',
  ]], 'indexedTrend.caption'),
};

/* Monthly chart: September is complete now, so it closes as a full month */
const MONTHS = ['2026-05', '2026-06', '2026-07', '2026-08', '2026-09'];
const vals = MONTHS.map((m) => sum(month(m), 2));
const max = Math.max(...vals);
const chart = doc.charts.find((c) => c._key === 'chart-impressions-curve');
const charts = doc.charts.map((c) => (c !== chart ? c : {
  ...c,
  data: c.data.map((p, i) => ({
    ...p,
    value: Math.max(1, Math.round((vals[i] / max) * 100)),
    displayValue: i === 0 ? 'baseline' : `+${Math.round((vals[i] / vals[0] - 1) * 100).toLocaleString('en-US')}%`,
    label: i === 4 ? 'Sep' : p.label,
  })),
  legendPrimary: 'May to September 2026, indexed to May. Source: Google Search Console.',
}));

const patch = {
  name: 'Genie Teacher: 226× Search Visibility',
  result1Number: `${f.impWeek}×`,
  result1Title: 'Google impressions per day, May 2026 average → week of 28 Sep–4 Oct 2026',
  result2Number: `${f.clkWeek}×`,
  result2Title: 'Google clicks per week, May 2026 average → week of 28 Sep–4 Oct 2026',
  paragraphSummary,
  mainBody,
  faq,
  charts,
  'instruments.indexedTrend': indexedTrend,
  'instruments.gscSource': 'Google Search Console · indexed to May 2026 = 100 · to 4 Oct 2026',
};

console.log(JSON.stringify({ shipped, fresh: f, added: add.length, monthly: charts[0].data.map((p) => `${p.label} ${p.value} ${p.displayValue}`) }, null, 1));
if (!WRITE) { console.log('\ndry run: nothing written (add --write)'); process.exit(0); }
const res = await client.patch(DOC_ID).ifRevisionId(doc._rev).set(patch).commit();
console.log(`patched ${res._id} rev ${res._rev}`);
