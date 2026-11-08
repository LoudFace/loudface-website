/**
 * Correct the Hayes Media case study's Search Console figures (8 Nov 2026): leave out the 20 European countries
 * whose Google impressions jumped together on 28 Oct across most client sites, with almost no clicks (house finding,
 * 7 Nov; source unknown, not people). Every Search Console figure drops them, the 2–8 Sep baseline included. The
 * window stays the newest complete Monday week, 27 Oct – 2 Nov (final data reached 6 Nov on 8 Nov).
 *
 * Same measures as refresh-hayes-media-2026-11-05.mjs: non-branded means a query without "hayes", counted over the
 * query+page rows Search Console names; baseline is the program's first week, 2–8 Sep. The $6,000 deal, the $50M
 * brand's call, the testimonial and the article claims are left alone.
 *
 * Input: --gsc <the 8 Nov Executor pull: { countriesLeftOut: [20 ISO codes], weeks: { '2026-09-02' | '2026-10-27':
 * { withE | noE: { queries, queriesTop10, impressions } } }, daily: [[date, impressions all, impressions without the
 * countries, clicks all], …] from 2 Sep }>. Raw counts never leave this script; only multiples are printed.
 *
 * The shipped 5 Nov figures (16.6×, 29.5×, 21.6×, 7.9×, 11.6× on 30 Oct, 12.0× on 3 Nov, all 63 chart points) must
 * reproduce from the with-countries values, and every replaced sentence must exist exactly once, or nothing is written.
 *
 * The daily chart is rebuilt from impressions without the countries (clicks as given, all countries), baseline = the
 * 2–8 Sep daily average of each series, and ends on the day with the highest trailing seven-day mean of impressions
 * (the case page and homepage tile draw that mean), so the line never ends on a dip.
 *
 *   SANITY_API_TOKEN=… node scripts/instruments/refresh-hayes-media-2026-11-08.mjs --gsc <f> [--out <review.json>] [--write]
 */
