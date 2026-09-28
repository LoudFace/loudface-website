/**
 * Refresh the Genie Teacher case study with every source to late September 2026:
 * Google Search Console to 25 Sep (the latest final day), Peec AI weekly to the
 * week of 21 Sep (plus the 30 days to 27 Sep for the per-engine and per-topic
 * copy), PostHog leads to the complete week of 20 Sep, and Google Analytics
 * bookings to 26 Sep.
 *
 * Same method as refresh-genie-2026-09-18.mjs, end dates moved forward. One
 * method change, forced by the data: bookings are counted from the Google
 * Analytics Data API directly (create_booking by date), not from the
 * ga4_create_booking mirror in PostHog. The mirror writes a second row when
 * Google re-attributes a booking's channel (e.g. Unassigned → Referral), so it
 * over-counts (23 Aug week: mirror 7, GA4 4). The shipped "4×" still reproduces
 * on the GA4 series (8 / 1.857 = 4.3×).
 *
 * Inputs (raw pulls saved beside the research brief at
 * content-engine/.claude/research/loudface/genie-teacher-organic-growth/):
 *   --gsc <daily gsc-cli --dimensions date --json output>
 *   --peec-weeks <folder of weekly brand-report JSONs named YYYY-MM-DD.json>
 *   --leads <posthog-cli query --json output: wk, leads, people, sessions>
 *   --bookings <GA4 create_booking daily JSON: { rows: [[YYYYMMDD, n], ...] }>
 *
 * Raw counts never leave this script: every published Google value is indexed
 * to the average May 2026 day (= 100), every lead value to the pre-September
 * weekly mean (= 100). The 18 Sep figures are recomputed from the new pulls
 * with the 18 Sep end dates and must reproduce, and the shipped chart points
 * must reproduce, or nothing is written.
 *
 *   node scripts/instruments/refresh-genie-2026-09-28.mjs --gsc <f> --peec-weeks <dir> --leads <f> --bookings <f>          # dry run
 *   node scripts/instruments/refresh-genie-2026-09-28.mjs ... --write  # patch the PUBLISHED doc
 *
 * Backup of the pre-refresh document: scripts/backups/genie-casestudy-pre-2026-09-28.json
 */
