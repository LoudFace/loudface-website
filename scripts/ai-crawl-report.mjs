#!/usr/bin/env node
// ai-crawl-report.mjs — which AI crawlers are hitting loudface.co, and how hard.
//
// The companion script for the /ai-crawl-report skill (content-engine:
// .claude/skills/ai-crawl-report/SKILL.md). The skill documented this file
// from 2026-05-26 but it was never committed — invoking the skill failed with
// MODULE_NOT_FOUND until 2026-07-28. Written to the skill's own spec.
//
// WHY GRAPHQL AND NOT /ai-audit: Cloudflare's AI Crawl Control REST endpoints
// return `aiaudit.api.error.not_found` on Free plan and its dashboard is locked
// to 1h/24h. The standard `httpRequestsAdaptiveGroups` analytics dataset IS
// exposed on Free plan, so we classify user-agents ourselves.
//
// FREE-PLAN CAP (learned the hard way, per the skill's changelog): zone-level
// httpRequestsAdaptiveGroups rejects ranges wider than 1 day with `code: quota`,
// and computing `since`/`until` from two separate Date.now() calls overshoots by
// a millisecond and is also rejected. Hence: --hours clamped to 24, both bounds
// derived from ONE timestamp, and a 1s safety pad shaved off `until`.
//
// Read-only. No Notion, no Sanity, no Cloudflare config writes.
//
// Usage:
//   node scripts/ai-crawl-report.mjs [--hours N] [--paths] [--json] [--all-bots]

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ZONE_ID = "4b257ce477819eaf51db086503ee796b"; // loudface.co
// The zone serves more than the marketing site — api.peec.ai rides on it too
// (943 requests in a sample 24h window, 2026-07-28). An unfiltered zone query
// therefore reports traffic that is NOT loudface.co under a "loudface.co"
// heading, so we scope to the site's own hosts by default. --all-hosts opts out.
const SITE_HOSTS = ["www.loudface.co", "loudface.co", "www.loudface.co:443", "loudface.co:443"];
// Cloudflare returns at most `limit` GROUPS (userAgent x status combos) and does
// NOT paginate analytics groups. Hitting the ceiling silently truncates the
// totals, so we ask for the max and shout if we land on it.
// Overridable ONLY so the truncation guard itself is testable
// (AI_CRAWL_GROUP_LIMIT=10 makes any real window trip it).
const GROUP_LIMIT = Number(process.env.AI_CRAWL_GROUP_LIMIT || 10000);
const GRAPHQL = "https://api.cloudflare.com/client/v4/graphql";
const TOKEN_VAR = "CLOUDFLARE_ANALYTICS_TOKEN";

// Matched lowercase, FIRST HIT WINS — so put specific patterns before generic
// ones (oai-searchbot before chatgpt; googleother before google).
const AI_BOTS = [
  ["oai-searchbot", { operator: "OpenAI", bot: "OAI-SearchBot" }],
  ["chatgpt-user", { operator: "OpenAI", bot: "ChatGPT-User" }],
  ["gptbot", { operator: "OpenAI", bot: "GPTBot" }],
  ["claudebot", { operator: "Anthropic", bot: "ClaudeBot" }],
  ["claude-web", { operator: "Anthropic", bot: "Claude-Web" }],
  ["claude-user", { operator: "Anthropic", bot: "Claude-User" }],
  ["claude-searchbot", { operator: "Anthropic", bot: "Claude-SearchBot" }],
  ["anthropic-ai", { operator: "Anthropic", bot: "anthropic-ai" }],
  ["perplexitybot", { operator: "Perplexity", bot: "PerplexityBot" }],
  ["perplexity-user", { operator: "Perplexity", bot: "Perplexity-User" }],
  ["google-extended", { operator: "Google", bot: "Google-Extended" }],
  ["googleother", { operator: "Google", bot: "GoogleOther" }],
  ["google-cloudvertexbot", { operator: "Google", bot: "Vertex" }],
  ["googlebot", { operator: "Google", bot: "Googlebot" }],
  ["bingbot", { operator: "Microsoft", bot: "Bingbot" }],
  ["msnbot", { operator: "Microsoft", bot: "MSNBot" }],
  ["applebot-extended", { operator: "Apple", bot: "Applebot-Extended" }],
  ["applebot", { operator: "Apple", bot: "Applebot" }],
  ["meta-externalagent", { operator: "Meta", bot: "Meta-ExternalAgent" }],
  ["meta-externalfetcher", { operator: "Meta", bot: "Meta-ExternalFetcher" }],
  ["facebookbot", { operator: "Meta", bot: "FacebookBot" }],
  ["bytespider", { operator: "ByteDance", bot: "Bytespider" }],
  ["amazonbot", { operator: "Amazon", bot: "Amazonbot" }],
  ["ccbot", { operator: "Common Crawl", bot: "CCBot" }],
  ["mistralai-user", { operator: "Mistral", bot: "MistralAI-User" }],
  ["cohere-ai", { operator: "Cohere", bot: "cohere-ai" }],
  ["youbot", { operator: "You.com", bot: "YouBot" }],
  ["duckassistbot", { operator: "DuckDuckGo", bot: "DuckAssistBot" }],
  ["petalbot", { operator: "Huawei", bot: "PetalBot" }],
  ["yandexbot", { operator: "Yandex", bot: "YandexBot" }],
  ["timpibot", { operator: "Timpi", bot: "Timpibot" }],
  ["diffbot", { operator: "Diffbot", bot: "Diffbot" }],
  ["omgili", { operator: "Webz.io", bot: "Omgilibot" }],
  ["ai2bot", { operator: "Allen Institute", bot: "AI2Bot" }],
  ["firecrawl", { operator: "Firecrawl", bot: "FirecrawlAgent" }],
];

