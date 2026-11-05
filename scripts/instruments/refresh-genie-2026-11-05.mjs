/**
 * Refresh the Genie Teacher case study on 5 Nov 2026 with Search Console final data to 3 Nov and the Peec AI weekly
 * readings to the week of 26 Oct (the last complete Monday week). Only what improved moves:
 *
 *   - Clicks: the seven days to 3 Nov brought 80× the clicks of an average May week (shipped 72× for 21–27 Oct), the
 *     highest trailing seven days so far → result2 and every clicks sentence move to "7 days to 3 Nov".
 *   - Impressions: the seven days to 3 Nov ran 597× an average May day, below the shipped 623× (21–27 Oct) → result1,
 *     the name and every impressions sentence keep 21–27 Oct; the best day is still 21 Oct (784×), the 7-day high is
 *     still 22 Oct (634×), so the daily chart keeps ending on 22 Oct.
 *   - Average position: 6.3 in the seven days to 3 Nov, against 6.0 in 21–27 Oct → the 6.0 stays, now with its own
 *     window named wherever it used to borrow the clicks window.
 *   - October is complete: 998× April's impressions (843× for the first 27 days), 2.8× September's impressions and
 *     2.2× its clicks (2.3× / 1.9× for the first 27 days).
 *
 * Peec AI weekly readings (brand report, all 7 brands, Monday weeks, read 5 Nov 2026):
 *   26 Oct: visibility 14.87%, share of voice 21.93%, rank 2.1 (inside the published 1.0–2.3 band, so it stays)
 *   19 Oct reproduced exactly on 5 Nov at 14.62% / 20.01% / 2.3. Earlier published weeks keep their readings.
 *
 * Input: --gsc <gsc-cli JSON of sc-domain:genieteacher.com by date: { rows: [{ keys: [date], clicks, impressions,
 * ctr, position }] }>, daily from 13 Apr 2026. Raw counts never leave this script.
 * --out <file> (optional) writes the patch it would send, for review; it carries only indexed values and copy.
 *
 * Every shipped figure (623×, 72×, 6.0, 843×, 2.3×, 1.9×, 784× on 21 Oct, 634× on 22 Oct, the 22 Oct chart point)
 * must reproduce, every new figure must match the copy, and every replaced sentence must exist exactly once, or
 * nothing is written.
 *
 *   SANITY_API_TOKEN=… node scripts/instruments/refresh-genie-2026-11-05.mjs --gsc <f> [--out <f>] [--write]
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
const END = '2026-11-03';
const CHART_END = '2026-10-22';

/* ── Search Console (gsc-cli shape → [date, clicks, impressions, position]) ── */
const plus = (d, n) => new Date(Date.parse(`${d}T00:00:00Z`) + n * 864e5).toISOString().slice(0, 10);
const all = JSON.parse(readFileSync(gscPath, 'utf8')).rows
  .map((r) => [r.keys[0], r.clicks, r.impressions, r.position])
  .sort((a, b) => (a[0] < b[0] ? -1 : 1))
  .filter(([d]) => d <= END);
if (all.at(-1)[0] !== END) throw new Error(`pull ends ${all.at(-1)[0]}, need ${END}`);
if (all[0][0] !== '2026-04-13') throw new Error(`pull starts ${all[0][0]}, need 2026-04-13`);
for (let i = 1; i < all.length; i++) if (all[i][0] !== plus(all[i - 1][0], 1)) throw new Error(`gap in the pull after ${all[i - 1][0]}`);

const range = (a, b) => all.filter(([d]) => d >= a && d <= b);
const month = (m) => all.filter(([d]) => d.startsWith(m));
const sum = (rs, i) => rs.reduce((t, r) => t + r[i], 0);
const wpos = (rs) => rs.reduce((t, r) => t + r[2] * r[3], 0) / sum(rs, 2);
const r1 = (v) => Math.round(v * 10) / 10;
const apr = month('2026-04');
const may = month('2026-05');
const sep = month('2026-09');
const oct = month('2026-10');
if (oct.length !== 31) throw new Error(`October has ${oct.length} days`);
const mayImp = sum(may, 2) / may.length;
const mayClk = sum(may, 1) / may.length;
const perDay = (rs) => sum(rs, 2) / rs.length / mayImp;
const perWeekClk = (rs) => sum(rs, 1) / (mayClk * 7);
const trail = (end) => { const i = all.findIndex(([d]) => d === end); return all.slice(i - 6, i + 1); };
const mean7 = (end) => perDay(trail(end));
const clk7 = (end) => perWeekClk(trail(end));

