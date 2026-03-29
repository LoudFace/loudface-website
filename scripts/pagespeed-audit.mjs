#!/usr/bin/env node
/**
 * PageSpeed Audit Script
 *
 * Tests key pages using Google PageSpeed Insights API (production)
 * or Lighthouse CLI (local dev). Reports Core Web Vitals, performance
 * scores, and actionable diagnostics.
 *
 * Usage:
 *   node scripts/pagespeed-audit.mjs                          # test production (PSI API)
 *   node scripts/pagespeed-audit.mjs http://localhost:3005     # test dev (Lighthouse CLI)
 *   node scripts/pagespeed-audit.mjs --mobile                 # mobile strategy (default)
 *   node scripts/pagespeed-audit.mjs --desktop                # desktop strategy
 *   node scripts/pagespeed-audit.mjs --pages=/,/blog          # specific pages only
 *
 * Output:
 *   - Human-readable summary to stdout
 *   - Detailed JSON report to pagespeed-report.json
 *
 * Set PAGESPEED_API_KEY in .env.local for 25,000 queries/day (free).
 * Without a key, uses shared quota (may hit 429 errors).
 */

// ============================================================
// CONFIGURATION
// ============================================================

// Load .env.local (Node scripts don't get Next.js env loading)
import { readFileSync } from 'fs';
try {
  const envFile = readFileSync('.env.local', 'utf-8');
  for (const line of envFile.split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match && !process.env[match[1].trim()]) {
      process.env[match[1].trim()] = match[2].trim();
    }
  }
} catch {}

const args = process.argv.slice(2);
const baseUrlArg = args.find(a => !a.startsWith('--'));
const BASE_URL = (baseUrlArg || 'https://www.loudface.co').replace(/\/$/, '');
const IS_LOCAL = BASE_URL.includes('localhost') || BASE_URL.includes('127.0.0.1');
const STRATEGY = args.includes('--desktop') ? 'desktop' : 'mobile';

// Parse --pages flag
const pagesArg = args.find(a => a.startsWith('--pages='));
const CUSTOM_PAGES = pagesArg ? pagesArg.replace('--pages=', '').split(',') : null;

// Key pages to test — covers each page type
const DEFAULT_PAGES = [
  '/',                           // Homepage (heaviest — carousel, CMS data)
  '/case-studies',               // Gallery (paginated, many images)
  '/blog',                       // Blog index
  '/services/webflow',           // Service page (static + CMS)
  '/services/seo-aeo',           // Service page
  '/about',                      // About page
  '/seo-for/saas',               // SEO industry page
];

const PAGES = CUSTOM_PAGES || DEFAULT_PAGES;

// Thresholds (Google's "good" thresholds)
const THRESHOLDS = {
  performance: 90,
  accessibility: 90,
  'best-practices': 90,
  seo: 90,
  LCP: 2500,    // ms — Largest Contentful Paint
  FID: 100,     // ms — First Input Delay (lab: TBT proxy)
  CLS: 0.1,     // Cumulative Layout Shift
  FCP: 1800,    // ms — First Contentful Paint
  TBT: 200,     // ms — Total Blocking Time
  SI: 3400,     // ms — Speed Index
  TTI: 3800,    // ms — Time to Interactive
};

const PSI_API = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
const API_KEY = process.env.PAGESPEED_API_KEY || '';
const DELAY_MS = API_KEY ? 500 : 2000; // Faster with API key (higher quota)

// ============================================================
// COLORS (terminal output)
// ============================================================

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

function scoreColor(score, threshold) {
  if (score >= threshold) return c.green;
  if (score >= threshold * 0.75) return c.yellow;
  return c.red;
}

function metricColor(value, threshold) {
  if (value <= threshold) return c.green;
  if (value <= threshold * 1.5) return c.yellow;
  return c.red;
}

// ============================================================
// PSI API (production)
// ============================================================

