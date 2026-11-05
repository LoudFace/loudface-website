/**
 * Refresh the Pond case study on 5 Nov 2026: Google impressions outside Pond's name to the seven days ending 3 Nov
 * (Search Console final data reached 3 Nov), with three automated-looking queries left out of the whole series.
 *
 * Method (content-engine/.claude/research/loudface/pond-ai-search-speed.sources.md, F6): daily impressions from
 * queries that do not contain "pond" or "joinground", are not "site:" searches, carry no "<" and have 10 words or
 * fewer, indexed to the average day of 7–13 Sep 2026 (the week the first page went live) = 100.
 *
 * New on 5 Nov (Arnel's decision): "toptal alternatives", "maze alternatives" and "upwork alternatives" logged more
 * impressions in 28 Oct–3 Nov than their monthly US search volume (DataForSEO), so they are treated as automated
 * (AI assistants or rank trackers) and left out of every day, baseline included. None of the three had an
 * impression in August or in 7–13 Sep, so the baseline and the August average are the same with or without them.
 * The ranking of "upwork alternatives" is still real and keeps its own table row.
 *
 * GSC revised the baseline week slightly: today's pull reads 7–13 Sep at 12.9 a day against the 13.3 published on
 * 18 Oct, so the old method now gives 12.6× for 10–16 Oct (published 12×) and 5.1× the August average (published
 * 5.0×). That is accepted, not a failure. Under the new method the same 10–16 Oct window reads 10.9×.
 *
 * The chart ends on 3 Nov, the last day of the pull and the day its trailing 7-day mean is highest (never end a
 * chart on a dip, Arnel, 18 Oct 2026). The AI figures (2.2×, result2, result3, engineBeforeAfter, aiSource) keep
 * their 16 Oct window: 14 of the 30 Peec prompts they were measured on have since been deleted.
 *
 * Input: --gsc <gsc-cli JSON for sc-domain:joinpond.ai, dimensions date + query, 1 Aug – 3 Nov 2026:
 * { rows: [{ keys: [date, query], clicks, impressions, position }] }>. Raw counts never leave this script: it prints
 * only multiples, positions and dates.
 *
 * Every expected figure must reproduce, and every replaced sentence must exist exactly once, or nothing is written.
 *
 *   SANITY_API_TOKEN=… node scripts/instruments/refresh-pond-2026-11-05.mjs --gsc <f> [--write]
 */
