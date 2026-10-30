/**
 * Refresh the Delshad Legal case study on 30 Oct 2026: the clicks headline to the week of 18 Oct (the last
 * complete Sunday week), site-wide impressions to the seven days ending 27 Oct (Search Console final data),
 * and the Ahrefs Domain Rating reading to 26 Oct (still 25).
 *
 * The daily chart now runs to 27 Oct, where its trailing 7-day mean is highest (18.3× March), so it no longer
 * needs the 18 Oct trim (do not end a chart on a dip, Arnel, 18 Oct 2026). The AI figures keep their late-
 * September window: share of voice over the 30 days to 27 Oct read 28.7%, below the published 32.4%, though
 * still first of 12. The enquiry figures were not re-measured.
 *
 * Input: --gsc <the 30 Oct Executor pull: { result: { delshadAll: { rows }, delshadNonCeleb: { rows } } }>, daily
 * [date, clicks, impressions, position] rows of sc-domain:delshadlegal.com; delshadNonCeleb excludes pages matching
 * the celebrity-page pattern of refresh-delshad-2026-09-28.mjs. Raw counts never leave this script.
 *
 * Shipped figures (week of 7 Jun 52 clicks, week of 4 Oct 14.9×, 1–16 Oct 14.5× and 6.2, the 7 Oct chart point)
 * must reproduce, and every replaced sentence must exist exactly once, or nothing is written.
 *
 *   SANITY_API_TOKEN=… node scripts/instruments/refresh-delshad-2026-10-30.mjs --gsc <f> [--write]
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

const DOC_ID = 'caseStudy-delshad-legal-content-engine';
const END = '2026-10-27';
const r1 = (v) => Math.round(v * 10) / 10;
const x1 = (v) => `${r1(v).toFixed(1)}×`;

/* ── Search Console ─────────────────────────────────────────────────── */
const pull = JSON.parse(readFileSync(gscPath, 'utf8')).result;
const all = pull.delshadAll.rows.filter(([d]) => d <= END);
const clean = pull.delshadNonCeleb.rows.filter(([d]) => d <= END);
if (all.at(-1)[0] !== END) throw new Error(`pull ends ${all.at(-1)[0]}, need ${END}`);
const sum = (rs, i) => rs.reduce((t, r) => t + r[i], 0);
const range = (rs, a, b) => rs.filter(([d]) => d >= a && d <= b);
const plus = (d, n) => new Date(Date.parse(`${d}T00:00:00Z`) + n * 864e5).toISOString().slice(0, 10);
const week = (start) => { const rs = range(clean, start, plus(start, 6)); if (rs.length !== 7) throw new Error(`week of ${start} has ${rs.length} days`); return sum(rs, 1); };
const wpos = (rs) => rs.reduce((t, r) => t + r[2] * r[3], 0) / sum(rs, 2);
const mar = range(all, '2026-03-01', '2026-03-31');
const marImp = sum(mar, 2) / mar.length, marClk = sum(mar, 1) / mar.length;
const mean7 = (end) => { const i = all.findIndex(([d]) => d === end); return sum(all.slice(i - 6, i + 1), 2) / 7 / marImp; };

const base = week('2026-06-07');
if (base !== 52) throw new Error(`week of 7 Jun = ${base}, shipped 52`);
if (r1(week('2026-10-04') / base) !== 14.9) throw new Error('week of 4 Oct does not reproduce 14.9×');
const o16 = range(all, '2026-10-01', '2026-10-16');
if (r1(sum(o16, 2) / o16.length / marImp) !== 14.5 || r1(wpos(o16)) !== 6.2) throw new Error('1–16 Oct does not reproduce 14.5× / 6.2');
const p7 = all.find(([d]) => d === '2026-10-07');
if (Math.round((p7[1] / marClk) * 100) !== 1726 || Math.round((p7[2] / marImp) * 100) !== 1994) throw new Error('7 Oct chart point does not reproduce');

const win = range(all, '2026-10-21', END);
const f = {
  wk11: r1(week('2026-10-11') / base), wk18: r1(week('2026-10-18') / base),
  imp7: r1(sum(win, 2) / 7 / marImp), clk7: r1(sum(win, 1) / 7 / marClk), pos7: r1(wpos(win)),
  peak: range(all, '2026-10-08', END).reduce((a, [d]) => (mean7(d) >= mean7(a) ? d : a), '2026-10-07'),
};
const expect = { wk11: 13.2, wk18: 16, imp7: 18.3, clk7: 15.9, pos7: 5.9, peak: END };
for (const [k, e] of Object.entries(expect)) if (f[k] !== e) throw new Error(`copy says ${k} = ${e}, data says ${f[k]}`);
const W18 = x1(f.wk18);

