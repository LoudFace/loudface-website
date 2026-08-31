/**
 * Move published case-study instrument charts from weekly/monthly points to
 * DAILY points.
 *
 * Reads the two reviewed staging files written on 2026-08-31:
 *   ./daily-sov.json  — Peec AI share-of-voice / visibility, one value per day
 *   ./daily-gsc.json  — Google Search Console, already indexed, one value per day
 * Nothing reaches Sanity that is not in those files.
 *
 *   node scripts/instruments/upgrade-to-daily.mjs            # dry run, prints the plan
 *   node scripts/instruments/upgrade-to-daily.mjs --write    # patches published docs
 *
 * Density is not the only thing that makes a chart readable. Delshad Legal's
 * Google chart is daily over SIX months, not twelve: its 26-27 Dec news cycle
 * is 27x a normal day and, over a full year, that one outlier sets the y-axis
 * and flattens five months of real growth. Genie Teacher's share of voice
 * stays WEEKLY for the opposite reason - a 52-day tracking gap that
 * equal-width daily bars would hide. Both calls are recorded in the staging
 * files next to the data they apply to.
 *
 * Safety:
 * - Before its first write the script saves every field it is about to touch to
 *   ./backup-pre-daily.json. Restoring is a matter of feeding that file back.
 * - It patches PUBLISHED documents, because these charts are already live. It
 *   refuses to run if a draft exists for a document, so a pending human edit is
 *   never silently overwritten.
 * - It never edits a caption or a headline figure. Those quote weekly windows
 *   and stay true at day resolution; changing them would restate a public claim,
 *   which is a human's call, not a script's.
 * - Confidentiality is unchanged: shares are 0-1 ratios and Google values are
 *   indexed to a named baseline. No raw click or impression count is written.
 */
import { createClient } from '@sanity/client';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const WRITE = process.argv.includes('--write');

const known = new Set(['--write']);
for (const a of process.argv.slice(2)) {
  if (!known.has(a)) {
    console.error(`Unknown flag: ${a}`);
    process.exit(1);
  }
}

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

const sov = JSON.parse(readFileSync(join(here, 'daily-sov.json'), 'utf8'));
const gsc = JSON.parse(readFileSync(join(here, 'daily-gsc.json'), 'utf8'));

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const addDays = (iso, n) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

/* Titles that still say "weekly" would contradict a daily chart. Captions are
   deliberately left alone — see the safety note in the header. */
/* A shortened window moves the baseline with it, so the title, the source line
   and the caption must all move too — a chart that says "indexed to Sep 2025"
   while starting in March is simply wrong. Only set these for a client whose
   window actually changed. */
const WINDOW_REWRITES = {
  'delshad-legal-content-engine': {
    'instruments.indexedTrend.title': 'Impressions and clicks · indexed, Mar 2026 = 100',
    'instruments.indexedTrend.baselineLabel': 'Mar 2026',
    'instruments.indexedTrend.startMonthIso': '2026-03',
    'instruments.gscSource': 'Google Search Console · indexed to Mar 2026 = 100',
    'instruments.indexedTrend.caption':
      'Daily, indexed to the average day in March 2026. The durable climb starts in May and steepens through August; August is the first 24 days.',
  },
};

const TITLE_REWRITES = {
  'delshad-legal-content-engine': 'Share of voice across 12 tracked firms, daily',
  'loudface-aeo-case-study': 'Share of AI answers naming LoudFace, daily',
  'stealth-fintech-ai-visibility': 'Share of AI answers naming the client, daily',
};

const plan = [];

for (const [key, c] of Object.entries(sov.clients)) {
  plan.push({
    slug: c.slug,
    what: `topicClimb -> ${c.values.length} daily points (${c.metric}, ${c.startDate} to ${addDays(c.startDate, c.values.length - 1)})`,
    patch: {
      'instruments.topicClimb.points': c.values.map((v, i) => ({
        _key: `d-${i}`,
        week: addDays(c.startDate, i),
        value: v,
      })),
      ...(TITLE_REWRITES[c.slug] ? { 'instruments.topicClimb.title': TITLE_REWRITES[c.slug] } : {}),
    },
  });
}

for (const [key, c] of Object.entries(gsc.clients)) {
  plan.push({
    slug: c.slug,
    what: `indexedTrend -> ${c.impressions.length} daily points (${c.startDate} to ${addDays(c.startDate, c.impressions.length - 1)}, ${c.baselineLabel} average day = 100)`,
    patch: {
      ...(WINDOW_REWRITES[c.slug] ?? {}),
      'instruments.indexedTrend.points': c.impressions.map((imp, i) => {
        const date = addDays(c.startDate, i);
        return {
          _key: `d-${i}`,
          date,
          month: MONTHS[Number(date.slice(5, 7)) - 1],
          impressions: imp,
          clicks: c.clicks[i],
        };
      }),
    },
  });
}

/* One transaction per document, so a slug's charts never land half-updated. */
const bySlug = new Map();
for (const p of plan) {
  const entry = bySlug.get(p.slug) || { slug: p.slug, whats: [], patch: {} };
  entry.whats.push(p.what);
  Object.assign(entry.patch, p.patch);
  bySlug.set(p.slug, entry);
}

const backup = {};
let blocked = 0;

for (const entry of bySlug.values()) {
  const doc = await client.fetch(
    `*[_type=="caseStudy" && slug.current==$s][0]{_id, "hasDraft": defined(*[_id=="drafts."+^._id][0]), instruments}`,
    { s: entry.slug }
  );
  if (!doc) {
    console.log(`SKIP  ${entry.slug} — no published document`);
    blocked++;
    continue;
  }
  if (doc.hasDraft) {
    console.log(`SKIP  ${entry.slug} — a draft exists; publish or discard it first`);
    blocked++;
    continue;
  }
  console.log(`\n${entry.slug}  (${doc._id})`);
  for (const w of entry.whats) console.log(`   ${w}`);

  backup[entry.slug] = {
    _id: doc._id,
    topicClimb: doc.instruments?.topicClimb ?? null,
    indexedTrend: doc.instruments?.indexedTrend ?? null,
  };

  if (WRITE) {
    await client.patch(doc._id).set(entry.patch).commit();
    console.log('   written');
  }
}

if (WRITE) {
  const path = join(here, 'backup-pre-daily.json');
  if (existsSync(path)) {
    console.log(`\nBackup already exists at ${path} — left untouched so the ORIGINAL values stay recoverable.`);
  } else {
    writeFileSync(path, JSON.stringify(backup, null, 2));
    console.log(`\nBackup of the previous values written to ${path}`);
  }
} else {
  console.log('\nDry run. Nothing was written. Re-run with --write to apply.');
}
if (blocked) console.log(`${blocked} document(s) skipped.`);
