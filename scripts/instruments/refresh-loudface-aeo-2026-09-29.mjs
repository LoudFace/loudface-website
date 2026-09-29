/**
 * Refresh LoudFace's own AEO case study to the post-cut window, 18–28 September 2026:
 * Peec AI on non-branded prompts (monthly Apr → Aug, then 18–28 Sep on the panel after
 * the 17 Sep prompt cut; per engine; daily 8 Apr → 28 Sep; rank among the 53 tracked
 * brands; per prompt; like-for-like cohorts incl. per engine). One reading now goes on
 * every loudface.co surface (case study, receipts post, GEO/service pages, /methodology,
 * the listicles). Sales calls, Search Console and AI referrals are carried from the
 * 23 Sep pulls with their own windows.
 *
 * Inputs, all saved beside the research brief at
 * content-engine/.claude/research/loudface/loudface-aeo-case-study/:
 *   peec-brand-report.nonbranded.<start>_<end>.json   monthly + per-engine + rank
 *   peec-daily/nonbranded/<YYYY-MM-DD>.json            daily series (topicClimb)
 *   peec-prompt-visibility/<promptId>.<window>.json    like-for-like cohorts + prompt chart
 *   peec-prompts.2026-09-23.json / .2026-09-29.json    prompt created dates and tags
 *   posthog-call-events-classified.2026-09-23.json     sales calls per month
 * Copy: content-engine/.claude/drafts/loudface/loudface-aeo-case-study.{lede.txt,faq.json}
 * and loudface-mainBody-2026-09-29.html beside this script, and the non-body strings in
 * content-engine/.claude/drafts/loudface/loudface-aeo-case-study.fields.json.
 *
 * Every number the copy states is recomputed here from the raw pulls and the
 * script refuses to write if one moved (guarded). The patch carries
 * ifRevisionID, so a concurrent edit makes it fail instead of being overwritten.
 *
 *   node scripts/instruments/refresh-loudface-aeo-2026-09-29.mjs                          # dry run
 *   node scripts/instruments/refresh-loudface-aeo-2026-09-29.mjs --thumb <png> --alt "…"  # dry run incl. thumbnail
 *   node scripts/instruments/refresh-loudface-aeo-2026-09-29.mjs [--thumb <png> --alt "…"] --rev <expected _rev> --write
 *
 * Backup of the pre-refresh document: scripts/backups/loudface-aeo-casestudy-pre-2026-09-29.json
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
// CONTENT_ENGINE_DIR points at another content-engine checkout (e.g. a session's second copy).
const CE = join(process.env.CONTENT_ENGINE_DIR ?? join(here, '../../../content-engine'), '.claude');
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
  jul: '2026-07-01_2026-07-31', aug: '2026-08-01_2026-08-31', sep: '2026-09-18_2026-09-28',
};
const rep = Object.fromEntries(Object.entries(W).map(([k, w]) => [k, J(join(SRC, `peec-brand-report.nonbranded.${w}.json`))]));
for (const [k, r] of Object.entries(rep)) if (!r.branding?.nonBrandedTagId) throw new Error(`${k} is not a non-branded pull`);
const vis = Object.fromEntries(Object.entries(rep).map(([k, r]) => [k, ourRow(r).visibility]));
const expectVis = { may: 2.9, jun: 8.3, jul: 6.0, aug: 12.3, sep: 21.5 };
eq('Apr visibility', Math.round(vis.apr * 10000) / 100, 0.13);
for (const k of Object.keys(expectVis)) eq(`${k} visibility`, pct1(vis[k]), expectVis[k]);
eq('Sep answers', `${ourRow(rep.sep).visibility_count}/${ourRow(rep.sep).visibility_total}`, '992/4624');
eq('Sep rank', rankOf(rep.sep), 3);
eq('brands tracked', rep.sep.projectWide.data.length, 53);
eq('Sep position', r1(ourRow(rep.sep).position), 3.4);
eq('non-branded prompts', rep.sep.branding.promptsNonBranded, 141);
eq('monthly ranks', ['apr', 'may', 'jun', 'jul', 'aug', 'sep'].map((k) => rankOf(rep[k])).join(','), '40,26,11,14,10,3');
eq('monthly positions', ['apr', 'may', 'jun', 'jul', 'aug', 'sep'].map((k) => r1(ourRow(rep[k]).position)).join(','), '3,4.1,3,2.8,2.8,3.4');

const eng = (k, id) => channel(rep[k], id)?.visibility ?? 0;
const E = { chatgpt: 'openai-0', perplexity: 'perplexity-0', googleAio: 'google-0' };
const trio = (k) => ['chatgpt', 'perplexity', 'googleAio'].map((e) => pct1(eng(k, E[e]))).join('/');
eq('engines Apr', trio('apr'), '0/0/0.4');
eq('engines Jun', trio('jun'), '5.9/9.1/10.1');
eq('engines Aug', trio('aug'), '17.1/12.4/7.1');
eq('engines Sep', trio('sep'), '38.8/11.2/14.3');
eq('AIO Sep position', r1(channel(rep.sep, 'google-0').position), 2.2);

/* Agencies ahead of us, and their positions */
const board = [...rep.sep.projectWide.data].sort((a, b) => b.visibility - a.visibility);
eq('top five', board.slice(0, 5).map((b) => `${b.brand.name} ${pct1(b.visibility)} ${r1(b.position)}`).join('|'),
  'Omniscient 34.5 3.7|First Page Sage 21.7 4.5|LoudFace 21.5 3.4|Siege Media 20.5 4.8|iPullRank 18.7 3.8');