import { createClient } from '@sanity/client';
import { readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const gscPath = args[args.indexOf('--gsc') + 1];
if (!args.includes('--gsc') || !gscPath || gscPath.startsWith('--')) throw new Error('--gsc <file> is required');
const token = process.env.SANITY_API_TOKEN;
if (!token) throw new Error('SANITY_API_TOKEN missing');
const client = createClient({ projectId: 'xjjjqhgt', dataset: 'production', apiVersion: '2025-03-29', token, useCdn: false });

const DOC_ID = 'caseStudy-pond-ai';
const START = '2026-08-01';
const END = '2026-11-03';
const CHART_START = '2026-08-22';
const AUTOMATED = new Set(['toptal alternatives', 'maze alternatives', 'upwork alternatives']);
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const r1 = (v) => Math.round(v * 10) / 10;
const plus = (d, n) => new Date(Date.parse(`${d}T00:00:00Z`) + n * 864e5).toISOString().slice(0, 10);
const days = [];
for (let d = START; d <= END; d = plus(d, 1)) days.push(d);
const between = (a, b) => days.filter((d) => d >= a && d <= b);

/* ── Search Console ─────────────────────────────────────────────────── */
const rows = JSON.parse(readFileSync(gscPath, 'utf8')).rows.filter((r) => r.keys[0] >= START && r.keys[0] <= END);
const lastDay = rows.reduce((m, r) => (r.keys[0] > m ? r.keys[0] : m), '');
if (lastDay !== END) throw new Error(`pull ends ${lastDay}, need ${END}`);
const outsideName = (q) => {
  const l = q.toLowerCase();
  return !l.includes('pond') && !l.includes('joinground') && !l.includes('site:') && !q.includes('<') && q.trim().split(/\s+/).length <= 10;
};
const dailyTotals = (keep) => {
  const m = new Map(days.map((d) => [d, { c: 0, i: 0 }]));
  for (const r of rows) if (keep(r.keys[1])) { const e = m.get(r.keys[0]); e.c += r.clicks; e.i += r.impressions; }
  return m;
};
const series = (keep) => {
  const m = dailyTotals(keep);
  const avg = (a, b, k) => { const ds = between(a, b); return ds.reduce((t, d) => t + m.get(d)[k], 0) / ds.length; };
  const base = avg('2026-09-07', '2026-09-13', 'i');
  const baseClk = avg('2026-09-07', '2026-09-13', 'c');
  const aug = avg('2026-08-01', '2026-08-31', 'i');
  const x = (a, b) => avg(a, b, 'i') / base;
  const mean7 = (d) => avg(plus(d, -6), d, 'i') / base;
  return { m, avg, base, baseClk, aug, x, mean7 };
};
const oldM = series(outsideName);
const newM = series((q) => outsideName(q) && !AUTOMATED.has(q));

// The old method roughly reproduces the shipped 12× and 5.0× (GSC revised the baseline week from 13.3 to 12.9 a day)
const old = {
  base: r1(oldM.base), x1016: r1(oldM.x('2026-10-10', '2026-10-16')),
  aug1016: r1(oldM.avg('2026-10-10', '2026-10-16', 'i') / oldM.aug),
};
const expectOld = { base: 12.9, x1016: 12.6, aug1016: 5.1 };
for (const [k, e] of Object.entries(expectOld)) if (old[k] !== e) throw new Error(`old method ${k}: expected ${e}, data says ${old[k]}`);
if (newM.base !== oldM.base || newM.aug !== oldM.aug) throw new Error('the left-out queries touch the baseline or August; the comment above is wrong');

// New method, the seven days to 3 Nov
const WIN = ['2026-10-28', END];
const chartEnd = between('2026-09-13', END).reduce((a, d) => (newM.mean7(d) > newM.mean7(a) ? d : a), '2026-09-13');
const weekly = ['2026-08-24', '2026-08-31', '2026-09-07', '2026-09-14', '2026-09-21', '2026-09-28', '2026-10-05', '2026-10-12', '2026-10-19', '2026-10-26']
  .map((w) => [w, r1(newM.x(w, plus(w, 6)))]);
const f = {
  x: r1(newM.x(...WIN)), xAug: r1(newM.avg(...WIN, 'i') / newM.aug), x1016: r1(newM.x('2026-10-10', '2026-10-16')),
  chartEnd, peak7: r1(newM.mean7(chartEnd)),
  clkVsBaseWeek: r1(newM.avg(...WIN, 'c') / newM.baseClk),
};
const expectNew = { x: 44.7, xAug: 18, x1016: 10.9, chartEnd: END, peak7: 44.7, clkVsBaseWeek: 0.8 };
for (const [k, e] of Object.entries(expectNew)) if (f[k] !== e) throw new Error(`copy says ${k} = ${e}, data says ${f[k]}`);
// "The climb starts in the week of 21 September": every week from 21 Sep is above the one before
const wk = Object.fromEntries(weekly);
if (!(wk['2026-09-21'] > wk['2026-09-14'] && weekly.slice(4).every(([, v], i) => v > weekly[i + 3][1]))) throw new Error(`weekly index no longer climbs from 21 Sep: ${JSON.stringify(weekly)}`);
// "no more clicks than in the week the first page went live"
if (f.clkVsBaseWeek > 1) throw new Error('clicks outside the name now exceed the baseline week; rewrite the note on scale');
const X = `${Math.round(f.x)}×`; // 45×
const XAUG = `${Math.round(f.xAug)}×`; // 18×

// "upwork alternatives" in Google: impression-weighted average position, and page 1 (daily average position ≤ 10)
const up = new Map(rows.filter((r) => r.keys[1] === 'upwork alternatives').map((r) => [r.keys[0], r]));
const upPos = (a, b) => { const rs = between(a, b).map((d) => up.get(d)).filter(Boolean); return rs.reduce((t, r) => t + r.position * r.impressions, 0) / rs.reduce((t, r) => t + r.impressions, 0); };
const onPage1 = (d) => up.has(d) && up.get(d).position <= 10;
const upwork = {
  pos1016: r1(upPos('2026-10-10', '2026-10-16')), posWin: r1(upPos(...WIN)),
  firstPage1: between('2026-09-07', END).find(onPage1),
  offSince6Oct: between('2026-10-06', END).filter((d) => !onPage1(d)).join(','),
  page1Since20Oct: between('2026-10-20', END).every(onPage1),
};
const expectUp = { pos1016: 7.5, posWin: 6.3, firstPage1: '2026-09-28', offSince6Oct: '2026-10-17,2026-10-18,2026-10-19', page1Since20Oct: true };
for (const [k, e] of Object.entries(expectUp)) if (upwork[k] !== e) throw new Error(`upwork ${k}: expected ${e}, data says ${upwork[k]}`);

/* ── Document ───────────────────────────────────────────────────────── */
const doc = await client.getDocument(DOC_ID);
if (!doc) throw new Error(`no document ${DOC_ID}`);
if (doc.result1Number !== '12×' || doc.result2Number !== '2.2×' || doc.result3Number !== '1 day') throw new Error('result cards changed since 18 Oct');
if (doc.instruments.publishedResult) throw new Error('the doc now has publishedResult rows; check them for 12× / 5.0× before writing');
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
    'A note on scale first. These are early results from the first six weeks of publishing. AI mentions are up 2.2x, but Pond is still named in about 2% of answers. Google is sending real impressions to the new pages but few clicks so far.',
    `A note on scale first. These are early results: the AI figures cover the first six weeks of publishing and the Google figures the first eight. AI mentions are up 2.2×, but Pond is still named in about 2% of answers. Google impressions outside Pond's name are up ${X}, but those searches still bring few clicks so far.`,
  ],
  [
    '<td>Average position 7.5 (10 to 16 Oct)</td><td>First on page 1 on 28 Sep; on page 1 every day since 6 Oct, 29 days in</td>',
    `<td>Average position ${upwork.posWin.toFixed(1)} (28 Oct to 3 Nov)</td><td>First on page 1 on 28 Sep; on page 1 every day since 20 Oct, after dropping off it on 17 to 19 Oct</td>`,
  ],
  [
    'Impressions from searches that don\'t contain "pond" grew 12x from the week the first new page went live (7 to 13 September) to the week to 16 October, and ran 5.0x their August daily average.',
    `Impressions from searches that don't contain "pond" grew ${X} from the week the first new page went live (7 to 13 September) to the seven days to 3 November, and ran ${XAUG} their August daily average. Three searches whose impressions ran above their monthly search volume are left out of these counts.`,
  ],
  [
    'Google Search Console to 16 October, publish dates from Pond\'s CMS.</p>',
    'Google Search Console to 16 October, publish dates from Pond\'s CMS. Updated 5 November 2026 with Search Console data to 3 November; the AI figures keep their 16 October window.</p>',
  ],
], 'mainBody');

