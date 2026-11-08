/**
 * Refresh the Delshad Legal case study on 8 Nov 2026 with Search Console final data to 6 Nov: the seven-day
 * site-wide figures move to 31 Oct–6 Nov and the daily chart extends to match.
 *
 *   - Impressions: the seven days to 6 Nov ran 24.1× the March daily average, above the shipped 23.3× (28 Oct–3 Nov)
 *     and the highest trailing seven days so far → every seven-day sentence moves to "the seven days to 6 November",
 *     with clicks per day (23.2×) and the average position (6.0, from 5.9) for the same window, since the copy states
 *     the three together.
 *   - The daily chart ends on the day with the highest trailing 7-day mean of impressions, never on a dip (Arnel,
 *     18 Oct 2026); on this pull that is the last day, 6 Nov.
 *
 * Left as they are: the weekly clicks headline outside the celebrity pages (22.6×, week of 25 Oct; the week of 1 Nov
 * runs to 7 Nov and is not complete in data to 6 Nov), the weekly clicks chart, the Ahrefs Domain Rating card (read
 * again on 8 Nov 2026, still 25, so the 4.9 → 25 card keeps its 26 Oct date), the AI figures (Peec share of voice
 * read 27.6%, below the published 32.4%, so they keep their dated late-September window) and the enquiry figures
 * (not re-measured).
 *
 * Inputs: gsc-cli JSON from sc-domain:delshadlegal.com, final data only
 *   --gsc <file>            rows[].keys = [date], 1 Mar → 6 Nov 2026 (site-wide daily)
 *   --gsc-date-page <file>  rows[].keys = [date, page], 1 Jun → 6 Nov 2026; clicks outside the celebrity pages are
 *                           the rows whose page does not match CEL (refresh-delshad-2026-09-28.mjs), summed by date.
 *                           Used here only to prove the weekly headline and chart still reproduce.
 * Raw counts never leave this script: only multiples of the 7 Jun week and of the average March day are printed.
 *
 * Shipped figures (week of 7 Jun 52 clicks, weeks of 18 and 25 Oct 16.0× and 22.6×, 1–16 Oct 14.5× and 6.2,
 * 28 Oct–3 Nov 23.3× / 22.2× / 5.9, every shipped point of both charts) must reproduce, and every replaced sentence
 * must exist exactly once, or nothing is written.
 *
 *   SANITY_API_TOKEN=… node scripts/instruments/refresh-delshad-2026-11-08.mjs --gsc <f> --gsc-date-page <f> [--diff] [--write]
 */
