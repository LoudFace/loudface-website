/**
 * Refresh the TradeMomentum case study on 5 Nov 2026 with Search Console final data to 3 Nov. Only impressions moved:
 *
 *   - Impressions in the seven days to 3 Nov ran 54x the September 2025 low (shipped 35x for the seven days to 27 Oct),
 *     the highest trailing seven days on record → the impressions sentence and the daily Google chart move to 3 Nov,
 *     where the 7-day mean is highest (so the chart does not end on a dip).
 *   - Clicks did not reach a new high: the week of 26 Oct came in at 8.0x, below the week of 12 Oct (9.3x), which is
 *     still the highest week → result1, the clicks sentences and the weekly clicks figures stay as shipped.
 *   - The AI figures keep their dated windows.
 *
 * Input: --gsc <gsc-cli JSON of sc-domain:trademomentum.org by date: { rows: [{ keys: [date], clicks, impressions,
 * ctr, position }] }>, daily from 31 Aug 2025. Raw counts never leave this script.
 * --out <file> (optional) writes the patch it would send, for review; it carries only indexed values and copy.
 *
 * Shipped figures (9.1x, 7.0x, 9.3x, 7.3x, 30x, 31x and 35x on the September 2025 low, the 25 Sep and 27 Oct chart
 * points) must reproduce, the new figures must match the copy, and every replaced sentence must exist exactly once,
 * or nothing is written.
 *
 *   SANITY_API_TOKEN=… node scripts/instruments/refresh-trademomentum-2026-11-05.mjs --gsc <f> [--out <f>] [--write]
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

const DOC_ID = '760323db-23d1-461e-ae13-f3877d00e24e';
const END = '2026-11-03';
const r1 = (v) => Math.round(v * 10) / 10;
const plus = (d, n) => new Date(Date.parse(`${d}T00:00:00Z`) + n * 864e5).toISOString().slice(0, 10);

/* ── Search Console (gsc-cli shape → [date, clicks, impressions, position]) ── */
const all = JSON.parse(readFileSync(gscPath, 'utf8')).rows
  .map((r) => [r.keys[0], r.clicks, r.impressions, r.position])
  .sort((a, b) => (a[0] < b[0] ? -1 : 1))
  .filter(([d]) => d <= END);
if (all.at(-1)[0] !== END) throw new Error(`pull ends ${all.at(-1)[0]}, need ${END}`);
if (all[0][0] > '2025-09-01') throw new Error(`pull starts ${all[0][0]}, need 1 Sep 2025 or earlier`);
for (let i = 1; i < all.length; i++) if (all[i][0] !== plus(all[i - 1][0], 1)) throw new Error(`gap in the pull after ${all[i - 1][0]}`);

const sum = (rs, i) => rs.reduce((t, r) => t + r[i], 0);
const range = (a, b) => all.filter(([d]) => d >= a && d <= b);
const week = (start) => { const rs = range(start, plus(start, 6)); if (rs.length !== 7) throw new Error(`week of ${start} has ${rs.length} days`); return sum(rs, 1); };
const dec = range('2025-12-01', '2025-12-31');
const decClk = sum(dec, 1) / dec.length, decImp = sum(dec, 2) / dec.length;
const sepLow = range('2025-09-01', '2025-09-30');
const lowImp = sum(sepLow, 2) / sepLow.length;
const perDay = (rs) => sum(rs, 2) / rs.length;
const mean7 = (end) => { const i = all.findIndex(([d]) => d === end); return sum(all.slice(i - 6, i + 1), 2) / 7; };
const base = week('2025-09-01');
const point = (d) => { const p = all.find(([x]) => x === d); return `${Math.round((p[1] / decClk) * 100)}/${Math.round((p[2] / decImp) * 100)}`; };

// shipped figures must reproduce
const shipped = {
  w0921: r1(week('2026-09-21') / base), w0928: r1(week('2026-09-28') / base), w1012: r1(week('2026-10-12') / base), w1019: r1(week('2026-10-19') / base),
  aug: Math.round(perDay(range('2026-08-01', '2026-08-31')) / lowImp), sep25: Math.round(perDay(range('2026-09-01', '2026-09-25')) / lowImp),
  imp7Oct27: Math.round(perDay(range('2026-10-21', '2026-10-27')) / lowImp), pt0925: point('2026-09-25'), pt1027: point('2026-10-27'),
};
const expectOld = { w0921: 9.1, w0928: 7, w1012: 9.3, w1019: 7.3, aug: 30, sep25: 31, imp7Oct27: 35, pt0925: '510/1425', pt1027: '440/1638' };
for (const [k, e] of Object.entries(expectOld)) if (shipped[k] !== e) throw new Error(`shipped ${k} = ${e}, data says ${shipped[k]}`);

