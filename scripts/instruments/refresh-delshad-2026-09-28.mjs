/**
 * Refresh the Delshad Legal case study with every source to late September 2026:
 * Google Search Console to 25 Sep (site-wide daily chart, and the clicks-per-week
 * metric that excludes the celebrity-case pages, now to the complete week of
 * 13 Sep), Peec AI daily share of voice to 27 Sep plus the 30 days to 27 Sep,
 * PostHog case enquiries to the complete week of 20 Sep.
 *
 * Same method as refresh-delshad-2026-09-18.mjs; only the end dates move.
 *
 * Inputs, all saved beside the research brief at
 * content-engine/.claude/research/loudface/delshad-legal-content-engine/:
 *   --gsc <daily gsc-cli --dimensions date --json>          site-wide daily series
 *   --gsc-date-page <gsc-cli --dimensions date,page --json> for the celebrity exclusion
 *   --gsc-pages <gsc-cli --dimensions page --json, 1–25 Sep> articles vs celebrity split
 *   --shipped <shipped-urls JSON from the spine>            the "articles we shipped" set
 *   --peec-days <folder of one-day brand-report JSONs named YYYY-MM-DD.json>
 *   --leads <posthog-cli query --json, weekly lead_form_submitted>
 *
 * Raw counts never leave this script: Google values are indexed to the average
 * March 2026 day (= 100), enquiries to the pre-August weekly mean (= 100), Peec
 * values are 0-1 ratios. Already-shipped points must reproduce (guarded).
 *
 *   node scripts/instruments/refresh-delshad-2026-09-28.mjs --gsc <f> --gsc-date-page <f> --gsc-pages <f> --shipped <f> --peec-days <dir> --leads <f>          # dry run
 *   node scripts/instruments/refresh-delshad-2026-09-28.mjs ... --write  # patch the PUBLISHED doc
 *
 * Backup of the pre-refresh document: scripts/backups/delshad-casestudy-pre-2026-09-28.json
 */
