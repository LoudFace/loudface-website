/**
 * Refresh the TradeMomentum case study with every source to late September 2026:
 * Google Search Console daily to 25 Sep (the latest day it reports), Peec AI to
 * the complete week of 21–27 Sep, per-month to 1–27 Sep, and the 30 days to 27 Sep.
 *
 * Inputs, all saved beside the research brief at
 * content-engine/.claude/research/loudface/trademomentum-niche-aeo-organic-growth/:
 *   gsc-daily.2025-06-01_2026-09-25.json                 daily, dimension date
 *   gsc-pages.2026-06-28_2026-09-25.json                 90 days by page
 *   gsc-queries-country.2026-06-28_2026-09-25.json       90 days by query + country
 *   gsc-country.2026-06-28_2026-09-25.json               90 days by country
 *   peec-weekly/<Mon>.json, peec-weekly-nonbranded/<Mon>.json      brand-report per week
 *   peec-windows/{blended,nonbranded}.<start>_<end>.json            months + 30 days
 *   peec-prompt-weekly/<promptId>.<Mon>.json             "Trading communities" prompts, weekly
 *   peec-prompt-windows/<promptId>.<start>_<end>.json    per-prompt, Jun / Aug / Sep / 30 days
 *   peec-prompts.2026-09-28.json                         prompt text, tags, created dates
 * Copy: trademomentum-mainBody-2026-09-28.html beside this script; FAQ and lede below.
 *
 * Raw counts never leave this script: Google values are indexed to the average
 * December 2025 day (= 100) or stated as multiples and shares; Peec values are
 * 0–1 ratios. Every number the copy states is recomputed here and the script
 * refuses to write if one moved. Already-shipped points must reproduce (guarded,
 * with the two known exceptions named in the brief, F1 and F4). The patch carries
 * ifRevisionID, so a concurrent edit makes it fail instead of being overwritten.
 *
 *   node scripts/instruments/refresh-trademomentum-2026-09-28.mjs                         # dry run
 *   node scripts/instruments/refresh-trademomentum-2026-09-28.mjs --rev <_rev> --write    # patch the PUBLISHED doc
 *
 * Backup of the pre-refresh document: scripts/backups/trademomentum-casestudy-pre-2026-09-28.json
 */
