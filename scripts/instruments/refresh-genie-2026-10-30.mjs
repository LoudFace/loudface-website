/**
 * Refresh the Genie Teacher case study to the seven days ending 27 Oct 2026 (Search Console final data reached
 * 27 Oct on 30 Oct) and the Peec AI weekly readings to the week of 19 Oct (the last complete Monday week).
 *
 * The chart ends on 22 Oct, where its trailing 7-day mean peaks (634×), so it does not end on a dip (Arnel,
 * 18 Oct 2026); the headline is the latest complete seven days (623×) and the caption names both.
 * The lead and booking figures and the 30-day AI window keep their late-September windows.
 *
 * Input: --gsc <the 30 Oct Executor pull: { result: { genie: { rows: [[date, clicks, impressions, position], …] } } }>,
 * a daily pull of sc-domain:genieteacher.com from 13 Apr 2026. Raw counts never leave this script.
 *
 * Peec AI weekly readings (brand report, all 7 brands, Monday weeks, read 30 Oct 2026):
 *   12 Oct: visibility 14.23%, share of voice 20.17%, rank 2.1
 *   19 Oct: visibility 14.62%, share of voice 20.01%, rank 2.3 (3rd of 7 on share of voice, as before)
 * Earlier published weeks keep the readings taken on 18 Oct.
 *
 * Every shipped figure (370×, 50×, 594×, 369×, the 16 Oct chart point) must reproduce, and every replaced
 * sentence must exist exactly once, or nothing is written.
 *
 *   SANITY_API_TOKEN=… node scripts/instruments/refresh-genie-2026-10-30.mjs --gsc <f> [--write]
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

const DOC_ID = 'caseStudy-genie-teacher-organic-growth';
const END = '2026-10-27';
const CHART_END = '2026-10-22';

/* ── Search Console ─────────────────────────────────────────────────── */
const all = JSON.parse(readFileSync(gscPath, 'utf8')).result.genie.rows.filter(([d]) => d <= END);
if (all.at(-1)[0] !== END) throw new Error(`pull ends ${all.at(-1)[0]}, need ${END}`);
const range = (a, b) => all.filter(([d]) => d >= a && d <= b);
const month = (m) => all.filter(([d]) => d.startsWith(m));
const sum = (rs, i) => rs.reduce((t, r) => t + r[i], 0);
const wpos = (rs) => rs.reduce((t, r) => t + r[2] * r[3], 0) / sum(rs, 2);
const r1 = (v) => Math.round(v * 10) / 10;
const apr = month('2026-04');
const may = month('2026-05');
const sep = month('2026-09');
const mayImp = sum(may, 2) / may.length;
const mayClk = sum(may, 1) / may.length;
const perDay = (rs) => sum(rs, 2) / rs.length / mayImp;
const perWeekClk = (rs) => sum(rs, 1) / (mayClk * 7);
const mean7 = (end) => { const i = all.findIndex(([d]) => d === end); return sum(all.slice(i - 6, i + 1), 2) / 7 / mayImp; };

// shipped figures must reproduce
const old = range('2026-10-10', '2026-10-16');
const oct16 = range('2026-10-01', '2026-10-16');
const p16 = all.find(([d]) => d === '2026-10-16');
const shipped = {
  imp: Math.round(perDay(old)), clk: Math.round(perWeekClk(old)), pos: r1(wpos(old)),
  octVsApr: Math.round(sum(oct16, 2) / sum(apr, 2)), best16: Math.round(p16[2] / mayImp),
  pt16: `${Math.round((p16[1] / mayClk) * 100)}/${Math.round((p16[2] / mayImp) * 100)}`,
};
const expectOld = { imp: 370, clk: 50, pos: 6, octVsApr: 369, best16: 594, pt16: '5735/59355' };
for (const [k, e] of Object.entries(expectOld)) if (shipped[k] !== e) throw new Error(`shipped ${k} = ${e}, data says ${shipped[k]}`);