import { createClient } from '@sanity/client';
import { readFileSync, readdirSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const arg = (k) => (args.indexOf(k) >= 0 ? args[args.indexOf(k) + 1] : null);
const gscPath = arg('--gsc'), gscPagePath = arg('--gsc-date-page'), gscPagesPath = arg('--gsc-pages'), shippedPath = arg('--shipped'), peecDir = arg('--peec-days'), leadsPath = arg('--leads');
if (!gscPath || !gscPagePath || !gscPagesPath || !shippedPath || !peecDir || !leadsPath) { console.error('--gsc, --gsc-date-page, --gsc-pages, --shipped, --peec-days and --leads are required'); process.exit(1); }

let token = process.env.SANITY_API_TOKEN;
if (!token && existsSync(join(here, '../../.env.local'))) {
  const env = Object.fromEntries(readFileSync(join(here, '../../.env.local'), 'utf8').split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#')).map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]));
  token = env.SANITY_API_TOKEN;
}
if (!token) { console.error('SANITY_API_TOKEN missing (run through scripts/with-secrets.sh)'); process.exit(1); }
const client = createClient({ projectId: 'xjjjqhgt', dataset: 'production', apiVersion: '2025-03-29', token, useCdn: false });

const DOC_ID = 'caseStudy-delshad-legal-content-engine';
const START = '2026-03-01', END = '2026-09-25', BASELINE_MONTH = '2026-03';
const SEP_FROM = '2026-09-01';
const PEEC_END = '2026-09-27';
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const r1 = (n) => Math.round(n * 10) / 10;
const addDays = (iso, n) => { const d = new Date(`${iso}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const sum = (rows, k) => rows.reduce((s, r) => s + r[k], 0);

/* ── Google, site-wide daily ───────────────────────────────────────── */
const raw = JSON.parse(readFileSync(gscPath, 'utf8')).rows.map((r) => ({ date: r.keys[0], impressions: r.impressions, clicks: r.clicks, position: r.position })).sort((a, b) => a.date.localeCompare(b.date));
if (raw.at(-1).date !== END) throw new Error(`GSC pull ends ${raw.at(-1).date}, expected ${END}`);
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
const sep = raw.filter((r) => r.date >= SEP_FROM && r.date <= END);
if (sep.length !== 25) throw new Error(`1–25 Sep has ${sep.length} days`);
const wpos = (rows) => rows.reduce((s, r) => s + r.position * r.impressions, 0) / sum(rows, 'impressions');
const range = (a, b) => raw.filter((r) => r.date >= a && r.date <= b);
const priorBest = (k) => Math.max(...['2025-09','2025-10','2025-11','2025-12','2026-01','2026-02','2026-03','2026-04','2026-05','2026-06','2026-07'].map((m) => sum(month(m), k)));
const aug = month('2026-08');
// first day on which the September running total passed the whole of August
const passDay = (k) => { let t = 0; for (const r of sep) { t += r[k]; if (t > sum(aug, k)) return Number(r.date.slice(8)); } return 0; };
const stats = {
  impPerDayMayToAug: perDay('2026-08') / perDay('2026-05'),
  impPerDayMarToSep: sum(sep, 'impressions') / sep.length / perDay('2026-03'),
  sepImpShareOfAug: sum(sep, 'impressions') / sum(aug, 'impressions') * 100,
  sepClkShareOfAug: sum(sep, 'clicks') / sum(aug, 'clicks') * 100,
  sepPassedAugImpOn: passDay('impressions'),
  sepPassedAugClkOn: passDay('clicks'),
  quarterClicks: sum(range('2026-06-01', '2026-08-31'), 'clicks') / sum(range('2026-03-01', '2026-05-31'), 'clicks'),
  posAug: wpos(aug),
  posSep: wpos(sep),
  augBestMonth: sum(aug, 'clicks') > priorBest('clicks') && sum(aug, 'impressions') > priorBest('impressions') ? 1 : 0,
};
const expect = { impPerDayMayToAug: 3.4, impPerDayMarToSep: 6.8, sepImpShareOfAug: 143, sepClkShareOfAug: 142, sepPassedAugImpOn: 20, sepPassedAugClkOn: 21, quarterClicks: 2.5, posAug: 15.2, posSep: 8.3, augBestMonth: 1 };
const roundLike = (v, e) => (Number.isInteger(e) ? Math.round(v) : r1(v));
for (const [k, e] of Object.entries(expect)) { const got = roundLike(stats[k], e); if (got !== e) throw new Error(`copy says ${k} = ${e}, data says ${got} (${stats[k]})`); }

/* Monthly clicks growth curve, Feb..Aug, indexed to the largest = 100 (September is incomplete and stays off) */
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
// shipped weeks must reproduce: 7 Jun baseline 52, 23 Aug 317 (6.1×), 30 Aug 292, 6 Sep 293 (5.6×)
for (const [s, v] of [['2026-06-07', 52], ['2026-08-23', 317], ['2026-08-30', 292], ['2026-09-06', 293]]) if (w(s) !== v) throw new Error(`week of ${s} outside celebrity pages = ${w(s)}, shipped ${v}`);
const LAST_GSC_WEEK = '2026-09-13'; // 13–19 Sep, the last complete Sunday-start week inside data to 25 Sep
if (addDays(LAST_GSC_WEEK, 6) > END || addDays(LAST_GSC_WEEK, 13) <= END) throw new Error('LAST_GSC_WEEK is not the last complete week');
const clicksWeek = { aug23: w('2026-08-23') / w('2026-06-07'), aug30: w('2026-08-30') / w('2026-06-07'), sep6: w('2026-09-06') / w('2026-06-07'), sep13: w(LAST_GSC_WEEK) / w('2026-06-07') };
if (r1(clicksWeek.aug23) !== 6.1 || r1(clicksWeek.sep6) !== 5.6 || r1(clicksWeek.sep13) !== 7.6) throw new Error(`clicks-per-week multiples moved: ${JSON.stringify(clicksWeek)}`);

/* ── Google, articles we shipped vs the celebrity-case pages, 1–25 Sep ─ */
const shipped = new Set(JSON.parse(readFileSync(shippedPath, 'utf8')));
let si = 0, sc = 0, ci = 0, cc = 0;
for (const r of JSON.parse(readFileSync(gscPagesPath, 'utf8')).rows) { const u = r.keys[0]; if (CEL.test(u)) { ci += r.impressions; cc += r.clicks; } else if (shipped.has(u)) { si += r.impressions; sc += r.clicks; } }
const split = { impShare: si / (si + ci) * 100, clkShare: sc / (sc + cc) * 100, impRatio: si / ci, clkRatio: sc / cc };
if (Math.round(split.impShare) !== 91 || Math.round(split.clkShare) !== 87 || split.impRatio <= 10 || split.clkRatio < 6) throw new Error(`split moved: ${JSON.stringify(split)}`);

/* ── Peec daily share of voice ──────────────────────────────────────── */
const days = readdirSync(peecDir).filter((f) => f.endsWith('.json')).sort().map((f) => {
  const d = JSON.parse(readFileSync(join(peecDir, f), 'utf8'));
  const g = (d.projectWide?.data || []).find((b) => b.brand.name.includes('Delshad'));
  return { date: f.replace('.json', ''), sov: g ? Math.round(g.share_of_voice * 10000) / 10000 : null };
}).filter((x) => x.sov != null && x.date <= PEEC_END);

/* ── PostHog case enquiries (brief F9), weekly, Sunday start ────────── */
const LAST_LEAD_WEEK = '2026-09-20'; // 20–26 Sep, the last complete week on 28 Sep
const leadsRaw = JSON.parse(readFileSync(leadsPath, 'utf8'));
const LEAD_WEEKS = leadsRaw.rows.filter((r) => r[1] === 'lead_form_submitted' && r[0] <= LAST_LEAD_WEEK).map((r) => [r[0], r[2]]);
const SHIPPED_LEADS = [['2026-06-07', 3], ['2026-06-14', 6], ['2026-06-21', 6], ['2026-06-28', 3], ['2026-07-05', 3], ['2026-07-12', 7], ['2026-07-19', 12], ['2026-07-26', 7], ['2026-08-02', 17], ['2026-08-09', 10], ['2026-08-16', 17], ['2026-08-23', 9], ['2026-08-30', 17], ['2026-09-06', 17]];
for (const [x, v] of SHIPPED_LEADS) { const got = LEAD_WEEKS.find(([y]) => y === x)?.[1]; if (got !== v) throw new Error(`enquiries week of ${x} = ${got}, shipped ${v}`); }
for (let i = 1; i < LEAD_WEEKS.length; i++) if (LEAD_WEEKS[i][0] !== addDays(LEAD_WEEKS[i - 1][0], 7)) throw new Error(`enquiry weeks have a gap at ${LEAD_WEEKS[i][0]}`);
if (LEAD_WEEKS[0][0] !== '2026-06-07' || LEAD_WEEKS.at(-1)[0] !== LAST_LEAD_WEEK) throw new Error(`enquiry weeks run ${LEAD_WEEKS[0][0]} → ${LEAD_WEEKS.at(-1)[0]}`);
const CUT = '2026-08-01';
const mean = (rows) => rows.reduce((t, [, v]) => t + v, 0) / rows.length;
const leadBase = mean(LEAD_WEEKS.filter(([x]) => x < CUT));
const leadMultiple = mean(LEAD_WEEKS.filter(([x]) => x >= CUT)) / leadBase;
if (r1(leadMultiple) !== 2.7) throw new Error(`lead multiple ${leadMultiple} != 2.7`);
const leadGrowth = {
  _type: 'object',
  title: 'Case enquiries per week, indexed',
  multiple: `${leadMultiple.toFixed(1)}×`,
  multipleLabel: 'as many case enquiries a week from August to late September as the weeks before August',
  baselineLabel: 'every tracked week before August',
  caption: 'Weekly enquiries from the case-review form, indexed so the climb is public and the firm’s caseload is not. Tracking began the week the new site went live; complete weeks only.',
  source: 'PostHog · 7 Jun – 26 Sep 2026',
  points: LEAD_WEEKS.map(([week, v]) => ({ _key: `lg-${week}`, _type: 'object', week, value: Math.round((v / leadBase) * 100) })),
};

/* ── Copy ───────────────────────────────────────────────────────────── */
const CE = join(here, '../../../content-engine/.claude/drafts/loudface/delshad-legal-content-engine');
const mainBody = readFileSync(join(here, 'delshad-mainBody-2026-09-28.html'), 'utf8').trim();
const faq = JSON.parse(readFileSync(`${CE}.faq.2026-09-28.json`, 'utf8')).faq;
const paragraphSummary = readFileSync(`${CE}.lede.2026-09-28.txt`, 'utf8').trim();

const patch = {
  'instruments.gscSource': 'Google Search Console · indexed to Mar 2026 = 100 · to 25 Sep 2026',
  'instruments.aiSource': 'Peec AI · daily to 27 Sep 2026, 30-day window to 27 Sep 2026',
  'instruments.indexedTrend.points': points,
  'instruments.indexedTrend.caption': 'Impressions per day rose 3.4× from May 2026, before the work, to August, and 6.8× the March average over 1–25 September. Daily to 25 Sep 2026, indexed to the average March day = 100.',
  'instruments.topicClimb.points': null, // filled after the doc is read: shipped days before the pulled window + the pulled days
  'instruments.topicClimb.caption': '0.13% in the week of 8 June to 33.78% in the week of 21 September; first of the twelve tracked employment-law firms every week since 10 August. The prompt set was rebuilt in late July and early August.',
  'instruments.engineBeforeAfter.afterLabel': 'Sep 2026 (1–27)',
  'instruments.engineBeforeAfter.rows': [
    { _key: 'r-0', engine: 'chatgpt', before: 0.0014, after: 0.0296 },
    { _key: 'r-1', engine: 'gemini', before: 0.001, after: 0.0271 },
    { _key: 'r-2', engine: 'googleAio', before: 0, after: 0.0463 },
  ],
  'instruments.engineBeforeAfter.caption': 'Visibility, the share of all tracked answers naming the firm, by engine: from near-zero in June to cited on all three. Share of voice among the 12 tracked firms is the headline figure.',
  'instruments.publishedResult.rows': [
    { _key: 'r-0', value: '0.13% → 32.4%', unit: 'AI share of voice, week of 8 Jun → 30 days to 27 Sep' },
    { _key: 'r-1', value: '1st of 12', unit: 'tracked firms, every week since 10 Aug' },
    { _key: 'r-2', value: '7.6×', unit: 'Google clicks per week outside the celebrity pages, week of 7 Jun → week of 13 Sep' },
  ],
  'instruments.publishedResult.caption': 'Average rank 1.4 when cited, 30 days to 27 Sep. Sources: Peec AI, Google Search Console.',
  'instruments.leadGrowth': leadGrowth,
  'charts[0].data': [
    { _key: 'bc-articles', _type: 'object', label: 'Articles we shipped', value: si, displayValue: `${Math.round(split.impShare)}%` },
    { _key: 'bc-case', _type: 'object', label: 'Celebrity-case pages', value: ci, displayValue: `${100 - Math.round(split.impShare)}%` },
  ],
  'charts[0].legendPrimary': 'First 25 days of September 2026. Source: Google Search Console.',
  'charts[0].title': 'Share of September impressions: our articles vs the celebrity-case pages',
  'charts[1].data': growthCurve,
  'charts[1].legendPrimary': 'Monthly Google clicks, February to August 2026; bars scaled to August = 100, labels show the change from February. Source: Google Search Console.',
  result1Number: '32.4%',
  result1Title: 'AI share of voice, 30 days to 27 Sep 2026, up from 0.13% in the week of 8 Jun; 1st of 12 tracked firms',
  result2Number: '7.6×',
  result2Title: 'Google clicks per week outside the celebrity-case pages, week of 7 Jun → week of 13 Sep 2026',
  result3Number: '2.7×',
  result3Title: 'Case enquiries per week, weeks before August → August to late September 2026 (PostHog)',
  paragraphSummary,
  faq,
  mainBody,
};

/* ── Plan / guards / write ──────────────────────────────────────────── */
console.log(`Google: ${points.length} daily points ${points[0].date} → ${points.at(-1).date}; multipliers`, Object.fromEntries(Object.entries(stats).map(([k, v]) => [k, +v.toFixed(2)])));
console.log('Clicks/week outside celebrity pages: 7 Jun', w('2026-06-07'), '23 Aug', w('2026-08-23'), '30 Aug', w('2026-08-30'), '6 Sep', w('2026-09-06'), '13 Sep', w(LAST_GSC_WEEK), '→', Object.fromEntries(Object.entries(clicksWeek).map(([k, v]) => [k, +v.toFixed(2)])));
console.log('Articles vs celebrity, 1–25 Sep:', Object.fromEntries(Object.entries(split).map(([k, v]) => [k, +v.toFixed(2)])));
console.log('Growth curve:', growthCurve.map((g) => `${g.label} ${g.value} ${g.displayValue}`).join(' | '));
console.log(`Peec daily: ${days.length} points ${days[0].date} → ${days.at(-1).date}; last`, days.at(-1).sov);
console.log(`Enquiries: baseline ${leadBase.toFixed(3)}/wk, multiple ${leadMultiple.toFixed(2)}; indexed ${leadGrowth.points.map((p) => p.value).join(' ')}`);

const doc = await client.getDocument(DOC_ID);
if (!doc) throw new Error('published doc not found');
if (await client.getDocument(`drafts.${DOC_ID}`)) { console.error('A draft exists for this document; refusing to patch under a pending human edit.'); process.exit(1); }
console.log(`Current _rev ${doc._rev}, updated ${doc._updatedAt}`);
let drift = 0;
const old = new Map(doc.instruments.indexedTrend.points.map((p) => [p.date, p]));
for (const p of points) { const o = old.get(p.date); if (o && (Math.abs(o.impressions - p.impressions) > 1 || Math.abs(o.clicks - p.clicks) > 1)) { drift++; console.log('  gsc drift', p.date, o, p); } }
const oldSov = new Map(doc.instruments.topicClimb.points.map((p) => [p.week, p.value]));
let sdrift = 0;
for (const x of days) { if (oldSov.has(x.date) && Math.abs(oldSov.get(x.date) - x.sov) > 0.0006) { sdrift++; console.log('  sov drift', x.date, oldSov.get(x.date), x.sov); } }
const oldLead = new Map(doc.instruments.leadGrowth.points.map((p) => [p.week, p.value]));
let ldrift = 0;
for (const p of leadGrowth.points) { if (oldLead.has(p.week) && oldLead.get(p.week) !== p.value) { ldrift++; console.log('  lead drift', p.week, oldLead.get(p.week), p.value); } }
const oldGc = new Map(doc.charts[1].data.map((g) => [g.label, `${g.value}|${g.displayValue}`]));
let gdrift = 0;
for (const g of growthCurve) { if (oldGc.get(g.label) !== `${g.value}|${g.displayValue}`) { gdrift++; console.log('  growth-curve drift', g.label, oldGc.get(g.label), g.value, g.displayValue); } }
console.log(`Drift: Google ${drift}, Peec ${sdrift}, enquiries ${ldrift}, growth curve ${gdrift} (overlap: ${points.filter((p) => old.has(p.date)).length} Google days, ${days.filter((x) => oldSov.has(x.date)).length} Peec days, ${leadGrowth.points.filter((p) => oldLead.has(p.week)).length} enquiry weeks)`);
if (drift > 0 || sdrift > 0 || ldrift > 0 || gdrift > 0) { console.error('Shipped points do not reproduce; investigate before writing.'); process.exit(1); }
const merged = [...doc.instruments.topicClimb.points.filter((p) => p.week < days[0].date).map((p) => ({ date: p.week, sov: p.value })), ...days];
for (let i = 1; i < merged.length; i++) if (merged[i].date !== addDays(merged[i - 1].date, 1)) throw new Error(`Peec daily series has a gap at ${merged[i].date}`);
if (merged[0].date !== '2026-06-10' || merged.at(-1).date !== PEEC_END || merged.length !== 110) throw new Error(`Peec daily series must run 10 Jun → 27 Sep (110 days), got ${merged[0].date} → ${merged.at(-1).date} (${merged.length})`);
patch['instruments.topicClimb.points'] = merged.map((x, i) => ({ _key: `d-${i}`, week: x.date, value: x.sov }));
console.log(`Peec daily merged: ${merged.length} points ${merged[0].date} → ${merged.at(-1).date}`);

if (!WRITE) { console.log('\nDry run. Fields to set:', Object.keys(patch).join(', ')); process.exit(0); }
mkdirSync(join(here, '../backups'), { recursive: true });
writeFileSync(join(here, '../backups/delshad-casestudy-pre-2026-09-28.json'), JSON.stringify(doc, null, 2));
const res = await client.patch(DOC_ID).ifRevisionId(doc._rev).set(patch).commit();
console.log(`✓ patched ${res._id} → _rev ${res._rev}`);
