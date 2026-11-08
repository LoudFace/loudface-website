/**
 * Refresh the Pond case study on 8 Nov 2026: Google impressions outside Pond's name to the seven days ending 6 Nov
 * (Search Console final data reached 6 Nov), with 20 European countries left out of the whole series.
 *
 * Method (unchanged from refresh-pond-2026-11-05.mjs): daily impressions from queries that do not contain "pond" or
 * "joinground", are not "site:" searches, carry no "<" and have 10 words or fewer, indexed to the average day of
 * 7–13 Sep 2026 (the week the first page went live) = 100. "toptal alternatives", "maze alternatives" and
 * "upwork alternatives" stay out of every day (their impressions ran above their monthly search volume, 5 Nov).
 *
 * New on 8 Nov (Arnel's decision): a house finding on 7 Nov showed most client sites' Google impressions jumping on
 * 28 Oct in the same ~20 European countries, with almost no clicks: not people, source unknown. On Pond 10 of them
 * jumped (dnk aut nor ita bel prt grc swe hun irl), and the 5 Nov figure (45×) included them. All 20 countries are
 * left out of every day, baseline and August included, for impressions and clicks alike. The "upwork alternatives"
 * ranking is read without them too: 77% of that query's impressions in 28 Oct–6 Nov came from these countries
 * (12% before), and their rows carry better positions than the rest (about 5 against 8 on 28–30 Oct).
 *
 * Check (1): with the countries kept, the 5 Nov method still gives 44.7× (published 45×) and 18× the August average
 * for 28 Oct–3 Nov on this final pull. Without them the same window reads 39.5×.
 *
 * The chart ends on 6 Nov, the last day of the pull and the day its trailing 7-day mean is highest (never end a
 * chart on a dip, Arnel, 18 Oct 2026); 4 and 5 Nov sit just below it. The AI figures (2.2×, result2, result3,
 * engineBeforeAfter, aiSource) are not touched.
 *
 * Input: one or more --gsc <gsc-cli JSON for sc-domain:joinpond.ai, dimensions date + query + country, together
 * covering 1 Aug – 6 Nov 2026: { rows: [{ keys: [date, query, country], clicks, impressions, position }] }>.
 * Raw counts never leave this script: it prints only multiples, shares, positions and dates.
 *
 * Every expected figure must reproduce, the document must still be at the reviewed revision, and every replaced
 * sentence must exist exactly once, or nothing is written.
 *
 *   SANITY_API_TOKEN=… node scripts/instruments/refresh-pond-2026-11-08.mjs \
 *     --gsc pond-dqc-aug.json --gsc pond-dqc-sep.json --gsc pond-dqc-oct.json --gsc pond-dqc-nov.json [--show] [--write]
 */