async function fetchPSI(url, strategy) {
  const params = new URLSearchParams({
    url,
    strategy,
    category: ['performance', 'accessibility', 'best-practices', 'seo'].join('&category='),
  });

  // The API needs categories as repeated params
  const keyParam = API_KEY ? `&key=${API_KEY}` : '';
  const apiUrl = `${PSI_API}?url=${encodeURIComponent(url)}&strategy=${strategy}&category=performance&category=accessibility&category=best-practices&category=seo${keyParam}`;

  const response = await fetch(apiUrl, { signal: AbortSignal.timeout(120_000) });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`PSI API error ${response.status}: ${text.substring(0, 200)}`);
  }

  return response.json();
}

function extractPSIResults(data) {
  const lhr = data.lighthouseResult;
  const categories = lhr.categories;
  const audits = lhr.audits;

  // Category scores (0-100)
  const scores = {};
  for (const [key, cat] of Object.entries(categories)) {
    scores[key] = Math.round(cat.score * 100);
  }

  // Core Web Vitals from audits
  const metrics = {
    LCP: audits['largest-contentful-paint']?.numericValue,
    FCP: audits['first-contentful-paint']?.numericValue,
    TBT: audits['total-blocking-time']?.numericValue,
    CLS: audits['cumulative-layout-shift']?.numericValue,
    SI: audits['speed-index']?.numericValue,
    TTI: audits['interactive']?.numericValue,
  };

  // Field data (CrUX) if available
  const fieldData = data.loadingExperience?.metrics || null;
  const originFieldData = data.loadingExperience?.overall_category || null;

  // Top opportunities
  const opportunities = [];
  for (const audit of Object.values(audits)) {
    if (audit.details?.type === 'opportunity' && audit.score !== null && audit.score < 1) {
      opportunities.push({
        title: audit.title,
        description: audit.description?.substring(0, 120),
        savings: audit.details?.overallSavingsMs
          ? `${Math.round(audit.details.overallSavingsMs)}ms`
          : audit.details?.overallSavingsBytes
            ? `${Math.round(audit.details.overallSavingsBytes / 1024)}KB`
            : null,
        score: Math.round((audit.score || 0) * 100),
      });
    }
  }
  opportunities.sort((a, b) => (a.score || 0) - (b.score || 0));

  // Diagnostics (failing audits that aren't opportunities)
  const diagnostics = [];
  for (const audit of Object.values(audits)) {
    if (audit.details?.type === 'table' && audit.score !== null && audit.score < 0.9 &&
        !opportunities.find(o => o.title === audit.title)) {
      diagnostics.push({
        title: audit.title,
        score: Math.round((audit.score || 0) * 100),
      });
    }
  }

  return { scores, metrics, fieldData, originFieldData, opportunities: opportunities.slice(0, 5), diagnostics: diagnostics.slice(0, 5) };
}

// ============================================================
// LIGHTHOUSE CLI (local dev)
// ============================================================