import { createClient } from '@sanity/client';
import { readFileSync, readdirSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const arg = (k) => (args.indexOf(k) >= 0 ? args[args.indexOf(k) + 1] : null);
const gscPath = arg('--gsc');
const peecDir = arg('--peec-weeks');
const leadsPath = arg('--leads');
const bookingsPath = arg('--bookings');
if (!gscPath || !peecDir || !leadsPath || !bookingsPath) {
  console.error('--gsc, --peec-weeks, --leads and --bookings are required');
  process.exit(1);
}

let token = process.env.SANITY_API_TOKEN;
if (!token && existsSync(join(here, '../../.env.local'))) {
  const env = Object.fromEntries(
    readFileSync(join(here, '../../.env.local'), 'utf8')
      .split('\n')
      .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
      .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
  );
  token = env.SANITY_API_TOKEN;
}
if (!token) {
  console.error('SANITY_API_TOKEN missing (run through scripts/with-secrets.sh)');
  process.exit(1);
}

const client = createClient({ projectId: 'xjjjqhgt', dataset: 'production', apiVersion: '2025-03-29', token, useCdn: false });

const DOC_ID = 'caseStudy-genie-teacher-organic-growth';
const START = '2026-04-13';
const END = '2026-09-25';
const PREV_END = '2026-09-15';
const BASELINE_MONTH = '2026-05';
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const r1 = (n) => Math.round(n * 10) / 10;
const roundLike = (v, e) => (Number.isInteger(e) ? Math.round(v) : r1(v));
const check = (label, stats, expect) => {
  for (const [k, e] of Object.entries(expect)) {
    const got = roundLike(stats[k], e);
    if (got !== e) throw new Error(`${label}: copy says ${k} = ${e}, data says ${got} (${stats[k].toFixed(3)})`);
  }
};

/* ── Google: index the daily series ─────────────────────────────────── */
const raw = JSON.parse(readFileSync(gscPath, 'utf8')).rows
  .map((r) => ({ date: r.keys[0], impressions: r.impressions, clicks: r.clicks, position: r.position }))
  .sort((a, b) => a.date.localeCompare(b.date));
if (raw.at(-1).date !== END) throw new Error(`latest GSC day is ${raw.at(-1).date}, script expects ${END}`);
const byDate = new Map(raw.map((r) => [r.date, r]));
const may = raw.filter((r) => r.date.startsWith(BASELINE_MONTH));
if (may.length !== 31) throw new Error(`May 2026 has ${may.length} days, expected 31`);
const baseImp = may.reduce((s, r) => s + r.impressions, 0) / 31;
const baseClk = may.reduce((s, r) => s + r.clicks, 0) / 31;
const addDays = (iso, n) => { const d = new Date(`${iso}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

const points = [];
for (let d = START, i = 0; d <= END; d = addDays(d, 1), i++) {
  const r = byDate.get(d);
  if (!r) throw new Error(`no GSC row for ${d}; the series must be consecutive`);
  points.push({ _key: `d-${i}`, date: d, month: MONTHS[Number(d.slice(5, 7)) - 1], impressions: Math.round((r.impressions / baseImp) * 100), clicks: Math.round((r.clicks / baseClk) * 100) });
}

const sum = (rows, k) => rows.reduce((s, r) => s + r[k], 0);
const month = (m) => raw.filter((r) => r.date.startsWith(m));
const perDay = (m) => sum(month(m), 'impressions') / month(m).length;
const wpos = (rows) => rows.reduce((s, r) => s + r.position * r.impressions, 0) / sum(rows, 'impressions');
const googleStats = (end) => {
  const sep = raw.filter((r) => r.date >= '2026-09-01' && r.date <= end);
  const last7 = raw.filter((r) => r.date > addDays(end, -7) && r.date <= end);
  return {
    sepDays: sep.length,
    impPerDayMayToAug: perDay('2026-08') / perDay('2026-05'),
    impPerDayMayToSep: sum(sep, 'impressions') / sep.length / perDay('2026-05'),
    impLastDayVsMay: byDate.get(end).impressions / perDay('2026-05'),
    impMayVsApr: sum(month('2026-05'), 'impressions') / sum(month('2026-04'), 'impressions'),
    impJunVsApr: sum(month('2026-06'), 'impressions') / sum(month('2026-04'), 'impressions'),
    impJulVsApr: sum(month('2026-07'), 'impressions') / sum(month('2026-04'), 'impressions'),
    impAugVsApr: sum(month('2026-08'), 'impressions') / sum(month('2026-04'), 'impressions'),
    impSepVsApr: sum(sep, 'impressions') / sum(month('2026-04'), 'impressions'),
    impJulYoY: sum(month('2026-07'), 'impressions') / sum(month('2025-07'), 'impressions'),
    impAugYoY: sum(month('2026-08'), 'impressions') / sum(month('2025-08'), 'impressions'),
    impSepVsWholeSep25: sum(sep, 'impressions') / sum(month('2025-09'), 'impressions'),
    sepImpVsAug: sum(sep, 'impressions') / sum(month('2026-08'), 'impressions'),
    sepClkVsAug: sum(sep, 'clicks') / sum(month('2026-08'), 'clicks'),
    clicksWeekVsMayAvg: sum(last7, 'clicks') / (sum(month('2026-05'), 'clicks') / 31 * 7),
    posAug: wpos(month('2026-08')),
    posSep: wpos(sep),
    sepRows: sep,
  };
};
/* The 18 Sep copy, recomputed from today's pull with the 18 Sep end date: must reproduce. */
const prev = googleStats(PREV_END);
check('18 Sep figures', prev, {
  impPerDayMayToAug: 28, impPerDayMayToSep: 150, impLastDayVsMay: 224, impMayVsApr: 2.2, impJunVsApr: 5.1, impJulVsApr: 12.9,
  impAugVsApr: 62, impSepVsApr: 160, impJulYoY: 5, impAugYoY: 24, impSepVsWholeSep25: 46, sepImpVsAug: 2.6, sepClkVsAug: 2.9,
  clicksWeekVsMayAvg: 28, posAug: 11.5, posSep: 7.2,
});
/* This refresh's copy; the script refuses to write if the data moved. */
const stats = googleStats(END);
if (stats.sepDays !== 25) throw new Error(`September has ${stats.sepDays} days to ${END}, copy says 25`);
check('28 Sep figures', stats, {
  impPerDayMayToAug: 28, impPerDayMayToSep: 164, impLastDayVsMay: 206, impMayVsApr: 2.2, impJunVsApr: 5.1, impJulVsApr: 12.9,
  impAugVsApr: 62, impSepVsApr: 291, impJulYoY: 5, impAugYoY: 24, impSepVsWholeSep25: 84, sepImpVsAug: 4.7, sepClkVsAug: 5.5,
  clicksWeekVsMayAvg: 27, posAug: 11.5, posSep: 7.0,
});

/* Growth-curve chart: monthly impressions, May..Sep, indexed to the largest = 100.
   September is a part-month (1–25 Sep): its label says so, and so does the legend. */
const monthly = ['2026-05', '2026-06', '2026-07', '2026-08'].map((m) => sum(month(m), 'impressions')).concat([sum(stats.sepRows, 'impressions')]);
const maxM = Math.max(...monthly);
const pct = (v) => `+${Math.round((v / monthly[0] - 1) * 100).toLocaleString('en-US')}%`;
const growthCurve = [
  { _key: 'gc-may', _type: 'object', label: 'May', value: Math.round((monthly[0] / maxM) * 100), displayValue: 'baseline' },
  { _key: 'gc-jun', _type: 'object', label: 'Jun', value: Math.round((monthly[1] / maxM) * 100), displayValue: pct(monthly[1]) },
  { _key: 'gc-jul', _type: 'object', label: 'Jul', value: Math.round((monthly[2] / maxM) * 100), displayValue: pct(monthly[2]) },
  { _key: 'gc-aug', _type: 'object', label: 'Aug', value: Math.round((monthly[3] / maxM) * 100), displayValue: pct(monthly[3]) },
  { _key: 'gc-sep', _type: 'object', label: '1–25 Sep', value: Math.round((monthly[4] / maxM) * 100), displayValue: `${pct(monthly[4])} in 25 days` },
];

/* ── Google: pages and branded query (copy checks) ─────────────────── */
const researchDir = dirname(gscPath);
const pages = JSON.parse(readFileSync(join(researchDir, 'gsc-pages.2026-06-28_2026-09-25.json'), 'utf8')).rows;
const pg = (slug) => pages.find((r) => r.keys[0] === `https://genieteacher.com/blogs/${slug}`);
const blogs = pages.filter((r) => r.keys[0].includes('/blogs/'));
const byImp = [...blogs].sort((a, b) => b.impressions - a.impressions).map((r) => r.keys[0].split('/blogs/')[1]);
const byClk = [...blogs].sort((a, b) => b.clicks - a.clicks).map((r) => r.keys[0].split('/blogs/')[1]);
const pageExpect = [['ontario-report-card-levels-explained', 5.9], ['osslt-explained', 7.0], ['periodic-table-quiz', 8.3], ['how-to-check-teacher-certification-canada', 6.9], ['sch4u-grade-12-chemistry', 6.1]];
pageExpect.forEach(([slug, pos], i) => {
  if (byImp[i] !== slug) throw new Error(`hub page #${i + 1} by impressions is ${byImp[i]}, copy says ${slug}`);
  if (r1(pg(slug).position) !== pos) throw new Error(`${slug} position ${pg(slug).position}, copy says ${pos}`);
});
if (byClk[0] !== 'periodic-table-quiz' || byClk[1] !== 'eqao-grade-6-practice-test') throw new Error(`top blog pages by clicks: ${byClk.slice(0, 2)}`);
const brand = JSON.parse(readFileSync(join(researchDir, 'gsc-queries.2026-08-29_2026-09-25.json'), 'utf8')).rows.find((r) => r.keys[0] === 'genie teacher');
if (Math.round(brand.ctr * 100) !== 77 || r1(brand.position) !== 1.0) throw new Error(`"genie teacher" CTR ${brand.ctr} pos ${brand.position}`);

/* ── Peec: weekly share of voice for the topicClimb bars ───────────── */
const LAST_WEEK = '2026-09-21';
const weekly = readdirSync(peecDir).filter((f) => f.endsWith('.json')).sort().map((f) => {
  const d = JSON.parse(readFileSync(join(peecDir, f), 'utf8'));
  const g = (d.projectWide?.data || []).find((b) => b.brand.name === 'Genie Teacher');
  return { week: f.replace('.json', ''), sov: g?.share_of_voice ?? null, vis: g?.visibility ?? null, pos: g?.position ?? null, n: g?.visibility_total ?? null };
}).filter((w) => w.sov != null && w.week <= LAST_WEEK);
if (weekly.at(-1).week !== LAST_WEEK) throw new Error(`last Peec week ${weekly.at(-1).week}`);
const topicPoints = weekly.map((w, i) => ({ _key: `pt-${i}`, week: w.week, value: Math.round(w.sov * 10000) / 10000 }));
const wk = (w) => weekly.find((x) => x.week === w);
const peecExpect = [['2026-05-25', 0.0226, 0.0526], ['2026-07-20', 0.386, 0.2839], ['2026-08-24', 0.1294, 0.0917], ['2026-09-07', 0.1361, 0.0988], ['2026-09-21', 0.1304, 0.0975]];
for (const [w, sov, vis] of peecExpect) {
  const x = wk(w);
  if (!x || Math.round(x.sov * 10000) / 10000 !== sov || Math.round(x.vis * 10000) / 10000 !== vis) throw new Error(`Peec week ${w} does not match the copy: ${JSON.stringify(x)}`);
}
const posRange = weekly.filter((w) => w.week >= '2026-07-20').map((w) => w.pos);
if (Math.min(...posRange) < 1.0 || Math.max(...posRange) > 1.6) throw new Error(`mention position since July outside 1.0–1.6: ${posRange}`);
const visSinceAug = weekly.filter((w) => w.week >= '2026-08-03').map((w) => w.vis);
if (Math.min(...visSinceAug) < 0.08 || Math.max(...visSinceAug) > 0.11) throw new Error(`visibility since August outside 8–11%: ${visSinceAug}`);

/* Peec 30-day window to 27 Sep: rank, position, per engine, per topic */
const win = JSON.parse(readFileSync(join(researchDir, 'peec-brand-report.2026-08-29_2026-09-27.json'), 'utf8'));
const pw = win.projectWide.data;
const gw = pw.find((b) => b.brand.name === 'Genie Teacher');
const rankBy = (k) => [...pw].sort((a, b) => b[k] - a[k]).findIndex((b) => b.brand.name === 'Genie Teacher') + 1;
const ch = (id) => win.perChannel.data.find((b) => b.brand.name === 'Genie Teacher' && b.model_channel.id === id);
const topicId = (name) => win.topics.data.find((t) => t.name === name).id;
const tp = (name) => win.perTopic.data.find((b) => b.brand.name === 'Genie Teacher' && b.topic.id === topicId(name));
const winStats = {
  sovRank: rankBy('share_of_voice'), visRank: rankBy('visibility'), brands: pw.length, pos: gw.position, sov: gw.share_of_voice * 100,
  gemini: ch('google-2').visibility * 100, chatgpt: ch('openai-0').visibility * 100, aio: ch('google-0').visibility * 100,
  compVis: tp('Competitor Comparisons').visibility * 100, compPos: tp('Competitor Comparisons').position, certVis: tp('Certified Teacher Tutoring').visibility * 100,
};
check('Peec 30-day window', winStats, { sovRank: 3, visRank: 5, brands: 7, pos: 1.5, sov: 13.8, gemini: 12.3, chatgpt: 9.0, aio: 9.0, compVis: 59, compPos: 1.1, certVis: 16.4 });
const chPos = ['google-2', 'openai-0', 'google-0'].map((id) => r1(ch(id).position));
if (Math.min(...chPos) !== 1.4 || Math.max(...chPos) !== 1.5) throw new Error(`per-engine mention rank ${chPos}, copy says 1.4–1.5`);

/* ── PostHog: lead requests (weekly, Sunday start, complete weeks) ── */
const LAST_LEAD_WEEK = '2026-09-20'; // 20–26 Sep, the last complete week on 28 Sep
const leadRows = JSON.parse(readFileSync(leadsPath, 'utf8')).rows.map(([w, leads, people]) => [String(w).slice(0, 10), leads, people]).filter(([w]) => w <= LAST_LEAD_WEEK);
const LEAD_WEEKS = leadRows.map(([w, n]) => [w, n]);
const SHIPPED_LEADS = [['2026-07-19', 5], ['2026-07-26', 13], ['2026-08-02', 2], ['2026-08-09', 13], ['2026-08-16', 17], ['2026-08-23', 13], ['2026-08-30', 21], ['2026-09-06', 93]];
for (const [w, n] of SHIPPED_LEADS) {
  const got = LEAD_WEEKS.find(([x]) => x === w);
  if (!got || got[1] !== n) throw new Error(`lead week ${w}: shipped ${n}, live ${got?.[1]}`);
}
if (LEAD_WEEKS.length !== 10 || LEAD_WEEKS.at(-1)[0] !== LAST_LEAD_WEEK) throw new Error(`lead weeks: ${LEAD_WEEKS.map(([w]) => w)}`);
const CUT = '2026-09-01';
const mean = (rows, i = 1) => rows.reduce((t, r) => t + r[i], 0) / rows.length;
const leadBase = mean(LEAD_WEEKS.filter(([w]) => w < CUT));
const sepLeadWeeks = LEAD_WEEKS.filter(([w]) => w >= CUT);
const leadMultiple = mean(sepLeadWeeks) / leadBase;
const leadPerWeek = sepLeadWeeks.map(([, n]) => n / leadBase);
const peopleMultiple = mean(leadRows.filter(([w]) => w >= CUT), 2) / mean(leadRows.filter(([w]) => w < CUT), 2);
if (r1(leadMultiple) !== 5.8) throw new Error(`lead multiple ${leadMultiple} != 5.8`);
if (leadPerWeek.map(r1).join() !== '7.8,5.8,3.8') throw new Error(`lead multiples by week ${leadPerWeek}`);
if (peopleMultiple < 3.5 || peopleMultiple >= 4) throw new Error(`distinct-visitor multiple ${peopleMultiple} is not "nearly four times"`);

/* ── Google Analytics: lesson bookings (create_booking by date, Sunday weeks) ── */
const weekOf = (yyyymmdd) => { const d = new Date(`${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6)}T00:00:00Z`); d.setUTCDate(d.getUTCDate() - d.getUTCDay()); return d.toISOString().slice(0, 10); };
const bookingByWeek = new Map();
for (const [d, n] of JSON.parse(readFileSync(bookingsPath, 'utf8')).rows) bookingByWeek.set(weekOf(d), (bookingByWeek.get(weekOf(d)) || 0) + n);
const bookingWeeks = (from, to) => { const out = []; for (let w = from; w <= to; w = addDays(w, 7)) out.push(bookingByWeek.get(w) || 0); return out; };
const BOOKING_BASE = bookingWeeks('2026-04-12', '2026-08-30'); // 21 weeks, zero weeks included
const BOOKING_SEP = bookingWeeks('2026-09-06', '2026-09-20');
const bookingBase = BOOKING_BASE.reduce((a, b) => a + b, 0) / BOOKING_BASE.length;
if (BOOKING_BASE.length !== 21) throw new Error('booking baseline must be 21 weeks');
if (Math.round(BOOKING_SEP[0] / bookingBase) !== 4) throw new Error(`shipped booking multiple (week of 6 Sep) no longer 4×: ${BOOKING_SEP[0] / bookingBase}`);
const bookingMultiple = BOOKING_SEP.reduce((a, b) => a + b, 0) / BOOKING_SEP.length / bookingBase;
if (r1(bookingMultiple) !== 3.6) throw new Error(`booking multiple ${bookingMultiple} != 3.6`);

const leadGrowth = {
  _type: 'object',
  title: 'Lead requests per week, indexed',
  multiple: `${leadMultiple.toFixed(1)}×`,
  multipleLabel: 'more lead requests a week over the first three full weeks of September, against the seven tracked weeks before them',
  baselineLabel: 'every tracked week before 6 September',
  caption: 'Weekly requests to see a teacher’s availability or contact them, from teacher profiles on genieteacher.com, indexed to the pre-September average. Complete weeks only; the dip in the first week of August is real and left in.',
  source: 'PostHog · 19 Jul – 26 Sep 2026',
  points: LEAD_WEEKS.map(([week, v]) => ({ _key: `lg-${week}`, _type: 'object', week, value: Math.round((v / leadBase) * 100) })),
};

/* ── Copy ───────────────────────────────────────────────────────────── */
const mainBody = readFileSync(join(here, 'genie-mainBody-2026-09-28.html'), 'utf8').trim();
const drafts = join(here, '../../../content-engine/.claude/drafts/loudface');
const faq = JSON.parse(readFileSync(join(drafts, 'genie-teacher-organic-growth.2026-09-28.faq.json'), 'utf8')).faq;
const paragraphSummary = readFileSync(join(drafts, 'genie-teacher-organic-growth.2026-09-28.lede.txt'), 'utf8').trim();

const patch = {
  name: 'Genie Teacher: 164× Search Visibility',
  'instruments.gscSource': 'Google Search Console · indexed to May 2026 = 100 · to 25 Sep 2026',
  'instruments.aiSource': 'Peec AI · weekly to 27 Sep 2026, 30-day window to 27 Sep 2026',
  'instruments.indexedTrend.points': points,
  'instruments.indexedTrend.caption': 'Impressions per day rose 28× from May to August and 164× over the first twenty-five days of September (to 25 Sep, the latest day Search Console reports). Search Console reports nothing before 13 April 2026, so the series starts there.',
  'instruments.topicClimb.points': topicPoints,
  'instruments.topicClimb.caption': '2.26% to 13.0%, 25 May to 27 Sep. Tracking paused 1 Jun – 13 Jul; the line bridges that gap. The prompt set grew from 29 to 90 over the period, so the later readings are the harder ones.',
  'instruments.publishedResult.rows': [
    { _key: 'r-0', value: '5.26% → 9.75%', unit: 'AI visibility, week of 25 May → week of 21 Sep' },
    { _key: 'r-1', value: '2.26% → 13.0%', unit: 'share of voice, same weeks' },
    { _key: 'r-2', value: '1.0–1.6', unit: 'average mention rank since July' },
  ],
  'instruments.publishedResult.caption': 'Source: Peec AI, weekly readings.',
  'instruments.leadGrowth': leadGrowth,
  'charts[0].data': growthCurve,
  'charts[0].legendPrimary': 'May to September 2026, indexed to May; the September bucket is 1–25 September only, 25 of its 30 days. Source: Google Search Console.',
  result1Number: '164×',
  result1Title: 'Google impressions per day, May 2026 average → 1–25 Sep 2026',
  result2Number: '27×',
  result2Title: 'Google clicks per week, May 2026 average → week ending 25 Sep 2026',
  result3Number: '5.8×',
  result3Title: 'Lead requests per week, seven tracked weeks to 5 Sep → first three full weeks of Sep 2026 (PostHog)',
  paragraphSummary,
  faq,
  mainBody,
};

/* Stale-string sweep: nothing the patch writes may still carry an 18 Sep end date or headline. */
const stale = [/150×/, /15 Sep(?!tember 2025)/, /15 September/, /17 Sep/, /13 Sep/, /12 Sep/, /fifteen/, /9\.88%/, /13\.6%/, /13\.61%/, /first full week/];
const patchText = JSON.stringify(patch);
for (const re of stale) if (re.test(patchText)) throw new Error(`patch still contains stale text ${re}: …${patchText.slice(Math.max(0, patchText.search(re) - 80), patchText.search(re) + 40)}…`);

/* ── Plan / write ───────────────────────────────────────────────────── */
console.log(`Baseline: average May 2026 day = 100 (not shipped). Points: ${points.length} daily, ${points[0].date} → ${points.at(-1).date}`);
console.log('Google multipliers (18 Sep end → 28 Sep end):');
for (const k of Object.keys(stats)) if (typeof stats[k] === 'number') console.log(`  ${k}: ${prev[k].toFixed(2)} → ${stats[k].toFixed(2)}`);
console.log('Growth curve:', growthCurve.map((g) => `${g.label} ${g.value} ${g.displayValue}`).join(' | '));
console.log('Peec weeks:\n ', weekly.map((w) => `${w.week} sov ${(w.sov * 100).toFixed(2)} vis ${(w.vis * 100).toFixed(2)} pos ${w.pos.toFixed(2)} n ${w.n}`).join('\n  '));
console.log('Peec 30 days to 27 Sep:', Object.entries(winStats).map(([k, v]) => `${k} ${typeof v === 'number' ? r1(v) : v}`).join(', '), `; per-engine rank ${chPos}`);
console.log(`Leads: baseline ${leadBase.toFixed(2)}/wk, Sep weeks ${sepLeadWeeks.map(([, n]) => n)} → multiple ${leadMultiple.toFixed(2)} (by week ${leadPerWeek.map((v) => v.toFixed(2))}); people ${peopleMultiple.toFixed(2)}×; indexed ${leadGrowth.points.map((p) => p.value).join(' ')}`);
console.log(`Bookings (GA4): baseline ${bookingBase.toFixed(3)}/wk over 21 weeks, Sep weeks ${BOOKING_SEP} → ${bookingMultiple.toFixed(2)}× (week of 6 Sep alone ${(BOOKING_SEP[0] / bookingBase).toFixed(2)}×)`);

const doc = await client.getDocument(DOC_ID);
if (!doc) throw new Error('published doc not found');
if (await client.getDocument(`drafts.${DOC_ID}`)) { console.error('A draft exists for this document; refusing to patch under a pending human edit.'); process.exit(1); }
console.log(`Current _rev ${doc._rev}, updated ${doc._updatedAt}; last shipped point ${doc.instruments.indexedTrend.points.at(-1).date}`);

const old = new Map(doc.instruments.indexedTrend.points.map((p) => [p.date, p]));
let drift = 0;
for (const p of points) { const o = old.get(p.date); if (o && (Math.abs(o.impressions - p.impressions) > 1 || Math.abs(o.clicks - p.clicks) > 1)) drift++; }
console.log(`Drift against shipped Google points: ${drift} (tolerance ±1)`);
if (drift > 0) { console.error('Shipped points do not reproduce; investigate before writing.'); process.exit(1); }
const oldTopic = new Map(doc.instruments.topicClimb.points.map((p) => [p.week, p.value]));
let tdrift = 0;
for (const p of topicPoints) {
  if (!oldTopic.has(p.week)) continue;
  const delta = Math.abs(oldTopic.get(p.week) - p.value);
  if (delta > 0.0006) { tdrift++; console.log(`  Peec week ${p.week}: shipped ${oldTopic.get(p.week)}, live ${p.value} (delta ${delta.toFixed(4)})`); }
  if (delta > 0.002) { console.error('Shipped Peec points do not reproduce beyond rounding; investigate before writing.'); process.exit(1); }
}
console.log(`Drift against shipped Peec points: ${tdrift}`);
const oldLead = new Map((doc.instruments.leadGrowth?.points ?? []).map((p) => [p.week, p.value]));
let ldrift = 0;
for (const p of leadGrowth.points) if (oldLead.has(p.week) && oldLead.get(p.week) !== p.value) { ldrift++; console.log(`  lead week ${p.week}: shipped ${oldLead.get(p.week)}, now ${p.value}`); }
console.log(`Drift against shipped lead points: ${ldrift} (baseline unchanged at ${leadBase.toFixed(2)}, so every shipped point must reproduce)`);
if (ldrift > 0) { console.error('Shipped lead points do not reproduce; investigate before writing.'); process.exit(1); }

if (!WRITE) { console.log('\nDry run. Fields to set:', Object.keys(patch).join(', ')); process.exit(0); }

mkdirSync(join(here, '../backups'), { recursive: true });
writeFileSync(join(here, '../backups/genie-casestudy-pre-2026-09-28.json'), JSON.stringify(doc, null, 2));
const res = await client.patch(DOC_ID).ifRevisionId(doc._rev).set(patch).commit();
console.log(`✓ patched ${res._id} → _rev ${res._rev}`);