if (!board.slice(0, 2).every((b) => b.position > ourRow(rep.sep).position)) throw new Error('an agency ahead of us is named earlier');

/* ── Like-for-like cohorts (brief F5, F22, F27) ─────────────────────── */
const prompts = J(join(SRC, 'peec-prompts.2026-09-23.json')).data;
const NB = rep.sep.branding.nonBrandedTagId;
const isNB = (p) => p.tags.some((t) => t.id === NB);
const cohort = (maxCreated) => prompts.filter((p) => isNB(p) && p.created_at.slice(0, 10) <= maxCreated);
const perPromptSep = new Map(J(join(SRC, `peec-per-prompt.nonbranded.${W.sep}.json`)).data.map((r) => [r.prompt.id, r]));
const agg = (ids, w) => {
  let c = 0, t = 0;
  for (const p of ids) {
    const r = w === W.sep ? perPromptSep.get(p.id) : (() => { const f = join(SRC, 'peec-prompt-visibility', `${p.id}.${w}.json`); if (!existsSync(f)) throw new Error(`missing per-prompt pull ${p.id} for ${w}`); return J(f).data?.[0]; })();
    if (!r) throw new Error(`no ${w} row for ${p.id}`);
    c += r.visibility_count ?? 0; t += r.visibility_total ?? 0;
  }
  return c / t;
};
const aprC = cohort('2026-04-30'), junC = cohort('2026-06-30');
eq('April cohort size', aprC.length, 23);
eq('June cohort size', junC.length, 55);
eq('April cohort, Apr', Math.round(agg(aprC, W.apr) * 10000) / 100, 0.06);
eq('April cohort, Sep', pct1(agg(aprC, W.sep)), 16.9);
eq('June cohort, Jun/Aug/Sep', [W.jun, W.aug, W.sep].map((w) => pct1(agg(junC, w))).join('/'), '11.4/18.2/24.9');
const byEngine = (w) => {
  const rows = J(join(SRC, `peec-per-prompt-engine.${w}.json`)).data;
  const ids = new Set(junC.map((p) => p.id));
  return Object.fromEntries(Object.entries(E).map(([k, ch]) => {
    const rs = rows.filter((r) => ids.has(r.prompt.id) && r.model_channel.id === ch);
    return [k, pct1(rs.reduce((a, r) => a + (r.visibility_count ?? 0), 0) / rs.reduce((a, r) => a + (r.visibility_total ?? 0), 0))];
  }));
};
const junEngAug = byEngine(W.aug), junEngSep = byEngine(W.sep);
eq('June cohort per engine, Aug', `${junEngAug.chatgpt}/${junEngAug.googleAio}/${junEngAug.perplexity}`, '25/10.5/18.7');
eq('June cohort per engine, Sep', `${junEngSep.chatgpt}/${junEngSep.googleAio}/${junEngSep.perplexity}`, '35.9/20.8/18');

