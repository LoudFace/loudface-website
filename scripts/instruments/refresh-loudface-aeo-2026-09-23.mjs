/**
 * Refresh LoudFace's own AEO case study with every source to 22 September 2026:
 * Peec AI on non-branded prompts (monthly Apr → 1–22 Sep, per engine, daily
 * 8 Apr → 22 Sep, rank among the 53 tracked brands, per prompt), and the
 * sales-call chart recounted from the Cal.com booking events in PostHog.
 *
 * Inputs, all saved beside the research brief at
 * content-engine/.claude/research/loudface/loudface-aeo-case-study/:
 *   peec-brand-report.nonbranded.<start>_<end>.json   monthly + per-engine + rank
 *   peec-daily/nonbranded/<YYYY-MM-DD>.json            daily series (topicClimb)
 *   peec-prompt-visibility/<promptId>.<window>.json    like-for-like cohorts + prompt chart
 *   peec-prompts.2026-09-23.json                       prompt created dates and tags
 *   posthog-call-events-classified.2026-09-23.json     sales calls per month
 * Copy: content-engine/.claude/drafts/loudface/loudface-aeo-case-study.{lede.txt,faq.json}
 * and loudface-mainBody-2026-09-23.html beside this script.
 *
 * Every number the copy states is recomputed here from the raw pulls and the
 * script refuses to write if one moved (guarded). The patch carries
 * ifRevisionID, so a concurrent edit makes it fail instead of being overwritten.
 *
 *   node scripts/instruments/refresh-loudface-aeo-2026-09-23.mjs                          # dry run
 *   node scripts/instruments/refresh-loudface-aeo-2026-09-23.mjs --thumb <png> --alt "…"  # dry run incl. thumbnail
 *   node scripts/instruments/refresh-loudface-aeo-2026-09-23.mjs [--thumb <png> --alt "…"] --rev <expected _rev> --write
 *
 * Backup of the pre-refresh document: scripts/backups/loudface-aeo-casestudy-pre-2026-09-23.json
 */