import { createClient } from '@sanity/client';
import { readFileSync, readdirSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const arg = (k) => (args.indexOf(k) >= 0 ? args[args.indexOf(k) + 1] : null);
const expectRev = arg('--rev');
if (WRITE && !expectRev) { console.error('--write needs --rev <the _rev you last read>'); process.exit(1); }

let token = process.env.SANITY_API_TOKEN;
if (!token && existsSync(join(here, '../../.env.local'))) {
  const env = Object.fromEntries(readFileSync(join(here, '../../.env.local'), 'utf8').split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#')).map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]));
  token = env.SANITY_API_TOKEN;
}
if (!token) { console.error('SANITY_API_TOKEN missing (run through content-engine scripts/with-secrets.sh)'); process.exit(1); }
const client = createClient({ projectId: 'xjjjqhgt', dataset: 'production', apiVersion: '2025-03-29', token, useCdn: false });

const DOC_ID = '760323db-23d1-461e-ae13-f3877d00e24e';
const SLUG = 'trademomentum-niche-aeo-organic-growth';
const SRC = join(here, '../../../content-engine/.claude/research/loudface', SLUG);
const J = (p) => JSON.parse(readFileSync(join(SRC, p), 'utf8'));
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const r1 = (n) => Math.round(n * 10) / 10;
const r4 = (n) => Math.round(n * 10000) / 10000;
const pct1 = (x) => r1(x * 100);
const addDays = (iso, n) => { const d = new Date(`${iso}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const sum = (rows, k) => rows.reduce((s, r) => s + r[k], 0);
const eq = (label, got, want) => { if (got !== want) throw new Error(`copy says ${label} = ${want}, data says ${got}`); };

/* ── Google, daily (F1) ─────────────────────────────────────────────── */
const END = '2026-09-25';
const raw = J('gsc-daily.2025-06-01_2026-09-25.json').rows.map((r) => ({ date: r.keys[0], i: r.impressions, c: r.clicks, p: r.position })).sort((a, b) => a.date.localeCompare(b.date));
for (let k = 1; k < raw.length; k++) if (raw[k].date !== addDays(raw[k - 1].date, 1)) throw new Error(`GSC gap at ${raw[k].date}`);
eq('last GSC day', raw.at(-1).date, END);
const byDate = new Map(raw.map((r) => [r.date, r]));
const range = (a, b) => raw.filter((r) => r.date >= a && r.date <= b);
const month = (m) => raw.filter((r) => r.date.startsWith(m));
const dec = month('2025-12');
eq('December days', dec.length, 31);
const baseImp = sum(dec, 'i') / 31, baseClk = sum(dec, 'c') / 31;
const points = [];
for (let d = '2025-08-01', a = 0, i = 0; d <= END; d = addDays(d, 1)) {
  const r = byDate.get(d);
  const key = d < '2025-09-01' ? `a-${a++}` : `d-${i++}`;
  points.push({ _key: key, date: d, month: MONTHS[Number(d.slice(5, 7)) - 1], impressions: Math.round((r.i / baseImp) * 100), clicks: Math.round((r.c / baseClk) * 100) });
}
const perDay = (rows, k) => sum(rows, k) / rows.length;
const wpos = (rows) => rows.reduce((s, r) => s + r.p * r.i, 0) / sum(rows, 'i');
const upos = (rows) => rows.reduce((s, r) => s + r.p, 0) / rows.length;
const sep25 = range('2026-09-01', END), aug26 = month('2026-08'), jul26 = month('2026-07'), sep25b = month('2025-09'), aug25 = month('2025-08');
const weekClicks = (mon) => sum(range(mon, addDays(mon, 6)), 'c');
const g = {
  augToSep2025Fall: 1 - perDay(sep25b, 'i') / perDay(aug25, 'i'),
  sepLowToAug: perDay(aug26, 'i') / perDay(sep25b, 'i'),
  sepLowToSep26: perDay(sep25, 'i') / perDay(sep25b, 'i'),
  decToJulImp: sum(jul26, 'i') / sum(dec, 'i'),
  decToAugImp: sum(aug26, 'i') / sum(dec, 'i'),
  decToAugClk: sum(aug26, 'c') / sum(dec, 'c'),
  decToSepImpDay: perDay(sep25, 'i') / perDay(dec, 'i'),
  decToSepClkDay: perDay(sep25, 'c') / perDay(dec, 'c'),
  posDec: wpos(dec), posJul: wpos(jul26), posAug: wpos(aug26), posSep: wpos(sep25),
  uposSep25: upos(sep25b), uposAug26: upos(aug26),
  clicksWeekShipped: weekClicks('2026-08-03') / weekClicks('2025-09-01'),
  clicksWeek: weekClicks('2026-09-14') / weekClicks('2025-09-01'),
};
eq('Aug→Sep 2025 fall is more than half', g.augToSep2025Fall > 0.5, true);
eq('Sep 2025 low → Aug 2026', Math.round(g.sepLowToAug), 30);
eq('Sep 2025 low → 1–25 Sep 2026', Math.round(g.sepLowToSep26), 31);
eq('Dec→Jul impressions (thumbnail, unchanged)', r1(g.decToJulImp), 11.7);
eq('Dec→Aug impressions', r1(g.decToAugImp), 12.8);
eq('Dec→Aug clicks', r1(g.decToAugClk), 4.5);
eq('Dec→1–25 Sep impressions/day', r1(g.decToSepImpDay), 13.2);
eq('Dec→1–25 Sep clicks/day', r1(g.decToSepClkDay), 4.9);
eq('positions Dec/Jul/Aug/Sep', [g.posDec, g.posJul, g.posAug, g.posSep].map((x) => Math.round(x)).join('/'), '18/10/11/9');
eq('Jul position', r1(g.posJul), 9.7);
eq('published position Sep 2025 (daily mean)', r1(g.uposSep25), 19.4);
eq('published position Aug 2026 (daily mean)', r1(g.uposAug26), 10.8);
eq('shipped clicks/week multiple (1 Sep 2025 → 3 Aug 2026)', r1(g.clicksWeekShipped), 7.2);
eq('clicks/week multiple (1 Sep 2025 → 14 Sep 2026)', r1(g.clicksWeek), 8.3);
/* "ending at its high": the latest complete Monday week is the highest on record */
const mondays = []; for (let d = '2025-06-02'; addDays(d, 6) <= END; d = addDays(d, 7)) mondays.push(d);
eq('latest complete week', mondays.at(-1), '2026-09-14');
eq('latest complete week is the high', Math.max(...mondays.map(weekClicks)), weekClicks('2026-09-14'));
/* Page one: first month under position 10, five months after the September start */
eq('first month under position 10', ['2025-10','2025-11','2025-12','2026-01','2026-02'].find((m) => wpos(month(m)) < 10), '2026-02');

/* Monthly growth curve, Dec..Aug, bars scaled to Aug = 100, labels vs Dec */
const gcMonths = ['2025-12','2026-01','2026-02','2026-03','2026-04','2026-05','2026-06','2026-07','2026-08'];
const gcVals = gcMonths.map((m) => sum(month(m), 'i'));
const growthCurve = gcMonths.map((m, k) => ({ _key: `gc-${MONTHS[Number(m.slice(5)) - 1].toLowerCase()}`, _type: 'object', label: MONTHS[Number(m.slice(5)) - 1], value: Math.round((gcVals[k] / gcVals.at(-1)) * 100), displayValue: k === 0 ? 'baseline' : `+${Math.round((gcVals[k] / gcVals[0] - 1) * 100)}%` }));
eq('growth labels Jan..Jul (shipped)', growthCurve.slice(1, 8).map((x) => x.displayValue).join(' '), '+180% +239% +477% +379% +520% +1042% +1074%');
eq('growth label Aug', growthCurve.at(-1).displayValue, '+1180%');

/* Pages, 90 days to 25 Sep (F2) */
const pages = J('gsc-pages.2026-06-28_2026-09-25.json').rows;
const P = (path) => pages.find((r) => r.keys[0] === `https://www.trademomentum.org${path}`);
const top6 = [...pages].sort((a, b) => b.clicks - a.clicks).slice(0, 6);
const PAGE_LABELS = { '/': ['bc-home', 'Homepage'], '/blog/best-day-trading-communities': ['bc-communities', 'Best communities blog'], '/pricing': ['bc-pricing', 'Pricing'], '/blog/best-day-trading-chatrooms': ['bc-chatrooms', 'Best chatrooms blog'], '/testimonials': ['bc-testimonials', 'Testimonials'], '/blog/the-5-minute-chart': ['bc-5min', '5-minute chart blog'] };
const top6Clicks = sum(top6, 'clicks');
const pageChart = top6.map((r) => {
  const path = r.keys[0].replace('https://www.trademomentum.org', '') || '/';
  if (!PAGE_LABELS[path]) throw new Error(`unexpected top page ${path}`);
  const share = r.clicks / top6Clicks;
  return { _key: PAGE_LABELS[path][0], _type: 'object', label: PAGE_LABELS[path][1], value: pct1(share), displayValue: `${Math.round(share * 100)}%` };
});
eq('top-page shares', pageChart.map((x) => x.displayValue).join(' '), '67% 12% 8% 5% 5% 4%');
const totImp = sum(pages, 'impressions');
const blogImp = sum(pages.filter((r) => r.keys[0].includes('/blog/')), 'impressions');
eq('blog share of impressions ≈ four in five', Math.round((blogImp / totImp) * 5), 4);
const smallCap = P('/blog/small-cap-trading-guide-for-beginners'), fiveMin = P('/blog/the-5-minute-chart'), scalp = P('/blog/scalp-trading-vs-momentum-trading'), home = P('/'), checklist = P('/blog/day-trading-setup-checklist');
eq('small-cap guide leads the blog', [...pages].filter((r) => r.keys[0].includes('/blog/')).sort((a, b) => b.impressions - a.impressions)[0].keys[0], smallCap.keys[0]);
eq('small-cap ÷ 5-minute', r1(smallCap.impressions / fiveMin.impressions), 1.1);
eq('small-cap ÷ scalping', r1(smallCap.impressions / scalp.impressions), 1.3);
eq('homepage outdraws every post', pages.filter((r) => r.impressions > home.impressions).length, 0);
eq('small-cap ÷ homepage ≈ two-thirds', Math.round((smallCap.impressions / home.impressions) * 3), 2);
eq('small-cap position ≈ 9', Math.round(smallCap.position), 9);
eq('checklist position ≈ 8', Math.round(checklist.position), 8);

/* Queries (US) and country, 90 days to 25 Sep (F3) */
const qc = J('gsc-queries-country.2026-06-28_2026-09-25.json').rows.filter((r) => r.keys[1] === 'usa');
const qpos = (q) => r1(qc.find((r) => r.keys[0] === q).position);
eq('US query positions', ['day trading checklist pdf', 'trading checklist pdf', 'day trading chatroom', 'best 60-day trading bootcamp'].map(qpos).join('/'), '1.1/3.6/3.6/1.6');
for (const q of ['kev momentum trading', 'trade.momentum']) if (!J('gsc-queries.2026-06-28_2026-09-25.json').rows.some((r) => r.keys[0] === q)) throw new Error(`branded query "${q}" gone`);
const countries = J('gsc-country.2026-06-28_2026-09-25.json').rows;
eq('US share of clicks ≈ three in five', Math.round((countries.find((r) => r.keys[0] === 'usa').clicks / sum(countries, 'clicks')) * 5), 3);

/* ── Peec (F4–F8) ───────────────────────────────────────────────────── */
const BRAND = 'kw_87af5194-f2bd-4870-8cd1-a25d793c5ff2';
const own = (rep) => rep.projectWide.data.find((r) => r.brand.id === BRAND);
const chan = (rep, id) => rep.perChannel.data.find((r) => r.brand.id === BRAND && r.model_channel?.id === id);
const win = (kind, w) => J(`peec-windows/${kind}.${w}.json`);
const prompts = J('peec-prompts.2026-09-28.json').data;
const NB = win('nonbranded', '2026-08-29_2026-09-27').branding.nonBrandedTagId;
const isNB = (p) => p.tags.some((t) => t.id === NB);
eq('prompts tracked', prompts.length, 75);
eq('non-branded prompts', prompts.filter(isNB).length, 72);

/* Trading communities, weekly, same six prompts since the 31 Jul rebuild (F4) */
const TC = 'to_2221f2a3-3178-450e-b92b-82d13152755e';
const SIX = prompts.filter((p) => p.topic?.id === TC && p.created_at.slice(0, 10) <= '2026-07-31');
eq('six prompts', SIX.length, 6);
eq('six prompts created by 31 Jul', SIX.filter((p) => p.created_at.slice(0, 10) === '2026-07-31').length, 4);
const weekly = (dir, mon) => J(`${dir}/${mon}.json`);
const tcTopic = (mon) => weekly('peec-weekly', mon).perTopic.data.find((r) => r.topic?.id === TC);
const six = (mon) => {
  let c = 0, t = 0;
  for (const p of SIX) { const r = J(`peec-prompt-weekly/${p.id}.${mon}.json`).data?.[0]; if (r) { c += r.visibility_count; t += r.visibility_total; } }
  return c / t;
};
const TC_WEEKS = []; for (let d = '2026-08-03'; d <= '2026-09-21'; d = addDays(d, 7)) TC_WEEKS.push(d);
for (const m of TC_WEEKS.filter((m) => m <= '2026-09-07')) eq(`six prompts = whole topic, week of ${m}`, r4(six(m)), r4(tcTopic(m).visibility));
const tcPoints = TC_WEEKS.map((m, k) => ({ _key: `pt-${k}`, week: m, value: r4(six(m)) }));
eq('topic climb', tcPoints.map((x) => pct1(x.value)).join(' '), '21.6 22.4 23.2 34.4 42.1 48 42.1 49.2');

/* Rank over time: non-branded, weekly (F5) */
const RANK_WEEKS = []; for (let d = '2026-05-11'; d <= '2026-09-21'; d = addDays(d, 7)) RANK_WEEKS.push(d);
const rankPoints = RANK_WEEKS.map((m, k) => {
  const rep = weekly('peec-weekly-nonbranded', m);
  if (rep.branding?.nonBrandedTagId !== NB) throw new Error(`${m} is not a non-branded pull`);
  return { _key: `pt-${k}`, week: m, position: r1(own(rep).position) };
});
eq('rank from/to', `${rankPoints[0].position}/${rankPoints.at(-1).position}`, '3.9/3');
eq('best rank week', Math.min(...rankPoints.map((x) => x.position)), 1.8);
const pw = (id, w) => { const f = join(SRC, 'peec-prompt-windows', `${id}.${w}.json`); return existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')).data?.[0] ?? null : null; };
const W30 = '2026-08-29_2026-09-27';
eq('non-branded prompts naming TradeMomentum, 30 days', prompts.filter(isNB).filter((p) => (pw(p.id, W30)?.visibility_count ?? 0) > 0).length, 21);

/* Monthly, non-branded (F6) */
const MONTH_W = { apr: '2026-04-01_2026-04-30', may: '2026-05-01_2026-05-31', jun: '2026-06-01_2026-06-30', jul: '2026-07-01_2026-07-31', aug: '2026-08-01_2026-08-31', sep: '2026-09-01_2026-09-27' };
const mon = Object.fromEntries(Object.entries(MONTH_W).map(([k, w]) => [k, own(win('nonbranded', w))]));
eq('monthly visibility', Object.values(mon).map((r) => pct1(r.visibility)).join('/'), '3.5/3.3/4.3/3.8/8.2/9.7');
eq('monthly position', Object.values(mon).map((r) => r1(r.position)).join('/'), '3.2/3.1/2.5/2.6/2.6/2.9');
eq('Apr→Sep nearly tripled', Math.round(mon.sep.visibility / mon.apr.visibility), 3);
/* Like-for-like: the 27 non-branded prompts tracked unchanged since 31 Jul */
const COHORT = prompts.filter((p) => isNB(p) && p.created_at.slice(0, 10) <= '2026-07-31');
eq('cohort size', COHORT.length, 27);
const cohort = (w) => { let c = 0, t = 0, ps = 0, pc = 0; for (const p of COHORT) { const r = pw(p.id, w); if (!r) throw new Error(`missing ${p.id} ${w}`); c += r.visibility_count; t += r.visibility_total; ps += r.position_sum ?? 0; pc += r.position_count ?? 0; } return { vis: c / t, pos: ps / pc }; };
const cAug = cohort(MONTH_W.aug), cSep = cohort(MONTH_W.sep);
eq('cohort visibility Aug/Sep', `${pct1(cAug.vis)}/${pct1(cSep.vis)}`, '11.8/17');
eq('cohort position Aug/Sep', `${r1(cAug.pos)}/${r1(cSep.pos)}`, '2.4/2.8');

/* Engines: May → 1–27 Sep, non-branded (F7) */
const E = { chatgpt: 'openai-0', perplexity: 'perplexity-0', googleAio: 'google-0' };
const mayR = win('nonbranded', MONTH_W.may), sepR = win('nonbranded', MONTH_W.sep);
const engRows = Object.entries(E).map(([engine, id], k) => ({ _key: `r-${k}`, engine, before: r4(chan(mayR, id).visibility), after: r4(chan(sepR, id).visibility) }));
eq('shipped May engine values', engRows.map((x) => x.before).join('/'), '0.0142/0.0297/0.0573');
eq('Sep engine values', engRows.map((x) => pct1(x.after)).join('/'), '6.5/12.9/9.6');
eq('ChatGPT lift', r1(chan(sepR, E.chatgpt).visibility / chan(mayR, E.chatgpt).visibility), 4.6);

/* 30 days to 27 Sep: brands, engines, prompts (F8) */
const r30 = win('nonbranded', W30);
const board = [...r30.projectWide.data].sort((a, b) => b.visibility - a.visibility);
eq('brands tracked', board.length, 12);
eq('TradeMomentum rank', board.findIndex((r) => r.brand.id === BRAND) + 1, 5);
const BRANDS = [['bearbulltraders', '22.6/2.6'], ['Warrior Trading', '22.3/2.7'], ['Investors Underground', '17.1/3.2'], ['Bulls on Wallstreet', '14.6/2.9'], ['Trademomentum', '9.8/2.9'], ['Bullish Bears', '3.4/4']];
for (const [name, want] of BRANDS) { const r = board.find((b) => b.brand.name === name); eq(`${name} vis/pos`, `${pct1(r.visibility)}/${r1(r.position)}`, want); }
eq('two leaders ÷ TradeMomentum, a little over twice', [0, 1].map((k) => Math.floor(board[k].visibility / own(r30).visibility)).join(','), '2,2');
eq('30-day engines vis/pos', ['perplexity-0', 'google-0', 'openai-0'].map((id) => `${pct1(chan(r30, id).visibility)}/${r1(chan(r30, id).position)}`).join(' '), '13.1/2.2 9.8/2.5 6.5/4.8');
const junR = win('nonbranded', MONTH_W.jun);
eq('AIO led in June', [...junR.perChannel.data.filter((r) => r.brand.id === BRAND)].sort((a, b) => b.visibility - a.visibility)[0].model_channel.id, 'google-0');
const jb = [...junR.projectWide.data];
eq('June: named earlier than BBT and Warrior', ['bearbulltraders', 'Warrior Trading'].every((n) => jb.find((b) => b.brand.name === n).position > own(junR).position), true);
const byText = (t) => prompts.find((p) => p.messages[0].content === t);
const promptRow = (t, w = W30) => pw(byText(t).id, w);
const WEDGE = [['best 60-day trading bootcamp', '89/1.9'], ['top momentum trading communities', '69/1.6'], ['day trading programs that teach discipline and rules', '13/2.6'], ['Are day trading courses worth the money', '7/1']];
for (const [t, want] of WEDGE) { const r = promptRow(t); eq(`wedge "${t}"`, `${Math.round(r.visibility * 100)}/${r1(r.position)}`, want); }
eq('June, two lower rows', ['day trading programs that teach discipline and rules', 'Are day trading courses worth the money'].map((t) => Math.round(promptRow(t, MONTH_W.jun).visibility * 100)).join('/'), '18/18');
if (prompts.some((p) => /coaching for fast results/i.test(p.messages[0].content))) throw new Error('"coaching for fast results" is tracked again; restore its row');
eq('chat rooms prompt', Math.round(promptRow('best day trading chat rooms').visibility * 100), 41);
const broad = ['best day trading courses online', 'momentum trading strategy explained', 'What is momentum day trading and how does it work'];
eq('broad prompts within 0–5%', broad.every((t) => promptRow(t).visibility <= 0.05) && prompts.filter(isNB).some((p) => (pw(p.id, W30)?.visibility ?? 1) === 0), true);
const aiPrompts = [['hb-bootcamp', 'Best 60-day trading bootcamp', 'best 60-day trading bootcamp'], ['hb-communities', 'Top momentum trading communities', 'top momentum trading communities'], ['hb-chatrooms', 'Best day trading chat rooms', 'best day trading chat rooms']].map(([key, label, t]) => { const v = Math.round(promptRow(t).visibility * 100); return { _key: key, _type: 'object', label, value: v, displayValue: `${v}%` }; });
eq('result3 position', r1(promptRow('top momentum trading communities').position), 1.6);

/* ── Copy ───────────────────────────────────────────────────────────── */
const mainBody = readFileSync(join(here, 'trademomentum-mainBody-2026-09-28.html'), 'utf8').trim();
const paragraphSummary = 'TradeMomentum\'s Google clicks per week grew 8.3x from the week the engagement began, 1 to 7 September 2025, to the week of 14 September 2026, ending at its high. On the six "trading communities" prompts tracked since 31 July, its AI visibility went from 21.6% to 49.2% in seven weeks.';
const FAQ_EDITS = {
  'faq-1': [['In this case that produced roughly 85% AI visibility on the core wedge prompt while the brand stays at 1 to 5% on the broad terms by design.', 'In this case that produced 89% AI visibility on the core wedge prompt in the 30 days to 27 September 2026, while the brand stays at 0 to 5% on the broad terms by design.']],
  'faq-2': [['In this program the early months produced little visible movement in AI answers, then mentions and cited position improved every month once the foundation was in place.', 'In this program the early months produced little visible movement in AI answers. Once the foundation was in place, visibility on non-branded prompts nearly tripled between April and September 2026, while cited position improved into the summer and slipped back in September.']],
  'faq-3': [['with impressions building over six months before average position crossed onto page one.', 'with impressions building for about five months before average position crossed onto page one.']],
};
const copy = mainBody + paragraphSummary + JSON.stringify(FAQ_EDITS);
if (/—/.test(copy)) throw new Error('em dash in new copy');
for (const stale of ['7.2x', '8.8%', '34.4%', '33.3%', '11.7x', '1 to 5%', '85%', 'every month we measured', '90 tracked', 'latest full month:']) if ((mainBody + paragraphSummary).includes(stale)) throw new Error(`stale figure "${stale}" in copy`);

const patch = {
  name: 'TradeMomentum: niche AEO + ~13x impressions',
  paragraphSummary,
  mainBody,
  result1Number: '8.3x',
  result1Title: 'Google clicks per week, week of 1 Sep 2025 → week of 14 Sep 2026, ending at its high',
  result2Number: '21.6% → 49.2%',
  result2Title: '"Trading communities" AI visibility in 7 weeks, same six prompts (weeks of 3 Aug → 21 Sep 2026)',
  result3Number: '1.6',
  result3Title: 'Average AI-cited position on "top momentum trading communities" (Peec AI, 30 days to 27 Sep 2026)',
  'instruments.aiSource': 'Peec AI · weekly, 3 Aug – 27 Sep 2026',
  'instruments.gscSource': 'Google Search Console · indexed to Dec 2025 = 100 · to 25 Sep 2026',
  'instruments.indexedTrend.points': points,
  'instruments.indexedTrend.caption': 'Impressions per day fell by more than half between August and September 2025, before the SEO work, then rose 30× from that September low to August 2026 and 31× over 1–25 September 2026. Daily to 25 Sep 2026, indexed to the average December day = 100.',
  'instruments.topicClimb.points': tcPoints,
  'instruments.topicClimb.caption': '21.6% to 49.2% in seven weeks on the same six prompts, weeks of 3 August to 21 September 2026: the topic the product actually sells into, not the whole account. The topic’s prompts were rebuilt on 31 July; three added on 18 September are left out.',
  'instruments.rankOverTime.from': 3.9,
  'instruments.rankOverTime.to': 3.0,
  'instruments.rankOverTime.points': rankPoints,
  'instruments.rankOverTime.caption': 'Non-branded prompts, weekly. From fourth-named to third across the engagement; the best week was 1.8 (week of 27 Jul). The prompt set was rebuilt on 31 July and expanded in September. AI names TradeMomentum on 21 of the 72 non-branded prompts now tracked (30 days to 27 Sep).',
  'instruments.engineBeforeAfter.beforeLabel': 'May 2026',
  'instruments.engineBeforeAfter.afterLabel': 'Sep 2026 (1–27)',
  'instruments.engineBeforeAfter.rows': engRows,
  'instruments.engineBeforeAfter.caption': 'Non-branded prompts. ChatGPT went from naming TradeMomentum in 1.4% of answers to 6.5%, a 4.6× lift; Perplexity rose most, from 3.0% to 12.9%.',
  'instruments.publishedResult.rows': [
    { _key: 'r-0', unit: 'impressions', value: '12.8x' },
    { _key: 'r-1', unit: 'clicks per week', value: '8.3x' },
  ],
  'instruments.publishedResult.positionFrom': 19.4,
  'instruments.publishedResult.positionTo': 10.8,
  'instruments.publishedResult.caption': 'Impressions, December 2025 to August 2026; clicks per week, week of 1 Sep 2025 to week of 14 Sep 2026; position, September 2025 to August 2026, full months.',
  'charts[_key=="chart-growth-curve"].data': growthCurve,
  'charts[_key=="chart-growth-curve"].title': 'Organic search growth (Dec 2025 to Aug 2026)',
  'charts[_key=="chart-page-growth"].data': pageChart,
  'charts[_key=="chart-page-growth"].title': 'Top pages by share of Google clicks (28 Jun to 25 Sep 2026)',
  'charts[_key=="chart-ai-prompts"].data': aiPrompts,
  'charts[_key=="chart-ai-prompts"].title': 'AI visibility on the prompts that match TradeMomentum\'s product (Peec AI, 30 days to 27 Sep 2026)',
  'charts[_key=="chart-ai-prompts"].legendPrimary': '30 days to 27 Sep 2026. Source: Peec AI.',
};

/* ── Plan / guards / write ──────────────────────────────────────────── */
console.log(`Google: ${points.length} daily points ${points[0].date} → ${points.at(-1).date}; Dec base ${baseImp.toFixed(2)} imp/day, ${baseClk.toFixed(2)} clicks/day`);
console.log('Google multiples', Object.fromEntries(Object.entries(g).map(([k, v]) => [k, +v.toFixed(3)])));
console.log('Growth curve:', growthCurve.map((x) => `${x.label} ${x.value} ${x.displayValue}`).join(' | '));
console.log('Top pages:', pageChart.map((x) => `${x.label} ${x.value}`).join(' | '));
console.log('Topic climb (six prompts):', tcPoints.map((x) => `${x.week} ${x.value}`).join(' | '));
console.log('Rank (non-branded):', rankPoints.map((x) => `${x.week.slice(5)} ${x.position}`).join(' '));
console.log('Engines May → Sep (1–27):', engRows.map((x) => `${x.engine} ${x.before} → ${x.after}`).join(' | '));
console.log('AI prompts chart:', aiPrompts.map((x) => `${x.label} ${x.value}`).join(' | '));

const doc = await client.getDocument(DOC_ID);
if (!doc || doc.slug?.current !== SLUG) throw new Error('published doc not found');
if (await client.getDocument(`drafts.${DOC_ID}`)) { console.error('A draft exists for this document; refusing to patch under a pending human edit.'); process.exit(1); }
console.log(`Current _rev ${doc._rev}, updated ${doc._updatedAt}`);
if (expectRev && doc._rev !== expectRev) { console.error(`_rev moved: expected ${expectRev}, found ${doc._rev}. Re-read before writing.`); process.exit(1); }
for (const k of ['chart-growth-curve', 'chart-page-growth', 'chart-ai-prompts']) if (!doc.charts.some((c) => c._key === k)) throw new Error(`chart ${k} missing`);

/* Drift guard, Google. Every shipped point from 1 Sep 2025 must reproduce exactly.
   The 31 August 2025 points were prepended separately, indexed against December
   totals of 6,463 impressions and 307 clicks (the other 368 points, and this pull,
   use 6,464 and 310). Their raw days must reproduce exactly under those totals, or
   the script stops (brief F1). This refresh re-indexes them on the same base as
   the rest, which moves 23 of them by one or two index points. */
let gDrift = 0, gRebased = 0;
const newByDate = new Map(points.map((p) => [p.date, p]));
for (const o of doc.instruments.indexedTrend.points) {
  const n = newByDate.get(o.date);
  if (!n) { gDrift++; console.log('  missing', o.date); continue; }
  if (o.date >= '2025-09-01') { if (o.impressions !== n.impressions || o.clicks !== n.clicks) { gDrift++; console.log('  drift', o.date, o, n); } continue; }
  const r = byDate.get(o.date);
  const imp6463 = Math.round((r.i / (6463 / 31)) * 100), clk307 = Math.round((r.c / (307 / 31)) * 100);
  if (o.impressions !== imp6463 || o.clicks !== clk307) { gDrift++; console.log('  drift (Aug 2025)', o.date, o, imp6463, clk307); }
  if (o.impressions !== n.impressions || o.clicks !== n.clicks) gRebased++;
}
console.log(`Aug 2025 prefix: ${gRebased} of 31 points move on the common December base`);
/* Drift guard, Peec topic. The seven complete shipped weeks reproduce to four places;
   the shipped 24 Aug point (0.3333) was pulled before that week closed, and the page's
   own copy already quoted the complete week, 34.4%, which is what reproduces (brief F4). */
let pDrift = 0;
for (const o of doc.instruments.topicClimb.points) {
  const got = r4(tcTopic(o.week).visibility);
  if (o.week === '2026-08-24') { if (o.value !== 0.3333 || got !== 0.344 || !doc.result2Number.includes('34.4%')) pDrift++; continue; }
  if (got !== o.value) { pDrift++; console.log('  sov drift', o.week, o.value, got); }
}
/* Rank: shipped weeks up to 20 Jul (when blended = non-branded) must reproduce. */
for (const o of doc.instruments.rankOverTime.points.filter((x) => x.week <= '2026-07-20')) {
  const n = rankPoints.find((x) => x.week === o.week);
  if (!n || n.position !== o.position) { pDrift++; console.log('  rank drift', o.week, o.position, n?.position); }
}
/* Engines "before" and the shipped May row must reproduce (checked above); FAQ edits must apply. */
const faq = doc.faq.map((f) => {
  let answer = f.answer;
  for (const [from, to] of FAQ_EDITS[f._key] ?? []) { if (!answer.includes(from)) throw new Error(`FAQ ${f._key} no longer contains the sentence to replace`); answer = answer.replace(from, to); }
  return { ...f, answer };
});
patch.faq = faq;
console.log(`Drift: Google ${gDrift}, Peec ${pDrift}`);
if (gDrift > 0 || pDrift > 0) { console.error('Shipped points do not reproduce; investigate before writing.'); process.exit(1); }

if (!WRITE) { console.log('\nDry run. Fields to set:', Object.keys(patch).join(', ')); process.exit(0); }
mkdirSync(join(here, '../backups'), { recursive: true });
writeFileSync(join(here, '../backups/trademomentum-casestudy-pre-2026-09-28.json'), JSON.stringify(doc, null, 2));
const res = await client.patch(DOC_ID).ifRevisionId(expectRev).set(patch).commit();
console.log(`✓ patched ${res._id} → _rev ${res._rev}`);