function classify(ua) {
  const s = (ua || "").toLowerCase();
  for (const [needle, meta] of AI_BOTS) if (s.includes(needle)) return meta;
  return null;
}

function parseArgs(argv) {
  const a = { hours: 24, paths: false, json: false, allBots: false, hosts: [...SITE_HOSTS], allHosts: false };
  for (let i = 0; i < argv.length; i++) {
    const v = argv[i];
    if (v === "--hours") a.hours = Number(argv[++i]);
    else if (v.startsWith("--hours=")) a.hours = Number(v.split("=")[1]);
    else if (v === "--paths") a.paths = true;
    else if (v === "--json") a.json = true;
    else if (v === "--all-bots") a.allBots = true;
    else if (v === "--all-hosts") a.allHosts = true;
    else if (v === "--host") a.hosts = [argv[++i]];
    else if (v.startsWith("--host=")) a.hosts = [v.split("=")[1]];
    else if (v === "--help" || v === "-h") a.help = true;
    else {
      console.error(`Unknown flag: ${v}`);
      a.help = true;
    }
  }
  return a;
}

const HELP = `ai-crawl-report — AI crawler traffic for loudface.co (read-only)

  --hours N     window size, default 24. Clamped to 24: Cloudflare Free plan
                rejects zone queries wider than 1 day (code: quota).
  --paths       also show the top crawled paths for the top 5 bots
  --json        raw JSON instead of the markdown table
  --all-bots    also list the top UNCLASSIFIED user-agents (spot new bots)
  --host H      count only this host (default: the loudface.co apex + www)
  --all-hosts   count EVERY host on the zone — includes non-site hosts such as
                api.peec.ai, so totals stop being "loudface.co"
  -h, --help    this text`;

// The token lives in loudface-website/.env.local, deliberately NOT in Infisical
// (owner-local, read-only, zone-scoped). Env var wins if already exported.
function loadToken() {
  if (process.env[TOKEN_VAR]) return process.env[TOKEN_VAR];
  const envPath = resolve(dirname(fileURLToPath(import.meta.url)), "..", ".env.local");
  let raw;
  try {
    raw = readFileSync(envPath, "utf8");
  } catch {
    return null;
  }
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*(?:export\s+)?CLOUDFLARE_ANALYTICS_TOKEN\s*=\s*(.*)$/);
    if (m) return m[1].trim().replace(/^["']|["']$/g, "");
  }
  return null;
}

const SETUP = `Missing ${TOKEN_VAR}.

Create a read-only, zone-scoped token:
  1. https://dash.cloudflare.com/profile/api-tokens
  2. Create Token -> Custom token
  3. Permissions:    Zone -> Analytics -> Read
  4. Zone Resources: Include -> Specific zone -> loudface.co
  5. Add to loudface-website/.env.local:
       ${TOKEN_VAR}="<the-token>"

Keep it separate from the MCP-managed Cloudflare token (that one is for writes).`;