// shipped figures must reproduce (the 30 Oct refresh). The published position for 21–27 Oct is 6.0; the 30 Oct pull
// rounded to it, and this pull reads 6.05 for the same seven days (Search Console's daily positions moved by a few
// hundredths), which rounds to 6.1. The copy keeps 6.0 with its window; the check allows that drift and no more.
const shippedWin = range('2026-10-21', '2026-10-27');
const oct27 = range('2026-10-01', '2026-10-27');
const p22 = all.find(([d]) => d === CHART_END);
const shipped = {
  imp: Math.round(perDay(shippedWin)), clk: Math.round(perWeekClk(shippedWin)), posNear6: Math.abs(wpos(shippedWin) - 6) < 0.06,
  oct27VsApr: Math.round(sum(oct27, 2) / sum(apr, 2)), oct27VsSepImp: r1(sum(oct27, 2) / sum(sep, 2)), oct27VsSepClk: r1(sum(oct27, 1) / sum(sep, 1)),
  pt22: `${Math.round((p22[1] / mayClk) * 100)}/${Math.round((p22[2] / mayImp) * 100)}`,
};
const expectOld = { imp: 623, clk: 72, posNear6: true, oct27VsApr: 843, oct27VsSepImp: 2.3, oct27VsSepClk: 1.9, pt22: '7363/74850' };
for (const [k, e] of Object.entries(expectOld)) if (shipped[k] !== e) throw new Error(`shipped ${k} = ${e}, data says ${shipped[k]}`);

const win = range('2026-10-28', END);
const fromOct = range('2026-10-01', END);
const bestDay = fromOct.reduce((a, b) => (b[2] > a[2] ? b : a));
const peak = fromOct.reduce((a, [d]) => (mean7(d) > mean7(a) ? d : a), '2026-10-01');
const clkPeak = range('2026-04-19', END).reduce((a, [d]) => (clk7(d) > clk7(a) ? d : a), '2026-04-19');
const f = {
  clk: Math.round(perWeekClk(win)), clkIsHigh: clkPeak === END,
  impWin: Math.round(perDay(win)), impKeepsOldWindow: perDay(win) < perDay(shippedWin), posWin: r1(wpos(win)),
  octVsApr: Math.round(sum(oct, 2) / sum(apr, 2)), octVsSepImp: r1(sum(oct, 2) / sum(sep, 2)), octVsSepClk: r1(sum(oct, 1) / sum(sep, 1)),
  bestDay: bestDay[0], bestDayX: Math.round(bestDay[2] / mayImp), peak, peakX: Math.round(mean7(peak)),
};
const expectNew = {
  clk: 80, clkIsHigh: true, impWin: 597, impKeepsOldWindow: true, posWin: 6.3,
  octVsApr: 998, octVsSepImp: 2.8, octVsSepClk: 2.2, bestDay: '2026-10-21', bestDayX: 784, peak: CHART_END, peakX: 634,
};
for (const [k, e] of Object.entries(expectNew)) if (f[k] !== e) throw new Error(`copy says ${k} = ${e}, data says ${f[k]}`);

