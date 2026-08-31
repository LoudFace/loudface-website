/**
 * Populate case-study `instruments` as Sanity DRAFTS.
 *
 * Reads the reviewed series in ./staging.json (and the TradeMomentum dataset
 * proven in dev-preview) and writes one draft per case study. Nothing is
 * published: each draft appears in Studio for Arnel to approve, which is the
 * review gate the whole pipeline hangs on.
 *
 * On-demand, not scheduled — run it when a case study needs fresh charts:
 *   node scripts/instruments/populate-drafts.mjs           # dry run, prints plan
 *   node scripts/instruments/populate-drafts.mjs --write   # writes drafts
 *
 * Safety:
 * - If a draft already exists for a document, that document is SKIPPED — a
 *   pending human edit is never clobbered by a data refresh.
 * - Eligibility was applied at staging time (see staging.json): any cell that
 *   failed the movement / span / reconciliation rules simply is not built here.
 *   LoudFace's own Google board is the standing example — clicks fell year on
 *   year, so it gets no indexedTrend.
 * - Confidentiality: series that reach the page are shares (0–1) or values
 *   already indexed to a named baseline. Raw click/impression counts stay in
 *   staging.json, which is not shipped to the browser.
 */
import { createClient } from '@sanity/client';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const WRITE = process.argv.includes('--write');

