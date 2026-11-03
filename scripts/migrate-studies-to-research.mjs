#!/usr/bin/env node
/**
 * Move the 12 original-research blog posts to /research (direction G, approved 3 Nov 2026; docs/research-section.md).
 *
 * For each study it reads the live blogPost and writes a published `research` document `research-<slug>` with
 * createOrReplace, so a rerun rewrites the same 12 documents and nothing else. The blogPost documents are only read:
 * they stay in Sanity, and `movedFromBlog` drops them from every blog list (src/lib/blog-exclusion.ts).
 *
 * Where each value comes from:
 *   - the blogPost: slug, metaTitle, metaDescription, excerpt, author, dates, faq, datasetMeta, featured, timeToRead,
 *     thumbnail, visuals, content (with the method and limits sections moved out, see SECTION_PLAN).
 *   - design-lab/research-2026-11-03/shared/research.js (copied from the live posts on 2 Nov 2026): the finding,
 *     abstract, sample, kind, series, the lead chart and the benchmark's tables (BENCH).
 *   - G-hub.html: each paper's big number (HEAD). charts-v2.js: each lead chart's label (SPEC axis).
 *   - G-paper.html: the benchmark's key numbers and its figure titles, source lines and notes.
 *   - src/app/research-v11/charts/fixtures.ts: every figure's ChartSpec (the board's charts with their axis labels
 *     and callouts), checked with the drawer's own parseChartSpec before anything is written.
 * The script prints every number in the text it writes that it cannot find in the post or in research.js.
 *
 * Run through tsx (it imports the chart fixtures and parser, which are TypeScript):
 *   SANITY_API_TOKEN=… npx tsx scripts/migrate-studies-to-research.mjs --dry-run
 *   SANITY_API_TOKEN=… npx tsx scripts/migrate-studies-to-research.mjs
 *
 * The real run reads every written document back and compares it field by field, and checks the 12 blogPost
 * documents still carry the revision they had before the write.
 */
import { createClient } from '@sanity/client';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { BENCH_FIGURE_SPECS, STUDY_CHART_SPECS } from '../src/app/research-v11/charts/fixtures.ts';
import { parseChartSpec } from '../src/app/research-v11/charts/parse.ts';

const DRY = process.argv.includes('--dry-run');
const root = resolve(import.meta.dirname, '..');
const lab = (p) => readFileSync(resolve(root, 'design-lab/research-2026-11-03', p), 'utf8');

const token = process.env.SANITY_API_TOKEN;
if (!token) {
  console.error('SANITY_API_TOKEN is not set (pass the editor token through the environment).');
  process.exit(1);
}
const client = createClient({
  projectId: 'xjjjqhgt',
  dataset: 'production',
  apiVersion: '2025-03-29',
  useCdn: false,
  token,
  perspective: 'raw',
});

/* ── The board kit's data, read from its own files ─────────────────────────────── */

const researchJs = lab('shared/research.js');
const { STUDIES, BENCH } = new Function(`${researchJs.slice(0, researchJs.indexOf('/* ----'))}; return { STUDIES, BENCH };`)();
const hubHtml = lab('G-hub.html');
const headSrc = hubHtml.match(/const HEAD = (\{[\s\S]*?\n {2}\});/);
if (!headSrc) throw new Error('G-hub.html: HEAD not found');
const HEAD = new Function(`return ${headSrc[1]};`)();
const chartsJs = lab('shared/charts-v2.js');
const AXIS = Object.fromEntries(
  [...chartsJs.matchAll(/^ {4}'?([\w-]+)'?: \{ head: \[[^\]]*\], axis: '([^']+)'/gm)].map((m) => [m[1], m[2]]),
);
const paperHtml = lab('G-paper.html');

const SERIES_OF = {
  'AI Visibility Index': 'index',
  'State of B2B SaaS': 'saas',
  'AI search behaviour': 'ai',
  Measurement: 'meas',
  Search: 'meas',
};
const KINDS = ['Study', 'Report', 'Index', 'Benchmark'];
const nf = (v) => v.toLocaleString('en-US');