async function gql(token, query, variables) {
  const res = await fetch(GRAPHQL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    throw new Error(`Cloudflare returned non-JSON (HTTP ${res.status}): ${text.slice(0, 300)}`);
  }
  if (body.errors?.length) {
    const e = body.errors[0];
    const code = e.extensions?.code ? ` [${e.extensions.code}]` : "";
    // The one every caller hits eventually — make it self-explaining.
    if (String(e.message + code).toLowerCase().includes("quota")) {
      throw new Error(
        `Cloudflare rejected the range${code}: ${e.message}\n` +
          `On Free plan a zone query must span LESS than 1 day. Use --hours 24 or fewer.`
      );
    }
    throw new Error(`Cloudflare GraphQL error${code}: ${e.message}`);
  }
  if (!res.ok) throw new Error(`Cloudflare HTTP ${res.status}: ${text.slice(0, 300)}`);
  return body.data;
}

const BOT_QUERY = `
query BotTraffic($zoneTag: String!, $since: Time!, $until: Time!, $filter: ZoneHttpRequestsAdaptiveGroupsFilter_InputObject!, $limit: Int!) {
  viewer {
    zones(filter: { zoneTag: $zoneTag }) {
      httpRequestsAdaptiveGroups(
        filter: $filter
        limit: $limit
        orderBy: [count_DESC]
      ) {
        count
        dimensions { userAgent edgeResponseStatus }
      }
    }
  }
}`;

const PATH_QUERY = `
query BotPaths($zoneTag: String!, $since: Time!, $until: Time!, $filter: ZoneHttpRequestsAdaptiveGroupsFilter_InputObject!, $limit: Int!) {
  viewer {
    zones(filter: { zoneTag: $zoneTag }) {
      httpRequestsAdaptiveGroups(
        filter: $filter
        limit: $limit
        orderBy: [count_DESC]
      ) {
        count
        dimensions { userAgent clientRequestPath }
      }
    }
  }
}`;

function pct(n, total) {
  return total ? `${((n / total) * 100).toFixed(1)}%` : "—";
}

