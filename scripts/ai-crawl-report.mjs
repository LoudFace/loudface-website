#!/usr/bin/env node
/**
 * AI crawl report — programmatic alternative to the Cloudflare AI Crawl Control dashboard.
 *
 * Why this exists:
 *   The /ai-audit REST API returns aiaudit.api.error.not_found on Free plan and the
 *   dashboard UI is locked to 1h / 24h windows. The standard zone analytics dataset
 *   (httpRequestsAdaptiveGroups) IS exposed on Free plan and accepts up to 7 days
 *   of history. We query that and identify AI bots client-side by matching user-agent
 *   substrings against a static registry.
 *
 * Requires (in .env.local):
 *   CLOUDFLARE_ANALYTICS_TOKEN  — token with Zone Analytics:Read (scope to loudface.co)
 *   CLOUDFLARE_ZONE_ID          — optional, defaults to loudface.co's zone
 *
 * Usage:
 *   node scripts/ai-crawl-report.mjs              # last 24h, AI bots only
 *   node scripts/ai-crawl-report.mjs --hours 1    # last hour
 *   node scripts/ai-crawl-report.mjs --hours 168  # last 7 days (Free-plan max)
 *   node scripts/ai-crawl-report.mjs --json       # raw JSON (no formatting)
 *   node scripts/ai-crawl-report.mjs --paths      # also show top crawled paths per bot
 *   node scripts/ai-crawl-report.mjs --all-bots   # include non-AI bot UAs in output too
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = '/Users/arnel/Code Projects/LoudFace Agency/loudface-website';
const DEFAULT_ZONE_ID = '4b257ce477819eaf51db086503ee796b'; // loudface.co

// --- arg parsing ---
const args = process.argv.slice(2);
const argHours = (() => { const i = args.indexOf('--hours'); return i >= 0 ? Number(args[i + 1]) : 24; })();
const argJson = args.includes('--json');
const argPaths = args.includes('--paths');
const argAllBots = args.includes('--all-bots');
const argDemand = args.includes('--demand');
const argHelp = args.includes('-h') || args.includes('--help');

if (argHelp) {
  console.log(`AI crawl report
Usage:
  node scripts/ai-crawl-report.mjs [--hours N] [--json] [--paths] [--all-bots] [--demand]
Flags:
  --hours N      Lookback window in hours (default 24, max 24 on Free plan).
                 Cloudflare caps zone-level httpRequestsAdaptiveGroups at 1
                 day per query on Free plan. For longer windows, upgrade.
  --json         Output raw JSON
  --paths        Include top crawled paths per bot
  --all-bots     Include non-AI bots in output (verified bots like Bing/Google still classified as AI)
  --demand       Mine 4xx/5xx fetches from AI bots — URLs the model thinks should exist
                 on the domain but don't. Glasp pattern: each repeated 404 from
                 ChatGPT-User is a content idea the model is asking you to publish.
`);
  process.exit(0);
}

if (!Number.isFinite(argHours) || argHours < 1 || argHours > 24) {
  console.error(`Invalid --hours: ${argHours}. Must be 1–24 (Free plan cap).`);
  process.exit(1);
}

// --- env load ---
const env = (() => {
  try {
    const raw = fs.readFileSync(path.join(ROOT, '.env.local'), 'utf8');
    return Object.fromEntries(
      raw.split('\n')
        .map(l => l.trim().match(/^([A-Z0-9_]+)=(.*)$/))
        .filter(Boolean)
        .map(m => [m[1], m[2].replace(/^"(.*)"$/, '$1')])
    );
  } catch { return {}; }
})();

const TOKEN = env.CLOUDFLARE_ANALYTICS_TOKEN || process.env.CLOUDFLARE_ANALYTICS_TOKEN;
const ZONE_ID = env.CLOUDFLARE_ZONE_ID || process.env.CLOUDFLARE_ZONE_ID || DEFAULT_ZONE_ID;

if (!TOKEN) {
  console.error(`Missing CLOUDFLARE_ANALYTICS_TOKEN in .env.local.

Create a token at https://dash.cloudflare.com/profile/api-tokens with:
  Permissions: Zone → Analytics → Read
  Zone Resources: Include → Specific zone → loudface.co
Then add to .env.local:
  CLOUDFLARE_ANALYTICS_TOKEN="<token>"
`);
  process.exit(1);
}

// --- AI bot registry ---
// UA substring (lowercased) → { operator, bot }
// Order matters: more specific patterns first.
const AI_BOTS = [
  // OpenAI
  ['oai-searchbot', { operator: 'OpenAI', bot: 'OAI-SearchBot' }],
  ['chatgpt-user', { operator: 'OpenAI', bot: 'ChatGPT-User' }],
  ['gptbot',       { operator: 'OpenAI', bot: 'GPTBot' }],
  // Anthropic
  ['claudebot',    { operator: 'Anthropic', bot: 'ClaudeBot' }],
  ['claude-web',   { operator: 'Anthropic', bot: 'Claude-Web' }],
  ['claude-searchbot', { operator: 'Anthropic', bot: 'Claude-SearchBot' }],
  ['claude-user',  { operator: 'Anthropic', bot: 'Claude-User' }],
  // Google
  ['google-extended', { operator: 'Google', bot: 'Google-Extended' }],
  ['googlebot',    { operator: 'Google', bot: 'Googlebot' }],
  ['googleother',  { operator: 'Google', bot: 'GoogleOther' }],
  // Microsoft
  ['bingbot',      { operator: 'Microsoft', bot: 'BingBot' }],
  ['adidxbot',     { operator: 'Microsoft', bot: 'AdIdxBot' }],
  // Meta
  ['meta-externalagent',   { operator: 'Meta', bot: 'Meta-ExternalAgent' }],
  ['meta-externalfetcher', { operator: 'Meta', bot: 'Meta-ExternalFetcher' }],
  ['facebookbot',  { operator: 'Meta', bot: 'FacebookBot' }],
  // Perplexity
  ['perplexitybot', { operator: 'Perplexity', bot: 'PerplexityBot' }],
  ['perplexity-user', { operator: 'Perplexity', bot: 'Perplexity-User' }],
  // ByteDance
  ['bytespider',   { operator: 'ByteDance', bot: 'Bytespider' }],
  ['tiktokspider', { operator: 'ByteDance', bot: 'TikTokSpider' }],
  // Apple
  ['applebot',     { operator: 'Apple', bot: 'Applebot' }],
  // Amazon
  ['amazonbot',    { operator: 'Amazon', bot: 'Amazonbot' }],
  // Huawei
  ['petalbot',     { operator: 'Huawei', bot: 'PetalBot' }],
  // DuckDuckGo
  ['duckassistbot', { operator: 'DuckDuckGo', bot: 'DuckAssistBot' }],
  ['duckduckbot',   { operator: 'DuckDuckGo', bot: 'DuckDuckBot' }],
  // You.com
  ['youbot',       { operator: 'You.com', bot: 'YouBot' }],
  // Mistral
  ['mistralai-user', { operator: 'Mistral', bot: 'MistralAI-User' }],
  ['mistral',      { operator: 'Mistral', bot: 'Mistral' }],
  // Cohere
  ['cohere-ai',    { operator: 'Cohere', bot: 'Cohere-AI' }],
  // AllenAI
  ['ai2bot',       { operator: 'AllenAI', bot: 'AI2Bot' }],
  // Diffbot
  ['diffbot',      { operator: 'Diffbot', bot: 'Diffbot' }],
  // Common Crawl
  ['ccbot',        { operator: 'CommonCrawl', bot: 'CCBot' }],
  // Bing Preview
  ['bingpreview',  { operator: 'Microsoft', bot: 'BingPreview' }],
  // Yandex
  ['yandexbot',    { operator: 'Yandex', bot: 'YandexBot' }],
  // Last-ditch generic catch-all
  ['chatgpt',      { operator: 'OpenAI', bot: 'ChatGPT (other)' }],
];

function classifyBot(ua) {
  if (!ua) return null;
  const lower = ua.toLowerCase();
  for (const [needle, meta] of AI_BOTS) {
    if (lower.includes(needle)) return meta;
  }
  return null;
}

// --- GraphQL query ---
// Compute since/until from a SINGLE timestamp and shave a second off `until`
// to guarantee the query range is strictly less than `argHours` (Cloudflare's
// 1d quota check on Free plan rejects ranges that overshoot by even 1ms).
const NOW_MS = Date.now();
const SAFETY_PAD_MS = 1000; // 1s
const since = new Date(NOW_MS - argHours * 3600 * 1000).toISOString();
const until = new Date(NOW_MS - SAFETY_PAD_MS).toISOString();

async function gql(query, variables) {
  const r = await fetch('https://api.cloudflare.com/client/v4/graphql', {
    method: 'POST',
    headers: {
      'authorization': `Bearer ${TOKEN}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });
  const text = await r.text();
  if (r.status !== 200) {
    throw new Error(`GraphQL HTTP ${r.status}: ${text.slice(0, 600)}`);
  }
  const j = JSON.parse(text);
  if (j.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(j.errors, null, 2).slice(0, 1200)}`);
  }
  return j.data;
}

// --- Main query: bot/userAgent breakdown ---
const botQuery = `
  query($zoneTag: String!, $since: Time!, $until: Time!) {
    viewer {
      zones(filter: { zoneTag: $zoneTag }) {
        httpRequestsAdaptiveGroups(
          limit: 5000,
          filter: { datetime_geq: $since, datetime_leq: $until }
        ) {
          count
          dimensions {
            userAgent
            edgeResponseStatus
          }
        }
      }
    }
  }`;

// Per-bot path query (only fired when --paths)
const pathQuery = `
  query($zoneTag: String!, $since: Time!, $until: Time!, $ua: string!) {
    viewer {
      zones(filter: { zoneTag: $zoneTag }) {
        httpRequestsAdaptiveGroups(
          limit: 50,
          filter: { datetime_geq: $since, datetime_leq: $until, userAgent: $ua }
        ) {
          count
          dimensions { clientRequestPath edgeResponseStatus }
        }
      }
    }
  }`;

// --- Run ---
async function main() {
  const data = await gql(botQuery, { zoneTag: ZONE_ID, since, until });
  const rows = data?.viewer?.zones?.[0]?.httpRequestsAdaptiveGroups || [];

  // Aggregate
  const byBot = new Map(); // botKey -> { operator, bot, total, allowed, unsuccessful, userAgents:Set, exampleUA }
  const byUA = new Map();  // ua -> { ua, total, classification }
  let totalAi = 0;
  let totalAll = 0;

  for (const row of rows) {
    const ua = row.dimensions?.userAgent || '';
    const status = row.dimensions?.edgeResponseStatus ?? 0;
    const count = row.count || 0;
    totalAll += count;

    const cls = classifyBot(ua);
    if (cls) {
      totalAi += count;
      const key = `${cls.operator}/${cls.bot}`;
      const cur = byBot.get(key) || {
        operator: cls.operator,
        bot: cls.bot,
        total: 0,
        allowed: 0,
        unsuccessful: 0,
        userAgents: new Set(),
        exampleUA: ua,
      };
      cur.total += count;
      if (status >= 200 && status < 400) cur.allowed += count;
      else cur.unsuccessful += count;
      cur.userAgents.add(ua);
      byBot.set(key, cur);
    }

    const u = byUA.get(ua) || { ua, total: 0, classification: cls };
    u.total += count;
    byUA.set(ua, u);
  }

  // --- Demand mining: unsuccessful AI bot fetches ---
  // Glasp's "404s as latent demand" pattern. Run a separate query filtered to
  // edgeResponseStatus >= 400, grouped by path + userAgent + status. Each
  // repeated 4xx/5xx from an answer-surface bot is a URL the model thinks
  // should exist but doesn't — a content idea we haven't published yet.
  let demandSignal = null;
  if (argDemand) {
    const demandQuery = `
      query($zoneTag: String!, $since: Time!, $until: Time!) {
        viewer {
          zones(filter: { zoneTag: $zoneTag }) {
            httpRequestsAdaptiveGroups(
              limit: 5000,
              filter: {
                datetime_geq: $since,
                datetime_leq: $until,
                edgeResponseStatus_gt: 399
              }
            ) {
              count
              dimensions { clientRequestPath userAgent edgeResponseStatus }
            }
          }
        }
      }`;
    const demandData = await gql(demandQuery, { zoneTag: ZONE_ID, since, until });
    const demandRows = demandData?.viewer?.zones?.[0]?.httpRequestsAdaptiveGroups || [];

    // Group by path + status, but track which bots requested it
    const byPath = new Map();
    let totalAiUnsuccessful = 0;
    for (const row of demandRows) {
      const ua = row.dimensions?.userAgent || '';
      const cls = classifyBot(ua);
      if (!cls) continue; // demand mining only cares about AI bots
      const path = row.dimensions?.clientRequestPath || '/';
      const status = row.dimensions?.edgeResponseStatus ?? 0;
      const count = row.count || 0;
      totalAiUnsuccessful += count;
      const key = `${path}::${status}`;
      const cur = byPath.get(key) || { path, status, total: 0, bots: new Map() };
      cur.total += count;
      const botKey = `${cls.operator}/${cls.bot}`;
      cur.bots.set(botKey, (cur.bots.get(botKey) || 0) + count);
      byPath.set(key, cur);
    }
    demandSignal = {
      totalAiUnsuccessful,
      topUnsuccessful: [...byPath.values()]
        .sort((a, b) => b.total - a.total)
        .slice(0, 30)
        .map(d => ({
          path: d.path,
          status: d.status,
          total: d.total,
          bots: [...d.bots.entries()].map(([k, v]) => ({ bot: k, count: v })).sort((a, b) => b.count - a.count),
        })),
    };
  }

  // Top crawled paths per bot (optional)
  let pathsByBot = null;
  if (argPaths) {
    pathsByBot = {};
    const topBots = [...byBot.entries()]
      .sort(([, a], [, b]) => b.total - a.total)
      .slice(0, 5); // only fetch paths for top 5 bots to limit API calls
    for (const [key, meta] of topBots) {
      // Use the most-common UA for this bot as the filter
      const ua = [...meta.userAgents][0];
      try {
        const pd = await gql(pathQuery, { zoneTag: ZONE_ID, since, until, ua });
        const prows = pd?.viewer?.zones?.[0]?.httpRequestsAdaptiveGroups || [];
        const byPath = new Map();
        for (const p of prows) {
          const path = p.dimensions?.clientRequestPath || '/';
          byPath.set(path, (byPath.get(path) || 0) + p.count);
        }
        pathsByBot[key] = [...byPath.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([path, count]) => ({ path, count }));
      } catch (e) {
        pathsByBot[key] = [{ error: e.message }];
      }
    }
  }

  // --- Output ---
  const result = {
    window: { hours: argHours, since, until },
    zone: ZONE_ID,
    totals: { allRequests: totalAll, aiRequests: totalAi, aiPct: totalAll ? +(totalAi / totalAll * 100).toFixed(2) : 0 },
    bots: [...byBot.values()]
      .sort((a, b) => b.total - a.total)
      .map(b => ({
        operator: b.operator,
        bot: b.bot,
        total: b.total,
        allowed: b.allowed,
        unsuccessful: b.unsuccessful,
        userAgents: [...b.userAgents].slice(0, 5),
      })),
    unknownTopUAs: argAllBots
      ? [...byUA.values()].filter(u => !u.classification).sort((a, b) => b.total - a.total).slice(0, 15)
        .map(u => ({ ua: u.ua.slice(0, 120), total: u.total }))
      : undefined,
    pathsByBot,
    demandSignal,
  };

  if (argJson) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  // Markdown
  const sinceLocal = new Date(since).toLocaleString();
  const untilLocal = new Date(until).toLocaleString();
  console.log(`# AI crawl report — ${argHours}h window\n`);
  console.log(`**Zone:** \`${ZONE_ID}\` (loudface.co)`);
  console.log(`**Window:** ${sinceLocal} → ${untilLocal}\n`);
  console.log(`## Summary\n`);
  console.log(`- All requests: **${result.totals.allRequests.toLocaleString()}**`);
  console.log(`- AI crawler requests: **${result.totals.aiRequests.toLocaleString()}** (${result.totals.aiPct}% of total)`);
  console.log(`- Unique AI bots: **${result.bots.length}**\n`);

  if (result.bots.length === 0) {
    console.log(`_No AI bot user-agents matched in this window._\n`);
  } else {
    console.log(`## Bots (ranked by request count)\n`);
    console.log(`| # | Operator | Bot | Total | Allowed | Unsuccessful |`);
    console.log(`|---|---|---|---:|---:|---:|`);
    result.bots.forEach((b, i) => {
      console.log(`| ${i + 1} | ${b.operator} | ${b.bot} | ${b.total.toLocaleString()} | ${b.allowed.toLocaleString()} | ${b.unsuccessful.toLocaleString()} |`);
    });
    console.log();
  }

  if (result.pathsByBot) {
    console.log(`## Top crawled paths (per top-5 bot)\n`);
    for (const [key, paths] of Object.entries(result.pathsByBot)) {
      console.log(`### ${key}\n`);
      if (paths[0]?.error) {
        console.log(`_Error: ${paths[0].error}_\n`);
        continue;
      }
      console.log(`| Path | Requests |`);
      console.log(`|---|---:|`);
      for (const p of paths) {
        console.log(`| \`${p.path}\` | ${p.count.toLocaleString()} |`);
      }
      console.log();
    }
  }

  if (result.unknownTopUAs && result.unknownTopUAs.length > 0) {
    console.log(`## Top unclassified user-agents (non-AI bots, --all-bots)\n`);
    console.log(`| UA (truncated) | Requests |`);
    console.log(`|---|---:|`);
    for (const u of result.unknownTopUAs) {
      console.log(`| \`${u.ua}\` | ${u.total.toLocaleString()} |`);
    }
    console.log();
  }

  if (result.demandSignal) {
    const d = result.demandSignal;
    console.log(`## Demand signal — AI bot 4xx/5xx (URLs the model thinks should exist)\n`);
    console.log(`Total unsuccessful AI bot requests in window: **${d.totalAiUnsuccessful.toLocaleString()}**\n`);
    if (d.topUnsuccessful.length === 0) {
      console.log(`_No unsuccessful AI bot requests in this window._\n`);
    } else {
      console.log(`Top 30 URLs by request count (Glasp pattern: each repeated 404 from an answer-surface bot is a content idea waiting to be published):\n`);
      console.log(`| # | Path | Status | Total | Top requesting bots |`);
      console.log(`|---|---|---:|---:|---|`);
      d.topUnsuccessful.forEach((u, i) => {
        const botSummary = u.bots.slice(0, 3).map(b => `${b.bot} (${b.count})`).join(', ');
        const pathTrunc = u.path.length > 90 ? u.path.slice(0, 87) + '...' : u.path;
        console.log(`| ${i + 1} | \`${pathTrunc}\` | ${u.status} | ${u.total.toLocaleString()} | ${botSummary} |`);
      });
      console.log();
    }
  }

  console.log(`---`);
  console.log(`_Source: \`httpRequestsAdaptiveGroups\` via Cloudflare GraphQL Analytics API. AI bots identified by user-agent substring matching against \`AI_BOTS\` in this script. Add new entries to that map when new crawlers appear._`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