import { createClient } from '@sanity/client';
import { readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const gscPaths = args.flatMap((a, i) => (a === '--gsc' ? [args[i + 1]] : []));
if (!gscPaths.length || gscPaths.some((p) => !p || p.startsWith('--'))) throw new Error('--gsc <file> is required (repeatable)');
const token = process.env.SANITY_API_TOKEN;
if (!token) throw new Error('SANITY_API_TOKEN missing');
const client = createClient({ projectId: 'xjjjqhgt', dataset: 'production', apiVersion: '2025-03-29', token, useCdn: false });

const DOC_ID = 'caseStudy-pond-ai';
const REVIEWED_REV = 'd1CGWMLeJH0BJgw0CIVmZH'; // the published copy the 8 Nov copy was written against
const START = '2026-08-01';
const END = '2026-11-06';
const CHART_START = '2026-08-22';
const AUTOMATED = new Set(['toptal alternatives', 'maze alternatives', 'upwork alternatives']);
const COUNTRIES_OUT = new Set('deu fra esp ita nld aut prt irl bel dnk hun nor grc swe che pol rou cze fin rus'.split(' '));
if (COUNTRIES_OUT.size !== 20) throw new Error('country list must hold 20 codes');
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const r1 = (v) => Math.round(v * 10) / 10;
const plus = (d, n) => new Date(Date.parse(`${d}T00:00:00Z`) + n * 864e5).toISOString().slice(0, 10);
const days = [];
for (let d = START; d <= END; d = plus(d, 1)) days.push(d);
const between = (a, b) => days.filter((d) => d >= a && d <= b);

/* ── Search Console ─────────────────────────────────────────────────── */
const rows = [];
const seen = new Set();
for (const p of gscPaths) {
  const fileRows = JSON.parse(readFileSync(p, 'utf8')).rows;
  if (fileRows.length >= 25000) throw new Error(`${p} holds ${fileRows.length} rows, the API page limit: the pull may be cut off`);
  for (const r of fileRows) {
    if (r.keys.length !== 3) throw new Error(`${p}: rows need keys [date, query, country]`);
    if (r.keys[0] < START || r.keys[0] > END) continue;
    const k = JSON.stringify(r.keys);
    if (seen.has(k)) throw new Error(`row ${k} appears twice across the --gsc files`);
    seen.add(k);
    rows.push(r);
  }
}
const dated = new Set(rows.map((r) => r.keys[0]));
const missing = days.filter((d) => !dated.has(d));
if (missing.length) throw new Error(`no rows for ${missing.length} day(s), first ${missing[0]}; the pull must cover ${START} to ${END}`);

const outsideName = (q) => {
  const l = q.toLowerCase();
  return !l.includes('pond') && !l.includes('joinground') && !l.includes('site:') && !q.includes('<') && q.trim().split(/\s+/).length <= 10;
};
const series = (keep) => {
  const m = new Map(days.map((d) => [d, { c: 0, i: 0 }]));
  for (const r of rows) if (keep(r)) { const e = m.get(r.keys[0]); e.c += r.clicks; e.i += r.impressions; }
  const avg = (a, b, k) => { const ds = between(a, b); return ds.reduce((t, d) => t + m.get(d)[k], 0) / ds.length; };
  const base = avg('2026-09-07', '2026-09-13', 'i');
  const baseClk = avg('2026-09-07', '2026-09-13', 'c');
  const aug = avg('2026-08-01', '2026-08-31', 'i');
  const x = (a, b) => avg(a, b, 'i') / base;
  const mean7 = (d) => avg(plus(d, -6), d, 'i') / base;
  return { m, avg, base, baseClk, aug, x, mean7 };
};
const keptM = series((r) => outsideName(r.keys[1]) && !AUTOMATED.has(r.keys[1]));
const newM = series((r) => outsideName(r.keys[1]) && !AUTOMATED.has(r.keys[1]) && !COUNTRIES_OUT.has(r.keys[2]));
if (!(newM.baseClk > 0)) throw new Error('no clicks in the baseline week without the countries; the clicks index cannot be built');

// (1) With the countries kept, the 5 Nov method reproduces the shipped 45× and 18× for 28 Oct–3 Nov
const WIN_5NOV = ['2026-10-28', '2026-11-03'];
const kept = {
  base: r1(keptM.base), x: r1(keptM.x(...WIN_5NOV)), xAug: r1(keptM.avg(...WIN_5NOV, 'i') / keptM.aug),
  x1016: r1(keptM.x('2026-10-10', '2026-10-16')),
};
const expectKept = { base: 12.9, x: 44.7, xAug: 18, x1016: 10.9 };
for (const [k, e] of Object.entries(expectKept)) if (kept[k] !== e) throw new Error(`countries kept, ${k}: expected ${e} (5 Nov script), data says ${kept[k]}`);

// (2) New method, the seven days to 6 Nov
const WIN = ['2026-10-31', END];
const chartEnd = between('2026-09-13', END).reduce((a, d) => (newM.mean7(d) > newM.mean7(a) ? d : a), '2026-09-13');
const weekly = ['2026-08-24', '2026-08-31', '2026-09-07', '2026-09-14', '2026-09-21', '2026-09-28', '2026-10-05', '2026-10-12', '2026-10-19', '2026-10-26']
  .map((w) => [w, r1(newM.x(w, plus(w, 6)))]);
const share = (a, b) => {
  let all = 0, out = 0;
  for (const r of rows) {
    if (r.keys[0] < a || r.keys[0] > b || !outsideName(r.keys[1]) || AUTOMATED.has(r.keys[1])) continue;
    all += r.impressions; if (COUNTRIES_OUT.has(r.keys[2])) out += r.impressions;
  }
  return r1((100 * out) / all);
};
const f = {
  base: r1(newM.base),
  x: r1(newM.x(...WIN)), xAug: r1(newM.avg(...WIN, 'i') / newM.aug),
  x5NovWin: r1(newM.x(...WIN_5NOV)),
  chartEnd, peak7: r1(newM.mean7(chartEnd)),
  clkVsBaseWeek: r1(newM.avg(...WIN, 'c') / newM.baseClk),
  ctrWinPct: r1((100 * newM.avg(...WIN, 'c')) / newM.avg(...WIN, 'i')),
  countriesSharePct: { baseWeek: share('2026-09-07', '2026-09-13'), aug: share('2026-08-01', '2026-08-31'), oct21to27: share('2026-10-21', '2026-10-27'), win: share(...WIN) },
};
const expectNew = { base: 11.3, x: 41.2, xAug: 17.2, x5NovWin: 39.5, chartEnd: END, peak7: 41.2, clkVsBaseWeek: 0.6 };
for (const [k, e] of Object.entries(expectNew)) if (f[k] !== e) throw new Error(`copy says ${k} = ${e}, data says ${f[k]}`);
// "The climb starts in the week of 21 September": every week from 21 Sep is above the one before
const wk = Object.fromEntries(weekly);
if (!(wk['2026-09-21'] > wk['2026-09-14'] && weekly.slice(4).every(([, v], i) => v > weekly[i + 3][1]))) throw new Error(`weekly index no longer climbs from 21 Sep: ${JSON.stringify(weekly)}`);
// "those searches still bring few clicks so far": no more clicks a day than in the week the first page went live
if (f.clkVsBaseWeek > 1) throw new Error('clicks outside the name now exceed the baseline week; rewrite the note on scale');
const X = `${Math.round(f.x)}×`; // 41×
const XAUG = `${Math.round(f.xAug)}×`; // 17×

// "upwork alternatives" in Google, without the 20 countries: impression-weighted average position, and page 1
// (that day's impression-weighted position ≤ 10). The all-country reading is printed beside it for review.
const upworkFor = (keep) => {
  const daily = new Map();
  for (const r of rows) {
    if (r.keys[1] !== 'upwork alternatives' || !keep(r)) continue;
    const e = daily.get(r.keys[0]) ?? { w: 0, i: 0 };
    e.w += r.position * r.impressions; e.i += r.impressions; daily.set(r.keys[0], e);
  }
  const pos = (a, b) => { const es = between(a, b).map((d) => daily.get(d)).filter(Boolean); return es.reduce((t, e) => t + e.w, 0) / es.reduce((t, e) => t + e.i, 0); };
  const onPage1 = (d) => daily.has(d) && daily.get(d).w / daily.get(d).i <= 10;
  return {
    posWin: r1(pos(...WIN)), pos5NovWin: r1(pos(...WIN_5NOV)),
    firstPage1: between('2026-09-07', END).find(onPage1),
    offSince6Oct: between('2026-10-06', END).filter((d) => !onPage1(d)).join(','),
    page1From21Oct: between('2026-10-21', END).filter(onPage1).length,
    daysFrom21Oct: between('2026-10-21', END).length,
  };
};
const upwork = upworkFor((r) => !COUNTRIES_OUT.has(r.keys[2]));
const upworkAllCountries = upworkFor(() => true);
const expectUp = {
  posWin: 8.5, pos5NovWin: 8.3, firstPage1: '2026-09-28',
  offSince6Oct: '2026-10-17,2026-10-18,2026-10-19,2026-10-20,2026-11-03', page1From21Oct: 16, daysFrom21Oct: 17,
};
for (const [k, e] of Object.entries(expectUp)) if (upwork[k] !== e) throw new Error(`upwork ${k}: expected ${e}, data says ${upwork[k]}`);
if (upworkAllCountries.pos5NovWin !== 6.3) throw new Error(`upwork, all countries, 28 Oct–3 Nov: expected the published 6.3, data says ${upworkAllCountries.pos5NovWin}`);

/* ── Document ───────────────────────────────────────────────────────── */
const doc = await client.getDocument(DOC_ID);
if (!doc) throw new Error(`no document ${DOC_ID}`);
if (doc._rev !== REVIEWED_REV) throw new Error(`document is at rev ${doc._rev}, the copy was written against ${REVIEWED_REV}; re-read it before writing`);
const draft = await client.getDocument(`drafts.${DOC_ID}`);
if (draft) throw new Error(`drafts.${DOC_ID} exists; publishing it from Studio later would undo this patch, resolve it first`);
if (doc.result1Number !== '45×' || doc.result2Number !== '2.2×' || doc.result3Number !== '1 day') throw new Error('result cards changed since 5 Nov');
if (doc.instruments.publishedResult) throw new Error('the doc now has publishedResult rows; check them for 45× / 18× before writing');
const swap = (text, pairs, field) => {
  let out = text;
  for (const [from, to] of pairs) {
    const n = out.split(from).length - 1;
    if (n !== 1) throw new Error(`${field}: expected 1 match, found ${n}: "${from.slice(0, 90)}…"`);
    out = out.replace(from, to);
  }
  return out;
};
const COUNTRIES_LINE = 'impressions from 20 European countries whose searches jumped together on 28 October across many sites, with almost no clicks';

const mainBody = swap(doc.mainBody, [
  [
    "Google impressions outside Pond's name are up 45×, but those searches still bring few clicks so far.",
    `Google impressions outside Pond's name are up ${X}, but those searches still bring few clicks so far.`,
  ],
  [
    '<td>Average position 6.3 (28 Oct to 3 Nov)</td><td>First on page 1 on 28 Sep; on page 1 every day since 20 Oct, after dropping off it on 17 to 19 Oct</td>',
    `<td>Average position ${upwork.posWin.toFixed(1)} (31 Oct to 6 Nov)</td><td>First on page 1 on 28 Sep; on page 1 on ${upwork.page1From21Oct} of the ${upwork.daysFrom21Oct} days from 21 Oct to 6 Nov</td>`,
  ],
  [
    'Impressions from searches that don\'t contain "pond" grew 45× from the week the first new page went live (7 to 13 September) to the seven days to 3 November, and ran 18× their August daily average. Three searches whose impressions ran above their monthly search volume are left out of these counts.',
    `Impressions from searches that don't contain "pond" grew ${X} from the week the first new page went live (7 to 13 September) to the seven days to 6 November, and ran ${XAUG} their August daily average. Three searches whose impressions ran above their monthly search volume are left out of these counts, and so are ${COUNTRIES_LINE}.`,
  ],
  [
    'Updated 5 November 2026 with Search Console data to 3 November; the AI figures keep their 16 October window.</p>',
    'Updated 5 November 2026 with Search Console data to 3 November; the AI figures keep their 16 October window. Updated 8 November 2026 with Search Console data to 6 November; 20 European countries left out.</p>',
  ],
], 'mainBody');

const paragraphSummary = swap(doc.paragraphSummary, [[
  "Google impressions outside Pond's own name grew 45× from the week the first page went live to the seven days to 3 November 2026.",
  `Google impressions outside Pond's own name grew ${X} from the week the first page went live to the seven days to 6 November 2026.`,
]], 'paragraphSummary');

/* Daily chart, rebuilt from 22 Aug to the peak day on the new method (same keys and rounding as before) */
const it = doc.instruments.indexedTrend;
if (it.points[0].date !== CHART_START || it.points.at(-1).date !== '2026-11-03') throw new Error(`chart runs ${it.points[0].date} to ${it.points.at(-1).date}`);
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
    'The 7 days to 3 November ran 45× that week, and 18× the August average. Searches written as AI-agent prompts are left out, and so are three searches whose impressions ran above their monthly search volume. Daily to 3 Nov 2026.',
    `The 7 days to 6 November ran ${X} that week, and ${XAUG} the August average. Left out: searches written as AI-agent prompts, three searches whose impressions ran above their monthly search volume, and ${COUNTRIES_LINE}. Daily to 6 Nov 2026.`,
  ]], 'indexedTrend.caption'),
};