function table(rows, headers) {
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => String(r[i] ?? "").length))
  );
  const line = (cells) =>
    "| " + cells.map((c, i) => String(c ?? "").padEnd(widths[i])).join(" | ") + " |";
  return [
    line(headers),
    "|" + widths.map((w) => "-".repeat(w + 2)).join("|") + "|",
    ...rows.map(line),
  ].join("\n");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(HELP);
    return;
  }
  if (!Number.isFinite(args.hours) || args.hours <= 0) {
    console.error("--hours must be a positive number");
    process.exitCode = 1;
    return;
  }
  const clamped = args.hours > 24;
  const hours = Math.min(args.hours, 24);

  const token = loadToken();
  if (!token) {
    console.error(SETUP);
    process.exitCode = 1;
    return;
  }

  // ONE timestamp for both bounds, minus a 1s pad — two Date.now() calls drift
  // by a millisecond and Cloudflare rejects the overshoot outright.
  const now = Date.now();
  const until = new Date(now - 1000).toISOString();
  const since = new Date(now - hours * 3600 * 1000).toISOString();
  const filter = { datetime_geq: since, datetime_leq: until };
  if (!args.allHosts) filter.clientRequestHTTPHost_in = args.hosts;
  const vars = { zoneTag: ZONE_ID, since, until, filter, limit: GROUP_LIMIT };

  const data = await gql(token, BOT_QUERY, vars);
  const zone = data?.viewer?.zones?.[0];
  if (!zone) {
    console.error(
      "No zone returned. The token is probably not scoped to loudface.co " +
        "(needs Zone -> Analytics -> Read on that specific zone)."
    );
    process.exitCode = 1;
    return;
  }

  const groups = zone.httpRequestsAdaptiveGroups ?? [];
  // Cloudflare caps GROUPS, not requests, and never says it truncated — landing
  // on the ceiling means every number below is a FLOOR. Say so loudly.
  const truncated = groups.length >= GROUP_LIMIT;

  const bots = new Map(); // bot -> {operator, bot, total, ok, bad, uas:Set}
  const unknown = new Map(); // ua -> count
  for (const g of groups) {
    const ua = g.dimensions.userAgent || "";
    const status = Number(g.dimensions.edgeResponseStatus);
    const n = g.count;
    const hit = classify(ua);
    if (!hit) {
      unknown.set(ua, (unknown.get(ua) || 0) + n);
      continue;
    }
    const cur = bots.get(hit.bot) || { ...hit, total: 0, ok: 0, bad: 0, uas: new Set() };
    cur.total += n;
    // "Unsuccessful" mirrors the AI Crawl Control dashboard: 4xx/5xx.
    if (status >= 400) cur.bad += n;
    else cur.ok += n;
    cur.uas.add(ua);
    bots.set(hit.bot, cur);
  }

  const ranked = [...bots.values()].sort((a, b) => b.total - a.total);
  const totalAI = ranked.reduce((s, b) => s + b.total, 0);
  const totalAll = groups.reduce((s, g) => s + g.count, 0);

  let paths = null;
  if (args.paths && ranked.length) {
    const top5 = new Set(ranked.slice(0, 5).map((b) => b.bot));
    const pdata = await gql(token, PATH_QUERY, vars);
    const pgroups = pdata?.viewer?.zones?.[0]?.httpRequestsAdaptiveGroups ?? [];
    const byBot = new Map();
    for (const g of pgroups) {
      const hit = classify(g.dimensions.userAgent || "");
      if (!hit || !top5.has(hit.bot)) continue;
      const m = byBot.get(hit.bot) || new Map();
      const p = g.dimensions.clientRequestPath || "/";
      m.set(p, (m.get(p) || 0) + g.count);
      byBot.set(hit.bot, m);
    }
    paths = [...byBot.entries()].map(([bot, m]) => ({
      bot,
      top: [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([path, count]) => ({ path, count })),
    }));
  }

  const unknownTop = [...unknown.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([ua, count]) => ({ ua, count }));

  if (args.json) {
    console.log(
      JSON.stringify(
        {
          zone: "loudface.co",
          scope: args.allHosts ? "ALL hosts on the zone (includes non-site hosts)" : args.hosts,
          truncated,
          window: { since, until, hours, clamped },
          totals: { aiRequests: totalAI, allRequests: totalAll },
          bots: ranked.map(({ uas, ...b }) => ({ ...b, userAgents: [...uas] })),
          ...(paths ? { paths } : {}),
          ...(args.allBots ? { unclassified: unknownTop } : {}),
        },
        null,
        2
      )
    );
    return;
  }

  console.log(`# AI crawler traffic — loudface.co`);
  console.log(`\nWindow: last ${hours}h (${since} → ${until})`);
  console.log(
    args.allHosts
      ? `Scope:  ALL hosts on the zone — includes non-site hosts (e.g. api.peec.ai); these totals are NOT just loudface.co.`
      : `Scope:  ${args.hosts.join(", ")}`
  );
  if (truncated) {
    console.log(
      `\n⚠ TRUNCATED: Cloudflare returned the maximum ${GROUP_LIMIT.toLocaleString()} groups, so every` +
        ` number below is a FLOOR, not a total. Re-run with a shorter --hours to get complete counts.`
    );
  }
  if (clamped) console.log(`> --hours was clamped to 24 (Free-plan limit of 1 day per query).`);
  console.log(
    `\n**${totalAI.toLocaleString()}** AI-crawler requests of ${totalAll.toLocaleString()} total (${pct(
      totalAI,
      totalAll
    )}).`
  );

  if (!ranked.length) {
    console.log(`\n⚠ No known AI crawlers in this window. That is unusual — check robots.txt,`);
    console.log(`  recent Cloudflare config (ai_bots_protection / crawler_protection), and firewall rules.`);
  } else {
    console.log();
    console.log(
      table(
        ranked.map((b) => [
          b.bot,
          b.operator,
          b.total.toLocaleString(),
          b.ok.toLocaleString(),
          b.bad.toLocaleString(),
          pct(b.total, totalAI),
        ]),
        ["Bot", "Operator", "Requests", "Allowed", "Unsuccessful", "Share of AI"]
      )
    );
  }

  if (paths) {
    console.log(`\n## Top paths (top 5 bots)`);
    for (const p of paths) {
      console.log(`\n**${p.bot}**`);
      for (const { path, count } of p.top) console.log(`- ${count.toLocaleString()}  ${path}`);
    }
  }

  if (args.allBots) {
    console.log(`\n## Top unclassified user-agents`);
    console.log(`(an AI crawler here belongs in the AI_BOTS map — see the skill's "Extending the bot registry")`);
    console.log();
    console.log(
      table(
        unknownTop.map((u) => [u.count.toLocaleString(), (u.ua || "(empty)").slice(0, 110)]),
        ["Requests", "User-Agent"]
      )
    );
  }

  // Volume measures requests CLAIMING to be a bot. Verification needs
  // Cloudflare's botManagement dimension, which is paid-plan only.
  console.log(`\n_User-agents are self-reported; spoofing is not filtered (verification is a paid-plan field)._`);
}

main().catch((err) => {
  console.error(String(err.message || err));
  process.exitCode = 1;
});