const win = range('2026-10-21', END);
const oct = range('2026-10-01', END);
const bestDay = range('2026-10-01', END).reduce((a, b) => (b[2] > a[2] ? b : a));
const peak = range('2026-10-01', END).reduce((a, [d]) => (mean7(d) > mean7(a) ? d : a), '2026-10-07');
const f = {
  imp: Math.round(perDay(win)), clk: Math.round(perWeekClk(win)), pos: r1(wpos(win)),
  octVsApr: Math.round(sum(oct, 2) / sum(apr, 2)), octVsSepImp: r1(sum(oct, 2) / sum(sep, 2)), octVsSepClk: r1(sum(oct, 1) / sum(sep, 1)),
  bestDay: bestDay[0], bestDayX: Math.round(bestDay[2] / mayImp), peak, peakX: Math.round(mean7(peak)),
};
const expectNew = { imp: 623, clk: 72, pos: 6, octVsApr: 843, octVsSepImp: 2.3, octVsSepClk: 1.9, bestDay: '2026-10-21', bestDayX: 784, peak: CHART_END, peakX: 634 };
for (const [k, e] of Object.entries(expectNew)) if (f[k] !== e) throw new Error(`copy says ${k} = ${e}, data says ${f[k]}`);

/* ── Document ───────────────────────────────────────────────────────── */
const doc = await client.getDocument(DOC_ID);
if (!doc) throw new Error(`no document ${DOC_ID}`);
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
    'and 370× in the seven days to 16 October (Google Search Console, to 16 Oct 2026). Clicks followed: those seven days brought 50× the clicks',
    'and 623× in the seven days to 27 October (Google Search Console, to 27 Oct 2026). Clicks followed: those seven days brought 72× the clicks',
  ],
  [
    'In AI search, visibility grew from 5.26% in the week of 25 May to 12.47% in the week of 5 October 2026, and share of voice from 2.26% to 16.2% (Peec AI), with an average mention rank between 1.0 and 2.0 since July.',
    'In AI search, visibility grew from 5.26% in the week of 25 May to 14.62% in the week of 19 October 2026, and share of voice from 2.26% to 20.0% (Peec AI), with an average mention rank between 1.0 and 2.3 since July.',
  ],
  [
    'The first sixteen days of October then brought more impressions than the whole of September.',
    'The first twenty-seven days of October then brought 2.3× the impressions and 1.9× the clicks of the whole of September.',
  ],
  ['(Google Search Console, root domain, to 16 October 2026)', '(Google Search Console, root domain, to 27 October 2026)'],
  [
    '<tr><td><strong>October, first 16 days</strong></td><td><strong>369×</strong></td></tr>',
    '<tr><td><strong>October, first 27 days</strong></td><td><strong>843×</strong></td></tr>',
  ],
  [
    'and September closed at 362×, a total the first sixteen days of October passed at 369×. Measured per day, impressions rose 28× from May to August and 170× across September; the seven days to 16 October ran at 370× an average May day, and the best day so far, 16 October, at 594×.',
    'and September closed at 362×; the first twenty-seven days of October reached 843×. Measured per day, impressions rose 28× from May to August and 170× across September; the seven days to 27 October ran at 623× an average May day, and the best day so far, 21 October, at 784×.',
  ],
  [
    'The seven days to 16 October brought 50× the clicks of an average May week,',
    'The seven days to 27 October brought 72× the clicks of an average May week,',
  ],
  ['and a climb to 12.47%</h3>', 'and a climb to 14.62%</h3>'],
  [
    'then climbing to <strong>12.47%</strong> in the week of 5 October.',
    'then climbing to <strong>12.47%</strong> in the week of 5 October and <strong>14.62%</strong> in the week of 19 October.',
  ],
  ['<h3>Share of voice: 2.26% to 16.2%, named near the top</h3>', '<h3>Share of voice: 2.26% to 20.0%, named near the top</h3>'],
  [
    'to <strong>16.16%</strong> in the week of 5 October 2026, with an average mention rank between 1.0 and 2.0 every week since July.',
    'to <strong>20.01%</strong> in the week of 19 October 2026, with an average mention rank between 1.0 and 2.3 every week since July.',
  ],
  [
    'Updated 18 October 2026 with Search Console data to 16 October and Peec AI weekly readings to the week of 5 October (the lead and booking figures and the 30-day AI window keep their late-September windows); previously updated 9 October with',
    'Updated 30 October 2026 with Search Console data to 27 October and Peec AI weekly readings to the week of 19 October (the lead and booking figures and the 30-day AI window keep their late-September windows); previously updated 18 October with Search Console data to 16 October and Peec AI to the week of 5 October, 9 October with',
  ],
], 'mainBody');

