/**
 * Refresh the TradeMomentum case study on 11 Nov 2026 with Search Console final data to 9 Nov (successor of
 * refresh-trademomentum-2026-11-08.mjs; same method, 20 European countries out of every impressions figure).
 *
 *   - Impressions, countries out: the seven days to 9 Nov read 72.1x the September 2025 low, the highest trailing
 *     seven days on record → 72x (shipped 8 Nov: 58.7x → 59x for the seven days to 6 Nov; to 7 Nov 62.2, to 8 Nov
 *     66.1). The daily chart extends to 9 Nov with the same countries-out index (Dec 2025 with them out = 100).
 *   - Clicks (all countries): the latest complete Monday week (2-8 Nov) is 9.1x the week of 1 Sep 2025, below the
 *     published high (week of 12 Oct, 9.3x) → result1 and the weekly clicks figures stay. The 8 Nov script never
 *     extended a weekly clicks series, so none is extended here. The trailing-7-day clicks multiple to 9 Nov is
 *     printed (clicksTrailing7), never published.
 *   - The AI figures keep their dated windows and are not touched.
 *
 * Inputs (gsc-cli JSON of sc-domain:trademomentum.org, final data):
 *   --dc <a,b,c>   date×country, comma-separated files covering 31 Aug 2025 to 9 Nov 2026 between them (each under the
 *                  25,000-row cap)
 *   --daily <f>    site totals by date; rows before 31 Aug 2025 are ignored (the file may start on 1 Aug 2025)
 *   --out <f>      (optional) writes the patch it would send, for review; it carries only indexed values and copy.
 *   --diff         prints every changed field, before → after (long text: only the differing sentences)
 * 1-30 Aug 2025 is not in the date×country files; its values are embedded below (AUG_2025, pulled 8 Nov 2026).
 * Raw counts never leave this script.
 *
 * Every shipped figure and shipped chart point must reproduce, the new figures must match the copy, and every
 * replaced sentence must exist exactly once, or nothing is written. Refuses if a draft exists.
 *
 *   SANITY_API_TOKEN=… node scripts/instruments/refresh-trademomentum-2026-11-11.mjs --dc <a,b,c> --daily <f> [--diff] [--out <f>] [--write]
 */
