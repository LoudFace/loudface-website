/**
 * Refresh the Delshad Legal case study on 5 Nov 2026 with Search Console final data to 3 Nov: the clicks headline
 * to the week of 25 Oct (25–31 Oct, the last complete Sunday week), the seven-day site-wide figures to 28 Oct–3 Nov,
 * and the daily and weekly charts extended to match.
 *
 * Left as they are: the Ahrefs Domain Rating card (read again on 5 Nov 2026, still 25, so the 4.9 → 25 card keeps
 * its 26 Oct date), the AI figures (Peec share of voice over 5 Oct–3 Nov read 28.3%, below the published 32.4%, so
 * they keep their dated late-September window) and the enquiry figures (not re-measured).
 *
 * The daily chart ends on the day with the highest trailing 7-day mean of impressions, never on a dip (Arnel,
 * 18 Oct 2026); on this pull that is the last day, 3 Nov.
 *
 * Inputs: gsc-cli JSON from sc-domain:delshadlegal.com, final data only
 *   --gsc <file>            rows[].keys = [date], 1 Mar → 3 Nov 2026 (site-wide daily)
 *   --gsc-date-page <file>  rows[].keys = [date, page], 1 Jun → 3 Nov 2026; clicks outside the celebrity pages are
 *                           the rows whose page does not match CEL (refresh-delshad-2026-09-28.mjs), summed by date
 * Raw counts never leave this script: only multiples of the 7 Jun week and of the average March day are printed.
 *
 * Shipped figures (week of 7 Jun 52 clicks, weeks of 11 and 18 Oct 13.2× and 16.0×, 1–16 Oct 14.5× and 6.2,
 * 21–27 Oct 18.3× / 15.9× / 5.9, every shipped point of both charts) must reproduce, and every replaced sentence
 * must exist exactly once, or nothing is written.
 *
 *   SANITY_API_TOKEN=… node scripts/instruments/refresh-delshad-2026-11-05.mjs --gsc <f> --gsc-date-page <f> [--write]
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
const END = '2026-11-03';
const WEEK = '2026-10-25'; // 25–31 Oct, the last complete Sunday-start week inside data to 3 Nov
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
if (plus(WEEK, 13) <= END) throw new Error(`${WEEK} is not the last complete week`);

/* ── Shipped figures must reproduce ── */
const base = week('2026-06-07');
if (base !== 52) throw new Error(`week of 7 Jun = ${base}, shipped 52`);
if (r1(week('2026-10-11') / base) !== 13.2 || r1(week('2026-10-18') / base) !== 16) throw new Error('weeks of 11 / 18 Oct do not reproduce 13.2× / 16.0×');
const o16 = range('2026-10-01', '2026-10-16');
if (r1(sum(o16, 2) / o16.length / marImp) !== 14.5 || r1(wpos(o16)) !== 6.2) throw new Error('1–16 Oct does not reproduce 14.5× / 6.2');
const o27 = range('2026-10-21', '2026-10-27');
if (r1(sum(o27, 2) / 7 / marImp) !== 18.3 || r1(sum(o27, 1) / 7 / marClk) !== 15.9 || r1(wpos(o27)) !== 5.9) throw new Error('21–27 Oct does not reproduce 18.3× / 15.9× / 5.9');

/* ── Fresh figures ── */
const win = range(plus(END, -6), END);
const f = {
  wk25: r1(week(WEEK) / base),
  imp7: r1(sum(win, 2) / 7 / marImp), clk7: r1(sum(win, 1) / 7 / marClk), pos7: r1(wpos(win)),
  chartEnd: range('2026-10-28', END).reduce((a, [d]) => (mean7(d) >= mean7(a) ? d : a), '2026-10-27'),
  allTimeHigh7: all.slice(6).reduce((a, [d]) => (mean7(d) > mean7(a) ? d : a), all[6][0]),
  priorWeekHigh: Math.max(...Array.from({ length: 21 }, (_, i) => plus('2026-06-07', 7 * i)).filter((w) => w < WEEK).map((w) => r1(week(w) / base))),
};
// What this copy says; a different pull stops the script instead of shipping figures nobody read.
const expect = { wk25: 22.6, imp7: 23.3, clk7: 22.2, pos7: 5.9, chartEnd: END, allTimeHigh7: END, priorWeekHigh: 16 };
for (const [k, e] of Object.entries(expect)) if (f[k] !== e) throw new Error(`copy says ${k} = ${e}, data says ${f[k]}`);
const W = x1(f.wk25), IMP = x1(f.imp7), CLK = x1(f.clk7), POS = f.pos7.toFixed(1);
const CHART_END = f.chartEnd;