/* ── Document ───────────────────────────────────────────────────────── */
const doc = await client.getDocument(DOC_ID);
if (!doc) throw new Error(`no document ${DOC_ID}`);
if (doc.result1Number !== '623×' || doc.result2Number !== '72×') throw new Error('result cards changed since 30 Oct');
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
    'and 623× in the seven days to 27 October (Google Search Console, to 27 Oct 2026). Clicks followed: those seven days brought 72× the clicks of an average May week, and the average position moved from 11.5 in August to 6.9 in September and 6.0 in those seven days.',
    'and 623× in the seven days to 27 October (Google Search Console, to 3 Nov 2026). Clicks followed: the seven days to 3 November brought 80× the clicks of an average May week, and the average position moved from 11.5 in August to 6.9 in September and 6.0 in the seven days to 27 October.',
  ],
  [
    'In AI search, visibility grew from 5.26% in the week of 25 May to 14.62% in the week of 19 October 2026, and share of voice from 2.26% to 20.0% (Peec AI), with an average mention rank between 1.0 and 2.3 since July.',
    'In AI search, visibility grew from 5.26% in the week of 25 May to 14.87% in the week of 26 October 2026, and share of voice from 2.26% to 21.9% (Peec AI), with an average mention rank between 1.0 and 2.3 since July.',
  ],
  [
    'The first twenty-seven days of October then brought 2.3× the impressions and 1.9× the clicks of the whole of September.',
    'October then brought 2.8× the impressions and 2.2× the clicks of the whole of September.',
  ],
  ['(Google Search Console, root domain, to 27 October 2026)', '(Google Search Console, root domain, to 31 October 2026)'],
  [
    '<tr><td><strong>October, first 27 days</strong></td><td><strong>843×</strong></td></tr>',
    '<tr><td><strong>October</strong></td><td><strong>998×</strong></td></tr>',
  ],
  [
    'and September closed at 362×; the first twenty-seven days of October reached 843×.',
    'and September closed at 362×; October closed at 998×.',
  ],
  [
    'The seven days to 27 October brought 72× the clicks of an average May week, September brought 7.0× the clicks of August, and the average position across the site moved from 11.5 in August to 6.9 in September and 6.0 in those seven days (Google Search Console).',
    'The seven days to 3 November brought 80× the clicks of an average May week, September brought 7.0× the clicks of August, and the average position across the site moved from 11.5 in August to 6.9 in September and 6.0 in the seven days to 27 October (Google Search Console).',
  ],
  ['and a climb to 14.62%</h3>', 'and a climb to 14.87%</h3>'],
  [
    'then climbing to <strong>12.47%</strong> in the week of 5 October and <strong>14.62%</strong> in the week of 19 October.',
    'then climbing to <strong>12.47%</strong> in the week of 5 October, <strong>14.62%</strong> in the week of 19 October and <strong>14.87%</strong> in the week of 26 October.',
  ],
  ['<h3>Share of voice: 2.26% to 20.0%, named near the top</h3>', '<h3>Share of voice: 2.26% to 21.9%, named near the top</h3>'],
  [
    'to <strong>20.01%</strong> in the week of 19 October 2026, with an average mention rank between 1.0 and 2.3 every week since July.',
    'to <strong>21.93%</strong> in the week of 26 October 2026, with an average mention rank between 1.0 and 2.3 every week since July.',
  ],
  [
    'Updated 30 October 2026 with Search Console data to 27 October and Peec AI weekly readings to the week of 19 October (the lead and booking figures and the 30-day AI window keep their late-September windows); previously updated 18 October with',
    'Updated 5 November 2026 with Search Console data to 3 November and Peec AI weekly readings to the week of 26 October (the impressions and position figures keep the seven days to 27 October; the lead and booking figures and the 30-day AI window keep their late-September windows); previously updated 30 October with Search Console data to 27 October and Peec AI to the week of 19 October, 18 October with',
  ],
], 'mainBody');

const paragraphSummary = swap(doc.paragraphSummary, [
  [
    'and 623× in the seven days to 27 October, clicks per week climbed 72× on the May average, and the average position moved from 11.5 in August to 6.0.',
    'and 623× in the seven days to 27 October, clicks per week climbed 80× on the May average in the seven days to 3 November, and the average position moved from 11.5 in August to 6.0 in late October.',
  ],
  [
    'In AI search its visibility grew from 5.26% to 14.62% and its share of voice from 2.26% to 20.0% between the weeks of 25 May and 19 October 2026, at an average mention rank of 1.0 to 2.3 since July.',
    'In AI search its visibility grew from 5.26% to 14.87% and its share of voice from 2.26% to 21.9% between the weeks of 25 May and 26 October 2026, at an average mention rank of 1.0 to 2.3 since July.',
  ],
], 'paragraphSummary');