async function runLighthouse(url, strategy) {
  const { execSync } = await import('child_process');

  const formFactor = strategy === 'desktop' ? 'desktop' : 'mobile';
  const cmd = [
    'npx', 'lighthouse', `"${url}"`,
    '--output=json',
    '--quiet',
    '--chrome-flags="--headless --no-sandbox"',
    `--form-factor=${formFactor}`,
    '--only-categories=performance,accessibility,best-practices,seo',
  ].join(' ');

  try {
    const output = execSync(cmd, {
      encoding: 'utf-8',
      timeout: 120_000,
      maxBuffer: 50 * 1024 * 1024,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const data = JSON.parse(output);

    const scores = {};
    for (const [key, cat] of Object.entries(data.categories)) {
      scores[key] = Math.round(cat.score * 100);
    }

    const audits = data.audits;
    const metrics = {
      LCP: audits['largest-contentful-paint']?.numericValue,
      FCP: audits['first-contentful-paint']?.numericValue,
      TBT: audits['total-blocking-time']?.numericValue,
      CLS: audits['cumulative-layout-shift']?.numericValue,
      SI: audits['speed-index']?.numericValue,
      TTI: audits['interactive']?.numericValue,
    };

    const opportunities = [];
    for (const audit of Object.values(audits)) {
      if (audit.details?.type === 'opportunity' && audit.score !== null && audit.score < 1) {
        opportunities.push({
          title: audit.title,
          savings: audit.details?.overallSavingsMs
            ? `${Math.round(audit.details.overallSavingsMs)}ms`
            : null,
          score: Math.round((audit.score || 0) * 100),
        });
      }
    }
    opportunities.sort((a, b) => (a.score || 0) - (b.score || 0));

    return { scores, metrics, fieldData: null, originFieldData: null, opportunities: opportunities.slice(0, 5), diagnostics: [] };
  } catch (err) {
    throw new Error(`Lighthouse failed: ${err.message?.substring(0, 200)}`);
  }
}

// ============================================================
// MAIN
// ============================================================

async function auditPage(pagePath) {
  const url = `${BASE_URL}${pagePath}`;
  const startTime = Date.now();

  try {
    const result = IS_LOCAL
      ? await runLighthouse(url, STRATEGY)
      : extractPSIResults(await fetchPSI(url, STRATEGY));

    return {
      url,
      path: pagePath,
      ...result,
      durationMs: Date.now() - startTime,
      error: null,
    };
  } catch (err) {
    return {
      url,
      path: pagePath,
      scores: {},
      metrics: {},
      fieldData: null,
      originFieldData: null,
      opportunities: [],
      diagnostics: [],
      durationMs: Date.now() - startTime,
      error: err.message,
    };
  }
}

function printResults(results) {
  console.log('');
  console.log(`${c.bold}${c.cyan}PageSpeed Audit Report${c.reset}`);
  console.log(`${c.dim}Strategy: ${STRATEGY} | Source: ${IS_LOCAL ? 'Lighthouse CLI' : 'PSI API'} | ${new Date().toISOString()}${c.reset}`);
  console.log('');

  // Summary table
  console.log(`${c.bold}  Page                          Perf  A11y  BP    SEO   LCP     CLS${c.reset}`);
  console.log(`${c.dim}  ${'─'.repeat(72)}${c.reset}`);

  for (const r of results) {
    if (r.error) {
      const path = r.path.padEnd(30);
      console.log(`  ${path} ${c.red}ERROR: ${r.error.substring(0, 40)}${c.reset}`);
      continue;
    }

    const path = r.path.padEnd(30);
    const perf = r.scores.performance?.toString().padStart(4) || '  --';
    const a11y = r.scores.accessibility?.toString().padStart(4) || '  --';
    const bp = r.scores['best-practices']?.toString().padStart(4) || '  --';
    const seo = r.scores.seo?.toString().padStart(4) || '  --';
    const lcp = r.metrics.LCP ? `${(r.metrics.LCP / 1000).toFixed(1)}s`.padStart(7) : '     --';
    const cls = r.metrics.CLS !== undefined ? r.metrics.CLS.toFixed(3).padStart(7) : '     --';

    const perfColor = scoreColor(r.scores.performance || 0, THRESHOLDS.performance);
    const a11yColor = scoreColor(r.scores.accessibility || 0, THRESHOLDS.accessibility);
    const bpColor = scoreColor(r.scores['best-practices'] || 0, THRESHOLDS['best-practices']);
    const seoColor = scoreColor(r.scores.seo || 0, THRESHOLDS.seo);
    const lcpColor = r.metrics.LCP ? metricColor(r.metrics.LCP, THRESHOLDS.LCP) : c.dim;
    const clsColor = r.metrics.CLS !== undefined ? metricColor(r.metrics.CLS, THRESHOLDS.CLS) : c.dim;

    console.log(`  ${path} ${perfColor}${perf}${c.reset}  ${a11yColor}${a11y}${c.reset}  ${bpColor}${bp}${c.reset}  ${seoColor}${seo}${c.reset}  ${lcpColor}${lcp}${c.reset}  ${clsColor}${cls}${c.reset}`);
  }

  // Opportunities
  const allOpps = new Map();
  for (const r of results) {
    for (const opp of r.opportunities || []) {
      const existing = allOpps.get(opp.title);
      if (!existing || (opp.score || 0) < (existing.score || 0)) {
        allOpps.set(opp.title, { ...opp, pages: [...(existing?.pages || []), r.path] });
      } else {
        existing.pages.push(r.path);
      }
    }
  }

  if (allOpps.size > 0) {
    console.log('');
    console.log(`${c.bold}  Top Opportunities${c.reset}`);
    console.log(`${c.dim}  ${'─'.repeat(72)}${c.reset}`);
    let i = 0;
    for (const [title, opp] of allOpps) {
      if (i++ >= 8) break;
      const savings = opp.savings ? ` (save ${opp.savings})` : '';
      const pages = opp.pages.length > 2 ? ` [${opp.pages.length} pages]` : ` [${opp.pages.join(', ')}]`;
      console.log(`  ${c.yellow}${title}${c.reset}${savings}${c.dim}${pages}${c.reset}`);
    }
  }

  // Field data summary (CrUX)
  const withField = results.find(r => r.originFieldData);
  if (withField) {
    console.log('');
    console.log(`${c.bold}  Real-World Performance (CrUX)${c.reset}`);
    console.log(`${c.dim}  ${'─'.repeat(72)}${c.reset}`);
    console.log(`  Origin rating: ${withField.originFieldData}`);
    if (withField.fieldData) {
      for (const [metric, data] of Object.entries(withField.fieldData)) {
        if (data.percentile) {
          console.log(`  ${metric}: p75 = ${data.percentile}${data.category ? ` (${data.category})` : ''}`);
        }
      }
    }
  }

  // Averages
  const scored = results.filter(r => r.scores.performance !== undefined);
  if (scored.length > 0) {
    const avgPerf = Math.round(scored.reduce((s, r) => s + r.scores.performance, 0) / scored.length);
    const avgLCP = scored.filter(r => r.metrics.LCP).reduce((s, r) => s + r.metrics.LCP, 0) / scored.filter(r => r.metrics.LCP).length;

    console.log('');
    const perfColor = scoreColor(avgPerf, THRESHOLDS.performance);
    const lcpColor = metricColor(avgLCP, THRESHOLDS.LCP);
    console.log(`${c.bold}  Averages${c.reset}  Performance: ${perfColor}${avgPerf}${c.reset}  LCP: ${lcpColor}${(avgLCP / 1000).toFixed(1)}s${c.reset}  (${scored.length} pages tested)`);
  }

  console.log('');
}

async function main() {
  console.log(`${c.bold}Testing ${PAGES.length} pages on ${BASE_URL} (${STRATEGY})...${c.reset}`);
  console.log(`${c.dim}Using ${IS_LOCAL ? 'Lighthouse CLI (local)' : `PageSpeed Insights API${API_KEY ? ' (with API key)' : ' (no API key — set PAGESPEED_API_KEY)'}`}${c.reset}`);
  console.log('');

  const results = [];

  for (let i = 0; i < PAGES.length; i++) {
    const page = PAGES[i];
    process.stdout.write(`  [${i + 1}/${PAGES.length}] ${page}...`);

    const result = await auditPage(page);
    results.push(result);

    if (result.error) {
      console.log(` ${c.red}ERROR${c.reset}`);
    } else {
      const perf = result.scores.performance;
      const color = scoreColor(perf || 0, THRESHOLDS.performance);
      console.log(` ${color}${perf}${c.reset} (${(result.durationMs / 1000).toFixed(1)}s)`);
    }

    // Polite delay between requests
    if (i < PAGES.length - 1) {
      await new Promise(r => setTimeout(r, IS_LOCAL ? 500 : DELAY_MS));
    }
  }

  printResults(results);

  // Write JSON report
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    strategy: STRATEGY,
    source: IS_LOCAL ? 'lighthouse-cli' : 'psi-api',
    thresholds: THRESHOLDS,
    results,
  };

  const { writeFileSync } = await import('fs');
  writeFileSync('pagespeed-report.json', JSON.stringify(report, null, 2));
  console.log(`${c.dim}Report saved to pagespeed-report.json${c.reset}`);
}

main().catch(err => {
  console.error(`${c.red}Fatal error: ${err.message}${c.reset}`);
  process.exit(1);
});