/* ── Per-paper decisions, made by reading all 12 bodies (3 Nov 2026) ───────────── */

/**
 * Which body H2 sections move out of `content`. `to` is the field the section goes to; `limitsFrom` / `limitsTo`
 * (matched against a block's plain text) carve the blocks that are limitations out of a method section, so a
 * labelled limits passage lands in `limitations` while the rest stays in `methodology`.
 */
const SECTION_PLAN = {
  'do-ai-engines-recommend-the-same-agencies': [
    { h2: /^How we ran the study$/, to: 'methodology' },
    { h2: /^Limits of this study$/, to: 'limitations' },
  ],
  'how-long-does-seo-take': [
    // "What we measured: 336 new pages on 7 sites" stays in the body: it carries the headline results.
    { h2: /^Method and limits$/, to: 'methodology', limitsFrom: /^Limits\.$/ },
  ],
  'state-of-b2b-saas-seo': [
    { h2: /^How we measured it$/, to: 'methodology' },
    { h2: /^What are the limits of this data\?$/, to: 'limitations' },
  ],
  'state-of-b2b-saas-content-marketing': [
    { h2: /^How we gathered the data$/, to: 'methodology' },
    { h2: /^What are this report's limits\?$/, to: 'limitations' },
  ],
  'state-of-b2b-saas-marketing-ai-search': [{ h2: /^How we gathered the data$/, to: 'methodology' }],
  'ai-share-of-voice-formula': [
    { h2: /^How we measured this$/, to: 'methodology', limitsFrom: /^This is one category/, limitsTo: /^Related studies/ },
  ],
  'hr-tech-ai-visibility-index-2026': [
    { h2: /^How we measured this$/, to: 'methodology', limitsFrom: /^Three honest limits/ },
  ],
  'devtools-ai-visibility-index-2026': [{ h2: /^Method$/, to: 'methodology' }],
  'cybersecurity-saas-ai-visibility-index-2026': [
    { h2: /^How we measured this$/, to: 'methodology', limitsFrom: /^One honest limit/ },
  ],
  'which-ai-engine-cites-fintech-brands': [
    {
      h2: /^What we measured, and why this dataset exists$/,
      to: 'methodology',
      limitsFrom: /^One disclosure up front/,
    },
    { h2: /^Methodology and limits$/, to: 'methodology', limitsFrom: /^Small denominators/ },
  ],
  'ai-answer-gap-b2b-saas-2026': [{ h2: /^How this was measured$/, to: 'methodology' }],
  'ai-citation-benchmark-b2b-saas-2026': [
    { h2: /^How we measured this$/, to: 'methodology' },
    { h2: /^Limitations$/, to: 'limitations' },
  ],
};

/** The data window and engines, as each post states them (left out where a post does not). */
const WINDOW = {
  'do-ai-engines-recommend-the-same-agencies': ['1 to 7 October 2026', ['ChatGPT', 'Perplexity', 'Google AI Overviews']],
  'how-long-does-seo-take': ['Pages published 1 April to 23 September 2026, measured to 23 October 2026', ['Google']],
  'state-of-b2b-saas-seo': ['24 October 2026', ['Google']],
  'state-of-b2b-saas-content-marketing': [
    '25 September to 22 October 2026 (Google); 10 to 23 October 2026 (AI answers)',
    ['Google', 'ChatGPT', 'Perplexity', 'Google AI Overviews'],
  ],
  'state-of-b2b-saas-marketing-ai-search': [
    '16 to 22 October 2026 (AI answers); 1 to 21 October 2026 (Search Console)',
    ['ChatGPT', 'Perplexity', 'Google AI Overviews'],
  ],
  'ai-share-of-voice-formula': ['21 September to 18 October 2026', ['ChatGPT', 'Perplexity', 'Google AI Overviews']],
  'hr-tech-ai-visibility-index-2026': ['12 August 2026', ['ChatGPT', 'Perplexity', 'Google AI Overviews']],
  'devtools-ai-visibility-index-2026': ['7 August 2026', ['ChatGPT', 'Google']],
  'cybersecurity-saas-ai-visibility-index-2026': ['6 August 2026', ['ChatGPT', 'Google']],
  'which-ai-engine-cites-fintech-brands': ['1 May to 30 July 2026 (91 days)', ['ChatGPT', 'Perplexity', 'Google AI Overviews']],
  'ai-answer-gap-b2b-saas-2026': ['28 June to 28 July 2026', ['ChatGPT', 'Perplexity', 'Google AI Overviews']],
  'ai-citation-benchmark-b2b-saas-2026': [BENCH.window, BENCH.engines],
};

/* ── The benchmark's own figures and key numbers, as G-paper.html shows them ──── */

const reddit = BENCH.domains[0];
const [owned, comp, ugc] = BENCH.rates;
const BENCH_KEY_NUMBERS = [
  [nf(reddit[2]), `citations of ${reddit[0]}, the most-cited single domain`, `${reddit[3].toFixed(1)}% of all citations, almost twice ${BENCH.domains[1][0]} at ${BENCH.domains[1][3]}%`],
  [reddit[4].replace('ChatGPT ', ''), 'of Reddit’s citations came through ChatGPT', 'Same forum, completely different treatment depending on which engine answers'],
  [owned[1].toFixed(2), 'citations per retrieval for owned pages, the highest of any type', `Competitor pages ${comp[1].toFixed(2)}, user-generated content ${ugc[1].toFixed(2)}`],
  ['41.6–66.9%', 'company websites’ share in each of the five projects', 'The top source type in every project, so no single client carries the result'],
];

const BENCH_LEAD = {
  title: 'Share of 160,240 AI citations, by source type',
  source: 'Source: Peec AI, five live B2B SaaS projects, 30 days to 1 June 2026. Source types are Peec’s domain classification. Analysis: LoudFace',
};
const BENCH_FIGURES = (h2) => [
  {
    _key: 'domains',
    title: 'The nine most-cited domains',
    source: 'Source: Peec AI, 160,240 citations, 23,545 conversations',
    note: '“Owned” marks a project’s own domain. Two of the five brands, Toku and LoudFace, appear in the top nine on their own sites. 80.5% of reddit.com’s 11,237 citations came from ChatGPT.',
    spec: BENCH_FIGURE_SPECS.domains,
    placement: 'afterH2',
    h2Index: h2(/^Finding 2: Reddit/),
  },
  {
    _key: 'engines',
    title: 'Source mix by engine',
    source: 'Source: Peec AI, 80,608 ChatGPT, 42,147 AI Overviews and 37,485 Perplexity citations',
    note: 'Six largest source types shown; Other and Institutional (2.0% each overall) left out. A brand’s own site holds a similar share on all three, between 4.6% and 5.4%.',
    spec: BENCH_FIGURE_SPECS.engines,
    placement: 'afterH2',
    h2Index: h2(/^Finding 3: the three engines/),
  },
  {
    _key: 'rates',
    title: 'Citation rate against retrieval rate',
    source: 'Source: Peec AI, LoudFace analysis',
    note: 'By source type. Every type was cited more than it was retrieved. Owned pages show the widest gap: 2.04 against 0.775. A page can be retrieved all day and cited rarely, so getting pulled and getting quoted are separate jobs.',
    spec: BENCH_FIGURE_SPECS.rates,
    placement: 'band',
  },
];

/**
 * Where the board kit disagrees with the live post, the post wins (every number must come from the study).
 *
 * Cybersecurity index: research.js and G-hub say "14 of 24" and draw the bars out of 24, but the post's score is
 * combined as (ChatGPT named-count × 2) + Google top-10 count over 12 queries, each column "of 12", so the most a
 * vendor can score is 36 and "of 24" is not a share of anything. SentinelOne's 14 is the post's own number; the
 * headline is the post's short answer, word for word.
 */
const CORRECTIONS = {
  cyber: {
    headlineFinding:
      'Across 12 buyer-query categories measured on ChatGPT (web search) and Google, the most-named vendors are SentinelOne, Palo Alto Networks, Microsoft Defender, Wiz, and Rapid7.',
    leadNumber: { value: '14', label: 'SentinelOne’s combined score across ChatGPT and Google, the highest of the 15 vendors ranked' },
    sampleSummary: '12 buyer queries, ChatGPT and Google top 10',
    spec: { max: 36, axis: 'Combined score (ChatGPT named-count × 2 + Google top-10 count), of 36', call: 'Leads at 14' },
  },
};

/* ── HTML helpers ──────────────────────────────────────────────────────────────── */

const plain = (html) =>
  String(html ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&rsquo;/g, '’')
    .replace(/\s+/g, ' ')
    .trim();

/** Top-level blocks of an HTML fragment: each element (with its children) or run of loose text. */
function blocks(html) {
  const out = [];
  let i = 0;
  while (i < html.length) {
    if (/\s/.test(html[i])) {
      i++;
      continue;
    }
    if (html[i] !== '<') {
      const end = html.indexOf('<', i);
      out.push(html.slice(i, end < 0 ? html.length : end).trim());
      i = end < 0 ? html.length : end;
      continue;
    }
    const open = html.slice(i).match(/^<([a-zA-Z][\w-]*)\b[^>]*?(\/?)>/);
    if (!open) throw new Error(`unparsable HTML at ${html.slice(i, i + 60)}`);
    const tag = open[1].toLowerCase();
    if (open[2] === '/' || ['br', 'hr', 'img', 'input', 'meta', 'link'].includes(tag)) {
      out.push(open[0]);
      i += open[0].length;
      continue;
    }
    const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'gi');
    re.lastIndex = i;
    let depth = 0;
    let m;
    let end = -1;
    while ((m = re.exec(html))) {
      depth += m[1] ? -1 : 1;
      if (depth === 0) {
        end = m.index + m[0].length;
        break;
      }
    }
    if (end < 0) throw new Error(`unclosed <${tag}> at ${html.slice(i, i + 60)}`);
    out.push(html.slice(i, end));
    i = end;
  }
  return out;
}

