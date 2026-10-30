/**
 * Refresh the TradeMomentum case study on 30 Oct 2026: the weekly-clicks headline to the week of 12 Oct, its new
 * highest week (9.3x; the week after came in at 7.3x), and the daily Google chart to 27 Oct, where its 7-day mean
 * is highest. Impressions in the seven days to 27 Oct ran 35x the September 2025 low, the best seven days yet.
 *
 * The AI figures keep their dated windows: overall visibility over the 30 days to 27 Oct read 10.1%, below the
 * 30 days to 27 Sep (13.5%).
 *
 * Input: --gsc <the 30 Oct Executor pull: { result: { tm: { rows: [[date, clicks, impressions, position], …] } } }>,
 * daily from 31 Aug 2025, sc-domain:trademomentum.org. Raw counts never leave this script.
 *
 * Shipped figures (9.1x and 7.0x, the 25 Sep and 4 Oct chart points, 30x and 31x on the September 2025 low) must
 * reproduce, and every replaced sentence must exist exactly once, or nothing is written.
 *
 *   SANITY_API_TOKEN=… node scripts/instruments/refresh-trademomentum-2026-10-30.mjs --gsc <f> [--write]
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

const DOC_ID = '760323db-23d1-461e-ae13-f3877d00e24e';
const END = '2026-10-27';
const r1 = (v) => Math.round(v * 10) / 10;

const all = JSON.parse(readFileSync(gscPath, 'utf8')).result.tm.rows.filter(([d]) => d <= END);
if (all.at(-1)[0] !== END) throw new Error(`pull ends ${all.at(-1)[0]}, need ${END}`);
const sum = (rs, i) => rs.reduce((t, r) => t + r[i], 0);
const range = (a, b) => all.filter(([d]) => d >= a && d <= b);
const plus = (d, n) => new Date(Date.parse(`${d}T00:00:00Z`) + n * 864e5).toISOString().slice(0, 10);
const week = (start) => { const rs = range(start, plus(start, 6)); if (rs.length !== 7) throw new Error(`week of ${start} has ${rs.length} days`); return sum(rs, 1); };
const dec = range('2025-12-01', '2025-12-31');
const decClk = sum(dec, 1) / dec.length, decImp = sum(dec, 2) / dec.length;
const sepLow = range('2025-09-01', '2025-09-30');
const lowImp = sum(sepLow, 2) / sepLow.length;
const perDay = (rs) => sum(rs, 2) / rs.length;
const mean7 = (end) => { const i = all.findIndex(([d]) => d === end); return sum(all.slice(i - 6, i + 1), 2) / 7; };
const base = week('2025-09-01');

// shipped figures must reproduce
if (r1(week('2026-09-21') / base) !== 9.1 || r1(week('2026-09-28') / base) !== 7) throw new Error('9.1x / 7.0x do not reproduce');
for (const [d, c, i] of [['2026-09-25', 510, 1425]]) {
  const p = all.find(([x]) => x === d);
  if (Math.round((p[1] / decClk) * 100) !== c || Math.round((p[2] / decImp) * 100) !== i) throw new Error(`${d} chart point does not reproduce`);
}
if (Math.round(perDay(range('2026-08-01', '2026-08-31')) / lowImp) !== 30 || Math.round(perDay(range('2026-09-01', '2026-09-25')) / lowImp) !== 31) throw new Error('30x / 31x do not reproduce');

const weeks = ['2026-10-05', '2026-10-12', '2026-10-19'].map((w) => [w, r1(week(w) / base)]);
const high = weeks.reduce((a, b) => (b[1] > a[1] ? b : a));
const f = {
  high: high[0], highX: high[1], after: weeks[2][1],
  highIsRecord: week(high[0]) > Math.max(...all.filter(([d]) => d < high[0] && d >= '2025-09-01').map(([d]) => d).filter((d, i, a) => (Date.parse(d) - Date.parse('2025-09-01')) % (7 * 864e5) === 0 && d <= plus(high[0], -7)).map(week)),
  imp7: Math.round(perDay(range('2026-10-21', END)) / lowImp),
  peak: range('2026-10-05', END).reduce((a, [d]) => (mean7(d) >= mean7(a) ? d : a), '2026-10-04'),
};
const expect = { high: '2026-10-12', highX: 9.3, after: 7.3, highIsRecord: true, imp7: 35, peak: END };
for (const [k, e] of Object.entries(expect)) if (f[k] !== e) throw new Error(`copy says ${k} = ${e}, data says ${f[k]}`);

const doc = await client.getDocument(DOC_ID);
if (!doc) throw new Error(`no document ${DOC_ID}`);
if (doc.result1Number !== '9.1x') throw new Error('result card changed since 9 Oct');
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
    "TradeMomentum's Google clicks per week grew 9.1x from the week the engagement began, 1 to 7 September 2025, to the week of 21 September 2026, its highest week on record; the week after held at 7.0x.",
    "TradeMomentum's Google clicks per week grew 9.3x from the week the engagement began, 1 to 7 September 2025, to the week of 12 October 2026, its highest week on record; the week after came in at 7.3x.",
  ],
  [
    'Weekly Google clicks grew <strong>9.1x</strong> from 1 to 7 September 2025, the week the engagement began, to the week of 21 September 2026, the highest week on record (updated 9 October 2026; the week of 28 September came in at 7.0x).',
    'Weekly Google clicks grew <strong>9.3x</strong> from 1 to 7 September 2025, the week the engagement began, to the week of 12 October 2026, the highest week on record (updated 30 October 2026; the week of 21 September had reached 9.1x, and the week of 19 October came in at 7.3x). Impressions in the seven days to 27 October ran 35x the September 2025 low, the best seven days yet.',
  ],
  ['<td>21 to 27 Sep 2026</td><td><strong>9.1x</strong></td>', '<td>12 to 18 Oct 2026</td><td><strong>9.3x</strong></td>'],
], 'mainBody');

const paragraphSummary = swap(doc.paragraphSummary, [[
  'to the week of 21 September 2026, its highest week.',
  'to the week of 12 October 2026, its highest week.',
]], 'paragraphSummary');

const pr = doc.instruments.publishedResult;
if (pr.rows.find((r) => r._key === 'r-1')?.value !== '9.1x') throw new Error('publishedResult changed since 9 Oct');
const publishedResult = {
  ...pr,
  rows: pr.rows.map((r) => (r._key !== 'r-1' ? r : { ...r, value: '9.3x' })),
  caption: swap(pr.caption, [['clicks per week, week of 1 Sep 2025 to week of 21 Sep 2026;', 'clicks per week, week of 1 Sep 2025 to week of 12 Oct 2026;']], 'publishedResult.caption'),
};

const it = doc.instruments.indexedTrend;
const last = it.points.at(-1);
if (last.date !== '2026-10-04') throw new Error(`chart ends ${last.date}`);
let n = Number(last._key.slice(2));
const add = all.filter(([d]) => d > last.date).map(([d, c, i]) => ({
  _key: `d-${++n}`, date: d, month: 'Oct', clicks: Math.round((c / decClk) * 100), impressions: Math.round((i / decImp) * 100),
}));
const indexedTrend = {
  ...it,
  points: [...it.points, ...add],
  caption: swap(it.caption, [[
    'and 31× over 1–25 September 2026. Daily to 4 Oct 2026,',
    'and 31× over 1–25 September 2026; the seven days to 27 October ran at 35×, the high so far. Daily to 27 Oct 2026,',
  ]], 'indexedTrend.caption'),
};

const patch = {
  result1Number: '9.3x',
  result1Title: 'Google clicks per week, week of 1 Sep 2025 → week of 12 Oct 2026, its highest week',
  paragraphSummary,
  mainBody,
  'instruments.publishedResult': publishedResult,
  'instruments.indexedTrend': indexedTrend,
  'instruments.gscSource': 'Google Search Console · indexed to Dec 2025 = 100 · to 27 Oct 2026',
};

console.log(JSON.stringify({ fresh: f, weeks, added: add.length }, null, 1));
if (!WRITE) { console.log('\ndry run: nothing written (add --write)'); process.exit(0); }
const res = await client.patch(DOC_ID).ifRevisionId(doc._rev).set(patch).commit();
console.log(`patched ${res._id} rev ${res._rev}`);