import { createClient } from '@sanity/client';
import { readFileSync, writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const DIFF = args.includes('--diff');
const argVal = (name) => {
  if (!args.includes(name)) return undefined;
  const v = args[args.indexOf(name) + 1];
  if (!v || v.startsWith('--')) throw new Error(`${name} needs a value`);
  return v;
};
const dcPaths = argVal('--dc')?.split(',');
const dailyPath = argVal('--daily');
if (!dcPaths || !dailyPath) throw new Error('--dc <a,b,c> and --daily <file> are required');
const outPath = argVal('--out');
const token = process.env.SANITY_API_TOKEN;
if (!token) throw new Error('SANITY_API_TOKEN missing');
const client = createClient({ projectId: 'xjjjqhgt', dataset: 'production', apiVersion: '2025-03-29', token, useCdn: false });

const DOC_ID = '760323db-23d1-461e-ae13-f3877d00e24e';
const START = '2025-08-31';
const END = '2026-11-09';
// The 20 countries whose impressions jumped together on 28 Oct 2026 with almost no clicks (ISO 3166-1 alpha-3).
const EXCLUDED = new Set('deu fra esp ita nld aut prt irl bel dnk hun nor grc swe che pol rou cze fin rus'.split(' '));
if (EXCLUDED.size !== 20) throw new Error('expected 20 excluded countries');
const r1 = (v) => Math.round(v * 10) / 10;
const plus = (d, n) => new Date(Date.parse(`${d}T00:00:00Z`) + n * 864e5).toISOString().slice(0, 10);
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/*
 * 1–30 Aug 2025, indexed values only: [date, clicks (all countries, Dec 2025 = 100), impressions (all countries,
 * Dec 2025 = 100), impressions with the 20 countries out (Dec 2025 with them out = 100)]. Pulled 8 Nov 2026 through
 * Executor (Search Console searchAnalytics.query, sc-domain:trademomentum.org, type web, final data, date×country
 * for Aug and Dec 2025 and date totals for Aug; the date×country sums matched the date totals on every day).
 */
const AUG_2025 = [
  ['2025-08-01', 90, 118, 120], ['2025-08-02', 30, 87, 88], ['2025-08-03', 130, 118, 118], ['2025-08-04', 110, 138, 142],
  ['2025-08-05', 160, 146, 146], ['2025-08-06', 70, 117, 116], ['2025-08-07', 100, 115, 115], ['2025-08-08', 100, 119, 116],
  ['2025-08-09', 0, 94, 95], ['2025-08-10', 110, 114, 117], ['2025-08-11', 60, 118, 121], ['2025-08-12', 80, 141, 141],
  ['2025-08-13', 40, 132, 128], ['2025-08-14', 70, 114, 117], ['2025-08-15', 110, 149, 152], ['2025-08-16', 40, 118, 121],
  ['2025-08-17', 70, 138, 137], ['2025-08-18', 90, 136, 136], ['2025-08-19', 60, 108, 108], ['2025-08-20', 40, 87, 84],
  ['2025-08-21', 100, 135, 138], ['2025-08-22', 30, 104, 106], ['2025-08-23', 60, 72, 72], ['2025-08-24', 30, 51, 52],
  ['2025-08-25', 100, 66, 65], ['2025-08-26', 60, 65, 66], ['2025-08-27', 60, 50, 50], ['2025-08-28', 110, 73, 75],
  ['2025-08-29', 140, 65, 64], ['2025-08-30', 60, 53, 54],
];
// The same pull's values for days the local files also hold: 31 Aug 2025 (countries out) and each December 2025 day.
const PULL_CHECK = {
  aug31Kept: 64,
  decKept: [183, 72, 75, 84, 94, 73, 80, 91, 113, 105, 88, 86, 94, 87, 113, 118, 99, 91, 93, 86, 76, 102, 93, 97, 97, 124, 106, 98, 105, 118, 159],
};

/* ── Search Console ─────────────────────────────────────────────────── */
const byDate = new Map(); // date → { c, i, k } (k = impressions with the countries out)
const seen = new Set();
for (const p of dcPaths) {
  const { rows } = JSON.parse(readFileSync(p, 'utf8'));
  if (rows.length >= 25000) throw new Error(`${p}: row cap reached`);
  for (const r of rows) {
    const [d, country] = r.keys;
    if (d > END) continue;
    const key = `${d}|${country}`;
    if (seen.has(key)) throw new Error(`duplicate row ${key} across the date×country files`);
    seen.add(key);
    const o = byDate.get(d) ?? { c: 0, i: 0, k: 0 };
    o.c += r.clicks; o.i += r.impressions; if (!EXCLUDED.has(country)) o.k += r.impressions;
    byDate.set(d, o);
  }
}
const daily = new Map(JSON.parse(readFileSync(dailyPath, 'utf8')).rows.filter((r) => r.keys[0] >= START && r.keys[0] <= END).map((r) => [r.keys[0], r]));
const all = [...byDate.keys()].sort().map((d) => [d, byDate.get(d).c, byDate.get(d).i, byDate.get(d).k]); // [date, clicks, imp, impKept]
if (all[0][0] !== START || all.at(-1)[0] !== END) throw new Error(`date×country runs ${all[0][0]}–${all.at(-1)[0]}, need ${START}–${END}`);
for (let i = 1; i < all.length; i++) if (all[i][0] !== plus(all[i - 1][0], 1)) throw new Error(`gap in the pull after ${all[i - 1][0]}`);
if (daily.size !== all.length) throw new Error(`daily file has ${daily.size} days, date×country ${all.length}`);
for (const [d, c, i] of all) {
  const t = daily.get(d);
  if (!t || t.clicks !== c || t.impressions !== i) throw new Error(`${d}: date×country sums do not match the site totals`);
}

const sum = (rs, i) => rs.reduce((t, r) => t + r[i], 0);
const range = (a, b) => all.filter(([d]) => d >= a && d <= b);
const perDay = (rs, i) => sum(rs, i) / rs.length;
const week = (start) => { const rs = range(start, plus(start, 6)); if (rs.length !== 7) throw new Error(`week of ${start} has ${rs.length} days`); return sum(rs, 1); };
const dec = range('2025-12-01', '2025-12-31');
const decClk = perDay(dec, 1), decImp = perDay(dec, 2), decKept = perDay(dec, 3);
const sep = range('2025-09-01', '2025-09-30');
const lowImp = perDay(sep, 2), lowKept = perDay(sep, 3);
const base = week('2025-09-01');
const mean7 = (end, i) => { const j = all.findIndex(([d]) => d === end); return sum(all.slice(j - 6, j + 1), i) / 7; };

/* the 8 Nov pull for 1–30 Aug must agree with the local files where both hold a day */
const decKeptIdx = dec.map((r) => Math.round((r[3] / decKept) * 100));
if (decKeptIdx.join() !== PULL_CHECK.decKept.join()) throw new Error('embedded Aug 2025 pull: December countries-out index differs from the local files');
if (Math.round((all[0][3] / decKept) * 100) !== PULL_CHECK.aug31Kept) throw new Error('embedded Aug 2025 pull: 31 Aug countries-out index differs from the local files');

/* shipped figures must reproduce (every country in) */
const shipped = {
  w0921: r1(week('2026-09-21') / base), w0928: r1(week('2026-09-28') / base), w1012: r1(week('2026-10-12') / base), w1019: r1(week('2026-10-19') / base),
  aug: Math.round(perDay(range('2026-08-01', '2026-08-31'), 2) / lowImp), sep25: Math.round(perDay(range('2026-09-01', '2026-09-25'), 2) / lowImp),
  imp7Oct27: Math.round(perDay(range('2026-10-21', '2026-10-27'), 2) / lowImp), imp7Nov3: Math.round(perDay(range('2026-10-28', '2026-11-03'), 2) / lowImp),
  decAug: r1(perDay(range('2026-08-01', '2026-08-31'), 2) / decImp),
  kept7Nov6x: r1(perDay(range('2026-10-31', '2026-11-06'), 3) / lowKept), kept7Nov6: Math.round(perDay(range('2026-10-31', '2026-11-06'), 3) / lowKept),
};
const expectOld = { w0921: 9.1, w0928: 7, w1012: 9.3, w1019: 7.3, aug: 30, sep25: 31, imp7Oct27: 35, imp7Nov3: 54, decAug: 12.8, kept7Nov6x: 58.7, kept7Nov6: 59 };
for (const [k, e] of Object.entries(expectOld)) if (shipped[k] !== e) throw new Error(`shipped ${k} = ${e}, data says ${shipped[k]}`);

/* clicks: every complete Monday week since the engagement began; the highest must still be 12 Oct */
const weeks = [];
for (let d = '2025-09-01'; plus(d, 6) <= END; d = plus(d, 7)) weeks.push([d, week(d)]);
const highWeek = weeks.reduce((a, b) => (b[1] > a[1] ? b : a));

/* new figures, countries out */
const kept7x = (end) => r1(perDay(range(plus(end, -6), end), 3) / lowKept);
if (kept7x('2026-11-07') !== 62.2 || kept7x('2026-11-08') !== 66.1) throw new Error(`seven days to 7 / 8 Nov read ${kept7x('2026-11-07')} / ${kept7x('2026-11-08')}, expected 62.2 / 66.1`);
const f = {
  latestWeek: weeks.at(-1)[0], latestWeekX: r1(weeks.at(-1)[1] / base), highWeek: highWeek[0],
  kept7Nov9x: kept7x(END), kept7Nov9: Math.round(perDay(range('2026-11-03', END), 3) / lowKept),
  keptAug: Math.round(perDay(range('2026-08-01', '2026-08-31'), 3) / lowKept),
  keptSep25: Math.round(perDay(range('2026-09-01', '2026-09-25'), 3) / lowKept),
  peak: range('2025-09-06', END).reduce((a, [d]) => (mean7(d, 3) >= mean7(a, 3) ? d : a), '2025-09-06'),
};
const expectNew = { latestWeek: '2026-11-02', latestWeekX: 9.1, highWeek: '2026-10-12', kept7Nov9x: 72.1, kept7Nov9: 72, keptAug: 28, keptSep25: 29, peak: END };
for (const [k, e] of Object.entries(expectNew)) if (f[k] !== e) throw new Error(`copy says ${k} = ${e}, data says ${f[k]}`);
/* for review only, not published: trailing seven days of clicks (all countries) to the latest day, on the 1 Sep 2025 week */
const clicksTrailing7 = r1(sum(range(plus(END, -6), END), 1) / base);
const clicksWeeksNew = weeks.slice(-2).map(([d, v]) => `${d} ${r1(v / base)}x`);

/* "fell by more than half between August and September 2025" must still hold with the countries out */
const augKeptMean = AUG_2025.reduce((t, r) => t + r[3], Math.round((all[0][3] / decKept) * 100)) / 31; // index units
const sepKeptMean = (lowKept / decKept) * 100;
if (!(sepKeptMean < augKeptMean / 2)) throw new Error(`Aug → Sep 2025 fall with the countries out is not more than half (${r1(augKeptMean)} → ${r1(sepKeptMean)})`);

/* for review only, not written: the body's Dec 2025 → Aug 2026 and → 1–25 Sep 2026 impressions figures */
const bodyNotTouched = {
  decAug_shipped: shipped.decAug, decAug_countriesOut: r1(perDay(range('2026-08-01', '2026-08-31'), 3) / decKept),
  decSep25_shipped: r1(perDay(range('2026-09-01', '2026-09-25'), 2) / decImp), decSep25_countriesOut: r1(perDay(range('2026-09-01', '2026-09-25'), 3) / decKept),
};

/* ── Document ───────────────────────────────────────────────────────── */
const doc = await client.getDocument(DOC_ID);
if (!doc) throw new Error(`no document ${DOC_ID}`);
if (await client.getDocument(`drafts.${DOC_ID}`)) throw new Error('an unpublished draft exists; resolve it first');
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
  'Impressions in the seven days to 6 November ran 59x the September 2025 low, the best seven days yet (updated 8 November 2026; impressions now leave out 20 European countries whose searches jumped together on 28 October with almost no clicks).',
  'Impressions in the seven days to 9 November ran 72x the September 2025 low, the best seven days yet (updated 11 November 2026; impressions leave out 20 European countries whose searches jumped together on 28 October with almost no clicks).',
]], 'mainBody');