/** Split a body at its H2s: [{ h2: text | null, blocks }], the first entry being whatever precedes the first H2. */
function sections(html) {
  const out = [{ h2: null, blocks: [] }];
  for (const block of blocks(html)) {
    if (/^<h2\b/i.test(block)) out.push({ h2: plain(block), blocks: [block] });
    else out[out.length - 1].blocks.push(block);
  }
  return out;
}

/* ── Build one research document ───────────────────────────────────────────────── */

function build(post, study) {
  const slug = post.slug.current;
  const plan = SECTION_PLAN[slug];
  if (!plan) throw new Error(`${slug}: no section plan`);
  const secs = sections(post.content || '');
  const moved = { methodology: [], limitations: [] };
  const log = [];
  const removedH2 = [];
  const kept = [];
  secs.forEach((sec, index) => {
    const rule = sec.h2 && plan.find((p) => p.h2.test(sec.h2));
    if (!rule) {
      kept.push(sec);
      return;
    }
    removedH2.push(index); // 1-based H2 number (section 0 is the preamble)
    const body = sec.blocks.slice(1); // the H2 itself is dropped: the field has its own heading on the page
    let inLimits = false;
    const parts = { methodology: [], limitations: [] };
    for (const block of body) {
      const text = plain(block);
      if (rule.limitsFrom && rule.limitsFrom.test(text)) inLimits = true;
      else if (rule.limitsTo && rule.limitsTo.test(text)) inLimits = false;
      parts[inLimits ? 'limitations' : rule.to].push(block);
    }
    if (rule.limitsFrom && parts.limitations.length === 0) throw new Error(`${slug}: "${sec.h2}" has no block matching ${rule.limitsFrom}`);
    for (const field of ['methodology', 'limitations']) {
      if (parts[field].length) {
        moved[field].push(...parts[field]);
        log.push(`${field} ← H2 "${sec.h2}"${rule.limitsFrom ? ` (${parts[field].length} of ${body.length} blocks)` : ''}`);
      }
    }
  });
  for (const p of plan) if (!secs.some((s) => s.h2 && p.h2.test(s.h2))) throw new Error(`${slug}: no H2 matches ${p.h2}`);

  const content = kept.flatMap((s) => s.blocks).join('\n');
  const h2s = kept.filter((s) => s.h2).map((s) => s.h2);
  const h2 = (re) => {
    const i = h2s.findIndex((t) => re.test(t));
    if (i < 0) throw new Error(`${slug}: no remaining H2 matches ${re}`);
    return i;
  };

  // Blog visuals sit after the nth H2 (1-based); shift them past the removed sections.
  const visuals = (post.visuals || []).map((v) => {
    if (v.position?.anchor !== 'after-h2') return v;
    const old = v.position.h2Index;
    if (removedH2.includes(old)) throw new Error(`${slug}: visual ${v._key} sat after a section that moved out`);
    return { ...v, position: { ...v.position, h2Index: old - removedH2.filter((r) => r < old).length } };
  });

  const series = SERIES_OF[study.series];
  if (!series) throw new Error(`${slug}: unknown series ${study.series}`);
  if (!KINDS.includes(study.kind)) throw new Error(`${slug}: unknown kind ${study.kind}`);

  const head = HEAD[study.id];
  if (!head) throw new Error(`${slug}: no HEAD number in G-hub.html`);
  const axis = AXIS[study.id];
  if (!axis) throw new Error(`${slug}: no SPEC axis in charts-v2.js`);
  const isBench = study.id === 'bench';
  const fix = CORRECTIONS[study.id] ?? {};
  const [dataWindow, engines] = WINDOW[slug] ?? [];

  const leadSpec = STUDY_CHART_SPECS[study.id];
  if (!leadSpec) throw new Error(`${slug}: no STUDY_CHART_SPECS entry for ${study.id}`);
  const lead = {
    _key: 'lead',
    _type: 'researchFigure',
    title: isBench ? BENCH_LEAD.title : axis,
    source: isBench ? BENCH_LEAD.source : `Source: LoudFace research, ${fix.sampleSummary ?? study.n}`,
    spec: JSON.stringify({ ...leadSpec, ...fix.spec }),
    placement: 'lead',
  };
  const extra = isBench
    ? BENCH_FIGURES(h2).map((f) => ({ ...f, _type: 'researchFigure', spec: JSON.stringify(f.spec) }))
    : [];
  // Every stored spec must pass the drawer's own parser, unchanged.
  for (const f of [lead, ...extra]) {
    try {
      const parsed = parseChartSpec(f.spec);
      if (JSON.stringify(parsed) !== f.spec) throw new Error('parsed spec differs from the stored text');
    } catch (error) {
      throw new Error(`${slug}, figure ${f._key}: ${error.message}`);
    }
  }

  const date = String(post.publishedDate).slice(0, 10);
  const doc = {
    _id: `research-${slug}`,
    _type: 'research',
    name: study.finding,
    paperTitle: post.name,
    slug: { _type: 'slug', current: slug },
    movedFromBlog: slug,
    series,
    kind: study.kind,
    headlineFinding: fix.headlineFinding ?? study.abstract,
    leadNumber: fix.leadNumber ?? { value: head[0], label: head[1] },
    ...(isBench
      ? { keyNumbers: BENCH_KEY_NUMBERS.map(([value, label, note], i) => ({ _key: `key-${i + 1}`, _type: 'researchNumber', value, label, note })) }
      : {}),
    figures: [lead, ...extra],
    sampleSummary: fix.sampleSummary ?? study.n,
    ...(dataWindow ? { dataWindow } : {}),
    ...(engines ? { engines } : {}),
    versions: [{ _key: 'v1', _type: 'researchVersion', version: '1', date, note: 'First published' }],
    excerpt: post.excerpt,
    content,
    ...(moved.methodology.length ? { methodology: moved.methodology.join('\n') } : {}),
    ...(moved.limitations.length ? { limitations: moved.limitations.join('\n') } : {}),
    authors: post.author?._ref ? [{ _key: 'author-1', _type: 'reference', _ref: post.author._ref }] : [],
    publishedDate: post.publishedDate,
    ...(post.lastUpdated ? { lastUpdated: post.lastUpdated } : {}),
    featured: Boolean(post.featured),
    ...(post.metaTitle ? { metaTitle: post.metaTitle } : {}),
    ...(post.metaDescription ? { metaDescription: post.metaDescription } : {}),
    ...(post.timeToRead !== undefined ? { timeToRead: String(post.timeToRead) } : {}),
    ...(post.faq?.length ? { faq: post.faq } : {}),
    ...(post.datasetMeta ? { datasetMeta: (({ _type, ...rest }) => rest)(post.datasetMeta) } : {}),
    ...(post.thumbnail ? { thumbnail: post.thumbnail } : {}),
    ...(visuals.length ? { visuals } : {}),
  };
  if (doc.headlineFinding.length < 40 || doc.headlineFinding.length > 320) {
    throw new Error(`${slug}: headlineFinding is ${doc.headlineFinding.length} characters (40 to 320)`);
  }
  return { doc, log, h2s };
}