const faq = doc.faq.map((q) => {
  if (q._key === 'faq-2') return { ...q, answer: swap(q.answer, [[
    'and the first twenty-seven days of October brought 2.3× the impressions of all of September.',
    'and October brought 2.8× the impressions of all of September.',
  ]], 'faq-2') };
  if (q._key === 'faq-3') return { ...q, answer: swap(q.answer, [[
    'clicks per week are 72× the May 2026 average and the average position has moved from 11.5 in August to 6.0 in late October.',
    'clicks per week reached 80× the May 2026 average in the seven days to 3 November, and the average position has moved from 11.5 in August to 6.0 in late October.',
  ]], 'faq-3') };
  return q;
});

/* Daily chart: unchanged, it still ends on its 7-day high (22 Oct, 634×); its caption names 21–27 Oct, still current */
const it = doc.instruments.indexedTrend;
if (it.points.at(-1).date !== CHART_END) throw new Error(`chart ends ${it.points.at(-1).date}`);

/* Peec weekly share of voice: add the week of 26 Oct */
const tc = doc.instruments.topicClimb;
if (tc.points.at(-1).week !== '2026-10-19' || tc.points.at(-1)._key !== 'pt-14' || tc.points.at(-1).value !== 0.2001) {
  throw new Error(`share-of-voice series ends ${tc.points.at(-1).week} (${tc.points.at(-1)._key})`);
}
const topicClimb = {
  ...tc,
  points: [...tc.points, { _key: 'pt-15', value: 0.2193, week: '2026-10-26' }],
  caption: swap(tc.caption, [['2.26% to 20.0%, 25 May to 25 Oct.', '2.26% to 21.9%, 25 May to 1 Nov.']], 'topicClimb.caption'),
};

/* Published rows (read by the homepage and /apply/saas: r-0 AI visibility, r-1 share of voice) */
const pr = doc.instruments.publishedResult;
if (pr.rows.map((r) => `${r._key}=${r.value}`).join('|') !== 'r-0=5.26% → 14.62%|r-1=2.26% → 20.0%|r-2=1.0–2.3') throw new Error('publishedResult rows changed since 30 Oct');
if (pr.rows[0].unit !== 'AI visibility, week of 25 May → week of 19 Oct') throw new Error('publishedResult r-0 unit changed since 30 Oct');
const publishedResult = {
  ...pr,
  rows: pr.rows.map((r) => ({
    'r-0': { ...r, unit: 'AI visibility, week of 25 May → week of 26 Oct', value: '5.26% → 14.87%' },
    'r-1': { ...r, value: '2.26% → 21.9%' },
  }[r._key] ?? r)),
};

const patch = {
  result2Number: `${f.clk}×`,
  result2Title: 'Google clicks per week, May 2026 average → 7 days to 3 Nov 2026',
  paragraphSummary,
  mainBody,
  faq,
  'instruments.topicClimb': topicClimb,
  'instruments.publishedResult': publishedResult,
  'instruments.gscSource': 'Google Search Console · indexed to May 2026 = 100 · to 3 Nov 2026',
  'instruments.aiSource': 'Peec AI · weekly to 1 Nov 2026, 30-day window to 27 Sep 2026',
};

console.log(JSON.stringify({ shipped, fresh: f }, null, 1));
if (outPath) { writeFileSync(outPath, JSON.stringify({ _id: DOC_ID, _rev: doc._rev, set: patch }, null, 1)); console.log(`patch written to ${outPath}`); }
if (!WRITE) { console.log('\ndry run: nothing written to Sanity (add --write)'); process.exit(0); }
const res = await client.patch(DOC_ID).ifRevisionId(doc._rev).set(patch).commit();
console.log(`patched ${res._id} rev ${res._rev}`);