import { createClient } from '@sanity/client';
import { readFileSync, readdirSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const arg = (k) => (args.indexOf(k) >= 0 ? args[args.indexOf(k) + 1] : null);
const thumbPath = arg('--thumb');
const thumbAlt = arg('--alt');
const expectRev = arg('--rev');
if (thumbPath && !thumbAlt) { console.error('--thumb needs --alt'); process.exit(1); }
if (thumbAlt && /—/.test(thumbAlt)) { console.error('em dash in --alt'); process.exit(1); }
if (WRITE && !expectRev) { console.error('--write needs --rev <the _rev you last read>'); process.exit(1); }

let token = process.env.SANITY_API_TOKEN;
if (!token && existsSync(join(here, '../../.env.local'))) {
  const env = Object.fromEntries(readFileSync(join(here, '../../.env.local'), 'utf8').split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#')).map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]));
  token = env.SANITY_API_TOKEN;
}
if (!token) { console.error('SANITY_API_TOKEN missing (run through content-engine scripts/with-secrets.sh)'); process.exit(1); }
const client = createClient({ projectId: 'xjjjqhgt', dataset: 'production', apiVersion: '2025-03-29', token, useCdn: false });

const DOC_ID = 'caseStudy-loudface-aeo-case-study';
const CE = join(here, '../../../content-engine/.claude');
const SRC = join(CE, 'research/loudface/loudface-aeo-case-study');
const DRAFT = join(CE, 'drafts/loudface/loudface-aeo-case-study');
const J = (p) => JSON.parse(readFileSync(p, 'utf8'));
const r1 = (n) => Math.round(n * 10) / 10;
const pct1 = (x) => r1(x * 100);
const eq = (label, got, want) => { if (got !== want) throw new Error(`copy says ${label} = ${want}, data says ${got}`); };

/* ── Peec, non-branded, monthly / per engine / rank ─────────────────── */
const ourRow = (rep) => rep.projectWide.data.find((r) => r.brand.name === 'LoudFace');
const channel = (rep, id) => rep.perChannel.data.find((r) => r.brand.name === 'LoudFace' && r.model_channel?.id === id);
const rankOf = (rep) => [...rep.projectWide.data].sort((a, b) => b.visibility - a.visibility).findIndex((r) => r.brand.name === 'LoudFace') + 1;
const W = {
  apr: '2026-04-08_2026-04-30', may: '2026-05-01_2026-05-31', jun: '2026-06-01_2026-06-30',
  jul: '2026-07-01_2026-07-31', aug: '2026-08-01_2026-08-31', sep: '2026-09-01_2026-09-22', sepLast: '2026-09-16_2026-09-22',
};
const rep = Object.fromEntries(Object.entries(W).map(([k, w]) => [k, J(join(SRC, `peec-brand-report.nonbranded.${w}.json`))]));
for (const [k, r] of Object.entries(rep)) if (!r.branding?.nonBrandedTagId) throw new Error(`${k} is not a non-branded pull`);
const vis = Object.fromEntries(Object.entries(rep).map(([k, r]) => [k, ourRow(r).visibility]));
const expectVis = { apr: 0.13, may: 2.9, jun: 8.3, jul: 6.0, aug: 12.3, sep: 15.3 };
eq('Apr visibility', Math.round(vis.apr * 10000) / 100, 0.13);
for (const k of ['may', 'jun', 'jul', 'aug', 'sep']) eq(`${k} visibility`, pct1(vis[k]), expectVis[k]);
eq('Apr answers naming us', ourRow(rep.apr).visibility_count, 3);
eq('Apr answers', ourRow(rep.apr).visibility_total, 2306);
eq('Sep rank', rankOf(rep.sep), 5);
eq('Aug rank', rankOf(rep.aug), 10);
eq('brands tracked', rep.sep.projectWide.data.length, 53);
eq('Aug position', r1(ourRow(rep.aug).position), 2.8);
eq('Sep position', r1(ourRow(rep.sep).position), 3.3);
const monthRanks = ['apr', 'may', 'jun', 'jul', 'aug', 'sep'].map((k) => rankOf(rep[k]));
eq('monthly ranks', monthRanks.join(','), '40,26,11,14,10,5');
const monthPos = ['apr', 'may', 'jun', 'jul', 'aug', 'sep'].map((k) => r1(ourRow(rep[k]).position));
eq('monthly positions', monthPos.join(','), '3,4.1,3,2.8,2.8,3.3');

const eng = (k, id) => channel(rep[k], id)?.visibility ?? 0;
const E = { chatgpt: 'openai-0', perplexity: 'perplexity-0', googleAio: 'google-0' };
eq('engines Apr', ['chatgpt', 'perplexity', 'googleAio'].map((e) => pct1(eng('apr', E[e]))).join('/'), '0/0/0.4');
eq('engines Jun', ['chatgpt', 'perplexity', 'googleAio'].map((e) => pct1(eng('jun', E[e]))).join('/'), '5.9/9.1/10.1');
eq('engines Aug', ['chatgpt', 'perplexity', 'googleAio'].map((e) => pct1(eng('aug', E[e]))).join('/'), '17.1/12.4/7.1');
eq('engines Sep', ['chatgpt', 'perplexity', 'googleAio'].map((e) => pct1(eng('sep', E[e]))).join('/'), '28.3/9.5/8');
eq('ChatGPT 16–22 Sep', pct1(eng('sepLast', E.chatgpt)), 35.9);
eq('AIO Sep position', r1(channel(rep.sep, 'google-0').position), 2.3);

/* Competitors ahead of us, and their positions */
const board = [...rep.sep.projectWide.data].sort((a, b) => b.visibility - a.visibility);
const ahead = board.slice(0, 4);
eq('four ahead', ahead.map((b) => b.brand.name).join('|'), 'Omniscient|First Page Sage|Siege Media|iPullRank');
eq('four ahead visibility', ahead.map((b) => pct1(b.visibility)).join('/'), '32.4/20.6/20.1/18');
eq('four ahead position', ahead.map((b) => r1(b.position)).join('/'), '3.7/4.1/4.6/3.5');
if (!ahead.every((b) => b.position > ourRow(rep.sep).position)) throw new Error('an agency ahead of us is named earlier');

/* ── Like-for-like cohorts (brief F5) ───────────────────────────────── */
const prompts = J(join(SRC, 'peec-prompts.2026-09-23.json')).data;
const NB = rep.sep.branding.nonBrandedTagId;
const isNB = (p) => p.tags.some((t) => t.id === NB);
const cohort = (maxCreated) => prompts.filter((p) => isNB(p) && p.created_at.slice(0, 10) <= maxCreated);
const agg = (ids, w) => {
  let c = 0, t = 0;
  for (const p of ids) {
    const f = join(SRC, 'peec-prompt-visibility', `${p.id}.${w}.json`);
    if (!existsSync(f)) {
      if (p.created_at.slice(0, 10) <= w.slice(11)) throw new Error(`missing per-prompt pull ${p.id} for ${w}`);
      continue;
    }
    const r = J(f).data?.[0];
    if (r) { c += r.visibility_count ?? 0; t += r.visibility_total ?? 0; }
  }
  return c / t;
};
const aprC = cohort('2026-04-30'), junC = cohort('2026-06-30');
eq('April cohort size', aprC.length, 23);
eq('June cohort size', junC.length, 55);
eq('April cohort, Apr', Math.round(agg(aprC, W.apr) * 10000) / 100, 0.06);
eq('April cohort, Sep', pct1(agg(aprC, W.sep)), 18);
eq('June cohort, Jun/Aug/Sep', [W.jun, W.aug, W.sep].map((w) => pct1(agg(junC, w))).join('/'), '11.4/18.2/24.8');

/* Prompt chart: top non-branded prompts, 1–22 Sep */
const promptVis = prompts.filter(isNB).map((p) => {
  const r = J(join(SRC, 'peec-prompt-visibility', `${p.id}.${W.sep}.json`)).data?.[0] ?? {};
  return { text: p.messages[0].content, vis: r.visibility ?? 0, pos: r.position ?? null, count: r.visibility_count ?? 0 };
}).sort((a, b) => b.vis - a.vis);
eq('prompts naming us', promptVis.filter((p) => p.count > 0).length, 136);
eq('non-branded prompts', promptVis.length, 141);
const PROMPT_LABELS = [
  ['Which agencies do SEO and AI search for security and compliance software?', 'SEO + AI search agency, security & compliance software', 87],
  ['Agency that combines SEO, AEO, and Webflow for B2B SaaS', 'Agency combining SEO, AEO & Webflow', 80],
  ['Best AEO agency for B2B fintech payroll and payments companies', 'Best AEO agency, fintech payroll & payments', 77.3],
  ['AEO agency for B2B SaaS payments and money movement companies', 'AEO agency, SaaS payments & money movement', 71.2],
  ['Top AEO agency for fintech 2026', 'Top AEO agency for fintech 2026', 68.2],
  ['AEO agency for fintech infrastructure companies', 'AEO agency for fintech infrastructure', 67.7],
  ['SEO agency for developer tools and developer-first SaaS', 'SEO agency for developer tools', 62.1],
];
PROMPT_LABELS.forEach(([text, , v], i) => { eq(`prompt ${i + 1} text`, promptVis[i].text, text); eq(`prompt ${i + 1}`, pct1(promptVis[i].vis), v); });
/* The core prompt, carried from the June table and labelled as such on the page. */
const CORE = 'Best B2B SaaS organic growth agency 2026';
const coreIdx = promptVis.findIndex((p) => p.text === CORE);
eq('core prompt rank', coreIdx + 1, 10);
eq('core prompt', pct1(promptVis[coreIdx].vis), 51.5);
PROMPT_LABELS.push([CORE, 'Best B2B SaaS organic growth agency 2026 (core prompt)', 51.5]);

/* ── Peec daily, non-branded (topicClimb) ───────────────────────────── */
const dailyDir = join(SRC, 'peec-daily/nonbranded');
const days = readdirSync(dailyDir).filter((f) => f.endsWith('.json')).sort().map((f) => {
  const d = J(join(dailyDir, f));
  if (!d.branding?.nonBrandedTagId) throw new Error(`${f} is not non-branded`);
  const r = ourRow(d);
  return { date: f.replace('.json', ''), value: r ? Math.round(r.visibility * 10000) / 10000 : 0 };
});
const addDays = (iso, n) => { const d = new Date(`${iso}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
for (let i = 1; i < days.length; i++) if (days[i].date !== addDays(days[i - 1].date, 1)) throw new Error(`daily gap at ${days[i].date}`);
if (days[0].date !== '2026-04-08' || days.at(-1).date !== '2026-09-22' || days.length !== 168) throw new Error(`daily series must run 8 Apr → 22 Sep (168), got ${days[0].date} → ${days.at(-1).date} (${days.length})`);

/* ── Sales calls (brief F11) ────────────────────────────────────────── */
const calls = J(join(SRC, 'posthog-call-events-classified.2026-09-23.json')).rows.filter((r) => r.class === 'sales call');
const perMonth = (m, until = '9999') => new Set(calls.filter((r) => r.timestamp.startsWith(m) && r.timestamp.slice(0, 10) <= until).map((r) => r.person)).size;
const LEAD_MONTHS = ['2026-05', '2026-06', '2026-07', '2026-08'];
const counts = LEAD_MONTHS.map((m) => perMonth(m));
eq('sales calls May–Aug', counts.join(','), '8,7,3,11');
const leadBase = (counts[0] + counts[1] + counts[2]) / 3;
const sepCalls = perMonth('2026-09', '2026-09-22');
eq('Sep 1–22 sales calls', sepCalls, 3);
if (sepCalls / 22 >= counts[3] / 31) throw new Error('September is no longer running below August; fix the copy');
const leadMultiple = counts[3] / leadBase;
eq('lead multiple', r1(leadMultiple), 1.8);
const src = calls.filter((r) => r.timestamp.slice(0, 10) >= '2026-08-20' && r.timestamp.slice(0, 10) <= '2026-09-22' && r.lead_source);
const bySrc = src.reduce((a, r) => ({ ...a, [r.lead_source]: (a[r.lead_source] ?? 0) + 1 }), {});
if (bySrc.AI !== bySrc['Google Search']) throw new Error(`source question no longer ties AI with Google: ${JSON.stringify(bySrc)}`);

const leadGrowth = {
  _type: 'object',
  title: 'Sales calls booked per month, indexed',
  multiple: `${leadMultiple.toFixed(1)}×`,
  multipleLabel: 'the sales calls booked in August, against the May–July monthly average',
  baselineLabel: 'the May–July monthly average',
  caption: 'Distinct people booking an intro call or quick chat through the site each month, from the Cal.com booking webhook, excluding our own test bookings, hiring interviews and cancellations. Tracking began 20 April, so April is left out. September to the 22nd is not plotted as a month; it is running below August’s pace.',
  source: 'PostHog + Cal.com · May – Aug 2026, Sep to the 22nd noted',
  points: LEAD_MONTHS.map((m, i) => ({ _key: `lg-${m}-01`, _type: 'object', week: `${m}-01`, value: Math.round((counts[i] / leadBase) * 100) })),
};
eq('lead index', leadGrowth.points.map((p) => p.value).join(','), '133,117,50,183');

/* ── Copy ───────────────────────────────────────────────────────────── */
const mainBody = readFileSync(join(here, 'loudface-mainBody-2026-09-23.html'), 'utf8').trim();
const draft = readFileSync(`${DRAFT}.md`, 'utf8').trim();
if (mainBody !== draft) throw new Error('mainBody file differs from the verified draft in content-engine');
const faq = J(`${DRAFT}.faq.json`).faq;
const paragraphSummary = readFileSync(`${DRAFT}.lede.txt`, 'utf8').trim();
if (/—/.test(mainBody + paragraphSummary + JSON.stringify(faq))) throw new Error('em dash in copy');
for (const stale of ['9.39', '10.35', '12.42', '16.86', '6.2%', 'Jun 2026', '8th of', '1,860']) {
  if ((mainBody + paragraphSummary + JSON.stringify(faq)).includes(stale)) throw new Error(`stale figure "${stale}" in copy`);
}

const MONTH_LABELS = [['apr', 'Apr', '0.13%'], ['may', 'May', '2.9%'], ['jun', 'Jun', '8.3%'], ['jul', 'Jul', '6.0%'], ['aug', 'Aug', '12.3%'], ['sep', 'Sep', '15.3%']];
const growthCurve = MONTH_LABELS.map(([k, label, dv]) => ({ _key: `gc-${k}`, _type: 'object', label, value: Math.max(1, Math.round((vis[k] / vis.sep) * 100)), displayValue: dv }));

const patch = {
  name: 'LoudFace: 0.13% to 15.3% of non-branded AI answers',
  paragraphSummary,
  result1Number: '0.13% → 15.3%',
  result1Title: 'AI visibility on non-branded prompts, Apr 2026 → 1–22 Sep 2026 (Peec AI)',
  result2Number: '5th of 53',
  result2Title: 'Rank among the 53 tracked brands on AI visibility, non-branded prompts, 1–22 Sep 2026; 10th in Aug',
  result3Number: '0% → 28.3%',
  result3Title: 'ChatGPT answers naming LoudFace, non-branded prompts, Apr → 1–22 Sep 2026 (Peec AI)',
  'instruments.aiSource': 'Peec AI · non-branded prompts · 8 Apr – 22 Sep 2026',
  'instruments.topicClimb.title': 'Share of non-branded AI answers naming LoudFace, daily',
  'instruments.topicClimb.caption': 'From 0.13% of answers in April to 15.3% over 1–22 September. The step on 18 September follows the prompt-panel cut on the 17th; on the prompts tracked since June the climb holds, 11.4% in June to 24.8% in September.',
  'instruments.topicClimb.points': days.map((d, i) => ({ _key: `d-${i}`, week: d.date, value: d.value })),
  'instruments.engineBeforeAfter.beforeLabel': 'Apr 2026',
  'instruments.engineBeforeAfter.afterLabel': 'Sep 2026 (1–22)',
  'instruments.engineBeforeAfter.rows': [
    { _key: 'r-0', engine: 'chatgpt', before: Math.round(eng('apr', E.chatgpt) * 10000) / 10000, after: Math.round(eng('sep', E.chatgpt) * 10000) / 10000 },
    { _key: 'r-1', engine: 'perplexity', before: Math.round(eng('apr', E.perplexity) * 10000) / 10000, after: Math.round(eng('sep', E.perplexity) * 10000) / 10000 },
    { _key: 'r-2', engine: 'googleAio', before: Math.round(eng('apr', E.googleAio) * 10000) / 10000, after: Math.round(eng('sep', E.googleAio) * 10000) / 10000 },
  ],
  'instruments.engineBeforeAfter.caption': 'Non-branded prompts. ChatGPT went from never naming us to 28.3% of answers; Perplexity fell back from 12.4% in August, and Google AI Overviews rose from 7.1% in August.',
  'instruments.publishedResult.rows': [
    { _key: 'r-0', value: '0.13% → 15.3%', unit: 'AI visibility, non-branded prompts, Apr → 1–22 Sep 2026' },
    { _key: 'r-1', value: '5th of 53', unit: 'tracked brands, 1–22 Sep 2026' },
    { _key: 'r-2', value: '3.3', unit: 'average position when named, 1–22 Sep 2026' },
  ],
  'instruments.publishedResult.caption': 'Non-branded prompts across ChatGPT, Perplexity and Google AI Overviews. Source: Peec AI.',
  'instruments.leadGrowth': leadGrowth,
  'charts[_key=="chart-growth-curve"].data': growthCurve,
  'charts[_key=="chart-growth-curve"].title': 'Our share of non-branded AI answers (Apr to Sep 2026)',
  'charts[_key=="chart-growth-curve"].legendPrimary': 'Share of non-branded AI answers naming LoudFace across ChatGPT, Perplexity & Google AI Overviews, monthly; April from the 8th, September to the 22nd. Bars scaled to September = 100; labels are the real share. Source: Peec AI.',
  'charts[_key=="chart-prompts"].data': PROMPT_LABELS.map(([, label, v], i) => ({ _key: `p${i + 1}`, _type: 'object', label, value: Math.round(v), displayValue: `${v.toFixed(1)}%` })),
  'charts[_key=="chart-prompts"].title': 'Where we win: AI visibility by buyer prompt (1–22 Sep 2026)',
  'charts[_key=="chart-engines"].data': [
    { _key: 'e1', _type: 'object', label: 'ChatGPT', value: Math.round(pct1(eng('sep', E.chatgpt))), displayValue: `${pct1(eng('sep', E.chatgpt)).toFixed(1)}%` },
    { _key: 'e2', _type: 'object', label: 'Perplexity', value: Math.round(pct1(eng('sep', E.perplexity))), displayValue: `${pct1(eng('sep', E.perplexity)).toFixed(1)}%` },
    { _key: 'e3', _type: 'object', label: 'Google AI Overviews', value: Math.round(pct1(eng('sep', E.googleAio))), displayValue: `${pct1(eng('sep', E.googleAio)).toFixed(1)}%` },
  ],
  'charts[_key=="chart-engines"].title': 'AI visibility by engine, non-branded prompts (1–22 Sep 2026)',
  faq,
  mainBody,
};
if (thumbAlt) patch['mainProjectImageThumbnail.alt'] = thumbAlt;

/* ── Plan / guards / write ──────────────────────────────────────────── */
console.log('Monthly non-branded visibility:', MONTH_LABELS.map(([k, l]) => `${l} ${(vis[k] * 100).toFixed(2)}%`).join(' | '), '| ranks', monthRanks.join(','));
console.log('Growth curve:', growthCurve.map((g) => `${g.label} ${g.value} ${g.displayValue}`).join(' | '));
console.log(`Daily: ${days.length} points ${days[0].date} → ${days.at(-1).date}`);
console.log(`Sales calls May–Aug ${counts.join(',')}, base ${leadBase.toFixed(2)}, Aug ${leadMultiple.toFixed(2)}×, Sep 1–22 ${sepCalls}; sources since 20 Aug`, bySrc);

const doc = await client.getDocument(DOC_ID);
if (!doc) throw new Error('published doc not found');
if (await client.getDocument(`drafts.${DOC_ID}`)) { console.error('A draft exists for this document; refusing to patch under a pending human edit.'); process.exit(1); }
console.log(`Current _rev ${doc._rev}, updated ${doc._updatedAt}`);
for (const k of ['chart-growth-curve', 'chart-prompts', 'chart-engines']) if (!doc.charts.some((c) => c._key === k)) throw new Error(`chart ${k} missing`);
if (expectRev && doc._rev !== expectRev) { console.error(`_rev moved: expected ${expectRev}, found ${doc._rev}. Re-read before writing.`); process.exit(1); }

if (thumbPath) {
  const png = readFileSync(thumbPath);
  console.log(`Thumbnail ${thumbPath} ${(png.length / 1024 / 1024).toFixed(2)} MB; current asset ${doc.mainProjectImageThumbnail?.asset?._ref}`);
}
if (!WRITE) { console.log('\nDry run. Fields to set:', Object.keys(patch).join(', ')); process.exit(0); }

mkdirSync(join(here, '../backups'), { recursive: true });
writeFileSync(join(here, '../backups/loudface-aeo-casestudy-pre-2026-09-23.json'), JSON.stringify(doc, null, 2));
if (thumbPath) {
  const asset = await client.assets.upload('image', readFileSync(thumbPath), { filename: 'loudface-aeo-case-study-thumbnail-2026-09-23.png', contentType: 'image/png' });
  if (asset._id === doc.mainProjectImageThumbnail?.asset?._ref) throw new Error('upload returned the old asset');
  console.log(`✓ uploaded ${asset._id}`);
  patch['mainProjectImageThumbnail.asset._ref'] = asset._id;
}
const res = await client.patch(DOC_ID).ifRevisionId(expectRev).set(patch).commit();
console.log(`✓ patched ${res._id} → _rev ${res._rev}`);