import { createClient } from '@sanity/client';
import { readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const arg = (k) => { const i = args.indexOf(k); const v = i >= 0 ? args[i + 1] : null; if (!v || v.startsWith('--')) throw new Error(`${k} <file> is required`); return v; };
const gscPath = arg('--gsc'), gscPagePath = arg('--gsc-date-page');
const token = process.env.SANITY_API_TOKEN;
if (!token) throw new Error('SANITY_API_TOKEN missing');
const client = createClient({ projectId: 'xjjjqhgt', dataset: 'production', apiVersion: '2025-03-29', token, useCdn: false });

const DOC_ID = 'caseStudy-delshad-legal-content-engine';
const END = '2026-11-06';
const OLD_END = '2026-11-03';
const WEEK = '2026-10-25'; // 25–31 Oct, still the last complete Sunday-start week inside data to 6 Nov
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const r1 = (v) => Math.round(v * 10) / 10;
const x1 = (v) => `${r1(v).toFixed(1)}×`;
const plus = (d, n) => new Date(Date.parse(`${d}T00:00:00Z`) + n * 864e5).toISOString().slice(0, 10);
const dow = (d) => new Date(`${d}T00:00:00Z`).getUTCDay();
const dayMonth = (d) => `${Number(d.slice(8))} ${MONTHS_LONG[Number(d.slice(5, 7)) - 1]}`;
const dayMon = (d) => `${Number(d.slice(8))} ${MONTHS[Number(d.slice(5, 7)) - 1]}`;

/* ── Search Console, site-wide daily: [date, clicks, impressions, position] ── */
const all = JSON.parse(readFileSync(gscPath, 'utf8')).rows
  .map((r) => [r.keys[0], r.clicks, r.impressions, r.position]).filter(([d]) => d <= END)
  .sort((a, b) => a[0].localeCompare(b[0]));
if (all[0][0] !== '2026-03-01' || all.at(-1)[0] !== END) throw new Error(`site pull runs ${all[0][0]} → ${all.at(-1)[0]}, need 2026-03-01 → ${END}`);
for (let i = 1; i < all.length; i++) if (all[i][0] !== plus(all[i - 1][0], 1)) throw new Error(`site pull has a gap at ${all[i][0]}`);
const sum = (rs, i) => rs.reduce((t, r) => t + r[i], 0);
const range = (a, b) => all.filter(([d]) => d >= a && d <= b);
const wpos = (rs) => rs.reduce((t, r) => t + r[2] * r[3], 0) / sum(rs, 2);
const mar = range('2026-03-01', '2026-03-31');
if (mar.length !== 31) throw new Error(`March has ${mar.length} days`);
const marImp = sum(mar, 2) / 31, marClk = sum(mar, 1) / 31;
const mean7 = (end) => { const i = all.findIndex(([d]) => d === end); return sum(all.slice(i - 6, i + 1), 2) / 7 / marImp; };

/* ── Clicks outside the celebrity-case pages, by Sunday-start week ── */
const CEL = /tyler-perry|dixon|jasmine|kingvicann|masked-singer|mario-barrett|derek|rodriguez-v-perry/i;
const daily = {};
for (const r of JSON.parse(readFileSync(gscPagePath, 'utf8')).rows) {
  const [d, page] = r.keys;
  if (d > END) continue;
  daily[d] ??= 0;
  if (!CEL.test(page)) daily[d] += r.clicks;
}
const pageDays = Object.keys(daily).sort();
if (pageDays[0] !== '2026-06-01' || pageDays.at(-1) !== END) throw new Error(`date×page pull runs ${pageDays[0]} → ${pageDays.at(-1)}, need 2026-06-01 → ${END}`);
for (let i = 1; i < pageDays.length; i++) if (pageDays[i] !== plus(pageDays[i - 1], 1)) throw new Error(`date×page pull has a gap at ${pageDays[i]}`);
const week = (start) => {
  if (dow(start) !== 0) throw new Error(`${start} is not a Sunday`);
  if (plus(start, 6) > END) throw new Error(`week of ${start} is not complete in data to ${END}`);
  let t = 0;
  for (let i = 0; i < 7; i++) { const v = daily[plus(start, i)]; if (v === undefined) throw new Error(`no date×page rows for ${plus(start, i)}`); t += v; }
  return t;
};
if (plus(WEEK, 13) <= END) throw new Error(`${WEEK} is no longer the last complete week; the clicks headline needs refreshing too`);

/* ── Shipped figures must reproduce ── */
const base = week('2026-06-07');
if (base !== 52) throw new Error(`week of 7 Jun = ${base}, shipped 52`);
if (r1(week('2026-10-18') / base) !== 16 || r1(week(WEEK) / base) !== 22.6) throw new Error('weeks of 18 / 25 Oct do not reproduce 16.0× / 22.6×');
const o16 = range('2026-10-01', '2026-10-16');
if (r1(sum(o16, 2) / o16.length / marImp) !== 14.5 || r1(wpos(o16)) !== 6.2) throw new Error('1–16 Oct does not reproduce 14.5× / 6.2');
const old7 = range(plus(OLD_END, -6), OLD_END);
if (r1(sum(old7, 2) / 7 / marImp) !== 23.3 || r1(sum(old7, 1) / 7 / marClk) !== 22.2 || r1(wpos(old7)) !== 5.9) throw new Error('28 Oct–3 Nov does not reproduce 23.3× / 22.2× / 5.9');

/* ── Fresh figures ── */
const win = range(plus(END, -6), END);
const f = {
  imp7: r1(sum(win, 2) / 7 / marImp), clk7: r1(sum(win, 1) / 7 / marClk), pos7: r1(wpos(win)),
  aboveShipped: sum(win, 2) > sum(old7, 2),
  chartEnd: range(plus(OLD_END, 1), END).reduce((a, [d]) => (mean7(d) >= mean7(a) ? d : a), OLD_END),
  allTimeHigh7: all.slice(6).reduce((a, [d]) => (mean7(d) > mean7(a) ? d : a), all[6][0]),
};
// What this copy says; a different pull stops the script instead of shipping figures nobody read.
const expect = { imp7: 24.1, clk7: 23.2, pos7: 6, aboveShipped: true, chartEnd: END, allTimeHigh7: END };
for (const [k, e] of Object.entries(expect)) if (f[k] !== e) throw new Error(`copy says ${k} = ${e}, data says ${f[k]}`);
const IMP = x1(f.imp7), CLK = x1(f.clk7), POS = f.pos7.toFixed(1);
const CHART_END = f.chartEnd;

/* ── Document ── */
const doc = await client.getDocument(DOC_ID);
if (!doc) throw new Error(`no document ${DOC_ID}`);
if (await client.getDocument(`drafts.${DOC_ID}`)) throw new Error('a draft exists for this document; refusing to patch under a pending human edit');
if (doc.result1Number !== '22.6×' || doc.result1Title !== 'Google clicks per week outside the celebrity-case pages, week of 7 Jun → week of 25 Oct 2026'
  || doc.result2Number !== '4.9 → 25' || doc.result2Title !== 'Ahrefs Domain Rating, 1 Jun → 26 Oct 2026') throw new Error('result cards changed since 5 Nov');
if (doc.instruments.gscSource !== `Google Search Console · indexed to Mar 2026 = 100 · to ${dayMon(OLD_END)} 2026`) throw new Error(`gscSource changed since 5 Nov: ${doc.instruments.gscSource}`);
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
    'in the seven days to 3 November, impressions per day ran 23.3× the March average and clicks per day 22.2×, and Ahrefs',
    `in the seven days to ${dayMonth(END)}, impressions per day ran ${IMP} the March average and clicks per day ${CLK}, and Ahrefs`,
  ],
  [
    'and the seven days to 3 November reached 23.3× and 22.2×, at an average position of 5.9.',
    `and the seven days to ${dayMonth(END)} reached ${IMP} and ${CLK}, at an average position of ${POS}.`,
  ],
  [
    'Updated 5 November 2026 with Search Console data to 3 November (Ahrefs Domain Rating keeps its 26 October reading, and the AI and enquiry figures their late-September windows); previously updated 30 October with',
    `Updated 8 November 2026 with Search Console data to ${dayMonth(END)} (the weekly clicks figure keeps the week of 25 October, the last complete week; Ahrefs Domain Rating keeps its 26 October reading, and the AI and enquiry figures their late-September windows); previously updated 5 November with Search Console data to 3 November, 30 October with`,
  ],
], 'mainBody');