// every complete Monday week since the engagement began: the highest must still be 12 Oct
const weeks = [];
for (let d = '2025-09-01'; plus(d, 6) <= END; d = plus(d, 7)) weeks.push([d, week(d)]);
const highWeek = weeks.reduce((a, b) => (b[1] > a[1] ? b : a));
const f = {
  latestWeek: weeks.at(-1)[0], latestWeekX: r1(weeks.at(-1)[1] / base), highWeek: highWeek[0],
  imp7: Math.round(perDay(range('2026-10-28', END)) / lowImp),
  peak: range('2025-09-07', END).reduce((a, [d]) => (mean7(d) >= mean7(a) ? d : a), '2025-09-07'),
};
const expectNew = { latestWeek: '2026-10-26', latestWeekX: 8, highWeek: '2026-10-12', imp7: 54, peak: END };
for (const [k, e] of Object.entries(expectNew)) if (f[k] !== e) throw new Error(`copy says ${k} = ${e}, data says ${f[k]}`);

/* ── Document ───────────────────────────────────────────────────────── */
const doc = await client.getDocument(DOC_ID);
if (!doc) throw new Error(`no document ${DOC_ID}`);
if (doc.result1Number !== '9.3x') throw new Error('result card changed since 30 Oct');
const swap = (text, pairs, field) => {
  let out = text;
  for (const [from, to] of pairs) {
    const n = out.split(from).length - 1;
    if (n !== 1) throw new Error(`${field}: expected 1 match, found ${n}: "${from.slice(0, 90)}…"`);
    out = out.replace(from, to);
  }
  return out;
};

const mainBody = swap(doc.mainBody, [[
  'Impressions in the seven days to 27 October ran 35x the September 2025 low, the best seven days yet.',
  'Impressions in the seven days to 3 November ran 54x the September 2025 low, the best seven days yet (updated 5 November 2026; the seven days to 27 October had reached 35x).',
]], 'mainBody');

// The published rows carry impressions (12.8x, December 2025 to August 2026) and clicks per week (9.3x): neither moves.
const pr = doc.instruments.publishedResult;
if (pr.rows.map((r) => `${r._key}=${r.value}`).join('|') !== 'r-0=12.8x|r-1=9.3x') throw new Error('publishedResult rows changed since 30 Oct');

/* Daily chart: extend from 28 Oct to its 7-day high on 3 Nov */
const it = doc.instruments.indexedTrend;
const last = it.points.at(-1);
if (last.date !== '2026-10-27' || last._key !== 'd-421') throw new Error(`chart ends ${last.date} (${last._key})`);
let n = Number(last._key.slice(2));
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const add = all.filter(([d]) => d > last.date && d <= f.peak).map(([d, c, i]) => ({
  _key: `d-${++n}`, date: d, month: MONTHS[Number(d.slice(5, 7)) - 1],
  clicks: Math.round((c / decClk) * 100), impressions: Math.round((i / decImp) * 100),
}));
if (add.length !== 7) throw new Error(`expected 7 new chart days, got ${add.length}`);
const indexedTrend = {
  ...it,
  points: [...it.points, ...add],
  caption: swap(it.caption, [[
    'the seven days to 27 October ran at 35×, the high so far. Daily to 27 Oct 2026,',
    'the seven days to 3 November ran at 54×, the high so far. Daily to 3 Nov 2026,',
  ]], 'indexedTrend.caption'),
};

const patch = {
  mainBody,
  'instruments.indexedTrend': indexedTrend,
  'instruments.gscSource': 'Google Search Console · indexed to Dec 2025 = 100 · to 3 Nov 2026',
};

console.log(JSON.stringify({ shipped, fresh: f, added: add.length }, null, 1));
if (outPath) { writeFileSync(outPath, JSON.stringify({ _id: DOC_ID, _rev: doc._rev, set: patch, addedPoints: add }, null, 1)); console.log(`patch written to ${outPath}`); }
if (!WRITE) { console.log('\ndry run: nothing written to Sanity (add --write)'); process.exit(0); }
const res = await client.patch(DOC_ID).ifRevisionId(doc._rev).set(patch).commit();
console.log(`patched ${res._id} rev ${res._rev}`);