// The published rows carry impressions (12.8x, December 2025 to August 2026) and clicks per week (9.3x): not touched.
const pr = doc.instruments.publishedResult;
if (pr.rows.map((r) => `${r._key}=${r.value}`).join('|') !== 'r-0=12.8x|r-1=9.3x') throw new Error('publishedResult rows changed since 30 Oct');

/* Daily chart: impressions rebuilt with the countries out for every day; clicks as shipped; extend to 6 Nov */
const it = doc.instruments.indexedTrend;
if (it.baselineLabel !== 'Dec' || it.startMonthIso !== '2025-08' || it.title !== 'Impressions and clicks · indexed, Dec 2025 = 100') throw new Error('chart settings changed since 8 Nov');
const last = it.points.at(-1);
if (last.date !== '2026-11-06' || last._key !== 'd-431') throw new Error(`chart ends ${last.date} (${last._key})`);
if (it.points[0].date !== '2025-08-01' || it.points.length !== 463) throw new Error('chart no longer starts 1 Aug 2025 with 460 days');
const aug = new Map(AUG_2025.map((r) => [r[0], r]));
const local = new Map(all.map((r) => [r[0], r]));
const rebuilt = it.points.map((p, j) => {
  if (j > 0 && p.date !== plus(it.points[j - 1].date, 1)) throw new Error(`chart gap before ${p.date}`);
  let clicks, impAll, impKept;
  if (aug.has(p.date)) [, clicks, impAll, impKept] = aug.get(p.date);
  else {
    const r = local.get(p.date);
    if (!r) throw new Error(`no data for chart day ${p.date}`);
    clicks = Math.round((r[1] / decClk) * 100); impAll = Math.round((r[2] / decImp) * 100); impKept = Math.round((r[3] / decKept) * 100);
  }
  if (clicks !== p.clicks || impKept !== p.impressions) throw new Error(`shipped chart point ${p.date} does not reproduce (${p.clicks}/${p.impressions} vs ${clicks}/${impKept})`);
  void impAll;
  return p;
});
let n = Number(last._key.slice(2));
const add = all.filter(([d]) => d > last.date && d <= f.peak).map(([d, c, , k]) => ({
  _key: `d-${++n}`, date: d, month: MONTHS[Number(d.slice(5, 7)) - 1],
  clicks: Math.round((c / decClk) * 100), impressions: Math.round((k / decKept) * 100),
}));
if (add.length !== 3) throw new Error(`expected 3 new chart days, got ${add.length}`);
const indexedTrend = {
  ...it,
  points: [...rebuilt, ...add],
  caption: swap(it.caption, [
    ['the seven days to 6 November ran at 59×, the high so far. Daily to 6 Nov 2026,',
      'the seven days to 9 November ran at 72×, the high so far. Daily to 9 Nov 2026,'],
  ], 'indexedTrend.caption'),
};

