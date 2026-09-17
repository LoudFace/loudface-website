/**
 * Refresh the Delshad Legal case study with every source to mid-September 2026:
 * Google Search Console to 15 Sep (site-wide daily chart, and the clicks-per-week
 * metric that excludes the six celebrity-case pages), Peec AI daily share of
 * voice to 13 Sep plus the 30 days to 17 Sep, PostHog case enquiries to the
 * complete week of 6 Sep.
 *
 * Inputs, all saved beside the research brief at
 * content-engine/.claude/research/loudface/delshad-legal-content-engine/:
 *   --gsc <daily gsc-cli --dimensions date --json>          site-wide daily series
 *   --gsc-date-page <gsc-cli --dimensions date,page --json> for the celebrity exclusion
 *   --peec-days <folder of one-day brand-report JSONs named YYYY-MM-DD.json>
 *
 * Raw counts never leave this script: Google values are indexed to the average
 * March 2026 day (= 100), enquiries to the pre-August weekly mean (= 100), Peec
 * values are 0-1 ratios. Already-shipped points must reproduce (guarded).
 *
 *   node scripts/instruments/refresh-delshad-2026-09-18.mjs --gsc <f> --gsc-date-page <f> --peec-days <dir>          # dry run
 *   node scripts/instruments/refresh-delshad-2026-09-18.mjs --gsc <f> --gsc-date-page <f> --peec-days <dir> --write  # patch the PUBLISHED doc
 *
 * Backup of the pre-refresh document: scripts/backups/delshad-casestudy-pre-2026-09-18.json
 */