/* ── Document ── */
const doc = await client.getDocument(DOC_ID);
if (!doc) throw new Error(`no document ${DOC_ID}`);
if (await client.getDocument(`drafts.${DOC_ID}`)) throw new Error('a draft exists for this document; refusing to patch under a pending human edit');
if (doc.result1Number !== '16.0×' || doc.result2Number !== '4.9 → 25' || doc.result2Title !== 'Ahrefs Domain Rating, 1 Jun → 26 Oct 2026') throw new Error('result cards changed since 30 Oct');
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
    'are 16.0× the week of 7 June, measured in Google Search Console for the week of 18 October,',
    `are ${W} the week of 7 June, measured in Google Search Console for the week of 25 October,`,
  ],
  [
    'October went further: in the seven days to 27 October, impressions per day ran 18.3× the March average and clicks per day 15.9×, and Ahrefs',
    `October and early November went further: in the seven days to ${dayMonth(END)}, impressions per day ran ${IMP} the March average and clicks per day ${CLK}, and Ahrefs`,
  ],
  [
    'and the seven days to 27 October reached 18.3× and 15.9×, at an average position of 5.9.',
    `and the seven days to ${dayMonth(END)} reached ${IMP} and ${CLK}, at an average position of ${POS}.`,
  ],
  ['<td><strong>16.0× (week of 18 Oct)</strong></td>', `<td><strong>${W} (week of 25 Oct)</strong></td>`],
  [
    'held at 14.9× in the week of 4 October, and reached 16.0× in the week of 18 October.',
    `held at 14.9× in the week of 4 October, reached 16.0× in the week of 18 October and ${W} in the week of 25 October.`,
  ],
  [
    'Updated 30 October 2026 with Search Console data to 27 October and Ahrefs Domain Rating to 26 October (the AI and enquiry figures keep their late-September windows); previously updated 18 October with Search Console data to 16 October,',
    `Updated 5 November 2026 with Search Console data to ${dayMonth(END)} (Ahrefs Domain Rating keeps its 26 October reading, and the AI and enquiry figures their late-September windows); previously updated 30 October with Search Console data to 27 October and Ahrefs Domain Rating to 26 October, 18 October with Search Console data to 16 October,`,
  ],
], 'mainBody');

const paragraphSummary = swap(doc.paragraphSummary, [
  ['reached 16.0× the week of 7 June in the week of 18 October 2026,', `reached ${W} the week of 7 June in the week of 25 October 2026,`],
  [
    'in the seven days to 27 October site-wide impressions per day ran 18.3× the March average.',
    `in the seven days to ${dayMonth(END)} site-wide impressions per day ran ${IMP} the March average.`,
  ],
], 'paragraphSummary');

// No FAQ answer carries a refreshed figure today; stop if one starts to.
for (const q of doc.faq ?? []) if (/16\.0×|18\.3×|15\.9×|27 Oct/.test(`${q.question} ${q.answer}`)) throw new Error(`faq ${q._key} carries a refreshed figure; add it to this script`);

/* Weekly clicks outside the celebrity pages: every shipped week must reproduce, then add the week of 25 Oct */
const cg = doc.instruments.clickGrowth;
if (cg.points.at(-1).week !== '2026-10-18') throw new Error(`clicks series ends ${cg.points.at(-1).week}`);
for (const p of cg.points) { const v = Math.round((week(p.week) / base) * 100); if (v !== p.value) throw new Error(`clicks week of ${p.week}: shipped ${p.value}, data ${v}`); }
const clickGrowth = {
  ...cg,
  points: [...cg.points, { _key: `cg-${WEEK}`, value: Math.round((week(WEEK) / base) * 100), week: WEEK }],
  source: swap(cg.source, [['7 Jun – 24 Oct 2026', `7 Jun – ${dayMon(plus(WEEK, 6))} 2026`]], 'clickGrowth.source'),
};

