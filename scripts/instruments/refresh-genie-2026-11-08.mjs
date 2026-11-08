/**
 * Refresh the Genie Teacher case study on 8 Nov 2026 with Search Console final data to 6 Nov. Only what improved
 * moves:
 *
 *   - Impressions: the seven days to 6 Nov ran 649× an average May day, above the shipped 623× (21–27 Oct) and the
 *     highest trailing seven days so far (the old high was 634× to 22 Oct) → result1, the name and every impressions
 *     sentence move to "7 days to 6 Nov". The best day is now 5 Nov (793×, above 21 Oct's 784×). The daily chart
 *     extends from 23 Oct to 6 Nov, where its trailing 7-day mean peaks, so it does not end on a dip (Arnel,
 *     18 Oct 2026).
 *   - Clicks: the seven days to 4 Nov brought 82.0× the clicks of an average May week, the highest seven days so far
 *     (above the shipped 80.4× for the 7 days to 3 Nov; the 7 days to 6 Nov read 80.0×) → result2 and every clicks
 *     sentence move to the dated peak window "7 days to 4 Nov", the same practice as keeping a peak window elsewhere
 *     (coordinator, 8 Nov 2026). The weekly clicks chart (instruments.clickGrowth, added 5 Nov) is left alone: the
 *     newest Monday week, 2–8 Nov, is not complete.
 *   - Average position: 6.4 in the seven days to 6 Nov, against 6.0 in 21–27 Oct → the 6.0 stays with its window.
 *   - Peec AI: no new complete Monday week since 26 Oct → AI figures, topicClimb, publishedResult and aiSource stay.
 *
 * Input: --gsc <gsc-cli JSON of sc-domain:genieteacher.com by date: { rows: [{ keys: [date], clicks, impressions,
 * ctr, position }] }>, daily from 13 Apr 2026. Raw counts never leave this script.
 * --out <file> (optional) writes the patch it would send, for review; it carries only indexed values and copy.
 * --diff (optional) prints every changed field, before → after.
 *
 * Every shipped figure (623×, 80.4×, 6.0, 998×, 2.8×, 2.2×, 784× on 21 Oct, every shipped chart point) must
 * reproduce, every new figure must match the copy, and every replaced sentence must exist exactly once, or nothing
 * is written.
 *
 *   SANITY_API_TOKEN=… node scripts/instruments/refresh-genie-2026-11-08.mjs --gsc <f> [--out <f>] [--diff] [--write]
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
const END = '2026-11-06';
const OLD_CHART_END = '2026-10-22';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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

// shipped figures must reproduce (the 5 Nov refresh). The published position for 21–27 Oct is 6.0; this pull reads
// 6.05 for those seven days, as on 5 Nov (Search Console's daily positions moved by a few hundredths after the 30 Oct
// pull). The copy keeps 6.0 with its window; the check allows that drift and no more.
const impShippedWin = range('2026-10-21', '2026-10-27');
const clkShippedWin = range('2026-10-28', '2026-11-03');
const toOct3Nov = range('2026-10-01', '2026-11-03');
const shippedBest = toOct3Nov.reduce((a, b) => (b[2] > a[2] ? b : a));
const shipped = {
  imp: Math.round(perDay(impShippedWin)), clk: r1(perWeekClk(clkShippedWin)), posNear6: Math.abs(wpos(impShippedWin) - 6) < 0.06,
  octVsApr: Math.round(sum(oct, 2) / sum(apr, 2)), octVsSepImp: r1(sum(oct, 2) / sum(sep, 2)), octVsSepClk: r1(sum(oct, 1) / sum(sep, 1)),
  bestDay: shippedBest[0], bestDayX: Math.round(shippedBest[2] / mayImp),
};
const expectOld = { imp: 623, clk: 80.4, posNear6: true, octVsApr: 998, octVsSepImp: 2.8, octVsSepClk: 2.2, bestDay: '2026-10-21', bestDayX: 784 };
for (const [k, e] of Object.entries(expectOld)) if (shipped[k] !== e) throw new Error(`shipped ${k} = ${e}, data says ${shipped[k]}`);

const win = range(plus(END, -6), END);
const fromOct = range('2026-10-01', END);
const bestDay = fromOct.reduce((a, b) => (b[2] > a[2] ? b : a));
const impPeak = all.slice(6).reduce((a, [d]) => (mean7(d) > mean7(a) ? d : a), all[6][0]);
const clkPeak = all.slice(6).reduce((a, [d]) => (clk7(d) > clk7(a) ? d : a), all[6][0]);
const f = {
  impWin: Math.round(perDay(win)), impIsHigh: impPeak === END && perDay(win) > perDay(impShippedWin),
  clkWin: r1(perWeekClk(win)),
  // the clicks headline: the highest 7-day window among those ending 28 Oct–6 Nov, and it must also be the all-time high
  clkPeakNew: range('2026-10-28', END).reduce((a, [d]) => (clk7(d) > clk7(a) ? d : a), '2026-10-28'),
  clkPeakNewX: r1(clk7(range('2026-10-28', END).reduce((a, [d]) => (clk7(d) > clk7(a) ? d : a), '2026-10-28'))),
  clkPeak, clkPeakX: r1(clk7(clkPeak)), clkAboveShipped: clk7(clkPeak) > perWeekClk(clkShippedWin),
  posWin: r1(wpos(win)), posKeepsOldWindow: wpos(win) > wpos(impShippedWin),
  bestDay: bestDay[0], bestDayX: Math.round(bestDay[2] / mayImp),
};
const expectNew = {
  impWin: 649, impIsHigh: true, clkWin: 80,
  clkPeakNew: '2026-11-04', clkPeakNewX: 82, clkPeak: '2026-11-04', clkPeakX: 82, clkAboveShipped: true,
  posWin: 6.4, posKeepsOldWindow: true, bestDay: '2026-11-05', bestDayX: 793,
};
for (const [k, e] of Object.entries(expectNew)) if (f[k] !== e) throw new Error(`copy says ${k} = ${e}, data says ${f[k]}`);
const CHART_END = END;
const CLK = `${Math.round(f.clkPeakX)}×`; // 82×

/* ── Document ───────────────────────────────────────────────────────── */
const doc = await client.getDocument(DOC_ID);
if (!doc) throw new Error(`no document ${DOC_ID}`);
if (await client.getDocument(`drafts.${DOC_ID}`)) throw new Error('a draft exists for this document; refusing to patch under a pending human edit');
if (doc.result1Number !== '623×' || doc.result2Number !== '80×' || doc.name !== 'Genie Teacher: 623× Search Visibility'
  || doc.result1Title !== 'Google impressions per day, May 2026 average → 7 days to 27 Oct 2026') throw new Error('result cards changed since 5 Nov');