const paragraphSummary = swap(doc.paragraphSummary, [[
  'in the seven days to 3 November site-wide impressions per day ran 23.3× the March average.',
  `in the seven days to ${dayMonth(END)} site-wide impressions per day ran ${IMP} the March average.`,
]], 'paragraphSummary');

// No FAQ answer carries a refreshed figure today; stop if one starts to.
for (const q of doc.faq ?? []) if (/23\.3×|22\.2×|3 Nov/.test(`${q.question} ${q.answer}`)) throw new Error(`faq ${q._key} carries a refreshed figure; add it to this script`);

/* Weekly clicks outside the celebrity pages: unchanged, but every shipped week must still reproduce */
const cg = doc.instruments.clickGrowth;
if (cg.points.at(-1).week !== WEEK) throw new Error(`clicks series ends ${cg.points.at(-1).week}`);
for (const p of cg.points) { const v = Math.round((week(p.week) / base) * 100); if (v !== p.value) throw new Error(`clicks week of ${p.week}: shipped ${p.value}, data ${v}`); }

/* Daily chart: every shipped point must reproduce, then extend from 4 Nov to its 7-day high, on the March index */
const it = doc.instruments.indexedTrend;
const last = it.points.at(-1);
if (last.date !== OLD_END || last._key !== 'd-247') throw new Error(`chart ends ${last.date} (${last._key})`);
const byDate = new Map(all.map((r) => [r[0], r]));
for (const p of it.points) {
  const r = byDate.get(p.date);
  if (!r || Math.round((r[1] / marClk) * 100) !== p.clicks || Math.round((r[2] / marImp) * 100) !== p.impressions) throw new Error(`chart point ${p.date} does not reproduce`);
}
let n = Number(last._key.slice(2));
const add = all.filter(([d]) => d > last.date && d <= CHART_END).map(([d, c, i]) => ({
  _key: `d-${++n}`, date: d, month: MONTHS[Number(d.slice(5, 7)) - 1], clicks: Math.round((c / marClk) * 100), impressions: Math.round((i / marImp) * 100),
}));
const indexedTrend = {
  ...it,
  points: [...it.points, ...add],
  caption: swap(it.caption, [[
    'and 23.3× in the seven days to 3 November, the high so far. Daily to 3 Nov 2026,',
    `and ${x1(mean7(CHART_END))} in the seven days to ${dayMonth(CHART_END)}, the high so far. Daily to ${dayMon(CHART_END)} 2026,`,
  ]], 'indexedTrend.caption'),
};