/* ── Document ───────────────────────────────────────────────────────── */
const doc = await client.getDocument(DOC_ID);
if (!doc) throw new Error(`no document ${DOC_ID}`);
if (doc.result1Number !== '14.9×' || doc.result2Number !== '4.9 → 25') throw new Error('result cards changed since 18 Oct');
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
    'are 14.9× the week of 7 June, measured in Google Search Console for the week of 4 October,',
    `are ${W18} the week of 7 June, measured in Google Search Console for the week of 18 October,`,
  ],
  [
    'October went further: over 1–16 October, impressions per day ran 14.5× the March average and clicks per day 13×, and Ahrefs',
    'October went further: in the seven days to 27 October, impressions per day ran 18.3× the March average and clicks per day 15.9×, and Ahrefs',
  ],
  [
    'October went further: over 1–16 October, impressions per day ran 14.5× the March average and clicks per day 13×, at an average position of 6.2.',
    'October went further: over 1–16 October, impressions per day ran 14.5× the March average and clicks per day 13×, at an average position of 6.2, and the seven days to 27 October reached 18.3× and 15.9×, at an average position of 5.9.',
  ],
  ['<td><strong>14.9× (week of 4 Oct)</strong></td>', `<td><strong>${W18} (week of 18 Oct)</strong></td>`],
  [
    'and held at 14.9× in the week of 4 October.',
    `held at 14.9× in the week of 4 October, and reached ${W18} in the week of 18 October.`,
  ],
  ['where it stands on 18 October', 'where it stands on 26 October'],
  [
    'Updated 18 October 2026 with Search Console data to 16 October and Ahrefs Domain Rating to 18 October (the AI and enquiry figures keep their late-September windows); previously updated 9 October',
    'Updated 30 October 2026 with Search Console data to 27 October and Ahrefs Domain Rating to 26 October (the AI and enquiry figures keep their late-September windows); previously updated 18 October with Search Console data to 16 October, 9 October',
  ],
], 'mainBody');

const paragraphSummary = swap(doc.paragraphSummary, [
  ['reached 14.9× the week of 7 June in the week of 4 October 2026,', `reached ${W18} the week of 7 June in the week of 18 October 2026,`],
  [
    'over 1–16 October site-wide impressions per day ran 14.5× the March average.',
    'in the seven days to 27 October site-wide impressions per day ran 18.3× the March average.',
  ],
], 'paragraphSummary');

/* Weekly clicks outside the celebrity pages: add the weeks of 11 and 18 Oct */
const cg = doc.instruments.clickGrowth;
if (cg.points.at(-1).week !== '2026-10-04') throw new Error(`clicks series ends ${cg.points.at(-1).week}`);
const clickGrowth = {
  ...cg,
  points: [...cg.points, ...['2026-10-11', '2026-10-18'].map((w) => ({ _key: `cg-${w}`, value: Math.round((week(w) / base) * 100), week: w }))],
  source: swap(cg.source, [['7 Jun – 10 Oct 2026', '7 Jun – 24 Oct 2026']], 'clickGrowth.source'),
};

/* Daily chart: extend from 8 Oct to 27 Oct, its 7-day high, on the March index */
const it = doc.instruments.indexedTrend;
const last = it.points.at(-1);
if (last.date !== '2026-10-07') throw new Error(`chart ends ${last.date}`);
let n = Number(last._key.slice(2));
const add = all.filter(([d]) => d > last.date).map(([d, c, i]) => ({
  _key: `d-${++n}`, date: d, month: 'Oct', clicks: Math.round((c / marClk) * 100), impressions: Math.round((i / marImp) * 100),
}));
const indexedTrend = {
  ...it,
  points: [...it.points, ...add],
  caption: swap(it.caption, [[
    'then 14.5× over 1–16 October, with the seven days to 7 October at 16.2×, the high so far. Daily to 7 Oct 2026,',
    'then 14.5× over 1–16 October and 18.3× in the seven days to 27 October, the high so far. Daily to 27 Oct 2026,',
  ]], 'indexedTrend.caption'),
};

const pr = doc.instruments.publishedResult;
const publishedResult = {
  ...pr,
  rows: pr.rows.map((r) => ({
    'r-2': { ...r, value: W18, unit: 'Google clicks per week outside the celebrity pages, week of 7 Jun → week of 18 Oct' },
    'r-3': { ...r, unit: 'Ahrefs Domain Rating, 1 Jun → 26 Oct' },
  }[r._key] ?? r)),
};
if (pr.rows.find((r) => r._key === 'r-2')?.value !== '14.9×' || pr.rows.find((r) => r._key === 'r-3')?.value !== '4.9 → 25') throw new Error('publishedResult rows changed since 18 Oct');

const patch = {
  result1Number: W18,
  result1Title: 'Google clicks per week outside the celebrity-case pages, week of 7 Jun → week of 18 Oct 2026',
  result2Title: 'Ahrefs Domain Rating, 1 Jun → 26 Oct 2026',
  paragraphSummary,
  mainBody,
  'instruments.clickGrowth': clickGrowth,
  'instruments.indexedTrend': indexedTrend,
  'instruments.publishedResult': publishedResult,
  'instruments.gscSource': 'Google Search Console · indexed to Mar 2026 = 100 · to 27 Oct 2026',
};

console.log(JSON.stringify({ fresh: f, added: add.length, newWeeks: clickGrowth.points.slice(-2) }, null, 1));
if (!WRITE) { console.log('\ndry run: nothing written (add --write)'); process.exit(0); }
const res = await client.patch(DOC_ID).ifRevisionId(doc._rev).set(patch).commit();
console.log(`patched ${res._id} rev ${res._rev}`);