/* ── Checks: every number written must exist in the post or in research.js ────── */

const norm = (s) => String(s).replace(/(\d),(?=\d{3}\b)/g, '$1').replace(/[’‘]/g, "'");
function missingNumbers(doc, post) {
  const hay = norm([post.name, post.metaTitle, post.excerpt, post.directAnswer, post.content, JSON.stringify(post.faq || []), researchJs].join(' '));
  const written = [
    doc.name,
    doc.headlineFinding,
    doc.sampleSummary,
    doc.leadNumber.value,
    doc.leadNumber.label,
    doc.dataWindow,
    ...(doc.keyNumbers || []).flatMap((k) => [k.value, k.label, k.note]),
    ...doc.figures.flatMap((f) => {
      const spec = JSON.parse(f.spec);
      return [f.title, f.source, f.note, spec.axis, spec.call, ...(spec.rows || []).flat(2).filter((c) => typeof c === 'string')];
    }),
  ].filter(Boolean);
  const tokens = new Set(written.flatMap((t) => norm(t).match(/\d+(?:\.\d+)?/g) || []));
  return [...tokens].filter((n) => !new RegExp(`(^|[^\\d.])${n.replace('.', '\\.')}(?![\\d])`).test(hay));
}

function leadInStudy(doc, post) {
  const text = norm(plain([post.name, post.excerpt, post.directAnswer, post.content].join(' '))).toLowerCase();
  const v = norm(doc.leadNumber.value).toLowerCase();
  if (text.includes(v)) return 'verbatim';
  const words = { 4: 'four', 12: '12' };
  const nums = v.match(/\d+(?:\.\d+)?/g) || [];
  const all = nums.every((n) => text.includes(n) || (words[n] && text.includes(words[n])));
  return all ? `numbers present (${nums.join(', ')})` : 'NOT FOUND';
}