/* Prompt chart: top non-branded prompts, 18–28 Sep */
const promptsNow = J(join(SRC, 'peec-prompts.2026-09-29.json')).data.filter((p) => !p.is_archived && isNB(p));
eq('non-branded prompts now', promptsNow.length, 141);
const promptVis = promptsNow.map((p) => {
  const r = perPromptSep.get(p.id) ?? {};
  return { text: p.messages[0].content, vis: r.visibility ?? 0, pos: r.position ?? null, count: r.visibility_count ?? 0 };
}).sort((a, b) => b.vis - a.vis || b.count - a.count);
eq('prompts naming us', promptVis.filter((p) => p.count > 0).length, 116);
const PROMPT_LABELS = [
  ['AEO agency for fintech infrastructure companies', 'AEO agency for fintech infrastructure', 100],
  ['Top AEO agency for fintech 2026', 'Top AEO agency for fintech 2026', 84.8],
  ['Agency that combines SEO, AEO, and Webflow for B2B SaaS', 'Agency combining SEO, AEO & Webflow', 81.8],
  ['Best AEO agency for B2B fintech payroll and payments companies', 'Best AEO agency, fintech payroll & payments', 75.8],
  ['Which agencies do SEO and AI search for security and compliance software?', 'SEO + AI search agency, security & compliance software', 72.7],
  ['Best AEO agency for fintech companies', 'Best AEO agency for fintech companies', 71.9],
];
PROMPT_LABELS.forEach(([text, , v], i) => { eq(`prompt ${i + 1} text`, promptVis[i].text, text); eq(`prompt ${i + 1}`, pct1(promptVis[i].vis), v); });
const CORE = 'Best B2B SaaS organic growth agency 2026';
const core = promptVis.find((p) => p.text === CORE);
eq('core prompt', pct1(core.vis), 48.5);
const coreBoard = [...J(join(SRC, `peec-core-prompt.all-brands.${W.sep}.json`)).data].sort((a, b) => b.visibility - a.visibility);
eq('core prompt board', coreBoard.slice(0, 3).map((b) => `${b.brand.name} ${pct1(b.visibility)}`).join('|').replace('SimpleTiger 48.5|LoudFace 48.5', 'LoudFace 48.5|SimpleTiger 48.5'), 'Omniscient 97|LoudFace 48.5|SimpleTiger 48.5');
PROMPT_LABELS.push([CORE, 'Best B2B SaaS organic growth agency 2026 (core prompt)', 48.5]);

/* Pages cited, 18–28 Sep */
const urls = J(join(SRC, `peec-url-report.${W.sep}.json`)).data;
const cites = urls.reduce((a, r) => a + r.citation_count, 0);
eq('citations', cites, 3679);
eq('listicle share', pct1(urls.filter((r) => r.classification === 'LISTICLE').reduce((a, r) => a + r.citation_count, 0) / cites), 47.5);

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
if (days[0].date !== '2026-04-08' || days.at(-1).date !== '2026-09-28' || days.length !== 174) throw new Error(`daily series must run 8 Apr → 28 Sep (174), got ${days[0].date} → ${days.at(-1).date} (${days.length})`);

/* ── Copy ───────────────────────────────────────────────────────────── */
const mainBody = readFileSync(join(here, 'loudface-mainBody-2026-09-29.html'), 'utf8').trim();
const draft = readFileSync(`${DRAFT}.md`, 'utf8').trim();
if (mainBody !== draft) throw new Error('mainBody file differs from the verified draft in content-engine');
const faq = J(`${DRAFT}.faq.json`).faq;
const paragraphSummary = readFileSync(`${DRAFT}.lede.txt`, 'utf8').trim();
const F = J(`${DRAFT}.fields.json`);
const allCopy = mainBody + paragraphSummary + JSON.stringify(faq) + JSON.stringify(F);
if (/—/.test(allCopy)) throw new Error('em dash in copy');
// 15.3% and 1–22 Sep stay only in the sentence that explains the cut (brief F28).
for (const stale of ['to 15.3%', '5th of', '28.3%', '9.5%', '24.8%', '0.06% to 18.0%', '8,068', '729', 'four agencies ahead', 'recovered after the cut']) {
  if (allCopy.includes(stale)) throw new Error(`stale figure "${stale}" in copy`);
}

const MONTH_LABELS = [['apr', 'Apr', '0.13%'], ['may', 'May', '2.9%'], ['jun', 'Jun', '8.3%'], ['jul', 'Jul', '6.0%'], ['aug', 'Aug', '12.3%'], ['sep', 'Sep', '21.5%']];
const growthCurve = MONTH_LABELS.map(([k, label, dv]) => ({ _key: `gc-${k}`, _type: 'object', label, value: Math.max(1, Math.round((vis[k] / vis.sep) * 100)), displayValue: dv }));
const r4 = (x) => Math.round(x * 10000) / 10000;