/* The figures the site reads stay: r-2 (clicks headline, week of 25 Oct), r-0/r-1 (AI), r-3 (Domain Rating) */
const pr = doc.instruments.publishedResult;
const row = (k) => pr.rows.find((r) => r._key === k);
if (row('r-2')?.value !== '22.6×' || row('r-2')?.unit !== 'Google clicks per week outside the celebrity pages, week of 7 Jun → week of 25 Oct'
  || row('r-0')?.value !== '0.13% → 32.4%' || row('r-1')?.value !== '1st of 12' || row('r-3')?.value !== '4.9 → 25') throw new Error('publishedResult rows changed since 5 Nov');

const patch = {
  paragraphSummary,
  mainBody,
  'instruments.indexedTrend': indexedTrend,
  'instruments.gscSource': `Google Search Console · indexed to Mar 2026 = 100 · to ${dayMon(CHART_END)} 2026`,
};

console.log(JSON.stringify({ fresh: f, chartAdded: add.length, chartPeak7: r1(mean7(CHART_END)), headlineWeek: r1(week(WEEK) / base) }, null, 1));
if (args.includes('--diff')) {
  for (const [k, v] of Object.entries(patch)) {
    const before = k.split('.').reduce((o, s) => o?.[s], doc);
    if (typeof v === 'string') {
      if (v === before) continue;
      if (v.length < 400) { console.log(`\n${k}\n  - ${before}\n  + ${v}`); continue; }
      const a = before.split(/(?<=[.>])\s+/), b = v.split(/(?<=[.>])\s+/);
      console.log(`\n${k}`);
      for (const s of a) if (!b.includes(s)) console.log(`  - ${s}`);
      for (const s of b) if (!a.includes(s)) console.log(`  + ${s}`);
      continue;
    }
    if (v.caption !== before.caption) console.log(`\n${k}.caption\n  - ${before.caption}\n  + ${v.caption}`);
    if (v.points) console.log(`\n${k}.points: ${before.points.length} → ${v.points.length}; added ${JSON.stringify(v.points.slice(before.points.length))}`);
  }
}
if (!WRITE) { console.log(`\ndry run against _rev ${doc._rev}: nothing written (add --write). Fields: ${Object.keys(patch).join(', ')}`); process.exit(0); }
const res = await client.patch(DOC_ID).ifRevisionId(doc._rev).set(patch).commit();
console.log(`patched ${res._id} rev ${res._rev}`);