/* ── Run ───────────────────────────────────────────────────────────────────────── */

const slugs = STUDIES.map((s) => s.src);
const posts = await client.fetch(`*[_type == "blogPost" && slug.current in $slugs]`, { slugs });
if (posts.some((p) => p._id.startsWith('drafts.'))) throw new Error('a draft of a study exists; publish or discard it first');
if (posts.length !== 12) throw new Error(`expected 12 blog posts, found ${posts.length}`);
const blogRevs = Object.fromEntries(posts.map((p) => [p._id, [p._rev, p._updatedAt]]));

const built = STUDIES.map((study) => {
  const post = posts.find((p) => p.slug.current === study.src);
  if (!post) throw new Error(`${study.src}: blog post not found`);
  return { study, post, ...build(post, study) };
});

let problems = 0;
for (const { doc, log, post, h2s } of built) {
  const missing = missingNumbers(doc, post);
  const lead = leadInStudy(doc, post);
  if (missing.length || lead === 'NOT FOUND') problems++;
  console.log(`\n${doc._id}  [${doc.series} · ${doc.kind}]`);
  console.log(`  name:        ${doc.name}`);
  console.log(`  paperTitle:  ${doc.paperTitle}`);
  console.log(`  lead number: ${doc.leadNumber.value} — ${doc.leadNumber.label}  (in study: ${lead})`);
  console.log(`  headline:    ${doc.headlineFinding.length} chars`);
  console.log(`  sample:      ${doc.sampleSummary}${doc.dataWindow ? `  |  window: ${doc.dataWindow}` : ''}${doc.engines ? `  |  engines: ${doc.engines.join(', ')}` : ''}`);
  console.log(`  figures:     ${doc.figures.map((f) => `${f._key}=${JSON.parse(f.spec).type}@${f.placement}${f.h2Index !== undefined ? `[${f.h2Index}: ${h2s[f.h2Index]}]` : ''}`).join(', ')}`);
  if (doc.keyNumbers) console.log(`  key numbers: ${doc.keyNumbers.map((k) => k.value).join(' / ')}`);
  console.log(`  moved:       ${log.length ? log.join('; ') : 'nothing'}`);
  if (!doc.methodology) console.log('  methodology: EMPTY (no method section in the body)');
  if (!doc.limitations) console.log('  limitations: EMPTY (no limits section in the body)');
  console.log(`  body:        ${(post.content || '').length} → ${doc.content.length} chars, ${h2s.length} H2s left${doc.visuals ? `, ${doc.visuals.length} blog visual(s) kept` : ''}`);
  console.log(`  keyTakeaways: none ("Key takeaways" list not in the body)`);
  if (missing.length) console.log(`  !! numbers not found in the post or research.js: ${missing.join(', ')}`);
}
if (problems) {
  console.error(`\n${problems} paper(s) have numbers that could not be traced. Nothing written.`);
  process.exit(1);
}