if (doc.instruments.gscSource !== 'Google Search Console · indexed to May 2026 = 100 · to 3 Nov 2026') throw new Error(`gscSource changed since 5 Nov: ${doc.instruments.gscSource}`);
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
    'and 623× in the seven days to 27 October (Google Search Console, to 3 Nov 2026).',
    'and 649× in the seven days to 6 November (Google Search Console, to 6 Nov 2026).',
  ],
  [
    'Clicks followed: the seven days to 3 November brought 80× the clicks of an average May week,',
    `Clicks followed: the seven days to 4 November brought ${CLK} the clicks of an average May week,`,
  ],
  [
    'The seven days to 3 November brought 80× the clicks of an average May week, September brought 7.0× the clicks of August,',
    `The seven days to 4 November brought ${CLK} the clicks of an average May week, September brought 7.0× the clicks of August,`,
  ],
  [
    'the seven days to 27 October ran at 623× an average May day, and the best day so far, 21 October, at 784×.',
    'the seven days to 6 November ran at 649× an average May day, and the best day so far, 5 November, at 793×.',
  ],
  [
    'Updated 5 November 2026 with Search Console data to 3 November and Peec AI weekly readings to the week of 26 October (the impressions and position figures keep the seven days to 27 October; the lead and booking figures and the 30-day AI window keep their late-September windows); previously updated 30 October with',
    'Updated 8 November 2026 with Search Console data to 6 November (the clicks figure keeps the seven days to 4 November, its highest so far; the position figure keeps the seven days to 27 October, and the Peec AI readings the week of 26 October; the lead and booking figures and the 30-day AI window keep their late-September windows); previously updated 5 November with Search Console data to 3 November and Peec AI weekly readings to the week of 26 October, 30 October with',
  ],
], 'mainBody');

const paragraphSummary = swap(doc.paragraphSummary, [
  ['and 623× in the seven days to 27 October, clicks per week', 'and 649× in the seven days to 6 November, clicks per week'],
  ['clicks per week climbed 80× on the May average in the seven days to 3 November,', `clicks per week climbed ${CLK} on the May average in the seven days to 4 November,`],
], 'paragraphSummary');

const faq = doc.faq.map((q) => (q._key === 'faq-3' ? { ...q, answer: swap(q.answer, [[
  'clicks per week reached 80× the May 2026 average in the seven days to 3 November,',
  `clicks per week reached ${CLK} the May 2026 average in the seven days to 4 November,`,
]], 'faq-3') } : q));
if (!doc.faq.some((q) => q._key === 'faq-3')) throw new Error('faq-3 missing');