const paragraphSummary = swap(doc.paragraphSummary, [[
  'Google impressions outside Pond\'s own name grew 12x from the week the first page went live.',
  `Google impressions outside Pond's own name grew ${X} from the week the first page went live to the seven days to 3 November 2026.`,
]], 'paragraphSummary');

/* Daily chart, rebuilt from 22 Aug to 3 Nov on the new method (same keys and rounding as the 18 Oct build) */
const it = doc.instruments.indexedTrend;
if (it.points[0].date !== CHART_START || it.points.at(-1).date !== '2026-10-16') throw new Error(`chart runs ${it.points[0].date} to ${it.points.at(-1).date}`);
const points = between(CHART_START, f.chartEnd).map((d) => {
  const e = newM.m.get(d);
  return {
    _key: `d-${d}`, _type: 'object', date: d, month: MONTHS[Number(d.slice(5, 7)) - 1],
    clicks: Math.round((e.c / newM.baseClk) * 100), impressions: r1((e.i / newM.base) * 100),
  };
});
const indexedTrend = {
  ...it,
  points,
  caption: swap(it.caption, [[
    'The 7 days to 16 October ran 12x that week, and 5.0x the August average. Searches written as AI-agent prompts are left out.',
    `The 7 days to 3 November ran ${X} that week, and ${XAUG} the August average. Searches written as AI-agent prompts are left out, and so are three searches whose impressions ran above their monthly search volume. Daily to 3 Nov 2026.`,
  ]], 'indexedTrend.caption'),
};

const patch = {
  result1Number: X,
  result1Title: "Google impressions per day outside Pond's name, week the first new page went live (7 to 13 Sep) to the 7 days to 3 Nov 2026",
  paragraphSummary,
  mainBody,
  'instruments.indexedTrend': indexedTrend,
  'instruments.gscSource': 'Google Search Console · indexed to 7–13 Sep 2026 = 100 · to 3 Nov 2026 · three searches whose impressions ran above their search volume left out',
};

console.log(JSON.stringify({ old, fresh: f, weekly, upwork, chartPoints: points.length, firstPoint: points[0].date, lastPoint: points.at(-1).date }, null, 1));
if (!WRITE) { console.log('\ndry run: nothing written (add --write)'); process.exit(0); }
const res = await client.patch(DOC_ID).ifRevisionId(doc._rev).set(patch).commit();
console.log(`patched ${res._id} rev ${res._rev}`);