/* Daily chart: every shipped point must reproduce, then extend from 28 Oct to its 7-day high, on the March index */
const it = doc.instruments.indexedTrend;
const last = it.points.at(-1);
if (last.date !== '2026-10-27' || last._key !== 'd-240') throw new Error(`chart ends ${last.date} (${last._key})`);
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
    'then 14.5× over 1–16 October and 18.3× in the seven days to 27 October, the high so far. Daily to 27 Oct 2026,',
    `then 14.5× over 1–16 October and ${x1(mean7(CHART_END))} in the seven days to ${dayMonth(CHART_END)}, the high so far. Daily to ${dayMon(CHART_END)} 2026,`,
  ]], 'indexedTrend.caption'),
};

/* The figures the site reads: r-2 is the clicks headline; r-0 (AI share), r-1 (AI rank) and r-3 (Domain Rating) stay */
const pr = doc.instruments.publishedResult;
const row = (k) => pr.rows.find((r) => r._key === k);
if (row('r-2')?.value !== '16.0×' || row('r-2')?.unit !== 'Google clicks per week outside the celebrity pages, week of 7 Jun → week of 18 Oct'
  || row('r-1')?.value !== '1st of 12' || row('r-3')?.value !== '4.9 → 25') throw new Error('publishedResult rows changed since 30 Oct');
const publishedResult = {
  ...pr,
  rows: pr.rows.map((r) => (r._key === 'r-2' ? { ...r, value: W, unit: 'Google clicks per week outside the celebrity pages, week of 7 Jun → week of 25 Oct' } : r)),
};

if (doc.instruments.gscSource !== 'Google Search Console · indexed to Mar 2026 = 100 · to 27 Oct 2026') throw new Error(`gscSource changed since 30 Oct: ${doc.instruments.gscSource}`);

const patch = {
  result1Number: W,
  result1Title: 'Google clicks per week outside the celebrity-case pages, week of 7 Jun → week of 25 Oct 2026',
  paragraphSummary,
  mainBody,
  'instruments.clickGrowth': clickGrowth,
  'instruments.indexedTrend': indexedTrend,
  'instruments.publishedResult': publishedResult,
  'instruments.gscSource': `Google Search Console · indexed to Mar 2026 = 100 · to ${dayMon(CHART_END)} 2026`,
};

console.log(JSON.stringify({ fresh: f, chartAdded: add.length, chartPeak7: r1(mean7(CHART_END)), newWeek: clickGrowth.points.at(-1) }, null, 1));
if (args.includes('--diff')) {
  const flat = (o, p = '') => Object.entries(o).flatMap(([k, v]) => (v && typeof v === 'object' && !Array.isArray(v) ? flat(v, `${p}${k}.`) : [[`${p}${k}`, v]]));
  for (const [k, v] of Object.entries(patch)) {
    const before = k.split('.').reduce((o, s) => o?.[s], doc);
    if (typeof v === 'string') { if (v !== before) console.log(`\n${k}\n  - ${before}\n  + ${v}`); continue; }
    const b = new Map(flat(before)), a = flat(v);
    for (const [kk, vv] of a) if (kk !== 'points' && JSON.stringify(b.get(kk)) !== JSON.stringify(vv)) console.log(`\n${k}.${kk}\n  - ${JSON.stringify(b.get(kk))}\n  + ${JSON.stringify(vv)}`);
    if (v.points) console.log(`\n${k}.points: ${before.points.length} → ${v.points.length}; added ${JSON.stringify(v.points.slice(before.points.length))}`);
  }
}
if (!WRITE) { console.log(`\ndry run against _rev ${doc._rev}: nothing written (add --write). Fields: ${Object.keys(patch).join(', ')}`); process.exit(0); }
const res = await client.patch(DOC_ID).ifRevisionId(doc._rev).set(patch).commit();
console.log(`patched ${res._id} rev ${res._rev}`);