import { createClient } from '@sanity/client';
import { readFileSync, writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const gscPath = args[args.indexOf('--gsc') + 1];
if (!args.includes('--gsc') || !gscPath || gscPath.startsWith('--')) throw new Error('--gsc <file> is required');
const token = process.env.SANITY_API_TOKEN;
if (!token) throw new Error('SANITY_API_TOKEN missing');
const client = createClient({ projectId: 'xjjjqhgt', dataset: 'production', apiVersion: '2025-03-29', token, useCdn: false });

const DOC_ID = 'caseStudy-hayes-media-organic-leads';
const EXPECT_REV = 'KEfGATQEDmK9MSLdCVTcDK'; // the 5 Nov refresh, as reviewed
const WEEK_START = '2026-10-27';
const WEEK_END = '2026-11-02';
const SHIPPED_END = '2026-11-03';
const r1 = (v) => Math.round(v * 10) / 10;
const x1 = (v) => `${v.toFixed(1)}×`;

/* ── Search Console ─────────────────────────────────────────────────── */
const g = JSON.parse(readFileSync(gscPath, 'utf8'));
if (g.countriesLeftOut?.length !== 20) throw new Error(`expected 20 countries left out, pull has ${g.countriesLeftOut?.length}`);
const daily = g.daily;
const [ALL, NOE, CLK] = [1, 2, 3];
if (daily[0][0] !== '2026-09-02') throw new Error(`pull starts ${daily[0][0]}`);
daily.forEach(([d], n) => {
  const want = new Date(Date.UTC(2026, 8, 2 + n)).toISOString().slice(0, 10);
  if (d !== want) throw new Error(`daily row ${n} is ${d}, expected ${want} (gap in the pull)`);
});
const range = (a, b) => daily.filter(([d]) => d >= a && d <= b);
const sum = (rs, i) => rs.reduce((t, r) => t + r[i], 0);
const day = (d) => daily.find(([x]) => x === d);
const first = range('2026-09-02', '2026-09-08');
const wk = range(WEEK_START, WEEK_END);
if (first.length !== 7 || wk.length !== 7) throw new Error('both weeks must be complete');
const base = { [ALL]: sum(first, ALL) / 7, [NOE]: sum(first, NOE) / 7, [CLK]: sum(first, CLK) / 7 };
const { '2026-09-02': w0, '2026-10-27': w1 } = g.weeks;
const nb = (k) => ({
  queries: r1(w1[k].queries / w0[k].queries),
  top10: r1(w1[k].queriesTop10 / w0[k].queriesTop10),
  nbImp: r1(w1[k].impressions / w0[k].impressions),
});
const best = (i) => wk.reduce((a, b) => (b[i] > a[i] ? b : a));
const point = (imp) => (r, n) => ({
  _key: `d-${n}`, date: r[0], month: new Date(`${r[0]}T00:00:00Z`).toLocaleString('en', { month: 'short', timeZone: 'UTC' }),
  impressions: Math.round((r[imp] / base[imp]) * 100), clicks: Math.round((r[CLK] / base[CLK]) * 100),
});

// 1. the shipped 5 Nov figures reproduce from the with-countries values
const shipped = {
  ...nb('withE'),
  allImp: r1(sum(wk, ALL) / sum(first, ALL)),
  bestDay: best(ALL)[0], bestDayX: r1(best(ALL)[ALL] / base[ALL]),
  chartEndX: r1(day(SHIPPED_END)[ALL] / base[ALL]),
};
const expectOld = { queries: 16.6, top10: 29.5, nbImp: 21.6, allImp: 7.9, bestDay: '2026-10-30', bestDayX: 11.6, chartEndX: 12 };
for (const [k, e] of Object.entries(expectOld)) if (shipped[k] !== e) throw new Error(`shipped ${k} = ${e}, data says ${shipped[k]}`);

// 2. the corrected figures, countries left out
const trailing = daily.slice(6).map((r, n) => ({ date: r[0], mean: sum(daily.slice(n, n + 7), NOE) / 7 / base[NOE] }));
const peak = trailing.reduce((a, b) => (b.mean > a.mean ? b : a));
const CHART_END = peak.date;
const f = {
  ...nb('noE'),
  allImp: r1(sum(wk, NOE) / sum(first, NOE)),
  bestDay: best(NOE)[0], bestDayX: r1(best(NOE)[NOE] / base[NOE]),
  chartEnd: CHART_END, chartEndMeanX: r1(peak.mean),
  clicksWk: r1(sum(wk, CLK) / sum(first, CLK)),
};
// clicksWk < 1 keeps "site-wide clicks have not moved yet" true
const expectNew = { queries: 15.1, top10: 20.5, nbImp: 19.5, allImp: 6.3, bestDay: '2026-10-30', bestDayX: 8.8, chartEnd: '2026-11-05', chartEndMeanX: 7.3, clicksWk: 0.7 };
for (const [k, e] of Object.entries(expectNew)) if (f[k] !== e) throw new Error(`copy says ${k} = ${e}, data says ${f[k]}`);

/* ── Document ───────────────────────────────────────────────────────── */
const doc = await client.getDocument(DOC_ID);
if (!doc) throw new Error(`no document ${DOC_ID}`);
if (doc._rev !== EXPECT_REV) throw new Error(`document is at rev ${doc._rev}, reviewed against ${EXPECT_REV}; re-read it first`);
if (await client.getDocument(`drafts.${DOC_ID}`)) throw new Error('an unpublished draft exists; publish or discard it first');
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
    'the non-branded searches that show Hayes Media grew 16.6× and the non-branded searches where it ranks on Google’s first page grew 29.5×, from the program’s first week',
    `the non-branded searches that show Hayes Media grew ${x1(f.queries)} and the non-branded searches where it ranks on Google’s first page grew ${x1(f.top10)}, from the program’s first week`,
  ],
  ['<h3>Google: 16.6× the searches, 29.5× on page one</h3>', `<h3>Google: ${x1(f.queries)} the searches, ${x1(f.top10)} on page one</h3>`],
  [
    '<tr><td><strong>Non-branded searches that show Hayes Media</strong></td><td><strong>16.6×</strong></td></tr>',
    `<tr><td><strong>Non-branded searches that show Hayes Media</strong></td><td><strong>${x1(f.queries)}</strong></td></tr>`,
  ],
  [
    '<tr><td><strong>Non-branded searches where it ranks on page one</strong></td><td><strong>29.5×</strong></td></tr>',
    `<tr><td><strong>Non-branded searches where it ranks on page one</strong></td><td><strong>${x1(f.top10)}</strong></td></tr>`,
  ],
  ['<tr><td>Non-branded impressions</td><td>21.6×</td></tr>', `<tr><td>Non-branded impressions</td><td>${x1(f.nbImp)}</td></tr>`],
  ['<tr><td>All impressions, branded included</td><td>7.9×</td></tr>', `<tr><td>All impressions, branded included</td><td>${x1(f.allImp)}</td></tr>`],
  [
    'the best day in it, 30 October, ran 11.6× the first week’s daily average.',
    `the best day in it, 30 October, ran ${x1(f.bestDayX)} the first week’s daily average.`,
  ],
  [
    'Updated 5 November 2026 with Search Console data to 3 November.',
    'Updated 5 November 2026 with Search Console data to 3 November. Updated 8 November 2026: Search Console figures now leave out 20 European countries whose searches jumped together on 28 October with almost no clicks.',
  ],
], 'mainBody');