import { createClient } from '@sanity/client';
import { readFileSync, readdirSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const arg = (k) => (args.indexOf(k) >= 0 ? args[args.indexOf(k) + 1] : null);
const gscPath = arg('--gsc'), gscPagePath = arg('--gsc-date-page'), peecDir = arg('--peec-days');
if (!gscPath || !gscPagePath || !peecDir) { console.error('--gsc, --gsc-date-page and --peec-days are required'); process.exit(1); }

let token = process.env.SANITY_API_TOKEN;
if (!token && existsSync(join(here, '../../.env.local'))) {
  const env = Object.fromEntries(readFileSync(join(here, '../../.env.local'), 'utf8').split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#')).map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]));
  token = env.SANITY_API_TOKEN;
}
if (!token) { console.error('SANITY_API_TOKEN missing (run through scripts/with-secrets.sh)'); process.exit(1); }
const client = createClient({ projectId: 'xjjjqhgt', dataset: 'production', apiVersion: '2025-03-29', token, useCdn: false });

const DOC_ID = 'caseStudy-delshad-legal-content-engine';
const START = '2026-03-01', END = '2026-09-15', BASELINE_MONTH = '2026-03';
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const r1 = (n) => Math.round(n * 10) / 10;
const addDays = (iso, n) => { const d = new Date(`${iso}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const sum = (rows, k) => rows.reduce((s, r) => s + r[k], 0);

/* ── Google, site-wide daily ───────────────────────────────────────── */
const raw = JSON.parse(readFileSync(gscPath, 'utf8')).rows.map((r) => ({ date: r.keys[0], impressions: r.impressions, clicks: r.clicks, position: r.position })).sort((a, b) => a.date.localeCompare(b.date));
const byDate = new Map(raw.map((r) => [r.date, r]));
const month = (m) => raw.filter((r) => r.date.startsWith(m));
const base = month(BASELINE_MONTH);
if (base.length !== 31) throw new Error(`March 2026 has ${base.length} days`);
const baseImp = sum(base, 'impressions') / 31, baseClk = sum(base, 'clicks') / 31;
const points = [];
for (let d = START, i = 0; d <= END; d = addDays(d, 1), i++) {
  const r = byDate.get(d); if (!r) throw new Error(`no GSC row for ${d}`);
  points.push({ _key: `d-${i}`, date: d, month: MONTHS[Number(d.slice(5, 7)) - 1], impressions: Math.round((r.impressions / baseImp) * 100), clicks: Math.round((r.clicks / baseClk) * 100) });
}
const perDay = (m) => sum(month(m), 'impressions') / month(m).length;
const sep = raw.filter((r) => r.date >= '2026-09-01' && r.date <= END);
const wpos = (rows) => rows.reduce((s, r) => s + r.position * r.impressions, 0) / sum(rows, 'impressions');
const range = (a, b) => raw.filter((r) => r.date >= a && r.date <= b);
const priorBest = Math.max(...['2025-09','2025-10','2025-11','2025-12','2026-01','2026-02','2026-03','2026-04','2026-05','2026-06','2026-07'].map((m) => sum(month(m), 'clicks')));
const stats = {
  impPerDayMayToAug: perDay('2026-08') / perDay('2026-05'),
  impPerDayMarToSep: sum(sep, 'impressions') / sep.length / perDay('2026-03'),
  sepImpShareOfAug: sum(sep, 'impressions') / sum(month('2026-08'), 'impressions') * 100,
  quarterClicks: sum(range('2026-06-01', '2026-08-31'), 'clicks') / sum(range('2026-03-01', '2026-05-31'), 'clicks'),
  posAug: wpos(month('2026-08')),
  posSep: wpos(sep),
  augBestMonth: sum(month('2026-08'), 'clicks') > priorBest ? 1 : 0,
};
const expect = { impPerDayMayToAug: 3.4, impPerDayMarToSep: 6.3, sepImpShareOfAug: 79, quarterClicks: 2.5, posAug: 15.2, posSep: 9.4, augBestMonth: 1 };
const roundLike = (v, e) => (Number.isInteger(e) ? Math.round(v) : r1(v));
for (const [k, e] of Object.entries(expect)) { const got = roundLike(stats[k], e); if (got !== e) throw new Error(`copy says ${k} = ${e}, data says ${got} (${stats[k]})`); }

/* Monthly clicks growth curve, Feb..Aug, indexed to the largest = 100 */
const gcMonths = ['2026-02','2026-03','2026-04','2026-05','2026-06','2026-07','2026-08'];
const gcVals = gcMonths.map((m) => sum(month(m), 'clicks'));
const gcMax = Math.max(...gcVals);
const pct = (v) => `+${Math.round((v / gcVals[0] - 1) * 100)}%`;
const growthCurve = gcMonths.map((m, i) => ({ _key: `gc-${MONTHS[Number(m.slice(5)) - 1].toLowerCase()}`, _type: 'object', label: MONTHS[Number(m.slice(5)) - 1], value: Math.round((gcVals[i] / gcMax) * 100), displayValue: i === 0 ? 'baseline' : (gcVals[i] / gcVals[0] - 1) < 0.03 ? '' : pct(gcVals[i]) }));

/* ── Google, clicks per week outside the celebrity pages ───────────── */
const CEL = /tyler-perry|dixon|jasmine|kingvicann|masked-singer|mario-barrett|derek|rodriguez-v-perry/i;
const dp = JSON.parse(readFileSync(gscPagePath, 'utf8')).rows;
const wk = {};
for (const r of dp) { const [d, u] = r.keys; if (CEL.test(u)) continue; const s = addDays(d, -new Date(`${d}T00:00:00Z`).getUTCDay()); wk[s] = (wk[s] || 0) + r.clicks; }
const w = (s) => wk[s] || 0;
if (w('2026-06-07') !== 52) throw new Error(`week of 7 Jun outside celebrity pages = ${w('2026-06-07')}, expected 52`);
const clicksWeek = { aug24: w('2026-08-23') / w('2026-06-07'), sep6: w('2026-09-06') / w('2026-06-07'), aug30: w('2026-08-30') / w('2026-06-07') };
if (r1(clicksWeek.aug24) !== 6.1 || r1(clicksWeek.sep6) !== 5.6 || Math.min(clicksWeek.aug30, clicksWeek.sep6, clicksWeek.aug24) < 5.6 || Math.max(clicksWeek.aug30, clicksWeek.sep6, clicksWeek.aug24) > 6.15) throw new Error(`clicks-per-week multiples moved: ${JSON.stringify(clicksWeek)}`);

/* ── Peec daily share of voice ──────────────────────────────────────── */
const days = readdirSync(peecDir).filter((f) => f.endsWith('.json')).sort().map((f) => {
  const d = JSON.parse(readFileSync(join(peecDir, f), 'utf8'));
  const g = (d.projectWide?.data || []).find((b) => b.brand.name.includes('Delshad'));
  return { date: f.replace('.json', ''), sov: g ? Math.round(g.share_of_voice * 10000) / 10000 : null };
}).filter((x) => x.sov != null && x.date <= '2026-09-13');

/* ── PostHog case enquiries (brief F9), weekly, Sunday start ────────── */
const LEAD_WEEKS = [['2026-06-07', 3], ['2026-06-14', 6], ['2026-06-21', 6], ['2026-06-28', 3], ['2026-07-05', 3], ['2026-07-12', 7], ['2026-07-19', 12], ['2026-07-26', 7], ['2026-08-02', 17], ['2026-08-09', 10], ['2026-08-16', 17], ['2026-08-23', 9], ['2026-08-30', 17], ['2026-09-06', 17]];
const CUT = '2026-08-01';
const mean = (rows) => rows.reduce((t, [, v]) => t + v, 0) / rows.length;
const leadBase = mean(LEAD_WEEKS.filter(([x]) => x < CUT));
const leadMultiple = mean(LEAD_WEEKS.filter(([x]) => x >= CUT)) / leadBase;
if (r1(leadMultiple) !== 2.5) throw new Error(`lead multiple ${leadMultiple} != 2.5`);
const leadGrowth = {
  _type: 'object',
  title: 'Case enquiries per week, indexed',
  multiple: `${leadMultiple.toFixed(1)}×`,
  multipleLabel: 'as many case enquiries a week from August to mid-September as the weeks before August',
  baselineLabel: 'every tracked week before August',
  caption: 'Weekly enquiries from the case-review form, indexed so the climb is public and the firm’s caseload is not. Tracking began the week the new site went live; complete weeks only.',
  source: 'PostHog · 7 Jun – 12 Sep 2026',
  points: LEAD_WEEKS.map(([week, v]) => ({ _key: `lg-${week}`, _type: 'object', week, value: Math.round((v / leadBase) * 100) })),
};

/* ── Copy ───────────────────────────────────────────────────────────── */
const CE = join(here, '../../../content-engine/.claude/drafts/loudface/delshad-legal-content-engine');
const mainBody = readFileSync(join(here, 'delshad-mainBody-2026-09-18.html'), 'utf8').trim();
const faq = JSON.parse(readFileSync(`${CE}.faq.json`, 'utf8')).faq;
const paragraphSummary = readFileSync(`${CE}.lede.txt`, 'utf8').trim();

const patch = {
  'instruments.gscSource': 'Google Search Console · indexed to Mar 2026 = 100 · to 15 Sep 2026',
  'instruments.aiSource': 'Peec AI · daily to 13 Sep 2026, 30-day window to 17 Sep 2026',
  'instruments.indexedTrend.points': points,
  'instruments.indexedTrend.caption': 'Impressions per day rose 3.4× from May 2026, before the work, to August, and 6.3× the March average over 1–15 September. Daily to 15 Sep 2026, indexed to the average March day = 100.',
  'instruments.topicClimb.points': null, // filled after the doc is read: shipped days before the pulled window + the pulled days
  'instruments.topicClimb.caption': '0.13% in the week of 8 June to 30.45% in the week of 7 September; first of the twelve tracked employment-law firms every week since 10 August. The prompt set was rebuilt in late July and early August.',
  'instruments.engineBeforeAfter.afterLabel': 'Sep 2026 (1–13)',
  'instruments.engineBeforeAfter.rows': [
    { _key: 'r-0', engine: 'chatgpt', before: 0.0014, after: 0.0326 },
    { _key: 'r-1', engine: 'gemini', before: 0.001, after: 0.0307 },
    { _key: 'r-2', engine: 'googleAio', before: 0, after: 0.0479 },
  ],
  'instruments.engineBeforeAfter.caption': 'Visibility, the share of all tracked answers naming the firm, by engine: from near-zero in June to cited on all three. Share of voice among the 12 tracked firms is the headline figure.',
  'instruments.publishedResult.rows': [
    { _key: 'r-0', value: '0.13% → 30.9%', unit: 'AI share of voice, week of 8 Jun → 30 days to 17 Sep' },
    { _key: 'r-1', value: '1st of 12', unit: 'tracked firms, every week since 10 Aug' },
    { _key: 'r-2', value: '5.6×', unit: 'Google clicks per week outside the celebrity pages, week of 7 Jun → week of 6 Sep' },
  ],
  'instruments.publishedResult.caption': 'Average rank 1.4 when cited, 30 days to 17 Sep. Sources: Peec AI, Google Search Console.',
  'instruments.leadGrowth': leadGrowth,
  'charts[0].data': [
    { _key: 'bc-articles', _type: 'object', label: 'Articles we shipped', value: 60274, displayValue: '89%' },
    { _key: 'bc-case', _type: 'object', label: 'Celebrity-case pages', value: 7144, displayValue: '11%' },
  ],
  'charts[0].legendPrimary': 'First 15 days of September 2026. Source: Google Search Console.',
  'charts[0].title': 'Share of September impressions: our articles vs the celebrity-case pages',
  'charts[1].data': growthCurve,
  'charts[1].legendPrimary': 'Monthly Google clicks, February to August 2026; bars scaled to August = 100, labels show the change from February. Source: Google Search Console.',
  result1Number: '30.9%',
  result1Title: 'AI share of voice, 30 days to 17 Sep 2026, up from 0.13% in the week of 8 Jun; 1st of 12 tracked firms',
  result2Number: '5.6×',
  result2Title: 'Google clicks per week outside the celebrity-case pages, week of 7 Jun → week of 6 Sep 2026',
  result3Number: '2.5×',
  result3Title: 'Case enquiries per week, weeks before August → August to mid-September 2026 (PostHog)',
  paragraphSummary,
  faq,
  mainBody,
};

/* ── Plan / guards / write ──────────────────────────────────────────── */
console.log(`Google: ${points.length} daily points ${points[0].date} → ${points.at(-1).date}; multipliers`, Object.fromEntries(Object.entries(stats).map(([k, v]) => [k, +v.toFixed(2)])));
console.log('Clicks/week outside celebrity pages: 7 Jun', w('2026-06-07'), '23 Aug', w('2026-08-23'), '30 Aug', w('2026-08-30'), '6 Sep', w('2026-09-06'), '→', Object.fromEntries(Object.entries(clicksWeek).map(([k, v]) => [k, +v.toFixed(2)])));
console.log('Growth curve:', growthCurve.map((g) => `${g.label} ${g.value} ${g.displayValue}`).join(' | '));
console.log(`Peec daily: ${days.length} points ${days[0].date} → ${days.at(-1).date}; last`, days.at(-1).sov);
console.log(`Enquiries: baseline ${leadBase.toFixed(3)}/wk, multiple ${leadMultiple.toFixed(2)}; indexed ${leadGrowth.points.map((p) => p.value).join(' ')}`);

const doc = await client.getDocument(DOC_ID);
if (!doc) throw new Error('published doc not found');
if (await client.getDocument(`drafts.${DOC_ID}`)) { console.error('A draft exists for this document; refusing to patch under a pending human edit.'); process.exit(1); }
console.log(`Current _rev ${doc._rev}, updated ${doc._updatedAt}`);
let drift = 0;
const old = new Map(doc.instruments.indexedTrend.points.map((p) => [p.date, p]));
for (const p of points) { const o = old.get(p.date); if (o && (Math.abs(o.impressions - p.impressions) > 1 || Math.abs(o.clicks - p.clicks) > 1)) drift++; }
const oldSov = new Map(doc.instruments.topicClimb.points.map((p) => [p.week, p.value]));
let sdrift = 0;
for (const x of days) { if (oldSov.has(x.date) && Math.abs(oldSov.get(x.date) - x.sov) > 0.0006) { sdrift++; console.log('  sov drift', x.date, oldSov.get(x.date), x.sov); } }
console.log(`Drift: Google ${drift}, Peec ${sdrift}`);
if (drift > 0 || sdrift > 0) { console.error('Shipped points do not reproduce; investigate before writing.'); process.exit(1); }
const merged = [...doc.instruments.topicClimb.points.filter((p) => p.week < days[0].date).map((p) => ({ date: p.week, sov: p.value })), ...days];
for (let i = 1; i < merged.length; i++) if (merged[i].date !== addDays(merged[i - 1].date, 1)) throw new Error(`Peec daily series has a gap at ${merged[i].date}`);
if (merged[0].date !== '2026-06-10' || merged.at(-1).date !== '2026-09-13' || merged.length !== 96) throw new Error(`Peec daily series must run 10 Jun → 13 Sep (96 days), got ${merged[0].date} → ${merged.at(-1).date} (${merged.length})`);
patch['instruments.topicClimb.points'] = merged.map((x, i) => ({ _key: `d-${i}`, week: x.date, value: x.sov }));
console.log(`Peec daily merged: ${merged.length} points ${merged[0].date} → ${merged.at(-1).date}`);

if (!WRITE) { console.log('\nDry run. Fields to set:', Object.keys(patch).join(', ')); process.exit(0); }
mkdirSync(join(here, '../backups'), { recursive: true });
writeFileSync(join(here, '../backups/delshad-casestudy-pre-2026-09-18.json'), JSON.stringify(doc, null, 2));
const res = await client.patch(DOC_ID).set(patch).commit();
console.log(`✓ patched ${res._id} → _rev ${res._rev}`);