// No other FAQ answer carries a refreshed figure today; stop if one starts to.
for (const q of faq) if (/623×|784×|634×|27 Oct|80×|3 November/.test(`${q.question} ${q.answer}`)) throw new Error(`faq ${q._key} carries a refreshed figure; add it to this script`);

/* Daily chart: every shipped point must reproduce, then extend from 23 Oct to its 7-day high (6 Nov), on the May index */
const it = doc.instruments.indexedTrend;
const last = it.points.at(-1);
if (last.date !== OLD_CHART_END || last._key !== 'd-192') throw new Error(`chart ends ${last.date} (${last._key})`);
const byDate = new Map(all.map((r) => [r[0], r]));
const idx = (r) => ({ clicks: Math.round((r[1] / mayClk) * 100), impressions: Math.round((r[2] / mayImp) * 100) });
for (const p of it.points) {
  const r = byDate.get(p.date);
  if (!r) throw new Error(`chart point ${p.date} has no row`);
  const v = idx(r);
  if (v.clicks !== p.clicks || v.impressions !== p.impressions) throw new Error(`chart point ${p.date} does not reproduce`);
}
let n = Number(last._key.slice(2));
const add = all.filter(([d]) => d > last.date && d <= CHART_END).map((r) => ({
  _key: `d-${++n}`, date: r[0], month: MONTHS[Number(r[0].slice(5, 7)) - 1], ...idx(r),
}));
const indexedTrend = {
  ...it,
  points: [...it.points, ...add],
  caption: swap(it.caption, [[
    'the seven days to 22 October ran at 634×, the high so far, and the seven days to 27 October at 623× (daily to 22 Oct).',
    `the seven days to 6 November ran at ${Math.round(mean7(CHART_END))}×, the high so far (daily to 6 Nov).`,
  ]], 'indexedTrend.caption'),
};

const patch = {
  name: `Genie Teacher: ${f.impWin}× Search Visibility`,
  result1Number: `${f.impWin}×`,
  result1Title: 'Google impressions per day, May 2026 average → 7 days to 6 Nov 2026',
  result2Number: CLK,
  result2Title: 'Google clicks per week, May 2026 average → 7 days to 4 Nov 2026',
  paragraphSummary,
  mainBody,
  faq,
  'instruments.indexedTrend': indexedTrend,
  'instruments.gscSource': 'Google Search Console · indexed to May 2026 = 100 · to 6 Nov 2026',
};

console.log(JSON.stringify({ shipped, fresh: f, chartAdded: add.length, chartFrom: add[0]?.date, chartTo: add.at(-1)?.date }, null, 1));
if (args.includes('--diff')) {
  for (const [k, v] of Object.entries(patch)) {
    const before = k.split('.').reduce((o, s) => o?.[s], doc);
    if (typeof v === 'string') {
      if (v === before) continue;
      if (v.length < 400) { console.log(`\n${k}\n  - ${before}\n  + ${v}`); continue; }
      // long text: print only the sentences that differ
      const a = before.split(/(?<=[.>])\s+/), b = v.split(/(?<=[.>])\s+/);
      console.log(`\n${k}`);
      for (const s of a) if (!b.includes(s)) console.log(`  - ${s}`);
      for (const s of b) if (!a.includes(s)) console.log(`  + ${s}`);
      continue;
    }
    if (Array.isArray(v)) {
      for (const q of v) { const b = before.find((x) => x._key === q._key); if (b?.answer !== q.answer) console.log(`\n${k}[${q._key}].answer\n  - ${b?.answer}\n  + ${q.answer}`); }
      continue;
    }
    if (v.caption !== before.caption) console.log(`\n${k}.caption\n  - ${before.caption}\n  + ${v.caption}`);
    if (v.points) console.log(`\n${k}.points: ${before.points.length} → ${v.points.length}; added ${v.points.length - before.points.length} (${add[0]?.date} → ${add.at(-1)?.date})`);
  }
}
if (outPath) { writeFileSync(outPath, JSON.stringify({ _id: DOC_ID, _rev: doc._rev, set: patch }, null, 1)); console.log(`patch written to ${outPath}`); }
if (!WRITE) { console.log(`\ndry run against _rev ${doc._rev}: nothing written to Sanity (add --write). Fields: ${Object.keys(patch).join(', ')}`); process.exit(0); }
const res = await client.patch(DOC_ID).ifRevisionId(doc._rev).set(patch).commit();
console.log(`patched ${res._id} rev ${res._rev}`);