const paragraphSummary = swap(doc.paragraphSummary, [
  [
    'grew 16.6× from the program’s first week (2–8 September 2026) to the week of 27 October, and the non-branded searches where it ranks on page one grew 29.5×.',
    `grew ${x1(f.queries)} from the program’s first week (2–8 September 2026) to the week of 27 October, and the non-branded searches where it ranks on page one grew ${x1(f.top10)}.`,
  ],
], 'paragraphSummary');

/* Daily chart: every shipped point must reproduce from all impressions, then the whole line is rebuilt without the
   countries and ends where its seven-day mean peaks */
const it = doc.instruments.indexedTrend;
const shippedPts = daily.filter(([d]) => d <= SHIPPED_END).map(point(ALL));
if (it.points.length !== 63 || it.points.at(-1).date !== SHIPPED_END) throw new Error(`chart ends ${it.points.at(-1).date} with ${it.points.length} points`);
it.points.forEach((p, n) => {
  const q = shippedPts[n];
  if (p._key !== q._key || p.date !== q.date || p.month !== q.month || p.impressions !== q.impressions || p.clicks !== q.clicks) throw new Error(`chart point ${p._key} ${p.date} does not reproduce`);
});
const points = daily.filter(([d]) => d <= CHART_END).map(point(NOE));
const lastMean = points.slice(-7).reduce((t, p) => t + p.impressions, 0) / 7 / 100;
if (r1(lastMean) !== f.chartEndMeanX) throw new Error(`chart's last seven-day mean ${lastMean} disagrees with ${f.chartEndMeanX}`);
const indexedTrend = {
  ...it,
  points,
  caption: swap(it.caption, [[
    'The seven days to 2 November averaged 7.9× that week, and 3 November alone 12.0×.',
    `The seven days to 2 November averaged ${x1(f.allImp)} that week, and the seven days to 5 November ${x1(f.chartEndMeanX)}.`,
  ]], 'indexedTrend.caption'),
};

const pr = doc.instruments.publishedResult;
if (pr.rows.map((r) => r.value).join('|') !== '16.6×|29.5×|$6,000') throw new Error('publishedResult rows changed since 5 Nov');
const publishedResult = {
  ...pr,
  rows: pr.rows.map((r) => {
    if (r._key === 'r-0') return { ...r, value: x1(f.queries) };
    if (r._key === 'r-1') return { ...r, value: x1(f.top10) };
    return r;
  }),
};

const gscSource = swap(doc.instruments.gscSource, [[
  'Google Search Console · daily, 2 Sep – 3 Nov 2026 · indexed to 2–8 Sep = 100',
  'Google Search Console · daily, 2 Sep – 5 Nov 2026 · indexed to 2–8 Sep = 100 · impressions from 20 European countries whose searches jumped together on 28 Oct across many sites, with almost no clicks, are left out',
]], 'gscSource');

if (doc.result2Number !== '16.6×' || doc.result3Number !== '29.5×') throw new Error('result numbers changed since 5 Nov');
const patch = {
  result2Number: x1(f.queries),
  result3Number: x1(f.top10),
  paragraphSummary,
  mainBody,
  'instruments.indexedTrend': indexedTrend,
  'instruments.publishedResult': publishedResult,
  'instruments.gscSource': gscSource,
};

// framing: no system words in the patched copy. "engine" already appears in the body only as "generative engine
// optimization", "an engine can quote" and the Delshad study's slug; anything else fails.
const copy = JSON.stringify([patch.paragraphSummary, patch.mainBody, indexedTrend.caption, publishedResult, gscSource]).toLowerCase();
const framing = ['system', 'autopilot', 'runs itself'].filter((w) => copy.includes(w));
const engines = copy.replaceAll('generative engine optimization', '').replaceAll('an engine can quote', '').replaceAll('content-engine', '');
if (engines.includes('engine')) framing.push('engine');
if (framing.length) throw new Error(`framing: ${framing.join(', ')} in the copy`);

console.log(JSON.stringify({ shipped, fresh: f, chart: { from: points[0].date, to: points.at(-1).date, points: points.length } }, null, 1));
const outPath = args.includes('--out') ? args[args.indexOf('--out') + 1] : null;
if (outPath) writeFileSync(outPath, JSON.stringify({ before: doc, patch }, null, 1));
if (!WRITE) { console.log('\ndry run: nothing written (add --write)'); process.exit(0); }
const res = await client.patch(DOC_ID).ifRevisionId(doc._rev).set(patch).commit();
console.log(`patched ${res._id} rev ${res._rev}`);