const paragraphSummary = swap(doc.paragraphSummary, [
  [
    'and 370× in the seven days to 16 October, clicks per week climbed 50× on the May average,',
    'and 623× in the seven days to 27 October, clicks per week climbed 72× on the May average,',
  ],
  [
    'In AI search its visibility grew from 5.26% to 12.47% and its share of voice from 2.26% to 16.2% between the weeks of 25 May and 5 October 2026, at an average mention rank of 1.0 to 2.0 since July.',
    'In AI search its visibility grew from 5.26% to 14.62% and its share of voice from 2.26% to 20.0% between the weeks of 25 May and 19 October 2026, at an average mention rank of 1.0 to 2.3 since July.',
  ],
], 'paragraphSummary');

const faq = doc.faq.map((q) => {
  if (q._key === 'faq-2') return { ...q, answer: swap(q.answer, [[
    'and the first sixteen days of October brought more impressions than all of September.',
    'and the first twenty-seven days of October brought 2.3× the impressions of all of September.',
  ]], 'faq-2') };
  if (q._key === 'faq-3') return { ...q, answer: swap(q.answer, [[
    'clicks per week are 50× the May 2026 average and the average position has moved from 11.5 in August to 6.0 in mid-October.',
    'clicks per week are 72× the May 2026 average and the average position has moved from 11.5 in August to 6.0 in late October.',
  ]], 'faq-3') };
  return q;
});

/* Daily chart: extend from 17 Oct to its 7-day high on 22 Oct */
const it = doc.instruments.indexedTrend;
const last = it.points.at(-1);
if (last.date !== '2026-10-16') throw new Error(`chart ends ${last.date}`);
let n = Number(last._key.slice(2));
const add = all.filter(([d]) => d > last.date && d <= CHART_END).map(([d, c, i]) => ({
  _key: `d-${++n}`, date: d, month: 'Oct',
  clicks: Math.round((c / mayClk) * 100), impressions: Math.round((i / mayImp) * 100),
}));
const indexedTrend = {
  ...it,
  points: [...it.points, ...add],
  caption: swap(it.caption, [[
    'the seven days to 16 October ran at 370× (daily to 16 Oct).',
    'the seven days to 22 October ran at 634×, the high so far, and the seven days to 27 October at 623× (daily to 22 Oct).',
  ]], 'indexedTrend.caption'),
};

/* Peec weekly share of voice: add the weeks of 12 and 19 Oct */
const tc = doc.instruments.topicClimb;
if (tc.points.at(-1).week !== '2026-10-05') throw new Error(`share-of-voice series ends ${tc.points.at(-1).week}`);
const topicClimb = {
  ...tc,
  points: [...tc.points, { _key: 'pt-13', value: 0.2017, week: '2026-10-12' }, { _key: 'pt-14', value: 0.2001, week: '2026-10-19' }],
  caption: swap(tc.caption, [['2.26% to 16.2%, 25 May to 11 Oct.', '2.26% to 20.0%, 25 May to 25 Oct.']], 'topicClimb.caption'),
};

const pr = doc.instruments.publishedResult;
if (pr.rows.map((r) => r.value).join('|') !== '5.26% → 12.47%|2.26% → 16.2%|1.0–2.0') throw new Error('publishedResult rows changed since 18 Oct');
const publishedResult = {
  ...pr,
  rows: pr.rows.map((r) => ({
    'r-0': { ...r, unit: 'AI visibility, week of 25 May → week of 19 Oct', value: '5.26% → 14.62%' },
    'r-1': { ...r, value: '2.26% → 20.0%' },
    'r-2': { ...r, value: '1.0–2.3' },
  }[r._key] ?? r)),
};

const patch = {
  name: `Genie Teacher: ${f.imp}× Search Visibility`,
  result1Number: `${f.imp}×`,
  result1Title: 'Google impressions per day, May 2026 average → 7 days to 27 Oct 2026',
  result2Number: `${f.clk}×`,
  result2Title: 'Google clicks per week, May 2026 average → 7 days to 27 Oct 2026',
  paragraphSummary,
  mainBody,
  faq,
  'instruments.indexedTrend': indexedTrend,
  'instruments.topicClimb': topicClimb,
  'instruments.publishedResult': publishedResult,
  'instruments.gscSource': 'Google Search Console · indexed to May 2026 = 100 · to 27 Oct 2026',
  'instruments.aiSource': 'Peec AI · weekly to 25 Oct 2026, 30-day window to 27 Sep 2026',
};

console.log(JSON.stringify({ shipped, fresh: f, added: add.length }, null, 1));
if (!WRITE) { console.log('\ndry run: nothing written (add --write)'); process.exit(0); }
const res = await client.patch(DOC_ID).ifRevisionId(doc._rev).set(patch).commit();
console.log(`patched ${res._id} rev ${res._rev}`);