/* ── Sanity client (token from .env.local, same pattern as publish-qa-fixes) ── */
const env = Object.fromEntries(
  readFileSync(join(here, '../../.env.local'), 'utf8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
);
const client = createClient({
  projectId: 'xjjjqhgt',
  dataset: 'production',
  apiVersion: '2023-05-03',
  token: env.SANITY_API_TOKEN,
  useCdn: false,
});

const staging = JSON.parse(readFileSync(join(here, 'staging.json'), 'utf8')).clients;

/* Sanity array items need keys; derive them so reruns are stable. */
const key = (prefix, i) => ({ _key: `${prefix}-${i}` });
const weekPoints = (rows, valueKey) =>
  rows.map((r, i) => ({ ...key('pt', i), week: r.w ?? r.week, value: r[valueKey] }));

/* Index a GSC series to a named baseline month, so no raw count ships. */
const indexed = (rows, baselineM) => {
  const base = rows.find((r) => r.m === baselineM);
  return rows.map((r, i) => ({
    ...key('pt', i),
    month: r.m.slice(5),
    impressions: Math.round((r.impr / base.impr) * 100),
    clicks: Math.round((r.clicks / base.clicks) * 100),
    ...(r.partial ? { partial: true } : {}),
  }));
};

/* ── The five clients' instruments ────────────────────────────────────── */

const tm = () => {
  // Series proven on the dev-preview page; duplicated here so population has
  // one source shape. Values are the same Peec pulls recorded in
  // src/app/(site)/dev-preview/trademomentum/data.ts.
  const topic = [
    ['2026-07-06', 0.088], ['2026-07-13', 0.1322], ['2026-07-20', 0.1129], ['2026-07-27', 0.1],
    ['2026-08-03', 0.216], ['2026-08-10', 0.224], ['2026-08-17', 0.232], ['2026-08-24', 0.3333],
  ];
  const rank = [
    ['2026-05-11', 3.9], ['2026-05-18', 3.1], ['2026-05-25', 2.8], ['2026-06-01', 2.4],
    ['2026-06-08', 2.5], ['2026-06-15', 2.4], ['2026-06-22', 2.4], ['2026-06-29', 2.9],
    ['2026-07-06', 2.6], ['2026-07-13', 2.7], ['2026-07-20', 2.5], ['2026-07-27', 1.6],
    ['2026-08-03', 1.9], ['2026-08-10', 2.0], ['2026-08-17', 2.1], ['2026-08-24', 1.9],
  ];
  const gsc = [
    ['Sep', 41, 78], ['Oct', 44, 75], ['Nov', 68, 62], ['Dec', 100, 100], ['Jan', 280, 161],
    ['Feb', 339, 150], ['Mar', 577, 163], ['Apr', 479, 163], ['May', 620, 172],
    ['Jun', 1142, 379], ['Jul', 1174, 332], ['Aug', 1029, 343, true],
  ];
  return {
    aiSource: 'Peec AI · 6 Jul – 24 Aug 2026',
    gscSource: 'Google Search Console · indexed to Dec 2025 = 100',
    topicClimb: {
      title: '“Trading communities” · share of AI answers, weekly',
      caption: '8.8% to 33.3% in seven weeks — the topic the product actually sells into, not the whole account.',
      points: topic.map(([w, v], i) => ({ ...key('pt', i), week: w, value: v })),
    },
    rankOverTime: {
      label: 'Average rank when cited · lower is better',
      from: 3.9,
      to: 1.9,
      caption: 'From fourth-named to second across the engagement. Measured over 41 non-branded buyer prompts; AI names TradeMomentum on 18.',
      points: rank.map(([w, p], i) => ({ ...key('pt', i), week: w, position: p })),
    },
    engineBeforeAfter: {
      beforeLabel: 'May 2026',
      afterLabel: 'Aug 2026',
      caption: 'ChatGPT went from naming TradeMomentum in 1.4% of answers to 10.0% — a 7× lift.',
      rows: [
        { ...key('r', 0), engine: 'chatgpt', before: 0.0142, after: 0.0998 },
        { ...key('r', 1), engine: 'perplexity', before: 0.0297, after: 0.1357 },
        { ...key('r', 2), engine: 'googleAio', before: 0.0573, after: 0.1153 },
      ],
    },
    indexedTrend: {
      title: 'Impressions and clicks · indexed, Dec 2025 = 100',
      baselineLabel: 'Dec',
      startMonthIso: '2025-09',
      caption: 'August is the first 24 days only. Impressions outran clicks — the pages entered far more results before climbing high enough in them to be clicked.',
      points: gsc.map(([m, impressions, clicks, partial], i) => ({
        ...key('pt', i), month: m, impressions, clicks, ...(partial ? { partial: true } : {}),
      })),
    },
    publishedResult: {
      rows: [
        { ...key('r', 0), value: '11.7x', unit: 'impressions' },
        { ...key('r', 1), value: '7.2x', unit: 'clicks per week' },
      ],
      positionFrom: 19.4,
      positionTo: 10.8,
      caption: 'Impressions on the December baseline the page uses; clicks weekly, September to August.',
    },
  };
};

const loudface = () => {
  // Weekly visibility from the gallery dataset (same-day Peec pull).
  const vis = [
    ['2026-04-06', 0.0014], ['2026-04-13', 0.0], ['2026-04-20', 0.0012], ['2026-04-27', 0.006],
    ['2026-05-04', 0.0082], ['2026-05-11', 0.0101], ['2026-05-18', 0.032], ['2026-05-25', 0.0724],
    ['2026-06-01', 0.1004], ['2026-06-08', 0.0921], ['2026-06-15', 0.1154], ['2026-06-22', 0.0749],
    ['2026-06-29', 0.0637], ['2026-07-06', 0.0659], ['2026-07-13', 0.0649], ['2026-07-20', 0.0736],
    ['2026-07-27', 0.0884], ['2026-08-03', 0.1138], ['2026-08-10', 0.1364], ['2026-08-17', 0.1241],
  ];
  return {
    aiSource: 'Peec AI · 6 Apr – 24 Aug 2026',
    topicClimb: {
      title: 'Share of AI answers naming LoudFace, weekly',
      caption: '0.1% to a 13.6% peak in twenty weeks — the same measurement we sell, run on ourselves.',
      points: vis.map(([w, v], i) => ({ ...key('pt', i), week: w, value: v })),
    },
    // rankOverTime deliberately absent: 4.0 -> 3.1 misses the >=1.0 improvement
    // rule (see staging.json). The page's own "2.1 average position" claim
    // stays in publishedResult instead.
    engineBeforeAfter: {
      beforeLabel: 'Apr 2026',
      afterLabel: 'Aug 2026',
      caption: 'ChatGPT went from never naming us to 15.4% of answers.',
      rows: [
        { ...key('r', 0), engine: 'chatgpt', before: 0, after: 0.1543 },
        { ...key('r', 1), engine: 'perplexity', before: 0.0011, after: 0.1283 },
        { ...key('r', 2), engine: 'googleAio', before: 0.0046, after: 0.0826 },
      ],
    },
    // indexedTrend deliberately absent: our own clicks fell year on year
    // (Sep 265/wk -> Aug 177). The eligibility rule bites us too.
    publishedResult: {
      rows: [
        { ...key('r', 0), value: '0.14% → 12.78%', unit: 'AI visibility, Apr → Aug' },
        { ...key('r', 1), value: '8th of 26', unit: 'agencies tracked' },
        { ...key('r', 2), value: '2.1', unit: 'average position when cited' },
      ],
      caption: 'Peak 13.64% in the week of 10 August. Source: Peec AI.',
    },
  };
};

const genie = () => {
  const s = staging.genieTeacher;
  return {
    aiSource: 'Peec AI · 25 May – 24 Aug 2026',
    gscSource: 'Google Search Console · indexed to May 2026 = 100',
    topicClimb: {
      title: 'Share of voice across tracked AI answers, weekly',
      caption: '2.26% to 12.8%, 25 May to 24 Aug. Tracking paused 1 Jun – 13 Jul; the line bridges that gap.',
      points: weekPoints(s.sovWeekly, 'sov'),
    },
    // rankOverTime absent: 1.7 -> 1.2 is real but under the movement rule —
    // the "held 1.0–1.4 all summer" claim reads better as text.
    // engineBeforeAfter absent: ChatGPT declined May -> Aug; charting around
    // its July peak would be cherry-picking.
    indexedTrend: {
      title: 'Impressions and clicks · indexed, May 2026 = 100',
      baselineLabel: 'May',
      startMonthIso: '2026-04',
      caption: 'Impressions rose 17× from May to August; August is the first 24 days. Search Console has no data for Jan–Mar, so the series starts in April.',
      points: indexed(s.gscMonthly.filter((r) => r.m >= '2026-04'), '2026-05'),
    },
    publishedResult: {
      rows: [
        { ...key('r', 0), value: '2.26% → 12.94%', unit: 'AI share of voice, 25 May → 24 Aug' },
        { ...key('r', 1), value: '1.0–1.4', unit: 'average rank, held all summer' },
      ],
      caption: 'Source: Peec AI.',
    },
  };
};

const stealth = () => {
  const s = staging.stealthFintech;
  return {
    aiSource: 'Peec AI · 15 Jun – 24 Aug 2026',
    topicClimb: {
      title: 'Share of AI answers naming the client, weekly',
      caption: '0.53% to 11.3% in ten weeks, peaking at 10.5% on 3 Aug — in a category where the leader holds over 40% of mentions.',
      points: weekPoints(s.visibilityWeekly, 'v'),
    },
    rankOverTime: {
      label: 'Average rank when cited · lower is better',
      from: 6.0,
      to: 1.8,
      caption: 'From sixth-named to second in ten weeks.',
      points: s.visibilityWeekly.map((r, i) => ({ ...key('pt', i), week: r.w, position: r.pos })),
    },
    engineBeforeAfter: {
      beforeLabel: 'Jun 2026',
      afterLabel: 'Aug 2026',
      caption: 'Every engine climbed: ChatGPT 7.8×, Gemini 3×, Google AI Overviews 5×.',
      rows: [
        { ...key('r', 0), engine: 'chatgpt', before: 0.0069, after: 0.0538 },
        { ...key('r', 1), engine: 'gemini', before: 0.0347, after: 0.1042 },
        { ...key('r', 2), engine: 'googleAio', before: 0.0292, after: 0.1457 },
      ],
    },
    // indexedTrend absent: the site's Search Console history starts Jun 2026 —
    // three points is below the six-point rule.
    publishedResult: {
      rows: [
        { ...key('r', 0), value: '0.53% → 10.46%', unit: 'AI visibility, 15 Jun → 3 Aug peak' },
        { ...key('r', 1), value: '5th of 10', unit: 'tracked brands' },
      ],
      positionFrom: 6.0,
      positionTo: 1.6,
      caption: 'Held 8–11% through late August. Source: Peec AI.',
    },
  };
};

const delshad = () => {
  const s = staging.delshadLegal;
  return {
    aiSource: 'Peec AI · 8 Jun – 24 Aug 2026',
    gscSource: 'Google Search Console · indexed to Sep 2025 = 100',
    topicClimb: {
      title: 'Share of voice across 12 tracked firms, weekly',
      caption: '0.13% to 30.5% in eleven weeks — first of the twelve tracked employment-law firms by late August.',
      points: weekPoints(s.sovWeekly, 'sov'),
    },
    // rankOverTime absent: early weeks carry no rank (the firm was not yet
    // cited), so a series would be mostly gaps. "1.4 when cited" is text.
    engineBeforeAfter: {
      beforeLabel: 'Jun 2026',
      afterLabel: 'Aug 2026',
      caption: 'From near-zero to cited across all three engines — the split behind the share-of-voice climb.',
      rows: [
        { ...key('r', 0), engine: 'chatgpt', before: 0.0014, after: 0.0322 },
        { ...key('r', 1), engine: 'gemini', before: 0.001, after: 0.0389 },
        { ...key('r', 2), engine: 'googleAio', before: 0, after: 0.0387 },
      ],
    },
    indexedTrend: {
      title: 'Impressions and clicks · indexed, Sep 2025 = 100',
      baselineLabel: 'Sep',
      startMonthIso: '2025-09',
      caption: "December's click spike is the celebrity-case news cycle; the durable climb starts in May. August is the first 24 days.",
      points: indexed(s.gscMonthly, '2025-09'),
    },
    publishedResult: {
      rows: [
        { ...key('r', 0), value: '0.13% → 32.71%', unit: 'AI share of voice, 8 Jun → 24 Aug' },
        { ...key('r', 1), value: '1st of 12', unit: 'tracked firms' },
        { ...key('r', 2), value: '52 → 301/wk', unit: 'Google clicks, same window' },
      ],
      caption: 'Average rank 1.4 when cited. Sources: Peec AI, Google Search Console.',
    },
  };
};

const PLAN = [
  { slug: 'trademomentum-niche-aeo-organic-growth', build: tm },
  { slug: 'loudface-aeo-case-study', build: loudface },
  { slug: 'genie-teacher-organic-growth', build: genie },
  { slug: 'stealth-fintech-ai-visibility', build: stealth },
  { slug: 'delshad-legal-content-engine', build: delshad },
];

/* ── Run ──────────────────────────────────────────────────────────────── */
const slugs = PLAN.map((p) => p.slug);
const docs = await client.fetch(
  `*[_type == "caseStudy" && slug.current in $slugs && !(_id in path("drafts.**"))]`,
  { slugs }
);
const drafts = await client.fetch(
  `*[_type == "caseStudy" && slug.current in $slugs && _id in path("drafts.**")]._id`,
  { slugs }
);

for (const { slug, build } of PLAN) {
  const doc = docs.find((d) => d.slug?.current === slug);
  if (!doc) {
    console.log(`✗ ${slug}: published document not found — skipped`);
    continue;
  }
  const draftId = `drafts.${doc._id}`;
  if (drafts.includes(draftId)) {
    console.log(`! ${slug}: a draft already exists — skipped so no pending edit is clobbered`);
    continue;
  }
  const instruments = build();
  const cells = ['topicClimb', 'rankOverTime', 'engineBeforeAfter', 'indexedTrend'].filter((k) => instruments[k]);
  console.log(`${WRITE ? '→ writing' : '· plan'} ${slug}: [${cells.join(', ')}]${instruments.publishedResult ? ' + publishedResult' : ''}`);
  if (WRITE) {
    await client.createOrReplace({ ...doc, _id: draftId, instruments });
  }
}
console.log(WRITE ? '\nDrafts written. Review and publish in /studio.' : '\nDry run only — pass --write to create drafts.');