const patch = {
  result1Number: X,
  result1Title: "Google impressions per day outside Pond's name, week the first new page went live (7 to 13 Sep) to the 7 days to 6 Nov 2026",
  paragraphSummary,
  mainBody,
  'instruments.indexedTrend': indexedTrend,
  'instruments.gscSource': 'Google Search Console · indexed to 7–13 Sep 2026 = 100 · to 6 Nov 2026 · three searches whose impressions ran above their search volume left out · impressions from 20 European countries whose searches jumped together on 28 Oct across many sites, with almost no clicks, left out',
};

console.log(JSON.stringify({
  kept, fresh: f, weekly, upwork, upworkAllCountries,
  chartPoints: points.length, firstPoint: points[0].date, lastPoint: points.at(-1).date,
  lastPoints: points.slice(-4).map((p) => [p.date, p.impressions]),
}, null, 1));
if (args.includes('--show')) {
  const { 'instruments.indexedTrend': t, mainBody: _b, ...text } = patch;
  console.log(JSON.stringify({ ...text, caption: t.caption }, null, 1));
}
if (!WRITE) { console.log('\ndry run: nothing written (add --write)'); process.exit(0); }
const res = await client.patch(DOC_ID).ifRevisionId(doc._rev).set(patch).commit();
console.log(`patched ${res._id} rev ${res._rev}`);