if (doc.instruments.gscSource !== 'Google Search Console · indexed to Dec 2025 = 100 · to 6 Nov 2026 · impressions leave out 20 European countries') throw new Error('gscSource changed since 8 Nov');
const patch = {
  mainBody,
  'instruments.indexedTrend': indexedTrend,
  'instruments.gscSource': 'Google Search Console · indexed to Dec 2025 = 100 · to 9 Nov 2026 · impressions leave out 20 European countries',
};

console.log(JSON.stringify({ shipped, fresh: f, clicksTrailing7_notPublished: clicksTrailing7, clicksWeeksNotExtended: clicksWeeksNew, chart: { days: indexedTrend.points.length, added: add.map((p) => `${p.date} ${p.clicks}/${p.impressions}`), last7After: indexedTrend.points.slice(-7).map((p) => `${p.date} ${p.impressions}`) } }, null, 1));
if (DIFF) {
  const sentences = (t) => t.split(/(?<=[.)])\s+/);
  const show = (label, a, b) => {
    if (a === b) return;
    console.log(`\n--- ${label}`);
    if (a.length < 160 && b.length < 160) { console.log(`before: ${a}\nafter:  ${b}`); return; }
    const sa = sentences(a), sb = sentences(b);
    for (const x of sa) if (!sb.includes(x)) console.log(`before: ${x}`);
    for (const x of sb) if (!sa.includes(x)) console.log(`after:  ${x}`);
  };
  show('mainBody', doc.mainBody, patch.mainBody);
  show('instruments.gscSource', doc.instruments.gscSource, patch['instruments.gscSource']);
  show('instruments.indexedTrend.caption', it.caption, indexedTrend.caption);
  console.log(`\n--- instruments.indexedTrend.points: ${it.points.length} → ${indexedTrend.points.length} points; existing points unchanged; added:`);
  for (const p of add) console.log(`  ${p._key} ${p.date} clicks ${p.clicks}, impressions ${p.impressions}`);
}
if (outPath) { writeFileSync(outPath, JSON.stringify({ _id: DOC_ID, _rev: doc._rev, set: patch }, null, 1)); console.log(`patch written to ${outPath}`); }
if (!WRITE) { console.log('\ndry run: nothing written to Sanity (add --write)'); process.exit(0); }
const res = await client.patch(DOC_ID).ifRevisionId(doc._rev).set(patch).commit();
console.log(`patched ${res._id} rev ${res._rev}`);