const patch = {
  name: F.name,
  paragraphSummary,
  result1Number: F.result1Number, result1Title: F.result1Title,
  result2Number: F.result2Number, result2Title: F.result2Title,
  result3Number: F.result3Number, result3Title: F.result3Title,
  'instruments.aiSource': F.aiSource,
  'instruments.topicClimb.title': F.topicClimbTitle,
  'instruments.topicClimb.caption': F.topicClimbCaption,
  'instruments.topicClimb.points': days.map((d, i) => ({ _key: `d-${i}`, week: d.date, value: d.value })),
  'instruments.engineBeforeAfter.beforeLabel': 'Apr 2026',
  'instruments.engineBeforeAfter.afterLabel': F.engineAfterLabel,
  'instruments.engineBeforeAfter.rows': [
    { _key: 'r-0', engine: 'chatgpt', before: r4(eng('apr', E.chatgpt)), after: r4(eng('sep', E.chatgpt)) },
    { _key: 'r-1', engine: 'perplexity', before: r4(eng('apr', E.perplexity)), after: r4(eng('sep', E.perplexity)) },
    { _key: 'r-2', engine: 'googleAio', before: r4(eng('apr', E.googleAio)), after: r4(eng('sep', E.googleAio)) },
  ],
  'instruments.engineBeforeAfter.caption': F.engineCaption,
  'instruments.publishedResult.rows': F.publishedResultRows.map(([value, unit], i) => ({ _key: `r-${i}`, value, unit })),
  'instruments.publishedResult.caption': F.publishedResultCaption,
  'charts[_key=="chart-growth-curve"].data': growthCurve,
  'charts[_key=="chart-growth-curve"].title': F.growthTitle,
  'charts[_key=="chart-growth-curve"].legendPrimary': F.growthLegend,
  'charts[_key=="chart-prompts"].data': PROMPT_LABELS.map(([, label, v], i) => ({ _key: `p${i + 1}`, _type: 'object', label, value: Math.round(v), displayValue: `${v.toFixed(1)}%` })),
  'charts[_key=="chart-prompts"].title': F.promptsTitle,
  'charts[_key=="chart-engines"].data': [
    { _key: 'e1', _type: 'object', label: 'ChatGPT', value: Math.round(pct1(eng('sep', E.chatgpt))), displayValue: `${pct1(eng('sep', E.chatgpt)).toFixed(1)}%` },
    { _key: 'e2', _type: 'object', label: 'Google AI Overviews', value: Math.round(pct1(eng('sep', E.googleAio))), displayValue: `${pct1(eng('sep', E.googleAio)).toFixed(1)}%` },
    { _key: 'e3', _type: 'object', label: 'Perplexity', value: Math.round(pct1(eng('sep', E.perplexity))), displayValue: `${pct1(eng('sep', E.perplexity)).toFixed(1)}%` },
  ],
  'charts[_key=="chart-engines"].title': F.enginesTitle,
  faq,
  mainBody,
};
if (thumbAlt) patch['mainProjectImageThumbnail.alt'] = thumbAlt;
for (const [k, v] of Object.entries(patch)) if (v === undefined || v === '') throw new Error(`empty field ${k}`);

/* ── Plan / guards / write ──────────────────────────────────────────── */
console.log('Monthly non-branded visibility:', MONTH_LABELS.map(([k, l]) => `${l} ${(vis[k] * 100).toFixed(2)}%`).join(' | '));
console.log('Growth curve:', growthCurve.map((g) => `${g.label} ${g.value} ${g.displayValue}`).join(' | '));
console.log(`Daily: ${days.length} points ${days[0].date} → ${days.at(-1).date}`);

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
writeFileSync(join(here, '../backups/loudface-aeo-casestudy-pre-2026-09-29.json'), JSON.stringify(doc, null, 2));
if (thumbPath) {
  const asset = await client.assets.upload('image', readFileSync(thumbPath), { filename: 'loudface-aeo-case-study-thumbnail-2026-09-29.png', contentType: 'image/png' });
  if (asset._id === doc.mainProjectImageThumbnail?.asset?._ref) throw new Error('upload returned the old asset');
  console.log(`✓ uploaded ${asset._id}`);
  patch['mainProjectImageThumbnail.asset._ref'] = asset._id;
}
const res = await client.patch(DOC_ID).ifRevisionId(expectRev).set(patch).commit();
console.log(`✓ patched ${res._id} → _rev ${res._rev}`);