if (DRY) {
  console.log('\nDry run: nothing written.');
  process.exit(0);
}

const tx = client.transaction();
for (const { doc } of built) tx.createOrReplace(doc);
const result = await tx.commit({ visibility: 'sync' });
console.log(`\nWrote ${result.results.length} research documents (transaction ${result.transactionId}).`);

/* ── Read back ─────────────────────────────────────────────────────────────────── */

const SYSTEM = new Set(['_rev', '_createdAt', '_updatedAt']);
const strip = (doc) => Object.fromEntries(Object.entries(doc).filter(([k]) => !SYSTEM.has(k)));
const back = await client.fetch(`*[_id in $ids]`, { ids: built.map((b) => b.doc._id) });
let bad = 0;
for (const { doc } of built) {
  const live = back.find((d) => d._id === doc._id);
  if (!live) {
    bad++;
    console.error(`  ${doc._id}: not found on read-back`);
    continue;
  }
  const want = strip(doc);
  const got = strip(live);
  const fields = new Set([...Object.keys(want), ...Object.keys(got)]);
  const diff = [...fields].filter((f) => !isDeepStrictEqual(want[f], got[f]));
  if (diff.length) {
    bad++;
    console.error(`  ${doc._id}: read-back differs in ${diff.join(', ')}`);
  } else console.log(`  ${doc._id}: ${Object.keys(want).length} fields read back equal`);
}
const drafts = await client.fetch(`count(*[_id in $ids])`, { ids: built.map((b) => `drafts.${b.doc._id}`) });
if (drafts) {
  bad++;
  console.error(`  ${drafts} draft(s) of the research documents exist`);
}
const after = await client.fetch(`*[_id in $ids]{ _id, _rev, _updatedAt }`, { ids: Object.keys(blogRevs) });
for (const p of after) {
  const [rev, updated] = blogRevs[p._id];
  if (p._rev !== rev || p._updatedAt !== updated) {
    bad++;
    console.error(`  ${p._id}: blog post changed (${rev} → ${p._rev})`);
  }
}
if (after.length !== 12) bad++;
console.log(bad ? `\nRead-back FAILED (${bad} problem(s)).` : `\nRead-back OK: 12 research documents equal what was written; 12 blog posts untouched (same _rev).`);
process.exit(bad ? 1 : 0);
